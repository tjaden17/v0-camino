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

    // Get user's org
    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) throw profileError

    const orgId = profileData?.organization_id

    // 1. Upload history - staged_uploads for this org (or user if no org)
    let uploads: any[] = []
    if (orgId) {
      const { data, error } = await adminClient
        .from("staged_uploads")
        .select("id, file_name, file_type, source_type, row_count, column_count, status, uploaded_at, processed_at, metadata, user_id")
        .eq("organization_id", orgId)
        .order("uploaded_at", { ascending: false })
        .limit(50)

      if (error) throw error
      uploads = data ?? []
    } else {
      const { data, error } = await adminClient
        .from("staged_uploads")
        .select("id, file_name, file_type, source_type, row_count, column_count, status, uploaded_at, processed_at, metadata, user_id")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(50)

      if (error) throw error
      uploads = data ?? []
    }

    // 2. Integration history - active integrations for this org
    let integrations: any[] = []
    if (orgId) {
      const { data, error } = await adminClient
        .from("integrations")
        .select("id, provider, provider_type, status, last_sync_at, last_sync_status, last_sync_error, sync_frequency, created_at, updated_at")
        .eq("organization_id", orgId)
        .order("last_sync_at", { ascending: false, nullsFirst: false })

      if (error) throw error
      integrations = data ?? []
    }

    // 3. Data sources with sync info
    let dataSources: any[] = []
    if (orgId) {
      const { data, error } = await adminClient
        .from("data_sources")
        .select("id, source_name, source_type, source_category, connection_status, record_count, date_range_start, date_range_end, last_sync_at, last_sync_status, last_sync_records, last_sync_error, is_active, created_at, updated_at")
        .eq("organization_id", orgId)
        .order("last_sync_at", { ascending: false, nullsFirst: false })

      if (error) throw error
      dataSources = data ?? []
    }

    // 4. Per-upload signal details: what signals came from each upload
    let uploadSignalDetails: any[] = []
    if (orgId) {
      const { data, error } = await adminClient
        .from("signal_opportunities")
        .select("id, signal_name, signal_category, status, discovery_type, is_calculable, confidence_score, required_fields, available_fields, missing_fields, source_uploads, created_at, updated_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })

      if (error) throw error
      uploadSignalDetails = data ?? []
    } else {
      const { data, error } = await adminClient
        .from("signal_opportunities")
        .select("id, signal_name, signal_category, status, discovery_type, is_calculable, confidence_score, required_fields, available_fields, missing_fields, source_uploads, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      uploadSignalDetails = data ?? []
    }

    // 5. Partial / incomplete signals - those with missing fields
    let partialSignals: any[] = []
    if (orgId) {
      const { data, error } = await adminClient
        .from("signal_opportunities")
        .select("id, signal_name, signal_category, required_fields, available_fields, missing_fields, confidence_score, source_uploads, status, created_at")
        .eq("organization_id", orgId)
        .eq("is_calculable", false)
        .not("missing_fields", "is", null)
        .order("confidence_score", { ascending: false })

      if (error) throw error
      // Filter out entries with empty missing_fields arrays client-side
      // (jsonb_array_length > 0 equivalent)
      partialSignals = (data ?? []).filter(
        (r: any) => Array.isArray(r.missing_fields) && r.missing_fields.length > 0
      )
    } else {
      const { data, error } = await adminClient
        .from("signal_opportunities")
        .select("id, signal_name, signal_category, required_fields, available_fields, missing_fields, confidence_score, source_uploads, status, created_at")
        .eq("user_id", user.id)
        .eq("is_calculable", false)
        .not("missing_fields", "is", null)
        .order("confidence_score", { ascending: false })

      if (error) throw error
      partialSignals = (data ?? []).filter(
        (r: any) => Array.isArray(r.missing_fields) && r.missing_fields.length > 0
      )
    }

    // 6. Active signals count and data freshness
    let totalSignals = 0
    let signalsWithTrends = 0
    let lastSignalUpdate: string | null = null

    if (orgId) {
      // Get total count
      const { count: total, error: countError } = await adminClient
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)

      if (countError) throw countError
      totalSignals = total ?? 0

      // Get count of signals with trends
      const { count: withTrends, error: trendsError } = await adminClient
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("trend", "is", null)

      if (trendsError) throw trendsError
      signalsWithTrends = withTrends ?? 0

      // Get max updated_at
      const { data: latestSignal, error: latestError } = await adminClient
        .from("signals")
        .select("updated_at")
        .eq("organization_id", orgId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestError) throw latestError
      lastSignalUpdate = latestSignal?.updated_at ?? null
    }

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
        totalSignals,
        signalsWithTrends,
        lastSignalUpdate,
        totalPartialSignals: partialSignals.length,
      },
    })
  } catch (error) {
    console.error("[v0] Signals data admin error:", error)
    return NextResponse.json({ error: "Failed to load data admin" }, { status: 500 })
  }
}
