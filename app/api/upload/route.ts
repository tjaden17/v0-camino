import { type NextRequest, NextResponse } from "next/server"
import { parseCSV, autoSuggestMapping, validateMappedData, type ColumnMapping } from "@/lib/csv-parser"
import { processAndSaveSignals, logUpload } from "@/lib/upload-service"
import { processDualPathUpload } from "@/lib/dual-path-storage-service"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// Parse XLSX file to CSV-like format
function parseXLSX(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, string>[]; errors: string[] } {
  try {
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" })
    
    if (jsonData.length === 0) {
      return { headers: [], rows: [], errors: ["Excel file is empty or has no data rows"] }
    }
    
    // Extract headers from first row keys
    const headers = Object.keys(jsonData[0])
    
    // Convert all values to strings
    const rows = jsonData.map(row => {
      const stringRow: Record<string, string> = {}
      for (const key of headers) {
        stringRow[key] = row[key]?.toString() || ""
      }
      return stringRow
    })
    
    return { headers, rows, errors: [] }
  } catch (error) {
    return { headers: [], rows: [], errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`] }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const mappingsJson = formData.get("mappings") as string
    const organizationId = formData.get("organizationId") as string | null
    const useDualPath = formData.get("useDualPath") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Determine file type and parse accordingly
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
    
    let parseResult: { headers: string[]; rows: Record<string, string>[]; errors: string[] }
    let text: string | undefined
    
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      parseResult = parseXLSX(buffer)
    } else {
      text = await file.text()
      parseResult = parseCSV(text)
    }

    if (parseResult.errors.length > 0) {
      console.error("[v0] Upload API: CSV parse errors:", parseResult.errors)
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.errors,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Upload API: CSV parsed successfully, rows:", parseResult.rows.length)

    if (mappingsJson) {
      const mappings: ColumnMapping[] = JSON.parse(mappingsJson)

      console.log("[v0] Upload API: Validating mappings")

      const validation = validateMappedData(parseResult.rows, mappings)

      if (!validation.isValid) {
        console.error("[v0] Upload API: Validation failed:", validation.errors)
        return NextResponse.json(
          {
            success: false,
            errors: validation.errors,
            warnings: validation.warnings,
          },
          { status: 400 },
        )
      }

      console.log("[v0] Upload API: Processing and saving signals")

      const BATCH_THRESHOLD = 100
      const useBatchMode = parseResult.rows.length > BATCH_THRESHOLD

      if (useBatchMode) {
        return NextResponse.json({
          success: true,
          batchMode: true,
          totalRows: parseResult.rows.length,
          rows: parseResult.rows,
          message: `Dataset is large (${parseResult.rows.length} rows). Please process in batches.`,
        })
      }

      if (useDualPath && organizationId) {
        console.log("[v0] Upload API: Using dual-path storage")

        const dualPathResult = await processDualPathUpload(parseResult.rows, mappings, user.id, organizationId, {
          fileName: file.name,
          sourceType: "csv",
          uploadName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        })

        console.log("[v0] Upload API: Dual-path processing complete:", dualPathResult)

        return NextResponse.json({
          success: dualPathResult.success,
          dualPath: true,
          uploadId: dualPathResult.uploadId,
          signalsCreated: dualPathResult.signalsCreated,
          signalsUpdated: dualPathResult.signalsUpdated,
          dataPointsAdded: dualPathResult.dataPointsAdded,
          rawRowsStored: dualPathResult.rawRowsStored,
          columnsPreserved: dualPathResult.columnsPreserved,
          errors: dualPathResult.errors,
          warnings: [...validation.warnings, ...dualPathResult.warnings],
        })
      }

      const result = await processAndSaveSignals(parseResult.rows, mappings, user.id, organizationId || undefined)

      console.log("[v0] Upload API: Processing complete:", result)

      await logUpload(user.id, file.name, result, organizationId || undefined)

      return NextResponse.json({
        success: result.success,
        signalsCreated: result.signalsCreated,
        signalsUpdated: result.signalsUpdated,
        dataPointsAdded: result.dataPointsAdded,
        errors: result.errors,
        warnings: validation.warnings,
      })
    }

    const suggestedMappings = autoSuggestMapping(parseResult.headers)

    return NextResponse.json({
      success: true,
      preview: {
        headers: parseResult.headers,
        sampleRows: parseResult.rows.slice(0, 5),
        totalRows: parseResult.rows.length,
        suggestedMappings,
        csvText: text,
        rows: parseResult.rows,
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
