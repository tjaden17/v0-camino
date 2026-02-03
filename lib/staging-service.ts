// Staging Service - Manages data staging and cross-source signal discovery
// Holds raw data temporarily, analyzes across all sources to find combinable signals

import { sql } from "@/lib/db/neon"
import {
  SIGNAL_DEFINITIONS,
  type SignalRequirement,
  type DetectedColumn,
  type DiscoveredSignal,
  normalizeFieldName,
  detectColumnType,
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
    // 1. Create staged upload record
    const uploadResult = await sql`
      INSERT INTO staged_uploads (user_id, organization_id, file_name, file_type, source_type, row_count, column_count, status)
      VALUES (${this.userId}, ${this.organizationId}, ${fileName}, ${fileType}, ${sourceType}, ${rows.length}, ${columns.length}, 'staged')
      RETURNING id
    `
    const uploadId = uploadResult[0].id

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
      const fieldResult = await sql`
        INSERT INTO staged_fields (upload_id, original_column_name, normalized_field_name, field_type, sample_values, stats)
        VALUES (${uploadId}, ${col.name}, ${normalizedName}, ${col.inferredType}, ${JSON.stringify(sampleValues)}, ${JSON.stringify(stats)})
        RETURNING id
      `

      stagedFields.push({
        id: fieldResult[0].id,
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
    // Check if field already exists
    const existing = await sql`
      SELECT id, upload_ids, total_data_points 
      FROM field_availability 
      WHERE user_id = ${this.userId} AND normalized_field_name = ${fieldName}
    `

    if (existing.length > 0) {
      const currentUploads = existing[0].upload_ids || []
      if (!currentUploads.includes(uploadId)) {
        currentUploads.push(uploadId)
      }
      const totalPoints = (existing[0].total_data_points || 0) + dataPoints

      await sql`
        UPDATE field_availability 
        SET upload_ids = ${JSON.stringify(currentUploads)}, 
            total_data_points = ${totalPoints},
            latest_upload_at = NOW()
        WHERE id = ${existing[0].id}
      `
    } else {
      await sql`
        INSERT INTO field_availability (user_id, organization_id, normalized_field_name, upload_ids, total_data_points, field_type, latest_upload_at)
        VALUES (${this.userId}, ${this.organizationId}, ${fieldName}, ${JSON.stringify([uploadId])}, ${dataPoints}, ${fieldType}, NOW())
      `
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
    // Batch insert data points (limit to first 1000 rows for performance)
    const maxRows = Math.min(rows.length, 1000)
    
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

        await sql`
          INSERT INTO staged_data_points (upload_id, field_id, row_index, value, numeric_value, date_value)
          VALUES (${uploadId}, ${field.id}, ${rowIndex}, ${stringValue}, ${numericValue}, ${dateValue})
        `
      }
    }
  }

  // ----------------------------------------
  // DISCOVER CROSS-SOURCE SIGNALS
  // ----------------------------------------
  async discoverCrossSourceSignals(): Promise<CrossSourceDiscoveryResult> {
    // 1. Get all available fields across all uploads
    const availableFields = await sql`
      SELECT normalized_field_name, upload_ids, field_type, total_data_points
      FROM field_availability
      WHERE user_id = ${this.userId}
    `

    const fieldMap = new Map<string, { uploadIds: string[]; type: string; count: number }>()
    for (const f of availableFields) {
      fieldMap.set(f.normalized_field_name, {
        uploadIds: f.upload_ids || [],
        type: f.field_type,
        count: f.total_data_points,
      })
    }

    // 2. Get upload names for reference
    const uploads = await sql`
      SELECT id, file_name FROM staged_uploads WHERE user_id = ${this.userId}
    `
    const uploadNames = new Map<string, string>()
    for (const u of uploads) {
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
          // Field is available - track which upload(s) have it
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

      // Determine discovery type
      let discoveryType: "single_source" | "cross_source" | "derived" = "single_source"
      if (isCrossSource) {
        discoveryType = "cross_source"
      } else if (signalDef.calculationType === "calculated") {
        discoveryType = "derived"
      }

      // Calculate confidence score
      const confidenceScore = availableForSignal.length / requiredFieldNames.length

      // Create opportunity
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
        // Check if this was previously partial (now unlocked)
        const existingOpp = await sql`
          SELECT id, is_calculable FROM signal_opportunities 
          WHERE user_id = ${this.userId} AND signal_name = ${signalDef.signalName}
        `
        
        if (existingOpp.length > 0 && !existingOpp[0].is_calculable) {
          unlockedSignals.push(opportunity)
        } else if (existingOpp.length === 0) {
          newOpportunities.push(opportunity)
        }
      } else if (confidenceScore > 0) {
        stillMissing.push({ signal: signalDef.signalName, missingFields: missing })
        
        // Generate recommendations
        if (confidenceScore >= 0.5) {
          recommendations.push(
            `Upload data with "${missing.join(", ")}" to unlock ${signalDef.signalName}`
          )
        }
      }

      // Upsert opportunity to database
      await sql`
        INSERT INTO signal_opportunities (
          user_id, organization_id, signal_name, signal_category, discovery_type,
          required_fields, available_fields, missing_fields, source_uploads,
          is_calculable, confidence_score, status
        )
        VALUES (
          ${this.userId}, ${this.organizationId}, ${signalDef.signalName}, ${signalDef.category},
          ${discoveryType}, ${JSON.stringify(requiredFieldNames)}, ${JSON.stringify(availableForSignal)},
          ${JSON.stringify(missing)}, ${JSON.stringify(opportunity.sourceUploads)},
          ${isCalculable}, ${confidenceScore}, 'discovered'
        )
        ON CONFLICT (user_id, normalized_field_name) DO UPDATE SET
          available_fields = ${JSON.stringify(availableForSignal)},
          missing_fields = ${JSON.stringify(missing)},
          source_uploads = ${JSON.stringify(opportunity.sourceUploads)},
          is_calculable = ${isCalculable},
          confidence_score = ${confidenceScore},
          updated_at = NOW()
      `
    }

    return {
      newOpportunities,
      unlockedSignals,
      stillMissing: stillMissing.slice(0, 10), // Top 10
      recommendations: recommendations.slice(0, 5), // Top 5
    }
  }

  // ----------------------------------------
  // GET AVAILABLE FIELDS
  // ----------------------------------------
  async getAvailableFields(): Promise<Map<string, { uploadIds: string[]; type: string; count: number }>> {
    const fields = await sql`
      SELECT normalized_field_name, upload_ids, field_type, total_data_points
      FROM field_availability
      WHERE user_id = ${this.userId}
    `

    const fieldMap = new Map()
    for (const f of fields) {
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
    const uploads = await sql`
      SELECT * FROM staged_uploads 
      WHERE user_id = ${this.userId}
      ORDER BY uploaded_at DESC
    `
    return uploads.map(u => ({
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
    const opportunities = calculableOnly
      ? await sql`
          SELECT * FROM signal_opportunities 
          WHERE user_id = ${this.userId} AND is_calculable = true
          ORDER BY confidence_score DESC
        `
      : await sql`
          SELECT * FROM signal_opportunities 
          WHERE user_id = ${this.userId}
          ORDER BY is_calculable DESC, confidence_score DESC
        `

    return opportunities.map(o => ({
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
    const opportunities = await sql`
      SELECT signal_name, missing_fields, confidence_score
      FROM signal_opportunities 
      WHERE user_id = ${this.userId} AND is_calculable = false AND confidence_score > 0
      ORDER BY confidence_score DESC
      LIMIT 20
    `

    return opportunities.map(o => ({
      signal: o.signal_name,
      missingFields: o.missing_fields || [],
      percentComplete: Math.round((o.confidence_score || 0) * 100),
    }))
  }

  // ----------------------------------------
  // MARK UPLOAD AS PROCESSED
  // ----------------------------------------
  async markUploadProcessed(uploadId: string): Promise<void> {
    await sql`
      UPDATE staged_uploads 
      SET status = 'processed', processed_at = NOW()
      WHERE id = ${uploadId}
    `
  }

  // ----------------------------------------
  // DELETE STAGED UPLOAD
  // ----------------------------------------
  async deleteStagedUpload(uploadId: string): Promise<void> {
    // Cascade will handle fields and data points
    await sql`DELETE FROM staged_uploads WHERE id = ${uploadId}`
    
    // Rebuild field availability index
    await this.rebuildFieldAvailability()
  }

  // ----------------------------------------
  // REBUILD FIELD AVAILABILITY
  // ----------------------------------------
  private async rebuildFieldAvailability(): Promise<void> {
    // Clear and rebuild from staged fields
    await sql`DELETE FROM field_availability WHERE user_id = ${this.userId}`

    const fields = await sql`
      SELECT sf.normalized_field_name, sf.field_type, sf.upload_id,
             (SELECT COUNT(*) FROM staged_data_points WHERE field_id = sf.id) as data_points
      FROM staged_fields sf
      JOIN staged_uploads su ON sf.upload_id = su.id
      WHERE su.user_id = ${this.userId}
    `

    const fieldMap = new Map<string, { uploadIds: string[]; type: string; count: number }>()
    
    for (const f of fields) {
      const existing = fieldMap.get(f.normalized_field_name) || { uploadIds: [], type: f.field_type, count: 0 }
      if (!existing.uploadIds.includes(f.upload_id)) {
        existing.uploadIds.push(f.upload_id)
      }
      existing.count += f.data_points || 0
      fieldMap.set(f.normalized_field_name, existing)
    }

    for (const [fieldName, info] of fieldMap) {
      await sql`
        INSERT INTO field_availability (user_id, organization_id, normalized_field_name, upload_ids, total_data_points, field_type, latest_upload_at)
        VALUES (${this.userId}, ${this.organizationId}, ${fieldName}, ${JSON.stringify(info.uploadIds)}, ${info.count}, ${info.type}, NOW())
      `
    }
  }
}

// ============================================
// HELPER EXPORTS
// ============================================

export async function createStagingService(userId: string, organizationId?: string | null): Promise<StagingService> {
  return new StagingService(userId, organizationId || null)
}
