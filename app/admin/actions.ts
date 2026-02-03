"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function createUserAndAddToOrgAction(
  orgId: string,
  email: string,
  fullName: string,
  orgRole: "admin" | "read-only",
  profileRole: "executive" | "manager" = "manager",
) {
  try {
    const adminClient = createAdminClient()

    // Generate a temporary password
    const tempPassword =
      Math.random().toString(36).slice(-12) + "!" + Math.random().toString(36).slice(-4).toUpperCase()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        must_change_password: true,
      },
    })

    if (authError) {
      console.error("[createUser] Auth error:", authError.message)
      throw new Error(authError.message || "Failed to create user account")
    }

    if (!authData.user) {
      throw new Error("Failed to create user - no user data returned")
    }

    const userId = authData.user.id

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        organization_id: orgId,
        role: profileRole,
        must_change_password: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )

    if (profileError) {
      console.log("[v0] Profile upsert failed:", profileError.message)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    console.log("[v0] Profile created/updated successfully")

const { error: memberError } = await adminClient.from("organization_members").insert({
      organization_id: orgId,
      user_id: userId,
      role: orgRole,
      joined_at: new Date().toISOString(),
    })

    if (memberError) {
      console.log("[v0] Member creation failed:", memberError.message)
      throw new Error(`Failed to add user to organization: ${memberError.message}`)
    }

    console.log("[v0] Member added to organization successfully")

    return {
      success: true,
      userId: authData.user.id,
      tempPassword,
    }
  } catch (error) {
    console.log("[v0] Error in createUserAndAddToOrgAction:", error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while creating the member")
  }
}
