// Declare the missing types/interfaces at the top of the file
type UserType = string // Example declaration, replace with actual type
type PlanType = string // Example declaration, replace with actual type
type InsightCategory = string // Example declaration, replace with actual type
type DataSource = {}
type UserGroup = string // Example declaration, replace with actual type

export interface Notification {
  id: string
  type: "signal_request" | "signal_added" | "team_invite" | "system" | "data_connection_request" | "metric_assignment"
  title: string
  message: string
  createdAt: string
  read: boolean
  actionRequired?: boolean
  from?: {
    name: string
    email: string
  }
  signalName?: string
  metadata?: {
    signalId?: string
    requestedBy?: string
    suggestedSignals?: string[]
    alertType?: string
    changePercent?: number
    changeDays?: number
    requestedDatasets?: string[]
    invitedEmail?: string
    assignedMetric?: string
    assignedBy?: string
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  userType: UserType
  role?: string
  goal?: string
  plan?: PlanType
  trialEndsAt?: string
  productCategory?: string
  productStage?: string
  businessStage?: string
}

export interface Insight {
  id: string
  category: InsightCategory
  header: string
  metric: string
  value: string
  change: string
  trend: "up" | "down"
  timeframe: string
  description: string
  summary: string
  benchmark?: string
  analysis: string
  implications: string
  nextSteps: string
  source: string
  dataSources?: DataSource[]
  isRAG: boolean
  team: UserGroup
  isBenchmark?: boolean
  benchmarkContext?: {
    productCategory?: string[]
    productStage?: string[]
    businessStage?: string[]
  }
}
