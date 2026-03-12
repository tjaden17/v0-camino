/**
 * GET /api/admin/organizations/[id]/details – load org, members, uploads, signals, availableUsers.
 * Used by the org details page.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: orgId } = await params
    if (!orgId) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch organization
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("id, name, created_at, updated_at")
      .eq("id", orgId)
      .maybeSingle()

    if (orgError) {
      throw orgError
    }
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Members = profiles in this org
    const { data: memberRows, error: membersError } = await admin
      .from("profiles")
      .select("*")
      .eq("organization_id", orgId)

    if (membersError) {
      throw membersError
    }

    const members = (memberRows ?? []).map((p) => ({
      id: p.id,
      user_id: p.id,
      organization_id: orgId,
      role: p.role ?? "read-only",
      user_profile: {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role,
        organization_id: p.organization_id,
        industry: p.industry,
        business_context: p.business_context,
        company_stage: p.company_stage,
        team_size: p.team_size,
        market: p.market,
        competitors: p.competitors,
        business_model: p.business_model,
        kpi_1: p.kpi_1,
        kpi_2: p.kpi_2,
        kpi_3: p.kpi_3,
      },
    }))

    // Available users = profiles not in this org
    const { data: availableUsers, error: availableUsersError } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .neq("organization_id", orgId)

    if (availableUsersError) {
      throw availableUsersError
    }

    // Uploads
    const { data: uploadRows, error: uploadsError } = await admin
      .from("upload_history")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })

    if (uploadsError) {
      throw uploadsError
    }

    const uploads = (uploadRows ?? []).map((u) => ({
      ...u,
      user_email: null,
    }))

    // Signals with data point count and latest value
    const { data: signalRows, error: signalsError } = await admin
      .from("signals")
      .select("*")
      .eq("organization_id", orgId)
      .order("updated_at", { ascending: false })

    if (signalsError) {
      throw signalsError
    }

    let signals: Array<Record<string, unknown>> = []
    if (signalRows && signalRows.length > 0) {
      signals = await Promise.all(
        signalRows.map(async (s) => {
          let data_points_count = 0
          let latest_value: unknown = null
          let latest_date: unknown = null

          try {
            const { count } = await admin
              .from("signal_data_points")
              .select("*", { count: "exact", head: true })
              .eq("signal_id", s.id)

            data_points_count = count ?? 0

            const { data: latest } = await admin
              .from("signal_data_points")
              .select("value, date")
              .eq("signal_id", s.id)
              .order("date", { ascending: false })
              .limit(1)
              .maybeSingle()

            if (latest) {
              latest_value = latest.value
              latest_date = latest.date
            }
          } catch {
            // ignore
          }

          return {
            ...s,
            owner_email: null,
            data_points_count,
            latest_value,
            latest_date,
          }
        })
      )
    }

    return NextResponse.json({
      org,
      members,
      availableUsers: availableUsers ?? [],
      uploads,
      signals,
    })
  } catch (error) {
    console.error("[api/admin/organizations/[id]/details] GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load organization details" },
      { status: 500 }
    )
  }
}
