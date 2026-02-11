/**
 * GET /api/signals/names – returns signal names (and categories) for the current user's org.
 * Used on Profile so users can see "what the data has" when choosing KPIs.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileRows = await sql`
      SELECT organization_id FROM profiles WHERE id = ${user.id} LIMIT 1
    `
    const organizationId = profileRows?.[0]?.organization_id ?? null

    if (!organizationId) {
      return NextResponse.json({ names: [], categories: [] })
    }

    const rows = await sql`
      SELECT DISTINCT name, category
      FROM signals
      WHERE organization_id = ${organizationId}
        AND name IS NOT NULL
        AND name != ''
      ORDER BY name
    `

    const names = [...new Set((rows ?? []).map((r: { name: string }) => r.name))]
    const categories = [...new Set((rows ?? []).map((r: { category: string | null }) => r.category).filter(Boolean))] as string[]

    return NextResponse.json({ names, categories })
  } catch (error) {
    console.error("[api/signals/names] GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load signal names" },
      { status: 500 }
    )
  }
}
