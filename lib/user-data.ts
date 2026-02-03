export interface UserProfile {
  name: string
  role: string
  businessUnit: string
  company: string
  importantToMe: string[]
  importantToTeam: string[]
  importantToCompany: string[]
  productCategory: string
  productStage: string
  businessStage: string
  defaultView: string
  savedIssueIds: string[]
  companyMission: string
  roleMission: string
}

export interface DataIntegration {
  id: string
  name: string
  status: "connected" | "disconnected"
  icon: string
}

// Mock user profile data
export const userProfile: UserProfile = {
  name: "Alex Johnson",
  role: "VP of Product",
  businessUnit: "Product & Engineering",
  company: "Acme Corp",
  importantToMe: ["Customer Satisfaction", "Product Adoption"],
  importantToTeam: ["Revenue Growth", "Market Share"],
  importantToCompany: ["ARR", "Customer Retention"],
  productCategory: "B2B SaaS",
  productStage: "Growth",
  businessStage: "Series B",
  defaultView: "csat",
  savedIssueIds: ["csat-score", "support-score", "response-time"],
  companyMission: "Achieve $50M ARR by expanding into 3 new geographic markets",
  roleMission: "Drive product adoption and customer satisfaction to support revenue growth",
}

export const dataIntegrations: DataIntegration[] = [
  { id: "zendesk", name: "Zendesk", status: "connected", icon: "🎫" },
  { id: "mixpanel", name: "Mixpanel", status: "connected", icon: "📊" },
  { id: "stripe", name: "Stripe", status: "connected", icon: "💳" },
  { id: "salesforce", name: "Salesforce", status: "disconnected", icon: "☁️" },
  { id: "segment", name: "Segment", status: "disconnected", icon: "📈" },
]
