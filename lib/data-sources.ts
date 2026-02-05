export interface DataSourceOption {
  id: string
  name: string
  description: string
  category: "CRM" | "Analytics" | "Project Management" | "Finance" | "Design" | "Support" | "Marketing" | "Infrastructure" | "Data"
  icon: string
  popular?: boolean
}

export const dataSourceOptions: DataSourceOption[] = [
  // CRM
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM, marketing, and sales platform",
    category: "CRM",
    icon: "🟠",
    popular: true,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Enterprise CRM platform",
    category: "CRM",
    icon: "☁️",
    popular: true,
  },
  {
    id: "gainsight",
    name: "Gainsight",
    description: "Customer success platform",
    category: "CRM",
    icon: "📊",
  },
  {
    id: "gong",
    name: "Gong",
    description: "Revenue intelligence platform",
    category: "CRM",
    icon: "🎙️",
  },

  // Analytics
  {
    id: "amplitude",
    name: "Amplitude",
    description: "Product analytics platform",
    category: "Analytics",
    icon: "📈",
    popular: true,
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Product analytics and user insights",
    category: "Analytics",
    icon: "📉",
    popular: true,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Web analytics and reporting",
    category: "Analytics",
    icon: "🔍",
    popular: true,
  },
  {
    id: "hotjar",
    name: "Hotjar",
    description: "Heatmaps and user behavior analytics",
    category: "Analytics",
    icon: "🔥",
  },
  {
    id: "looker",
    name: "Looker",
    description: "Business intelligence and data analytics",
    category: "Analytics",
    icon: "👁️",
  },

  // Data
  {
    id: "bigquery",
    name: "BigQuery",
    description: "Data warehouse and analytics",
    category: "Data",
    icon: "💾",
    popular: true,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    description: "Cloud data warehouse",
    category: "Data",
    icon: "❄️",
    popular: true,
  },
  {
    id: "databricks",
    name: "Databricks",
    description: "Data science and ML platform",
    category: "Data",
    icon: "🧮",
  },

  // Project Management
  {
    id: "jira",
    name: "Jira",
    description: "Project and issue tracking",
    category: "Project Management",
    icon: "🎯",
    popular: true,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Modern issue tracking",
    category: "Project Management",
    icon: "📋",
    popular: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Docs, wikis, and project management",
    category: "Project Management",
    icon: "📝",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Team collaboration and documentation",
    category: "Project Management",
    icon: "📚",
  },
  {
    id: "productboard",
    name: "Productboard",
    description: "Product management platform",
    category: "Project Management",
    icon: "🗺️",
  },

  // Finance
  {
    id: "netsuite",
    name: "NetSuite",
    description: "Enterprise resource planning",
    category: "Finance",
    icon: "💰",
  },
  {
    id: "xero",
    name: "Xero",
    description: "Accounting software",
    category: "Finance",
    icon: "💵",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and billing",
    category: "Finance",
    icon: "💳",
    popular: true,
  },

  // Design
  {
    id: "figma",
    name: "Figma",
    description: "Design and prototyping tool",
    category: "Design",
    icon: "🎨",
    popular: true,
  },
  {
    id: "maze",
    name: "Maze",
    description: "User testing and research",
    category: "Design",
    icon: "🧪",
  },
  {
    id: "usertesting",
    name: "UserTesting",
    description: "User research and feedback",
    category: "Design",
    icon: "👥",
  },
  {
    id: "dovetail",
    name: "Dovetail",
    description: "User research repository",
    category: "Design",
    icon: "🔬",
  },
  {
    id: "lookback",
    name: "Lookback",
    description: "User research and testing",
    category: "Design",
    icon: "👁️‍🗨️",
  },

  // Support
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer support and ticketing",
    category: "Support",
    icon: "🎫",
    popular: true,
  },

  // Marketing
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Facebook and Instagram advertising",
    category: "Marketing",
    icon: "📱",
  },

  // Infrastructure
  {
    id: "github",
    name: "GitHub",
    description: "Code repository and CI/CD",
    category: "Infrastructure",
    icon: "🐙",
    popular: true,
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Monitoring and observability",
    category: "Infrastructure",
    icon: "🐕",
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    description: "Incident management and alerting",
    category: "Infrastructure",
    icon: "🚨",
  },
]

export function getDataSourceById(id: string): DataSourceOption | undefined {
  return dataSourceOptions.find((ds) => ds.id === id)
}

export function getDataSourcesByCategory(category: DataSourceOption["category"]): DataSourceOption[] {
  return dataSourceOptions.filter((ds) => ds.category === category)
}

export function getPopularDataSources(): DataSourceOption[] {
  return dataSourceOptions.filter((ds) => ds.popular)
}
