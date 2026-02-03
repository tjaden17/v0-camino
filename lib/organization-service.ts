import { createBrowserClient } from "./supabase/client"

export async function createOrganization(name: string, userId: string) {
  const supabase = createBrowserClient()

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, created_by: userId })
    .select()
    .single()

  if (orgError) throw orgError

  // Add creator as admin member
  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: userId,
    role: "admin",
    joined_at: new Date().toISOString(),
  })

  if (memberError) throw memberError

  // Update user's profile with organization
  const { error: profileError } = await supabase.from("profiles").update({ organization_id: org.id }).eq("id", userId)

  if (profileError) throw profileError

  return org
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: "admin" | "read-only",
  invitedBy: string,
) {
  const supabase = createBrowserClient()

  const { data: profiles } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle()

  if (!profiles) {
    throw new Error("User not found. They need to sign up first.")
  }

  // Add to organization
  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: profiles.id,
      role,
      invited_by: invitedBy,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getOrganizationMembers(organizationId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        role
      )
    `)
    .eq("organization_id", organizationId)

  if (error) throw error

  return data
}

export async function updateMemberRole(memberId: string, role: "admin" | "read-only") {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId)

  if (error) throw error
}

export async function removeMember(memberId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("organization_members").delete().eq("id", memberId)

  if (error) throw error
}
