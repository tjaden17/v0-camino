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
  upcomingDecisions?: { title: string; dueDate: string; category: string }[]
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
  techLead: [
    "API Response Time",
    "System Uptime",
    "Error Rate",
    "Code Quality Score",
    "Technical Debt Ratio",
    "Deployment Frequency",
    "Mean Time to Recovery",
    "Test Coverage",
  ],
  customerSupportAgent: [
    "First Contact Resolution",
    "Response Time",
    "Ticket Volume",
    "Customer Support Score",
    "Average Handle Time",
    "Ticket Backlog",
    "Customer Satisfaction",
    "Resolution Rate",
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
      { metric: "Product Adoption", priority: 10 },
      { metric: "Daily Active Users", priority: 9 },
      { metric: "New Feature Adoption", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Product Engagement Score", priority: 8 },
      { metric: "Product Quality", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Company Revenue", priority: 10 },
      { metric: "Customer Retention", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "product-adoption",
    dataIntegrations: ["Amplitude", "Mixpanel", "Zendesk", "Productboard"],
    savedIssueIds: ["feature-adoption", "activation-rate", "ui-usability"],
    roleMission: "Drive international market expansion through product-led growth and localization",
    companyMission: "Achieve $50M ARR by expanding into 3 new geographic markets",
    upcomingDecisions: [
      { title: "Q1 Feature Roadmap", dueDate: "Jan 15, 2025", category: "Planning" },
      { title: "Localization Strategy", dueDate: "Jan 20, 2025", category: "Strategy" },
    ],
  },
  {
    id: "head-product-penetration",
    name: "Michael Rodriguez",
    role: "Head of Product",
    businessUnit: "Product & Engineering",
    company: "MarketLeader Inc",
    importantToMe: [
      { metric: "Product Quality", priority: 10 },
      { metric: "Bug Discovery Rate", priority: 9 },
      { metric: "System Uptime", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Product Engagement Score", priority: 9 },
      { metric: "Product Adoption", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Net Dollar Retention", priority: 10 },
      { metric: "Company Revenue", priority: 9 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Mature",
    businessStage: "Series C+",
    defaultView: "feature-retention",
    dataIntegrations: ["Amplitude", "Mixpanel", "Zendesk", "Productboard"],
    savedIssueIds: ["product-experience", "tutorial-completion", "performance-metrics"],
    roleMission: "Increase market penetration by deepening product value and reducing churn",
    companyMission: "Become the market leader with 30% market share in core segment",
    upcomingDecisions: [
      { title: "Product Feature Enhancements", dueDate: "Feb 10, 2025", category: "Development" },
      { title: "User Feedback Analysis", dueDate: "Feb 25, 2025", category: "Research" },
    ],
  },
  {
    id: "head-sales-ltv",
    name: "Jennifer Park",
    role: "Head of Sales",
    businessUnit: "Revenue",
    company: "EnterpriseHub",
    importantToMe: [
      { metric: "Sales Performance", priority: 10 },
      { metric: "Average Deal Size", priority: 9 },
      { metric: "Sales Conversion Rate", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Lead Conversion Rate", priority: 9 },
      { metric: "Pipeline Velocity", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Company Revenue", priority: 10 },
      { metric: "Customer Retention", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "ltv",
    dataIntegrations: ["Salesforce", "HubSpot", "Gong"],
    savedIssueIds: ["revenue-per-customer", "competitive-win-rate", "sales-cycle"],
    roleMission: "Maximize customer lifetime value through strategic upselling and account expansion",
    companyMission: "Reach $100M ARR with focus on enterprise customers and expansion revenue",
    upcomingDecisions: [
      { title: "Q1 Sales Targets", dueDate: "Jan 30, 2025", category: "Planning" },
      { title: "Upselling Strategy Review", dueDate: "Feb 15, 2025", category: "Strategy" },
    ],
  },
  {
    id: "head-design-usability",
    name: "David Kim",
    role: "Head of Design",
    businessUnit: "Product & Design",
    company: "UXFirst Software",
    importantToMe: [
      { metric: "Product Engagement Score", priority: 10 },
      { metric: "Daily Active Users", priority: 9 },
      { metric: "Product Quality", priority: 8 },
    ],
    importantToTeam: [
      { metric: "New Feature Adoption", priority: 8 },
      { metric: "Product Adoption", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Customer Retention", priority: 9 },
      { metric: "Product Adoption", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series A",
    defaultView: "user-satisfaction",
    dataIntegrations: ["Figma", "Maze", "Hotjar", "UserTesting"],
    savedIssueIds: ["ui-usability", "product-experience", "onboarding-quality"],
    roleMission: "Deliver exceptional user experiences that drive adoption and satisfaction",
    companyMission: "Achieve industry-leading NPS through user-centric design and continuous improvement",
    upcomingDecisions: [
      { title: "Design System Updates", dueDate: "Feb 5, 2025", category: "Development" },
      { title: "User Testing Schedule", dueDate: "Feb 20, 2025", category: "Research" },
    ],
  },
  {
    id: "head-cs-volume",
    name: "Emily Thompson",
    role: "Head of Customer Success",
    businessUnit: "Customer Experience",
    company: "SupportPro",
    importantToMe: [
      { metric: "Customer Support Score", priority: 10 },
      { metric: "First Response Time", priority: 9 },
      { metric: "Support Ticket Volume", priority: 8 },
    ],
    importantToTeam: [
      { metric: "First Contact Resolution", priority: 9 },
      { metric: "Customer Retention", priority: 8 },
    ],
    importantToCompany: [
      { metric: "Customer Churn Rate", priority: 10 },
      { metric: "Net Dollar Retention", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Mature",
    businessStage: "Series C+",
    defaultView: "support-volume",
    dataIntegrations: ["Pendo", "Gainsight", "Zendesk", "Salesforce"],
    savedIssueIds: ["support-score", "response-time", "ticket-volume"],
    roleMission: "Reduce support volume while improving customer health and preventing churn",
    companyMission: "Maintain <5% annual churn through proactive customer success management",
    upcomingDecisions: [
      { title: "Customer Success Plan", dueDate: "Feb 1, 2025", category: "Planning" },
      { title: "Churn Reduction Strategy", dueDate: "Feb 16, 2025", category: "Strategy" },
    ],
  },
  {
    id: "founder-revenue",
    name: "Alex Martinez",
    role: "Founder & CEO",
    businessUnit: "Executive",
    company: "GrowthCo",
    importantToMe: [
      { metric: "Company Revenue", priority: 10 },
      { metric: "Customer Churn Rate", priority: 9 },
      { metric: "Monthly Churn Rate", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Marketing ROI", priority: 8 },
      { metric: "Customer Acquisition Cost", priority: 9 },
    ],
    importantToCompany: [
      { metric: "Company Revenue", priority: 10 },
      { metric: "Customer Retention", priority: 9 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Early",
    businessStage: "Seed",
    defaultView: "revenue-growth",
    dataIntegrations: ["Netsuite", "Salesforce", "HubSpot", "Amplitude", "Looker"],
    savedIssueIds: ["revenue-growth", "customer-acquisition-cost", "gross-margin"],
    roleMission: "Achieve product-market fit and sustainable revenue growth to reach Series A milestone",
    companyMission: "Reach $5M ARR with path to profitability and raise Series A funding",
    upcomingDecisions: [
      { title: "Product Market Fit Analysis", dueDate: "Jan 22, 2025", category: "Research" },
      { title: "Series A Fundraising Plan", dueDate: "Feb 17, 2025", category: "Planning" },
    ],
  },
  {
    id: "tech-lead-reliability",
    name: "Priya Sharma",
    role: "Tech Lead",
    businessUnit: "Engineering",
    company: "TechStack Solutions",
    importantToMe: [
      { metric: "API Usage Growth", priority: 10 },
      { metric: "System Uptime", priority: 9 },
      { metric: "Bug Discovery Rate", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Product Quality", priority: 9 },
      { metric: "New Feature Adoption", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Product Adoption", priority: 9 },
      { metric: "Customer Retention", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "api-usage",
    dataIntegrations: ["Datadog", "GitHub", "PagerDuty", "New Relic", "Sentry"],
    savedIssueIds: ["api-usage-growth", "system-uptime", "bug-discovery-rate"],
    roleMission: "Build scalable, reliable infrastructure that supports rapid product growth and innovation",
    companyMission: "Achieve 99.9% uptime while scaling to support 10x user growth",
    upcomingDecisions: [
      { title: "Infrastructure Scaling Plan", dueDate: "Jan 31, 2025", category: "Planning" },
      { title: "Tech Debt Management", dueDate: "Feb 12, 2025", category: "Development" },
    ],
  },
  {
    id: "cs-agent-resolution",
    name: "Jordan Lee",
    role: "Customer Support Agent",
    businessUnit: "Customer Experience",
    company: "SupportPro",
    importantToMe: [
      { metric: "First Contact Resolution", priority: 10 },
      { metric: "Response Time", priority: 9 },
      { metric: "Support Ticket Volume", priority: 8 },
    ],
    importantToTeam: [
      { metric: "Customer Support Score", priority: 9 },
      { metric: "Customer Retention", priority: 7 },
    ],
    importantToCompany: [
      { metric: "Customer Churn Rate", priority: 9 },
      { metric: "Net Dollar Retention", priority: 8 },
    ],
    productCategory: "B2B SaaS",
    productStage: "Growth",
    businessStage: "Series B",
    defaultView: "first-contact-resolution",
    dataIntegrations: ["Zendesk", "Intercom", "Slack", "Salesforce"],
    savedIssueIds: ["first-contact-resolution", "response-time", "ticket-volume"],
    roleMission: "Resolve customer issues quickly and effectively on the first contact to improve satisfaction",
    companyMission: "Deliver world-class customer support with industry-leading CSAT and resolution rates",
    upcomingDecisions: [
      { title: "Customer Support Metrics Review", dueDate: "Feb 3, 2025", category: "Research" },
      { title: "Training Schedule for New Agents", dueDate: "Feb 18, 2025", category: "Development" },
    ],
  },
]

export function getDemoProfileById(id: string): DemoProfile | undefined {
  return demoProfiles.find((p) => p.id === id)
}

export function getMetricsForRole(role: string): string[] {
  if (role.toLowerCase().includes("product")) return availableMetrics.product
  if (role.toLowerCase().includes("design")) return availableMetrics.design
  if (role.toLowerCase().includes("sales")) return availableMetrics.sales
  if (role.toLowerCase().includes("customer support agent") || role.toLowerCase().includes("support agent"))
    return availableMetrics.customerSupportAgent
  if (role.toLowerCase().includes("customer success") || role.toLowerCase().includes("support"))
    return availableMetrics.customerSuccess
  if (role.toLowerCase().includes("founder") || role.toLowerCase().includes("ceo")) return availableMetrics.founder
  if (role.toLowerCase().includes("tech lead") || role.toLowerCase().includes("engineering"))
    return availableMetrics.techLead
  return availableMetrics.product // default
}
