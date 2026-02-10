/**
 * GET /api/user/profile – load profile from Neon (source of truth for KPIs, role, etc.).
 * PATCH /api/user/profile – upsert profile in Neon so save works even if no row yet.
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

    const rows = await sql`
      SELECT id, email, full_name, role, organization_id, kpi_1, kpi_2, kpi_3, updated_at
      FROM profiles
      WHERE id = ${user.id}
      LIMIT 1
    `
    const profile = rows?.[0] ?? null
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
    // Upsert so we create a row if user has none (e.g. no onboarding), and always persist KPIs
    await sql`
      INSERT INTO profiles (id, email, full_name, role, kpi_1, kpi_2, kpi_3, created_at, updated_at)
      VALUES (
        ${user.id},
        ${user.email ?? null},
        ${insFullName},
        ${insRole},
        ${kpi_1 ?? null},
        ${kpi_2 ?? null},
        ${kpi_3 ?? null},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        kpi_1 = EXCLUDED.kpi_1,
        kpi_2 = EXCLUDED.kpi_2,
        kpi_3 = EXCLUDED.kpi_3,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/user/profile] PATCH error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    )
  }
}
