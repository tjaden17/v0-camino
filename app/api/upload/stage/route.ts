// Stage upload API - Stages file data and discovers cross-source signal opportunities

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"
import { parseCSV } from "@/lib/csv-parser"
import { createStagingService, type CrossSourceDiscoveryResult } from "@/lib/staging-service"
import { detectSourceType } from "@/lib/signal-discovery-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get organization ID from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const organizationId = profile?.organization_id || null

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceType = formData.get("sourceType") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Parse file
    const buffer = await file.arrayBuffer()
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
    
    let rows: Record<string, unknown>[] = []
    let columns: string[] = []

    if (isExcel) {
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
      if (rows.length > 0) {
        columns = Object.keys(rows[0])
      }
    } else {
      const text = new TextDecoder().decode(buffer)
      const parsed = parseCSV(text)
      rows = parsed.rows
      columns = parsed.headers
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "File contains no data" }, { status: 400 })
    }

    // Detect source type from file name if not provided
    const detectedSourceType = sourceType || detectSourceType(file.name, columns)

    // Create staging service and stage the upload
    const stagingService = await createStagingService(user.id, organizationId)
    
    const { uploadId, fields } = await stagingService.stageUpload(
      file.name,
      isExcel ? "xlsx" : "csv",
      detectedSourceType,
      rows,
      columns
    )

    // Discover cross-source signal opportunities
    const discoveryResult: CrossSourceDiscoveryResult = await stagingService.discoverCrossSourceSignals()

    // Get all signal opportunities
    const allOpportunities = await stagingService.getSignalOpportunities()
    const calculableOpportunities = allOpportunities.filter(o => o.isCalculable)
    const partialOpportunities = allOpportunities.filter(o => !o.isCalculable && o.confidenceScore > 0)

    // Get unlockable signals (what would this upload help unlock?)
    const unlockableSignals = await stagingService.getUnlockableSignals()

    return NextResponse.json({
      success: true,
      uploadId,
      fileName: file.name,
      sourceType: detectedSourceType,
      rowCount: rows.length,
      columnCount: columns.length,
      stagedFields: fields.map(f => ({
        originalName: f.originalColumnName,
        normalizedName: f.normalizedFieldName,
        type: f.fieldType,
        sampleValues: f.sampleValues,
      })),
      discovery: {
        newOpportunities: discoveryResult.newOpportunities.length,
        unlockedSignals: discoveryResult.unlockedSignals,
        recommendations: discoveryResult.recommendations,
      },
      signals: {
        calculable: calculableOpportunities.map(o => ({
          name: o.signalName,
          category: o.signalCategory,
          type: o.discoveryType,
          sources: o.sourceUploads,
          confidence: o.confidenceScore,
        })),
        partial: partialOpportunities.slice(0, 10).map(o => ({
          name: o.signalName,
          category: o.signalCategory,
          percentComplete: Math.round(o.confidenceScore * 100),
          missingFields: o.missingFields,
        })),
        unlockable: unlockableSignals.slice(0, 5),
      },
    })

  } catch (error) {
    console.error("Staging error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Staging failed" },
      { status: 500 }
    )
  }
}

// GET - Get current staged uploads and opportunities
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const stagingService = await createStagingService(user.id, profile?.organization_id)

    const uploads = await stagingService.getStagedUploads()
    const opportunities = await stagingService.getSignalOpportunities()
    const unlockable = await stagingService.getUnlockableSignals()

    return NextResponse.json({
      uploads: uploads.map(u => ({
        id: u.id,
        fileName: u.fileName,
        sourceType: u.sourceType,
        rowCount: u.rowCount,
        columnCount: u.columnCount,
        status: u.status,
        uploadedAt: u.uploadedAt,
      })),
      signals: {
        calculable: opportunities.filter(o => o.isCalculable),
        partial: opportunities.filter(o => !o.isCalculable && o.confidenceScore > 0),
      },
      unlockable,
    })

  } catch (error) {
    console.error("Get staging error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get staging data" },
      { status: 500 }
    )
  }
}
