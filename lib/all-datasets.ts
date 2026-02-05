export const topDatasets = [
  { id: "salesforce", name: "Salesforce", description: "CRM and sales data", category: "Sales & CRM" },
  { id: "hubspot", name: "HubSpot", description: "Marketing and sales automation", category: "Sales & CRM" },
  { id: "stripe", name: "Stripe", description: "Payment and revenue data", category: "Finance" },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Website traffic and behavior",
    category: "Analytics",
  },
  { id: "amplitude", name: "Amplitude", description: "Product analytics", category: "Analytics" },
]

export const allDatasets = [
  // Sales & CRM
  { id: "salesforce", name: "Salesforce", category: "Sales & CRM" },
  { id: "hubspot", name: "HubSpot", category: "Sales & CRM" },
  { id: "pipedrive", name: "Pipedrive", category: "Sales & CRM" },
  { id: "close", name: "Close", category: "Sales & CRM" },
  { id: "gong", name: "Gong", category: "Sales & CRM" },
  { id: "outreach", name: "Outreach", category: "Sales & CRM" },
  { id: "salesloft", name: "SalesLoft", category: "Sales & CRM" },

  // Finance & Accounting
  { id: "stripe", name: "Stripe", category: "Finance & Accounting" },
  { id: "netsuite", name: "NetSuite", category: "Finance & Accounting" },
  { id: "quickbooks", name: "QuickBooks", category: "Finance & Accounting" },
  { id: "xero", name: "Xero", category: "Finance & Accounting" },
  { id: "brex", name: "Brex", category: "Finance & Accounting" },

  // Analytics & Product
  { id: "amplitude", name: "Amplitude", category: "Analytics & Product" },
  { id: "mixpanel", name: "Mixpanel", category: "Analytics & Product" },
  { id: "google-analytics", name: "Google Analytics", category: "Analytics & Product" },
  { id: "heap", name: "Heap", category: "Analytics & Product" },
  { id: "pendo", name: "Pendo", category: "Analytics & Product" },
  { id: "fullstory", name: "FullStory", category: "Analytics & Product" },
  { id: "hotjar", name: "Hotjar", category: "Analytics & Product" },

  // Marketing
  { id: "meta-ads", name: "Meta Ads", category: "Marketing" },
  { id: "google-ads", name: "Google Ads", category: "Marketing" },
  { id: "marketo", name: "Marketo", category: "Marketing" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing" },
  { id: "sendgrid", name: "SendGrid", category: "Marketing" },

  // Customer Success
  { id: "zendesk", name: "Zendesk", category: "Customer Success" },
  { id: "intercom", name: "Intercom", category: "Customer Success" },
  { id: "gainsight", name: "Gainsight", category: "Customer Success" },
  { id: "delighted", name: "Delighted", category: "Customer Success" },
  { id: "front", name: "Front", category: "Customer Success" },

  // Engineering & DevOps
  { id: "github", name: "GitHub", category: "Engineering & DevOps" },
  { id: "gitlab", name: "GitLab", category: "Engineering & DevOps" },
  { id: "jira", name: "Jira", category: "Engineering & DevOps" },
  { id: "linear", name: "Linear", category: "Engineering & DevOps" },
  { id: "datadog", name: "Datadog", category: "Engineering & DevOps" },
  { id: "pagerduty", name: "PagerDuty", category: "Engineering & DevOps" },
  { id: "sentry", name: "Sentry", category: "Engineering & DevOps" },

  // Data Platforms
  { id: "snowflake", name: "Snowflake", category: "Data Platforms" },
  { id: "bigquery", name: "BigQuery", category: "Data Platforms" },
  { id: "databricks", name: "Databricks", category: "Data Platforms" },
  { id: "redshift", name: "Redshift", category: "Data Platforms" },

  // Design & Research
  { id: "figma", name: "Figma", category: "Design & Research" },
  { id: "maze", name: "Maze", category: "Design & Research" },
  { id: "usertesting", name: "UserTesting", category: "Design & Research" },
  { id: "dovetail", name: "Dovetail", category: "Design & Research" },
  { id: "lookback", name: "Lookback", category: "Design & Research" },

  // Collaboration
  { id: "slack", name: "Slack", category: "Collaboration" },
  { id: "notion", name: "Notion", category: "Collaboration" },
  { id: "confluence", name: "Confluence", category: "Collaboration" },
  { id: "productboard", name: "Productboard", category: "Collaboration" },

  // Other
  { id: "clearbit", name: "Clearbit", category: "Other" },
  { id: "segment", name: "Segment", category: "Other" },
  { id: "looker", name: "Looker", category: "Other" },
]

export function getDatasetsByCategory() {
  const grouped: Record<string, typeof allDatasets> = {}

  allDatasets.forEach((dataset) => {
    if (!grouped[dataset.category]) {
      grouped[dataset.category] = []
    }
    grouped[dataset.category].push(dataset)
  })

  return grouped
}
