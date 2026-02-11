// Intelligent signal discovery - analyzes uploaded data and determines which signals are available

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
// SIGNAL DEFINITIONS (the "Signal Catalog")
// ============================================

/**
 * Week 1 MSS Delivery Plan: Cut from 93 to ~20 core signals.
 * Every signal has an explicit calcSpec. No heuristic calculations.
 * Aligned to first customer's Zoho data.
 */
export const SIGNAL_DEFINITIONS: SignalRequirement[] = getWeek1CoreSignals()

// ============================================
// OLD 93-SIGNAL DEFINITIONS REMOVED (Week 1 MSS)\
    signalName: "Monthly Recurring Revenue (MRR)",\
    description: "Total predictable revenue generated per month",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Board"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue value", examples: ["1000", "5000.50"] },
    ],\
    optionalFields: [
      { name: "date", type: "date", description: "Transaction date", examples: ["2025-01-01"] },
      { name: "subscription_type", type: "string", description: "Type of subscription", examples: ["monthly", "annual"] },
      { name: "customer_id", type: "string", description: "Customer identifier", examples: ["CUST-001"] },
    ],\
    calculationType: "aggregated",\
    calcSpec: {
      sourceTab: ["revenue", "subscriptions", "invoices", "deals"],\
      operation: "sum",\
      valueField: "revenue_amount",\
      dateField: "date",\
      filters: [],\
      displayUnit: "currency",\
    },\
  },
  {
    signalId: "arr",\
    signalName: "Annual Recurring Revenue (ARR)",\
    description: "MRR × 12 - Total recurring revenue normalized annually",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Board"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Monthly recurring revenue", examples: ["10000", "50000"] },
    ],\
    optionalFields: [],\
    calculationType: "calculated",\
  },
  {
    signalId: "revenue_growth_rate",\
    signalName: "Revenue Growth Rate",\
    description: "Month-over-month or year-over-year revenue growth percentage",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Board"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["10000", "50000"] },
      { name: "date", type: "date", description: "Period date", examples: ["2025-01-01"] },
    ],\
    optionalFields: [],\
    calculationType: "time-series",\
  },
  {
    signalId: "net_revenue_retention",\
    signalName: "Net Revenue Retention (NRR)",\
    description: "Revenue retained from existing customers including expansions",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Customer Success"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "customer_id", type: "string", description: "Customer identifier", examples: ["CUST-001"] },
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["1000"] },
    ],\
    optionalFields: [
      { name: "date", type: "date", description: "Period date", examples: ["2025-01-01"] },
    ],\
    calculationType: "aggregated",\
  },
  {
    signalId: "gross_revenue_retention",\
    signalName: "Gross Revenue Retention (GRR)",\
    description: "Revenue retained excluding expansions (measures churn impact)",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Customer Success"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "customer_id", type: "string", description: "Customer identifier", examples: ["CUST-001"] },
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["1000"] },
      { name: "status", type: "string", description: "Customer status", examples: ["active", "churned"] },
    ],\
    optionalFields: [],\
    calculationType: "aggregated",\
  },
  {
    signalId: "revenue_per_customer",\
    signalName: "Average Revenue per Customer (ARPC)",\
    description: "Total revenue divided by number of customers",\
    category: "Revenue",\
    valuableFor: ["CEO", "CFO", "Sales"],\
    businessStage: ["Post-PMF", "Scaling"],\
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["5000"] },
      { name: "customer_id", type: "string", description: "Customer identifier", examples: ["CUST-001"] },
    ],\
    optionalFields: [],\
    calculationType: "aggregated",
  },
  {
    signalId: "expansion_revenue",
    signalName: "Expansion Revenue",
    description: "Additional revenue from existing customers (upsells/cross-sells)",
    category: "Revenue",
    valuableFor: ["CEO", "CFO", "Customer Success"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["2000"] },
      { name: "customer_id", type: "string", description: "Customer identifier", examples: ["CUST-001"] },
      { name: "revenue_type", type: "string", description: "Type of revenue", examples: ["expansion", "upsell", "cross-sell"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "revenue_by_product",
    signalName: "Revenue by Product/Plan",
    description: "Revenue breakdown by product line or subscription tier",
    category: "Revenue",
    valuableFor: ["CEO", "CFO", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["5000"] },
      { name: "subscription_type", type: "string", description: "Product/plan type", examples: ["starter", "pro", "enterprise"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "revenue_by_region",
    signalName: "Revenue by Region",
    description: "Geographic distribution of revenue",
    category: "Revenue",
    valuableFor: ["CEO", "CFO", "Sales"],
    businessStage: ["Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue amount", examples: ["10000"] },
      { name: "region", type: "string", description: "Geographic region", examples: ["North America", "EMEA", "APAC"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },

  // ============================================
  // SALES SIGNALS (VP Sales, Sales Team, CEO)
  // ============================================
  {
    signalId: "sales_pipeline_value",
    signalName: "Sales Pipeline Value",
    description: "Total value of all open opportunities",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["5000", "10000"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "proposal"] },
      { name: "close_date", type: "date", description: "Expected close date", examples: ["2025-02-01"] },
      { name: "probability", type: "number", description: "Win probability", examples: ["0.5", "0.8"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities", "pipeline"],
      operation: "sum",
      valueField: "deal_value",
      dateField: "close_date",
      filters: [
        { field: "stage", op: "excludes", values: ["closed lost", "lost", "disqualified", "cancelled"] },
      ],
      displayUnit: "currency",
    },
  },
  {
    signalId: "weighted_pipeline",
    signalName: "Weighted Pipeline Value",
    description: "Pipeline value adjusted by probability to close",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["50000"] },
      { name: "probability", type: "number", description: "Win probability", examples: ["0.5", "50"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["proposal", "negotiation"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "pipeline_coverage",
    signalName: "Pipeline Coverage Ratio",
    description: "Pipeline value vs quota (3x+ is healthy)",
    category: "Sales",
    valuableFor: ["VP Sales", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Pipeline value", examples: ["500000"] },
      { name: "quota", type: "number", description: "Sales quota", examples: ["150000"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "win_rate",
    signalName: "Win Rate",
    description: "Percentage of deals won vs total closed deals",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "stage", type: "string", description: "Deal outcome", examples: ["won", "lost", "closed won", "closed lost"] },
    ],
    optionalFields: [
      { name: "deal_id", type: "string", description: "Deal identifier", examples: ["DEAL-001"] },
      { name: "close_date", type: "date", description: "Close date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "rate",
      valueField: null,
      dateField: "close_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won", "closed lost", "lost"] },
      ],
      positiveStatuses: ["closed won", "won"],
      displayUnit: "percent",
    },
  },
  {
    signalId: "average_deal_size",
    signalName: "Average Deal Size",
    description: "Mean value of closed-won deals",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["5000", "10000"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal status", examples: ["won", "closed-won"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "average",
      valueField: "deal_value",
      dateField: "close_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won"] },
      ],
      displayUnit: "currency",
    },
  },
  {
    signalId: "sales_cycle_length",
    signalName: "Sales Cycle Length",
    description: "Average days from opportunity creation to close",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Deal created date", examples: ["2024-12-01"] },
      { name: "close_date", type: "date", description: "Deal closed date", examples: ["2025-01-15"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal status", examples: ["won", "closed-won"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "duration_avg",
      valueField: "close_date",
      dateField: "created_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won"] },
      ],
      displayUnit: "days",
    },
  },
  {
    signalId: "deal_count_by_owner",
    signalName: "Deals by Owner",
    description: "Number of deals per sales representative",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Deal owner", examples: ["John Smith"] },
    ],
    optionalFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["5000"] },
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "won"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "group_by",
      valueField: null,
      dateField: "close_date",
      filters: [],
      groupByField: "owner",
      displayUnit: "count",
    },
  },
  {
    signalId: "deal_value_by_owner",
    signalName: "Deal Value by Owner",
    description: "Total deal value per sales representative",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Deal owner", examples: ["John Smith"] },
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["5000", "10000"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "won"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "win_rate_by_owner",
    signalName: "Win Rate by Owner",
    description: "Win rate for each sales representative",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Deal owner", examples: ["John Smith"] },
      { name: "stage", type: "string", description: "Deal outcome", examples: ["won", "lost"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "deals_by_stage",
    signalName: "Deals by Stage",
    description: "Distribution of deals across pipeline stages",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "proposal", "negotiation"] },
    ],
    optionalFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["5000"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "group_by",
      valueField: null,
      dateField: null,
      filters: [],
      groupByField: "stage",
      displayUnit: "count",
    },
  },
  {
    signalId: "deals_closing_this_month",
    signalName: "Deals Closing This Month",
    description: "Total value of closed-won deals",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "close_date", type: "date", description: "Expected close date", examples: ["2025-01-31"] },
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["25000"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["negotiation", "proposal"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities"],
      operation: "sum",
      valueField: "deal_value",
      dateField: "close_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won"] },
      ],
      displayUnit: "currency",
    },
  },
  {
    signalId: "quota_attainment",
    signalName: "Quota Attainment",
    description: "Percentage of sales quota achieved",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Closed revenue", examples: ["75000"] },
      { name: "quota", type: "number", description: "Target quota", examples: ["100000"] },
      { name: "owner", type: "string", description: "Sales rep", examples: ["John Smith"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "deals_by_source",
    signalName: "Deals by Lead Source",
    description: "Opportunity distribution by original lead source",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "lead_source", type: "string", description: "Lead source", examples: ["Website", "Referral", "Outbound"] },
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["10000"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "sales_velocity",
    signalName: "Sales Velocity",
    description: "Speed of revenue generation (deals × value × win rate / cycle)",
    category: "Sales",
    valuableFor: ["VP Sales", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["25000"] },
      { name: "stage", type: "string", description: "Deal stage", examples: ["won", "lost"] },
      { name: "created_date", type: "date", description: "Deal created date", examples: ["2024-12-01"] },
      { name: "close_date", type: "date", description: "Deal closed date", examples: ["2025-01-15"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },

  // ============================================
  // LEAD SIGNALS (VP Sales, Marketing, SDR Team)
  // ============================================
  {
    signalId: "total_leads",
    signalName: "Total Leads",
    description: "Count of all leads in the system",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing", "CEO"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "customer_id", type: "string", description: "Lead identifier", examples: ["LEAD-001", "john@example.com"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
      { name: "status", type: "string", description: "Lead status", examples: ["new", "contacted", "qualified"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["leads", "contacts"],
      operation: "count",
      valueField: null,
      dateField: "created_date",
      filters: [],
      displayUnit: "count",
    },
  },
  {
    signalId: "new_leads",
    signalName: "New Leads This Period",
    description: "Leads created in the current period",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-15"] },
    ],
    optionalFields: [
      { name: "lead_source", type: "string", description: "Lead source", examples: ["Website", "Referral"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "leads_by_source",
    signalName: "Leads by Source",
    description: "Number of leads per acquisition channel",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "lead_source", type: "string", description: "Lead source", examples: ["Website", "Referral", "LinkedIn", "Cold Call"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "leads_by_owner",
    signalName: "Leads by Owner",
    description: "Number of leads assigned to each rep",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Lead owner", examples: ["John Smith"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
      { name: "status", type: "string", description: "Lead status", examples: ["new", "contacted"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["leads", "contacts", "deals"],
      operation: "group_by",
      valueField: null,
      dateField: "created_date",
      filters: [],
      groupByField: "owner",
      displayUnit: "count",
    },
  },
  {
    signalId: "leads_by_status",
    signalName: "Leads by Status",
    description: "Distribution of leads across status categories",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Lead status", examples: ["new", "contacted", "qualified", "disqualified"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "leads_per_month",
    signalName: "Leads per Month",
    description: "Monthly lead generation volume",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
    ],
    optionalFields: [
      { name: "lead_source", type: "string", description: "Lead source", examples: ["Website", "Referral"] },
      { name: "owner", type: "string", description: "Lead owner", examples: ["John Smith"] },
    ],
    calculationType: "time-series",
    calcSpec: {
      sourceTab: ["leads", "contacts"],
      operation: "monthly_rate",
      valueField: null,
      dateField: "created_date",
      filters: [],
      rateUnit: "month",
      displayUnit: "count",
    },
  },
  {
    signalId: "lead_to_opportunity_rate",
    signalName: "Lead to Opportunity Conversion",
    description: "Percentage of leads converted to opportunities",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Lead status", examples: ["converted", "opportunity", "qualified", "disqualified"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "lead_response_time",
    signalName: "Lead Response Time",
    description: "Average time from lead creation to first contact",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Lead created", examples: ["2025-01-01 09:00"] },
      { name: "first_contact_date", type: "date", description: "First contact", examples: ["2025-01-01 11:00"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "leads_by_industry",
    signalName: "Leads by Industry",
    description: "Distribution of leads across industry verticals",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "industry", type: "string", description: "Industry/vertical", examples: ["Technology", "Healthcare", "Finance"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "leads_by_company_size",
    signalName: "Leads by Company Size",
    description: "Distribution of leads by target company size",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "company_size", type: "string", description: "Company size segment", examples: ["SMB", "Mid-Market", "Enterprise", "1-50", "51-200"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "mql_count",
    signalName: "Marketing Qualified Leads (MQLs)",
    description: "Leads that meet marketing qualification criteria",
    category: "Marketing",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "lead_score", type: "number", description: "Lead score", examples: ["75", "100"] },
    ],
    optionalFields: [
      { name: "status", type: "string", description: "Lead status", examples: ["MQL", "SQL"] },
      { name: "created_date", type: "date", description: "Created date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "sql_count",
    signalName: "Sales Qualified Leads (SQLs)",
    description: "Leads that meet sales qualification criteria",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Lead status", examples: ["SQL", "Qualified", "Sales Ready"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Created date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },

  // ============================================
  // MARKETING SIGNALS (CMO, Marketing Team)
  // ============================================
  {
    signalId: "website_traffic",
    signalName: "Website Traffic",
    description: "Total website visits",
    category: "Marketing",
    valuableFor: ["CMO", "Marketing"],
    businessStage: ["Pre-PMF", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "visits", type: "number", description: "Visit count", examples: ["5000", "10000"] },
    ],
    optionalFields: [
      { name: "date", type: "date", description: "Date", examples: ["2025-01-01"] },
      { name: "source", type: "string", description: "Traffic source", examples: ["organic", "paid", "social"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "website_conversion_rate",
    signalName: "Website Conversion Rate",
    description: "Percentage of visitors who become leads",
    category: "Marketing",
    valuableFor: ["CMO", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "visits", type: "number", description: "Total visits", examples: ["10000"] },
      { name: "conversions", type: "number", description: "Lead conversions", examples: ["200"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "cac",
    signalName: "Customer Acquisition Cost (CAC)",
    description: "Total sales & marketing spend / new customers",
    category: "Marketing",
    valuableFor: ["CFO", "CMO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "marketing_spend", type: "number", description: "Marketing costs", examples: ["10000", "50000"] },
      { name: "new_customers", type: "number", description: "Customers acquired", examples: ["10", "50"] },
    ],
    optionalFields: [
      { name: "sales_spend", type: "number", description: "Sales costs", examples: ["20000"] },
      { name: "date", type: "date", description: "Period date", examples: ["2025-01-01"] },
    ],
    calculationType: "calculated",
  },
  {
    signalId: "ltv_cac_ratio",
    signalName: "LTV:CAC Ratio",
    description: "Customer lifetime value vs acquisition cost (3:1+ is healthy)",
    category: "Marketing",
    valuableFor: ["CFO", "CMO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "ltv", type: "number", description: "Lifetime value", examples: ["5000"] },
      { name: "cac", type: "number", description: "Acquisition cost", examples: ["1500"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "cac_payback",
    signalName: "CAC Payback Period",
    description: "Months to recover customer acquisition cost",
    category: "Marketing",
    valuableFor: ["CFO", "CMO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "cac", type: "number", description: "Acquisition cost", examples: ["1500"] },
      { name: "revenue_amount", type: "number", description: "Monthly revenue", examples: ["200"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "campaign_roi",
    signalName: "Campaign ROI",
    description: "Return on investment for marketing campaigns",
    category: "Marketing",
    valuableFor: ["CMO", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "campaign_spend", type: "number", description: "Campaign cost", examples: ["5000"] },
      { name: "campaign_revenue", type: "number", description: "Attributed revenue", examples: ["25000"] },
      { name: "campaign_name", type: "string", description: "Campaign", examples: ["Q1 Webinar", "LinkedIn Ads"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "marketing_spend_by_channel",
    signalName: "Marketing Spend by Channel",
    description: "Budget distribution across marketing channels",
    category: "Marketing",
    valuableFor: ["CMO", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "marketing_spend", type: "number", description: "Spend amount", examples: ["10000"] },
      { name: "channel", type: "string", description: "Marketing channel", examples: ["Paid Search", "Content", "Events"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "email_open_rate",
    signalName: "Email Open Rate",
    description: "Percentage of emails opened",
    category: "Marketing",
    valuableFor: ["Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "emails_sent", type: "number", description: "Emails sent", examples: ["5000"] },
      { name: "emails_opened", type: "number", description: "Emails opened", examples: ["1200"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "email_click_rate",
    signalName: "Email Click-Through Rate",
    description: "Percentage of email recipients who clicked a link",
    category: "Marketing",
    valuableFor: ["Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "emails_sent", type: "number", description: "Emails sent", examples: ["5000"] },
      { name: "emails_clicked", type: "number", description: "Emails clicked", examples: ["250"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "content_downloads",
    signalName: "Content Downloads",
    description: "Number of gated content downloads",
    category: "Marketing",
    valuableFor: ["Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "downloads", type: "number", description: "Download count", examples: ["150"] },
      { name: "content_name", type: "string", description: "Content piece", examples: ["Whitepaper", "eBook"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },

  // ============================================
  // CUSTOMER SUCCESS SIGNALS (VP CS, CS Team)
  // ============================================
  {
    signalId: "customer_count",
    signalName: "Total Customers",
    description: "Number of active paying customers",
    category: "Customer Success",
    valuableFor: ["CEO", "Customer Success", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
      { name: "status", type: "string", description: "Customer status", examples: ["active", "paying"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "customer_churn_rate",
    signalName: "Customer Churn Rate",
    description: "Percentage of customers lost in a period",
    category: "Customer Success",
    valuableFor: ["CEO", "Customer Success", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
      { name: "status", type: "string", description: "Customer status", examples: ["active", "churned", "cancelled"] },
    ],
    optionalFields: [
      { name: "churn_date", type: "date", description: "Churn date", examples: ["2025-01-15"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "nps_score",
    signalName: "Net Promoter Score (NPS)",
    description: "Customer loyalty and satisfaction metric (-100 to +100)",
    category: "Customer Success",
    valuableFor: ["CEO", "Customer Success", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "nps_rating", type: "number", description: "NPS rating (0-10)", examples: ["9", "6", "3"] },
    ],
    optionalFields: [
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
      { name: "date", type: "date", description: "Survey date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "csat_score",
    signalName: "Customer Satisfaction Score (CSAT)",
    description: "Average customer satisfaction rating",
    category: "Customer Success",
    valuableFor: ["Customer Success", "Support", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "satisfaction_rating", type: "number", description: "Rating (1-5 or 1-10)", examples: ["4", "5", "8"] },
    ],
    optionalFields: [
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
      { name: "date", type: "date", description: "Rating date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "health_score",
    signalName: "Customer Health Score",
    description: "Composite score indicating customer health/risk",
    category: "Customer Success",
    valuableFor: ["Customer Success", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "health_score", type: "number", description: "Health score", examples: ["85", "45", "70"] },
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
    ],
    optionalFields: [
      { name: "health_status", type: "string", description: "Health category", examples: ["Healthy", "At Risk", "Red"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "customers_at_risk",
    signalName: "Customers At Risk",
    description: "Count of customers with poor health scores",
    category: "Customer Success",
    valuableFor: ["Customer Success", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "health_status", type: "string", description: "Health category", examples: ["At Risk", "Red", "Critical"] },
    ],
    optionalFields: [
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
      { name: "revenue_amount", type: "number", description: "Customer revenue", examples: ["5000"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "customer_lifetime_value",
    signalName: "Customer Lifetime Value (LTV)",
    description: "Average revenue generated per customer over lifetime",
    category: "Customer Success",
    valuableFor: ["CEO", "CFO", "Customer Success"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Customer revenue", examples: ["5000"] },
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
    ],
    optionalFields: [
      { name: "tenure_months", type: "number", description: "Customer tenure", examples: ["24", "12"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "onboarding_completion",
    signalName: "Onboarding Completion Rate",
    description: "Percentage of new customers completing onboarding",
    category: "Customer Success",
    valuableFor: ["Customer Success", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "onboarding_status", type: "string", description: "Onboarding status", examples: ["completed", "in progress", "not started"] },
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "time_to_value",
    signalName: "Time to First Value",
    description: "Days from signup to first meaningful engagement",
    category: "Customer Success",
    valuableFor: ["Customer Success", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "signup_date", type: "date", description: "Signup date", examples: ["2025-01-01"] },
      { name: "first_value_date", type: "date", description: "First value date", examples: ["2025-01-05"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "expansion_opportunities",
    signalName: "Expansion Opportunities",
    description: "Customers with high expansion potential",
    category: "Customer Success",
    valuableFor: ["Customer Success", "Sales"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "expansion_score", type: "number", description: "Expansion score", examples: ["85", "90"] },
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
    ],
    optionalFields: [
      { name: "current_plan", type: "string", description: "Current subscription", examples: ["Pro", "Starter"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "renewals_due",
    signalName: "Renewals Due This Period",
    description: "Customers with upcoming renewal dates",
    category: "Customer Success",
    valuableFor: ["Customer Success", "Sales", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "renewal_date", type: "date", description: "Renewal date", examples: ["2025-02-15"] },
      { name: "customer_id", type: "string", description: "Customer ID", examples: ["CUST-001"] },
    ],
    optionalFields: [
      { name: "revenue_amount", type: "number", description: "Contract value", examples: ["25000"] },
    ],
    calculationType: "aggregated",
  },

  // ============================================
  // SUPPORT SIGNALS (Support Manager, Support Team)
  // ============================================
  {
    signalId: "total_tickets",
    signalName: "Total Support Tickets",
    description: "Volume of support requests received",
    category: "Support",
    valuableFor: ["Support Manager", "Support Team", "COO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "ticket_id", type: "string", description: "Ticket identifier", examples: ["TICK-001"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Ticket creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "open_tickets",
    signalName: "Open Tickets",
    description: "Currently unresolved support tickets",
    category: "Support",
    valuableFor: ["Support Manager", "Support Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Ticket status", examples: ["open", "in progress", "pending"] },
    ],
    optionalFields: [
      { name: "ticket_id", type: "string", description: "Ticket ID", examples: ["TICK-001"] },
      { name: "priority", type: "string", description: "Priority", examples: ["high", "medium", "low"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "tickets_by_priority",
    signalName: "Tickets by Priority",
    description: "Distribution of tickets across priority levels",
    category: "Support",
    valuableFor: ["Support Manager"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "priority", type: "string", description: "Priority level", examples: ["critical", "high", "medium", "low"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "tickets_by_category",
    signalName: "Tickets by Category",
    description: "Distribution of tickets by issue type",
    category: "Support",
    valuableFor: ["Support Manager", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "category", type: "string", description: "Ticket category", examples: ["Bug", "Feature Request", "How-to", "Billing"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "tickets_by_agent",
    signalName: "Tickets by Agent",
    description: "Ticket distribution across support agents",
    category: "Support",
    valuableFor: ["Support Manager"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "agent", type: "string", description: "Agent name", examples: ["Jane Doe", "Support Agent 1"] },
    ],
    optionalFields: [
      { name: "status", type: "string", description: "Status", examples: ["resolved", "open"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "average_resolution_time",
    signalName: "Average Resolution Time",
    description: "Mean time to resolve support tickets",
    category: "Support",
    valuableFor: ["Support Manager", "Support Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Ticket created", examples: ["2024-12-20"] },
      { name: "resolved_date", type: "date", description: "Ticket resolved", examples: ["2024-12-22"] },
    ],
    optionalFields: [
      { name: "ticket_id", type: "string", description: "Ticket ID", examples: ["TICK-001"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "first_response_time",
    signalName: "First Response Time",
    description: "Time to first agent response on tickets",
    category: "Support",
    valuableFor: ["Support Manager", "Support Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Ticket created", examples: ["2025-01-01 10:00"] },
      { name: "first_response_date", type: "date", description: "First response", examples: ["2025-01-01 11:30"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "ticket_backlog",
    signalName: "Ticket Backlog",
    description: "Open tickets older than SLA threshold",
    category: "Support",
    valuableFor: ["Support Manager", "COO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Ticket created", examples: ["2024-12-01"] },
      { name: "status", type: "string", description: "Ticket status", examples: ["open", "in-progress"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "sla_compliance",
    signalName: "SLA Compliance Rate",
    description: "Percentage of tickets resolved within SLA",
    category: "Support",
    valuableFor: ["Support Manager", "COO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "sla_met", type: "boolean", description: "SLA met", examples: ["true", "false", "yes", "no"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "escalation_rate",
    signalName: "Escalation Rate",
    description: "Percentage of tickets requiring escalation",
    category: "Support",
    valuableFor: ["Support Manager"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "escalated", type: "boolean", description: "Was escalated", examples: ["true", "false"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "ticket_reopen_rate",
    signalName: "Ticket Reopen Rate",
    description: "Percentage of resolved tickets that get reopened",
    category: "Support",
    valuableFor: ["Support Manager"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "reopened", type: "boolean", description: "Was reopened", examples: ["true", "false"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },

  // ============================================
  // PRODUCT SIGNALS (CPO, Product Team)
  // ============================================
  {
    signalId: "dau",
    signalName: "Daily Active Users (DAU)",
    description: "Unique users who engage daily",
    category: "Product",
    valuableFor: ["CPO", "Product", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "activity_date", type: "date", description: "Activity date", examples: ["2025-01-01"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "wau",
    signalName: "Weekly Active Users (WAU)",
    description: "Unique users who engage weekly",
    category: "Product",
    valuableFor: ["CPO", "Product", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "activity_date", type: "date", description: "Activity date", examples: ["2025-01-01"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "mau",
    signalName: "Monthly Active Users (MAU)",
    description: "Unique users who engage monthly",
    category: "Product",
    valuableFor: ["CPO", "Product", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "activity_date", type: "date", description: "Activity date", examples: ["2025-01-01"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "dau_mau_ratio",
    signalName: "DAU/MAU Ratio (Stickiness)",
    description: "Product stickiness - how often users return",
    category: "Product",
    valuableFor: ["CPO", "Product", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "activity_date", type: "date", description: "Activity date", examples: ["2025-01-01"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "feature_adoption",
    signalName: "Feature Adoption Rate",
    description: "Percentage of users using a feature",
    category: "Product",
    valuableFor: ["CPO", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "feature_name", type: "string", description: "Feature name", examples: ["export", "dashboard", "reports"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "feature_usage",
    signalName: "Feature Usage Frequency",
    description: "How often each feature is used",
    category: "Product",
    valuableFor: ["CPO", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "feature_name", type: "string", description: "Feature name", examples: ["export", "dashboard"] },
      { name: "usage_count", type: "number", description: "Usage count", examples: ["150", "500"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "session_duration",
    signalName: "Average Session Duration",
    description: "Time spent per user session",
    category: "Product",
    valuableFor: ["CPO", "Product"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "session_duration", type: "number", description: "Duration (seconds/minutes)", examples: ["300", "15"] },
    ],
    optionalFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "activation_rate",
    signalName: "Activation Rate",
    description: "Percentage of signups completing key activation action",
    category: "Product",
    valuableFor: ["CPO", "Product", "Growth"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "activated", type: "boolean", description: "Activated", examples: ["true", "false"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "user_retention",
    signalName: "User Retention (Day N)",
    description: "Users returning after N days",
    category: "Product",
    valuableFor: ["CPO", "Product", "Growth"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "user_id", type: "string", description: "User ID", examples: ["USER-001"] },
      { name: "signup_date", type: "date", description: "Signup date", examples: ["2025-01-01"] },
      { name: "activity_date", type: "date", description: "Activity date", examples: ["2025-01-08"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "error_rate",
    signalName: "Application Error Rate",
    description: "Frequency of application errors",
    category: "Product",
    valuableFor: ["CPO", "Engineering"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "error_count", type: "number", description: "Error count", examples: ["50", "200"] },
      { name: "request_count", type: "number", description: "Total requests", examples: ["10000"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "page_load_time",
    signalName: "Page Load Time",
    description: "Average page load performance",
    category: "Product",
    valuableFor: ["CPO", "Engineering"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "load_time", type: "number", description: "Load time (ms)", examples: ["500", "2000"] },
    ],
    optionalFields: [
      { name: "page_name", type: "string", description: "Page", examples: ["dashboard", "home"] },
    ],
    calculationType: "aggregated",
  },

  // ============================================
  // FINANCE SIGNALS (CFO, Finance Team)
  // ============================================
  {
    signalId: "gross_margin",
    signalName: "Gross Margin",
    description: "Revenue minus cost of goods sold as percentage",
    category: "Finance",
    valuableFor: ["CFO", "CEO", "Board"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Revenue", examples: ["100000"] },
      { name: "cogs", type: "number", description: "Cost of goods sold", examples: ["30000"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "operating_expenses",
    signalName: "Operating Expenses",
    description: "Total operational costs",
    category: "Finance",
    valuableFor: ["CFO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "expense_amount", type: "number", description: "Expense amount", examples: ["50000"] },
    ],
    optionalFields: [
      { name: "expense_category", type: "string", description: "Category", examples: ["Salaries", "Marketing", "Infrastructure"] },
      { name: "date", type: "date", description: "Date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "burn_rate",
    signalName: "Monthly Burn Rate",
    description: "Net cash spent per month",
    category: "Finance",
    valuableFor: ["CFO", "CEO", "Board"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "expense_amount", type: "number", description: "Monthly expenses", examples: ["200000"] },
      { name: "revenue_amount", type: "number", description: "Monthly revenue", examples: ["150000"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "runway",
    signalName: "Cash Runway",
    description: "Months of runway at current burn rate",
    category: "Finance",
    valuableFor: ["CFO", "CEO", "Board"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "cash_balance", type: "number", description: "Cash on hand", examples: ["2000000"] },
      { name: "burn_rate", type: "number", description: "Monthly burn", examples: ["100000"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
  {
    signalId: "accounts_receivable",
    signalName: "Accounts Receivable",
    description: "Outstanding customer payments",
    category: "Finance",
    valuableFor: ["CFO", "Finance"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "invoice_amount", type: "number", description: "Invoice amount", examples: ["5000"] },
      { name: "status", type: "string", description: "Payment status", examples: ["pending", "overdue", "paid"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "days_sales_outstanding",
    signalName: "Days Sales Outstanding (DSO)",
    description: "Average days to collect payment",
    category: "Finance",
    valuableFor: ["CFO", "Finance"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "invoice_date", type: "date", description: "Invoice date", examples: ["2025-01-01"] },
      { name: "payment_date", type: "date", description: "Payment date", examples: ["2025-01-25"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "expenses_by_department",
    signalName: "Expenses by Department",
    description: "Cost breakdown by department",
    category: "Finance",
    valuableFor: ["CFO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "expense_amount", type: "number", description: "Expense amount", examples: ["50000"] },
      { name: "department", type: "string", description: "Department", examples: ["Engineering", "Sales", "Marketing"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },

  // ============================================
  // HR/PEOPLE SIGNALS (VP People, HR)
  // ============================================
  {
    signalId: "headcount",
    signalName: "Total Headcount",
    description: "Number of employees",
    category: "People",
    valuableFor: ["CEO", "HR", "CFO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "employee_id", type: "string", description: "Employee ID", examples: ["EMP-001"] },
      { name: "status", type: "string", description: "Employment status", examples: ["active", "terminated"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "headcount_by_department",
    signalName: "Headcount by Department",
    description: "Employees per department",
    category: "People",
    valuableFor: ["CEO", "HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "department", type: "string", description: "Department", examples: ["Engineering", "Sales", "Marketing"] },
    ],
    optionalFields: [
      { name: "employee_id", type: "string", description: "Employee ID", examples: ["EMP-001"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "employee_turnover",
    signalName: "Employee Turnover Rate",
    description: "Percentage of employees leaving",
    category: "People",
    valuableFor: ["CEO", "HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Employment status", examples: ["active", "terminated", "resigned"] },
    ],
    optionalFields: [
      { name: "termination_date", type: "date", description: "Termination date", examples: ["2025-01-15"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "open_positions",
    signalName: "Open Positions",
    description: "Number of open job requisitions",
    category: "People",
    valuableFor: ["CEO", "HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "position_status", type: "string", description: "Position status", examples: ["open", "filled", "closed"] },
    ],
    optionalFields: [
      { name: "department", type: "string", description: "Department", examples: ["Engineering"] },
    ],
    calculationType: "aggregated",
  },
  {
    signalId: "time_to_hire",
    signalName: "Time to Hire",
    description: "Average days from job posting to offer acceptance",
    category: "People",
    valuableFor: ["HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "posting_date", type: "date", description: "Job posted", examples: ["2025-01-01"] },
      { name: "hire_date", type: "date", description: "Offer accepted", examples: ["2025-02-15"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "employee_satisfaction",
    signalName: "Employee Satisfaction (eNPS)",
    description: "Employee Net Promoter Score",
    category: "People",
    valuableFor: ["CEO", "HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "enps_rating", type: "number", description: "eNPS rating (0-10)", examples: ["9", "7", "4"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
  },
  {
    signalId: "revenue_per_employee",
    signalName: "Revenue per Employee",
    description: "Total revenue divided by headcount",
    category: "People",
    valuableFor: ["CEO", "CFO", "HR"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "revenue_amount", type: "number", description: "Total revenue", examples: ["5000000"] },
      { name: "employee_count", type: "number", description: "Headcount", examples: ["50"] },
    ],
    optionalFields: [],
    calculationType: "calculated",
  },
]

// Analyze uploaded data and discover available signals
export async function discoverSignals(
  rows: ParsedCSVRow[],
  dataSourceName = "Unknown",
): Promise<SignalDiscoveryResult> {
  // Step 1: Detect and analyze columns
  const detectedColumns = analyzeColumns(rows)

  // Step 2: Match signals against detected data structure
  const signalMatches = matchSignalsToData(detectedColumns, SIGNAL_DEFINITIONS)

  // Step 3: Categorize signals
  const available = signalMatches.filter((s) => s.availability === "available")
  const partial = signalMatches.filter((s) => s.availability === "partial")
  const unavailable = signalMatches.filter((s) => s.availability === "unavailable")

  // Step 4: Generate recommendations
  const recommendations = generateRecommendations(detectedColumns, available, partial)

  return {
    dataSource: dataSourceName,
    totalRowsAnalyzed: rows.length,
    detectedColumns,
    availableSignals: available,
    partialSignals: partial,
    unavailableSignals: unavailable,
    recommendations,
  }
}

function analyzeColumns(rows: ParsedCSVRow[]): DetectedColumn[] {
  if (rows.length === 0) return []

  const headers = Object.keys(rows[0])
  const columns: DetectedColumn[] = []

  for (const header of headers) {
    const values = rows.map((row) => row[header]).filter((v) => v !== null && v !== undefined && v !== "")

    const sampleValues = values.slice(0, 5).map(String)
    const nullCount = rows.length - values.length
    const uniqueCount = new Set(values).size

    // Infer type
    const { type, confidence } = inferColumnType(values)

    columns.push({
      name: header,
      inferredType: type,
      sampleValues,
      nullCount,
      uniqueCount,
      confidence,
    })
  }

  return columns
}

function inferColumnType(values: any[]): { type: DetectedColumn["inferredType"]; confidence: number } {
  if (values.length === 0) return { type: "unknown", confidence: 0 }

  let numberCount = 0
  let dateCount = 0
  let booleanCount = 0

  for (const value of values) {
    const str = String(value).trim().toLowerCase()

    // Check for boolean
    if (str === "true" || str === "false" || str === "yes" || str === "no" || str === "1" || str === "0") {
      booleanCount++
      continue
    }

    // Check for number
    if (!isNaN(Number(str)) && str !== "") {
      numberCount++
      continue
    }

    // Check for date
    if (isValidDate(str)) {
      dateCount++
      continue
    }
  }

  const total = values.length
  const numberRatio = numberCount / total
  const dateRatio = dateCount / total
  const booleanRatio = booleanCount / total

  // Determine type with confidence
  if (numberRatio > 0.8) return { type: "number", confidence: numberRatio }
  if (dateRatio > 0.8) return { type: "date", confidence: dateRatio }
  if (booleanRatio > 0.8) return { type: "boolean", confidence: booleanRatio }

  // Default to string
  return { type: "string", confidence: 0.9 }
}

function isValidDate(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime()) && str.length > 6 // Basic date validation
}

function matchSignalsToData(columns: DetectedColumn[], signals: SignalRequirement[]): DiscoveredSignal[] {
  const results: DiscoveredSignal[] = []

  for (const signal of signals) {
    const match = matchSignalToColumns(signal, columns)
    results.push(match)
  }

  // Sort by match score (descending)
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

function matchSignalToColumns(signal: SignalRequirement, columns: DetectedColumn[]): DiscoveredSignal {
  const matchedFields: string[] = []
  const missingFields: string[] = []

  // Check required fields
  for (const reqField of signal.requiredFields) {
    const match = findMatchingColumn(reqField, columns)
    if (match) {
      matchedFields.push(match.name)
    } else {
      missingFields.push(reqField.name)
    }
  }

  // Check optional fields
  for (const optField of signal.optionalFields) {
    const match = findMatchingColumn(optField, columns)
    if (match) {
      matchedFields.push(match.name)
    }
  }

  // Calculate match score
  const requiredMatched = signal.requiredFields.length - missingFields.length
  const requiredTotal = signal.requiredFields.length
  const matchScore = requiredTotal > 0 ? (requiredMatched / requiredTotal) * 100 : 0

  // Determine availability
  let availability: DiscoveredSignal["availability"]
  let reason: string

  if (matchScore === 100) {
    availability = "available"
    reason = `All required fields found: ${matchedFields.join(", ")}`
  } else if (matchScore >= 50) {
    availability = "partial"
    reason = `${requiredMatched}/${requiredTotal} required fields found. Missing: ${missingFields.join(", ")}`
  } else {
    availability = "unavailable"
    reason = `Insufficient data. Missing required fields: ${missingFields.join(", ")}`
  }

  return {
    signal,
    availability,
    matchScore,
    matchedFields,
    missingFields,
    reason,
  }
}

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
  health_status: [
    "health", "health score", "health status", "customer health", "account health",
    "risk level", "risk status", "churn risk", "engagement level",
  ],
  onboarding_status: [
    "onboarding status", "onboarding stage", "implementation status", "setup status",
    "activation status", "getting started", "onboarding progress",
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
  first_contact_date: [
    "first contact", "first touch", "first interaction", "initial contact",
    "first activity", "first engagement",
  ],
  activity_date: [
    "activity date", "last activity", "last active", "last seen", "last login",
    "last engagement", "recent activity", "last touch",
  ],
  renewal_date: [
    "renewal date", "contract renewal", "subscription renewal", "renewal due",
    "next renewal", "expiry date", "expiration date", "contract end",
  ],
  signup_date: [
    "signup date", "sign up date", "registration date", "join date", "enrolled date",
    "created date", "account created", "member since",
  ],
  hire_date: [
    "hire date", "start date", "join date", "employment date", "date hired",
    "onboard date", "commenced date",
  ],
  termination_date: [
    "termination date", "end date", "exit date", "last day", "departure date",
    "separation date", "offboard date",
  ],
  posting_date: [
    "posting date", "job posted", "published date", "open date", "requisition date",
  ],
  invoice_date: [
    "invoice date", "bill date", "billing date", "issued date", "statement date",
  ],
  payment_date: [
    "payment date", "paid date", "received date", "settlement date", "cleared date",
  ],
  churn_date: [
    "churn date", "cancellation date", "cancelled date", "churned date",
    "subscription end", "deactivation date",
  ],
  first_value_date: [
    "first value date", "activation date", "first use", "first action",
    "aha moment", "time to value",
  ],
  
  // ============================================
  // OWNER/ASSIGNEE FIELDS
  // ============================================
  owner: [
    // Generic
    "owner", "owner name", "assigned to", "assignee", "rep",
    // Zoho CRM
    "lead owner", "lead owner name", "deal owner", "deal owner name", "contact owner",
    "account owner", "potential owner", "record owner", "owner",
    // HubSpot
    "hubspot owner", "hs_owner_id", "owner name", "assigned to", "contact owner",
    "deal owner", "company owner",
    // Salesforce
    "owner", "owner name", "owner id", "assigned to",
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
  // SCORE/RATING FIELDS
  // ============================================
  satisfaction_rating: [
    // Generic
    "csat", "csat score", "satisfaction", "satisfaction score", "rating",
    // Zoho Desk
    "customer happiness rating", "happiness rating", "satisfaction rating",
    // Common
    "customer satisfaction", "happiness score", "feedback rating",
    "support rating", "service rating", "survey score",
  ],
  nps_rating: [
    "nps", "nps score", "net promoter", "promoter score", "nps rating",
    "likelihood to recommend", "recommendation score", "loyalty score",
  ],
  health_score: [
    "health score", "customer health", "account health", "engagement score",
    "health", "health rating", "product health score",
  ],
  lead_score: [
    // Zoho CRM
    "lead score", "score", "lead scoring",
    // HubSpot
    "hubspot score", "hs_lead_status", "lead score",
    // Common
    "prospect score", "mql score", "qualification score", "fit score",
  ],
  probability: [
    // Generic
    "probability", "win probability", "likelihood", "chance", "confidence",
    // Zoho CRM
    "probability (%)", "probability", "win probability",
    // HubSpot
    "hs_deal_stage_probability", "deal probability", "close probability",
    // Salesforce
    "probability", "forecast probability",
    // Common
    "close probability", "win rate", "success likelihood",
  ],
  expansion_score: [
    "expansion score", "upsell score", "growth score", "expansion potential",
    "upsell potential", "cross-sell score",
  ],
  enps_rating: [
    "enps", "employee nps", "enps score", "employee satisfaction",
    "employee rating", "staff satisfaction",
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
  channel: [
    "channel", "communication channel", "contact method", "medium",
    "platform", "touchpoint", "interaction channel",
    "support channel", "ticket channel", "source",
  ],
  campaign_name: [
    "campaign", "campaign name", "marketing campaign", "ad campaign",
    "campaign source", "utm campaign",
  ],
  
  // ============================================
  // CATEGORY/TYPE FIELDS
  // ============================================
  category: [
    // Generic
    "category", "type", "classification", "group", "segment",
    // Zoho Desk
    "category", "ticket category", "issue category", "classification",
    // Common
    "kind", "class", "product category", "service category",
    "department", "team", "division",
  ],
  subscription_type: [
    "subscription", "plan", "tier", "subscription type", "plan type",
    "package", "product", "pricing tier", "subscription plan",
    "membership", "license type", "edition",
  ],
  industry: [
    // Zoho CRM
    "industry", "industry type",
    // HubSpot
    "industry", "hs_industry",
    // Common
    "vertical", "sector", "business type", "market segment",
    "company industry", "account industry",
  ],
  company_size: [
    // Zoho CRM
    "no of employees", "employees", "company size",
    // HubSpot
    "numberofemployees", "company size", "hs_num_employees",
    // Common
    "employee count", "size", "headcount", "num employees",
    "employee range", "company segment", "size segment",
    "smb", "mid market", "enterprise", "startup",
  ],
  department: [
    "department", "dept", "team", "division", "business unit",
    "cost center", "org unit", "function",
  ],
  region: [
    "region", "territory", "area", "geography", "geo", "market",
    "country", "state", "location", "sales region", "district",
  ],
  revenue_type: [
    "revenue type", "transaction type", "billing type", "charge type",
    "expansion", "upsell", "cross sell", "new business", "renewal",
  ],
  expense_category: [
    "expense category", "expense type", "cost category", "spend category",
    "budget category", "gl category", "account category",
  ],
  
  // ============================================
  // NAME/TEXT FIELDS
  // ============================================
  subject: [
    "subject", "title", "name", "summary", "headline",
    "ticket subject", "case subject", "issue title", "request title",
  ],
  description: [
    "description", "details", "notes", "comments", "body", "content",
    "message", "ticket description", "issue description", "case description",
  ],
  feature_name: [
    "feature", "feature name", "product feature", "module", "capability",
    "functionality", "component",
  ],
  campaign_name: [
    "campaign", "campaign name", "marketing campaign", "campaign title",
    "ad campaign", "promotion",
  ],
  content_name: [
    "content", "content name", "asset", "resource", "material",
    "document", "file name",
  ],
  
  // ============================================
  // CONTACT FIELDS
  // ============================================
  email: [
    // Zoho CRM
    "email", "email address", "e-mail", "primary email",
    // HubSpot
    "email", "hs_email", "email address",
    // Common
    "work email", "business email", "contact email",
  ],
  phone: [
    // Zoho CRM
    "phone", "mobile", "phone number", "contact number",
    // HubSpot
    "phone", "hs_phone", "phone number", "mobilephone",
    // Common
    "telephone", "cell", "work phone", "business phone",
  ],
  company: [
    // Zoho CRM
    "company", "account name", "organization",
    // HubSpot
    "company", "associated company", "company name",
    // Common
    "organisation", "business", "firm", "employer",
  ],
  first_name: [
    "first name", "firstname", "given name", "forename",
  ],
  last_name: [
    "last name", "lastname", "surname", "family name",
  ],
  full_name: [
    "full name", "name", "contact name", "person name",
  ],
  website: [
    "website", "url", "web address", "company website", "site",
  ],
  
  // ============================================
  // METRIC FIELDS
  // ============================================
  visits: [
    "visits", "sessions", "page views", "pageviews", "views",
    "traffic", "visitors", "unique visitors",
  ],
  conversions: [
    "conversions", "converted", "leads generated", "form submissions",
    "signups", "registrations", "goals completed",
  ],
  downloads: [
    "downloads", "download count", "content downloads", "asset downloads",
  ],
  emails_sent: [
    "emails sent", "sent", "delivered", "messages sent",
  ],
  emails_opened: [
    "emails opened", "opened", "opens", "open count",
  ],
  emails_clicked: [
    "emails clicked", "clicked", "clicks", "click count",
  ],
  usage_count: [
    "usage count", "usage", "times used", "frequency", "count",
  ],
  session_duration: [
    "session duration", "time on site", "duration", "session length",
    "average session", "time spent",
  ],
  load_time: [
    "load time", "page load", "response time", "latency",
    "page speed", "performance",
  ],
  error_count: [
    "error count", "errors", "exceptions", "failures", "issues",
  ],
  request_count: [
    "request count", "requests", "api calls", "transactions", "events",
  ],
  new_customers: [
    "new customers", "customers acquired", "new accounts", "new clients",
    "customer additions", "signups",
  ],
  employee_count: [
    "employee count", "headcount", "staff count", "team size",
    "number of employees", "total employees",
  ],
  
  // ============================================
  // FINANCIAL FIELDS
  // ============================================
  quota: [
    "quota", "target", "goal", "sales quota", "revenue target",
    "booking target", "forecast", "plan",
  ],
  cac: [
    "cac", "customer acquisition cost", "acquisition cost", "cost per acquisition",
    "cpa", "cost per customer",
  ],
  ltv: [
    "ltv", "lifetime value", "customer lifetime value", "clv",
    "customer value", "cltv",
  ],
  burn_rate: [
    "burn rate", "monthly burn", "cash burn", "spend rate", "runway burn",
  ],
  cash_balance: [
    "cash balance", "cash", "bank balance", "available cash",
    "cash on hand", "treasury",
  ],
  cogs: [
    "cogs", "cost of goods sold", "cost of sales", "direct costs",
    "product costs",
  ],
  
  // ============================================
  // BOOLEAN/FLAG FIELDS
  // ============================================
  activated: [
    "activated", "active", "is active", "activation", "enabled",
  ],
  escalated: [
    "escalated", "is escalated", "escalation", "was escalated",
  ],
  reopened: [
    "reopened", "is reopened", "was reopened", "reopen",
  ],
  sla_met: [
    "sla met", "within sla", "sla compliance", "sla status",
    "sla breached", "breached sla",
  ],
  
  // ============================================
  // ZOHO-SPECIFIC FIELDS
  // ============================================
  // Zoho CRM specific mappings
  modified_time: [
    "modified time", "modified date", "last modified", "updated time",
    "last updated", "changed date",
  ],
  converted_date: [
    "converted date", "conversion date", "converted time",
    "lead converted date",
  ],
  
  // ============================================
  // HUBSPOT-SPECIFIC FIELDS
  // ============================================
  // HubSpot specific mappings
  lifecyclestage: [
    "lifecyclestage", "lifecycle stage", "life cycle stage",
    "customer journey stage", "funnel stage",
  ],
  hs_analytics_source: [
    "hs_analytics_source", "analytics source", "original source",
    "traffic source", "acquisition source",
  ],
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
  } else {
    recommendations.push("❌ No signals can be fully generated with current data structure")
  }

  // Recommendation 2: Partial signals
  if (partial.length > 0) {
    const topPartial = partial[0]
    recommendations.push(
      `⚠️ ${topPartial.signal.signalName} is partially available. Add columns: ${topPartial.missingFields.join(", ")}`,
    )
  }

  // Recommendation 3: Data quality
  const lowQualityColumns = columns.filter((c) => c.confidence < 0.7)
  if (lowQualityColumns.length > 0) {
    recommendations.push(
      `🔍 Some columns have ambiguous data types: ${lowQualityColumns.map((c) => c.name).join(", ")}. Consider cleaning your data.`,
    )
  }

  // Recommendation 4: Missing common fields
  const hasDate = columns.some((c) => c.inferredType === "date")
  if (!hasDate) {
    recommendations.push("📅 Add a date/timestamp column to enable time-series signals and trend analysis")
  }

  const hasId = columns.some((c) => c.name.toLowerCase().includes("id"))
  if (!hasId) {
    recommendations.push("🆔 Add unique identifier columns (customer_id, deal_id, etc.) to enable aggregation signals")
  }

  // Recommendation 5: Data source suggestions
  if (available.length < 5) {
    recommendations.push("💡 Connect additional data sources (CRM, support tickets, analytics) to unlock more signals")
  }

  return recommendations
}

// Detect source type from file name and column patterns
export function detectSourceType(fileName: string, columns: string[]): string {
  const fileNameLower = fileName.toLowerCase()
  const columnsLower = columns.map(c => c.toLowerCase())
  const columnsJoined = columnsLower.join(" ")

  // Zoho CRM patterns
  if (fileNameLower.includes("zoho") || 
      columnsLower.some(c => c.includes("zoho")) ||
      columnsJoined.includes("lead owner") ||
      columnsJoined.includes("potential name") ||
      columnsJoined.includes("deal owner")) {
    return "zoho_crm"
  }

  // Zoho Desk patterns
  if (columnsJoined.includes("ticket owner") ||
      columnsJoined.includes("customer happiness") ||
      (columnsJoined.includes("ticket") && columnsJoined.includes("agent"))) {
    return "zoho_desk"
  }

  // HubSpot patterns
  if (fileNameLower.includes("hubspot") ||
      columnsLower.some(c => c.startsWith("hs_")) ||
      columnsJoined.includes("hubspot owner") ||
      columnsJoined.includes("lifecyclestage") ||
      columnsJoined.includes("hs_object_id")) {
    return "hubspot"
  }

  // Salesforce patterns
  if (fileNameLower.includes("salesforce") ||
      columnsLower.some(c => c.includes("sfdc")) ||
      columnsJoined.includes("opportunity id") ||
      columnsJoined.includes("account owner") ||
      columnsJoined.includes("forecast category")) {
    return "salesforce"
  }

  // Stripe patterns
  if (fileNameLower.includes("stripe") ||
      columnsJoined.includes("stripe") ||
      columnsJoined.includes("subscription_id") ||
      (columnsJoined.includes("charge") && columnsJoined.includes("customer"))) {
    return "stripe"
  }

  // Intercom patterns
  if (fileNameLower.includes("intercom") ||
      columnsJoined.includes("conversation id") ||
      columnsJoined.includes("intercom")) {
    return "intercom"
  }

  // Zendesk patterns
  if (fileNameLower.includes("zendesk") ||
      columnsJoined.includes("zendesk") ||
      columnsJoined.includes("ticket_id") ||
      columnsJoined.includes("requester")) {
    return "zendesk"
  }

  // Google Analytics patterns
  if (fileNameLower.includes("analytics") ||
      columnsJoined.includes("sessions") ||
      columnsJoined.includes("pageviews") ||
      columnsJoined.includes("bounce rate")) {
    return "google_analytics"
  }

  // Finance/Accounting patterns
  if (columnsJoined.includes("invoice") ||
      columnsJoined.includes("accounts receivable") ||
      columnsJoined.includes("gl account") ||
      columnsJoined.includes("journal entry")) {
    return "accounting"
  }

  // HR/People patterns
  if (columnsJoined.includes("employee") ||
      columnsJoined.includes("hire date") ||
      columnsJoined.includes("department") ||
      columnsJoined.includes("salary")) {
    return "hr_system"
  }

  // Generic export
  return "csv_export"
}
