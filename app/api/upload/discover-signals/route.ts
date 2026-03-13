import { type NextRequest, NextResponse } from "next/server"
import { discoverSignals } from "@/lib/signal-discovery-service"

export async function POST(request: NextRequest) {
  try {
    const { rows, csvText, dataSourceName } = await request.json()

    console.log("[v0] Signal discovery API called with:", {
      hasRows: !!rows,
      hasCsvText: !!csvText,
      rowCount: rows?.length,
      dataSourceName,
    })

    let dataRows = rows

    // Support both formats: direct rows or csvText
    if (!dataRows && csvText) {
      const { parseCSV } = await import("@/lib/csv-parser")
      const parseResult = parseCSV(csvText)

      if (parseResult.errors.length > 0) {
        return NextResponse.json({ error: "CSV parsing failed", details: parseResult.errors }, { status: 400 })
      }

      dataRows = parseResult.rows
    }

    if (!dataRows || dataRows.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 })
    }

    console.log("[v0] Discovering signals from", dataRows.length, "rows")

    // Discover available signals
    const discoveryResult = await discoverSignals(dataRows, dataSourceName || "Uploaded Data")

    console.log("[v0] Discovery complete:", {
      availableSignals: discoveryResult.availableSignals.length,
      partialSignals: discoveryResult.partialSignals.length,
      detectedColumns: discoveryResult.detectedColumns.length,
    })

    return NextResponse.json(discoveryResult)
  } catch (error) {
    console.error("[v0] Signal discovery error:", error)
    return NextResponse.json(
      {
        error: "Failed to discover signals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
