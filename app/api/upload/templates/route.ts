import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import { getColumnMappingTemplates, saveColumnMappingTemplate } from "@/lib/column-mapping-service"

/**
 * GET /api/upload/templates
 * Returns pre-built column mapping templates for the upload flow.
 * Optional query: organizationId (for org-specific overrides).
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId") ?? undefined

    const templates = await getColumnMappingTemplates(organizationId)

    return NextResponse.json({ success: true, templates })
  } catch (err) {
    console.error("[v0] GET /api/upload/templates error:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/upload/templates
 * Save current tab mapping as an org-scoped template for reuse.
 * Body: { displayName, rowType, metricColumn, dateColumn, customRowLabel?, groupByColumns?, columns, organizationId? }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      displayName,
      rowType,
      metricColumn,
      dateColumn,
      customRowLabel,
      groupByColumns,
      columns,
      organizationId: bodyOrgId,
    } = body as {
      displayName: string
      rowType: string
      metricColumn: string | null
      dateColumn: string | null
      customRowLabel?: string | null
      groupByColumns?: string[]
      columns: string[]
      organizationId?: string | null
    }

    if (!displayName || typeof displayName !== "string" || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { success: false, error: "displayName and columns (array) are required" },
        { status: 400 }
      )
    }

    let organizationId = bodyOrgId ?? null
    if (organizationId == null || organizationId === "") {
      const profileRows = await sql`SELECT organization_id FROM profiles WHERE id = ${user.id} LIMIT 1`
      organizationId = (profileRows as { organization_id: string | null }[])[0]?.organization_id ?? null
    }
    if (organizationId == null || organizationId === "") {
      return NextResponse.json(
        { success: false, error: "Organization required to save template" },
        { status: 400 }
      )
    }

    const fieldMappings: Record<string, string | string[] | undefined> = {
      metric: metricColumn ?? undefined,
      date: dateColumn ?? undefined,
      columns,
    }
    if (customRowLabel != null && String(customRowLabel).trim()) {
      fieldMappings.custom_row_label = String(customRowLabel).trim()
    }
    if (Array.isArray(groupByColumns) && groupByColumns.length > 0) {
      fieldMappings.group_by_columns = groupByColumns
    }

    const template = await saveColumnMappingTemplate(
      organizationId,
      displayName.trim(),
      rowType === "other" ? "other" : rowType,
      fieldMappings
    )

    return NextResponse.json({ success: true, template })
  } catch (err) {
    console.error("[v0] POST /api/upload/templates error:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
