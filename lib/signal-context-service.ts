// Signal Context Service
// Connects three signal sources:
// a) Customer-requested signals (from onboarding goals)
// b) Data-available signals (from file upload discovery)
// c) Recommended signals (based on industry + role + stage)
//
// Also provides data guidance for missing/partial signals

import { SIGNAL_DEFINITIONS, type SignalRequirement } from "./signal-discovery-service"

// ============================================
// TYPES
// ============================================

export type SignalPriority = "priority_match" | "available" | "recommended" | "requested_missing"

export interface ContextualSignal {
  signal: SignalRequirement
  priority: SignalPriority
  // Why this signal matters to them
  reason: string
  // Data availability
  dataStatus: "full" | "partial" | "missing"
  matchedFields: string[]
  missingFields: string[]
  matchScore: number
  // Guidance for missing/partial data
  dataGuidance: DataGuidance | null
}

export interface DataGuidance {
  summary: string
  dataSource: string
  exportSteps: string[]
  exampleColumns: string[]
  difficulty: "easy" | "moderate" | "advanced"
}

export interface SignalContextResult {
  priorityMatch: ContextualSignal[]
  available: ContextualSignal[]
  recommended: ContextualSignal[]
  requestedMissing: ContextualSignal[]
  totalSignals: number
  dataCompleteness: number // 0-100 percentage
}

export interface UserProfile {
  industry: string
  role: string
  seniorityLevel: string
  department: string
  businessStage: string
  companySize: string
  goals: string[]
}

// ============================================
// GOAL -> SIGNAL MAPPING
// Maps onboarding goals to specific signal IDs
// ============================================

const GOAL_SIGNAL_MAP: Record<string, string[]> = {
  // Revenue & Growth
  increase_revenue: ["mrr", "arr", "revenue_growth_rate", "revenue_per_customer", "revenue_by_product"],
  improve_margins: ["gross_margin", "revenue_by_product", "operating_expenses"],
  accelerate_growth: ["revenue_growth_rate", "arr", "mrr", "new_leads", "total_leads"],
  expand_arr: ["arr", "mrr", "expansion_revenue", "net_revenue_retention", "revenue_growth_rate"],

  // Sales & Pipeline
  increase_pipeline: ["sales_pipeline_value", "weighted_pipeline", "pipeline_coverage", "deals_by_stage", "deals_by_source"],
  improve_win_rate: ["win_rate", "win_rate_by_owner", "deals_by_stage", "sales_cycle_length"],
  shorten_sales_cycle: ["sales_cycle_length", "sales_velocity", "deals_closing_this_month"],
  increase_deal_size: ["average_deal_size", "deal_value_by_owner", "revenue_per_customer"],

  // Customer Success
  reduce_churn: ["customer_churn_rate", "net_revenue_retention", "gross_revenue_retention", "customers_at_risk", "health_score"],
  improve_nrr: ["net_revenue_retention", "expansion_revenue", "expansion_opportunities", "customer_churn_rate"],
  increase_nps: ["nps_score", "csat_score", "health_score"],
  improve_onboarding: ["onboarding_completion", "time_to_value", "activation_rate"],

  // Efficiency & Operations
  reduce_cac: ["cac", "ltv_cac_ratio", "cac_payback", "leads_by_source"],
  improve_ltv_cac: ["ltv_cac_ratio", "customer_lifetime_value", "cac", "revenue_per_customer"],
  increase_efficiency: ["revenue_per_employee", "operating_expenses", "expenses_by_department"],
  reduce_costs: ["operating_expenses", "burn_rate", "expenses_by_department", "gross_margin"],
}

// ============================================
// PROFILE -> RECOMMENDED SIGNALS
// Based on industry + role + stage, which signals should they track
// ============================================

interface ProfileRecommendation {
  signalIds: string[]
  reason: string
}

function getProfileRecommendations(profile: UserProfile): ProfileRecommendation[] {
  const recommendations: ProfileRecommendation[] = []

  // Industry-based recommendations
  if (profile.industry === "b2b_saas" || profile.industry === "technology") {
    recommendations.push({
      signalIds: ["mrr", "arr", "net_revenue_retention", "customer_churn_rate"],
      reason: "Core SaaS metrics every B2B company should track",
    })
    if (profile.businessStage === "growth" || profile.businessStage === "expansion") {
      recommendations.push({
        signalIds: ["pipeline_coverage", "sales_velocity", "cac_payback"],
        reason: "Critical for scaling a growth-stage SaaS business",
      })
    }
  }

  if (profile.industry === "ecommerce" || profile.industry === "retail") {
    recommendations.push({
      signalIds: ["revenue_by_product", "revenue_by_region", "customer_lifetime_value", "cac"],
      reason: "Key e-commerce metrics for understanding unit economics",
    })
  }

  if (profile.industry === "professional_services") {
    recommendations.push({
      signalIds: ["revenue_per_employee", "gross_margin", "sales_pipeline_value", "win_rate"],
      reason: "Essential metrics for services businesses",
    })
  }

  // Role-based recommendations
  if (["ceo_founder", "coo"].includes(profile.role)) {
    recommendations.push({
      signalIds: ["revenue_growth_rate", "burn_rate", "runway", "headcount"],
      reason: "Executive dashboard essentials for strategic oversight",
    })
  }

  if (profile.role === "cfo") {
    recommendations.push({
      signalIds: ["gross_margin", "operating_expenses", "burn_rate", "runway", "accounts_receivable", "days_sales_outstanding"],
      reason: "Financial health metrics for CFO oversight",
    })
  }

  if (["cro", "vp_sales"].includes(profile.role)) {
    recommendations.push({
      signalIds: ["sales_pipeline_value", "win_rate", "average_deal_size", "sales_cycle_length", "quota_attainment", "deal_count_by_owner"],
      reason: "Sales leadership metrics for pipeline management",
    })
  }

  if (profile.role === "vp_marketing") {
    recommendations.push({
      signalIds: ["total_leads", "mql_count", "sql_count", "cac", "campaign_roi", "website_conversion_rate"],
      reason: "Marketing performance metrics for demand generation",
    })
  }

  if (profile.role === "vp_cs") {
    recommendations.push({
      signalIds: ["net_revenue_retention", "customer_churn_rate", "nps_score", "health_score", "customers_at_risk", "renewals_due"],
      reason: "Customer success metrics for retention and growth",
    })
  }

  if (profile.role === "vp_product" || profile.role === "vp_engineering") {
    recommendations.push({
      signalIds: ["dau", "mau", "feature_adoption", "activation_rate", "error_rate", "page_load_time"],
      reason: "Product and engineering health metrics",
    })
  }

  // Stage-based recommendations
  if (profile.businessStage === "pre_revenue" || profile.businessStage === "early_stage") {
    recommendations.push({
      signalIds: ["burn_rate", "runway", "total_leads", "activation_rate"],
      reason: "Early-stage survival metrics - know your runway and traction",
    })
  }

  if (profile.businessStage === "mature") {
    recommendations.push({
      signalIds: ["gross_margin", "operating_expenses", "revenue_per_employee", "employee_turnover"],
      reason: "Mature-stage efficiency and optimization metrics",
    })
  }

  return recommendations
}

// ============================================
// DATA GUIDANCE
// How to get the data for each signal category
// ============================================

const DATA_GUIDANCE_MAP: Record<string, DataGuidance> = {
  // Revenue signals
  mrr: {
    summary: "Export your subscription billing data showing recurring charges per customer per month",
    dataSource: "Billing system (Stripe, Chargebee, Recurly) or accounting software (Xero, QuickBooks)",
    exportSteps: [
      "Go to your billing platform's Reports section",
      "Export 'Subscription Revenue' or 'MRR' report for the last 6-12 months",
      "Include columns: customer name/ID, plan type, monthly amount, start date",
      "Save as CSV or Excel",
    ],
    exampleColumns: ["Customer ID", "Plan Name", "Monthly Amount", "Start Date", "Status"],
    difficulty: "easy",
  },
  arr: {
    summary: "Same data as MRR - we calculate ARR by annualizing your monthly recurring revenue",
    dataSource: "Billing system (Stripe, Chargebee, Recurly)",
    exportSteps: [
      "Export your subscription/invoice data with recurring amounts",
      "Include customer, plan, and amount fields",
      "We'll multiply monthly totals by 12 automatically",
    ],
    exampleColumns: ["Customer ID", "Plan Name", "Monthly Amount", "Start Date"],
    difficulty: "easy",
  },
  revenue_growth_rate: {
    summary: "Monthly revenue totals over time - at least 3 months of data needed to show growth trends",
    dataSource: "Accounting software or billing platform",
    exportSteps: [
      "Export monthly revenue summary for the last 6-12 months",
      "Each row should represent one month's total revenue",
      "Or export transaction-level data with dates - we'll aggregate it",
    ],
    exampleColumns: ["Month", "Total Revenue", "Recurring Revenue", "One-time Revenue"],
    difficulty: "easy",
  },
  net_revenue_retention: {
    summary: "Customer cohort revenue data showing how revenue changes from existing customers over time",
    dataSource: "Billing system or CRM with revenue tracking",
    exportSteps: [
      "Export customer revenue for two comparable periods (e.g., Jan vs Jul)",
      "Include: customer ID, revenue in period 1, revenue in period 2, status (active/churned)",
      "This lets us calculate expansion, contraction, and churn",
    ],
    exampleColumns: ["Customer ID", "Revenue Period 1", "Revenue Period 2", "Status", "Churn Date"],
    difficulty: "moderate",
  },
  gross_revenue_retention: {
    summary: "Similar to NRR but excludes expansion - shows how well you retain base revenue",
    dataSource: "Billing system or CRM",
    exportSteps: [
      "Same data as NRR - we'll calculate both from the same export",
      "Customer-level revenue across two time periods",
    ],
    exampleColumns: ["Customer ID", "Revenue Period 1", "Revenue Period 2", "Status"],
    difficulty: "moderate",
  },

  // Sales signals
  sales_pipeline_value: {
    summary: "Export your CRM deals/opportunities showing deal values and stages",
    dataSource: "CRM (HubSpot, Salesforce, Zoho, Pipedrive)",
    exportSteps: [
      "Go to your CRM's Deals or Opportunities section",
      "Export all open deals with: deal name, value, stage, owner, close date",
      "Include both open and recently closed deals for trend data",
    ],
    exampleColumns: ["Deal Name", "Amount", "Stage", "Owner", "Expected Close Date", "Created Date"],
    difficulty: "easy",
  },
  win_rate: {
    summary: "Closed deals data showing won vs lost outcomes over a period",
    dataSource: "CRM (HubSpot, Salesforce, Zoho, Pipedrive)",
    exportSteps: [
      "Export deals closed in the last 3-6 months",
      "Must include a 'Won/Lost' or 'Stage' field that indicates outcome",
      "Include close date for trend analysis",
    ],
    exampleColumns: ["Deal Name", "Amount", "Stage", "Won/Lost", "Close Date", "Owner"],
    difficulty: "easy",
  },
  average_deal_size: {
    summary: "Won deals with their values - we calculate the average from closed-won deals",
    dataSource: "CRM",
    exportSteps: [
      "Export closed-won deals from the last 6-12 months",
      "Include deal value/amount and close date",
    ],
    exampleColumns: ["Deal Name", "Amount", "Close Date", "Owner"],
    difficulty: "easy",
  },
  sales_cycle_length: {
    summary: "Deals with both created date and close date so we can calculate the time between them",
    dataSource: "CRM",
    exportSteps: [
      "Export closed deals with both 'Created Date' and 'Close Date'",
      "Include won and lost deals for comparison",
    ],
    exampleColumns: ["Deal Name", "Created Date", "Close Date", "Stage", "Won/Lost"],
    difficulty: "easy",
  },
  pipeline_coverage: {
    summary: "Open pipeline value compared to your revenue target - need both deals data and a target",
    dataSource: "CRM + your revenue target",
    exportSteps: [
      "Export all open deals with stages and expected values",
      "Know your quarterly or monthly revenue target",
      "We'll calculate: pipeline / target = coverage ratio",
    ],
    exampleColumns: ["Deal Name", "Amount", "Stage", "Expected Close Date"],
    difficulty: "moderate",
  },

  // Lead signals
  total_leads: {
    summary: "Export your contacts or leads list from your CRM",
    dataSource: "CRM or marketing automation (HubSpot, Salesforce, Mailchimp)",
    exportSteps: [
      "Go to your CRM's Contacts or Leads section",
      "Export all leads/contacts created in the last 3-6 months",
      "Include: name, email, source, status, created date",
    ],
    exampleColumns: ["Name", "Email", "Lead Source", "Status", "Created Date"],
    difficulty: "easy",
  },
  new_leads: {
    summary: "Recent leads with created dates - we'll count new leads per period",
    dataSource: "CRM or marketing automation",
    exportSteps: [
      "Export leads with their 'Created Date' field",
      "Include lead source for source-level analysis",
    ],
    exampleColumns: ["Name", "Email", "Lead Source", "Created Date"],
    difficulty: "easy",
  },

  // Customer Success signals
  customer_churn_rate: {
    summary: "Customer list showing who is active, churned, and when they churned",
    dataSource: "Billing system or CRM",
    exportSteps: [
      "Export your customer list with: status (active/churned), start date, and churn date if applicable",
      "Include at least 6 months of data for meaningful churn analysis",
      "If using billing data, cancelled subscriptions work well",
    ],
    exampleColumns: ["Customer ID", "Name", "Status", "Start Date", "Churn Date", "Monthly Revenue"],
    difficulty: "moderate",
  },
  nps_score: {
    summary: "NPS survey responses with scores and dates",
    dataSource: "Survey tool (Delighted, SurveyMonkey, Typeform) or customer success platform",
    exportSteps: [
      "Export NPS survey results with: customer, score (0-10), date",
      "Include at least 30 responses for a statistically meaningful score",
      "If you don't run NPS surveys yet, tools like Delighted make it easy to start",
    ],
    exampleColumns: ["Customer ID", "NPS Score", "Response Date", "Comment"],
    difficulty: "moderate",
  },
  csat_score: {
    summary: "Customer satisfaction scores from surveys or support interactions",
    dataSource: "Support platform (Zendesk, Intercom, Freshdesk) or survey tool",
    exportSteps: [
      "Export CSAT ratings from your support tool",
      "Or export customer survey results with satisfaction scores",
    ],
    exampleColumns: ["Customer ID", "CSAT Score", "Date", "Channel"],
    difficulty: "moderate",
  },
  health_score: {
    summary: "Composite customer health data - product usage, support tickets, billing status",
    dataSource: "Customer success platform (Gainsight, Totango, ChurnZero) or build from multiple sources",
    exportSteps: [
      "If you have a CS platform, export the health score report",
      "Otherwise, you'll need to combine: product usage data, support ticket volume, billing status",
      "Start with what you have - even partial data helps identify at-risk customers",
    ],
    exampleColumns: ["Customer ID", "Health Score", "Usage Score", "Support Score", "Last Activity Date"],
    difficulty: "advanced",
  },

  // Support signals
  total_tickets: {
    summary: "Support ticket data from your helpdesk",
    dataSource: "Support platform (Zendesk, Freshdesk, Intercom, HubSpot Service Hub)",
    exportSteps: [
      "Go to your support tool's Reports or Export section",
      "Export tickets for the last 3-6 months",
      "Include: ticket ID, subject, status, priority, created date, resolved date, agent",
    ],
    exampleColumns: ["Ticket ID", "Subject", "Status", "Priority", "Created Date", "Resolved Date", "Agent"],
    difficulty: "easy",
  },
  average_resolution_time: {
    summary: "Resolved tickets with both created and resolved timestamps",
    dataSource: "Support platform",
    exportSteps: [
      "Export resolved tickets with created date and resolved date",
      "Include priority for segmented analysis",
    ],
    exampleColumns: ["Ticket ID", "Created Date", "Resolved Date", "Priority"],
    difficulty: "easy",
  },

  // Finance signals
  gross_margin: {
    summary: "Revenue and cost of goods sold (COGS) data",
    dataSource: "Accounting software (Xero, QuickBooks, NetSuite)",
    exportSteps: [
      "Export your P&L or income statement",
      "Need: total revenue and total COGS/cost of revenue per month",
      "Gross Margin = (Revenue - COGS) / Revenue",
    ],
    exampleColumns: ["Month", "Revenue", "COGS", "Gross Profit"],
    difficulty: "moderate",
  },
  burn_rate: {
    summary: "Monthly expenses and cash balance over time",
    dataSource: "Accounting software or bank statements",
    exportSteps: [
      "Export monthly total expenses for the last 6-12 months",
      "Include current cash/bank balance for runway calculation",
    ],
    exampleColumns: ["Month", "Total Expenses", "Cash Balance"],
    difficulty: "moderate",
  },
  operating_expenses: {
    summary: "Expense breakdown by category or department",
    dataSource: "Accounting software",
    exportSteps: [
      "Export expense reports broken down by category",
      "Include: category, amount, date",
    ],
    exampleColumns: ["Category", "Amount", "Month", "Department"],
    difficulty: "moderate",
  },

  // Marketing signals
  cac: {
    summary: "Marketing/sales spend and new customer count per period",
    dataSource: "Accounting + CRM combined",
    exportSteps: [
      "Calculate total sales + marketing spend per month",
      "Count new customers acquired per month",
      "CAC = Total spend / New customers",
      "This often requires combining data from multiple systems",
    ],
    exampleColumns: ["Month", "Marketing Spend", "Sales Spend", "New Customers Acquired"],
    difficulty: "advanced",
  },

  // HR signals
  headcount: {
    summary: "Employee roster with departments, start dates, and end dates",
    dataSource: "HR system (BambooHR, Gusto, Rippling) or payroll",
    exportSteps: [
      "Export your employee list with: name, department, start date, status",
      "Include terminated employees with end dates for turnover analysis",
    ],
    exampleColumns: ["Name", "Department", "Start Date", "End Date", "Status"],
    difficulty: "easy",
  },
  employee_turnover: {
    summary: "Employee data with hire dates and termination dates",
    dataSource: "HR system or payroll",
    exportSteps: [
      "Export all employees (current and former) from the last 12 months",
      "Include start date and end date/termination date",
    ],
    exampleColumns: ["Name", "Department", "Start Date", "End Date", "Reason for Leaving"],
    difficulty: "moderate",
  },

  // Product signals
  dau: {
    summary: "Daily active user counts from your product analytics",
    dataSource: "Product analytics (Mixpanel, Amplitude, PostHog, Google Analytics)",
    exportSteps: [
      "Export daily active users for the last 30-90 days",
      "Or export raw event data with user IDs and timestamps",
      "We'll calculate DAU, WAU, MAU from event data",
    ],
    exampleColumns: ["Date", "Active Users", "New Users", "Sessions"],
    difficulty: "moderate",
  },
  feature_adoption: {
    summary: "Feature usage data showing which features users engage with",
    dataSource: "Product analytics platform",
    exportSteps: [
      "Export feature-level usage: feature name, unique users, total events, time period",
      "Most analytics tools have a 'Feature Usage' or 'Event Count' report",
    ],
    exampleColumns: ["Feature Name", "Unique Users", "Total Events", "Date"],
    difficulty: "moderate",
  },
}

// Default guidance for signals without specific guidance
function getDefaultGuidance(signal: SignalRequirement): DataGuidance {
  const categorySourceMap: Record<string, string> = {
    Revenue: "Billing or accounting system (Stripe, Xero, QuickBooks)",
    Sales: "CRM (HubSpot, Salesforce, Zoho, Pipedrive)",
    "Sales Pipeline": "CRM deals/opportunities export",
    Marketing: "Marketing automation or analytics platform",
    "Customer Success": "Customer success platform or CRM",
    Support: "Helpdesk (Zendesk, Freshdesk, Intercom)",
    Product: "Product analytics (Mixpanel, Amplitude, PostHog)",
    Finance: "Accounting software (Xero, QuickBooks, NetSuite)",
    HR: "HR platform (BambooHR, Gusto, Rippling)",
  }

  const dataSource = categorySourceMap[signal.category] || "Your relevant business system"

  return {
    summary: `Export data containing ${signal.requiredFields.map(f => f.description).join(", ")}`,
    dataSource,
    exportSteps: [
      `Open your ${dataSource.split("(")[0].trim()}`,
      "Navigate to Reports or Export section",
      `Export data that includes: ${signal.requiredFields.map(f => f.name).join(", ")}`,
      "Save as CSV or Excel and upload here",
    ],
    exampleColumns: signal.requiredFields.map(f => f.name).concat(signal.optionalFields.slice(0, 2).map(f => f.name)),
    difficulty: "moderate" as const,
  }
}

// ============================================
// MAIN FUNCTION
// Merges the three sources and categorizes signals
// ============================================

export interface DiscoveredSignalInput {
  signal: SignalRequirement
  availability: "available" | "partial" | "unavailable"
  matchScore: number
  matchedFields: string[]
  missingFields: string[]
}

export function buildSignalContext(
  profile: UserProfile,
  discoveredSignals: DiscoveredSignalInput[]
): SignalContextResult {
  // 1. Build lookup of discovered signals
  const discoveredMap = new Map<string, DiscoveredSignalInput>()
  for (const ds of discoveredSignals) {
    discoveredMap.set(ds.signal.signalId, ds)
  }

  // 2. Get user-requested signal IDs from goals
  const requestedSignalIds = new Set<string>()
  for (const goal of profile.goals) {
    const mapped = GOAL_SIGNAL_MAP[goal]
    if (mapped) {
      mapped.forEach(id => requestedSignalIds.add(id))
    }
  }

  // 3. Get recommended signal IDs from profile
  const recommendedSignalIds = new Set<string>()
  const recommendationReasons = new Map<string, string>()
  for (const rec of getProfileRecommendations(profile)) {
    for (const id of rec.signalIds) {
      recommendedSignalIds.add(id)
      if (!recommendationReasons.has(id)) {
        recommendationReasons.set(id, rec.reason)
      }
    }
  }

  // 4. Categorize every signal into one of four buckets
  const priorityMatch: ContextualSignal[] = []
  const available: ContextualSignal[] = []
  const recommended: ContextualSignal[] = []
  const requestedMissing: ContextualSignal[] = []

  const processedIds = new Set<string>()

  // Helper to build a ContextualSignal
  function buildContextual(
    signal: SignalRequirement,
    priority: SignalPriority,
    reason: string,
    discovered?: DiscoveredSignalInput
  ): ContextualSignal {
    const guidanceEntry = DATA_GUIDANCE_MAP[signal.signalId]
    const dataStatus = discovered
      ? discovered.availability === "available" ? "full" : discovered.availability === "partial" ? "partial" : "missing"
      : "missing"

    return {
      signal,
      priority,
      reason,
      dataStatus,
      matchedFields: discovered?.matchedFields || [],
      missingFields: discovered?.missingFields || signal.requiredFields.map(f => f.name),
      matchScore: discovered?.matchScore || 0,
      dataGuidance: dataStatus !== "full" ? (guidanceEntry || getDefaultGuidance(signal)) : null,
    }
  }

  // Pass 1: Priority Match - user requested AND data supports it
  for (const signalId of requestedSignalIds) {
    const discovered = discoveredMap.get(signalId)
    const signalDef = SIGNAL_DEFINITIONS.find(s => s.signalId === signalId)
    if (!signalDef) continue

    if (discovered && (discovered.availability === "available" || discovered.availability === "partial")) {
      priorityMatch.push(buildContextual(
        signalDef,
        "priority_match",
        `Matches your goal and data is ${discovered.availability === "available" ? "fully available" : "partially available"}`,
        discovered
      ))
      processedIds.add(signalId)
    }
  }

  // Pass 2: Available - data supports it, user didn't explicitly ask
  for (const ds of discoveredSignals) {
    if (processedIds.has(ds.signal.signalId)) continue
    if (ds.availability !== "available") continue

    const reason = recommendedSignalIds.has(ds.signal.signalId)
      ? recommendationReasons.get(ds.signal.signalId) || "Recommended for your profile"
      : "Your data supports this signal"

    available.push(buildContextual(ds.signal, "available", reason, ds))
    processedIds.add(ds.signal.signalId)
  }

  // Pass 3: Recommended - best practice for profile, not yet matched to data
  for (const signalId of recommendedSignalIds) {
    if (processedIds.has(signalId)) continue
    const signalDef = SIGNAL_DEFINITIONS.find(s => s.signalId === signalId)
    if (!signalDef) continue

    const discovered = discoveredMap.get(signalId)
    const reason = recommendationReasons.get(signalId) || "Recommended for your role and industry"

    recommended.push(buildContextual(signalDef, "recommended", reason, discovered))
    processedIds.add(signalId)
  }

  // Pass 4: Requested but Missing - user asked, data doesn't have it, not already recommended
  for (const signalId of requestedSignalIds) {
    if (processedIds.has(signalId)) continue
    const signalDef = SIGNAL_DEFINITIONS.find(s => s.signalId === signalId)
    if (!signalDef) continue

    const discovered = discoveredMap.get(signalId)

    requestedMissing.push(buildContextual(
      signalDef,
      "requested_missing",
      "You asked for this, but the uploaded data doesn't contain the fields needed",
      discovered
    ))
    processedIds.add(signalId)
  }

  // Sort each bucket by match score descending
  priorityMatch.sort((a, b) => b.matchScore - a.matchScore)
  available.sort((a, b) => b.matchScore - a.matchScore)

  // Calculate data completeness
  const totalRequested = requestedSignalIds.size + recommendedSignalIds.size
  const totalAvailable = priorityMatch.length + available.length
  const dataCompleteness = totalRequested > 0 ? Math.round((totalAvailable / totalRequested) * 100) : 0

  return {
    priorityMatch,
    available,
    recommended,
    requestedMissing,
    totalSignals: priorityMatch.length + available.length + recommended.length + requestedMissing.length,
    dataCompleteness: Math.min(dataCompleteness, 100),
  }
}

// ============================================
// EXPORT: Get guidance for any signal by ID
// Useful for showing guidance on signal detail pages
// ============================================

export function getSignalGuidance(signalId: string): DataGuidance | null {
  const guidance = DATA_GUIDANCE_MAP[signalId]
  if (guidance) return guidance

  const signal = SIGNAL_DEFINITIONS.find(s => s.signalId === signalId)
  if (signal) return getDefaultGuidance(signal)

  return null
}
