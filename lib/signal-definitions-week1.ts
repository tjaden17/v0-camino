/**
 * Week 1 Core Signal Definitions (MSS Delivery Plan)
 * 
 * Cut from 93 to ~20 signals. Every signal has an explicit calcSpec.
 * No heuristic calculations. If a signal doesn't have a calcSpec, it doesn't exist.
 * 
 * Aligned to first customer's Zoho data:
 * - Deals: pipeline value, closed-won revenue, win rate, avg deal size, deals by owner, deals by stage, sales cycle length
 * - Leads: total leads, leads per month, leads by owner, lead conversion rate
 * - Support: ticket volume, tickets per month, tickets by status, tickets by priority, avg resolution time
 * - Custom: event count, events per period, events by entity
 */

import type { SignalRequirement, CalculationSpec } from "./signal-discovery-service"

// ============================================
// CORE SIGNAL DEFINITIONS (Week 1)
// ============================================

export const WEEK1_CORE_SIGNALS: SignalRequirement[] = [
  // ============================================
  // DEAL SIGNALS (7)
  // ============================================
  {
    signalId: "pipeline_value",
    signalName: "Pipeline Value",
    description: "Total value of all open deals",
    category: "Sales",
    valuableFor: ["VP Sales", "CEO", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["25000"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "proposal"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities", "crm"],
      operation: "sum",
      valueField: "deal_value",
      dateField: "close_date",
      filters: [
        { field: "stage", op: "excludes", values: ["closed won", "won", "closed lost", "lost", "cancelled", "canceled"] },
      ],
      displayUnit: "currency",
    },
  },
  {
    signalId: "closed_won_revenue",
    signalName: "Closed Won Revenue",
    description: "Total value of closed-won deals",
    category: "Sales",
    valuableFor: ["VP Sales", "CFO", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "deal_value", type: "number", description: "Deal amount", examples: ["25000"] },
      { name: "stage", type: "string", description: "Deal stage", examples: ["closed won", "won"] },
    ],
    optionalFields: [
      { name: "close_date", type: "date", description: "Close date", examples: ["2025-01-15"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities", "crm"],
      operation: "sum",
      valueField: "deal_value",
      dateField: "close_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won", "success"] },
      ],
      displayUnit: "currency",
    },
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
      { name: "close_date", type: "date", description: "Close date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities", "crm"],
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
      sourceTab: ["deals", "opportunities", "crm"],
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
    signalId: "deals_by_owner",
    signalName: "Deals by Owner",
    description: "Number of deals per sales representative",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Deal owner", examples: ["John Smith"] },
    ],
    optionalFields: [
      { name: "stage", type: "string", description: "Deal stage", examples: ["qualified", "won"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["deals", "opportunities", "crm"],
      operation: "group_by",
      valueField: null,
      dateField: "close_date",
      filters: [],
      groupByField: "owner",
      displayUnit: "count",
    },
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
      sourceTab: ["deals", "opportunities", "crm"],
      operation: "group_by",
      valueField: null,
      dateField: null,
      filters: [],
      groupByField: "stage",
      displayUnit: "count",
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
      sourceTab: ["deals", "opportunities", "crm"],
      operation: "duration_avg",
      valueField: "close_date",
      dateField: "created_date",
      filters: [
        { field: "stage", op: "includes", values: ["closed won", "won"] },
      ],
      displayUnit: "days",
    },
  },

  // ============================================
  // LEAD SIGNALS (4)
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
    signalId: "leads_per_month",
    signalName: "Leads per Month",
    description: "Monthly rate of new lead creation",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-15"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
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
    signalId: "leads_by_owner",
    signalName: "Leads by Owner",
    description: "Number of leads per sales representative",
    category: "Sales",
    valuableFor: ["VP Sales", "Sales Team"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "owner", type: "string", description: "Lead owner", examples: ["John Smith"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["leads", "contacts"],
      operation: "group_by",
      valueField: null,
      dateField: "created_date",
      filters: [],
      groupByField: "owner",
      displayUnit: "count",
    },
  },
  {
    signalId: "lead_conversion_rate",
    signalName: "Lead Conversion Rate",
    description: "Percentage of leads that converted to customers",
    category: "Sales",
    valuableFor: ["VP Sales", "Marketing"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Lead status", examples: ["converted", "customer", "qualified", "disqualified"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Lead creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["leads", "contacts"],
      operation: "rate",
      valueField: null,
      dateField: "created_date",
      filters: [],
      positiveStatuses: ["converted", "customer", "closed won"],
      displayUnit: "percent",
    },
  },

  // ============================================
  // SUPPORT/TICKET SIGNALS (5)
  // ============================================
  {
    signalId: "ticket_volume",
    signalName: "Ticket Volume",
    description: "Total number of support tickets",
    category: "Support",
    valuableFor: ["Head of Support", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "ticket_id", type: "string", description: "Ticket identifier", examples: ["TICK-001"] },
    ],
    optionalFields: [
      { name: "created_date", type: "date", description: "Ticket creation date", examples: ["2025-01-01"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["tickets", "support", "desk"],
      operation: "count",
      valueField: null,
      dateField: "created_date",
      filters: [],
      displayUnit: "count",
    },
  },
  {
    signalId: "tickets_per_month",
    signalName: "Tickets per Month",
    description: "Monthly rate of ticket creation",
    category: "Support",
    valuableFor: ["Head of Support", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Ticket creation date", examples: ["2025-01-15"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["tickets", "support", "desk"],
      operation: "monthly_rate",
      valueField: null,
      dateField: "created_date",
      filters: [],
      rateUnit: "month",
      displayUnit: "count",
    },
  },
  {
    signalId: "tickets_by_status",
    signalName: "Tickets by Status",
    description: "Distribution of tickets across statuses",
    category: "Support",
    valuableFor: ["Head of Support", "Support Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "status", type: "string", description: "Ticket status", examples: ["open", "in progress", "resolved", "closed"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["tickets", "support", "desk"],
      operation: "group_by",
      valueField: null,
      dateField: null,
      filters: [],
      groupByField: "status",
      displayUnit: "count",
    },
  },
  {
    signalId: "tickets_by_priority",
    signalName: "Tickets by Priority",
    description: "Distribution of tickets by priority level",
    category: "Support",
    valuableFor: ["Head of Support", "Support Team"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "priority", type: "string", description: "Ticket priority", examples: ["low", "medium", "high", "urgent"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["tickets", "support", "desk"],
      operation: "group_by",
      valueField: null,
      dateField: null,
      filters: [],
      groupByField: "priority",
      displayUnit: "count",
    },
  },
  {
    signalId: "avg_resolution_time",
    signalName: "Avg Resolution Time",
    description: "Average time to resolve tickets (in hours)",
    category: "Support",
    valuableFor: ["Head of Support", "Support Team", "CEO"],
    businessStage: ["Post-PMF", "Scaling"],
    requiredFields: [
      { name: "created_date", type: "date", description: "Ticket created date", examples: ["2025-01-01"] },
      { name: "resolved_date", type: "date", description: "Ticket resolved date", examples: ["2025-01-03"] },
    ],
    optionalFields: [
      { name: "status", type: "string", description: "Ticket status", examples: ["resolved", "closed"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["tickets", "support", "desk"],
      operation: "duration_avg",
      valueField: "resolved_date",
      dateField: "created_date",
      filters: [
        { field: "status", op: "includes", values: ["resolved", "closed"] },
      ],
      displayUnit: "hours",
    },
  },

  // ============================================
  // CUSTOM/EVENT SIGNALS (4)
  // ============================================
  {
    signalId: "event_count",
    signalName: "Event Count",
    description: "Total number of events",
    category: "Custom",
    valuableFor: ["Product", "CEO"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "event_id", type: "string", description: "Event identifier", examples: ["EVT-001"] },
    ],
    optionalFields: [
      { name: "event_date", type: "date", description: "Event date", examples: ["2025-01-15"] },
    ],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["events", "activity", "custom"],
      operation: "count",
      valueField: null,
      dateField: "event_date",
      filters: [],
      displayUnit: "count",
    },
  },
  {
    signalId: "events_per_period",
    signalName: "Events per Month",
    description: "Monthly rate of events",
    category: "Custom",
    valuableFor: ["Product", "CEO"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "event_date", type: "date", description: "Event date", examples: ["2025-01-15"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["events", "activity", "custom"],
      operation: "monthly_rate",
      valueField: null,
      dateField: "event_date",
      filters: [],
      rateUnit: "month",
      displayUnit: "count",
    },
  },
  {
    signalId: "events_by_entity",
    signalName: "Events by Entity",
    description: "Distribution of events across entities",
    category: "Custom",
    valuableFor: ["Product", "CEO"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "entity", type: "string", description: "Entity identifier", examples: ["customer_id", "user_id", "account_id"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["events", "activity", "custom"],
      operation: "group_by",
      valueField: null,
      dateField: "event_date",
      filters: [],
      groupByField: "entity",
      displayUnit: "count",
    },
  },
  {
    signalId: "events_by_type",
    signalName: "Events by Type",
    description: "Distribution of events by type",
    category: "Custom",
    valuableFor: ["Product", "CEO"],
    businessStage: ["Early", "Post-PMF", "Scaling"],
    requiredFields: [
      { name: "event_type", type: "string", description: "Event type", examples: ["login", "purchase", "signup"] },
    ],
    optionalFields: [],
    calculationType: "aggregated",
    calcSpec: {
      sourceTab: ["events", "activity", "custom"],
      operation: "group_by",
      valueField: null,
      dateField: "event_date",
      filters: [],
      groupByField: "event_type",
      displayUnit: "count",
    },
  },
]

/**
 * Get all Week 1 core signals
 */
export function getWeek1CoreSignals(): SignalRequirement[] {
  return WEEK1_CORE_SIGNALS
}

/**
 * Get signal by ID
 */
export function getWeek1SignalById(signalId: string): SignalRequirement | undefined {
  return WEEK1_CORE_SIGNALS.find(s => s.signalId === signalId)
}

/**
 * Get signals by category
 */
export function getWeek1SignalsByCategory(category: string): SignalRequirement[] {
  return WEEK1_CORE_SIGNALS.filter(s => s.category === category)
}
