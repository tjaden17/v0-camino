import { createBrowserClient } from "./supabase/client"

/** List organizations from Neon (via API). Supabase is auth-only; app data is in Neon. */
export async function getAllOrganizations() {
  const res = await fetch("/api/admin/organizations")
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? "Failed to load organizations")
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** Create organization in Neon (via API). Avoids hang from writing to Supabase when data lives in Neon. */
export async function createOrganizationAsAdmin(name: string) {
  const res = await fetch("/api/admin/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? "Failed to create organization")
  }
  return res.json()
}

/** Update organization in Neon (via API). */
export async function updateOrganization(orgId: string, name: string) {
  const res = await fetch(`/api/admin/organizations/${orgId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? "Failed to update organization")
  }
  return res.json()
}

/** Delete organization in Neon (via API). */
export async function deleteOrganization(orgId: string) {
  const res = await fetch(`/api/admin/organizations/${orgId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? "Failed to delete organization")
  }
}

/** Get one organization from Neon (via list). Returns null if not found so the UI can show a message. */
export async function getOrganizationDetails(orgId: string) {
  const list = await getAllOrganizations()
  const norm = (id: unknown) => String(id ?? "").toLowerCase().trim()
  const org = list.find((o: { id: unknown }) => norm(o.id) === norm(orgId))
  return org ?? null
}

export async function getOrganizationMembersAdmin(orgId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      *,
      user_profile:user_id (
        id,
        email,
        full_name,
        role,
        organization_id,
        industry,
        business_context,
        company_stage,
        team_size,
        market,
        competitors,
        business_model,
        kpi_1,
        kpi_2,
        kpi_3
      )
    `)
    .eq("organization_id", orgId)

  if (error) throw error
  return data
}

export async function addMemberToOrgAdmin(orgId: string, userId: string, role: "admin" | "read-only") {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: orgId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Update user's organization_id in profile
  await supabase.from("profiles").update({ organization_id: orgId }).eq("id", userId)

  return data
}

export async function updateMemberRoleAdmin(memberId: string, role: "admin" | "read-only") {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId)

  if (error) throw error
}

export async function removeMemberAdmin(memberId: string, userId: string) {
  const supabase = createBrowserClient()

  // Remove from organization_members
  const { error: memberError } = await supabase.from("organization_members").delete().eq("id", memberId)

  if (memberError) throw memberError

  // Clear organization_id from profile
  const { error: profileError } = await supabase.from("profiles").update({ organization_id: null }).eq("id", userId)

  if (profileError) throw profileError
}

export async function updateUserProfileAdmin(userId: string, updates: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data
}

export async function getAllUsersNotInOrg(orgId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .or(`organization_id.is.null,organization_id.neq.${orgId}`)

  if (error) throw error
  return data
}

export async function getOrganizationUploads(orgId: string) {
  const supabase = createBrowserClient()

  const { data: uploads, error } = await supabase
    .from("upload_history")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })

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

export async function getOrganizationSignals(orgId: string) {
  const supabase = createBrowserClient()

  const { data: signals, error } = await supabase
    .from("signals")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })

  if (error) throw error

  const signalsWithDetails = await Promise.all(
    (signals || []).map(async (signal) => {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", signal.owner_id).maybeSingle()

      const { count } = await supabase
        .from("signal_data_points")
        .select("*", { count: "exact", head: true })
        .eq("signal_id", signal.signal_id)

      const { data: latestData } = await supabase
        .from("signal_data_points")
        .select("value, date")
        .eq("signal_id", signal.signal_id)
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

  return signalsWithDetails
}

export async function deleteOrgUpload(uploadId: string, deleteSignals = false) {
  const supabase = createBrowserClient()

  if (deleteSignals) {
    const { data: upload } = await supabase.from("upload_history").select("*").eq("id", uploadId).maybeSingle()

    if (upload) {
      const uploadTime = new Date(upload.created_at)
      const uploadEndTime = new Date(uploadTime.getTime() + 60000)

      await supabase
        .from("signals")
        .delete()
        .eq("organization_id", upload.organization_id)
        .gte("created_at", upload.created_at)
        .lte("created_at", uploadEndTime.toISOString())
    }
  }

  const { error } = await supabase.from("upload_history").delete().eq("id", uploadId)

  if (error) throw error
  return { success: true }
}

export async function deleteOrgSignal(signalId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("signals").delete().eq("signal_id", signalId)

  if (error) throw error
  return { success: true }
}
