export type DateRange = "7days" | "30days" | "quarter"

export interface DateRangeConfig {
  label: string
  days: number
  description: string
}

export const dateRangeConfigs: Record<DateRange, DateRangeConfig> = {
  "7days": {
    label: "7 days",
    days: 7,
    description: "Last 7 days",
  },
  "30days": {
    label: "30 days",
    days: 30,
    description: "Last 30 days",
  },
  quarter: {
    label: "Quarter",
    days: 90,
    description: "Last quarter (90 days)",
  },
}

// Helper function to adjust metric values based on date range
// In a real app, this would fetch different data from the API
// For now, we'll simulate adjusted values based on the range
export function getAdjustedTrendValue(baseValue: string, dateRange: DateRange): string {
  // Extract numeric value from string like "+12%", "-5%", "3.2x"
  const match = baseValue.match(/([+-]?\d+\.?\d*)([%x])?/)
  if (!match) return baseValue

  const [, numStr, suffix] = match
  const num = Number.parseFloat(numStr)

  // Adjust based on date range (simulated)
  let adjustedNum = num
  switch (dateRange) {
    case "7days":
      adjustedNum = num * 0.8 // Smaller changes over shorter period
      break
    case "30days":
      adjustedNum = num // Base value
      break
    case "quarter":
      adjustedNum = num * 1.5 // Larger accumulated changes
      break
  }

  const sign = adjustedNum > 0 ? "+" : ""
  return `${sign}${adjustedNum.toFixed(suffix === "x" ? 1 : 0)}${suffix || ""}`
}

export function getTimeframeLabel(dateRange: DateRange): string {
  return `vs. ${dateRangeConfigs[dateRange].description.toLowerCase()}`
}
