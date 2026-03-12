import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getColumnMappingTemplates } from "@/lib/column-mapping-service"

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
