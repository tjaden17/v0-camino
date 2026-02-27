import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import { filterNonRealTickets } from "@/lib/non-real-ticket-filter"
import * as XLSX from "xlsx"
import { parseCSV } from "@/lib/csv-parser"
import { MSS_CATALOG_SIGNALS, hasRequiredColumns } from "@/lib/mss-catalog"
import { computeCatalogSignal, type CatalogTabInput } from "@/lib/catalog-calculations"

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
    customRowLabel?: string | null
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

/** Format Date as YYYY-MM-DD (UTC) for storage so month labels are timezone-independent. */
function toDateOnlyUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

/** Stable key for replace-by-source: same file+tab name => same key (e.g. zoho_crm_leads_leads). */
function sourceKeyFromTab(fileName: string, tabName: string): string {
  const base = (fileName || "").replace(/\.[^.]+$/, "").trim()
  const combined = `${base}_${(tabName || "").trim()}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "upload"
}

/** Parse a file into sheet name -> rows (for multipart large payloads). */
async function parseFileToSheets(file: File): Promise<Map<string, Record<string, string>[]>> {
  const map = new Map<string, Record<string, string>[]>()
  const name = (file.name || "").toLowerCase()
  const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls")
  if (isExcel) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
      const rows = json.map(row => {
        const out: Record<string, string> = {}
        for (const k of Object.keys(row)) out[k] = String(row[k] ?? "")
        return out
      })
      if (rows.length > 0) map.set(sheetName, rows)
    }
  } else {
    const text = await file.text()
    const result = parseCSV(text)
    const rows = (result.rows || []).map(row => {
      const out: Record<string, string> = {}
      for (const k of Object.keys(row)) out[k] = String(row[k] ?? "")
      return out
    })
    if (rows.length > 0) map.set("Sheet1", rows)
  }
  return map
}

/** Parse multipart form body (metadata + file_0, file_1, ...) into generate request body. */
async function parseMultipartGenerateRequest(
  request: Request
): Promise<{ tabs: TabPayload[]; signals: SignalPayload[]; organizationId?: string | null }> {
  const formData = await request.formData()
  const metadataStr = formData.get("metadata") as string | null
  if (!metadataStr) throw new Error("multipart generate: missing metadata")
  const metadata = JSON.parse(metadataStr) as {
    tabs: Array<{
      tabKey: string
      tabName: string
      sheetName?: string
      fileName: string
      columns: string[]
      columnTypes: Record<string, "text" | "number" | "date" | "id">
      answers: TabPayload["answers"]
      fileIndex: number
      rowCount: number
    }>
    signals: SignalPayload[]
    organizationId?: string | null
  }
  const tabs: TabPayload[] = []
  const fileCount = metadata.tabs.length ? Math.max(...metadata.tabs.map(t => t.fileIndex)) + 1 : 0
  const sheetsByFile: Map<number, Map<string, Record<string, string>[]>> = new Map()
  for (let i = 0; i < fileCount; i++) {
    const file = formData.get(`file_${i}`) as File | null
    if (!file) throw new Error(`multipart generate: missing file_${i}`)
    sheetsByFile.set(i, await parseFileToSheets(file))
  }
  for (const meta of metadata.tabs) {
    const sheets = sheetsByFile.get(meta.fileIndex)
    if (!sheets) throw new Error(`multipart generate: no file for fileIndex ${meta.fileIndex}`)
    const sheetName = meta.sheetName ?? meta.tabName
    let rows = sheets.get(sheetName)
    if (!rows && sheets.size === 1) rows = Array.from(sheets.values())[0]
    if (!rows) throw new Error(`multipart generate: no sheet "${sheetName}" in file ${meta.fileIndex}`)
    tabs.push({
      tabKey: meta.tabKey,
      tabName: meta.tabName,
      fileName: meta.fileName,
      rowCount: rows.length,
      columns: meta.columns,
      columnTypes: meta.columnTypes,
      answers: meta.answers,
      rows,
    })
  }
  return { tabs, signals: metadata.signals, organizationId: metadata.organizationId }
}

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

function formatValue(value: number, operation: string, signalName?: string): string {
  if (operation === "rate" || operation === "rate_yes_no") {
    return `${Math.round(value * 10) / 10}%`
  }
  // Avg Sales Cycle (and similar) are in days — show as days, not currency
  const nameLower = (signalName ?? "").toLowerCase()
  if ((operation === "average" || operation === "group_by_avg") && (nameLower.includes("sales cycle") || nameLower.includes("cycle") && nameLower.includes("avg"))) {
    return `${Math.round(value)} days`
  }
  if (operation === "average" || operation === "sum" || operation === "group_by_sum" || operation === "group_by_avg" || operation === "sum_per_month") {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${Math.round(value).toLocaleString()}`
  }
  if (operation === "monthly_rate" || operation === "count_per_month") {
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

    case "sum_per_month": {
      if (!valueColumn || !dateColumn) return null
      const monthly: Record<string, number> = {}
      for (const row of rows) {
        const d = parseDate(row[dateColumn])
        const v = parseNumber(row[valueColumn])
        if (d && v !== null) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
          monthly[key] = (monthly[key] || 0) + v
        }
      }
      const entries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
      value = entries.length > 0 ? entries[entries.length - 1][1] : 0
      const latestMonth = entries.length > 0 ? entries[entries.length - 1][0] : ""
      formula = entries.length > 0 ? `SUM("${valueColumn}") in ${latestMonth} = ${value}` : `No data in any month`
      for (const [dateStr, val] of entries) {
        timeSeries.push({ date: new Date(dateStr), value: val })
      }
      break
    }

    case "count_per_month": {
      if (!dateColumn) return null
      const monthly: Record<string, number> = {}
      for (const row of rows) {
        const d = parseDate(row[dateColumn])
        if (d) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
          monthly[key] = (monthly[key] || 0) + 1
        }
      }
      const entries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
      value = entries.length > 0 ? entries[entries.length - 1][1] : 0
      const latestMonth = entries.length > 0 ? entries[entries.length - 1][0] : ""
      formula = entries.length > 0 ? `COUNT in ${latestMonth} = ${value}` : `No data in any month`
      for (const [dateStr, count] of entries) {
        timeSeries.push({ date: new Date(dateStr), value: count })
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

    case "group_by_sum": {
      if (!groupByColumn || !valueColumn) return null
      const groups: Record<string, number> = {}
      let totalSum = 0
      for (const row of rows) {
        const key = (row[groupByColumn] || "").trim()
        const v = parseNumber(row[valueColumn])
        if (key && v !== null) {
          groups[key] = (groups[key] || 0) + v
          totalSum += v
        }
      }
      const entries = Object.entries(groups).sort((a, b) => b[1] - a[1])
      value = totalSum
      const top3 = entries.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ")
      formula = `SUM("${valueColumn}") BY "${groupByColumn}" -> ${entries.length} groups. Top: ${top3}`

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

    case "group_by_avg": {
      if (!groupByColumn || !valueColumn) return null
      const groups: Record<string, { sum: number; count: number }> = {}
      let totalSum = 0
      let totalCount = 0
      for (const row of rows) {
        const key = (row[groupByColumn] || "").trim()
        const v = parseNumber(row[valueColumn])
        if (key && v !== null) {
          if (!groups[key]) groups[key] = { sum: 0, count: 0 }
          groups[key].sum += v
          groups[key].count++
          totalSum += v
          totalCount++
        }
      }
      if (totalCount === 0) return null
      const entries = Object.entries(groups)
        .map(([k, { sum, count }]) => [k, count > 0 ? sum / count : 0] as const)
        .sort((a, b) => b[1] - a[1])
      value = totalSum / totalCount
      const top3 = entries.slice(0, 3).map(([k, v]) => `${k}: ${Math.round(v * 100) / 100}`).join(", ")
      formula = `AVG("${valueColumn}") BY "${groupByColumn}" -> ${entries.length} groups. Top: ${top3}`

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
          timeSeries.push({ date: new Date(dateStr), value: count > 0 ? Math.round((sum / count) * 100) / 100 : 0 })
        }
      }
      break
    }

    case "rate": {
      // Win Rate: (number of 'closed won' in stage field) / (total number of deals) × 100
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

      const wonStatuses = ["won", "closed won", "closed-won", "success"]
      const totalDeals = rows.length
      let closedWon = 0
      for (const row of rows) {
        const stageValue = (row[stageColumn] || "").toLowerCase().trim()
        if (wonStatuses.some((status) => stageValue.includes(status))) closedWon++
      }

      if (totalDeals === 0) {
        console.log("[v0] No deals for win rate")
        return null
      }

      value = (closedWon / totalDeals) * 100
      formula = `${closedWon} closed won / ${totalDeals} deals = ${Math.round(value)}%`

      if (dateColumn) {
        const monthly: Record<string, { total: number; won: number }> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          const stageValue = (row[stageColumn] || "").toLowerCase().trim()
          const isWon = wonStatuses.some((status) => stageValue.includes(status))
          if (d) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
            if (!monthly[key]) monthly[key] = { total: 0, won: 0 }
            monthly[key].total++
            if (isWon) monthly[key].won++
          }
        }
        for (const [dateStr, { total, won }] of Object.entries(monthly)) {
          if (total > 0) {
            const rate = (won / total) * 100
            timeSeries.push({ date: new Date(dateStr), value: Math.round(rate * 10) / 10 })
          }
        }
      }
      break
    }

    case "rate_yes_no": {
      const convertedCol = tab.columns.find(
        (c) =>
          /is\s*converted|converted|conversion/i.test(c) || c.toLowerCase().replace(/\s+/g, "_") === "is_converted"
      )
      if (!convertedCol) {
        console.log("[v0] rate_yes_no: no Is Converted–style column found")
        return null
      }
      let converted = 0
      let total = 0
      for (const row of rows) {
        const raw = (row[convertedCol] ?? "").toString().trim().toLowerCase()
        if (raw === "") continue
        total++
        if (["yes", "true", "1", "y"].includes(raw)) converted++
      }
      if (total === 0) return null
      value = (converted / total) * 100
      formula = `${converted} converted / ${total} leads = ${Math.round(value * 10) / 10}%`
      if (dateColumn) {
        const monthly: Record<string, { converted: number; total: number }> = {}
        for (const row of rows) {
          const d = parseDate(row[dateColumn])
          const raw = (row[convertedCol] ?? "").toString().trim().toLowerCase()
          if (!d || raw === "") continue
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
          if (!monthly[key]) monthly[key] = { converted: 0, total: 0 }
          monthly[key].total++
          if (["yes", "true", "1", "y"].includes(raw)) monthly[key].converted++
        }
        for (const [dateStr, { converted: c, total: t }] of Object.entries(monthly)) {
          if (t > 0) timeSeries.push({ date: new Date(dateStr), value: Math.round((c / t) * 1000) / 10 })
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
    formattedValue: formatValue(value, operation, signal.name),
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
    const profileOrgId = profileResult?.[0]?.organization_id || null

    const contentType = request.headers.get("content-type") || ""
    let body: {
      tabs: TabPayload[]
      signals: SignalPayload[]
      organizationId?: string | null
      _recalc?: boolean
      _tabKeyToRawUploadId?: Record<string, string>
    }
    if (contentType.includes("multipart/form-data")) {
      try {
        const parsed = await parseMultipartGenerateRequest(request)
        body = { ...parsed, _recalc: false, _tabKeyToRawUploadId: {} }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ error: "Multipart parse failed", details: msg }, { status: 400 })
      }
    } else {
      // #region agent log
      const contentLength = request.headers.get("content-length")
      try {
        fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generate/route.ts:parse-body',message:'before request.json()',data:{contentLength: contentLength ?? 'missing'},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{})
      } catch (_) {}
      // #endregion
      try {
        body = (await request.json()) as typeof body
      } catch (parseErr) {
        const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr)
        try {
          fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generate/route.ts:parse-error',message:'request.json() failed',data:{errMsg,contentLength: request.headers.get("content-length") ?? 'missing'},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{})
        } catch (_) {}
        return NextResponse.json(
          { error: "Invalid request body (JSON parse failed). Use a smaller file or re-upload; large payloads may be sent as multipart.", details: errMsg },
          { status: 400 }
        )
      }
    }
    const {
      tabs,
      signals,
      organizationId: bodyOrgId,
      _recalc,
      _tabKeyToRawUploadId,
    } = body
    const organizationId = bodyOrgId != null && bodyOrgId !== "" ? bodyOrgId : profileOrgId

    if (!tabs || !signals || signals.length === 0) {
      return NextResponse.json({ error: "No signals to generate" }, { status: 400 })
    }

    const isRecalc = _recalc === true
    const initialTabKeyToRawUploadId = (_tabKeyToRawUploadId ?? {}) as Record<string, string>

    // Build tab lookup
    const tabMap = new Map<string, TabPayload>()
    for (const tab of tabs) {
      tabMap.set(tab.tabKey, tab)
    }

    // Universal pattern detector: filter non-real tickets before signal calculation
    const ticketFilterMeta = new Map<
      string,
      { ticketsFiltered: number; ticketsTotal: number; filterReasons: { reason: string; count: number }[] }
    >()
    for (const tab of tabs) {
      if (tab.answers.rowType === "tickets" && tab.rows.length > 0) {
        const { filteredRows, ticketsFiltered, ticketsTotal, filterReasons } = filterNonRealTickets(
          tab.rows,
          tab.columns
        )
        tabMap.set(tab.tabKey, { ...tab, rows: filteredRows, rowCount: filteredRows.length })
        if (ticketsFiltered > 0) {
          ticketFilterMeta.set(tab.tabKey, {
            ticketsFiltered,
            ticketsTotal,
            filterReasons: filterReasons.map((r) => ({ reason: r.reason, count: r.count })),
          })
          console.log(
            `[v0] Filtered ${ticketsFiltered} non-real tickets from ${tab.tabName} (${ticketsTotal} total)`
          )
        }
      }
    }

    // Record uploads (skip when recalc)
    const uploadIds: string[] = []
    if (!isRecalc) {
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
    }

    // Option B: Persist to staging layer. Replace (1): one active upload per (org, source_key).
    let tabKeyToRawUploadId: Record<string, string> = { ...initialTabKeyToRawUploadId }
    if (!isRecalc) try {
      for (const tab of tabs) {
        const tabWithRows = tabMap.get(tab.tabKey) ?? tab
        const rows = tabWithRows.rows ?? []
        const signalDefsForTab = signals.filter((s) => s.tabKey === tab.tabKey)
        const uploadMetadata = {
          answers: tab.answers,
          tabKey: tab.tabKey,
          tabName: tab.tabName,
          signalDefinitions: signalDefsForTab,
          columnTypes: tab.columnTypes,
        }
        const sourceKey = sourceKeyFromTab(tab.fileName, tab.tabName)

        // Replace (1): find existing upload for this org + source_key
        const existing = await sql`
          SELECT id FROM raw_data_uploads
          WHERE organization_id = ${organizationId}::uuid AND source_key = ${sourceKey}
          LIMIT 1
        ` as { id: string }[] | undefined
        const existingId = existing?.[0]?.id

        let rawUploadId: string
        if (existingId) {
          rawUploadId = existingId
          await sql`DELETE FROM raw_data_rows WHERE upload_id = ${existingId}::uuid`
          await sql`
            UPDATE raw_data_uploads SET
              uploaded_by = ${user.id},
              upload_name = ${tab.tabName},
              file_name = ${tab.fileName},
              source_key = ${sourceKey},
              total_rows = ${rows.length},
              column_names = ${JSON.stringify(tab.columns)}::jsonb,
              upload_metadata = ${JSON.stringify(uploadMetadata)}::jsonb,
              updated_at = NOW(),
              uploaded_at = NOW()
            WHERE id = ${existingId}::uuid
          `
        } else {
          const insertUpload = await sql`
            INSERT INTO raw_data_uploads (
              organization_id, uploaded_by, upload_name, source_type, file_name,
              source_key, total_rows, column_names, column_mappings, upload_metadata, created_at, updated_at
            )
            VALUES (
              ${organizationId},
              ${user.id},
              ${tab.tabName},
              'manual_upload',
              ${tab.fileName},
              ${sourceKey},
              ${rows.length},
              ${JSON.stringify(tab.columns)}::jsonb,
              ${null}::jsonb,
              ${JSON.stringify(uploadMetadata)}::jsonb,
              NOW(),
              NOW()
            )
            RETURNING id
          `
          rawUploadId = insertUpload?.[0]?.id
          if (!rawUploadId) continue
        }

        tabKeyToRawUploadId[tab.tabKey] = rawUploadId

        // Batch-insert rows in chunks (Neon-friendly)
        const ROW_CHUNK = 100
        for (let i = 0; i < rows.length; i += ROW_CHUNK) {
          const chunk = rows.slice(i, i + ROW_CHUNK)
          const rowsPayload = JSON.stringify(
            chunk.map((row, idx) => ({
              row_index: i + idx,
              original_data: row,
            }))
          )
          await sql`
            INSERT INTO raw_data_rows (upload_id, organization_id, row_index, original_data)
            SELECT ${rawUploadId}::uuid, ${organizationId}::uuid, (r->>'row_index')::int, (r->'original_data')::jsonb
            FROM jsonb_array_elements(${rowsPayload}::jsonb) AS r
          `
        }
      }
    } catch (stagingErr) {
      console.error("[v0] Staging layer write failed (non-fatal):", stagingErr)
    }

    // Calculate and persist each signal (always runs)
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
        const ticketMeta = signalDef.tabKey ? ticketFilterMeta.get(signalDef.tabKey) : undefined
        const metadata = JSON.stringify({
          tabName: signalDef.tabName,
          fileName: tab.fileName,
          operation: signalDef.operation,
          valueColumn: signalDef.valueColumn,
          dateColumn: signalDef.dateColumn,
          groupByColumn: signalDef.groupByColumn,
          rowType: tab.answers.rowType,
          customRowLabel: tab.answers.customRowLabel ?? undefined,
          rowCount: tab.rowCount,
          formattedValue: result.formattedValue,
          ...(ticketMeta && ticketMeta.ticketsFiltered > 0
            ? {
                ticketsFiltered: ticketMeta.ticketsFiltered,
                ticketsTotal: ticketMeta.ticketsTotal,
                filterReasons: ticketMeta.filterReasons,
              }
            : {}),
        })

        const sourceUploadId = tabKeyToRawUploadId[signalDef.tabKey] ?? null

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
              trend = ${dbTrend},
              trend_value = ${trendText},
              summary = ${summary},
              source_metadata = ${metadata}::jsonb,
              category = ${result.category},
              source_upload_id = ${sourceUploadId}::uuid,
              updated_at = NOW()
            WHERE id = ${existingSignal[0].id}
            RETURNING id, name, category, absolute_value
          `
        } else {
          // Insert new
          dbResult = await sql`
            INSERT INTO signals (name, category, organization_id, absolute_value, trend, trend_value, source_type, summary, source_metadata, source_upload_id, created_at, updated_at)
            VALUES (
              ${signalDef.name},
              ${result.category},
              ${organizationId},
              ${rawValue},
              ${dbTrend},
              ${trendText},
              'upload',
              ${summary},
              ${metadata}::jsonb,
              ${sourceUploadId}::uuid,
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
                    ${toDateOnlyUTC(dp.date)},
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

    // Catalog pass: compute and persist the 7 MSS signals when we have matching tab data
    if (organizationId) {
      const catalogTabInputs: CatalogTabInput[] = []
      const tabKeysByIndex: string[] = []
      for (const [tabKey, tab] of tabMap) {
        catalogTabInputs.push({
          rows: tab.rows,
          columns: tab.columns,
          answers: { rowType: tab.answers.rowType },
        })
        tabKeysByIndex.push(tabKey)
      }
      for (const catalogSignal of MSS_CATALOG_SIGNALS) {
        let matchedTab: CatalogTabInput | null = null
        let matchedTabKey: string | null = null
        for (let i = 0; i < catalogTabInputs.length; i++) {
          const input = catalogTabInputs[i]
          const sourceType = (input.answers.rowType && ["deals", "opportunities", "leads", "tickets"].includes(input.answers.rowType))
            ? (input.answers.rowType === "opportunities" ? "deals" : input.answers.rowType)
            : null
          const expected = catalogSignal.sourceType
          if (sourceType !== expected) continue
          const { ok } = hasRequiredColumns(input.columns, catalogSignal)
          if (!ok) continue
          matchedTab = input
          matchedTabKey = tabKeysByIndex[i]
          break
        }
        if (!matchedTab) continue
        const result = computeCatalogSignal(catalogSignal, matchedTab)
        if (!result) continue
        try {
          const dbTrend = result.trend === "increasing" ? "up" : result.trend === "decreasing" ? "down" : "stable"
          const rawValue = String(result.value)
          const summary = `Catalog: ${result.formula}`
          const sourceUploadId = matchedTabKey ? tabKeyToRawUploadId[matchedTabKey] ?? null : null
          const catalogTab = matchedTabKey ? tabMap.get(matchedTabKey) : undefined
          const sourceFileName = (catalogTab as TabPayload | undefined)?.fileName ?? null
          const catalogMetadata = {
            catalog: true,
            formulaId: catalogSignal.formulaId,
            ...(sourceFileName && { fileName: sourceFileName }),
          }
          const existingCatalog = await sql`
            SELECT id FROM signals WHERE name = ${catalogSignal.name} AND organization_id = ${organizationId} LIMIT 1
          ` as { id: string }[]
          if (existingCatalog?.[0]) {
            await sql`
              UPDATE signals SET
                absolute_value = ${rawValue},
                trend = ${dbTrend},
                trend_value = ${result.trendPercentage != null ? `${result.trendPercentage > 0 ? "+" : ""}${result.trendPercentage}%` : ""},
                summary = ${summary},
                category = ${result.category},
                source_metadata = ${JSON.stringify(catalogMetadata)}::jsonb,
                source_upload_id = ${sourceUploadId}::uuid,
                updated_at = NOW()
              WHERE id = ${existingCatalog[0].id}
            `
          } else {
            await sql`
              INSERT INTO signals (name, category, organization_id, absolute_value, trend, trend_value, source_type, summary, source_metadata, source_upload_id, created_at, updated_at)
              VALUES (
                ${catalogSignal.name},
                ${result.category},
                ${organizationId},
                ${rawValue},
                ${dbTrend},
                ${result.trendPercentage != null ? `${result.trendPercentage > 0 ? "+" : ""}${result.trendPercentage}%` : ""},
                'upload',
                ${summary},
                ${JSON.stringify(catalogMetadata)}::jsonb,
                ${sourceUploadId}::uuid,
                NOW(),
                NOW()
              )
            `
          }
          const updated = await sql`
            SELECT id FROM signals WHERE name = ${catalogSignal.name} AND organization_id = ${organizationId} LIMIT 1
          ` as { id: string }[]
          if (updated?.[0] && result.timeSeries.length > 0) {
            await sql`DELETE FROM signal_data_points WHERE signal_id = ${updated[0].id}::uuid`
            for (const dp of result.timeSeries) {
              try {
                await sql`
                  INSERT INTO signal_data_points (signal_id, date, value, metadata)
                  VALUES (${updated[0].id}::uuid, ${toDateOnlyUTC(dp.date)}, ${dp.value}, ${JSON.stringify({ catalog: catalogSignal.formulaId })})
                `
              } catch (_) { /* non-fatal */ }
            }
          }
        } catch (catalogErr) {
          console.error("[v0] Catalog signal save failed:", catalogSignal.name, catalogErr)
        }
      }
    }

    // Persist field metadata for cross-upload awareness (skip when recalc)
    if (!isRecalc) for (const tab of tabs) {
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

    const ticketFilterSummary =
      ticketFilterMeta.size > 0
        ? Array.from(ticketFilterMeta.entries()).map(([tabKey, meta]) => {
            const tab = tabMap.get(tabKey)
            return {
              tabName: tab?.tabName ?? tabKey,
              ticketsFiltered: meta.ticketsFiltered,
              ticketsTotal: meta.ticketsTotal,
              filterReasons: meta.filterReasons,
            }
          })
        : undefined

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      signals: createdSignals,
      errors: errors.length > 0 ? errors : undefined,
      ticketFilterSummary,
    })

  } catch (error) {
    console.error("[v0] Generate API error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to generate signals",
    }, { status: 500 })
  }
}
