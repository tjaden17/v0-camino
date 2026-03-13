// Service for processing uploaded data and saving to Supabase database - v2
import type { ParsedCSVRow, ColumnMapping } from "./csv-parser"
import { parseFormattedNumber } from "./csv-parser"
import { createAdminClient } from "./supabase/admin"

export interface ProcessedSignal {
  name: string
  category: string
  dataPoints: Array<{
    value: number | string
    date: Date
    metadata?: Record<string, any>
  }>
  benchmark?: number
  trend?: "increasing" | "decreasing" | "stable"
}

export interface UploadResult {
  success: boolean
  signalsCreated: number
  signalsUpdated: number
  dataPointsAdded: number
  errors: string[]
}

function extractMetricsFromData(rows: ParsedCSVRow[], mappings: ColumnMapping[]): Map<string, ProcessedSignal> {
  console.log("[v0] Extracting metrics from", rows.length, "rows")

  const signalsMap = new Map<string, ProcessedSignal>()

  // Find the columns that represent metrics
  const nameMapping = mappings.find((m) => m.signalField === "name")
  const valueMapping = mappings.find((m) => m.signalField === "value")
  const categoryMapping = mappings.find((m) => m.signalField === "category")
  const dateMapping = mappings.find((m) => m.signalField === "date")
  const benchmarkMapping = mappings.find((m) => m.signalField === "benchmark")

  if (!nameMapping || !valueMapping) {
    console.log("[v0] Missing required mappings (name or value)")
    return signalsMap
  }

  // Process each row and group by signal name
  for (const row of rows) {
    const signalName = String(row[nameMapping.csvColumn] || "").trim()
    const rawValue = row[valueMapping.csvColumn]
    
    // Skip rows with empty signal name
    if (!signalName) {
      continue
    }
    
    // Parse the value using our formatter that handles commas, K/M/B suffixes, etc.
    const parsedValue = parseFormattedNumber(rawValue)
    
    // Skip rows with invalid/empty values
    if (parsedValue === null) {
      continue
    }
    
    const value = parsedValue
    const category = categoryMapping ? String(row[categoryMapping.csvColumn] || "General") : "General"
    const dateStr = dateMapping ? String(row[dateMapping.csvColumn]) : ""
    const date = dateStr ? new Date(dateStr) : new Date()
    const benchmarkRaw = benchmarkMapping ? row[benchmarkMapping.csvColumn] : undefined
    const benchmark = benchmarkRaw ? parseFormattedNumber(benchmarkRaw) ?? undefined : undefined

    // Get or create signal
    if (!signalsMap.has(signalName)) {
      signalsMap.set(signalName, {
        name: signalName,
        category,
        dataPoints: [],
        benchmark,
      })
    }

    const signal = signalsMap.get(signalName)!
    signal.dataPoints.push({ value, date, metadata: { ...row } })
  }

  // Calculate trends for each signal (only for numeric signals)
  for (const signal of signalsMap.values()) {
    const hasNumericValues = signal.dataPoints.every((dp) => typeof dp.value === "number")
    if (hasNumericValues) {
      signal.trend = calculateTrend(signal.dataPoints as Array<{ value: number; date: Date }>)
    } else {
      signal.trend = "stable"
    }
  }

  console.log("[v0] Extracted", signalsMap.size, "unique metrics from data")
  return signalsMap
}

function calculateTrend(dataPoints: Array<{ value: number; date: Date }>): "increasing" | "decreasing" | "stable" {
  if (dataPoints.length < 2) return "stable"

  // Sort by date
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Compare first and last values
  const first = sorted[0].value
  const last = sorted[sorted.length - 1].value
  const change = ((last - first) / first) * 100

  if (change > 5) return "increasing"
  if (change < -5) return "decreasing"
  return "stable"
}

export async function processAndSaveSignals(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
  userId: string,
  organizationId?: string,
): Promise<UploadResult> {
  const result: UploadResult = {
    success: true,
    signalsCreated: 0,
    signalsUpdated: 0,
    dataPointsAdded: 0,
    errors: [],
  }

  try {
    console.log("[v0] Processing", rows.length, "rows into aggregated signals")

    // Extract unique metrics from the data
    const signalsMap = extractMetricsFromData(rows, mappings)

    console.log("[v0] Found", signalsMap.size, "unique signals to create/update")

    // Process each unique signal
    for (const signal of signalsMap.values()) {
      try {
        const isNew = await isSignalNew(signal.name, organizationId)

        if (isNew) {
          await createSignal(signal, userId, organizationId)
          result.signalsCreated++
        } else {
          await updateSignal(signal, userId, organizationId)
          result.signalsUpdated++
        }

        // Add all data points for this signal
        const pointsAdded = await addDataPoints(signal, userId, organizationId)
        result.dataPointsAdded += pointsAdded
      } catch (error) {
        console.error("[v0] Error processing signal:", signal.name, error)
        result.errors.push(`${signal.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    result.success = result.errors.length === 0
    console.log("[v0] Processing complete:", result)
  } catch (error) {
    console.error("[v0] processAndSaveSignals error:", error)
    result.success = false
    result.errors.push(error instanceof Error ? error.message : "Unknown error occurred")
  }

  return result
}

export async function processRowsBatch(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
  userId: string,
  organizationId?: string,
): Promise<UploadResult> {
  // Same implementation as processAndSaveSignals since we now aggregate
  return processAndSaveSignals(rows, mappings, userId, organizationId)
}

async function isSignalNew(signalName: string, organizationId?: string): Promise<boolean> {
  const supabase = createAdminClient()

  const query = supabase.from("signals").select("id").eq("name", signalName)

  if (organizationId) {
    query.eq("organization_id", organizationId)
  } else {
    query.is("organization_id", null)
  }

  const { data } = await query.maybeSingle()
  return !data
}

async function createSignal(signal: ProcessedSignal, userId: string, organizationId?: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from("signals").insert({
    name: signal.name,
    category: signal.category,
    owner_id: userId,
    benchmark_value: signal.benchmark || null,
    benchmark_type: signal.benchmark ? "target" : null,
    trend: signal.trend || "stable",
    created_by: userId,
    organization_id: organizationId || null,
  })

  if (error) {
    console.error("[v0] createSignal error:", error)
    throw new Error(`Failed to create signal: ${error.message}`)
  }

  console.log("[v0] Created signal:", signal.name)
}

async function updateSignal(signal: ProcessedSignal, userId: string, organizationId?: string): Promise<void> {
  const supabase = createAdminClient()

  const query = supabase
    .from("signals")
    .update({
      benchmark_value: signal.benchmark || null,
      category: signal.category,
      trend: signal.trend || "stable",
      updated_at: new Date().toISOString(),
    })
    .eq("name", signal.name)

  if (organizationId) {
    query.eq("organization_id", organizationId)
  } else {
    query.is("organization_id", null)
  }

  const { error } = await query

  if (error) {
    console.error("[v0] updateSignal error:", error)
    throw new Error(`Failed to update signal: ${error.message}`)
  }

  console.log("[v0] Updated signal:", signal.name)
}

async function addDataPoints(signal: ProcessedSignal, userId: string, organizationId?: string): Promise<number> {
  const supabase = createAdminClient()

  const query = supabase.from("signals").select("id").eq("name", signal.name)

  if (organizationId) {
    query.eq("organization_id", organizationId)
  } else {
    query.is("organization_id", null)
  }

  const { data: signalData, error: findError } = await query.maybeSingle()

  if (findError || !signalData) {
    console.error("[v0] Signal lookup error:", findError)
    throw new Error(`Signal not found: ${signal.name}`)
  }

  // Prepare all data points for bulk insert
  const dataPointsToInsert = signal.dataPoints.map((dp) => ({
    signal_id: signalData.id,
    value: typeof dp.value === "number" ? dp.value : 0,
    date: dp.date.toISOString().split("T")[0],
    created_by: userId,
    metadata: typeof dp.value === "string" ? { ...dp.metadata, original_value: dp.value } : dp.metadata,
  }))

  // Bulk upsert all data points
  const { error } = await supabase.from("data_points").upsert(dataPointsToInsert, {
    onConflict: "signal_id,date",
  })

  if (error) {
    console.error("[v0] addDataPoints error:", error)
    throw new Error(`Failed to add data points: ${error.message}`)
  }

  console.log("[v0] Added", dataPointsToInsert.length, "data points for signal:", signal.name)
  return dataPointsToInsert.length
}

export async function getUploadHistory(userId: string, limit = 10, organizationId?: string) {
  const supabase = createAdminClient()

  const query = supabase
    .from("upload_history")
    .select("*")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (organizationId) {
    query.eq("organization_id", organizationId)
  } else {
    query.is("organization_id", null)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] getUploadHistory error:", error)
    return []
  }

  return data || []
}

export async function logUpload(
  userId: string,
  filename: string,
  result: UploadResult,
  organizationId?: string,
): Promise<void> {
  const supabase = createAdminClient()
  const status = result.success ? "success" : result.errors.length < result.signalsCreated ? "partial" : "failed"

  const { error } = await supabase.from("upload_history").insert({
    file_name: filename,
    uploaded_by: userId,
    signals_created: result.signalsCreated,
    signals_updated: result.signalsUpdated,
    data_points_added: result.dataPointsAdded,
    status,
    errors: result.errors.length > 0 ? result.errors : null,
    organization_id: organizationId || null,
  })

  if (error) {
    console.error("[v0] logUpload error:", error)
  }
}
