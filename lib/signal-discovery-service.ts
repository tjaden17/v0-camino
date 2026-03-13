// Intelligent signal discovery - analyzes uploaded data and determines which signals are available
// Week 1 MSS: Cut from 93 to 20 core signals. Every signal has explicit calcSpec.

import type { ParsedCSVRow } from "./csv-parser"
import { getWeek1CoreSignals } from "./signal-definitions-week1"

/**
 * Explicit calculation specification - tells the calc engine
 * exactly how to compute this signal from the raw data.
 */
export interface CalculationSpec {
  /** Which tab(s) to source data from (in priority order). Matched case-insensitively. */
  sourceTab: string[]
  
  /** The aggregation to perform: count rows, sum a column, average a column, etc. */
  operation: "count" | "sum" | "average" | "rate" | "latest" | "count_unique" | "duration_avg" | "monthly_rate" | "group_by"
  
  /** Which normalized field to aggregate (e.g. "deal_value"). Null for count operations. */
  valueField: string | null
  
  /** Which normalized field to use for date-range / time-series / trend. */
  dateField: string | null
  
  /** 
   * Row filter: only include rows matching these conditions (AND logic).
   * Each filter is { field, operator, values }.
   * Example: { field: "stage", op: "includes", values: ["closed won"] }
   */
  filters: RowFilter[]
  
  /** For rate calculations: what counts as "positive" in the status column. */
  positiveStatuses?: string[]
  
  /** For group_by: which field to group on. */
  groupByField?: string
  
  /** For monthly_rate: divide total count by number of months in date range. */
  rateUnit?: "month" | "week" | "day"
  
  /** Unit for display formatting: "currency", "percent", "days", "count", "score" */
  displayUnit: "currency" | "percent" | "days" | "hours" | "count" | "score" | "ratio"
}

export interface RowFilter {
  field: string
  op: "includes" | "excludes" | "equals" | "not_empty"
  values: string[]
}

export interface SignalRequirement {
  signalId: string
  signalName: string
  description: string
  category: string
  valuableFor: string[]
  businessStage: string[]
  requiredFields: DataField[]
  optionalFields: DataField[]
  calculationType: "direct" | "calculated" | "aggregated" | "time-series"
  /** Explicit calculation instructions. When present, the calc engine follows this spec
   *  instead of guessing from signal name heuristics. */
  calcSpec?: CalculationSpec
}

export interface DataField {
  name: string
  type: "string" | "number" | "date" | "boolean"
  description: string
  examples: string[]
}

export interface DiscoveredSignal {
  signal: SignalRequirement
  availability: "available" | "partial" | "unavailable"
  matchScore: number // 0-100
  matchedFields: string[]
  missingFields: string[]
  reason: string
}

export interface SignalDiscoveryResult {
  dataSource: string
  totalRowsAnalyzed: number
  detectedColumns: DetectedColumn[]
  availableSignals: DiscoveredSignal[]
  partialSignals: DiscoveredSignal[]
  unavailableSignals: DiscoveredSignal[]
  recommendations: string[]
}

export interface DetectedColumn {
  name: string
  inferredType: "string" | "number" | "date" | "boolean" | "unknown"
  sampleValues: string[]
  nullCount: number
  uniqueCount: number
  confidence: number // 0-1
}

// ============================================
// SIGNAL DEFINITIONS (Week 1 Core Signals)
// ============================================

/**
 * Week 1 MSS Delivery Plan: Cut from 93 to ~20 core signals.
 * Every signal has an explicit calcSpec. No heuristic calculations.
 * Aligned to first customer's Zoho data.
 */
export const SIGNAL_DEFINITIONS: SignalRequirement[] = getWeek1CoreSignals()

// ============================================
// FIELD ALIASES - Maps CRM columns to normalized field names
// ============================================

// Comprehensive field name aliases mapping for Zoho, HubSpot, Salesforce, and other CRM exports
// Maps common CRM column names to our standardized signal field names
const FIELD_ALIASES: Record<string, string[]> = {
  // ============================================
  // VALUE/AMOUNT FIELDS
  // ============================================
  deal_value: [
    // Generic
    "amount", "deal amount", "value", "total", "price", "revenue", "sum", "deal_value", "deal value",
    // Zoho CRM
    "amount", "expected revenue", "potential amount", "closing amount",
    // HubSpot
    "amount", "deal amount", "hs_closed_amount", "hs_projected_amount", "hs_deal_amount_calculation_preference",
    // Salesforce
    "amount", "opportunity amount", "expected revenue", "total price", "grand total",
    // Common variations
    "contract value", "annual value", "acv", "tcv", "arr value", "mrr value", "deal size",
    "opportunity value", "opp amount", "potential value", "forecast amount", "committed amount",
  ],
  revenue_amount: [
    "amount", "revenue", "value", "total", "income", "sales", "mrr", "arr", "monthly revenue",
    "recurring revenue", "total revenue", "net revenue", "gross revenue", "subscription revenue",
    "billing amount", "invoice total", "payment amount", "transaction amount",
  ],
  invoice_amount: [
    "invoice amount", "invoice total", "total amount", "amount due", "balance due",
    "grand total", "subtotal", "net amount", "gross amount",
  ],
  marketing_spend: [
    "spend", "cost", "budget", "marketing spend", "ad spend", "campaign cost",
    "advertising cost", "media spend", "total spend", "amount spent",
  ],
  
  // ============================================
  // ID/IDENTIFIER FIELDS
  // ============================================
  deal_id: [
    // Generic
    "id", "deal id", "opportunity id", "opp id", "record id", "deal name", "opportunity name",
    // Zoho CRM
    "deal id", "potentials id", "potential name", "deal name", "record id",
    // HubSpot
    "deal id", "hs_object_id", "record id", "dealid", "vid",
    // Salesforce
    "opportunity id", "id", "opportunity name", "opp id",
  ],
  customer_id: [
    // Generic
    "id", "customer id", "account id", "contact id", "client id", "company id",
    // Zoho CRM
    "account id", "account name", "contact id", "contact name", "customer name", "company",
    // HubSpot
    "company id", "hs_object_id", "companyid", "contact id", "vid", "associated company",
    // Salesforce
    "account id", "account name", "contact id", "contact name",
    // Common
    "client name", "organization", "organisation", "firm name", "business name",
  ],
  ticket_id: [
    // Generic
    "id", "ticket id", "case id", "case number", "ticket number", "issue id", "support id",
    // Zoho Desk
    "ticket id", "ticket number", "#", "case id", "request id", "ticket no",
    // HubSpot
    "ticket id", "hs_object_id", "hs_ticket_id",
    // Zendesk
    "ticket id", "id", "external id",
    // Freshdesk
    "ticket id", "display id", "id",
  ],
  user_id: [
    "user id", "userid", "user_id", "member id", "account id", "profile id",
    "subscriber id", "uid", "customer id", "visitor id",
  ],
  employee_id: [
    "employee id", "emp id", "staff id", "worker id", "personnel id",
    "employee number", "emp no", "badge id", "id",
  ],
  lead_id: [
    "lead id", "leadid", "record id", "prospect id", "contact id", "id",
  ],
  
  // ============================================
  // STATUS/STAGE FIELDS
  // ============================================
  status: [
    // Generic
    "status", "state", "current status", "record status",
    // Zoho CRM (Leads)
    "lead status", "status",
    // Zoho CRM (Deals/Potentials)
    "stage", "deal stage", "potential stage",
    // Zoho Desk
    "status", "ticket status", "case status",
    // HubSpot
    "lead status", "hs_lead_status", "lifecyclestage", "status",
    // Common
    "deal status", "opportunity status", "current stage", "phase", "state",
    "customer status", "subscription status", "account status",
  ],
  stage: [
    // Generic
    "stage", "pipeline stage", "deal stage", "sales stage", "opportunity stage",
    // Zoho CRM
    "stage", "deal stage", "potential stage", "sales stage",
    // HubSpot
    "dealstage", "hs_deal_stage", "pipeline stage", "stage",
    // Salesforce
    "stage", "stagename", "opportunity stage", "forecast category",
    // Common
    "phase", "step", "current stage", "funnel stage", "buying stage",
  ],
  priority: [
    // Generic
    "priority", "urgency", "severity", "importance", "level",
    // Zoho Desk
    "priority", "ticket priority", "urgency",
    // HubSpot
    "hs_ticket_priority", "priority",
    // Common
    "support priority", "case priority", "sla level", "tier",
  ],
  
  // ============================================
  // DATE FIELDS
  // ============================================
  date: [
    "date", "created", "timestamp", "datetime", "day", "month", "period", "time",
  ],
  created_date: [
    // Generic
    "created time", "created date", "created at", "creation date", "create date", "date created",
    // Zoho CRM
    "created time", "created date", "record created", "added time",
    // HubSpot
    "createdate", "hs_createdate", "create date", "created",
    // Salesforce
    "createddate", "created date", "date created",
    // Common
    "opened date", "start date", "submitted date", "entry date", "registered date",
    "signup date", "join date", "subscription date",
  ],
  close_date: [
    // Generic
    "close date", "closed date", "closing date", "end date", "completion date",
    // Zoho CRM
    "closing date", "close date", "expected closing date", "closed time",
    // HubSpot
    "closedate", "hs_closedate", "close date", "closed date", "closed won date",
    // Salesforce
    "closedate", "close date", "actual close date",
    // Common
    "won date", "lost date", "deal close date", "contract end date",
    "expected close", "forecast close date", "target close date",
  ],
  resolved_date: [
    "resolved date", "resolution date", "resolved time", "closed date", "completion date",
    "fixed date", "solved date", "closed time", "resolution time",
  ],
  first_response_date: [
    "first response", "first reply", "initial response", "first contact", "response date",
    "first response time", "time to first response", "first reply time",
  ],
  
  // ============================================
  // OWNER/PERSON FIELDS
  // ============================================
  owner: [
    // Generic
    "owner", "owner name", "assigned to", "rep", "agent",
    // Zoho CRM
    "deal owner", "account owner", "owner", "lead owner", "potential owner",
    // HubSpot
    "hubspot owner", "deal owner", "account owner", "owner",
    // Salesforce
    "opportunity owner", "account owner", "owner", "owner name",
    // Common
    "sales rep", "account executive", "ae", "salesperson", "sales owner",
    "account manager", "am", "csm", "customer success manager",
    "bdm", "business development manager", "rep name", "representative",
  ],
  agent: [
    // Generic
    "agent", "agent name", "support agent", "assignee",
    // Zoho Desk
    "agent", "assignee", "assigned agent", "ticket owner", "owner",
    // HubSpot
    "ticket owner", "assigned to", "owner",
    // Zendesk
    "assignee", "agent", "assigned to",
    // Common
    "handler", "representative", "support rep", "service agent",
    "case owner", "resolver", "technician",
  ],
  
  // ============================================
  // SOURCE/CHANNEL FIELDS
  // ============================================
  lead_source: [
    // Generic
    "lead source", "source", "origin", "channel",
    // Zoho CRM
    "lead source", "source", "campaign source",
    // HubSpot
    "hs_analytics_source", "original source", "lead source", "source",
    "hs_analytics_first_touch_converting_campaign",
    // Salesforce
    "lead source", "leadsource", "primary campaign source",
    // Common
    "acquisition channel", "marketing channel", "how did you hear",
    "referral source", "traffic source", "medium", "campaign",
    "first touch source", "original source",
  ],
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Map a column name to a normalized field name (e.g. for FIELD_ALIASES keys). */
export function normalizeFieldName(colName: string): string {
  const normalized = colName.toLowerCase().trim().replace(/[\s_-]+/g, "_")
  for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
    const allNames = [key, ...aliases].map((a) => a.toLowerCase().replace(/[\s_-]+/g, "_"))
    if (allNames.some((a) => a === normalized || normalized.includes(a) || a.includes(normalized))) {
      return key
    }
  }
  return normalized
}

/** Infer data source type from file name and optional column names. */
export function detectSourceType(fileName: string, columns?: string[]): string {
  const nameLower = fileName.toLowerCase()
  const colStr = (columns ?? []).join(" ").toLowerCase()
  if (nameLower.includes("zoho") && (nameLower.includes("crm") || nameLower.includes("potential") || nameLower.includes("deal"))) return "zoho_crm"
  if (nameLower.includes("zoho") && (nameLower.includes("desk") || nameLower.includes("ticket"))) return "zoho_desk"
  if (nameLower.includes("hubspot") || colStr.includes("hs_")) return "hubspot"
  if (nameLower.includes("salesforce") || colStr.includes("opportunity")) return "salesforce"
  return "csv"
}

function findMatchingColumn(field: DataField, columns: DetectedColumn[]): DetectedColumn | null {
  const fieldNameLower = field.name.toLowerCase().replace(/[_\s-]/g, "")
  
  // Get aliases for this field
  const aliases = FIELD_ALIASES[field.name] || []
  const allNames = [field.name, ...aliases]
  
  for (const column of columns) {
    const colNameLower = column.name.toLowerCase().replace(/[_\s-]/g, "")
    const colNameNormalized = column.name.toLowerCase().trim()
    
    // Check exact match with field name
    if (colNameLower === fieldNameLower) {
      return column
    }
    
    // Check against all aliases (normalized)
    for (const alias of allNames) {
      const aliasNormalized = alias.toLowerCase().replace(/[_\s-]/g, "")
      
      // Exact alias match
      if (colNameLower === aliasNormalized) {
        return column
      }
      
      // Partial alias match (column contains alias or vice versa)
      if (colNameLower.includes(aliasNormalized) || aliasNormalized.includes(colNameLower)) {
        // Type should match (or be flexible for unknown)
        if (column.inferredType === field.type || column.inferredType === "unknown" || field.type === "string") {
          return column
        }
      }
      
      // Word-based match (any word in the column name matches any word in alias)
      const colWords = colNameNormalized.split(/[\s_-]+/)
      const aliasWords = alias.toLowerCase().split(/[\s_-]+/)
      const hasWordMatch = colWords.some(cw => aliasWords.some(aw => cw === aw && cw.length > 2))
      if (hasWordMatch && (column.inferredType === field.type || column.inferredType === "unknown")) {
        return column
      }
    }

    // Check examples for semantic matching (sample values match expected patterns)
    for (const example of field.examples) {
      if (column.sampleValues.some((v) => v.toLowerCase().includes(example.toLowerCase()))) {
        return column
      }
    }
  }

  return null
}

function generateRecommendations(
  columns: DetectedColumn[],
  available: DiscoveredSignal[],
  partial: DiscoveredSignal[],
): string[] {
  const recommendations: string[] = []

  // Recommendation 1: Available signals
  if (available.length > 0) {
    recommendations.push(
      `✅ You can generate ${available.length} signal(s) with your current data: ${available
        .slice(0, 3)
        .map((s) => s.signal.signalName)
        .join(", ")}${available.length > 3 ? `, and ${available.length - 3} more` : ""}`,
    )
  }

  // Recommendation 2: Partial signals
  if (partial.length > 0) {
    const top = partial[0]
    recommendations.push(
      `⚠️ ${partial.length} signal(s) partially available. Add "${top.missingFields.join(", ")}" to enable ${top.signal.signalName}.`,
    )
  }

  // Recommendation 3: Data quality
  const columnsWithHighNullRate = columns.filter((c) => c.nullCount > columns.length * 0.3)
  if (columnsWithHighNullRate.length > 0) {
    recommendations.push(
      `💡 Consider filling in missing values for: ${columnsWithHighNullRate.map((c) => c.name).join(", ")}`,
    )
  }

  return recommendations
}

export function detectColumns(data: ParsedCSVRow[]): DetectedColumn[] {
  if (data.length === 0) return []

  const columns: DetectedColumn[] = []
  const columnNames = Object.keys(data[0])

  for (const name of columnNames) {
    const values = data.map((row) => row[name]).filter((v) => v !== null && v !== undefined && v !== "")
    const nullCount = data.length - values.length
    const uniqueValues = new Set(values)

    // Infer type
    let inferredType: DetectedColumn["inferredType"] = "unknown"
    let confidence = 0

    // Check if numeric
    const numericValues = values.filter((v) => !Number.isNaN(Number(v)))
    if (numericValues.length / values.length > 0.8) {
      inferredType = "number"
      confidence = numericValues.length / values.length
    }

    // Check if date
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/
    const dateValues = values.filter((v) => datePattern.test(String(v)))
    if (dateValues.length / values.length > 0.7) {
      inferredType = "date"
      confidence = dateValues.length / values.length
    }

    // Check if boolean
    const booleanPattern = /^(true|false|yes|no|y|n|1|0)$/i
    const booleanValues = values.filter((v) => booleanPattern.test(String(v)))
    if (booleanValues.length / values.length > 0.9) {
      inferredType = "boolean"
      confidence = booleanValues.length / values.length
    }

    // Default to string if not clearly something else
    if (inferredType === "unknown" && values.length > 0) {
      inferredType = "string"
      confidence = 0.5
    }

    columns.push({
      name,
      inferredType,
      sampleValues: Array.from(uniqueValues).slice(0, 5).map(String),
      nullCount,
      uniqueCount: uniqueValues.size,
      confidence,
    })
  }

  return columns
}

// ============================================
// MAIN DISCOVERY FUNCTION
// ============================================

export async function discoverSignals(
  dataSource: string,
  data: ParsedCSVRow[],
): Promise<SignalDiscoveryResult> {
  // Detect columns from data
  const detectedColumns = detectColumns(data)

  const available: DiscoveredSignal[] = []
  const partial: DiscoveredSignal[] = []
  const unavailable: DiscoveredSignal[] = []

  // Analyze each signal definition
  for (const signal of SIGNAL_DEFINITIONS) {
    const matchedFields: string[] = []
    const missingFields: string[] = []

    // Check required fields
    for (const field of signal.requiredFields) {
      const match = findMatchingColumn(field, detectedColumns)
      if (match) {
        matchedFields.push(field.name)
      } else {
        missingFields.push(field.name)
      }
    }

    // Calculate match score
    const totalRequiredFields = signal.requiredFields.length
    const matchScore = totalRequiredFields > 0 ? (matchedFields.length / totalRequiredFields) * 100 : 0

    // Categorize signal
    let availability: "available" | "partial" | "unavailable" = "unavailable"
    let reason = ""

    if (matchScore === 100) {
      availability = "available"
      reason = `All required fields found: ${matchedFields.join(", ")}`
    } else if (matchScore >= 50) {
      availability = "partial"
      reason = `Missing ${missingFields.length} field(s): ${missingFields.join(", ")}`
    } else {
      availability = "unavailable"
      reason = `Missing critical fields: ${missingFields.join(", ")}`
    }

    const discovered: DiscoveredSignal = {
      signal,
      availability,
      matchScore,
      matchedFields,
      missingFields,
      reason,
    }

    if (availability === "available") {
      available.push(discovered)
    } else if (availability === "partial") {
      partial.push(discovered)
    } else {
      unavailable.push(discovered)
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(detectedColumns, available, partial)

  return {
    dataSource,
    totalRowsAnalyzed: data.length,
    detectedColumns,
    availableSignals: available,
    partialSignals: partial,
    unavailableSignals: unavailable,
    recommendations,
  }
}
