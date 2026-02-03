import { NextResponse } from "next/server"
import { processAndSaveSignals, logUpload } from "@/lib/upload-service"
import type { ColumnMapping, ParsedCSVRow } from "@/lib/csv-parser"

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  try {
    const { rows, mappings, userId, organizationId } = await request.json() as {
      rows: ParsedCSVRow[]
      mappings: ColumnMapping[]
      userId: string
      organizationId?: string
    }

    if (!rows || !mappings || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: rows, mappings, userId" },
        { status: 400 }
      )
    }

    console.log("[v0] Test upload: Processing", rows.length, "rows for user", userId)

    const result = await processAndSaveSignals(rows, mappings, userId, organizationId)

    // Log the upload
    await logUpload(userId, "test-upload.csv", result, organizationId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Test upload error:", error)
    return NextResponse.json(
      { 
        success: false,
        signalsCreated: 0,
        signalsUpdated: 0,
        dataPointsAdded: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"]
      },
      { status: 500 }
    )
  }
}
