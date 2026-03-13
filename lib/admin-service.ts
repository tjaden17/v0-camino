import { createBrowserClient } from "@/lib/supabase/client"

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  organization: string | null
  industry: string | null
  role: string | null
  created_at: string
  last_sign_in_at: string | null
}

export interface AdminSignal {
  id: string
  name: string
  category: string
  owner_id: string
  owner_email: string
  data_points_count: number
  latest_value: number | null
  latest_date: string | null
}

export interface AdminUpload {
  id: string
  user_id: string
  user_email: string
  filename: string
  status: string
  rows_imported: number | null
  created_at: string
}

export async function getAllUsers(organizationId?: string | null, isMasterAdmin?: boolean): Promise<AdminUser[]> {
  const supabase = createBrowserClient()

  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (!isMasterAdmin && organizationId) {
    query = query.eq("organization_id", organizationId)
  }

  const { data: profiles, error } = await query

  if (error) throw error
  return profiles || []
}

export async function getAllSignals(organizationId?: string | null, isMasterAdmin?: boolean): Promise<AdminSignal[]> {
  const supabase = createBrowserClient()

  let query = supabase.from("signals").select("*").order("created_at", { ascending: false })

  if (!isMasterAdmin && organizationId) {
    query = query.eq("organization_id", organizationId)
  }

  const { data: signals, error } = await query

  if (error) throw error

  // Get owner emails
  const signalsWithOwners = await Promise.all(
    (signals || []).map(async (signal) => {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", signal.owner_id).maybeSingle()

      // Get data points count
      const { count } = await supabase
        .from("signal_data_points")
        .select("*", { count: "exact", head: true })
        .eq("signal_id", signal.id)

      // Get latest data point
      const { data: latestData } = await supabase
        .from("signal_data_points")
        .select("value, date")
        .eq("signal_id", signal.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        ...signal,
        owner_email: profile?.email || "Unknown",
        data_points_count: count || 0,
        latest_value: latestData?.value || null,
        latest_date: latestData?.date || null,
      }
    }),
  )

  return signalsWithOwners
}

export async function getAllUploads(organizationId?: string | null, isMasterAdmin?: boolean): Promise<AdminUpload[]> {
  const supabase = createBrowserClient()

  let query = supabase.from("upload_history").select("*").order("created_at", { ascending: false }).limit(100)

  if (!isMasterAdmin && organizationId) {
    query = query.eq("organization_id", organizationId)
  }

  const { data: uploads, error } = await query

  if (error) throw error

  const uploadsWithEmails = await Promise.all(
    (uploads || []).map(async (upload) => {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", upload.user_id).maybeSingle()

      return {
        ...upload,
        user_email: profile?.email || "Unknown",
      }
    }),
  )

  return uploadsWithEmails
}

export async function getSystemStats(organizationId?: string | null, isMasterAdmin?: boolean) {
  const supabase = createBrowserClient()

  let userCount = 0
  let signalCount = 0
  let uploadCount = 0
  let dataPointCount = 0

  try {
    if (!isMasterAdmin && organizationId) {
      const { count: users } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)

      const { count: signals } = await supabase
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)

      const { count: uploads } = await supabase
        .from("upload_history")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)

      userCount = users || 0
      signalCount = signals || 0
      uploadCount = uploads || 0

      // For data points, get signal IDs first then count
      const { data: orgSignals } = await supabase.from("signals").select("id").eq("organization_id", organizationId)

      if (orgSignals && orgSignals.length > 0) {
        const signalIds = orgSignals.map((s) => s.id)
        const { count: dataPoints } = await supabase
          .from("signal_data_points")
          .select("*", { count: "exact", head: true })
          .in("signal_id", signalIds)

        dataPointCount = dataPoints || 0
      }
    } else {
      // Master admin - get all counts
      const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      const { count: signals } = await supabase.from("signals").select("*", { count: "exact", head: true })

      const { count: uploads } = await supabase.from("upload_history").select("*", { count: "exact", head: true })

      const { count: dataPoints } = await supabase
        .from("signal_data_points")
        .select("*", { count: "exact", head: true })

      userCount = users || 0
      signalCount = signals || 0
      uploadCount = uploads || 0
      dataPointCount = dataPoints || 0
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
  }

  return {
    users: userCount,
    signals: signalCount,
    dataPoints: dataPointCount,
    uploads: uploadCount,
  }
}

export async function getUserProfileById(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().maybeSingle()

  if (error) throw error
  return data
}

export async function deleteUpload(uploadId: string, organizationId?: string | null, isMasterAdmin?: boolean) {
  const supabase = createBrowserClient()

  if (!isMasterAdmin && organizationId) {
    const { data: upload } = await supabase
      .from("upload_history")
      .select("organization_id")
      .eq("id", uploadId)
      .maybeSingle()

    if (!upload || upload.organization_id !== organizationId) {
      throw new Error("Unauthorized: Upload does not belong to your organization")
    }
  }

  const { error } = await supabase.from("upload_history").delete().eq("id", uploadId)

  if (error) throw error
  return { success: true }
}

export async function deleteSignal(signalId: string, organizationId?: string | null, isMasterAdmin?: boolean) {
  const supabase = createBrowserClient()

  if (!isMasterAdmin && organizationId) {
    const { data: signal } = await supabase.from("signals").select("organization_id").eq("id", signalId).maybeSingle()

    if (!signal || signal.organization_id !== organizationId) {
      throw new Error("Unauthorized: Signal does not belong to your organization")
    }
  }

  const { error } = await supabase.from("signals").delete().eq("id", signalId)

  if (error) throw error
  return { success: true }
}

export async function deleteSignalsFromUpload(uploadId: string) {
  const supabase = createBrowserClient()

  const { data: upload } = await supabase.from("upload_history").select("*").eq("id", uploadId).maybeSingle()

  if (!upload) throw new Error("Upload not found")

  const uploadTime = new Date(upload.created_at)
  const oneMinuteLater = new Date(uploadTime.getTime() + 60000)

  const { error } = await supabase
    .from("signals")
    .delete()
    .eq("organization_id", upload.organization_id)
    .gte("created_at", uploadTime.toISOString())
    .lte("created_at", oneMinuteLater.toISOString())

  if (error) throw error
  return { success: true }
}
