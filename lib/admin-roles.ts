"use server"

import { createClient } from "@/lib/supabase/server"

export type AdminRole = "master-admin" | "org-admin" | "user"

export async function getUserAdminRole(userId: string): Promise<AdminRole> {
  // Check if user is master admin (admin@admin.com)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email === "admin@admin.com") {
    return "master-admin"
  }

  // Check if user is an org admin
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single()

  if (membership) {
    return "org-admin"
  }

  return "user"
}

export async function isMasterAdmin(email?: string): Promise<boolean> {
  if (email) {
    return email === "admin@admin.com"
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.email === "admin@admin.com"
}

export async function isOrgAdmin(userId: string, organizationId?: string): Promise<boolean> {
  const supabase = await createClient()

  const query = supabase.from("organization_members").select("role").eq("user_id", userId).eq("role", "admin")

  if (organizationId) {
    query.eq("organization_id", organizationId)
  }

  const { data } = await query.single()

  return !!data
}
