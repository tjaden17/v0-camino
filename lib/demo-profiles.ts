export interface DemoProfile {
  id: string
  name: string
  role: string
  businessUnit: string
  company: string
  importantToMe: { metric: string; priority: number }[]
  importantToTeam: { metric: string; priority: number }[]
  importantToCompany: { metric: string; priority: number }[]
  productCategory: string
  productStage: string
  businessStage: string
  defaultView: string
  dataIntegrations: string[]
  savedIssueIds: string[]
  roleMission: string
  companyMission: string
}

export const availableMetrics = {
  product: [
    "Product Adoption Rate",
    "Feature Usage",
    "User Engagement",
    "DAU/MAU Ratio",
    "Activation Rate",
    "Time to Value",
    "Product Qualified Leads",
    "Feature Retention",
  ],
  design: [
    "Task Success Rate",
    "User Satisfaction Score",
    "Time on Task",
    "Error Rate",
    "Navigation Efficiency",
    "Design System Adoption",
    "Accessibility Score",
    "Mobile Usability Score",
  ],
  sales: [
    "Customer Lifetime Value",
    "Average Deal Size",
    "Sales Cycle Length",
    "Win Rate",
    "Pipeline Velocity",
    "Upsell Rate",
    "Lead Conversion Rate",
    "Customer Acquisition Cost",
  ],
  customerSuccess: [
    "Customer Health Score",
    "Support Ticket Volume",
    "First Response Time",
    "Resolution Time",
    "CSAT Score",
    "NPS",
    "Churn Risk Score",
    "Expansion Revenue",
  ],
  founder: [
    "Monthly Recurring Revenue",
    "Annual Recurring Revenue",
    "Revenue Growth Rate",
    "Gross Margin",
    "Burn Rate",
    "Runway",
    "Customer Count",
    "Market Share",
  ],
}

export const demoProfiles: DemoProfile[] = [
  {
    id: "head-product-expansion",
    name: "Sarah Chen",
    role: "Head of Product",
    businessUnit: "Product & Engineering",
    company: "GlobalTech SaaS",
    importantToMe: [
      { metric: "Product Adoption Rate", priority: 10 },
      { metric: "Feature Usage", priority: 8 },
      { metric: "User Engagement", priority: 9 },
    ],
    importantToTeam: [
      { metric: "DAU/MAU Ratio", priority: 8 },
      { metric: "Time to Value", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Annual Recurring Revenue", priority: 10 },
      { metric: "Customer Count", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "product-adoption",
    dataIntegrations: ["Amplitude", "Mixpanel", "Zendesk", "Productboard"],
    savedIssueIds: ["feature-adoption", "activation-rate", "ui-usability"],
    roleMission: "Drive international market expansion through product-led growth and localization",
    companyMission: "Achieve $50M ARR by expanding into 3 new geographic markets",
  },
  {
    id: "head-product-penetration",
    name: "Michael Rodriguez",
    role: "Head of Product",
    businessUnit: "Product & Engineering",
    company: "MarketLeader Inc",
    importantToMe: [
      { metric: "Feature Retention", priority: 10 },
      { metric: "Product Qualified Leads", priority: 9 },
      { metric: "Activation Rate", priority: 8 },
    ],
    importantToTeam: [
      { metric: "User Engagement", priority: 9 },
      { metric: "Feature Usage", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Market Share", priority: 10 },
      { metric: "Revenue Growth Rate", priority: 9 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Mature",
    businessStage: "Series C+",
    defaultView: "feature-retention",
    dataIntegrations: ["Amplitude", "Mixpanel", "Zendesk", "Productboard"],
    savedIssueIds: ["product-experience", "tutorial-completion", "performance-metrics"],
    roleMission: "Increase market penetration by deepening product value and reducing churn",
    companyMission: "Become the market leader with 30% market share in core segment",
  },
  {
    id: "head-sales-ltv",
    name: "Jennifer Park",
    role: "Head of Sales",
    businessUnit: "Revenue",
    company: "EnterpriseHub",
    importantToMe: [
      { metric: "Customer Lifetime Value", priority: 10 },
      { metric: "Upsell Rate", priority: 9 },
      { metric: "Average Deal Size", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Win Rate", priority: 9 },
      { metric: "Sales Cycle Length", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Annual Recurring Revenue", priority: 10 },
      { metric: "Gross Margin", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "ltv",
    dataIntegrations: ["Salesforce", "HubSpot", "Gong"],
    savedIssueIds: ["revenue-per-customer", "competitive-win-rate", "sales-cycle"],
    roleMission: "Maximize customer lifetime value through strategic upselling and account expansion",
    companyMission: "Reach $100M ARR with focus on enterprise customers and expansion revenue",
  },
  {
    id: "head-design-usability",
    name: "David Kim",
    role: "Head of Design",
    businessUnit: "Product & Design",
    company: "UXFirst Software",
    importantToMe: [
      { metric: "User Satisfaction Score", priority: 10 },
      { metric: "Task Success Rate", priority: 9 },
      { metric: "Accessibility Score", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Design System Adoption", priority: 8 },
      { metric: "Time on Task", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Customer Count", priority: 9 },
      { metric: "Product Adoption Rate", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series A",
    defaultView: "user-satisfaction",
    dataIntegrations: ["Figma", "Maze", "Hotjar", "UserTesting"],
    savedIssueIds: ["ui-usability", "product-experience", "onboarding-quality"],
    roleMission: "Deliver exceptional user experiences that drive adoption and satisfaction",
    companyMission: "Achieve industry-leading NPS through user-centric design and continuous improvement",
  },
  {
    id: "head-cs-volume",
    name: "Emily Thompson",
    role: "Head of Customer Success",
    businessUnit: "Customer Experience",
    company: "SupportPro",
    importantToMe: [
      { metric: "Support Ticket Volume", priority: 10 },
      { metric: "Customer Health Score", priority: 9 },
      { metric: "First Response Time", priority: 8 },
    ],
    importantToTeam: [
      { metric: "CSAT Score", priority: 9 },
      { metric: "Resolution Time", priority: 8 },
    ],
    importantToCompany: [
      { metric: "Churn Risk Score", priority: 10 },
      { metric: "Expansion Revenue", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Mature",
    businessStage: "Series C+",
    defaultView: "support-volume",
    dataIntegrations: ["Pendo", "Gainsight", "Zendesk", "Salesforce"],
    savedIssueIds: ["support-score", "response-time", "ticket-volume"],
    roleMission: "Reduce support volume while improving customer health and preventing churn",
    companyMission: "Maintain <5% annual churn through proactive customer success management",
  },
  {
    id: "founder-revenue",
    name: "Alex Martinez",
    role: "Founder & CEO",
    businessUnit: "Executive",
    company: "GrowthCo",
    importantToMe: [
      { metric: "Revenue Growth Rate", priority: 10 },
      { metric: "Monthly Recurring Revenue", priority: 9 },
      { metric: "Burn Rate", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Customer Acquisition Cost", priority: 8 },
      { metric: "Gross Margin", priority: 9 },
    ],
    importantToCompany: [
      { metric: "Annual Recurring Revenue", priority: 10 },
      { metric: "Runway", priority: 9 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Early",
    businessStage: "Seed",
    defaultView: "revenue-growth",
    dataIntegrations: ["Netsuite", "Salesforce", "HubSpot", "Amplitude", "Looker"],
    savedIssueIds: ["revenue-growth", "customer-acquisition-cost", "gross-margin"],
    roleMission: "Achieve product-market fit and sustainable revenue growth to reach Series A milestone",
    companyMission: "Reach $5M ARR with path to profitability and raise Series A funding",
  },
]

export function getDemoProfileById(id: string): DemoProfile | undefined {
  return demoProfiles.find((p) => p.id === id)
}

export function getMetricsForRole(role: string): string[] {
  if (role.toLowerCase().includes("product")) return availableMetrics.product
  if (role.toLowerCase().includes("design")) return availableMetrics.design
  if (role.toLowerCase().includes("sales")) return availableMetrics.sales
  if (role.toLowerCase().includes("customer success") || role.toLowerCase().includes("support"))
    return availableMetrics.customerSuccess
  if (role.toLowerCase().includes("founder") || role.toLowerCase().includes("ceo")) return availableMetrics.founder
  return availableMetrics.product // default
}
