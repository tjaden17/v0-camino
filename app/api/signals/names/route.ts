/**
 * GET /api/signals/names – returns signal names (and categories) for the current user's org.
 * Used on Profile so users can see "what the data has" when choosing KPIs.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) throw profileError

    const organizationId = profileData?.organization_id ?? null

    if (!organizationId) {
      return NextResponse.json({ names: [], categories: [] })
    }

    const { data: rows, error: signalsError } = await adminClient
      .from("signals")
      .select("name, category")
      .eq("organization_id", organizationId)
      .not("name", "is", null)
      .neq("name", "")
      .order("name")

    if (signalsError) throw signalsError

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
