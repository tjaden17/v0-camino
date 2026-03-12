import { mockIntegrationData, type MockIntegration } from "./mock-data"
import type { SignalWithData } from "./signals-service"

const DEMO_MODE_KEY = "camino_demo_mode"
const DEMO_INTEGRATIONS_KEY = "camino_demo_integrations"

export function enableDemoMode(integrations: MockIntegration[]) {
  try {
    localStorage.setItem(DEMO_MODE_KEY, "true")
    localStorage.setItem(DEMO_INTEGRATIONS_KEY, JSON.stringify(integrations))
    return { success: true }
  } catch (error) {
    console.error("Error enabling demo mode:", error)
    return { success: false, error }
  }
}

export function clearDemoModeIfExists() {
  try {
    if (typeof window !== "undefined" && localStorage.getItem(DEMO_MODE_KEY)) {
      localStorage.removeItem(DEMO_MODE_KEY)
      localStorage.removeItem(DEMO_INTEGRATIONS_KEY)
    }
  } catch (error) {
    console.error("Error clearing demo mode:", error)
  }
}

export function disableDemoMode() {
  try {
    localStorage.removeItem(DEMO_MODE_KEY)
    localStorage.removeItem(DEMO_INTEGRATIONS_KEY)
    return { success: true }
  } catch (error) {
    console.error("Error disabling demo mode:", error)
    return { success: false, error }
  }
}

export function getDemoModeStatus() {
  try {
    const enabled = localStorage.getItem(DEMO_MODE_KEY) === "true"
    const integrationsStr = localStorage.getItem(DEMO_INTEGRATIONS_KEY)
    const integrations: MockIntegration[] = integrationsStr ? JSON.parse(integrationsStr) : []
    return { enabled, integrations }
  } catch (error) {
    console.error("Error getting demo mode status:", error)
    return { enabled: false, integrations: [] }
  }
}

export function getDemoSignals(): SignalWithData[] {
  const { enabled, integrations } = getDemoModeStatus()

  if (!enabled || integrations.length === 0) {
    return []
  }

  const signals: SignalWithData[] = []

  for (const integration of integrations) {
    const integrationData = mockIntegrationData[integration]

    for (const metric of integrationData.metrics) {
      const latestValue = metric.dataPoints[metric.dataPoints.length - 1]?.value || 0
      const previousValue = metric.dataPoints[metric.dataPoints.length - 2]?.value || 0
      const change = latestValue - previousValue
      const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0

      let trend: "increasing" | "decreasing" | "stable" = "stable"
      if (changePercent > 5) trend = "increasing"
      else if (changePercent < -5) trend = "decreasing"

      signals.push({
        id: `demo-${integration}-${metric.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: metric.name,
        description: `${metric.category} metric from ${integrationData.name}`,
        source: integrationData.name,
        category: metric.category,
        owner_id: "demo-user",
        owner_name: "Demo User",
        current_value: latestValue,
        previous_value: previousValue,
        change_amount: change,
        change_percent: changePercent,
        trend,
        data_points: metric.dataPoints,
        last_updated: metric.dataPoints[metric.dataPoints.length - 1]?.date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_demo: true,
      })
    }
  }

  return signals
}
