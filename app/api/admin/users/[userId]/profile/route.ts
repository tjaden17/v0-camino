/**
 * PATCH /api/admin/users/[userId]/profile
 * Update a user's profile in Neon (admin). Used when editing a member from org details.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params
    if (!userId) {
      return NextResponse.json({ error: "User id required" }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const full_name = body.full_name !== undefined ? (body.full_name === "" ? null : String(body.full_name)) : undefined
    const role = body.role !== undefined ? (body.role === "" ? null : String(body.role)) : undefined
    const industry = body.industry !== undefined ? (body.industry === "" ? null : String(body.industry)) : undefined
    const business_context =
      body.business_context !== undefined ? (body.business_context === "" ? null : String(body.business_context)) : undefined
    const company_stage =
      body.company_stage !== undefined ? (body.company_stage === "" ? null : String(body.company_stage)) : undefined
    const team_size = body.team_size !== undefined ? (body.team_size === "" ? null : String(body.team_size)) : undefined
    const market = body.market !== undefined ? (body.market === "" ? null : String(body.market)) : undefined
    const competitors =
      body.competitors !== undefined ? (body.competitors === "" ? null : String(body.competitors)) : undefined
    const business_model =
      body.business_model !== undefined ? (body.business_model === "" ? null : String(body.business_model)) : undefined
    const kpi_1 = body.kpi_1 !== undefined ? (body.kpi_1 === "" ? null : String(body.kpi_1)) : undefined
    const kpi_2 = body.kpi_2 !== undefined ? (body.kpi_2 === "" ? null : String(body.kpi_2)) : undefined
    const kpi_3 = body.kpi_3 !== undefined ? (body.kpi_3 === "" ? null : String(body.kpi_3)) : undefined

    await sql`
      UPDATE profiles
      SET
        full_name = COALESCE(${full_name ?? null}, full_name),
        role = COALESCE(${role ?? null}, role),
        industry = COALESCE(${industry ?? null}, industry),
        business_context = COALESCE(${business_context ?? null}, business_context),
        company_stage = COALESCE(${company_stage ?? null}, company_stage),
        team_size = COALESCE(${team_size ?? null}, team_size),
        market = COALESCE(${market ?? null}, market),
        competitors = COALESCE(${competitors ?? null}, competitors),
        business_model = COALESCE(${business_model ?? null}, business_model),
        kpi_1 = COALESCE(${kpi_1 ?? null}, kpi_1),
        kpi_2 = COALESCE(${kpi_2 ?? null}, kpi_2),
        kpi_3 = COALESCE(${kpi_3 ?? null}, kpi_3),
        updated_at = NOW()
      WHERE id = ${userId}::uuid
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/admin/users/.../profile] PATCH error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    )
  }
}
