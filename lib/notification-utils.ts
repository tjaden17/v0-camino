import type { Notification } from "./types"

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("camino-notifications")
  return stored ? JSON.parse(stored) : []
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("camino-notifications", JSON.stringify(notifications))
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt">): void {
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  notifications.unshift(newNotification)
  saveNotifications(notifications)
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  saveNotifications(updated)
}

export function getUnreadCount(): number {
  const notifications = getNotifications()
  return notifications.filter((n) => !n.read).length
}

export function clearAllNotifications(): void {
  saveNotifications([])
}

export function createDemoNotificationsForManager(): void {
  const demoNotifications: Omit<Notification, "id" | "createdAt">[] = [
    {
      type: "signal_request",
      title: "Signal Request from CEO",
      message: "Adam (CEO) has requested you to update signals for the sales team, including Win/Loss rate",
      from: {
        name: "Adam",
        email: "adam@company.com",
      },
      signalName: "Win/Loss Rate",
      actionRequired: true,
      read: false,
      metadata: {
        signalId: "win-loss",
        requestedBy: "ceo-adam",
        suggestedSignals: ["Win/Loss Rate", "Deal Velocity", "Pipeline Value"],
      },
    },
    {
      type: "system",
      title: "Alert: Win/Loss Trending Down",
      message: "Your Win/Loss rate has decreased by 8% in the last week. Immediate attention recommended.",
      actionRequired: true,
      read: false,
      metadata: {
        alertType: "trending_down",
        signalId: "win-loss",
        changePercent: -8,
      },
    },
    {
      type: "system",
      title: "Alert: Deal Velocity Slowing",
      message: "Deal velocity has increased by 12 days on average. Review sales process for bottlenecks.",
      actionRequired: true,
      read: false,
      metadata: {
        alertType: "trending_down",
        signalId: "deal-velocity",
        changeDays: 12,
      },
    },
  ]

  demoNotifications.forEach((notif) => addNotification(notif))
}

export function createMetricAssignmentNotification(
  metricName: string,
  assignedTo: string,
  assignedBy: { name: string; email: string },
): void {
  addNotification({
    type: "metric_assignment",
    title: "Metric Assigned to You",
    message: `${assignedBy.name} has assigned you the metric: ${metricName}`,
    from: assignedBy,
    actionRequired: false,
    read: false,
    metadata: {
      assignedMetric: metricName,
      assignedBy: assignedBy.email,
    },
  })
}

export function createDataConnectionRequestNotification(
  datasets: string[],
  requestedBy: { name: string; email: string },
  invitedEmail: string,
): void {
  addNotification({
    type: "data_connection_request",
    title: "Dataset Connection Request",
    message: `${requestedBy.name} has requested you to connect datasets: ${datasets.join(", ")}`,
    from: requestedBy,
    actionRequired: true,
    read: false,
    metadata: {
      requestedDatasets: datasets,
      invitedEmail,
    },
  })
}
