import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      role,
      function: userFunction,
      seniority_level,
    } = body

    // Get or create organization (simplified - use user's default org)
    let organizationId: string

    // Try to get existing organization for this user
    const existingOrg = await sql`
      SELECT id FROM organizations WHERE created_by = ${user.id} LIMIT 1
    `

    if (existingOrg && existingOrg.length > 0) {
      organizationId = existingOrg[0].id
    } else {
      // Create new organization
      const newOrgResult = await sql`
        INSERT INTO organizations (name, created_by, created_at, updated_at)
        VALUES (${user.email || "Organization"}, ${user.id}, NOW(), NOW())
        RETURNING id
      `
      organizationId = newOrgResult[0].id
    }

    // 1. Update profile with organization_id
    await sql`
      INSERT INTO profiles (id, email, organization_id, full_name, created_at, updated_at)
      VALUES (
        ${user.id}, 
        ${user.email}, 
        ${organizationId}, 
        ${user.user_metadata?.full_name || user.email?.split("@")[0] || "User"},
        NOW(), 
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        organization_id = ${organizationId},
        updated_at = NOW()
    `

    // 2. Create/update user_context with role preferences
    await sql`
      INSERT INTO user_context (
        user_id, 
        organization_id, 
        role, 
        department, 
        seniority_level,
        onboarding_completed,
        onboarding_step,
        created_at, 
        updated_at
      )
      VALUES (
        ${user.id}, 
        ${organizationId}, 
        ${role}, 
        ${userFunction}, 
        ${seniority_level},
        true,
        2,
        NOW(), 
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        organization_id = ${organizationId},
        role = ${role},
        department = ${userFunction},
        seniority_level = ${seniority_level},
        onboarding_completed = true,
        onboarding_step = 2,
        updated_at = NOW()
    `

    return NextResponse.json({ 
      success: true, 
      organizationId,
      message: "Onboarding completed successfully" 
    })

  } catch (error) {
    console.error("[complete-onboarding] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
