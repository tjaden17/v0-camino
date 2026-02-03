export interface Alert {
  id: string
  type: "bug" | "support" | "engagement" | "custom"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  issueId: string
  timestamp: Date
  read: boolean
}

export interface NotificationSettings {
  alertsEnabled: boolean
  weeklyEmailEnabled: boolean
  customAlertIssues: string[] // Issue IDs to track
}

// Mock alerts data
export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "bug",
    severity: "high",
    title: "Increasing Tech Bugs (Showstoppers)",
    description: "Critical bugs up 45% in last 7 days - immediate attention required",
    issueId: "showstopper-bugs",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: "alert-2",
    type: "support",
    severity: "high",
    title: "Support Ticket Volume Increasing",
    description: "Ticket volume up 32% - escalating faster than resolution capacity",
    issueId: "support-volume",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
  },
  {
    id: "alert-3",
    type: "engagement",
    severity: "medium",
    title: "Decreasing Goal Completion",
    description: "Key feature adoption down 18% - users not completing core workflows",
    issueId: "goal-completion",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
]

export function getUnreadAlerts(): Alert[] {
  return mockAlerts.filter((alert) => !alert.read)
}

export function markAlertAsRead(alertId: string): void {
  const alert = mockAlerts.find((a) => a.id === alertId)
  if (alert) {
    alert.read = true
  }
}
