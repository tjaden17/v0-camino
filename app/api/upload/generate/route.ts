import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// ============================================
// Types matching the client payload
// ============================================

interface TabPayload {
  tabKey: string
  tabName: string
  fileName: string
  rowCount: number
  columns: string[]
  columnTypes: Record<string, "text" | "number" | "date" | "id">
  answers: {
    rowType: string | null
    metricColumn: string | null
    dateColumn: string | null
  }
  rows: Record<string, string>[]
}

interface SignalPayload {
  name: string
  description: string
  operation: string
  valueColumn: string | null
  dateColumn: string | null
  groupByColumn: string | null
  tabKey: string
  tabName: string
}

// ============================================
// Helpers
// ============================================

function parseNumber(val: string | undefined | null): number | null {
  if (!val || val.trim() === "") return null
  // Remove currency codes (AUD, USD, EUR, etc.) and symbols
  const cleaned = val
    .replace(/^[A-Z]{3}\s*/i, "") // Remove 3-letter currency codes at start
    .replace(/[$€£¥,\s%]/g, "")    // Remove currency symbols, commas, spaces, percent
    .replace(/^\((.+)\)$/, "-$1")  // Handle negative numbers in parentheses
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

function parseDate(val: string | undefined | null): Date | null {
  if (!val || val.trim() === "") return null
  const d = new Date(val.trim())
  if (!isNaN(d.getTime()) && d.getFullYear() > 1990) return d
  return null
}

function formatValue(value: number, operation: string): string {
  if (operation === "rate") {
    return `${Math.round(value * 10) / 10}%`
  }
  if (operation === "average" || operation === "sum") {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${Math.round(value).toLocaleString()}`
  }
  if (operation === "monthly_rate") {
    return `${Math.round(value * 10) / 10}/mo`
  }
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${Math.round(value * 100) / 100}`
}

function determineTrend(dataPoints: { date: Date; value: number }[]): { trend: string; percentage: number | null } {
  if (dataPoints.length < 4) return { trend: "stable", percentage: null }

  // Split into two halves and compare averages
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime())
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)

  const avgFirst = firstHalf.reduce((s, d) => s + d.value, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, d) => s + d.value, 0) / secondHalf.length

  if (avgFirst === 0) return { trend: "stable", percentage: null }

  const change = ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100
  const rounded = Math.round(change * 10) / 10

  if (Math.abs(rounded) < 5) return { trend: "stable", percentage: rounded }
  return {
    trend: rounded > 0 ? "increasing" : "decreasing",
    percentage: rounded,
  }
}

/**
 * Calculate a single signal from the raw tab rows + user answers.
 * Returns { value, formattedValue, trend, trendPercentage, dataPoints, formula }
 */
function calculateSignal(
  signal: SignalPayload,
  tab: TabPayload
): {
  value: number
  formattedValue: string
  trend: string
  trendPercentage: number | null
  dataPointCount: number
  formula: string
  timeSeries: { date: Date; value: number }[]
  category: string
} | null {
  const rows = tab.rows
  if (rows.length === 0) return null

  const { operation, valueColumn, dateColumn, groupByColumn } = signal

  let value = 0
  let formula = ""
  const timeSeries: { date: Date; value: number }[] = []

  // Map row type to signal category
  const categoryMap: Record<string, string> = {
    deals: "Sales",
    leads: "Sales",
    tickets: "Support",
    customers: "Customer Success",
    events: "Product",
    agents: "People",
    other: "General",
  }
  const category = categoryMap[tab.answers.rowType || "other"] || "General"

  switch (operation) {
    case "count": {
      value = rows.length
      formula = `COUNT(rows in "${tab.tabName}")`

      // Build time-series: count per month
      if (dateColumn) {
        const monthly: Record<string, number> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          if (d) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            monthly[key] = (monthly[key] || 0) + 1
          }
        }
        for (const [dateStr, count] of Object.entries(monthly)) {
          timeSeries.push({ date: new Date(dateStr), value: count })
        }
      }
      break
    }

    case "monthly_rate": {
      if (!dateColumn) return null
      const dates: Date[] = []
      for (const row of rows) {
        const d = parseDate(row[dateColumn])
        if (d) dates.push(d)
      }
      if (dates.length < 2) return null
      dates.sort((a, b) => a.getTime() - b.getTime())
      const months = Math.max(1,
        (dates[dates.length - 1].getFullYear() - dates[0].getFullYear()) * 12 +
        (dates[dates.length - 1].getMonth() - dates[0].getMonth()) + 1
      )
      value = Math.round((rows.length / months) * 10) / 10
      formula = `${rows.length} rows / ${months} months`

      // Time-series: count per month
      const monthly: Record<string, number> = {}
      for (const d of dates) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        monthly[key] = (monthly[key] || 0) + 1
      }
      for (const [dateStr, count] of Object.entries(monthly)) {
        timeSeries.push({ date: new Date(dateStr), value: count })
      }
      break
    }

    case "sum": {
      if (!valueColumn) return null
      const values: number[] = []
      for (const row of rows) {
        const v = parseNumber(row[valueColumn])
        if (v !== null) values.push(v)
      }
      if (values.length === 0) return null
      value = values.reduce((a, b) => a + b, 0)
      formula = `SUM("${valueColumn}") from ${values.length} rows`

      // Time-series: sum per month
      if (dateColumn) {
        const monthly: Record<string, number> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          const v = parseNumber(row[valueColumn])
          if (d && v !== null) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            monthly[key] = (monthly[key] || 0) + v
          }
        }
        for (const [dateStr, val] of Object.entries(monthly)) {
          timeSeries.push({ date: new Date(dateStr), value: val })
        }
      }
      break
    }

    case "average": {
      if (!valueColumn) return null
      const values: number[] = []
      for (const row of rows) {
        const v = parseNumber(row[valueColumn])
        if (v !== null) values.push(v)
      }
      if (values.length === 0) return null
      value = values.reduce((a, b) => a + b, 0) / values.length
      formula = `AVG("${valueColumn}") from ${values.length} rows`

      // Time-series: average per month
      if (dateColumn) {
        const monthly: Record<string, { sum: number; count: number }> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          const v = parseNumber(row[valueColumn])
          if (d && v !== null) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            if (!monthly[key]) monthly[key] = { sum: 0, count: 0 }
            monthly[key].sum += v
            monthly[key].count++
          }
        }
        for (const [dateStr, { sum, count }] of Object.entries(monthly)) {
          timeSeries.push({ date: new Date(dateStr), value: Math.round((sum / count) * 100) / 100 })
        }
      }
      break
    }

    case "group_by": {
      if (!groupByColumn) return null
      const groups: Record<string, number> = {}
      for (const row of rows) {
        const key = (row[groupByColumn] || "").trim()
        if (key) groups[key] = (groups[key] || 0) + 1
      }
      const entries = Object.entries(groups).sort((a, b) => b[1] - a[1])
      value = entries.length // Number of distinct groups
      const top3 = entries.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ")
      formula = `GROUP_BY("${groupByColumn}") -> ${entries.length} groups. Top: ${top3}`

      // Time-series: total count per month (for trend)
      if (dateColumn) {
        const monthly: Record<string, number> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          if (d) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            monthly[key] = (monthly[key] || 0) + 1
          }
        }
        for (const [dateStr, count] of Object.entries(monthly)) {
          timeSeries.push({ date: new Date(dateStr), value: count })
        }
      }
      break
    }

    case "rate": {
      // Win Rate calculation: count deals with positive outcomes vs total closed deals
      // Requires a "stage" column with values like "won", "lost", "closed won", "closed lost"
      const stageColumn = tab.columns.find(c => 
        c.toLowerCase() === "stage" || 
        c.toLowerCase() === "status" || 
        c.toLowerCase() === "deal_stage" ||
        c.toLowerCase() === "opportunity_stage"
      )
      
      if (!stageColumn) {
        console.log("[v0] Rate operation: no stage column found")
        return null
      }

      // Define what counts as "closed" and "won"
      const closedStatuses = ["won", "lost", "closed won", "closed lost", "closed-won", "closed-lost"]
      const wonStatuses = ["won", "closed won", "closed-won", "success"]
      
      let totalClosed = 0
      let totalWon = 0
      
      // Count closed deals and won deals
      for (const row of rows) {
        const stageValue = (row[stageColumn] || "").toLowerCase().trim()
        if (closedStatuses.some(status => stageValue.includes(status))) {
          totalClosed++
          if (wonStatuses.some(status => stageValue.includes(status))) {
            totalWon++
          }
        }
      }
      
      console.log("[v0] Win Rate calculation:", { totalClosed, totalWon, stageColumn, sampleStages: rows.slice(0, 5).map(r => r[stageColumn]) })
      
      if (totalClosed === 0) {
        console.log("[v0] No closed deals found")
        return null
      }
      
      value = (totalWon / totalClosed) * 100
      formula = `${totalWon} won / ${totalClosed} closed = ${Math.round(value)}%`
      
      // Time-series: win rate per month
      if (dateColumn) {
        const monthly: Record<string, { closed: number; won: number }> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          const stageValue = (row[stageColumn] || "").toLowerCase().trim()
          const isClosed = closedStatuses.some(status => stageValue.includes(status))
          const isWon = wonStatuses.some(status => stageValue.includes(status))
          
          if (d && isClosed) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            if (!monthly[key]) monthly[key] = { closed: 0, won: 0 }
            monthly[key].closed++
            if (isWon) monthly[key].won++
          }
        }
        
        for (const [dateStr, { closed, won }] of Object.entries(monthly)) {
          if (closed > 0) {
            const rate = (won / closed) * 100
            timeSeries.push({ date: new Date(dateStr), value: Math.round(rate * 10) / 10 })
          }
        }
      }
      break
    }

    default:
      return null
  }

  const trendResult = determineTrend(timeSeries)

  return {
    value: Math.round(value * 100) / 100,
    formattedValue: formatValue(value, operation),
    trend: trendResult.trend,
    trendPercentage: trendResult.percentage,
    dataPointCount: timeSeries.length || rows.length,
    formula,
    timeSeries: timeSeries.sort((a, b) => a.date.getTime() - b.date.getTime()),
    category,
  }
}

// ============================================
// POST Handler
// ============================================

export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get organization from profiles (same source as signals page)
    const adminDb = createAdminClient()
    const { data: profileRow } = await adminDb
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle()
    const organizationId = profileRow?.organization_id || null

    // Parse body
    const body = await request.json()
    const { tabs, signals } = body as { tabs: TabPayload[]; signals: SignalPayload[] }

    if (!tabs || !signals || signals.length === 0) {
      return NextResponse.json({ error: "No signals to generate" }, { status: 400 })
    }

    // Build tab lookup
    const tabMap = new Map<string, TabPayload>()
    for (const tab of tabs) {
      tabMap.set(tab.tabKey, tab)
    }

    // Record uploads
    const uploadIds: string[] = []
    for (const tab of tabs) {
      try {
        const { data: uploadRow } = await adminDb
          .from("staged_uploads")
          .insert({
            user_id: user.id,
            organization_id: organizationId,
            file_name: tab.fileName,
            file_type: tab.fileName.endsWith(".csv") ? "csv" : "xlsx",
            source_type: 'manual_upload',
            row_count: tab.rowCount,
            column_count: tab.columns.length,
            status: 'processed',
            metadata: { tabName: tab.tabName, rowType: tab.answers.rowType, metricColumn: tab.answers.metricColumn, dateColumn: tab.answers.dateColumn },
          })
          .select("id")
          .single()
        if (uploadRow?.id) uploadIds.push(uploadRow.id)
      } catch (err) {
        console.error("[v0] Failed to record upload for tab:", tab.tabName, err)
      }
    }

    // Calculate and persist each signal
    const createdSignals: { id: string; name: string; category: string; value: string }[] = []
    const errors: string[] = []

    for (const signalDef of signals) {
      const tab = tabMap.get(signalDef.tabKey)
      if (!tab) {
        errors.push(`Tab not found for signal: ${signalDef.name}`)
        continue
      }

      const result = calculateSignal(signalDef, tab)
      if (!result) {
        errors.push(`Could not calculate: ${signalDef.name}`)
        continue
      }

      try {
        // Build summary
        const trendText = result.trendPercentage !== null
          ? `${result.trendPercentage > 0 ? "+" : ""}${result.trendPercentage}%`
          : `${result.dataPointCount} data points`
        // DB constraint signals_trend_check may allow only ('up', 'down', 'stable'); normalize so insert never fails
        const dbTrend = result.trend === "increasing" ? "up" : result.trend === "decreasing" ? "down" : "stable"

        const summary = `${signalDef.operation}: ${result.formula}. ${signalDef.description}`

        // Store raw numeric value (parseFloat-safe) in absolute_value
        // Keep formatted string in source_metadata for optional display use
        const rawValue = String(result.value)

        // Upsert signal: try update first, then insert if not found
        const metadata = JSON.stringify({
          tabName: signalDef.tabName,
          fileName: tab.fileName,
          operation: signalDef.operation,
          valueColumn: signalDef.valueColumn,
          dateColumn: signalDef.dateColumn,
          groupByColumn: signalDef.groupByColumn,
          rowType: tab.answers.rowType,
          rowCount: tab.rowCount,
          formattedValue: result.formattedValue,
        })

        // Try to find existing signal first
        let existingSignalQuery = adminDb
          .from("signals")
          .select("id, name, category, absolute_value")
          .eq("name", signalDef.name)

        if (organizationId) {
          existingSignalQuery = existingSignalQuery.eq("organization_id", organizationId)
        } else {
          existingSignalQuery = existingSignalQuery.is("organization_id", null)
        }

        const { data: existingSignal } = await existingSignalQuery.maybeSingle()

        let signalRecord: { id: string; name: string; category: string; absolute_value: string } | null = null
        if (existingSignal) {
          // Update existing
          const { data: updated } = await adminDb
            .from("signals")
            .update({
              absolute_value: rawValue,
              trend: dbTrend,
              trend_value: trendText,
              summary: summary,
              source_metadata: JSON.parse(metadata),
              category: result.category,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSignal.id)
            .select("id, name, category, absolute_value")
            .single()
          signalRecord = updated
        } else {
          // Insert new
          const { data: inserted } = await adminDb
            .from("signals")
            .insert({
              name: signalDef.name,
              category: result.category,
              organization_id: organizationId,
              absolute_value: rawValue,
              trend: dbTrend,
              trend_value: trendText,
              source_type: 'upload',
              summary: summary,
              source_metadata: JSON.parse(metadata),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select("id, name, category, absolute_value")
            .single()
          signalRecord = inserted
        }

        if (signalRecord) {
          createdSignals.push({
            id: signalRecord.id,
            name: signalRecord.name,
            category: signalRecord.category,
            value: signalRecord.absolute_value,
          })

          // Write time-series data points
          if (result.timeSeries.length > 0) {
            // First, clear old data points for this signal to avoid duplicates
            try {
              await adminDb
                .from("signal_data_points")
                .delete()
                .eq("signal_id", signalRecord.id)
            } catch (_) { /* table may not exist */ }

            for (const dp of result.timeSeries) {
              try {
                await adminDb
                  .from("signal_data_points")
                  .insert({
                    signal_id: signalRecord.id,
                    date: dp.date.toISOString(),
                    value: dp.value,
                    metadata: { operation: signalDef.operation, tabName: signalDef.tabName },
                  })
              } catch (dpErr) {
                // Non-fatal
              }
            }
          }
        }
      } catch (insertErr) {
        const msg = insertErr instanceof Error ? insertErr.message : "Unknown error"
        errors.push(`Failed to save ${signalDef.name}: ${msg}`)
      }
    }

    // Persist field metadata for cross-upload awareness
    for (const tab of tabs) {
      const uploadId = uploadIds[tabs.indexOf(tab)]
      if (!uploadId) continue

      for (const colName of tab.columns) {
        try {
          const normalizedName = colName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
          const fieldType = tab.columnTypes[colName] === "number" ? "numeric"
            : tab.columnTypes[colName] === "date" ? "date"
            : "text"

          await adminDb
            .from("staged_fields")
            .upsert(
              {
                upload_id: uploadId,
                original_column_name: colName,
                normalized_field_name: normalizedName,
                field_type: fieldType,
                sample_values: tab.rows.slice(0, 5).map(r => r[colName]),
                stats: { rowCount: tab.rowCount, rowType: tab.answers.rowType },
              },
              { ignoreDuplicates: true }
            )

          // Update cross-upload field availability
          const { data: existingField } = await adminDb
            .from("field_availability")
            .select("id, upload_ids, total_data_points")
            .eq("normalized_field_name", normalizedName)
            .eq("organization_id", organizationId)
            .maybeSingle()

          if (existingField) {
            const currentUploads = existingField.upload_ids || []
            const newUploads = Array.isArray(currentUploads) ? [...currentUploads, uploadId] : [uploadId]
            await adminDb
              .from("field_availability")
              .update({
                upload_ids: newUploads,
                total_data_points: (existingField.total_data_points || 0) + tab.rowCount,
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
                total_data_points: tab.rowCount,
                latest_upload_at: new Date().toISOString(),
              })
          }
        } catch (fieldErr) {
          // Non-fatal
        }
      }
    }

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      signals: createdSignals,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error("[v0] Generate API error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to generate signals",
    }, { status: 500 })
  }
}
