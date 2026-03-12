import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import * as XLSX from "xlsx"
import { parseCSV } from "@/lib/csv-parser"
import {
  SIGNAL_DEFINITIONS,
  type DiscoveredSignal,
} from "@/lib/signal-discovery-service"
import { calculateSignal, findDateColumn, findValueColumn } from "@/lib/signal-calculation-service"
import type { SignalRequirement } from "@/lib/signal-discovery-service"
import { parseFormattedNumber } from "@/lib/csv-parser"

// ============================================
// TIME-SERIES EXTRACTION
// Extracts date-keyed data points from uploaded rows
// for AI analysis services (trend, correlation, interpretation)
// ============================================

interface ExtractedDataPoint {
  date: Date
  value: number
  metadata: Record<string, any>
}

/**
 * Extract time-series data points from uploaded rows for a given signal.
 * Groups rows by date period (day/week/month) and aggregates per the signal's calc type.
 */
function extractTimeSeriesFromRows(
  rows: Record<string, string>[],
  signalDef: SignalRequirement,
  matchedFields: string[],
  calculated: { value: number; calculationType: string },
  tabs?: Map<string, Record<string, string>[]>
): ExtractedDataPoint[] {
  const dateCol = findDateColumn(rows)
  
  if (!dateCol) {
    // No date column - store a single data point with today's date
    return [{
      date: new Date(),
      value: calculated.value,
      metadata: { source: "upload_aggregate", matchedFields }
    }]
  }

  // Find the value column for this signal
  const valueCol = matchedFields.find(f => {
    const lower = f.toLowerCase()
    return lower.includes("amount") || lower.includes("value") || lower.includes("revenue") ||
      lower.includes("price") || lower.includes("score") || lower.includes("rating") ||
      lower.includes("total") || lower.includes("count") || lower.includes("days") ||
      lower.includes("hours") || lower.includes("time") || lower.includes("nps") ||
      lower.includes("csat") || lower.includes("mrr") || lower.includes("arr")
  }) || findValueColumn(rows)

  // Parse all rows with dates
  const datedRows: { date: Date; value: number; row: Record<string, string> }[] = []
  
  for (const row of rows) {
    const dateStr = row[dateCol]
    if (!dateStr || dateStr.trim() === "") continue
    const date = new Date(dateStr)
    if (isNaN(date.getTime()) || date.getFullYear() < 1990) continue

    if (calculated.calculationType === "count" || calculated.calculationType === "rate") {
      datedRows.push({ date, value: 1, row })
    } else if (valueCol && row[valueCol]) {
      const val = parseFormattedNumber(row[valueCol])
      if (val !== null) {
        datedRows.push({ date, value: val, row })
      }
    } else {
      datedRows.push({ date, value: 1, row })
    }
  }

  if (datedRows.length === 0) {
    return [{
      date: new Date(),
      value: calculated.value,
      metadata: { source: "upload_aggregate", matchedFields }
    }]
  }

  // Sort by date
  datedRows.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Determine grouping period based on date range
  const oldest = datedRows[0].date
  const newest = datedRows[datedRows.length - 1].date
  const rangeDays = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24)
  
  let periodKey: (d: Date) => string
  if (rangeDays <= 31) {
    // Daily grouping
    periodKey = (d) => d.toISOString().split("T")[0]
  } else if (rangeDays <= 180) {
    // Weekly grouping (ISO week start)
    periodKey = (d) => {
      const start = new Date(d)
      start.setDate(start.getDate() - start.getDay())
      return start.toISOString().split("T")[0]
    }
  } else {
    // Monthly grouping
    periodKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
  }

  // Group by period
  const groups = new Map<string, { values: number[]; count: number; date: Date }>()
  for (const { date, value } of datedRows) {
    const key = periodKey(date)
    const existing = groups.get(key)
    if (existing) {
      existing.values.push(value)
      existing.count++
    } else {
      groups.set(key, { values: [value], count: 1, date: new Date(key) })
    }
  }

  // Aggregate each period based on calculation type
  const dataPoints: ExtractedDataPoint[] = []
  for (const [key, group] of groups) {
    let periodValue: number
    
    switch (calculated.calculationType) {
      case "count":
        periodValue = group.count
        break
      case "sum":
        periodValue = group.values.reduce((a, b) => a + b, 0)
        break
      case "average":
      case "median":
        periodValue = group.values.reduce((a, b) => a + b, 0) / group.values.length
        break
      case "rate": {
        // For rates, we need the ratio - use value as-is since count rows were marked as 1
        periodValue = group.values.reduce((a, b) => a + b, 0) / group.count * 100
        break
      }
      case "latest":
        periodValue = group.values[group.values.length - 1]
        break
      default:
        periodValue = group.values.reduce((a, b) => a + b, 0) / group.values.length
    }

    dataPoints.push({
      date: group.date,
      value: Math.round(periodValue * 100) / 100,
      metadata: { 
        source: "upload",
        period: key,
        rowCount: group.count,
        calcType: calculated.calculationType,
      }
    })
  }

  return dataPoints
}

// Parse a single XLSX sheet to row format
function parseXLSXSheet(workbook: XLSX.WorkBook, sheetName: string): Record<string, string>[] {
  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) return []
  
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" })
  
  return jsonData.map(row => {
    const stringRow: Record<string, string> = {}
    for (const key of Object.keys(row)) {
      stringRow[key] = row[key]?.toString() || ""
    }
    return stringRow
  })
}

// Parse ALL XLSX tabs into a map of { tabName: rows[] }
function parseXLSXAllTabs(buffer: ArrayBuffer): { tabs: Map<string, Record<string, string>[]>; allRows: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: "array" })
  const tabs = new Map<string, Record<string, string>[]>()
  const allRows: Record<string, string>[] = []
  
  for (const sheetName of workbook.SheetNames) {
    const rows = parseXLSXSheet(workbook, sheetName)
    if (rows.length > 0) {
      // Add a __tab__ column so we know which tab each row came from
      const taggedRows = rows.map(row => ({ ...row, __tab__: sheetName }))
      tabs.set(sheetName, taggedRows)
      allRows.push(...taggedRows)
    }
  }
  
  return { tabs, allRows }
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

function parseXLSX(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" })
  const allRows: Record<string, string>[] = []
  
  for (const sheetName of workbook.SheetNames) {
    const rows = parseXLSXSheet(workbook, sheetName)
    if (rows.length > 0) {
      allRows.push(...rows)
    }
  }
  
  return allRows
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
    const adminDb = createAdminClient()
    const { data: userContextRow } = await adminDb
      .from("user_context")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle()
    const organizationId = userContextRow?.organization_id || null

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

    // Parse file - handle multi-tab XLSX
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
    
    let rows: Record<string, string>[]
    let tabs: Map<string, Record<string, string>[]> | undefined
    
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      const parsed = parseXLSXAllTabs(buffer)
      rows = parsed.allRows
      tabs = parsed.tabs
      console.log(`[v0] Parsed XLSX: ${tabs.size} tabs, ${rows.length} total rows. Tabs: ${Array.from(tabs.keys()).join(", ")}`)
    } else {
      const text = await file.text()
      const result = parseCSV(text)
      rows = result.rows as Record<string, string>[]
    }

    // Record this upload in staged_uploads for data history tracking
    let uploadId: string | null = null
    try {
      const columns = rows[0] ? Object.keys(rows[0]) : []
      const { data: uploadRow } = await adminDb
        .from("staged_uploads")
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          file_name: file.name,
          file_type: isExcel ? 'xlsx' : 'csv',
          source_type: 'manual_upload',
          row_count: rows.length,
          column_count: columns.length,
          status: 'processed',
        })
        .select("id")
        .single()
      uploadId = uploadRow?.id || null
    } catch (uploadErr) {
      console.error("[v0] Failed to record upload:", uploadErr)
      // Non-fatal - continue with signal creation
    }

    // Calculate and save each selected signal
    const createdSignals: any[] = []
    const errors: string[] = []

    for (const discovered of selectedSignals) {
      const signalDef = SIGNAL_DEFINITIONS.find(s => s.signalId === discovered.signal.signalId)
      if (!signalDef) continue

      // Use the v2 calculation service with tab-aware processing
      const calculated = calculateSignal(signalDef, rows, discovered.matchedFields, tabs)
      
      if (!calculated) {
        errors.push(`Could not calculate ${signalDef.signalName}`)
        continue
      }

      // Upsert signal - update if same name+org exists, insert otherwise
      try {
        const trendValue = calculated.trendPercentage !== null 
          ? `${calculated.trendPercentage > 0 ? '+' : ''}${calculated.trendPercentage}%`
          : `${calculated.dataPoints} data points`
        // DB constraint signals_trend_check allows only ('increasing', 'decreasing', 'stable')
        const dbTrend = calculated.trend === 'up' ? 'increasing' : calculated.trend === 'down' ? 'decreasing' : 'stable'
        
        // Build summary with calculation metadata (including tab info)
        const tabInfo = calculated.metadata.tabName ? ` from "${calculated.metadata.tabName}" tab` : ''
        const filterInfo = calculated.metadata.filteredRowCount !== null && calculated.metadata.totalRowCount !== null && calculated.metadata.filteredRowCount < calculated.metadata.totalRowCount
          ? ` (filtered ${calculated.metadata.filteredRowCount} of ${calculated.metadata.totalRowCount} rows)`
          : ''
        const summaryText = `${calculated.calculationMethod}: ${calculated.formula}${tabInfo}${filterInfo}. Based on ${calculated.dataPoints} data points${calculated.usedColumn ? ` from "${calculated.usedColumn}" column` : ''}.`
        
        // Use upsert to prevent duplicates - update existing signal if same name+org
        // First check if a signal with same name+org exists
        const { data: existingSignal } = await adminDb
          .from("signals")
          .select("id, name, category, absolute_value, trend")
          .eq("name", signalDef.signalName)
          .eq("organization_id", organizationId)
          .maybeSingle()

        let signalRecord: { id: string; name: string; category: string; absolute_value: string; trend: string } | null = null

        if (existingSignal) {
          const { data: updated } = await adminDb
            .from("signals")
            .update({
              absolute_value: calculated.formattedValue,
              trend: dbTrend,
              trend_value: trendValue,
              summary: summaryText,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSignal.id)
            .select("id, name, category, absolute_value, trend")
            .single()
          signalRecord = updated
        } else {
          const { data: inserted } = await adminDb
            .from("signals")
            .insert({
              name: signalDef.signalName,
              category: signalDef.category,
              organization_id: organizationId,
              absolute_value: calculated.formattedValue,
              trend: dbTrend,
              trend_value: trendValue,
              source_type: 'upload',
              summary: summaryText,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select("id, name, category, absolute_value, trend")
            .single()
          signalRecord = inserted
        }

        if (signalRecord) {
          createdSignals.push(signalRecord)

          // ---- WRITE TIME-SERIES DATA POINTS ----
          // This is what powers AI analysis (trends, correlations, interpretations)
          try {
            const timeSeries = extractTimeSeriesFromRows(
              rows, signalDef, discovered.matchedFields,
              { value: calculated.value, calculationType: calculated.calculationType },
              tabs
            )

            if (timeSeries.length > 0) {
              // Upsert each data point (unique on signal_id + date)
              for (const dp of timeSeries) {
                await adminDb
                  .from("signal_data_points")
                  .upsert(
                    {
                      signal_id: signalRecord.id,
                      date: dp.date.toISOString(),
                      value: dp.value,
                      metadata: dp.metadata,
                    },
                    { onConflict: "signal_id,date" }
                  )
              }
            }
          } catch (dpErr) {
            console.error("[v0] Failed to write data points for", signalDef.signalName, dpErr)
            // Non-fatal - signal still created, just missing time-series
          }

          // Record signal opportunity linked to this upload
          if (uploadId) {
            try {
              // Check if signal opportunity already exists for this org
              let existingOpp = null
              if (organizationId) {
                const { data } = await adminDb
                  .from("signal_opportunities")
                  .select("id")
                  .eq("signal_name", signalDef.signalName)
                  .eq("organization_id", organizationId)
                  .maybeSingle()
                existingOpp = data
              } else {
                const { data } = await adminDb
                  .from("signal_opportunities")
                  .select("id")
                  .eq("signal_name", signalDef.signalName)
                  .eq("user_id", user.id)
                  .maybeSingle()
                existingOpp = data
              }

              if (existingOpp) {
                await adminDb
                  .from("signal_opportunities")
                  .update({
                    status: 'active',
                    is_calculable: true,
                    confidence_score: discovered.matchScore || 0.8,
                    available_fields: discovered.matchedFields,
                    missing_fields: discovered.missingFields || [],
                    source_uploads: [{ upload_id: uploadId, file_name: file.name }],
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingOpp.id)
              } else {
                await adminDb
                  .from("signal_opportunities")
                  .insert({
                    user_id: user.id,
                    organization_id: organizationId,
                    signal_name: signalDef.signalName,
                    signal_category: signalDef.category,
                    status: 'active',
                    discovery_type: 'new',
                    is_calculable: true,
                    confidence_score: discovered.matchScore || 0.8,
                    required_fields: signalDef.requiredFields,
                    available_fields: discovered.matchedFields,
                    missing_fields: discovered.missingFields || [],
                    source_uploads: [{ upload_id: uploadId, file_name: file.name }],
                  })
              }
            } catch (oppErr) {
              // Non-fatal
            }
          }
        }
      } catch (insertError) {
        errors.push(`Failed to save ${signalDef.signalName}: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`)
      }
    }

    // ---- PERSIST FIELD METADATA ----
    // Store column definitions and stats for each upload so the system knows
    // what data fields are available across all uploads for this org
    if (uploadId) {
      try {
        const columns = rows[0] ? Object.keys(rows[0]) : []
        
        for (const colName of columns) {
          // Determine field type from sample values
          const samples = rows.slice(0, 20).map(r => r[colName]).filter(Boolean)
          const numericCount = samples.filter(s => parseFormattedNumber(s) !== null).length
          const dateCount = samples.filter(s => {
            const d = new Date(s)
            return !isNaN(d.getTime()) && d.getFullYear() > 1990
          }).length
          
          let fieldType = "text"
          if (numericCount > samples.length * 0.7) fieldType = "numeric"
          else if (dateCount > samples.length * 0.7) fieldType = "date"

          // Compute basic stats
          const stats: Record<string, any> = {
            sampleSize: samples.length,
            uniqueValues: new Set(samples).size,
            nullCount: rows.filter(r => !r[colName] || r[colName].trim() === "").length,
          }

          if (fieldType === "numeric") {
            const vals = samples.map(s => parseFormattedNumber(s)).filter((v): v is number => v !== null)
            if (vals.length > 0) {
              stats.min = Math.min(...vals)
              stats.max = Math.max(...vals)
              stats.avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
            }
          }

          const normalizedName = colName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")

          // staged_fields: column metadata per upload
          await adminDb
            .from("staged_fields")
            .upsert(
              {
                upload_id: uploadId,
                original_column_name: colName,
                normalized_field_name: normalizedName,
                field_type: fieldType,
                sample_values: samples.slice(0, 5),
                stats: stats,
              },
              { ignoreDuplicates: true }
            )

          // field_availability: cross-upload field index for the org
          const { data: existingField } = await adminDb
            .from("field_availability")
            .select("id, upload_ids, total_data_points")
            .eq("normalized_field_name", normalizedName)
            .eq("organization_id", organizationId)
            .maybeSingle()

          if (existingField) {
            const currentUploads = existingField.upload_ids || []
            const newUploads = Array.isArray(currentUploads) ? [...currentUploads, uploadId] : [uploadId]
            const totalPoints = (existingField.total_data_points || 0) + rows.length

            await adminDb
              .from("field_availability")
              .update({
                upload_ids: newUploads,
                total_data_points: totalPoints,
                latest_upload_at: new Date().toISOString(),
              })
              .eq("id", existingField.id)
          } else {
            await adminDb
              .from("field_availability")
              .insert({
                user_id: user.id,
                organization_id: organizationId,
                normalized_field_name: normalizedName,
                field_type: fieldType,
                upload_ids: [uploadId],
                total_data_points: rows.length,
                latest_upload_at: new Date().toISOString(),
              })
          }
        }
      } catch (fieldErr) {
        console.error("[v0] Failed to persist field metadata:", fieldErr)
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      signalDataPointsWritten: createdSignals.length > 0,
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
