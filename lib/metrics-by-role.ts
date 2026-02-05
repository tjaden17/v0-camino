import type { UserRole } from "./types"

export interface MetricRecommendation {
  id: string
  name: string
  description: string
  category: "lagging" | "leading"
  requiredDatasets: string[]
  decisionsEnabled: string
}

export const metricsByRole: Record<UserRole, MetricRecommendation[]> = {
  ceo: [
    {
      id: "revenue-growth",
      name: "Revenue Growth",
      description: "Overall company revenue trajectory",
      category: "lagging",
      requiredDatasets: ["NetSuite", "Salesforce", "Stripe"],
      decisionsEnabled: "Company strategy, investment allocation",
    },
    {
      id: "margins",
      name: "Profit Margins",
      description: "Company profitability metrics",
      category: "lagging",
      requiredDatasets: ["NetSuite", "QuickBooks"],
      decisionsEnabled: "Company strategy, investment allocation",
    },
    {
      id: "burn-rate",
      name: "Burn Rate",
      description: "Monthly cash consumption",
      category: "lagging",
      requiredDatasets: ["NetSuite", "QuickBooks"],
      decisionsEnabled: "Company strategy, investment allocation",
    },
    {
      id: "gtm-efficiency",
      name: "GTM Efficiency",
      description: "Go-to-market efficiency ratio",
      category: "leading",
      requiredDatasets: ["HubSpot", "Salesforce", "NetSuite"],
      decisionsEnabled: "Company strategy, investment allocation",
    },
    {
      id: "retention",
      name: "Customer Retention",
      description: "Percentage of customers retained",
      category: "leading",
      requiredDatasets: ["Amplitude", "Salesforce"],
      decisionsEnabled: "Company strategy, investment allocation",
    },
  ],
  cto: [
    {
      id: "system-reliability",
      name: "System Reliability",
      description: "Service uptime and stability",
      category: "lagging",
      requiredDatasets: ["Datadog", "PagerDuty"],
      decisionsEnabled: "Tech strategy, architecture, resourcing",
    },
    {
      id: "deployment-frequency",
      name: "Deployment Frequency",
      description: "How often code is deployed",
      category: "leading",
      requiredDatasets: ["GitHub", "Jira"],
      decisionsEnabled: "Tech strategy, architecture, resourcing",
    },
    {
      id: "incident-rate",
      name: "Incident Rate",
      description: "Production incidents per week",
      category: "leading",
      requiredDatasets: ["PagerDuty", "Datadog"],
      decisionsEnabled: "Tech strategy, architecture, resourcing",
    },
    {
      id: "engineering-velocity",
      name: "Engineering Velocity",
      description: "Speed of delivery and iteration",
      category: "leading",
      requiredDatasets: ["Jira", "Linear", "GitHub"],
      decisionsEnabled: "Tech strategy, architecture, resourcing",
    },
  ],
  cpo: [
    {
      id: "retention",
      name: "User Retention",
      description: "Users returning over time",
      category: "lagging",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "Product portfolio priorities & resource allocation",
    },
    {
      id: "activation",
      name: "Activation Rate",
      description: "Users reaching first value",
      category: "lagging",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "Product portfolio priorities & resource allocation",
    },
    {
      id: "adoption",
      name: "Feature Adoption",
      description: "Adoption of key features",
      category: "leading",
      requiredDatasets: ["Amplitude", "Productboard"],
      decisionsEnabled: "Product portfolio priorities & resource allocation",
    },
    {
      id: "nps",
      name: "Net Promoter Score",
      description: "Customer satisfaction and loyalty",
      category: "leading",
      requiredDatasets: ["Zendesk", "Delighted"],
      decisionsEnabled: "Product portfolio priorities & resource allocation",
    },
    {
      id: "arr-impact",
      name: "ARR Impact",
      description: "Impact on annual recurring revenue",
      category: "leading",
      requiredDatasets: ["Salesforce", "Stripe"],
      decisionsEnabled: "Product portfolio priorities & resource allocation",
    },
  ],
  "product-manager": [
    {
      id: "retention",
      name: "User Retention",
      description: "Users returning over time",
      category: "lagging",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "What to build next, roadmap priorities",
    },
    {
      id: "engagement",
      name: "User Engagement",
      description: "Depth and frequency of product usage",
      category: "lagging",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "What to build next, roadmap priorities",
    },
    {
      id: "adoption-funnels",
      name: "Adoption Funnels",
      description: "Conversion through key user journeys",
      category: "leading",
      requiredDatasets: ["Amplitude", "Hotjar"],
      decisionsEnabled: "What to build next, roadmap priorities",
    },
    {
      id: "csat",
      name: "Customer Satisfaction",
      description: "User satisfaction scores",
      category: "leading",
      requiredDatasets: ["Zendesk", "Intercom"],
      decisionsEnabled: "What to build next, roadmap priorities",
    },
  ],
  "engineering-manager": [
    {
      id: "velocity",
      name: "Sprint Velocity",
      description: "Story points completed per sprint",
      category: "lagging",
      requiredDatasets: ["Jira", "Linear"],
      decisionsEnabled: "Sprint capacity planning, prioritization",
    },
    {
      id: "cycle-time",
      name: "Cycle Time",
      description: "Time from start to completion",
      category: "leading",
      requiredDatasets: ["Jira", "GitHub"],
      decisionsEnabled: "Sprint capacity planning, prioritization",
    },
    {
      id: "bug-counts",
      name: "Bug Counts",
      description: "Number of open bugs",
      category: "leading",
      requiredDatasets: ["Jira", "Linear"],
      decisionsEnabled: "Sprint capacity planning, prioritization",
    },
    {
      id: "on-call-load",
      name: "On-Call Load",
      description: "Time spent on incidents",
      category: "leading",
      requiredDatasets: ["PagerDuty", "Jira"],
      decisionsEnabled: "Sprint capacity planning, prioritization",
    },
  ],
  "design-lead": [
    {
      id: "task-completion",
      name: "Task Completion Rate",
      description: "Percentage of completed user tasks",
      category: "lagging",
      requiredDatasets: ["Hotjar", "Maze"],
      decisionsEnabled: "UX direction, problem prioritization",
    },
    {
      id: "usability-scores",
      name: "Usability Scores",
      description: "SUS or similar usability metrics",
      category: "leading",
      requiredDatasets: ["UserTesting", "Maze"],
      decisionsEnabled: "UX direction, problem prioritization",
    },
    {
      id: "drop-off-rate",
      name: "Drop-off Rate",
      description: "Where users abandon flows",
      category: "leading",
      requiredDatasets: ["Hotjar", "FullStory"],
      decisionsEnabled: "UX direction, problem prioritization",
    },
  ],
  "sales-manager": [
    {
      id: "pipeline-coverage",
      name: "Pipeline Coverage",
      description: "Pipeline value vs quota",
      category: "lagging",
      requiredDatasets: ["Salesforce", "HubSpot"],
      decisionsEnabled: "Forecasting, pipeline management, deal coaching",
    },
    {
      id: "win-rate",
      name: "Win Rate",
      description: "Percentage of deals won",
      category: "lagging",
      requiredDatasets: ["Salesforce", "HubSpot"],
      decisionsEnabled: "Forecasting, pipeline management, deal coaching",
    },
    {
      id: "quota-attainment",
      name: "Quota Attainment",
      description: "Sales team performance vs targets",
      category: "leading",
      requiredDatasets: ["Salesforce", "Gong"],
      decisionsEnabled: "Forecasting, pipeline management, deal coaching",
    },
  ],
  "marketing-manager": [
    {
      id: "cac",
      name: "Customer Acquisition Cost",
      description: "Cost to acquire a customer",
      category: "lagging",
      requiredDatasets: ["HubSpot", "Google Analytics"],
      decisionsEnabled: "Campaign mix, content calendar, budget allocation",
    },
    {
      id: "roas",
      name: "Return on Ad Spend",
      description: "Revenue per ad dollar spent",
      category: "lagging",
      requiredDatasets: ["Meta Ads", "Google Ads", "HubSpot"],
      decisionsEnabled: "Campaign mix, content calendar, budget allocation",
    },
    {
      id: "mql-volume",
      name: "MQL Volume",
      description: "Marketing qualified leads",
      category: "leading",
      requiredDatasets: ["HubSpot", "Marketo"],
      decisionsEnabled: "Campaign mix, content calendar, budget allocation",
    },
    {
      id: "traffic",
      name: "Website Traffic",
      description: "Visitors to website",
      category: "leading",
      requiredDatasets: ["Google Analytics"],
      decisionsEnabled: "Campaign mix, content calendar, budget allocation",
    },
    {
      id: "conversion-rate",
      name: "Conversion Rate",
      description: "Lead to customer conversion",
      category: "leading",
      requiredDatasets: ["HubSpot", "Google Analytics"],
      decisionsEnabled: "Campaign mix, content calendar, budget allocation",
    },
  ],
  "customer-success-manager": [
    {
      id: "nps",
      name: "Net Promoter Score",
      description: "Customer satisfaction metric",
      category: "lagging",
      requiredDatasets: ["Gainsight", "Zendesk"],
      decisionsEnabled: "Account health actions, renewal strategy",
    },
    {
      id: "health-score",
      name: "Customer Health Score",
      description: "Overall account health",
      category: "lagging",
      requiredDatasets: ["Gainsight", "Salesforce"],
      decisionsEnabled: "Account health actions, renewal strategy",
    },
    {
      id: "usage-frequency",
      name: "Usage Frequency",
      description: "How often customers use product",
      category: "leading",
      requiredDatasets: ["Amplitude", "Gainsight"],
      decisionsEnabled: "Account health actions, renewal strategy",
    },
    {
      id: "support-volume",
      name: "Support Ticket Volume",
      description: "Number of support requests",
      category: "leading",
      requiredDatasets: ["Zendesk", "Intercom"],
      decisionsEnabled: "Account health actions, renewal strategy",
    },
  ],
  "finance-manager": [
    {
      id: "burn-rate",
      name: "Monthly Burn Rate",
      description: "Cash consumption per month",
      category: "lagging",
      requiredDatasets: ["NetSuite", "Xero"],
      decisionsEnabled: "Budgeting, forecasting, cost control",
    },
    {
      id: "runway",
      name: "Cash Runway",
      description: "Months until cash runs out",
      category: "lagging",
      requiredDatasets: ["NetSuite", "Xero"],
      decisionsEnabled: "Budgeting, forecasting, cost control",
    },
    {
      id: "margins",
      name: "Profit Margins",
      description: "Company profitability",
      category: "leading",
      requiredDatasets: ["NetSuite", "Stripe"],
      decisionsEnabled: "Budgeting, forecasting, cost control",
    },
    {
      id: "forecast-accuracy",
      name: "Forecast Accuracy",
      description: "Accuracy of revenue predictions",
      category: "leading",
      requiredDatasets: ["NetSuite", "Salesforce"],
      decisionsEnabled: "Budgeting, forecasting, cost control",
    },
  ],
  "delivery-manager": [
    {
      id: "sprint-velocity",
      name: "Sprint Velocity",
      description: "Work completed per sprint",
      category: "lagging",
      requiredDatasets: ["Jira", "Linear"],
      decisionsEnabled: "How to sequence work, remove blockers, manage delivery risks",
    },
    {
      id: "cycle-time",
      name: "Cycle Time",
      description: "Time from start to done",
      category: "leading",
      requiredDatasets: ["Jira", "Linear"],
      decisionsEnabled: "How to sequence work, remove blockers, manage delivery risks",
    },
    {
      id: "wip",
      name: "Work In Progress",
      description: "Active tasks count",
      category: "leading",
      requiredDatasets: ["Jira", "Notion"],
      decisionsEnabled: "How to sequence work, remove blockers, manage delivery risks",
    },
    {
      id: "burndown",
      name: "Sprint Burndown",
      description: "Progress toward sprint goal",
      category: "leading",
      requiredDatasets: ["Jira", "Linear"],
      decisionsEnabled: "How to sequence work, remove blockers, manage delivery risks",
    },
    {
      id: "dependency-status",
      name: "Dependency Status",
      description: "Status of cross-team dependencies",
      category: "leading",
      requiredDatasets: ["Confluence", "Notion"],
      decisionsEnabled: "How to sequence work, remove blockers, manage delivery risks",
    },
  ],
  "product-analyst": [
    {
      id: "retention",
      name: "Retention Analysis",
      description: "User retention by cohort",
      category: "lagging",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "Insights, reporting, experimentation",
    },
    {
      id: "cohort-analyses",
      name: "Cohort Analyses",
      description: "User behavior by cohort",
      category: "lagging",
      requiredDatasets: ["Amplitude", "BigQuery"],
      decisionsEnabled: "Insights, reporting, experimentation",
    },
    {
      id: "funnel-metrics",
      name: "Funnel Conversion Metrics",
      description: "Conversion through key funnels",
      category: "leading",
      requiredDatasets: ["Amplitude", "Mixpanel"],
      decisionsEnabled: "Insights, reporting, experimentation",
    },
  ],
  "product-designer": [
    {
      id: "usability-scores",
      name: "Usability Scores",
      description: "User experience quality",
      category: "lagging",
      requiredDatasets: ["Hotjar", "Maze"],
      decisionsEnabled: "UX/UI decisions, feature flows, interaction patterns",
    },
    {
      id: "drop-off-points",
      name: "Drop-off Points",
      description: "Where users abandon flows",
      category: "leading",
      requiredDatasets: ["Hotjar", "Amplitude"],
      decisionsEnabled: "UX/UI decisions, feature flows, interaction patterns",
    },
    {
      id: "heatmaps",
      name: "User Heatmaps",
      description: "Click and scroll patterns",
      category: "leading",
      requiredDatasets: ["Hotjar", "FullStory"],
      decisionsEnabled: "UX/UI decisions, feature flows, interaction patterns",
    },
    {
      id: "task-completion-rate",
      name: "Task Completion Rate",
      description: "Success rate for user tasks",
      category: "leading",
      requiredDatasets: ["UserTesting", "Maze"],
      decisionsEnabled: "UX/UI decisions, feature flows, interaction patterns",
    },
  ],
  "data-analyst": [
    {
      id: "data-accuracy",
      name: "Data Accuracy",
      description: "Quality of data inputs",
      category: "lagging",
      requiredDatasets: ["Snowflake", "BigQuery", "Looker"],
      decisionsEnabled: "Build dashboards & answer ad-hoc questions",
    },
    {
      id: "statistical-confidence",
      name: "Statistical Confidence",
      description: "Reliability of analyses",
      category: "leading",
      requiredDatasets: ["Snowflake", "BigQuery"],
      decisionsEnabled: "Build dashboards & answer ad-hoc questions",
    },
  ],
  "data-scientist": [
    {
      id: "model-accuracy",
      name: "Model Accuracy",
      description: "Prediction model performance",
      category: "lagging",
      requiredDatasets: ["Databricks", "BigQuery", "Snowflake"],
      decisionsEnabled: "Models, predictions, segmentation",
    },
    {
      id: "mse",
      name: "Mean Squared Error",
      description: "Model prediction error",
      category: "leading",
      requiredDatasets: ["Databricks", "Snowflake"],
      decisionsEnabled: "Models, predictions, segmentation",
    },
    {
      id: "lift",
      name: "Model Lift",
      description: "Improvement over baseline",
      category: "leading",
      requiredDatasets: ["Databricks", "BigQuery"],
      decisionsEnabled: "Models, predictions, segmentation",
    },
  ],
  "ux-researcher": [
    {
      id: "sus-score",
      name: "SUS Score",
      description: "System Usability Scale",
      category: "lagging",
      requiredDatasets: ["Dovetail", "UserTesting"],
      decisionsEnabled: "Validate problems & solutions",
    },
    {
      id: "thematic-patterns",
      name: "Thematic Patterns",
      description: "Recurring user feedback themes",
      category: "leading",
      requiredDatasets: ["Dovetail", "Lookback"],
      decisionsEnabled: "Validate problems & solutions",
    },
    {
      id: "time-to-task",
      name: "Time to Task",
      description: "How long users take to complete tasks",
      category: "leading",
      requiredDatasets: ["UserTesting", "Maze"],
      decisionsEnabled: "Validate problems & solutions",
    },
  ],
  "sales-rep": [
    {
      id: "deal-score",
      name: "Deal Health Score",
      description: "Likelihood of closing",
      category: "lagging",
      requiredDatasets: ["Salesforce", "Gong"],
      decisionsEnabled: "Which deals to prioritize, which motions to use",
    },
    {
      id: "intent-signals",
      name: "Intent Signals",
      description: "Buyer intent indicators",
      category: "leading",
      requiredDatasets: ["HubSpot", "Clearbit"],
      decisionsEnabled: "Which deals to prioritize, which motions to use",
    },
    {
      id: "activity-response",
      name: "Activity Response Rate",
      description: "Prospect engagement rate",
      category: "leading",
      requiredDatasets: ["Salesforce", "Gong"],
      decisionsEnabled: "Which deals to prioritize, which motions to use",
    },
  ],
}

export function getMetricsForRole(role: UserRole): MetricRecommendation[] {
  return metricsByRole[role] || []
}

export const getMetricsByRole = getMetricsForRole

export function getAllAvailableMetrics(): MetricRecommendation[] {
  const allMetrics = new Map<string, MetricRecommendation>()

  Object.values(metricsByRole).forEach((metrics) => {
    metrics.forEach((metric) => {
      if (!allMetrics.has(metric.id)) {
        allMetrics.set(metric.id, metric)
      }
    })
  })

  return Array.from(allMetrics.values())
}

export function getAllRequiredDatasets(metrics: MetricRecommendation[]): string[] {
  const datasets = new Set<string>()
  metrics.forEach((metric) => {
    metric.requiredDatasets.forEach((ds) => datasets.add(ds))
  })
  return Array.from(datasets)
}
