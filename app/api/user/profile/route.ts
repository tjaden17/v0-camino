/**
 * GET /api/user/profile – load profile from Supabase (source of truth for KPIs, role, etc.).
 * PATCH /api/user/profile – upsert profile in Supabase so save works even if no row yet.
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
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("id, email, full_name, role, organization_id, kpi_1, kpi_2, kpi_3, updated_at")
      .eq("id", user.id)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[api/user/profile] GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { kpi_1, kpi_2, kpi_3, full_name, role } = body as {
      kpi_1?: string | null
      kpi_2?: string | null
      kpi_3?: string | null
      full_name?: string | null
      role?: string | null
    }

    const insFullName = full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null
    const insRole = role ?? null

    const adminClient = createAdminClient()
    // Upsert so we create a row if user has none (e.g. no onboarding), and always persist KPIs
    const { error } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          full_name: insFullName,
          role: insRole,
          kpi_1: kpi_1 ?? null,
          kpi_2: kpi_2 ?? null,
          kpi_3: kpi_3 ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/user/profile] PATCH error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    )
  }
}
