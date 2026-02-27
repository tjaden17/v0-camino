"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { sql } from "@/lib/db/neon"

export async function createUserAndAddToOrgAction(
  orgId: string,
  email: string,
  fullName: string,
  orgRole: "admin" | "read-only",
  profileRole: "executive" | "manager" = "manager",
  kpi1?: string,
  kpi2?: string,
  kpi3?: string,
  orgName?: string,
  onboarding?: {
    industry?: string
    companySize?: string
    businessStage?: string
    role?: string
    department?: string
    seniorityLevel?: string
    selectedGoals?: string[]
  },
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

    // Omit organization_id from Supabase profile: org may exist only in Neon, and Supabase
    // profiles.organization_id_fkey would fail. Org membership is stored in organization_members.
    const profileRow: Record<string, unknown> = {
      id: userId,
      email,
      full_name: fullName,
      role: profileRole,
      kpi_1: kpi1 || null,
      kpi_2: kpi2 || null,
      kpi_3: kpi3 || null,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    }
    if (onboarding?.industry != null) profileRow.industry = onboarding.industry

    const { error: profileError } = await adminClient.from("profiles").upsert(profileRow as any, {
      onConflict: "id",
    })

    if (profileError) {
      console.log("[v0] Profile upsert failed:", profileError.message)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    console.log("[v0] Profile created/updated successfully")

    // Ensure org exists in Supabase so organization_members.organization_id_fkey is satisfied
    if (orgName != null && orgName !== "") {
      await adminClient.from("organizations").upsert(
        { id: orgId, name: orgName, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      )
    }

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

    // Sync profile to Neon so GET /api/admin/organizations/[id]/details (Neon) shows the new member
    try {
      await sql`
        INSERT INTO profiles (id, email, full_name, organization_id, role, kpi_1, kpi_2, kpi_3, created_at, updated_at)
        VALUES (
          ${userId}::uuid,
          ${email},
          ${fullName},
          ${orgId}::uuid,
          ${profileRole},
          ${kpi1 ?? null},
          ${kpi2 ?? null},
          ${kpi3 ?? null},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          email = ${email},
          full_name = ${fullName},
          organization_id = ${orgId}::uuid,
          role = ${profileRole},
          kpi_1 = ${kpi1 ?? null},
          kpi_2 = ${kpi2 ?? null},
          kpi_3 = ${kpi3 ?? null},
          updated_at = NOW()
      `
    } catch (neonProfileErr) {
      console.error("[createUser] Neon profile sync:", neonProfileErr)
      // Don't fail the action; member exists in Supabase
    }

    // Persist onboarding-style context to Neon (user_context + user_goals) so member is fully "onboarded"
    if (onboarding && (onboarding.industry ?? onboarding.companySize ?? onboarding.businessStage ?? onboarding.role ?? onboarding.department ?? onboarding.seniorityLevel ?? (onboarding.selectedGoals && onboarding.selectedGoals.length > 0))) {
      try {
        await sql`
          INSERT INTO user_context (
            user_id, organization_id, role, department, seniority_level,
            business_stage, company_size, industry, goals,
            onboarding_completed, onboarding_step, created_at, updated_at
          )
          VALUES (
            ${userId}::uuid, ${orgId}::uuid, ${onboarding.role ?? null}, ${onboarding.department ?? null}, ${onboarding.seniorityLevel ?? null},
            ${onboarding.businessStage ?? null}, ${onboarding.companySize ?? null}, ${onboarding.industry ?? null},
            ${JSON.stringify(onboarding.selectedGoals ?? [])}::jsonb,
            true, 3, NOW(), NOW()
          )
          ON CONFLICT (user_id) DO UPDATE SET
            organization_id = ${orgId}::uuid,
            role = ${onboarding.role ?? null},
            department = ${onboarding.department ?? null},
            seniority_level = ${onboarding.seniorityLevel ?? null},
            business_stage = ${onboarding.businessStage ?? null},
            company_size = ${onboarding.companySize ?? null},
            industry = ${onboarding.industry ?? null},
            goals = ${JSON.stringify(onboarding.selectedGoals ?? [])}::jsonb,
            onboarding_completed = true,
            onboarding_step = 3,
            updated_at = NOW()
        `
        const goals = onboarding.selectedGoals ?? []
        for (let i = 0; i < goals.length; i++) {
          await sql`
            INSERT INTO user_goals (user_id, organization_id, goal_type, title, status, priority, created_at, updated_at)
            VALUES (${userId}::uuid, ${orgId}::uuid, 'business_priority', ${goals[i]}, 'active', ${i + 1}, NOW(), NOW())
          `
        }
      } catch (neonErr) {
        console.error("[createUser] Neon user_context/user_goals:", neonErr)
        // Don't fail the whole create; profile and org membership are already done
      }
    }

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
