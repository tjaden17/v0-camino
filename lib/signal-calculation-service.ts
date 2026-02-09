/**
 * Signal Calculation Service v2
 * 
 * Redesigned for entity-based data (CRM exports with multiple tabs).
 * Handles: tab-aware processing, row filtering by status/stage/date,
 * date-based trend calculation, and smart column resolution.
 */

import { parseFormattedNumber } from "./csv-parser"
import type { SignalRequirement, CalculationSpec, RowFilter } from "./signal-discovery-service"
import { normalizeFieldName } from "./signal-discovery-service"

// ============================================
// TYPES
// ============================================

export type CalculationType = "count" | "sum" | "average" | "rate" | "latest" | "median" | "custom"

export interface CalculationResult {
  value: number
  formattedValue: string
  dataPoints: number
  trend: "up" | "down" | "stable"
  trendPercentage: number | null
  calculationType: CalculationType
  calculationMethod: string
  formula: string
  usedColumn: string | null
  metadata: CalculationMetadata
}

export interface CalculationMetadata {
  method: string
  description: string
  formula: string
  example: string
  sourceColumn: string | null
  dataPointsUsed: number
  minValue: number | null
  maxValue: number | null
  sumValue: number | null
  avgValue: number | null
  tabName: string | null
  filteredRowCount: number | null
  totalRowCount: number | null
}

// ============================================
// COLUMN RESOLUTION
// ============================================

/**
 * Find column by flexible name matching (handles CRM field naming conventions)
 */
export function findColumn(
  rows: Record<string, string>[],
  patterns: string[]
): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])

  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase().replace(/[_\s-]+/g, "")
    
    // Exact match first
    const exact = columns.find(c => c.toLowerCase().replace(/[_\s-]+/g, "") === patternLower)
    if (exact) return exact
    
    // Contains match
    const contains = columns.find(c => {
      const colLower = c.toLowerCase().replace(/[_\s-]+/g, "")
      return colLower.includes(patternLower) || patternLower.includes(colLower)
    })
    if (contains) return contains
  }
  
  return null
}

/**
 * Find a date column from rows
 */
export function findDateColumn(rows: Record<string, string>[]): string | null {
  return findColumn(rows, [
    "close date", "closing date", "closed date",
    "create date", "created date", "creation date",
    "date", "modified date", "last modified",
    "activity date", "due date"
  ])
}

/**
 * Find a value/amount column from rows
 */
export function findValueColumn(rows: Record<string, string>[]): string | null {
  return findColumn(rows, [
    "amount", "deal amount", "deal value", "value",
    "revenue", "price", "total", "annual revenue",
    "contract value", "opportunity amount"
  ])
}

/**
 * Find a status/stage column from rows
 */
export function findStatusColumn(rows: Record<string, string>[]): string | null {
  return findColumn(rows, [
    "deal stage", "stage", "pipeline stage",
    "status", "deal status", "lifecycle stage",
    "lead status", "contact status",
    "outcome", "result"
  ])
}

/**
 * Find any numeric column (fallback)
 */
export function findNumericColumn(rows: Record<string, string>[]): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0]).filter(c => c !== "__tab__")

  for (const col of columns) {
    let numericCount = 0
    const samplesToCheck = Math.min(10, rows.length)
    
    for (let i = 0; i < samplesToCheck; i++) {
      if (parseFormattedNumber(rows[i]?.[col]) !== null) {
        numericCount++
      }
    }
    
    if (numericCount > samplesToCheck * 0.6) {
      return col
    }
  }
  
  return null
}

// ============================================
// ROW FILTERING
// ============================================

/**
 * Filter rows by tab name (for multi-tab XLSX files)
 */
export function filterByTab(rows: Record<string, string>[], tabName: string): Record<string, string>[] {
  return rows.filter(r => r.__tab__?.toLowerCase() === tabName.toLowerCase())
}

/**
 * Determine which tab is most relevant for a signal
 */
export function findBestTab(
  tabs: Map<string, Record<string, string>[]>,
  signalId: string,
  signalName: string
): { tabName: string; rows: Record<string, string>[] } | null {
  const combined = `${signalId} ${signalName}`.toLowerCase()
  
  // Map signal keywords to likely tab names
  const tabHints: Record<string, string[]> = {
    deals: ["deal", "pipeline", "revenue", "win rate", "close", "opportunity", "sales cycle", "conversion"],
    contacts: ["contact", "lead", "subscriber", "email", "engagement", "nps", "csat"],
    companies: ["company", "account", "customer", "churn", "retention", "expansion"],
    tickets: ["ticket", "support", "resolution", "response time", "backlog", "sla"],
  }
  
  // Score each tab
  let bestTab: string | null = null
  let bestScore = 0
  
  for (const [tabName, rows] of tabs) {
    let score = 0
    const tabLower = tabName.toLowerCase()
    
    // Check if tab name matches any hint category
    for (const [hintTab, keywords] of Object.entries(tabHints)) {
      if (tabLower.includes(hintTab)) {
        for (const keyword of keywords) {
          if (combined.includes(keyword)) {
            score += 10
          }
        }
      }
    }
    
    // Also check if signal keywords appear in the tab's column names
    if (rows[0]) {
      const colNames = Object.keys(rows[0]).join(" ").toLowerCase()
      if (combined.includes("amount") && colNames.includes("amount")) score += 5
      if (combined.includes("revenue") && colNames.includes("revenue")) score += 5
      if (combined.includes("stage") && colNames.includes("stage")) score += 5
      if (combined.includes("status") && colNames.includes("status")) score += 5
    }
    
    // Bonus for having data
    if (rows.length > 0) score += 1
    
    if (score > bestScore) {
      bestScore = score
      bestTab = tabName
    }
  }
  
  if (bestTab && tabs.has(bestTab)) {
    return { tabName: bestTab, rows: tabs.get(bestTab)! }
  }
  
  // Fallback: return the tab with the most rows
  let largestTab: string | null = null
  let largestCount = 0
  for (const [tabName, rows] of tabs) {
    if (rows.length > largestCount) {
      largestCount = rows.length
      largestTab = tabName
    }
  }
  
  if (largestTab && tabs.has(largestTab)) {
    return { tabName: largestTab, rows: tabs.get(largestTab)! }
  }
  
  return null
}

/**
 * Filter rows by stage/status for deal-related signals
 */
export function filterActiveRows(
  rows: Record<string, string>[],
  signalId: string,
  signalName: string
): Record<string, string>[] {
  const combined = `${signalId} ${signalName}`.toLowerCase()
  const statusCol = findStatusColumn(rows)
  
  if (!statusCol) return rows // No status column, return all
  
  // Pipeline signals: only open/active deals
  if (combined.includes("pipeline")) {
    return rows.filter(r => {
      const status = (r[statusCol] || "").toLowerCase()
      // Exclude closed-lost and disqualified
      return !status.includes("lost") && 
             !status.includes("disqualified") &&
             !status.includes("cancelled") &&
             !status.includes("canceled")
    })
  }
  
  // Win rate: need all closed deals (won + lost) to calculate ratio
  if (combined.includes("win rate") || combined.includes("conversion")) {
    return rows.filter(r => {
      const status = (r[statusCol] || "").toLowerCase()
      return status.includes("won") || status.includes("lost") || 
             status.includes("closed") || status.includes("converted") ||
             status.includes("disqualified")
    })
  }
  
  // Revenue/won signals: only closed-won
  if (combined.includes("revenue") || combined.includes("closed won") || combined.includes("bookings")) {
    return rows.filter(r => {
      const status = (r[statusCol] || "").toLowerCase()
      return status.includes("won") || status.includes("closed won") || status.includes("success")
    })
  }
  
  // Active customers/contacts
  if (combined.includes("active") || combined.includes("current customer")) {
    return rows.filter(r => {
      const status = (r[statusCol] || "").toLowerCase()
      return status.includes("active") || status.includes("customer") || status.includes("subscriber")
    })
  }
  
  return rows
}

// ============================================
// CALCULATION TYPE DETECTION
// ============================================

/**
 * Detect calculation type considering signal name AND tab context
 */
export function detectCalculationType(
  signalId: string,
  signalName: string,
  tabName?: string
): CalculationType {
  const combined = `${signalId} ${signalName}`.toLowerCase()
  const tab = (tabName || "").toLowerCase()

  // Rate-based (percentages, ratios)
  if (combined.includes("rate") || combined.includes("percentage") || 
      combined.includes("ratio") || combined.includes("conversion") ||
      combined.includes("win rate") || combined.includes("churn")) {
    return "rate"
  }

  // Count-based (number of entities)
  if (combined.includes("count") || combined.includes("volume") || 
      combined.includes("number of") || combined.includes("total contacts") ||
      combined.includes("total leads") || combined.includes("total tickets") ||
      combined.includes("new leads") || combined.includes("new contacts") ||
      combined.includes("open tickets") || combined.includes("backlog")) {
    return "count"
  }

  // Sum-based (monetary totals) - but only when it makes sense
  if (combined.includes("total revenue") || combined.includes("pipeline value") ||
      combined.includes("total pipeline") || combined.includes("bookings") ||
      combined.includes("deal value") || combined.includes("arr") ||
      combined.includes("mrr")) {
    return "sum"
  }

  // Average-based (scores, durations, per-entity metrics)
  if (combined.includes("average") || combined.includes("avg") || 
      combined.includes("mean") || combined.includes("score") ||
      combined.includes("rating") || combined.includes("nps") ||
      combined.includes("csat") || combined.includes("time") ||
      combined.includes("duration") || combined.includes("days") ||
      combined.includes("cycle") || combined.includes("response time") ||
      combined.includes("resolution time") || combined.includes("deal size")) {
    return "average"
  }

  // Latest value (snapshots)
  if (combined.includes("current") || combined.includes("latest") || 
      combined.includes("headcount") || combined.includes("balance")) {
    return "latest"
  }

  // Tab-based defaults
  if (tab.includes("deal")) {
    // Deals tab: if signal mentions amount/value, sum it; otherwise count
    if (combined.includes("amount") || combined.includes("value") || combined.includes("revenue")) {
      return "sum"
    }
    return "count"
  }
  
  if (tab.includes("contact") || tab.includes("company") || tab.includes("ticket")) {
    return "count"
  }

  return "average"
}

// ============================================
// TREND CALCULATION (DATE-BASED)
// ============================================

/**
 * Parse a date string into a Date object (handles multiple formats)
 */
function parseDate(value: string): Date | null {
  if (!value || value.trim() === "") return null
  
  const trimmed = value.trim()
  
  // Try native parse first
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990) {
    return parsed
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1])
    const month = parseInt(dmyMatch[2]) - 1
    const year = parseInt(dmyMatch[3]) + (parseInt(dmyMatch[3]) < 100 ? 2000 : 0)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }
  
  return null
}

/**
 * Calculate trend by comparing recent period vs previous period using actual dates
 */
export function calculateDateBasedTrend(
  rows: Record<string, string>[],
  valueColumn: string,
  calcType: CalculationType
): { trend: "up" | "down" | "stable"; percentage: number | null } {
  const dateCol = findDateColumn(rows)
  
  if (!dateCol) {
    // No date column - fall back to simple comparison if we have enough rows
    return calculateSimpleTrend(rows, valueColumn, calcType)
  }
  
  // Parse dates and pair with values
  const datedRows: { date: Date; value: number; row: Record<string, string> }[] = []
  
  for (const row of rows) {
    const date = parseDate(row[dateCol])
    if (!date) continue
    
    if (calcType === "count" || calcType === "rate") {
      // For counts/rates, each row is an entity - value is 1 (we count them)
      datedRows.push({ date, value: 1, row })
    } else {
      const value = parseFormattedNumber(row[valueColumn])
      if (value !== null) {
        datedRows.push({ date, value, row })
      }
    }
  }
  
  if (datedRows.length < 4) {
    return { trend: "stable", percentage: null }
  }
  
  // Sort by date
  datedRows.sort((a, b) => a.date.getTime() - b.date.getTime())
  
  // Find the midpoint date
  const newest = datedRows[datedRows.length - 1].date
  const oldest = datedRows[0].date
  const midDate = new Date((oldest.getTime() + newest.getTime()) / 2)
  
  const recentRows = datedRows.filter(r => r.date >= midDate)
  const olderRows = datedRows.filter(r => r.date < midDate)
  
  if (recentRows.length === 0 || olderRows.length === 0) {
    return { trend: "stable", percentage: null }
  }
  
  let recentMetric: number
  let olderMetric: number
  
  if (calcType === "count") {
    recentMetric = recentRows.length
    olderMetric = olderRows.length
  } else if (calcType === "sum") {
    recentMetric = recentRows.reduce((a, r) => a + r.value, 0)
    olderMetric = olderRows.reduce((a, r) => a + r.value, 0)
  } else if (calcType === "rate") {
    // For rates, need to recalculate within each period
    const statusCol = findStatusColumn(rows)
    if (statusCol) {
      const recentWon = recentRows.filter(r => {
        const s = (r.row[statusCol] || "").toLowerCase()
        return s.includes("won") || s.includes("converted") || s.includes("success")
      }).length
      const olderWon = olderRows.filter(r => {
        const s = (r.row[statusCol] || "").toLowerCase()
        return s.includes("won") || s.includes("converted") || s.includes("success")
      }).length
      recentMetric = recentRows.length > 0 ? (recentWon / recentRows.length) * 100 : 0
      olderMetric = olderRows.length > 0 ? (olderWon / olderRows.length) * 100 : 0
    } else {
      return { trend: "stable", percentage: null }
    }
  } else {
    // Average
    recentMetric = recentRows.reduce((a, r) => a + r.value, 0) / recentRows.length
    olderMetric = olderRows.reduce((a, r) => a + r.value, 0) / olderRows.length
  }
  
  if (olderMetric === 0) {
    return { trend: recentMetric > 0 ? "up" : "stable", percentage: null }
  }
  
  const changePercent = ((recentMetric - olderMetric) / Math.abs(olderMetric)) * 100
  
  if (changePercent > 5) {
    return { trend: "up", percentage: Math.round(changePercent * 10) / 10 }
  } else if (changePercent < -5) {
    return { trend: "down", percentage: Math.round(changePercent * 10) / 10 }
  }
  
  return { trend: "stable", percentage: Math.round(changePercent * 10) / 10 }
}

/**
 * Simple trend fallback when no date column exists
 */
function calculateSimpleTrend(
  rows: Record<string, string>[],
  valueColumn: string,
  calcType: CalculationType
): { trend: "up" | "down" | "stable"; percentage: number | null } {
  // Without dates, we can't determine a meaningful trend for entity data
  // Return stable with no percentage rather than a misleading trend
  return { trend: "stable", percentage: null }
}

// ============================================
// VALUE FORMATTING
// ============================================

export function formatSignalValue(
  value: number,
  calculationType: CalculationType,
  signalName: string
): string {
  const nameLower = signalName.toLowerCase()

  // Percentage/rate formatting
  if (calculationType === "rate" || nameLower.includes("rate") || 
      nameLower.includes("percentage") || nameLower.includes("%")) {
    return `${Math.round(value * 10) / 10}%`
  }

  // Currency formatting
  if (nameLower.includes("revenue") || nameLower.includes("pipeline") || 
      nameLower.includes("deal") || nameLower.includes("amount") ||
      nameLower.includes("arr") || nameLower.includes("mrr") ||
      nameLower.includes("cac") || nameLower.includes("ltv") ||
      nameLower.includes("bookings") || nameLower.includes("value")) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${Math.round(value).toLocaleString()}`
  }

  // Duration formatting
  if (nameLower.includes("days") || nameLower.includes("cycle")) {
    return `${Math.round(value * 10) / 10} days`
  }
  if (nameLower.includes("hours")) {
    return `${Math.round(value * 10) / 10} hrs`
  }

  // Score formatting
  if (nameLower.includes("nps") || nameLower.includes("score") || 
      nameLower.includes("csat") || nameLower.includes("rating")) {
    return `${Math.round(value * 10) / 10}`
  }

  // Large number formatting
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return `${Math.round(value * 100) / 100}`
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

// ============================================
// SPEC-DRIVEN HELPERS
// ============================================

/**
 * Resolve a normalized field name to an actual column name in the data.
 * Uses FIELD_ALIASES from discovery service + flexible matching.
 */
function resolveFieldToColumn(
  rows: Record<string, string>[],
  normalizedField: string
): string | null {
  if (!rows[0] || !normalizedField) return null
  const columns = Object.keys(rows[0])
  
  // Try direct name match first
  const direct = findColumn(rows, [normalizedField])
  if (direct) return direct
  
  // Try matching via normalization: normalize each column and see if it matches
  for (const col of columns) {
    const colNormalized = normalizeFieldName(col)
    if (colNormalized === normalizedField) return col
  }
  
  return null
}

/**
 * Pick the best tab using explicit sourceTab hints from calcSpec.
 */
function resolveTabFromSpec(
  tabs: Map<string, Record<string, string>[]>,
  sourceTabHints: string[]
): { tabName: string; rows: Record<string, string>[] } | null {
  // Try each hint in priority order
  for (const hint of sourceTabHints) {
    const hintLower = hint.toLowerCase()
    for (const [tabName, rows] of tabs) {
      if (tabName.toLowerCase().includes(hintLower) || hintLower.includes(tabName.toLowerCase())) {
        if (rows.length > 0) return { tabName, rows }
      }
    }
  }
  return null
}

/**
 * Apply RowFilter conditions to rows.
 */
function applySpecFilters(
  rows: Record<string, string>[],
  filters: RowFilter[]
): Record<string, string>[] {
  if (filters.length === 0) return rows
  
  return rows.filter(row => {
    return filters.every(filter => {
      const col = resolveFieldToColumn([row], filter.field)
      if (!col) return filter.op === "excludes" // If no column, excludes = pass
      
      const val = (row[col] || "").toLowerCase().trim()
      
      switch (filter.op) {
        case "includes":
          return filter.values.some(v => val.includes(v.toLowerCase()))
        case "excludes":
          return !filter.values.some(v => val.includes(v.toLowerCase()))
        case "equals":
          return filter.values.some(v => val === v.toLowerCase())
        case "not_empty":
          return val !== ""
        default:
          return true
      }
    })
  })
}

/**
 * Parse a date string into a Date object (handles multiple formats)
 */
function parseDateValue(value: string): Date | null {
  if (!value || value.trim() === "") return null
  const trimmed = value.trim()
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990) return parsed
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1])
    const month = parseInt(dmyMatch[2]) - 1
    const year = parseInt(dmyMatch[3]) + (parseInt(dmyMatch[3]) < 100 ? 2000 : 0)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }
  return null
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate a signal value from entity-based data (CRM rows).
 * 
 * If the signal has a `calcSpec`, the engine follows it precisely:
 *   1. Resolve tab from spec.sourceTab
 *   2. Resolve columns from spec fields (using FIELD_ALIASES)
 *   3. Apply spec.filters
 *   4. Verify required fields exist - skip if missing
 *   5. Execute spec.operation
 * 
 * If no calcSpec, falls back to the original heuristic approach.
 */
export function calculateSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[],
  tabs?: Map<string, Record<string, string>[]>
): CalculationResult | null {
  if (rows.length === 0) return null

  // ── SPEC-DRIVEN PATH ──
  if (signal.calcSpec) {
    return calculateSignalFromSpec(signal, signal.calcSpec, rows, matchedFields, tabs)
  }

  // ── LEGACY HEURISTIC PATH (for signals without calcSpec) ──
  return calculateSignalLegacy(signal, rows, matchedFields, tabs)
}

/**
 * Spec-driven calculation: follows the explicit calcSpec.
 */
function calculateSignalFromSpec(
  signal: SignalRequirement,
  spec: CalculationSpec,
  rows: Record<string, string>[],
  matchedFields: string[],
  tabs?: Map<string, Record<string, string>[]>
): CalculationResult | null {
  // Step 1: Resolve tab
  let workingRows = rows
  let tabName: string | null = null
  
  if (tabs && tabs.size > 0) {
    const resolved = resolveTabFromSpec(tabs, spec.sourceTab)
    if (resolved) {
      workingRows = resolved.rows
      tabName = resolved.tabName
    }
  }
  
  if (workingRows.length === 0) return null
  const totalRowCount = workingRows.length

  // Step 2: Resolve columns from spec
  const valueCol = spec.valueField ? resolveFieldToColumn(workingRows, spec.valueField) : null
  const dateCol = spec.dateField ? resolveFieldToColumn(workingRows, spec.dateField) : null
  const groupCol = spec.groupByField ? resolveFieldToColumn(workingRows, spec.groupByField) : null
  
  // Step 3: Validate required fields exist
  // If the operation needs a value column and we can't find it, skip
  if (spec.valueField && !valueCol && ["sum", "average", "latest"].includes(spec.operation)) {
    return null // Required field missing - don't produce incorrect value
  }
  if (spec.groupByField && !groupCol && spec.operation === "group_by") {
    return null
  }
  if (spec.dateField && !dateCol && ["monthly_rate", "duration_avg"].includes(spec.operation)) {
    return null
  }

  // Step 4: Apply spec filters
  const filteredRows = applySpecFilters(workingRows, spec.filters)
  const filteredRowCount = filteredRows.length
  
  if (filteredRows.length === 0 && spec.filters.length > 0) {
    // Filters produced zero rows - signal has no matching data
    // Return 0 rather than null so we show "0" not "missing"
  }

  // Step 5: Execute operation
  let value = 0
  let formula = ""
  let method = ""
  let description = ""
  let dataPointsUsed = 0
  const allValues: number[] = []
  const usedColumn = valueCol

  switch (spec.operation) {
    case "count": {
      value = filteredRows.length
      dataPointsUsed = filteredRows.length
      formula = `COUNT(rows${tabName ? ` in "${tabName}"` : ""})`
      method = "Count"
      description = `Counts ${filteredRows.length} records${filteredRowCount < totalRowCount ? ` (filtered from ${totalRowCount})` : ""}`
      break
    }

    case "sum": {
      for (const row of filteredRows) {
        const v = parseFormattedNumber(row[valueCol!])
        if (v !== null) { allValues.push(v); value += v }
      }
      dataPointsUsed = allValues.length
      formula = `SUM("${valueCol}")${filteredRowCount < totalRowCount ? ` [${filteredRowCount} of ${totalRowCount} rows]` : ""}`
      method = "Sum"
      description = `Sums ${dataPointsUsed} values from "${valueCol}"${filteredRowCount < totalRowCount ? `, filtered to ${filteredRowCount} relevant rows` : ""}`
      break
    }

    case "average": {
      for (const row of filteredRows) {
        const v = parseFormattedNumber(row[valueCol!])
        if (v !== null) allValues.push(v)
      }
      dataPointsUsed = allValues.length
      value = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0
      formula = `AVG("${valueCol}")`
      method = "Average"
      description = `Average of ${dataPointsUsed} values from "${valueCol}"`
      break
    }

    case "rate": {
      // Use spec.positiveStatuses to determine what counts as positive
      const statusCol = resolveFieldToColumn(filteredRows, "stage") || findStatusColumn(filteredRows)
      if (!statusCol) {
        value = 0
        formula = "No status column found"
        method = "Rate"
        description = "Could not calculate rate without a status column"
        break
      }
      const total = filteredRows.length
      const positiveValues = spec.positiveStatuses || ["won", "closed won", "converted", "success"]
      const positive = filteredRows.filter(r => {
        const status = (r[statusCol] || "").toLowerCase().trim()
        return positiveValues.some(p => status.includes(p.toLowerCase()))
      }).length
      value = total > 0 ? (positive / total) * 100 : 0
      dataPointsUsed = total
      formula = `(${positive} positive / ${total} total) x 100`
      method = "Rate"
      description = `${positive} positive outcomes out of ${total} total using "${statusCol}"`
      break
    }

    case "monthly_rate": {
      // Count entities, measure date range, divide by months
      if (!dateCol) { value = 0; break }
      const dates: Date[] = []
      for (const row of filteredRows) {
        const d = parseDateValue(row[dateCol])
        if (d) dates.push(d)
      }
      if (dates.length < 2) {
        value = filteredRows.length
        formula = `COUNT(rows) [insufficient date range]`
        method = "Monthly Rate"
        description = `Only ${dates.length} dated rows - returning total count`
        dataPointsUsed = filteredRows.length
        break
      }
      dates.sort((a, b) => a.getTime() - b.getTime())
      const oldest = dates[0]
      const newest = dates[dates.length - 1]
      const monthSpan = Math.max(1,
        (newest.getFullYear() - oldest.getFullYear()) * 12 + 
        (newest.getMonth() - oldest.getMonth()) + 1
      )
      value = Math.round((dates.length / monthSpan) * 10) / 10
      dataPointsUsed = dates.length
      formula = `${dates.length} entities / ${monthSpan} months`
      method = "Monthly Rate"
      description = `${dates.length} records over ${monthSpan} months (${oldest.toISOString().slice(0,10)} to ${newest.toISOString().slice(0,10)})`
      break
    }

    case "duration_avg": {
      // Average days between dateField (start) and valueField (end)
      if (!dateCol || !valueCol) { value = 0; break }
      const durations: number[] = []
      for (const row of filteredRows) {
        const startDate = parseDateValue(row[dateCol])
        const endDate = parseDateValue(row[valueCol])
        if (startDate && endDate) {
          const days = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          durations.push(days)
        }
      }
      if (durations.length === 0) { value = 0; break }
      value = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      dataPointsUsed = durations.length
      formula = `AVG(days between "${dateCol}" and "${valueCol}")`
      method = "Duration Average"
      description = `Average of ${durations.length} durations: ${value} days`
      break
    }

    case "group_by": {
      // Group by a field, return count per group. Value = total groups, detail in metadata.
      if (!groupCol) { value = 0; break }
      const groups: Record<string, number> = {}
      for (const row of filteredRows) {
        const key = (row[groupCol] || "").trim()
        if (key) groups[key] = (groups[key] || 0) + 1
      }
      const entries = Object.entries(groups).sort((a, b) => b[1] - a[1])
      value = entries.length // Number of distinct groups
      dataPointsUsed = filteredRows.length
      const topEntries = entries.slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(", ")
      formula = `GROUP_BY("${groupCol}") -> ${entries.length} groups`
      method = "Group By"
      description = `${entries.length} groups from ${filteredRows.length} rows. Top: ${topEntries}`
      break
    }

    case "count_unique": {
      const targetCol = valueCol || groupCol
      if (!targetCol) { value = filteredRows.length; break }
      const uniques = new Set<string>()
      for (const row of filteredRows) {
        const v = (row[targetCol] || "").trim()
        if (v) uniques.add(v.toLowerCase())
      }
      value = uniques.size
      dataPointsUsed = filteredRows.length
      formula = `COUNT_UNIQUE("${targetCol}")`
      method = "Count Unique"
      description = `${uniques.size} unique values in "${targetCol}"`
      break
    }

    case "latest": {
      if (!valueCol) { value = 0; break }
      let latestRow = filteredRows[filteredRows.length - 1]
      if (dateCol) {
        const sorted = [...filteredRows].sort((a, b) => {
          const dA = parseDateValue(a[dateCol])
          const dB = parseDateValue(b[dateCol])
          if (!dA || !dB) return 0
          return dA.getTime() - dB.getTime()
        })
        latestRow = sorted[sorted.length - 1]
      }
      const latestVal = parseFormattedNumber(latestRow?.[valueCol])
      value = latestVal ?? 0
      dataPointsUsed = 1
      formula = `LATEST("${valueCol}")`
      method = "Latest Value"
      description = `Most recent value from "${valueCol}"`
      break
    }

    default: {
      value = filteredRows.length
      dataPointsUsed = filteredRows.length
      formula = "COUNT(rows)"
      method = "Default Count"
      description = "Defaulted to counting rows"
    }
  }

  // Step 6: Map spec operation to our CalculationType for trend + formatting
  const calcTypeMap: Record<string, CalculationType> = {
    count: "count", sum: "sum", average: "average", rate: "rate",
    latest: "latest", count_unique: "count", monthly_rate: "count",
    duration_avg: "average", group_by: "count",
  }
  const calcType = calcTypeMap[spec.operation] || "count"

  // Step 7: Format value using spec.displayUnit
  const formattedValue = formatValueFromSpec(value, spec.displayUnit, signal.signalName)

  // Step 8: Calculate trend
  const trendCol = valueCol || dateCol
  const trendResult = trendCol
    ? calculateDateBasedTrend(filteredRows, trendCol, calcType)
    : { trend: "stable" as const, percentage: null }

  // Step 9: Build metadata
  const metadata: CalculationMetadata = {
    method,
    description,
    formula,
    example: `${method} applied to ${dataPointsUsed} data points${tabName ? ` from "${tabName}" tab` : ""}`,
    sourceColumn: usedColumn,
    dataPointsUsed,
    minValue: allValues.length > 0 ? Math.min(...allValues) : null,
    maxValue: allValues.length > 0 ? Math.max(...allValues) : null,
    sumValue: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) : null,
    avgValue: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null,
    tabName,
    filteredRowCount,
    totalRowCount,
  }

  return {
    value: Math.round(value * 100) / 100,
    formattedValue,
    dataPoints: dataPointsUsed || filteredRows.length,
    trend: trendResult.trend,
    trendPercentage: trendResult.percentage,
    calculationType: calcType,
    calculationMethod: method,
    formula,
    usedColumn,
    metadata,
  }
}

/**
 * Format value based on explicit displayUnit from calcSpec.
 */
function formatValueFromSpec(value: number, displayUnit: string, signalName: string): string {
  switch (displayUnit) {
    case "currency":
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${Math.round(value).toLocaleString()}`
    case "percent":
      return `${Math.round(value * 10) / 10}%`
    case "days":
      return `${Math.round(value * 10) / 10} days`
    case "hours":
      return `${Math.round(value * 10) / 10} hrs`
    case "score":
      return `${Math.round(value * 10) / 10}`
    case "ratio":
      return `${(value).toFixed(2)}x`
    case "count":
    default:
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return `${Math.round(value * 100) / 100}`
  }
}

/**
 * Legacy heuristic calculation (for signals without calcSpec).
 * Preserved to avoid breaking signals that haven't been updated yet.
 */
function calculateSignalLegacy(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[],
  tabs?: Map<string, Record<string, string>[]>
): CalculationResult | null {
  // Step 1: Pick the best tab if multi-tab data
  let workingRows = rows
  let tabName: string | null = null
  
  if (tabs && tabs.size > 1) {
    const best = findBestTab(tabs, signal.signalId, signal.signalName)
    if (best) {
      workingRows = best.rows
      tabName = best.tabName
    }
  }
  
  const totalRowCount = workingRows.length

  // Step 2: Filter rows by status/stage (e.g. only open deals for pipeline)
  const filteredRows = filterActiveRows(workingRows, signal.signalId, signal.signalName)
  const filteredRowCount = filteredRows.length

  // Step 3: Detect calculation type with tab context
  const calcType = detectCalculationType(signal.signalId, signal.signalName, tabName || undefined)
  
  // Step 4: Find the right column
  const valueCol = findValueColumn(filteredRows)
  const statusCol = findStatusColumn(filteredRows)
  const numericCol = findNumericColumn(filteredRows)
  
  let usedColumn: string | null = null
  for (const field of matchedFields) {
    const resolved = findColumn(filteredRows, [field])
    if (resolved && parseFormattedNumber(filteredRows[0]?.[resolved]) !== null) {
      usedColumn = resolved
      break
    }
  }
  if (!usedColumn) {
    usedColumn = valueCol || numericCol
  }

  // Step 5: Calculate the value
  let value = 0
  let formula = ""
  let method = ""
  let description = ""
  let dataPointsUsed = 0
  const allValues: number[] = []

  switch (calcType) {
    case "count": {
      value = filteredRows.length
      dataPointsUsed = filteredRows.length
      formula = `COUNT(rows${tabName ? ` in "${tabName}"` : ""})`
      method = "Count"
      description = `Counts ${filteredRows.length} records${filteredRowCount < totalRowCount ? ` (filtered from ${totalRowCount})` : ""}`
      break
    }

    case "sum": {
      if (!usedColumn) {
        value = 0; formula = "No numeric column found"; method = "Sum"
        description = "Could not find a numeric column to sum"; break
      }
      for (const row of filteredRows) {
        const v = parseFormattedNumber(row[usedColumn])
        if (v !== null) { allValues.push(v); value += v }
      }
      dataPointsUsed = allValues.length
      formula = `SUM("${usedColumn}")${filteredRowCount < totalRowCount ? ` [${filteredRowCount} of ${totalRowCount} rows]` : ""}`
      method = "Sum"
      description = `Sums ${dataPointsUsed} values from "${usedColumn}"${filteredRowCount < totalRowCount ? `, filtered to ${filteredRowCount} relevant rows` : ""}`
      break
    }

    case "average": {
      if (!usedColumn) {
        value = 0; formula = "No numeric column found"; method = "Average"
        description = "Could not find a numeric column to average"; break
      }
      for (const row of filteredRows) {
        const v = parseFormattedNumber(row[usedColumn])
        if (v !== null) allValues.push(v)
      }
      dataPointsUsed = allValues.length
      value = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0
      formula = `AVG("${usedColumn}")`
      method = "Average"
      description = `Average of ${dataPointsUsed} values from "${usedColumn}"`
      break
    }

    case "rate": {
      if (!statusCol) {
        if (usedColumn) {
          for (const row of filteredRows) {
            const v = parseFormattedNumber(row[usedColumn])
            if (v !== null) allValues.push(v)
          }
          value = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0
          dataPointsUsed = allValues.length
          formula = `AVG("${usedColumn}")`;  method = "Rate (from percentage column)"
          description = `Average of percentage values in "${usedColumn}"`
        } else {
          value = 0; formula = "No status or percentage column found"
          method = "Rate"; description = "Could not calculate rate without a status column"
        }
        break
      }
      const total = filteredRows.length
      const positive = filteredRows.filter(r => {
        const status = (r[statusCol] || "").toLowerCase()
        return status.includes("won") || status.includes("converted") ||
               status.includes("closed won") || status.includes("success") ||
               status.includes("complete") || status.includes("yes") ||
               status.includes("active") || status.includes("resolved")
      }).length
      value = total > 0 ? (positive / total) * 100 : 0
      dataPointsUsed = total
      formula = `(${positive} positive / ${total} total) x 100`
      method = "Rate"
      description = `${positive} positive outcomes out of ${total} total using "${statusCol}" column`
      break
    }

    case "latest": {
      if (!usedColumn) {
        value = 0; formula = "No numeric column found"; method = "Latest"
        description = "Could not find a column for latest value"; break
      }
      const dateCol = findDateColumn(filteredRows)
      let latestRow = filteredRows[filteredRows.length - 1]
      if (dateCol) {
        const sortedByDate = [...filteredRows].sort((a, b) => {
          const dateA = parseDate(a[dateCol]); const dateB = parseDate(b[dateCol])
          if (!dateA || !dateB) return 0; return dateA.getTime() - dateB.getTime()
        })
        latestRow = sortedByDate[sortedByDate.length - 1]
      }
      const latestVal = parseFormattedNumber(latestRow?.[usedColumn])
      value = latestVal ?? 0
      dataPointsUsed = 1
      formula = `LATEST("${usedColumn}")`;  method = "Latest Value"
      description = `Most recent value from "${usedColumn}"`
      break
    }

    default: {
      value = filteredRows.length; dataPointsUsed = filteredRows.length
      formula = "COUNT(rows)"; method = "Default Count"
      description = "Defaulted to counting rows"
    }
  }

  const trendResult = usedColumn 
    ? calculateDateBasedTrend(filteredRows, usedColumn, calcType)
    : { trend: "stable" as const, percentage: null }

  const metadata: CalculationMetadata = {
    method, description, formula,
    example: `${method} applied to ${dataPointsUsed} data points${tabName ? ` from "${tabName}" tab` : ""}`,
    sourceColumn: usedColumn, dataPointsUsed,
    minValue: allValues.length > 0 ? Math.min(...allValues) : null,
    maxValue: allValues.length > 0 ? Math.max(...allValues) : null,
    sumValue: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) : null,
    avgValue: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null,
    tabName, filteredRowCount, totalRowCount,
  }

  return {
    value: Math.round(value * 100) / 100,
    formattedValue: formatSignalValue(value, calcType, signal.signalName),
    dataPoints: dataPointsUsed || filteredRows.length,
    trend: trendResult.trend, trendPercentage: trendResult.percentage,
    calculationType: calcType, calculationMethod: method,
    formula, usedColumn, metadata,
  }
}

/**
 * Calculate multiple signals in batch (with optional tab-aware processing)
 */
export function calculateSignals(
  signals: Array<{ signal: SignalRequirement; matchedFields: string[] }>,
  rows: Record<string, string>[],
  tabs?: Map<string, Record<string, string>[]>
): Map<string, CalculationResult | null> {
  const results = new Map<string, CalculationResult | null>()

  for (const { signal, matchedFields } of signals) {
    const result = calculateSignal(signal, rows, matchedFields, tabs)
    results.set(signal.signalId, result)
  }

  return results
}
