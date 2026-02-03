// Universal schema for transforming external data sources into Camino signals

export interface UniversalDataPoint {
  // Core fields
  name: string // Signal/metric name
  value: number // Current value
  date: Date // Measurement date

  // Context
  category: "sales" | "support" | "marketing" | "operations" | "finance" | "product" | "custom"
  source: "zoho_crm" | "zoho_desk" | "hubspot" | "csv" | "manual"
  sourceId?: string // External ID from source system

  // Performance indicators
  benchmark?: number // Target/goal value
  previousValue?: number // Previous period value for trend calculation
  trend?: "increasing" | "decreasing" | "stable"

  // Ownership & accountability
  ownerId?: string // User responsible
  ownerEmail?: string // For lookup

  // Additional context
  metadata?: Record<string, any> // Source-specific data
  unit?: string // e.g., "$", "%", "count"
  description?: string // What this metric represents
}

export interface DataTransformationRule {
  sourceField: string
  targetField: keyof UniversalDataPoint
  transform?: (value: any) => any
  required?: boolean
}

// Zoho CRM → Universal Schema Mappings
export const ZOHO_CRM_MAPPINGS: Record<string, DataTransformationRule[]> = {
  // Deals/Revenue
  deals: [
    { sourceField: "Amount", targetField: "value", transform: (v) => Number.parseFloat(v) || 0, required: true },
    { sourceField: "Deal_Name", targetField: "name" },
    { sourceField: "Closing_Date", targetField: "date", transform: (v) => new Date(v) },
    { sourceField: "Owner.email", targetField: "ownerEmail" },
    { sourceField: "Stage", targetField: "metadata" },
  ],

  // Contacts
  contacts: [
    { sourceField: "Total_Contacts", targetField: "value", required: true },
    { sourceField: "Created_Time", targetField: "date", transform: (v) => new Date(v) },
  ],

  // Revenue metrics
  revenue: [
    { sourceField: "Annual_Revenue", targetField: "value", required: true },
    { sourceField: "Owner.email", targetField: "ownerEmail" },
  ],
}

// Zoho Desk → Universal Schema Mappings
export const ZOHO_DESK_MAPPINGS: Record<string, DataTransformationRule[]> = {
  tickets: [
    { sourceField: "ticketNumber", targetField: "sourceId" },
    { sourceField: "createdTime", targetField: "date", transform: (v) => new Date(v) },
    { sourceField: "status", targetField: "metadata" },
    { sourceField: "priority", targetField: "metadata" },
    { sourceField: "assignee.email", targetField: "ownerEmail" },
  ],

  satisfaction: [
    { sourceField: "rating", targetField: "value", transform: (v) => Number.parseFloat(v) || 0 },
    { sourceField: "submittedTime", targetField: "date", transform: (v) => new Date(v) },
  ],
}

// HubSpot → Universal Schema Mappings
export const HUBSPOT_MAPPINGS: Record<string, DataTransformationRule[]> = {
  deals: [
    { sourceField: "amount", targetField: "value", transform: (v) => Number.parseFloat(v) || 0, required: true },
    { sourceField: "dealname", targetField: "name" },
    { sourceField: "closedate", targetField: "date", transform: (v) => new Date(v) },
    { sourceField: "hubspot_owner_id", targetField: "ownerId" },
  ],

  contacts: [
    { sourceField: "num_associated_contacts", targetField: "value", required: true },
    { sourceField: "createdate", targetField: "date", transform: (v) => new Date(v) },
  ],

  emails: [
    { sourceField: "hs_email_open_rate", targetField: "value", transform: (v) => Number.parseFloat(v) * 100 },
    { sourceField: "hs_email_click_rate", targetField: "value", transform: (v) => Number.parseFloat(v) * 100 },
  ],
}

export function transformToUniversalSchema(
  sourceData: any[],
  mappings: DataTransformationRule[],
  defaults: Partial<UniversalDataPoint>,
): UniversalDataPoint[] {
  const results: UniversalDataPoint[] = []

  for (const record of sourceData) {
    const dataPoint: Partial<UniversalDataPoint> = { ...defaults }

    for (const mapping of mappings) {
      const sourceValue = getNestedValue(record, mapping.sourceField)

      if (sourceValue === undefined || sourceValue === null) {
        if (mapping.required) continue // Skip this record if required field is missing
        continue
      }

      const transformedValue = mapping.transform ? mapping.transform(sourceValue) : sourceValue

      if (mapping.targetField === "metadata") {
        dataPoint.metadata = dataPoint.metadata || {}
        dataPoint.metadata[mapping.sourceField] = transformedValue
      } else {
        ;(dataPoint as any)[mapping.targetField] = transformedValue
      }
    }

    // Only add if we have the core required fields
    if (dataPoint.name && dataPoint.value !== undefined && dataPoint.date) {
      results.push(dataPoint as UniversalDataPoint)
    }
  }

  return results
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj)
}

// Calculate trend automatically
export function calculateTrend(current: number, previous: number): "increasing" | "decreasing" | "stable" {
  const threshold = 0.01 // 1% threshold for "stable"
  const percentChange = Math.abs((current - previous) / previous)

  if (percentChange < threshold) return "stable"
  return current > previous ? "increasing" : "decreasing"
}

// Aggregate multiple data points into signals
export function aggregateToSignals(dataPoints: UniversalDataPoint[]): Map<string, UniversalDataPoint> {
  const signals = new Map<string, UniversalDataPoint>()

  // Group by signal name
  const grouped = dataPoints.reduce(
    (acc, point) => {
      if (!acc[point.name]) acc[point.name] = []
      acc[point.name].push(point)
      return acc
    },
    {} as Record<string, UniversalDataPoint[]>,
  )

  // For each signal, keep the most recent value
  for (const [name, points] of Object.entries(grouped)) {
    const sorted = points.sort((a, b) => b.date.getTime() - a.date.getTime())
    const latest = sorted[0]

    // Calculate trend if we have previous data
    if (sorted.length > 1) {
      const previous = sorted[1]
      latest.previousValue = previous.value
      latest.trend = calculateTrend(latest.value, previous.value)
    }

    signals.set(name, latest)
  }

  return signals
}
