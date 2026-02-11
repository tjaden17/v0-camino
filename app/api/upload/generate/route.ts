import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

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
  const cleaned = val.replace(/[$,\s%]/g, "")
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
    const profileResult = await sql`
      SELECT organization_id FROM profiles WHERE id = ${user.id} LIMIT 1
    `
    const organizationId = profileResult?.[0]?.organization_id || null

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
        const result = await sql`
          INSERT INTO staged_uploads (user_id, organization_id, file_name, file_type, source_type, row_count, column_count, status, metadata)
          VALUES (
            ${user.id},
            ${organizationId},
            ${tab.fileName},
            ${tab.fileName.endsWith(".csv") ? "csv" : "xlsx"},
            'manual_upload',
            ${tab.rowCount},
            ${tab.columns.length},
            'processed',
            ${JSON.stringify({ tabName: tab.tabName, rowType: tab.answers.rowType, metricColumn: tab.answers.metricColumn, dateColumn: tab.answers.dateColumn })}
          )
          RETURNING id
        `
        if (result?.[0]?.id) uploadIds.push(result[0].id)
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
        const existingSignal = organizationId
          ? await sql`SELECT id, name, category, absolute_value FROM signals WHERE name = ${signalDef.name} AND organization_id = ${organizationId} LIMIT 1`
          : await sql`SELECT id, name, category, absolute_value FROM signals WHERE name = ${signalDef.name} AND organization_id IS NULL LIMIT 1`

        let dbResult
        if (existingSignal?.[0]) {
          // Update existing
          dbResult = await sql`
            UPDATE signals SET
              absolute_value = ${rawValue},
              trend = ${result.trend},
              trend_value = ${trendText},
              summary = ${summary},
              source_metadata = ${metadata}::jsonb,
              category = ${result.category},
              updated_at = NOW()
            WHERE id = ${existingSignal[0].id}
            RETURNING id, name, category, absolute_value
          `
        } else {
          // Insert new
          dbResult = await sql`
            INSERT INTO signals (name, category, organization_id, absolute_value, trend, trend_value, source_type, summary, source_metadata, created_at, updated_at)
            VALUES (
              ${signalDef.name},
              ${result.category},
              ${organizationId},
              ${rawValue},
              ${result.trend},
              ${trendText},
              'upload',
              ${summary},
              ${metadata}::jsonb,
              NOW(),
              NOW()
            )
            RETURNING id, name, category, absolute_value
          `
        }

        if (dbResult?.[0]) {
          const signalRecord = dbResult[0]
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
              await sql`DELETE FROM signal_data_points WHERE signal_id = ${signalRecord.id}::uuid`
            } catch (_) { /* table may not exist */ }

            for (const dp of result.timeSeries) {
              try {
                await sql`
                  INSERT INTO signal_data_points (signal_id, date, value, metadata)
                  VALUES (
                    ${signalRecord.id}::uuid,
                    ${dp.date.toISOString()},
                    ${dp.value},
                    ${JSON.stringify({ operation: signalDef.operation, tabName: signalDef.tabName })}
                  )
                `
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

          await sql`
            INSERT INTO staged_fields (upload_id, original_column_name, normalized_field_name, field_type, sample_values, stats)
            VALUES (
              ${uploadId}::uuid,
              ${colName},
              ${normalizedName},
              ${fieldType},
              ${JSON.stringify(tab.rows.slice(0, 5).map(r => r[colName]))},
              ${JSON.stringify({ rowCount: tab.rowCount, rowType: tab.answers.rowType })}
            )
            ON CONFLICT DO NOTHING
          `

          // Update cross-upload field availability
          const existing = await sql`
            SELECT id, upload_ids, total_data_points
            FROM field_availability
            WHERE normalized_field_name = ${normalizedName}
              AND organization_id = ${organizationId}
            LIMIT 1
          `

          if (existing?.[0]) {
            const currentUploads = existing[0].upload_ids || []
            const newUploads = Array.isArray(currentUploads) ? [...currentUploads, uploadId] : [uploadId]
            await sql`
              UPDATE field_availability SET
                upload_ids = ${JSON.stringify(newUploads)},
                total_data_points = ${(existing[0].total_data_points || 0) + tab.rowCount},
                latest_upload_at = NOW()
              WHERE id = ${existing[0].id}
            `
          } else {
            await sql`
              INSERT INTO field_availability (user_id, organization_id, normalized_field_name, field_type, upload_ids, total_data_points, latest_upload_at)
              VALUES (
                ${user.id},
                ${organizationId},
                ${normalizedName},
                ${fieldType},
                ${JSON.stringify([uploadId])},
                ${tab.rowCount},
                NOW()
              )
            `
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
