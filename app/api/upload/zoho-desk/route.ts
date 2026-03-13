import { type NextRequest, NextResponse } from "next/server"
import { parseCSV, type ColumnMapping } from "@/lib/csv-parser"
import { createClient } from "@/lib/supabase/server"
import {
  parseZohoDeskTickets,
  generateSupportKPIs,
  autoSuggestZohoDeskMapping,
  type SupportKPI,
} from "@/lib/zoho-desk-processor"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Zoho Desk Upload API: Starting upload processing")

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Zoho Desk Upload API: User authenticated:", user.id)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const mappingsJson = formData.get("mappings") as string
    const organizationId = formData.get("organizationId") as string | null

    console.log("[v0] Zoho Desk Upload API: Organization ID:", organizationId || "none (personal)")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Zoho Desk Upload API: Processing file:", file.name)

    const text = await file.text()
    const parseResult = parseCSV(text)

    if (parseResult.errors.length > 0) {
      console.error("[v0] Zoho Desk Upload API: CSV parse errors:", parseResult.errors)
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.errors,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Zoho Desk Upload API: CSV parsed successfully, rows:", parseResult.rows.length)

    // If mappings provided, process the tickets
    if (mappingsJson) {
      const mappings: ColumnMapping[] = JSON.parse(mappingsJson)

      console.log("[v0] Zoho Desk Upload API: Processing support tickets")

      // Parse tickets from CSV
      const tickets = parseZohoDeskTickets(parseResult.rows, mappings)
      console.log("[v0] Parsed", tickets.length, "support tickets")

      // Generate KPIs from tickets
      const kpis = generateSupportKPIs(tickets)
      console.log("[v0] Generated", kpis.length, "customer support KPIs")

      // Save KPIs as signals
      const result = await saveKPIsAsSignals(kpis, user.id, organizationId || undefined)

      // Log the upload
      await logZohoDeskUpload(user.id, file.name, tickets.length, kpis.length, organizationId || undefined)

      return NextResponse.json({
        success: true,
        ticketsProcessed: tickets.length,
        kpisGenerated: kpis.length,
        signalsCreated: result.created,
        signalsUpdated: result.updated,
        kpis: kpis.map((k) => ({ name: k.name, value: k.value })),
      })
    }

    // No mappings - return preview with suggested mappings
    const suggestedMappings = autoSuggestZohoDeskMapping(parseResult.headers)

    return NextResponse.json({
      success: true,
      preview: {
        headers: parseResult.headers,
        sampleRows: parseResult.rows.slice(0, 5),
        totalRows: parseResult.rows.length,
        suggestedMappings,
        mode: "zoho-desk",
      },
    })
  } catch (error) {
    console.error("[v0] Zoho Desk Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

async function saveKPIsAsSignals(kpis: SupportKPI[], userId: string, organizationId?: string) {
  const adminSupabase = createAdminClient()
  let created = 0
  let updated = 0

  for (const kpi of kpis) {
    // Check if signal exists
    const query = adminSupabase.from("signals").select("id").eq("name", kpi.name)

    if (organizationId) {
      query.eq("organization_id", organizationId)
    } else {
      query.is("organization_id", null)
    }

    const { data: existing } = await query.maybeSingle()

    const signalData = {
      name: kpi.name,
      category: kpi.category,
      owner_id: userId,
      benchmark_value: kpi.benchmark || null,
      benchmark_type: kpi.benchmark ? "target" : null,
      trend: kpi.trend,
      created_by: userId,
      organization_id: organizationId || null,
      updated_at: new Date().toISOString(),
    }

    if (!existing) {
      // Create new signal
      const { data: newSignal, error } = await adminSupabase.from("signals").insert(signalData).select("id").single()

      if (error) {
        console.error("[v0] Error creating signal:", error)
        continue
      }

      // Add data point
      const numericValue = typeof kpi.value === "number" ? kpi.value : Number.parseFloat(String(kpi.value))
      await adminSupabase.from("data_points").insert({
        signal_id: newSignal.id,
        value: isNaN(numericValue) ? 0 : numericValue,
        date: new Date().toISOString().split("T")[0],
        created_by: userId,
        metadata: { original_value: String(kpi.value) },
      })

      created++
    } else {
      // Update existing signal
      await adminSupabase.from("signals").update(signalData).eq("id", existing.id)

      // Add new data point
      const numericValue = typeof kpi.value === "number" ? kpi.value : Number.parseFloat(String(kpi.value))
      await adminSupabase.from("data_points").insert({
        signal_id: existing.id,
        value: isNaN(numericValue) ? 0 : numericValue,
        date: new Date().toISOString().split("T")[0],
        created_by: userId,
        metadata: { original_value: String(kpi.value) },
      })

      updated++
    }
  }

  return { created, updated }
}

async function logZohoDeskUpload(
  userId: string,
  filename: string,
  ticketsCount: number,
  kpisCount: number,
  organizationId?: string,
) {
  const adminSupabase = createAdminClient()

  await adminSupabase.from("upload_history").insert({
    file_name: filename,
    uploaded_by: userId,
    signals_created: kpisCount,
    signals_updated: 0,
    data_points_added: kpisCount,
    status: "success",
    errors: null,
    organization_id: organizationId || null,
    metadata: {
      upload_type: "zoho-desk",
      tickets_processed: ticketsCount,
      kpis_generated: kpisCount,
    },
  })
}
