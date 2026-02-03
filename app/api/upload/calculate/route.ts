import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import * as XLSX from "xlsx"
import { parseCSV } from "@/lib/csv-parser"
import {
  SIGNAL_DEFINITIONS,
  type DiscoveredSignal,
} from "@/lib/signal-discovery-service"
import { calculateSignal } from "@/lib/signal-calculation-service"
import type { SignalRequirement } from "@/lib/signal-discovery-service"
import { parseFormattedNumber } from "@/lib/csv-parser"

// Parse XLSX file to row format
function parseXLSX(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" })
  
  return jsonData.map(row => {
    const stringRow: Record<string, string> = {}
    for (const key of Object.keys(row)) {
      stringRow[key] = row[key]?.toString() || ""
    }
    return stringRow
  })
}

// Helper to find the actual column name in rows that matches a canonical field name
function findMatchingColumn(rows: Record<string, string>[], canonicalFieldName: string): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])
  
  // Direct match
  if (columns.includes(canonicalFieldName)) return canonicalFieldName
  
  // Normalize and compare
  const normalizedTarget = canonicalFieldName.toLowerCase().replace(/[_\s-]+/g, "")
  for (const col of columns) {
    const normalizedCol = col.toLowerCase().replace(/[_\s-]+/g, "")
    if (normalizedCol === normalizedTarget || normalizedCol.includes(normalizedTarget) || normalizedTarget.includes(normalizedCol)) {
      return col
    }
  }
  return null
}

// Helper to find any numeric column from rows
function findNumericColumn(rows: Record<string, string>[]): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])
  
  for (const col of columns) {
    const sampleValue = rows[0][col]
    if (parseFormattedNumber(sampleValue) !== null) {
      return col
    }
  }
  return null
}

function calculateAggregatedSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[]
): { value: number; dataPoints: number; trend: "increasing" | "decreasing" | "stable" } | null {
  // Find actual column names that match the canonical field names
  const actualColumns = matchedFields
    .map(f => findMatchingColumn(rows, f))
    .filter((c): c is string => c !== null)
  
  // Find the first numeric column from matched or any numeric column as fallback
  const numericField = actualColumns.find(col => parseFormattedNumber(rows[0]?.[col]) !== null) 
    || findNumericColumn(rows)

  // Count-based signals (tickets, leads, etc.)
  if (signal.signalId.includes("total") || signal.signalId.includes("volume") || 
      signal.signalId.includes("count") || signal.signalId.includes("number")) {
    // If we have a numeric field, sum it; otherwise count rows
    if (numericField) {
      const sum = rows.reduce((acc, r) => acc + (parseFormattedNumber(r[numericField]) || 0), 0)
      return { value: sum, dataPoints: rows.length, trend: "stable" }
    }
    return { value: rows.length, dataPoints: rows.length, trend: "stable" }
  }

  // Average-based signals (CSAT, NPS, resolution time, score, etc.)
  if (signal.signalId.includes("average") || signal.signalId.includes("csat") || 
      signal.signalId.includes("nps") || signal.signalId.includes("score") ||
      signal.signalId.includes("rating") || signal.signalId.includes("satisfaction")) {
    if (numericField) {
      const values = rows
        .map(r => parseFormattedNumber(r[numericField]))
        .filter((v): v is number => v !== null)
      
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return { value: Math.round(avg * 100) / 100, dataPoints: values.length, trend: "stable" }
      }
    }
  }

  // Rate-based signals (win rate, conversion rate, churn rate)
  if (signal.signalId.includes("rate")) {
    // Find actual status column in rows
    const allColumns = rows[0] ? Object.keys(rows[0]) : []
    const statusColumn = allColumns.find(col => {
      const colLower = col.toLowerCase()
      return colLower.includes("status") || colLower.includes("stage") ||
             colLower.includes("outcome") || colLower.includes("result")
    })
    
    if (statusColumn) {
      const total = rows.length
      const positive = rows.filter(r => {
        const status = r[statusColumn]?.toLowerCase() || ""
        return status.includes("won") || status.includes("converted") || 
               status.includes("closed") || status.includes("success") ||
               status.includes("complete") || status.includes("yes")
      }).length
      
      if (total > 0) {
        const rate = (positive / total) * 100
        return { value: Math.round(rate * 100) / 100, dataPoints: total, trend: "stable" }
      }
    }
    // If no status field, check for a percentage/rate field directly
    if (numericField) {
      const values = rows
        .map(r => parseFormattedNumber(r[numericField]))
        .filter((v): v is number => v !== null)
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return { value: Math.round(avg * 100) / 100, dataPoints: values.length, trend: "stable" }
      }
    }
  }

  // Pipeline/sum/revenue signals
  if (signal.signalId.includes("pipeline") || signal.signalId.includes("deal") ||
      signal.signalId.includes("revenue") || signal.signalId.includes("value") ||
      signal.signalId.includes("amount") || signal.signalId.includes("sum")) {
    // Find actual value column in rows
    const allColumns = rows[0] ? Object.keys(rows[0]) : []
    const valueColumn = allColumns.find(col => {
      const colLower = col.toLowerCase()
      return colLower.includes("amount") || colLower.includes("value") || 
             colLower.includes("revenue") || colLower.includes("price") ||
             colLower.includes("total")
    }) || numericField
    
    if (valueColumn) {
      const sum = rows.reduce((acc, r) => {
        const val = parseFormattedNumber(r[valueColumn])
        return acc + (val || 0)
      }, 0)
      return { value: sum, dataPoints: rows.length, trend: "stable" }
    }
  }

  // Time-based signals (days, hours, duration)
  if (signal.signalId.includes("time") || signal.signalId.includes("days") ||
      signal.signalId.includes("hours") || signal.signalId.includes("duration")) {
    if (numericField) {
      const values = rows
        .map(r => parseFormattedNumber(r[numericField]))
        .filter((v): v is number => v !== null)
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return { value: Math.round(avg * 100) / 100, dataPoints: values.length, trend: "stable" }
      }
    }
  }

  // Default: If we have a numeric field, use its sum or average based on signal type
  if (numericField) {
    const values = rows
      .map(r => parseFormattedNumber(r[numericField]))
      .filter((v): v is number => v !== null)
    
    if (values.length > 0) {
      // For signals that sound like they should be summed
      const shouldSum = signal.signalName.toLowerCase().includes("total") ||
                       signal.signalName.toLowerCase().includes("pipeline") ||
                       signal.signalName.toLowerCase().includes("revenue")
      
      if (shouldSum) {
        const sum = values.reduce((a, b) => a + b, 0)
        return { value: Math.round(sum * 100) / 100, dataPoints: values.length, trend: "stable" }
      } else {
        // Default to average for most metrics
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return { value: Math.round(avg * 100) / 100, dataPoints: values.length, trend: "stable" }
      }
    }
  }

  // Last resort: count rows (only for truly count-based signals)
  return { value: rows.length, dataPoints: rows.length, trend: "stable" }
}

function calculateDerivedSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[]
): { value: number; dataPoints: number; trend: "increasing" | "decreasing" | "stable" } | null {
  // ARR from MRR
  if (signal.signalId === "arr") {
    const mrrField = matchedFields.find(f => f.toLowerCase().includes("mrr"))
    if (mrrField) {
      const mrr = parseFormattedNumber(rows[0]?.[mrrField]) || 0
      return { value: mrr * 12, dataPoints: 1, trend: "stable" }
    }
  }

  // CAC calculation
  if (signal.signalId === "cac") {
    const spendFields = matchedFields.filter(f => 
      f.toLowerCase().includes("spend") || f.toLowerCase().includes("cost")
    )
    const customerField = matchedFields.find(f => f.toLowerCase().includes("customer"))
    
    if (spendFields.length > 0 && customerField) {
      let totalSpend = 0
      let totalCustomers = 0
      
      for (const row of rows) {
        for (const field of spendFields) {
          totalSpend += parseFormattedNumber(row[field]) || 0
        }
        totalCustomers += parseFormattedNumber(row[customerField]) || 0
      }
      
      if (totalCustomers > 0) {
        return { value: totalSpend / totalCustomers, dataPoints: rows.length, trend: "stable" }
      }
    }
  }

  return null
}

function calculateTimeSeriesSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[]
): { value: number; dataPoints: number; trend: "increasing" | "decreasing" | "stable" } | null {
  const dateField = matchedFields.find(f => 
    f.toLowerCase().includes("date") || f.toLowerCase().includes("time")
  )
  const valueField = matchedFields.find(f => 
    f.toLowerCase().includes("revenue") || f.toLowerCase().includes("value") || f.toLowerCase().includes("amount")
  )

  if (!dateField || !valueField) return null

  // Sort by date and calculate growth
  const sortedRows = [...rows].sort((a, b) => 
    new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
  )

  const values = sortedRows
    .map(r => parseFormattedNumber(r[valueField]))
    .filter((v): v is number => v !== null)

  if (values.length < 2) return null

  const latest = values[values.length - 1]
  const previous = values[values.length - 2]
  const growthRate = previous !== 0 ? ((latest - previous) / previous) * 100 : 0

  return { 
    value: Math.round(growthRate * 100) / 100, 
    dataPoints: values.length,
    trend: growthRate > 0 ? "increasing" : growthRate < 0 ? "decreasing" : "stable"
  }
}

function calculateDirectSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[]
): { value: number; dataPoints: number; trend: "increasing" | "decreasing" | "stable" } | null {
  // Find the most likely value column from matched fields
  const valueField = matchedFields.find(f => {
    const val = parseFormattedNumber(rows[0]?.[f])
    return val !== null
  })

  if (valueField) {
    // Get all numeric values from this field
    const values = rows
      .map(r => parseFormattedNumber(r[valueField]))
      .filter((v): v is number => v !== null)
    
    if (values.length === 0) return null
    
    // Determine trend from multiple values
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (values.length >= 2) {
      const latest = values[values.length - 1]
      const earlier = values[0]
      if (latest > earlier * 1.05) trend = "increasing"
      else if (latest < earlier * 0.95) trend = "decreasing"
    }
    
    // For direct signals, typically want the latest or sum depending on context
    // Use latest value if it looks like a snapshot metric, sum if it looks cumulative
    const signalLower = signal.signalName.toLowerCase()
    const isCumulative = signalLower.includes("total") || signalLower.includes("sum") || 
                        signalLower.includes("pipeline") || signalLower.includes("revenue")
    
    if (isCumulative) {
      const sum = values.reduce((a, b) => a + b, 0)
      return { value: Math.round(sum * 100) / 100, dataPoints: values.length, trend }
    } else {
      // Return the most recent/last value
      const latestValue = values[values.length - 1]
      return { value: Math.round(latestValue * 100) / 100, dataPoints: values.length, trend }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
  
    const {
        data: { user },
      } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization_id from user_context
    const userContextResult = await sql`
      SELECT organization_id FROM user_context WHERE user_id = ${user.id} LIMIT 1
    `
    const organizationId = userContextResult?.[0]?.organization_id || null

    const formData = await request.formData()
    const file = formData.get("file") as File
    const selectedSignalsJson = formData.get("selectedSignals") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const selectedSignals: DiscoveredSignal[] = JSON.parse(selectedSignalsJson || "[]")

    if (selectedSignals.length === 0) {
      return NextResponse.json({ error: "No signals selected" }, { status: 400 })
    }

    // Parse file
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
    
    let rows: Record<string, string>[]
    
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      rows = parseXLSX(buffer)
    } else {
      const text = await file.text()
      const result = parseCSV(text)
      rows = result.rows
    }

    // Calculate and save each selected signal
    const createdSignals: any[] = []
    const errors: string[] = []

    for (const discovered of selectedSignals) {
      const signalDef = SIGNAL_DEFINITIONS.find(s => s.signalId === discovered.signal.signalId)
      if (!signalDef) continue

      // Use the new calculation service
      const calculated = calculateSignal(signalDef, rows, discovered.matchedFields)
      
      if (!calculated) {
        errors.push(`Could not calculate ${signalDef.signalName}`)
        continue
      }

      // Upsert signal using Neon - update if same name+org exists, insert otherwise
      try {
        const trendValue = calculated.trendPercentage !== null 
          ? `${calculated.trendPercentage > 0 ? '+' : ''}${calculated.trendPercentage}%`
          : `${calculated.dataPoints} data points`
        
        // Build summary with calculation metadata
        const summaryText = `${calculated.calculationMethod}: ${calculated.formula}. Based on ${calculated.dataPoints} data points${calculated.usedColumn ? ` from "${calculated.usedColumn}" column` : ''}.`
        
        // Use upsert to prevent duplicates - update existing signal if same name+org
        const result = await sql`
          INSERT INTO signals (name, category, organization_id, absolute_value, trend, trend_value, source_type, summary, created_at, updated_at)
          VALUES (
            ${signalDef.signalName}, 
            ${signalDef.category}, 
            ${organizationId}, 
            ${calculated.formattedValue}, 
            ${calculated.trend}, 
            ${trendValue}, 
            'upload', 
            ${summaryText},
            NOW(),
            NOW()
          )
          ON CONFLICT (name, organization_id) 
          DO UPDATE SET 
            absolute_value = EXCLUDED.absolute_value,
            trend = EXCLUDED.trend,
            trend_value = EXCLUDED.trend_value,
            summary = EXCLUDED.summary,
            updated_at = NOW()
          RETURNING id, name, category, absolute_value, trend
        `
        
        if (result && result.length > 0) {
          createdSignals.push(result[0])
        }
      } catch (insertError) {
        errors.push(`Failed to save ${signalDef.signalName}: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      createdSignalIds: createdSignals.map(s => s.id),
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error("[v0] Calculate API error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to calculate signals" 
    }, { status: 500 })
  }
}
