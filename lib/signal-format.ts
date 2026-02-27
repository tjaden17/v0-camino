/**
 * Canonical display formatting for signals (ticker-style UI).
 * Value format by type: currency → $X/$XK/$XM; rate → X%; count → X or X/mo; time → X hrs/days.
 */

import type { SignalWithData } from "@/lib/signals-service"

type OperationHint = string | undefined

/**
 * Format the canonical value for display (ticker style).
 * currency → $X / $XK / $XM; rate → X%; count → X or X/mo; time → X hrs/days.
 */
export function formatCanonicalValue(signal: SignalWithData): string {
  const raw = signal.latest_value ?? (signal.absolute_value ? parseFloat(signal.absolute_value) : null)
  if (raw === null || Number.isNaN(raw)) return "—"

  const type = inferValueType(signal)

  const nameLower = (signal.name || "").toLowerCase()
  const isSalesCycleDays = nameLower.includes("sales cycle") || (nameLower.includes("cycle") && nameLower.includes("avg"))

  switch (type) {
    case "currency":
      if (Math.abs(raw) >= 1_000_000) return `$${(raw / 1_000_000).toFixed(1)}M`
      if (Math.abs(raw) >= 1_000) return `$${(raw / 1_000).toFixed(1)}K`
      return `$${Math.round(raw).toLocaleString()}`
    case "rate":
      return `${Math.round(raw * 10) / 10}%`
    case "count_per_month":
      return `${Math.round(raw * 10) / 10}/mo`
    case "time":
      // Avg Sales Cycle (and similar) store value in days — show as Xd
      if (isSalesCycleDays) return `${Math.round(raw)}d`
      if (Math.abs(raw) >= 24) return `${Math.round(raw / 24)}d`
      return `${Math.round(raw * 10) / 10}h`
    case "count":
    default:
      if (Math.abs(raw) >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)}M`
      if (Math.abs(raw) >= 1_000) return `${(raw / 1_000).toFixed(1)}K`
      return Math.round(raw).toLocaleString()
  }
}

/** Format trend percent for ticker: +X.X% / -X.X% / 0% */
export function formatTrendPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return "—"
  const rounded = Math.round(pct * 10) / 10
  if (rounded === 0) return "0%"
  return `${rounded > 0 ? "+" : ""}${rounded}%`
}

export type ValueType = "currency" | "rate" | "count" | "count_per_month" | "time"

/** Infer value type for display (exported for trend formatting). */
export function inferValueType(signal: SignalWithData): ValueType {
  const op = signal.source_metadata?.operation as OperationHint
  const name = (signal.name || "").toLowerCase()
  const category = (signal.category || "").toLowerCase()

  if (op === "rate_yes_no" || op === "rate") return "rate"
  if (op === "sum_per_month" || op === "monthly_rate") {
    if (op === "monthly_rate") return "count_per_month"
    return "currency"
  }
  if (op === "count_per_month") return "count_per_month"

  // Avg Sales Cycle (and similar) are in days, not currency
  if (name.includes("sales cycle") || (name.includes("avg") && name.includes("cycle")))
    return "time"

  if (
    name.includes("revenue") ||
    name.includes("pipeline") ||
    name.includes("deal size") ||
    name.includes("amount") ||
    category === "sales"
  ) {
    if (name.includes("rate") || name.includes("win rate")) return "rate"
    return "currency"
  }
  if (
    name.includes("win rate") ||
    name.includes("conversion") ||
    name.includes("csat") ||
    name.includes("nps") ||
    name.includes("churn")
  )
    return "rate"
  if (
    name.includes("resolution time") ||
    name.includes("response time") ||
    name.includes("cycle") ||
    name.includes("hours") ||
    name.includes("days")
  )
    return "time"
  if (name.includes("volume") || name.includes("ticket") || name.includes("count"))
    return "count_per_month"

  return "count"
}

/** Format absolute trend delta for ticker: +$50K, +5, -2.5h, +5 pp (rate). */
export function formatTrendAbsolute(
  signal: SignalWithData,
  delta: number | null | undefined
): string {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return "—"
  const type = inferValueType(signal)
  const nameLower = (signal.name || "").toLowerCase()
  const isSalesCycleDays = nameLower.includes("sales cycle") || (nameLower.includes("cycle") && nameLower.includes("avg"))

  switch (type) {
    case "currency":
      if (Math.abs(delta) >= 1_000_000) return `${delta >= 0 ? "+" : ""}$${(delta / 1_000_000).toFixed(1)}M`
      if (Math.abs(delta) >= 1_000) return `${delta >= 0 ? "+" : ""}$${(delta / 1_000).toFixed(1)}K`
      return `${delta >= 0 ? "+" : ""}$${Math.round(delta).toLocaleString()}`
    case "rate":
      // Absolute change for rates = percentage points
      const pp = Math.round(delta * 10) / 10
      if (pp === 0) return "0 pp"
      return `${pp > 0 ? "+" : ""}${pp} pp`
    case "count_per_month":
    case "count":
      const n = Math.round(delta)
      if (n === 0) return "0"
      return `${n > 0 ? "+" : ""}${n}`
    case "time":
      if (isSalesCycleDays) {
        const d = Math.round(delta)
        return d === 0 ? "0d" : `${d > 0 ? "+" : ""}${d}d`
      }
      if (Math.abs(delta) >= 24) {
        const d = Math.round(delta / 24)
        return d === 0 ? "0d" : `${d > 0 ? "+" : ""}${d}d`
      }
      const h = Math.round(delta * 10) / 10
      return h === 0 ? "0h" : `${h > 0 ? "+" : ""}${h}h`
    default:
      return `${delta >= 0 ? "+" : ""}${Math.round(delta * 100) / 100}`
  }
}
