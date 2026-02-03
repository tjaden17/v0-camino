import { type NextRequest, NextResponse } from "next/server"
import type { ColumnMapping } from "@/lib/csv-parser"
import { processRowsBatch } from "@/lib/upload-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rows, mappings, batchNumber, totalBatches, organizationId } = await request.json()

    console.log(
      `[v0] Processing batch ${batchNumber}/${totalBatches} with ${rows.length} rows for org:`,
      organizationId || "none",
    )

    const result = await processRowsBatch(rows, mappings as ColumnMapping[], user.id, organizationId)

    console.log(`[v0] Batch ${batchNumber}/${totalBatches} complete:`, result)

    return NextResponse.json({
      success: true,
      batchNumber,
      totalBatches,
      ...result,
    })
  } catch (error) {
    console.error("[v0] Batch processing error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Batch processing failed",
      },
      { status: 500 },
    )
  }
}
