/**
 * MSS catalog signal calculations. Exact formulas from docs/MSS_BUILD_PLAN_LOCKED.md.
 * Used by the generate route (catalog pass) and by the catalog API when computing on read (optional).
 */

import {
  MSS_CATALOG_SIGNALS,
  findColumn,
  hasRequiredColumns,
  ROW_TYPE_TO_SOURCE,
  type MssCatalogSignal,
} from "@/lib/mss-catalog"
import { filterNonRealTickets } from "@/lib/non-real-ticket-filter"

export interface CatalogTabInput {
  rows: Record<string, string>[]
  columns: string[]
  answers: { rowType: string | null }
}

export interface CatalogCalculationResult {
  value: number
  formattedValue: string
  trend: string
  trendPercentage: number | null
  formula: string
  timeSeries: { date: Date; value: number }[]
  category: string
}

function parseNumber(val: string | undefined | null): number | null {
  if (!val || val.trim() === "") return null
  const cleaned = String(val)
    .replace(/^[A-Z]{3}\s*/i, "")
    .replace(/[$€£¥,\s%]/g, "")
    .replace(/^\((.+)\)$/, "-$1")
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

/**
 * Parse date from string. Handles both DD/MM/YYYY (AU/Zoho) and MM/DD/YYYY (US):
 * - If first number > 12 → must be day (DD/MM), e.g. 25/10/2025 = 25 Oct.
 * - If second number > 12 → must be month (MM/DD), e.g. 10/25/2025 = 25 Oct.
 * - If both <= 12 (ambiguous) → prefer DD/MM (AU/Zoho) so 01/06/2026 = 1 June, 06/01/2026 = 6 Jan.
 * Falls back to native Date for ISO and other formats.
 */
function parseDate(val: string | undefined | null): Date | null {
  if (!val || val.trim() === "") return null
  const s = val.trim()
  const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (match) {
    const a = parseInt(match[1], 10)
    const b = parseInt(match[2], 10)
    const year = parseInt(match[3], 10)
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(year) || year <= 1990)
      return null
    let month0: number
    let day: number
    if (a > 12) {
      // First is day (DD/MM), e.g. 25/10/2025
      day = a
      month0 = b - 1
    } else if (b > 12) {
      // Second is day (MM/DD), e.g. 10/25/2025
      month0 = a - 1
      day = b
    } else {
      // Both <= 12: prefer DD/MM (AU/Zoho) so 01/06/2026 = 1 June, 06/01/2026 = 6 Jan
      day = a
      month0 = b - 1
    }
    const d = new Date(year, month0, day)
    if (!Number.isNaN(d.getTime())) return d
  }
  const d = new Date(s)
  if (!Number.isNaN(d.getTime()) && d.getFullYear() > 1990) return d
  return null
}

/**
 * Return the latest month key (YYYY-MM-01) present in the data for the given date column,
 * so all metrics can use the same "last date in the spreadsheet" as the reference period.
 */
function getReferenceMonthKey(
  rows: Record<string, string>[],
  dateCol: string
): string | null {
  let maxKey: string | null = null
  for (const row of rows) {
    const d = parseDate(row[dateCol])
    if (!d) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    if (maxKey === null || key.localeCompare(maxKey) > 0) maxKey = key
  }
  return maxKey
}

/** Parse "X days HH:MM hrs" or "HH:MM hrs" to total hours. */
function parseResolutionTimeHours(val: string | undefined | null): number | null {
  if (!val || val.trim() === "") return null
  const s = String(val).trim()
  let days = 0
  let hours = 0
  let minutes = 0
  const daysMatch = s.match(/(\d+)\s*days?/i)
  if (daysMatch) days = parseInt(daysMatch[1], 10)
  const timeMatch = s.match(/(\d{1,2}):(\d{2})\s*hrs?/i)
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10)
    minutes = parseInt(timeMatch[2], 10)
  }
  if (isNaN(days)) days = 0
  if (isNaN(hours)) hours = 0
  if (isNaN(minutes)) minutes = 0
  return days * 24 + hours + minutes / 60
}

/** Trend = this period vs prior period (e.g. last month vs month before). Needs at least 2 points. */
function determineTrend(dataPoints: { date: Date; value: number }[]): { trend: string; percentage: number | null } {
  if (dataPoints.length < 2) return { trend: "stable", percentage: null }
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime())
  const prev = sorted[sorted.length - 2].value
  const last = sorted[sorted.length - 1].value
  if (prev === 0) return { trend: "stable", percentage: null }
  const change = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0
  const rounded = Math.round(change * 10) / 10
  if (Math.abs(rounded) < 5) return { trend: "stable", percentage: rounded }
  return {
    trend: rounded > 0 ? "increasing" : "decreasing",
    percentage: rounded,
  }
}

const CLOSED_WON = ["closed won", "closed-won", "won", "success"]
const CLOSED_NO_BUDGET = ["closed - no budget", "closed-no budget", "no budget", "closed no budget"]
const OPEN_STAGES = [
  "qualification",
  "value proposition",
  "id. decision makers",
  "proposal/price quote",
  "contracts",
  "on hold - timing",
  "on hold",
]

function isClosedWon(stage: string): boolean {
  const s = stage.toLowerCase().trim()
  return CLOSED_WON.some((x) => s.includes(x) || s === x)
}

function isClosedNoBudget(stage: string): boolean {
  const s = stage.toLowerCase().trim()
  return CLOSED_NO_BUDGET.some((x) => s.includes(x) || s === x)
}

/** Stage NOT IN (Closed Won, Closed - No Budget) — open deals for Monthly Pipeline. */
function isOpenDeal(stage: string): boolean {
  const s = stage.toLowerCase().trim()
  if (CLOSED_WON.some((x) => s.includes(x) || s === x)) return false
  if (CLOSED_NO_BUDGET.some((x) => s.includes(x) || s === x)) return false
  return true
}

/**
 * Monthly Pipeline: for each month, sum of open deal Amount with Closing Date in that month
 * (potential revenue expected to close that month). Primary value = latest month with data.
 */
export function calculatePipelineValue(tab: CatalogTabInput): CatalogCalculationResult | null {
  const amountCol = findColumn(tab.columns, "Amount")
  const stageCol = findColumn(tab.columns, "Stage")
  const dateCol = findColumn(tab.columns, "Closing Date", "Close Date", "Created Time")
  if (!amountCol || !stageCol || !dateCol) return null
  const timeSeries: { date: Date; value: number }[] = []
  const monthly: Record<string, number> = {}
  for (const row of tab.rows) {
    const stage = (row[stageCol] ?? "").trim()
    if (!isOpenDeal(stage)) continue
    const v = parseNumber(row[amountCol])
    if (v === null) continue
    const d = parseDate(row[dateCol])
    if (d) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
      monthly[key] = (monthly[key] || 0) + v
    }
  }
  const sortedEntries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
  for (const [dateStr, val] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: val })
  }
  const referenceMonth = getReferenceMonthKey(tab.rows, dateCol)
  const latestMonthValue =
    referenceMonth !== null
      ? (monthly[referenceMonth] ?? 0)
      : sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1][1]
        : 0
  const trend = determineTrend(timeSeries)
  const formatted =
    latestMonthValue >= 1_000_000
      ? `$${(latestMonthValue / 1_000_000).toFixed(1)}M`
      : latestMonthValue >= 1_000
        ? `$${(latestMonthValue / 1_000).toFixed(1)}K`
        : `$${Math.round(latestMonthValue).toLocaleString()}`
  return {
    value: Math.round(latestMonthValue * 100) / 100,
    formattedValue: formatted,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula: `Sum of open deal Amount with Closing Date in that month (potential revenue for that month)`,
    timeSeries,
    category: "Sales",
  }
}

/**
 * Win Rate = Closed Won / all deals (open + closed). Primary value = latest month when
 * Closing Date is present (win rate for that period), else all-time.
 */
export function calculateWinRate(tab: CatalogTabInput): CatalogCalculationResult | null {
  const stageCol = findColumn(tab.columns, "Stage")
  if (!stageCol) return null
  const totalDeals = tab.rows.length
  if (totalDeals === 0) return null
  let won = 0
  const dateCol = findColumn(tab.columns, "Closing Date", "Close Date", "Created Time")
  const monthly: Record<string, { total: number; won: number }> = {}
  for (const row of tab.rows) {
    const stage = (row[stageCol] ?? "").trim()
    if (isClosedWon(stage)) won++
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        if (!monthly[key]) monthly[key] = { total: 0, won: 0 }
        monthly[key].total++
        if (isClosedWon(stage)) monthly[key].won++
      }
    }
  }
  const timeSeries: { date: Date; value: number }[] = []
  const sortedEntries = Object.entries(monthly)
    .filter(([, v]) => v.total > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  for (const [dateStr, { total: t, won: w }] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: Math.round((w / t) * 1000) / 10 })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(tab.rows, dateCol) : null
  const refBucket = referenceMonth ? monthly[referenceMonth] : null
  const latestMonthValue =
    refBucket && refBucket.total > 0
      ? (refBucket.won / refBucket.total) * 100
      : sortedEntries.length > 0
        ? (sortedEntries[sortedEntries.length - 1][1].won / sortedEntries[sortedEntries.length - 1][1].total) * 100
        : null
  const primaryValue = latestMonthValue !== null ? latestMonthValue : (won / totalDeals) * 100
  const trend = determineTrend(timeSeries)
  const rounded = Math.round(primaryValue * 10) / 10
  return {
    value: rounded,
    formattedValue: `${rounded}%`,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `Closed Won / all deals for ${referenceMonth.slice(0, 7)}. All-time: ${won} won / ${totalDeals} total = ${Math.round((won / totalDeals) * 100)}%`
        : `Closed Won / all deals = ${won} won / ${totalDeals} total`,
    timeSeries,
    category: "Sales",
  }
}

/**
 * Closed Revenue = expected revenue from Closed Won deals. Primary value = for a period:
 * latest month when Closing Date present, else all-time sum.
 */
export function calculateClosedRevenue(tab: CatalogTabInput): CatalogCalculationResult | null {
  const amountCol = findColumn(tab.columns, "Amount")
  const stageCol = findColumn(tab.columns, "Stage")
  if (!amountCol || !stageCol) return null
  let sumAllTime = 0
  const dateCol = findColumn(tab.columns, "Closing Date", "Close Date", "Created Time")
  const monthly: Record<string, number> = {}
  for (const row of tab.rows) {
    const stage = (row[stageCol] ?? "").trim()
    if (!isClosedWon(stage)) continue
    const v = parseNumber(row[amountCol])
    if (v === null) continue
    sumAllTime += v
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        monthly[key] = (monthly[key] || 0) + v
      }
    }
  }
  const sortedEntries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
  const timeSeries: { date: Date; value: number }[] = []
  for (const [dateStr, val] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: val })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(tab.rows, dateCol) : null
  const latestMonthValue =
    referenceMonth !== null
      ? (monthly[referenceMonth] ?? 0)
      : sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1][1]
        : null
  const primaryValue = latestMonthValue !== null ? latestMonthValue : sumAllTime
  const trend = determineTrend(timeSeries)
  const formatted =
    primaryValue >= 1_000_000
      ? `$${(primaryValue / 1_000_000).toFixed(1)}M`
      : primaryValue >= 1_000
        ? `$${(primaryValue / 1_000).toFixed(1)}K`
        : `$${Math.round(primaryValue).toLocaleString()}`
  return {
    value: Math.round(primaryValue * 100) / 100,
    formattedValue: formatted,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `Expected revenue (Closed Won) for ${referenceMonth.slice(0, 7)}. All-time: $${Math.round(sumAllTime).toLocaleString()}`
        : `Expected revenue (Closed Won) = SUM(Amount) WHERE Stage = Closed Won`,
    timeSeries,
    category: "Sales",
  }
}

/**
 * Avg Sales Cycle = AVG(Sales Cycle Duration) for Closed Won. Primary = latest month when
 * Closing Date present, else all-time.
 */
export function calculateAvgSalesCycle(tab: CatalogTabInput): CatalogCalculationResult | null {
  const stageCol = findColumn(tab.columns, "Stage")
  const durationCol = findColumn(tab.columns, "Sales Cycle Duration")
  if (!stageCol || !durationCol) return null
  let sumAllTime = 0
  let countAllTime = 0
  const dateCol = findColumn(tab.columns, "Closing Date", "Close Date")
  const monthly: Record<string, { sum: number; count: number }> = {}
  for (const row of tab.rows) {
    const stage = (row[stageCol] ?? "").trim()
    if (!isClosedWon(stage)) continue
    const v = parseNumber(row[durationCol])
    if (v === null || v < 0) continue
    sumAllTime += v
    countAllTime++
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        if (!monthly[key]) monthly[key] = { sum: 0, count: 0 }
        monthly[key].sum += v
        monthly[key].count++
      }
    }
  }
  if (countAllTime === 0) return null
  const sortedEntries = Object.entries(monthly)
    .filter(([, v]) => v.count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  const timeSeries: { date: Date; value: number }[] = []
  for (const [dateStr, { sum: s, count: c }] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: Math.round((s / c) * 10) / 10 })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(tab.rows, dateCol) : null
  const refBucket = referenceMonth ? monthly[referenceMonth] : null
  const latestMonthValue =
    refBucket && refBucket.count > 0
      ? refBucket.sum / refBucket.count
      : sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1][1].sum / sortedEntries[sortedEntries.length - 1][1].count
        : null
  const primaryValue = latestMonthValue !== null ? latestMonthValue : sumAllTime / countAllTime
  const trend = determineTrend(timeSeries)
  const rounded = Math.round(primaryValue * 10) / 10
  return {
    value: rounded,
    formattedValue: `${rounded} days`,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `AVG(Sales Cycle Duration) for Closed Won, ${referenceMonth.slice(0, 7)}. All-time: ${Math.round((sumAllTime / countAllTime) * 10) / 10} days`
        : `AVG(Sales Cycle Duration) WHERE Stage = Closed Won`,
    timeSeries,
    category: "Sales",
  }
}

/**
 * Ticket Volume = COUNT of real tickets. Primary = latest month when Created Time present, else all-time.
 */
export function calculateTicketVolume(tab: CatalogTabInput): CatalogCalculationResult | null {
  const subjectCol = findColumn(tab.columns, "Subject")
  if (!subjectCol) return null
  const { filteredRows } = filterNonRealTickets(tab.rows, tab.columns)
  const countAllTime = filteredRows.length
  const dateCol = findColumn(tab.columns, "Created Time", "Created Date", "Created")
  const monthly: Record<string, number> = {}
  for (const row of filteredRows) {
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        monthly[key] = (monthly[key] || 0) + 1
      }
    }
  }
  const sortedEntries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
  const timeSeries: { date: Date; value: number }[] = []
  for (const [dateStr, val] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: val })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(filteredRows, dateCol) : null
  const latestMonthValue =
    referenceMonth !== null
      ? (monthly[referenceMonth] ?? 0)
      : sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1][1]
        : null
  const primaryValue = latestMonthValue !== null ? latestMonthValue : countAllTime
  const trend = determineTrend(timeSeries)
  return {
    value: primaryValue,
    formattedValue: `${Math.round(primaryValue)} tickets`,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `COUNT(tickets) excluding non-real, ${referenceMonth.slice(0, 7)}. All-time: ${countAllTime} tickets`
        : `COUNT(tickets) excluding non-real (e.g. Policy acknowledgment required)`,
    timeSeries,
    category: "Support",
  }
}

/**
 * Avg Resolution Time = AVG(Resolution Time) for Closed tickets, excluding non-real.
 * Primary = latest month when Created Time present (bucket by ticket created month), else all-time.
 */
export function calculateAvgResolutionTime(tab: CatalogTabInput): CatalogCalculationResult | null {
  const subjectCol = findColumn(tab.columns, "Subject")
  const statusCol = findColumn(tab.columns, "Status")
  const resolutionCol = findColumn(tab.columns, "Resolution Time in Business Hours")
  if (!subjectCol || !statusCol || !resolutionCol) return null
  const { filteredRows } = filterNonRealTickets(tab.rows, tab.columns)
  const closed = filteredRows.filter((row) => (row[statusCol] ?? "").toString().toLowerCase().trim() === "closed")
  if (closed.length === 0) return null
  let totalHoursAllTime = 0
  let countAllTime = 0
  const dateCol = findColumn(tab.columns, "Created Time", "Created Date", "Created")
  const monthly: Record<string, { totalHours: number; count: number }> = {}
  for (const row of closed) {
    const h = parseResolutionTimeHours(row[resolutionCol])
    if (h === null || h < 0) continue
    totalHoursAllTime += h
    countAllTime++
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        if (!monthly[key]) monthly[key] = { totalHours: 0, count: 0 }
        monthly[key].totalHours += h
        monthly[key].count++
      }
    }
  }
  if (countAllTime === 0) return null
  const sortedEntries = Object.entries(monthly)
    .filter(([, v]) => v.count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  const timeSeries: { date: Date; value: number }[] = []
  for (const [dateStr, { totalHours: th, count: c }] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: Math.round((th / c) * 100) / 100 })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(filteredRows, dateCol) : null
  const refBucket = referenceMonth ? monthly[referenceMonth] : null
  const latestMonthValue =
    refBucket && refBucket.count > 0
      ? refBucket.totalHours / refBucket.count
      : sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1][1].totalHours / sortedEntries[sortedEntries.length - 1][1].count
        : null
  const primaryValue = latestMonthValue !== null ? latestMonthValue : totalHoursAllTime / countAllTime
  const trend = determineTrend(timeSeries)
  const formatted =
    primaryValue >= 24
      ? `${Math.floor(primaryValue / 24)} days ${Math.round(primaryValue % 24)} hrs`
      : `${Math.round(primaryValue * 10) / 10} hrs`
  return {
    value: Math.round(primaryValue * 100) / 100,
    formattedValue: formatted,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `AVG(Resolution Time) for Closed tickets, ${referenceMonth.slice(0, 7)}. Excluding non-real.`
        : `AVG(Resolution Time) for Closed tickets, excluding non-real`,
    timeSeries,
    category: "Support",
  }
}

/**
 * Lead Conversion Rate = converted / total leads × 100. Primary = latest month when
 * Created Time present, else all-time.
 */
export function calculateLeadConversionRate(tab: CatalogTabInput): CatalogCalculationResult | null {
  const convertedCol = findColumn(
    tab.columns,
    "Is Converted",
    "Is converted",
    "Converted"
  )
  if (!convertedCol) return null
  let totalAllTime = 0
  let convertedAllTime = 0
  const dateCol = findColumn(tab.columns, "Created Time", "Created Date", "Created")
  const monthly: Record<string, { total: number; converted: number }> = {}
  for (const row of tab.rows) {
    const raw = (row[convertedCol] ?? "").toString().trim().toLowerCase()
    if (raw === "") continue
    totalAllTime++
    if (["yes", "true", "1", "y"].includes(raw)) convertedAllTime++
    if (dateCol) {
      const d = parseDate(row[dateCol])
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
        if (!monthly[key]) monthly[key] = { total: 0, converted: 0 }
        monthly[key].total++
        if (["yes", "true", "1", "y"].includes(raw)) monthly[key].converted++
      }
    }
  }
  if (totalAllTime === 0) return null
  const sortedEntries = Object.entries(monthly)
    .filter(([, v]) => v.total > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  const timeSeries: { date: Date; value: number }[] = []
  for (const [dateStr, { total: t, converted: c }] of sortedEntries) {
    timeSeries.push({ date: new Date(dateStr), value: Math.round((c / t) * 1000) / 10 })
  }
  const referenceMonth = dateCol ? getReferenceMonthKey(tab.rows, dateCol) : null
  const refBucket = referenceMonth ? monthly[referenceMonth] : null
  const latestMonthValue =
    refBucket && refBucket.total > 0
      ? (refBucket.converted / refBucket.total) * 100
      : sortedEntries.length > 0
        ? (sortedEntries[sortedEntries.length - 1][1].converted / sortedEntries[sortedEntries.length - 1][1].total) * 100
        : null
  const primaryValue =
    latestMonthValue !== null ? latestMonthValue : (convertedAllTime / totalAllTime) * 100
  const trend = determineTrend(timeSeries)
  const rounded = Math.round(primaryValue * 10) / 10
  return {
    value: rounded,
    formattedValue: `${rounded}%`,
    trend: trend.trend,
    trendPercentage: trend.percentage,
    formula:
      referenceMonth != null
        ? `Converted / total leads, ${referenceMonth.slice(0, 7)}. All-time: ${convertedAllTime}/${totalAllTime} = ${Math.round((convertedAllTime / totalAllTime) * 100)}%`
        : `${convertedAllTime} converted / ${totalAllTime} leads`,
    timeSeries,
    category: "Customer Success",
  }
}

const CALCULATORS: Record<
  MssCatalogSignal["formulaId"],
  (tab: CatalogTabInput) => CatalogCalculationResult | null
> = {
  pipeline_value: calculatePipelineValue,
  win_rate: calculateWinRate,
  closed_revenue: calculateClosedRevenue,
  avg_sales_cycle: calculateAvgSalesCycle,
  ticket_volume: calculateTicketVolume,
  avg_resolution_time: calculateAvgResolutionTime,
  lead_conversion_rate: calculateLeadConversionRate,
}

/**
 * Compute a single catalog signal from a tab if the tab matches the signal's source type and has required columns.
 */
export function computeCatalogSignal(
  signal: MssCatalogSignal,
  tab: CatalogTabInput
): CatalogCalculationResult | null {
  const sourceType = ROW_TYPE_TO_SOURCE[tab.answers.rowType ?? ""]
  if (sourceType !== signal.sourceType) return null
  const { ok } = hasRequiredColumns(tab.columns, signal)
  if (!ok) return null
  const fn = CALCULATORS[signal.formulaId]
  if (!fn) return null
  return fn(tab)
}

/**
 * Find the first tab that can compute this catalog signal (matching source type and required columns).
 */
export function findTabForCatalogSignal(
  signal: MssCatalogSignal,
  tabs: CatalogTabInput[]
): CatalogTabInput | null {
  for (const tab of tabs) {
    const sourceType = ROW_TYPE_TO_SOURCE[tab.answers.rowType ?? ""]
    if (sourceType !== signal.sourceType) continue
    const { ok } = hasRequiredColumns(tab.columns, signal)
    if (!ok) continue
    return tab
  }
  return null
}
