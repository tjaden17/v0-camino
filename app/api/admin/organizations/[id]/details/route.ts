/**
 * GET /api/admin/organizations/[id]/details – load org, members, uploads, signals, availableUsers from Neon.
 * Used by the org details page so it doesn't rely on Supabase for app data.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import { computeTrendsFromMonthlyPoints } from "@/lib/signals-service"

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
    const orgIdNorm = String(orgId).trim().toLowerCase()

    // Compare as text so UUID format from URL always matches DB
    const orgRows = await sql`
      SELECT id, name, created_at, updated_at
      FROM organizations
      WHERE LOWER(TRIM(id::text)) = ${orgIdNorm}
      LIMIT 1
    `
    const org = orgRows?.[0] ?? null
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    const dbOrgId = (org as Record<string, unknown>).id

    // Members = profiles in this org. Select only columns that exist in Neon (industry etc. may be missing).
    const memberRows = await sql`
      SELECT id, email, full_name, role, organization_id, kpi_1, kpi_2, kpi_3
      FROM profiles
      WHERE organization_id = ${dbOrgId}
    `
    const members = (memberRows ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      user_id: p.id,
      organization_id: dbOrgId,
      role: p.role ?? "read-only",
      user_profile: {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role,
        organization_id: p.organization_id,
        industry: p.industry ?? null,
        business_context: p.business_context ?? null,
        company_stage: p.company_stage ?? null,
        team_size: p.team_size ?? null,
        market: p.market ?? null,
        competitors: p.competitors ?? null,
        business_model: p.business_model ?? null,
        kpi_1: p.kpi_1 ?? null,
        kpi_2: p.kpi_2 ?? null,
        kpi_3: p.kpi_3 ?? null,
      },
    }))

    // Available users = profiles not in this org
    const usersRows = await sql`
      SELECT id, email, full_name
      FROM profiles
      WHERE organization_id IS NULL OR organization_id != ${dbOrgId}
    `
    const availableUsers = usersRows ?? []

    // Uploads: Neon may use staged_uploads or upload_history; return [] if table missing
    let uploads: Array<Record<string, unknown>> = []
    try {
      const uploadRows = await sql`
        SELECT * FROM upload_history
        WHERE organization_id = ${dbOrgId}
        ORDER BY created_at DESC
      `
      if (Array.isArray(uploadRows)) {
        uploads = uploadRows.map((u: Record<string, unknown>) => ({
          ...u,
          user_email: null,
        }))
      }
    } catch {
      // upload_history may not exist in Neon
    }

    // Signals from Neon with data point count, latest, and 30d/90d trends
    let signals: Array<Record<string, unknown>> = []
    try {
      const signalRows = await sql`
        SELECT * FROM signals
        WHERE organization_id = ${dbOrgId}
        ORDER BY updated_at DESC
      `
      if (Array.isArray(signalRows) && signalRows.length > 0) {
        const signalIds = (signalRows as { id: string }[]).map((r) => r.id)
        // Batch fetch time series for trend computation (last 24 months per signal)
        type PointRow = { signal_id: string; date: string; value: number }
        let pointsBySignal: Record<string, { date: string; value: number }[]> = {}
        try {
          const pointRows = await sql`
            SELECT signal_id, date, value FROM signal_data_points
            WHERE signal_id = ANY(${signalIds}::uuid[])
            ORDER BY date ASC
          ` as PointRow[]
          const raw = Array.isArray(pointRows) ? pointRows : []
          for (const row of raw) {
            const sid = row.signal_id
            if (!pointsBySignal[sid]) pointsBySignal[sid] = []
            pointsBySignal[sid].push({ date: row.date, value: Number(row.value) })
          }
          for (const sid of Object.keys(pointsBySignal)) {
            const arr = pointsBySignal[sid]
            pointsBySignal[sid] = arr.length > 24 ? arr.slice(-24) : arr
          }
        } catch {
          // leave pointsBySignal empty
        }

        signals = await Promise.all(
          signalRows.map(async (s: Record<string, unknown>) => {
            const signalId = s.id as string
            let data_points_count = 0
            let latest_value: unknown = null
            let latest_date: unknown = null
            try {
              const countRows = await sql`
                SELECT COUNT(*) as c FROM signal_data_points WHERE signal_id = ${signalId}::uuid
              `
              data_points_count = Number((countRows?.[0] as { c: string })?.c ?? 0)
              const latestRows = await sql`
                SELECT value, date FROM signal_data_points
                WHERE signal_id = ${signalId}::uuid
                ORDER BY date DESC LIMIT 1
              `
              const latest = latestRows?.[0] as { value: unknown; date: unknown } | undefined
              if (latest) {
                latest_value = latest.value
                latest_date = latest.date
              }
            } catch {
              // ignore
            }
            const points = pointsBySignal[signalId] ?? []
            const trendResult = computeTrendsFromMonthlyPoints(points)
            return {
              ...s,
              owner_email: null,
              data_points_count,
              latest_value,
              latest_date,
              trend_30d_pct: trendResult.trend_30d_pct ?? null,
              trend_90d_pct: trendResult.trend_90d_pct ?? null,
              trend_30d_delta: trendResult.trend_30d_delta ?? null,
              trend_90d_delta: trendResult.trend_90d_delta ?? null,
              trend_30d_from_label: trendResult.trend_30d_from_label ?? null,
              trend_30d_to_label: trendResult.trend_30d_to_label ?? null,
              trend_90d_from_label: trendResult.trend_90d_from_label ?? null,
              trend_90d_to_label: trendResult.trend_90d_to_label ?? null,
            }
          })
        )
      }
    } catch (e) {
      console.error("[api/admin/organizations/[id]/details] signals error:", e)
    }

    return NextResponse.json({
      org,
      members,
      availableUsers,
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
