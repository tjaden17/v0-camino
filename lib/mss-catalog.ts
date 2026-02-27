/**
 * MSS 7-Signal Catalog (LOCKED)
 * Source: docs/MSS_BUILD_PLAN_LOCKED.md, docs/SIGNAL_CATEGORIES_AND_CALCULATIONS.md
 * Single source of truth for the 7 signals: id, name, category, source type, required columns, formula id.
 */

export type CatalogSourceType = "deals" | "leads" | "tickets"

/** Role from MSS User-Signal Mapping: CEO sees 1-4, CS Manager 5-6, Ops Manager 5+7 */
export type CatalogRole = "CEO" | "CS Manager" | "Ops Manager"

export interface MssCatalogSignal {
  id: string
  name: string
  category: string
  sourceType: CatalogSourceType
  /** Column names required to compute this signal (strict: normalized match to CSV headers). */
  requiredColumns: string[]
  /** Optional columns for time series or display (e.g. Closing Date for Win Rate by month). */
  optionalColumns?: string[]
  /** Formula identifier used by catalog-calculations. */
  formulaId:
    | "pipeline_value"
    | "win_rate"
    | "closed_revenue"
    | "avg_sales_cycle"
    | "ticket_volume"
    | "avg_resolution_time"
    | "lead_conversion_rate"
  /** Roles that see this signal (MSS mapping). */
  roles: CatalogRole[]
}

/** Row types from upload flow that map to catalog source types. */
export const ROW_TYPE_TO_SOURCE: Record<string, CatalogSourceType> = {
  deals: "deals",
  opportunities: "deals",
  leads: "leads",
  tickets: "tickets",
}

const CATALOG: MssCatalogSignal[] = [
  {
    id: "pipeline_value",
    name: "Monthly Pipeline",
    category: "Sales",
    sourceType: "deals",
    requiredColumns: ["Amount", "Stage", "Closing Date"],
    optionalColumns: [],
    formulaId: "pipeline_value",
    roles: ["CEO"],
  },
  {
    id: "win_rate",
    name: "Win Rate",
    category: "Sales",
    sourceType: "deals",
    requiredColumns: ["Stage"],
    optionalColumns: ["Closing Date"],
    formulaId: "win_rate",
    roles: ["CEO"],
  },
  {
    id: "closed_revenue",
    name: "Closed Revenue",
    category: "Sales",
    sourceType: "deals",
    requiredColumns: ["Amount", "Stage"],
    optionalColumns: ["Closing Date"],
    formulaId: "closed_revenue",
    roles: ["CEO"],
  },
  {
    id: "avg_sales_cycle",
    name: "Avg Sales Cycle",
    category: "Sales",
    sourceType: "deals",
    requiredColumns: ["Stage", "Sales Cycle Duration"],
    optionalColumns: ["Closing Date"],
    formulaId: "avg_sales_cycle",
    roles: ["CEO"],
  },
  {
    id: "ticket_volume",
    name: "Ticket Volume",
    category: "Support",
    sourceType: "tickets",
    requiredColumns: ["Subject"],
    optionalColumns: ["Created Time"],
    formulaId: "ticket_volume",
    roles: ["CS Manager", "Ops Manager"],
  },
  {
    id: "avg_resolution_time",
    name: "Avg Resolution Time",
    category: "Support",
    sourceType: "tickets",
    requiredColumns: ["Subject", "Status", "Resolution Time in Business Hours"],
    optionalColumns: ["Created Time"],
    formulaId: "avg_resolution_time",
    roles: ["CS Manager"],
  },
  {
    id: "lead_conversion_rate",
    name: "Lead Conversion Rate",
    category: "Customer Success",
    sourceType: "leads",
    requiredColumns: ["Is Converted"],
    optionalColumns: ["Created Time"],
    formulaId: "lead_conversion_rate",
    roles: ["Ops Manager"],
  },
]

export const MSS_CATALOG_SIGNALS = CATALOG

/** Stable list of catalog signal names (for filtering "other" signals). */
export const MSS_CATALOG_SIGNAL_NAMES = CATALOG.map((s) => s.name)

/** Get catalog signals visible for a given profile role. executive -> CEO, manager -> all (CS + Ops). */
export function getCatalogSignalsForRole(role: string | null | undefined): MssCatalogSignal[] {
  const normalized = (role || "").toLowerCase().trim()
  if (normalized === "executive") return CATALOG.filter((s) => s.roles.includes("CEO"))
  return CATALOG
}

/** Check if a column list has all required columns for a catalog signal (case-insensitive match). */
export function hasRequiredColumns(columns: string[], signal: MssCatalogSignal): { ok: boolean; missing: string[] } {
  const lower = columns.map((c) => c.trim().toLowerCase())
  const missing: string[] = []
  for (const req of signal.requiredColumns) {
    const reqLower = req.trim().toLowerCase()
    if (!lower.some((c) => c === reqLower)) missing.push(req)
  }
  return { ok: missing.length === 0, missing }
}

/** Find first column that matches one of the allowed names (case-insensitive). */
export function findColumn(columns: string[], ...names: string[]): string | null {
  const nLower = names.map((n) => n.trim().toLowerCase())
  for (const col of columns) {
    const c = col.trim().toLowerCase()
    if (nLower.includes(c)) return col
  }
  return null
}
