/**
 * Signal Calculation Service
 * 
 * Centralized service for calculating signal values from uploaded data.
 * Handles column mapping, calculation types, trend analysis, and metadata.
 */

import { parseFormattedNumber } from "./csv-parser"
import type { SignalRequirement } from "./signal-discovery-service"

// ============================================
// TYPES
// ============================================

export type CalculationType = "count" | "sum" | "average" | "rate" | "latest" | "median" | "custom"

export interface CalculationResult {
  value: number
  formattedValue: string
  dataPoints: number
  trend: "up" | "down" | "stable"  // Must match database constraint
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
}

export interface ColumnMapping {
  canonicalName: string
  actualColumnName: string
  dataType: "number" | "string" | "date" | "boolean"
}

// ============================================
// COLUMN RESOLUTION
// ============================================

/**
 * Find the actual column name in rows that matches a canonical field name
 */
export function resolveColumnName(
  rows: Record<string, string>[],
  canonicalFieldName: string
): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])

  // Direct match
  if (columns.includes(canonicalFieldName)) return canonicalFieldName

  // Normalize and compare
  const normalizedTarget = canonicalFieldName.toLowerCase().replace(/[_\s-]+/g, "")
  
  for (const col of columns) {
    const normalizedCol = col.toLowerCase().replace(/[_\s-]+/g, "")
    
    // Exact normalized match
    if (normalizedCol === normalizedTarget) return col
    
    // Partial match (one contains the other)
    if (normalizedCol.includes(normalizedTarget) || normalizedTarget.includes(normalizedCol)) {
      return col
    }
  }
  
  return null
}

/**
 * Find a numeric column from rows (first one found)
 */
export function findNumericColumn(rows: Record<string, string>[]): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])

  for (const col of columns) {
    // Check multiple rows to ensure it's actually numeric
    let numericCount = 0
    const samplesToCheck = Math.min(5, rows.length)
    
    for (let i = 0; i < samplesToCheck; i++) {
      if (parseFormattedNumber(rows[i]?.[col]) !== null) {
        numericCount++
      }
    }
    
    // If more than half the samples are numeric, consider it a numeric column
    if (numericCount > samplesToCheck / 2) {
      return col
    }
  }
  
  return null
}

/**
 * Find a column by pattern matching column names
 */
export function findColumnByPattern(
  rows: Record<string, string>[],
  patterns: string[]
): string | null {
  if (!rows[0]) return null
  const columns = Object.keys(rows[0])

  for (const col of columns) {
    const colLower = col.toLowerCase()
    for (const pattern of patterns) {
      if (colLower.includes(pattern.toLowerCase())) {
        return col
      }
    }
  }
  
  return null
}

/**
 * Build column mappings from canonical field names to actual column names
 */
export function buildColumnMappings(
  rows: Record<string, string>[],
  matchedFields: string[]
): ColumnMapping[] {
  const mappings: ColumnMapping[] = []

  for (const canonicalName of matchedFields) {
    const actualColumnName = resolveColumnName(rows, canonicalName)
    if (actualColumnName) {
      // Detect data type
      const sampleValue = rows[0]?.[actualColumnName]
      let dataType: ColumnMapping["dataType"] = "string"
      
      if (parseFormattedNumber(sampleValue) !== null) {
        dataType = "number"
      } else if (!isNaN(Date.parse(sampleValue))) {
        dataType = "date"
      } else if (["true", "false", "yes", "no"].includes(sampleValue?.toLowerCase())) {
        dataType = "boolean"
      }

      mappings.push({ canonicalName, actualColumnName, dataType })
    }
  }

  return mappings
}

// ============================================
// CALCULATION TYPE DETECTION
// ============================================

/**
 * Detect the appropriate calculation type based on signal properties
 */
export function detectCalculationType(
  signalId: string,
  signalName: string
): CalculationType {
  const idLower = signalId.toLowerCase()
  const nameLower = signalName.toLowerCase()
  const combined = `${idLower} ${nameLower}`

  // Rate-based (percentages)
  if (combined.includes("rate") || combined.includes("percentage") || 
      combined.includes("ratio") || combined.includes("conversion")) {
    return "rate"
  }

  // Sum-based (totals, revenue, pipeline)
  if (combined.includes("total") || combined.includes("pipeline") || 
      combined.includes("revenue") || combined.includes("sum") ||
      combined.includes("deal") || combined.includes("amount")) {
    return "sum"
  }

  // Count-based
  if (combined.includes("count") || combined.includes("volume") || 
      combined.includes("number of") || combined.includes("tickets") ||
      combined.includes("leads") || combined.includes("opportunities")) {
    return "count"
  }

  // Average-based (scores, ratings, durations)
  if (combined.includes("average") || combined.includes("avg") || 
      combined.includes("mean") || combined.includes("score") ||
      combined.includes("rating") || combined.includes("nps") ||
      combined.includes("csat") || combined.includes("time") ||
      combined.includes("duration") || combined.includes("days")) {
    return "average"
  }

  // Latest value (snapshots)
  if (combined.includes("current") || combined.includes("latest") || 
      combined.includes("mrr") || combined.includes("arr") ||
      combined.includes("headcount")) {
    return "latest"
  }

  // Default to average for most metrics
  return "average"
}

// ============================================
// TREND CALCULATION
// ============================================

/**
 * Calculate trend from a series of values (ordered oldest to newest)
 */
export function calculateTrend(
  values: number[]
  ): { trend: "up" | "down" | "stable"; percentage: number | null } {
  if (values.length < 2) {
  return { trend: "stable", percentage: null }
  }
  
  // Compare first half average to second half average
  const midpoint = Math.floor(values.length / 2)
  const firstHalf = values.slice(0, midpoint)
  const secondHalf = values.slice(midpoint)
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  if (firstAvg === 0) {
  return { trend: secondAvg > 0 ? "up" : "stable", percentage: null }
  }
  
  const changePercent = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100

  // Threshold: >5% change is significant
  if (changePercent > 5) {
    return { trend: "up", percentage: Math.round(changePercent * 10) / 10 }
  } else if (changePercent < -5) {
    return { trend: "down", percentage: Math.round(changePercent * 10) / 10 }
  }

  return { trend: "stable", percentage: Math.round(changePercent * 10) / 10 }
}

// ============================================
// VALUE FORMATTING
// ============================================

/**
 * Format a signal value based on its calculation type and magnitude
 */
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
      nameLower.includes("cac") || nameLower.includes("ltv")) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${Math.round(value).toLocaleString()}`
  }

  // Duration formatting (days/hours)
  if (nameLower.includes("days")) {
    return `${Math.round(value * 10) / 10} days`
  }
  if (nameLower.includes("hours")) {
    return `${Math.round(value * 10) / 10} hrs`
  }

  // Score formatting
  if (nameLower.includes("nps")) {
    return `${Math.round(value)}`
  }
  if (nameLower.includes("score") || nameLower.includes("csat") || 
      nameLower.includes("rating")) {
    return `${Math.round(value * 10) / 10}`
  }

  // Large number formatting
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  // Default: round to 2 decimal places
  return `${Math.round(value * 100) / 100}`
}

// ============================================
// CALCULATION METHODS
// ============================================

function calculateCount(
  rows: Record<string, string>[],
  column: string | null
): { value: number; values: number[] } {
  if (column) {
    // Sum numeric values
    const values = rows
      .map(r => parseFormattedNumber(r[column]))
      .filter((v): v is number => v !== null)
    const sum = values.reduce((a, b) => a + b, 0)
    return { value: sum || rows.length, values }
  }
  return { value: rows.length, values: [rows.length] }
}

function calculateSum(
  rows: Record<string, string>[],
  column: string | null
): { value: number; values: number[] } {
  if (!column) return { value: 0, values: [] }
  
  const values = rows
    .map(r => parseFormattedNumber(r[column]))
    .filter((v): v is number => v !== null)
  
  const sum = values.reduce((a, b) => a + b, 0)
  return { value: sum, values }
}

function calculateAverage(
  rows: Record<string, string>[],
  column: string | null
): { value: number; values: number[] } {
  if (!column) return { value: 0, values: [] }
  
  const values = rows
    .map(r => parseFormattedNumber(r[column]))
    .filter((v): v is number => v !== null)
  
  if (values.length === 0) return { value: 0, values: [] }
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return { value: avg, values }
}

function calculateRate(
  rows: Record<string, string>[],
  statusColumn: string | null,
  numericColumn: string | null
): { value: number; values: number[] } {
  // If we have a status column, calculate success rate
  if (statusColumn) {
    const total = rows.length
    const positive = rows.filter(r => {
      const status = r[statusColumn]?.toLowerCase() || ""
      return status.includes("won") || status.includes("converted") ||
             status.includes("closed") || status.includes("success") ||
             status.includes("complete") || status.includes("yes") ||
             status.includes("active")
    }).length

    if (total > 0) {
      return { value: (positive / total) * 100, values: [positive, total] }
    }
  }

  // If we have a numeric column, average it (assuming it's already a rate)
  if (numericColumn) {
    const values = rows
      .map(r => parseFormattedNumber(r[numericColumn]))
      .filter((v): v is number => v !== null)
    
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return { value: avg, values }
    }
  }

  return { value: 0, values: [] }
}

function calculateLatest(
  rows: Record<string, string>[],
  column: string | null
): { value: number; values: number[] } {
  if (!column) return { value: 0, values: [] }
  
  const values = rows
    .map(r => parseFormattedNumber(r[column]))
    .filter((v): v is number => v !== null)
  
  if (values.length === 0) return { value: 0, values: [] }
  
  // Return the last value (assuming rows are chronologically ordered)
  return { value: values[values.length - 1], values }
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate signal value with full metadata for debugging and display
 */
export function calculateSignal(
  signal: SignalRequirement,
  rows: Record<string, string>[],
  matchedFields: string[]
): CalculationResult | null {
  if (rows.length === 0) return null

  // Build column mappings
  const mappings = buildColumnMappings(rows, matchedFields)
  
  // Detect calculation type
  const calcType = detectCalculationType(signal.signalId, signal.signalName)
  
  // Find relevant columns
  const allColumns = Object.keys(rows[0] || {})
  
  // Find numeric column from mappings or any numeric column
  const numericMapping = mappings.find(m => m.dataType === "number")
  const numericColumn = numericMapping?.actualColumnName || findNumericColumn(rows)
  
  // Find status column for rate calculations
  const statusColumn = findColumnByPattern(rows, ["status", "stage", "outcome", "result", "state"])
  
  // Find value column for sum calculations
  const valueColumn = findColumnByPattern(rows, ["amount", "value", "revenue", "price", "total", "deal"])
  
  let result: { value: number; values: number[] }
  let usedColumn: string | null = null
  let formula: string
  let method: string
  let description: string
  let example: string

  switch (calcType) {
    case "count":
      usedColumn = numericColumn
      result = calculateCount(rows, numericColumn)
      formula = numericColumn ? `SUM(${numericColumn})` : "COUNT(rows)"
      method = "Count/Sum"
      description = "Counts total records or sums numeric values"
      example = numericColumn 
        ? `All values in "${numericColumn}" are summed together`
        : "All matching rows are counted"
      break

    case "sum":
      usedColumn = valueColumn || numericColumn
      result = calculateSum(rows, usedColumn)
      formula = usedColumn ? `SUM(${usedColumn})` : "N/A"
      method = "Sum (Total)"
      description = "Adds up all values in the specified column"
      example = usedColumn 
        ? `All values in "${usedColumn}" column are added together`
        : "No numeric column found for summing"
      break

    case "average":
      usedColumn = numericColumn
      result = calculateAverage(rows, numericColumn)
      formula = numericColumn ? `AVG(${numericColumn})` : "N/A"
      method = "Average (Mean)"
      description = "Calculates the arithmetic mean of all values"
      example = numericColumn
        ? `Sum of "${numericColumn}" divided by count of values`
        : "No numeric column found for averaging"
      break

    case "rate":
      usedColumn = statusColumn || numericColumn
      result = calculateRate(rows, statusColumn, numericColumn)
      formula = statusColumn 
        ? `(Positive outcomes / Total) × 100`
        : numericColumn ? `AVG(${numericColumn})` : "N/A"
      method = "Rate/Percentage"
      description = statusColumn
        ? "Calculates percentage of positive outcomes"
        : "Averages percentage values from data"
      example = statusColumn
        ? `Records with status won/converted/closed divided by total records`
        : `Average of values in "${numericColumn}" column`
      break

    case "latest":
      usedColumn = numericColumn
      result = calculateLatest(rows, numericColumn)
      formula = numericColumn ? `LAST(${numericColumn})` : "N/A"
      method = "Latest Value"
      description = "Returns the most recent value from the data"
      example = numericColumn
        ? `Most recent value from "${numericColumn}" column`
        : "No numeric column found"
      break

    default:
      usedColumn = numericColumn
      result = calculateAverage(rows, numericColumn)
      formula = numericColumn ? `AVG(${numericColumn})` : "COUNT(rows)"
      method = "Default (Average)"
      description = "Falls back to averaging numeric values"
      example = "System default calculation method"
  }

  // Calculate trend from values
  const { trend, percentage: trendPercentage } = calculateTrend(result.values)

  // Build metadata
  const values = result.values
  const metadata: CalculationMetadata = {
    method,
    description,
    formula,
    example,
    sourceColumn: usedColumn,
    dataPointsUsed: values.length || rows.length,
    minValue: values.length > 0 ? Math.min(...values) : null,
    maxValue: values.length > 0 ? Math.max(...values) : null,
    sumValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) : null,
    avgValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null,
  }

  return {
    value: Math.round(result.value * 100) / 100,
    formattedValue: formatSignalValue(result.value, calcType, signal.signalName),
    dataPoints: values.length || rows.length,
    trend,
    trendPercentage,
    calculationType: calcType,
    calculationMethod: method,
    formula,
    usedColumn,
    metadata,
  }
}

/**
 * Calculate multiple signals in batch
 */
export function calculateSignals(
  signals: Array<{ signal: SignalRequirement; matchedFields: string[] }>,
  rows: Record<string, string>[]
): Map<string, CalculationResult | null> {
  const results = new Map<string, CalculationResult | null>()

  for (const { signal, matchedFields } of signals) {
    const result = calculateSignal(signal, rows, matchedFields)
    results.set(signal.signalId, result)
  }

  return results
}
