// Staging Service - Manages data staging and cross-source signal discovery
// Holds raw data temporarily, analyzes across all sources to find combinable signals

import { createAdminClient } from "@/lib/supabase/admin"
import {
  SIGNAL_DEFINITIONS,
  type SignalRequirement,
  type DetectedColumn,
  type DiscoveredSignal,
  normalizeFieldName,
  detectColumns,
} from "@/lib/signal-discovery-service"
import type { ParsedCSVRow } from "@/lib/csv-parser"

// ============================================
// TYPES
// ============================================

export interface StagedUpload {
  id: string
  userId: string
  organizationId: string | null
  fileName: string
  fileType: string
  sourceType: string | null
  rowCount: number
  columnCount: number
  uploadedAt: Date
  processedAt: Date | null
  status: "staged" | "processing" | "processed" | "failed"
  metadata: Record<string, unknown>
}

export interface StagedField {
  id: string
  uploadId: string
  originalColumnName: string
  normalizedFieldName: string
  fieldType: string
  sampleValues: string[]
  stats: {
    min?: number
    max?: number
    avg?: number
    count: number
    nullCount: number
  }
}

export interface SignalOpportunity {
  id: string
  signalName: string
  signalCategory: string
  discoveryType: "single_source" | "cross_source" | "derived"
  requiredFields: string[]
  availableFields: { field: string; uploadId: string; uploadName: string }[]
  missingFields: string[]
  sourceUploads: { id: string; name: string }[]
  isCalculable: boolean
  confidenceScore: number
  status: "discovered" | "selected" | "calculated" | "dismissed"
}

export interface CrossSourceDiscoveryResult {
  newOpportunities: SignalOpportunity[]
  unlockedSignals: SignalOpportunity[] // Previously partial, now calculable
  stillMissing: { signal: string; missingFields: string[] }[]
  recommendations: string[]
}

// ============================================
// STAGING SERVICE
// ============================================

export class StagingService {
  private userId: string
  private organizationId: string | null

  constructor(userId: string, organizationId: string | null = null) {
    this.userId = userId
    this.organizationId = organizationId
  }

  // ----------------------------------------
  // STAGE UPLOAD
  // ----------------------------------------
  async stageUpload(
    fileName: string,
    fileType: "csv" | "xlsx",
    sourceType: string | null,
    rows: ParsedCSVRow[],
    columns: string[]
  ): Promise<{ uploadId: string; fields: StagedField[] }> {
    const supabase = createAdminClient()

    // 1. Create staged upload record
    const { data: uploadResult, error: uploadError } = await supabase
      .from("staged_uploads")
      .insert({
        user_id: this.userId,
        organization_id: this.organizationId,
        file_name: fileName,
        file_type: fileType,
        source_type: sourceType,
        row_count: rows.length,
        column_count: columns.length,
        status: "staged",
      })
      .select("id")
      .single()

    if (uploadError || !uploadResult) {
      throw new Error(`Failed to create staged upload: ${uploadError?.message}`)
    }

    const uploadId = uploadResult.id

    // 2. Analyze and stage each column
    const detectedColumns = detectColumns(rows)
    const stagedFields: StagedField[] = []

    for (const col of detectedColumns) {
      const normalizedName = normalizeFieldName(col.name)
      const sampleValues = col.sampleValues.slice(0, 5)

      // Calculate stats for numeric columns
      const stats: StagedField["stats"] = {
        count: rows.length,
        nullCount: col.nullCount,
      }

      if (col.inferredType === "number") {
        const numericValues = rows
          .map(r => parseFloat(String(r[col.name] || "0").replace(/[^0-9.-]/g, "")))
          .filter(n => !isNaN(n))

        if (numericValues.length > 0) {
          stats.min = Math.min(...numericValues)
          stats.max = Math.max(...numericValues)
          stats.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        }
      }

      // Insert staged field
      const { data: fieldResult, error: fieldError } = await supabase
        .from("staged_fields")
        .insert({
          upload_id: uploadId,
          original_column_name: col.name,
          normalized_field_name: normalizedName,
          field_type: col.inferredType,
          sample_values: sampleValues,
          stats,
        })
        .select("id")
        .single()

      if (fieldError || !fieldResult) {
        console.error("[StagingService] Failed to insert staged field:", fieldError)
        continue
      }

      stagedFields.push({
        id: fieldResult.id,
        uploadId,
        originalColumnName: col.name,
        normalizedFieldName: normalizedName,
        fieldType: col.inferredType,
        sampleValues,
        stats,
      })

      // Update field availability index
      await this.updateFieldAvailability(normalizedName, uploadId, col.inferredType, rows.length)
    }

    // 3. Stage data points (for smaller datasets, store actual values)
    if (rows.length <= 10000) {
      await this.stageDataPoints(uploadId, stagedFields, rows)
    }

    return { uploadId, fields: stagedFields }
  }

  // ----------------------------------------
  // UPDATE FIELD AVAILABILITY INDEX
  // ----------------------------------------
  private async updateFieldAvailability(
    fieldName: string,
    uploadId: string,
    fieldType: string,
    dataPoints: number
  ): Promise<void> {
    const supabase = createAdminClient()

    // Check if field already exists
    const { data: existing } = await supabase
      .from("field_availability")
      .select("id, upload_ids, total_data_points")
      .eq("user_id", this.userId)
      .eq("normalized_field_name", fieldName)
      .maybeSingle()

    if (existing) {
      const currentUploads = existing.upload_ids || []
      if (!currentUploads.includes(uploadId)) {
        currentUploads.push(uploadId)
      }
      const totalPoints = (existing.total_data_points || 0) + dataPoints

      await supabase
        .from("field_availability")
        .update({
          upload_ids: currentUploads,
          total_data_points: totalPoints,
          latest_upload_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("field_availability")
        .insert({
          user_id: this.userId,
          organization_id: this.organizationId,
          normalized_field_name: fieldName,
          upload_ids: [uploadId],
          total_data_points: dataPoints,
          field_type: fieldType,
          latest_upload_at: new Date().toISOString(),
        })
    }
  }

  // ----------------------------------------
  // STAGE DATA POINTS
  // ----------------------------------------
  private async stageDataPoints(
    uploadId: string,
    fields: StagedField[],
    rows: ParsedCSVRow[]
  ): Promise<void> {
    const supabase = createAdminClient()

    // Batch insert data points (limit to first 1000 rows for performance)
    const maxRows = Math.min(rows.length, 1000)
    const batch: any[] = []

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const row = rows[rowIndex]

      for (const field of fields) {
        const value = row[field.originalColumnName]
        if (value === undefined || value === null || value === "") continue

        const stringValue = String(value)
        const numericValue = field.fieldType === "number"
          ? parseFloat(stringValue.replace(/[^0-9.-]/g, ""))
          : null
        const dateValue = field.fieldType === "date"
          ? new Date(stringValue).toISOString()
          : null

        batch.push({
          upload_id: uploadId,
          field_id: field.id,
          row_index: rowIndex,
          value: stringValue,
          numeric_value: numericValue,
          date_value: dateValue,
        })
      }
    }

    // Insert in chunks of 1000
    const BATCH_SIZE = 1000
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE)
      const { error } = await supabase.from("staged_data_points").insert(chunk)
      if (error) {
        console.error("[StagingService] Error staging data points batch:", error)
      }
    }
  }

  // ----------------------------------------
  // DISCOVER CROSS-SOURCE SIGNALS
  // ----------------------------------------
  async discoverCrossSourceSignals(): Promise<CrossSourceDiscoveryResult> {
    const supabase = createAdminClient()

    // 1. Get all available fields across all uploads
    const { data: availableFields } = await supabase
      .from("field_availability")
      .select("normalized_field_name, upload_ids, field_type, total_data_points")
      .eq("user_id", this.userId)

    const fieldMap = new Map<string, { uploadIds: string[]; type: string; count: number }>()
    for (const f of (availableFields || [])) {
      fieldMap.set(f.normalized_field_name, {
        uploadIds: f.upload_ids || [],
        type: f.field_type,
        count: f.total_data_points,
      })
    }

    // 2. Get upload names for reference
    const { data: uploads } = await supabase
      .from("staged_uploads")
      .select("id, file_name")
      .eq("user_id", this.userId)

    const uploadNames = new Map<string, string>()
    for (const u of (uploads || [])) {
      uploadNames.set(u.id, u.file_name)
    }

    // 3. Check each signal definition against available fields
    const newOpportunities: SignalOpportunity[] = []
    const unlockedSignals: SignalOpportunity[] = []
    const stillMissing: { signal: string; missingFields: string[] }[] = []
    const recommendations: string[] = []

    for (const signalDef of SIGNAL_DEFINITIONS) {
      const requiredFieldNames = signalDef.requiredFields.map(f => f.name)
      const availableForSignal: { field: string; uploadId: string; uploadName: string }[] = []
      const missing: string[] = []

      for (const reqField of requiredFieldNames) {
        const fieldInfo = fieldMap.get(reqField)
        if (fieldInfo && fieldInfo.uploadIds.length > 0) {
          for (const uploadId of fieldInfo.uploadIds) {
            availableForSignal.push({
              field: reqField,
              uploadId,
              uploadName: uploadNames.get(uploadId) || "Unknown",
            })
          }
        } else {
          missing.push(reqField)
        }
      }

      const isCalculable = missing.length === 0
      const isCrossSource = new Set(availableForSignal.map(a => a.uploadId)).size > 1

      let discoveryType: "single_source" | "cross_source" | "derived" = "single_source"
      if (isCrossSource) {
        discoveryType = "cross_source"
      } else if (signalDef.calculationType === "calculated") {
        discoveryType = "derived"
      }

      const confidenceScore = availableForSignal.length / requiredFieldNames.length

      const opportunity: SignalOpportunity = {
        id: `opp_${signalDef.signalId}`,
        signalName: signalDef.signalName,
        signalCategory: signalDef.category,
        discoveryType,
        requiredFields: requiredFieldNames,
        availableFields: availableForSignal,
        missingFields: missing,
        sourceUploads: [...new Set(availableForSignal.map(a => a.uploadId))].map(id => ({
          id,
          name: uploadNames.get(id) || "Unknown",
        })),
        isCalculable,
        confidenceScore,
        status: "discovered",
      }

      if (isCalculable) {
        const { data: existingOpp } = await supabase
          .from("signal_opportunities")
          .select("id, is_calculable")
          .eq("user_id", this.userId)
          .eq("signal_name", signalDef.signalName)
          .maybeSingle()

        if (existingOpp && !existingOpp.is_calculable) {
          unlockedSignals.push(opportunity)
        } else if (!existingOpp) {
          newOpportunities.push(opportunity)
        }
      } else if (confidenceScore > 0) {
        stillMissing.push({ signal: signalDef.signalName, missingFields: missing })

        if (confidenceScore >= 0.5) {
          recommendations.push(
            `Upload data with "${missing.join(", ")}" to unlock ${signalDef.signalName}`
          )
        }
      }

      // Upsert opportunity to database
      await supabase
        .from("signal_opportunities")
        .upsert({
          user_id: this.userId,
          organization_id: this.organizationId,
          signal_name: signalDef.signalName,
          signal_category: signalDef.category,
          discovery_type: discoveryType,
          required_fields: requiredFieldNames,
          available_fields: availableForSignal,
          missing_fields: missing,
          source_uploads: opportunity.sourceUploads,
          is_calculable: isCalculable,
          confidence_score: confidenceScore,
          status: "discovered",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,signal_name",
        })
    }

    return {
      newOpportunities,
      unlockedSignals,
      stillMissing: stillMissing.slice(0, 10),
      recommendations: recommendations.slice(0, 5),
    }
  }

  // ----------------------------------------
  // GET AVAILABLE FIELDS
  // ----------------------------------------
  async getAvailableFields(): Promise<Map<string, { uploadIds: string[]; type: string; count: number }>> {
    const supabase = createAdminClient()

    const { data: fields } = await supabase
      .from("field_availability")
      .select("normalized_field_name, upload_ids, field_type, total_data_points")
      .eq("user_id", this.userId)

    const fieldMap = new Map()
    for (const f of (fields || [])) {
      fieldMap.set(f.normalized_field_name, {
        uploadIds: f.upload_ids || [],
        type: f.field_type,
        count: f.total_data_points,
      })
    }
    return fieldMap
  }

  // ----------------------------------------
  // GET STAGED UPLOADS
  // ----------------------------------------
  async getStagedUploads(): Promise<StagedUpload[]> {
    const supabase = createAdminClient()

    const { data: uploads } = await supabase
      .from("staged_uploads")
      .select("*")
      .eq("user_id", this.userId)
      .order("uploaded_at", { ascending: false })

    return (uploads || []).map((u: any) => ({
      id: u.id,
      userId: u.user_id,
      organizationId: u.organization_id,
      fileName: u.file_name,
      fileType: u.file_type,
      sourceType: u.source_type,
      rowCount: u.row_count,
      columnCount: u.column_count,
      uploadedAt: u.uploaded_at,
      processedAt: u.processed_at,
      status: u.status,
      metadata: u.metadata || {},
    }))
  }

  // ----------------------------------------
  // GET SIGNAL OPPORTUNITIES
  // ----------------------------------------
  async getSignalOpportunities(calculableOnly = false): Promise<SignalOpportunity[]> {
    const supabase = createAdminClient()

    let query = supabase
      .from("signal_opportunities")
      .select("*")
      .eq("user_id", this.userId)

    if (calculableOnly) {
      query = query.eq("is_calculable", true).order("confidence_score", { ascending: false })
    } else {
      query = query.order("is_calculable", { ascending: false }).order("confidence_score", { ascending: false })
    }

    const { data: opportunities } = await query

    return (opportunities || []).map((o: any) => ({
      id: o.id,
      signalName: o.signal_name,
      signalCategory: o.signal_category,
      discoveryType: o.discovery_type,
      requiredFields: o.required_fields || [],
      availableFields: o.available_fields || [],
      missingFields: o.missing_fields || [],
      sourceUploads: o.source_uploads || [],
      isCalculable: o.is_calculable,
      confidenceScore: o.confidence_score,
      status: o.status,
    }))
  }

  // ----------------------------------------
  // GET UNLOCKABLE SIGNALS
  // ----------------------------------------
  async getUnlockableSignals(): Promise<{ signal: string; missingFields: string[]; percentComplete: number }[]> {
    const supabase = createAdminClient()

    const { data: opportunities } = await supabase
      .from("signal_opportunities")
      .select("signal_name, missing_fields, confidence_score")
      .eq("user_id", this.userId)
      .eq("is_calculable", false)
      .gt("confidence_score", 0)
      .order("confidence_score", { ascending: false })
      .limit(20)

    return (opportunities || []).map((o: any) => ({
      signal: o.signal_name,
      missingFields: o.missing_fields || [],
      percentComplete: Math.round((o.confidence_score || 0) * 100),
    }))
  }

  // ----------------------------------------
  // MARK UPLOAD AS PROCESSED
  // ----------------------------------------
  async markUploadProcessed(uploadId: string): Promise<void> {
    const supabase = createAdminClient()

    await supabase
      .from("staged_uploads")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", uploadId)
  }

  // ----------------------------------------
  // DELETE STAGED UPLOAD
  // ----------------------------------------
  async deleteStagedUpload(uploadId: string): Promise<void> {
    const supabase = createAdminClient()

    // Cascade will handle fields and data points
    await supabase.from("staged_uploads").delete().eq("id", uploadId)

    // Rebuild field availability index
    await this.rebuildFieldAvailability()
  }

  // ----------------------------------------
  // REBUILD FIELD AVAILABILITY
  // ----------------------------------------
  private async rebuildFieldAvailability(): Promise<void> {
    const supabase = createAdminClient()

    // Clear existing
    await supabase.from("field_availability").delete().eq("user_id", this.userId)

    // Get all staged fields with their upload info
    const { data: uploads } = await supabase
      .from("staged_uploads")
      .select("id")
      .eq("user_id", this.userId)

    if (!uploads || uploads.length === 0) return

    const uploadIds = uploads.map((u: any) => u.id)

    const { data: fields } = await supabase
      .from("staged_fields")
      .select("normalized_field_name, field_type, upload_id, id")
      .in("upload_id", uploadIds)

    const fieldMap = new Map<string, { uploadIds: string[]; type: string; count: number }>()

    for (const f of (fields || [])) {
      const existing = fieldMap.get(f.normalized_field_name) || { uploadIds: [], type: f.field_type, count: 0 }
      if (!existing.uploadIds.includes(f.upload_id)) {
        existing.uploadIds.push(f.upload_id)
      }
      fieldMap.set(f.normalized_field_name, existing)
    }

    for (const [fieldName, info] of fieldMap) {
      await supabase
        .from("field_availability")
        .insert({
          user_id: this.userId,
          organization_id: this.organizationId,
          normalized_field_name: fieldName,
          upload_ids: info.uploadIds,
          total_data_points: info.count,
          field_type: info.type,
          latest_upload_at: new Date().toISOString(),
        })
    }
  }
}

// ============================================
// HELPER EXPORTS
// ============================================

export async function createStagingService(userId: string, organizationId?: string | null): Promise<StagingService> {
  return new StagingService(userId, organizationId || null)
}
