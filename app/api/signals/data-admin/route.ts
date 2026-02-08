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

    // Get user's org
    const profileResult = await sql`
      SELECT organization_id FROM profiles WHERE id = ${user.id} LIMIT 1
    `
    const orgId = profileResult?.[0]?.organization_id

    // 1. Upload history - staged_uploads for this user/org
    const uploads = await sql`
      SELECT 
        su.id,
        su.file_name,
        su.file_type,
        su.source_type,
        su.row_count,
        su.column_count,
        su.status,
        su.uploaded_at,
        su.processed_at,
        su.metadata,
        (SELECT count(*) FROM staged_fields sf WHERE sf.upload_id = su.id) as field_count
      FROM staged_uploads su
      WHERE su.user_id = ${user.id}
        ${orgId ? sql`OR su.organization_id = ${orgId}` : sql``}
      ORDER BY su.uploaded_at DESC
      LIMIT 50
    `

    // 2. Integration history - active integrations for this org
    const integrations = orgId
      ? await sql`
          SELECT 
            id,
            provider,
            provider_type,
            status,
            last_sync_at,
            last_sync_status,
            last_sync_error,
            sync_frequency,
            created_at,
            updated_at
          FROM integrations
          WHERE organization_id = ${orgId}
          ORDER BY last_sync_at DESC NULLS LAST
        `
      : []

    // 3. Data sources with sync info
    const dataSources = orgId
      ? await sql`
          SELECT
            id,
            source_name,
            source_type,
            source_category,
            connection_status,
            record_count,
            date_range_start,
            date_range_end,
            last_sync_at,
            last_sync_status,
            last_sync_records,
            last_sync_error,
            is_active,
            created_at,
            updated_at
          FROM data_sources
          WHERE organization_id = ${orgId}
          ORDER BY last_sync_at DESC NULLS LAST
        `
      : []

    // 4. Per-upload signal details: what signals came from each upload
    const uploadIds = uploads.map((u: any) => u.id)
    let uploadSignalDetails: any[] = []
    if (uploadIds.length > 0) {
      uploadSignalDetails = await sql`
        SELECT
          so.id,
          so.signal_name,
          so.signal_category,
          so.status,
          so.discovery_type,
          so.is_calculable,
          so.confidence_score,
          so.required_fields,
          so.available_fields,
          so.missing_fields,
          so.source_uploads,
          so.created_at,
          so.updated_at
        FROM signal_opportunities so
        WHERE so.user_id = ${user.id}
          ${orgId ? sql`OR so.organization_id = ${orgId}` : sql``}
        ORDER BY so.created_at DESC
      `
    }

    // 5. Partial / incomplete signals - those with missing fields
    const partialSignals = await sql`
      SELECT
        so.id,
        so.signal_name,
        so.signal_category,
        so.required_fields,
        so.available_fields,
        so.missing_fields,
        so.confidence_score,
        so.source_uploads,
        so.status,
        so.created_at
      FROM signal_opportunities so
      WHERE (so.user_id = ${user.id} ${orgId ? sql`OR so.organization_id = ${orgId}` : sql``})
        AND so.is_calculable = false
        AND so.missing_fields IS NOT NULL
        AND jsonb_array_length(so.missing_fields) > 0
      ORDER BY so.confidence_score DESC
    `

    // 6. Active signals count and data freshness
    const signalStats = orgId
      ? await sql`
          SELECT
            count(*) as total_signals,
            count(CASE WHEN trend IS NOT NULL THEN 1 END) as signals_with_trends,
            max(updated_at) as last_signal_update
          FROM signals
          WHERE organization_id = ${orgId}
        `
      : await sql`
          SELECT 0 as total_signals, 0 as signals_with_trends, null as last_signal_update
        `

    return NextResponse.json({
      uploads,
      integrations,
      dataSources,
      uploadSignalDetails,
      partialSignals,
      stats: {
        totalUploads: uploads.length,
        totalIntegrations: integrations.length,
        totalDataSources: dataSources.length,
        totalSignals: Number(signalStats[0]?.total_signals || 0),
        signalsWithTrends: Number(signalStats[0]?.signals_with_trends || 0),
        lastSignalUpdate: signalStats[0]?.last_signal_update,
        totalPartialSignals: partialSignals.length,
      },
    })
  } catch (error) {
    console.error("[v0] Signals data admin error:", error)
    return NextResponse.json({ error: "Failed to load data admin" }, { status: 500 })
  }
}
