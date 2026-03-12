// Dual Path Storage Service - implements the two-path architecture:
// Path 1: Immediate signal generation from mapped columns
// Path 2: Raw data preservation for future AI analysis

import { createAdminClient } from "./supabase/admin"
import type { ParsedCSVRow, ColumnMapping } from "./csv-parser"

export interface DualPathUploadResult {
  success: boolean
  uploadId: string

  // Path 1: Immediate signals
  signalsCreated: number
  signalsUpdated: number
  dataPointsAdded: number

  // Path 2: Raw data preservation
  rawRowsStored: number
  columnsPreserved: string[]

  errors: string[]
  warnings: string[]
}

export interface RawDataUpload {
  id: string
  organizationId: string
  uploadedBy: string
  uploadName: string
  sourceType: string
  fileName?: string
  totalRows: number
  columnNames: string[]
  columnMappings: Record<string, string>
  signalsCreated: number
  signalsUpdated: number
  uploadedAt: Date
}

/**
 * Main function to process data upload with dual-path storage
 * This is the entry point for the new architecture
 */
export async function processDualPathUpload(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
  userId: string,
  organizationId: string,
  uploadMetadata: {
    fileName: string
    sourceType: string
    uploadName?: string
  },
): Promise<DualPathUploadResult> {
  console.log("[v0] Starting dual-path storage for", rows.length, "rows")

  const result: DualPathUploadResult = {
    success: false,
    uploadId: "",
    signalsCreated: 0,
    signalsUpdated: 0,
    dataPointsAdded: 0,
    rawRowsStored: 0,
    columnsPreserved: [],
    errors: [],
    warnings: [],
  }

  try {
    const supabase = createAdminClient()

    // Step 1: Create upload record
    const columnNames = rows.length > 0 ? Object.keys(rows[0]) : []
    const columnMappingsObj = mappings.reduce(
      (acc, m) => {
        if (m.signalField !== "skip") {
          acc[m.csvColumn] = m.signalField
        }
        return acc
      },
      {} as Record<string, string>,
    )

    const { data: uploadRecord, error: uploadError } = await supabase
      .from("raw_data_uploads")
      .insert({
        organization_id: organizationId,
        uploaded_by: userId,
        upload_name: uploadMetadata.uploadName || uploadMetadata.fileName,
        source_type: uploadMetadata.sourceType,
        file_name: uploadMetadata.fileName,
        total_rows: rows.length,
        column_names: columnNames,
        column_mappings: columnMappingsObj,
      })
      .select()
      .single()

    if (uploadError || !uploadRecord) {
      throw new Error(`Failed to create upload record: ${uploadError?.message}`)
    }

    result.uploadId = uploadRecord.id
    result.columnsPreserved = columnNames

    console.log("[v0] Created upload record:", uploadRecord.id)

    // Step 2: PATH 1 - Generate immediate signals from mapped data
    const signalResults = await generateImmediateSignals(rows, mappings, userId, organizationId, uploadRecord.id)

    result.signalsCreated = signalResults.signalsCreated
    result.signalsUpdated = signalResults.signalsUpdated
    result.dataPointsAdded = signalResults.dataPointsAdded
    result.errors.push(...signalResults.errors)

    console.log("[v0] Path 1 complete: Generated", result.signalsCreated, "signals")

    // Step 3: PATH 2 - Store ALL raw data with original columns preserved
    const rawDataResults = await storeRawDataRows(
      rows,
      mappings,
      uploadRecord.id,
      organizationId,
      signalResults.signalIdMap,
    )

    result.rawRowsStored = rawDataResults.rowsStored
    result.errors.push(...rawDataResults.errors)
    result.warnings.push(...rawDataResults.warnings)

    console.log("[v0] Path 2 complete: Stored", result.rawRowsStored, "raw rows")

    // Step 4: Update upload record with results
    await supabase
      .from("raw_data_uploads")
      .update({
        signals_created: result.signalsCreated,
        signals_updated: result.signalsUpdated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uploadRecord.id)

    result.success = result.errors.length === 0
    console.log("[v0] Dual-path storage complete:", result)
  } catch (error) {
    console.error("[v0] Dual-path storage error:", error)
    result.errors.push(error instanceof Error ? error.message : "Unknown error")
  }

  return result
}

/**
 * PATH 1: Generate immediate signals from mapped columns
 */
async function generateImmediateSignals(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
  userId: string,
  organizationId: string,
  uploadId: string,
): Promise<{
  signalsCreated: number
  signalsUpdated: number
  dataPointsAdded: number
  errors: string[]
  signalIdMap: Map<string, string> // signal name -> signal id
}> {
  const supabase = createAdminClient()
  const result = {
    signalsCreated: 0,
    signalsUpdated: 0,
    dataPointsAdded: 0,
    errors: [] as string[],
    signalIdMap: new Map<string, string>(),
  }

  const signalsMap = extractSignalsFromMappedData(rows, mappings)

  console.log("[v0] Extracted", signalsMap.size, "unique signals")

  // Process each signal
  for (const [signalName, signalData] of signalsMap.entries()) {
    try {
      // Check if signal exists
      const { data: existingSignal } = await supabase
        .from("signals")
        .select("id")
        .eq("name", signalName)
        .eq("organization_id", organizationId)
        .maybeSingle()

      let signalId: string

      if (existingSignal) {
        // Update existing signal
        signalId = existingSignal.id
        await supabase
          .from("signals")
          .update({
            trend: signalData.trend,
            updated_at: new Date().toISOString(),
          })
          .eq("id", signalId)

        result.signalsUpdated++
      } else {
        // Create new signal
        const { data: newSignal, error } = await supabase
          .from("signals")
          .insert({
            name: signalName,
            category: signalData.category,
            owner_id: userId,
            organization_id: organizationId,
            trend: signalData.trend,
            source_upload_id: uploadId, // Link to upload
            created_by: userId,
          })
          .select()
          .single()

        if (error || !newSignal) {
          throw new Error(`Failed to create signal: ${error?.message}`)
        }

        signalId = newSignal.id
        result.signalsCreated++
      }

      result.signalIdMap.set(signalName, signalId)

      const dataPointsByDate = new Map<string, { values: number[]; notes: string[] }>()

      for (const dp of signalData.dataPoints) {
        const dateKey = dp.date.toISOString().split("T")[0]
        const value = typeof dp.value === "number" ? dp.value : 0
        const note = dp.metadata ? JSON.stringify(dp.metadata).substring(0, 200) : ""

        if (!dataPointsByDate.has(dateKey)) {
          dataPointsByDate.set(dateKey, { values: [], notes: [] })
        }

        const existing = dataPointsByDate.get(dateKey)!
        existing.values.push(value)
        if (note) existing.notes.push(note)
      }

      // Create deduplicated data points - sum values for same date
      const dataPoints = Array.from(dataPointsByDate.entries()).map(([dateKey, data]) => ({
        signal_id: signalId,
        value: data.values.reduce((sum, v) => sum + v, 0), // Sum all values for the day
        date: dateKey,
        created_by: userId,
        notes: data.notes.length > 0 ? `Aggregated from ${data.values.length} records` : null,
      }))

      console.log("[v0] Upserting", dataPoints.length, "deduplicated data points for signal:", signalName)

      const { error: dpError } = await supabase.from("data_points").upsert(dataPoints, { onConflict: "signal_id,date" })

      if (dpError) {
        throw new Error(`Failed to add data points: ${dpError.message}`)
      }

      result.dataPointsAdded += dataPoints.length
    } catch (error) {
      console.error("[v0] Error processing signal:", signalName, error)
      result.errors.push(`${signalName}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

/**
 * PATH 2: Store ALL raw data with complete original columns
 */
async function storeRawDataRows(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
  uploadId: string,
  organizationId: string,
  signalIdMap: Map<string, string>,
): Promise<{
  rowsStored: number
  errors: string[]
  warnings: string[]
}> {
  const supabase = createAdminClient()
  const result = {
    rowsStored: 0,
    errors: [] as string[],
    warnings: [] as string[],
  }

  console.log("[v0] Storing", rows.length, "raw data rows with ALL original columns")

  const rawDataRows = rows.map((row, index) => {
    // Extract only mapped columns for normalized_data
    const normalizedData: Record<string, any> = {}
    for (const mapping of mappings) {
      if (mapping.signalField !== "skip") {
        normalizedData[mapping.signalField] = row[mapping.csvColumn]
      }
    }

    // Get signal name from this row to link
    const nameMapping = mappings.find((m) => m.signalField === "name")
    const signalName = nameMapping ? String(row[nameMapping.csvColumn]) : null
    const signalId = signalName ? signalIdMap.get(signalName) : null

    return {
      upload_id: uploadId,
      organization_id: organizationId,
      row_index: index,
      original_data: row, // ALL original columns preserved!
      normalized_data: normalizedData, // Only mapped columns
      generated_signal_ids: signalId ? [signalId] : [],
      metadata: {
        row_count: Object.keys(row).length,
        has_nulls: Object.values(row).some((v) => v === null || v === ""),
        preserved_at: new Date().toISOString(),
      },
    }
  })

  // Batch insert in chunks of 1000 (Supabase limit)
  const BATCH_SIZE = 1000
  for (let i = 0; i < rawDataRows.length; i += BATCH_SIZE) {
    const batch = rawDataRows.slice(i, i + BATCH_SIZE)

    const { error } = await supabase.from("raw_data_rows").insert(batch)

    if (error) {
      console.error("[v0] Error storing raw data batch:", error)
      result.errors.push(`Batch ${i}-${i + batch.length}: ${error.message}`)
    } else {
      result.rowsStored += batch.length
      console.log("[v0] Stored batch:", i, "-", i + batch.length)
    }
  }

  if (result.rowsStored < rows.length) {
    result.warnings.push(`Only stored ${result.rowsStored} of ${rows.length} rows`)
  }

  return result
}

/**
 * Extract signals from mapped data (reusing existing logic)
 */
function extractSignalsFromMappedData(
  rows: ParsedCSVRow[],
  mappings: ColumnMapping[],
): Map<
  string,
  {
    category: string
    trend: "increasing" | "decreasing" | "stable"
    dataPoints: Array<{
      value: number | string
      date: Date
      metadata: Record<string, any>
    }>
  }
> {
  const signalsMap = new Map()

  const nameMapping = mappings.find((m) => m.signalField === "name")
  const valueMapping = mappings.find((m) => m.signalField === "value")
  const categoryMapping = mappings.find((m) => m.signalField === "category")
  const dateMapping = mappings.find((m) => m.signalField === "date")

  if (!nameMapping || !valueMapping) {
    return signalsMap
  }

  for (const row of rows) {
    const signalName = String(row[nameMapping.csvColumn])
    const rawValue = row[valueMapping.csvColumn]
    const value = !isNaN(Number(rawValue)) ? Number(rawValue) : String(rawValue)
    const category = categoryMapping ? String(row[categoryMapping.csvColumn]) : "General"
    const date = dateMapping ? new Date(String(row[dateMapping.csvColumn])) : new Date()

    if (!signalName) continue

    if (!signalsMap.has(signalName)) {
      signalsMap.set(signalName, {
        category,
        trend: "stable" as const,
        dataPoints: [],
      })
    }

    signalsMap.get(signalName).dataPoints.push({
      value,
      date,
      metadata: { ...row },
    })
  }

  // Calculate trends
  for (const signal of signalsMap.values()) {
    const hasNumericValues = signal.dataPoints.every((dp: any) => typeof dp.value === "number")
    if (hasNumericValues && signal.dataPoints.length >= 2) {
      const sorted = [...signal.dataPoints].sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      const first = sorted[0].value
      const last = sorted[sorted.length - 1].value
      const change = ((last - first) / first) * 100
      signal.trend = change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable"
    }
  }

  return signalsMap
}

/**
 * Get upload history with stats
 */
export async function getRawDataUploads(organizationId: string, limit = 20): Promise<RawDataUpload[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("raw_data_uploads")
    .select("*")
    .eq("organization_id", organizationId)
    .order("uploaded_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] getRawDataUploads error:", error)
    return []
  }

  return (data || []).map((d) => ({
    id: d.id,
    organizationId: d.organization_id,
    uploadedBy: d.uploaded_by,
    uploadName: d.upload_name,
    sourceType: d.source_type,
    fileName: d.file_name,
    totalRows: d.total_rows,
    columnNames: d.column_names,
    columnMappings: d.column_mappings,
    signalsCreated: d.signals_created,
    signalsUpdated: d.signals_updated,
    uploadedAt: new Date(d.uploaded_at),
  }))
}

/**
 * Query raw data for AI analysis (future feature)
 */
export async function queryRawData(
  uploadId: string,
  filters?: {
    columnName?: string
    columnValue?: any
    limit?: number
  },
): Promise<ParsedCSVRow[]> {
  const supabase = createAdminClient()

  let query = supabase.from("raw_data_rows").select("original_data").eq("upload_id", uploadId)

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] queryRawData error:", error)
    return []
  }

  let results = (data || []).map((d) => d.original_data as ParsedCSVRow)

  // Apply column filters
  if (filters?.columnName && filters?.columnValue !== undefined) {
    results = results.filter((row) => row[filters.columnName!] === filters.columnValue)
  }

  return results
}
