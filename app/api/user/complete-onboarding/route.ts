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
      organizationName,
      industry,
      companySize,
      businessStage,
      role,
      department,
      seniorityLevel,
      selectedGoals,
    } = body

    // Validate required fields
    if (!organizationName || !industry || !companySize || !businessStage || !role || !department || !seniorityLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Create organization in Neon
    const orgResult = await sql`
      INSERT INTO organizations (name, created_by, created_at, updated_at)
      VALUES (${organizationName}, ${user.id}, NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `

    let organizationId: string

    if (orgResult && orgResult.length > 0) {
      organizationId = orgResult[0].id
    } else {
      // Organization might already exist, try to fetch it
      const existingOrg = await sql`
        SELECT id FROM organizations WHERE created_by = ${user.id} LIMIT 1
      `
      if (existingOrg && existingOrg.length > 0) {
        organizationId = existingOrg[0].id
      } else {
        // Create with a different approach if conflict happened
        const newOrg = await sql`
          INSERT INTO organizations (name, created_by, created_at, updated_at)
          VALUES (${organizationName}, ${user.id}, NOW(), NOW())
          RETURNING id
        `
        organizationId = newOrg[0].id
      }
    }

    // 2. Update profile with organization_id and role
    await sql`
      INSERT INTO profiles (id, email, organization_id, role, full_name, created_at, updated_at)
      VALUES (
        ${user.id}, 
        ${user.email}, 
        ${organizationId}, 
        ${role},
        ${user.user_metadata?.full_name || user.email?.split("@")[0] || "User"},
        NOW(), 
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        organization_id = ${organizationId},
        role = ${role},
        updated_at = NOW()
    `

    // 3. Create/update user_context with all onboarding data
    await sql`
      INSERT INTO user_context (
        user_id, 
        organization_id, 
        role, 
        department, 
        seniority_level, 
        business_stage, 
        company_size, 
        industry,
        goals,
        onboarding_completed,
        onboarding_step,
        created_at, 
        updated_at
      )
      VALUES (
        ${user.id}, 
        ${organizationId}, 
        ${role}, 
        ${department}, 
        ${seniorityLevel}, 
        ${businessStage}, 
        ${companySize}, 
        ${industry},
        ${JSON.stringify(selectedGoals || [])},
        true,
        3,
        NOW(), 
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        organization_id = ${organizationId},
        role = ${role},
        department = ${department},
        seniority_level = ${seniorityLevel},
        business_stage = ${businessStage},
        company_size = ${companySize},
        industry = ${industry},
        goals = ${JSON.stringify(selectedGoals || [])},
        onboarding_completed = true,
        onboarding_step = 3,
        updated_at = NOW()
    `

    // 4. Create user_goals from selected goals
    if (selectedGoals && selectedGoals.length > 0) {
      for (let i = 0; i < selectedGoals.length; i++) {
        const goalValue = selectedGoals[i]
        await sql`
          INSERT INTO user_goals (
            user_id,
            organization_id,
            goal_type,
            title,
            status,
            priority,
            created_at,
            updated_at
          )
          VALUES (
            ${user.id},
            ${organizationId},
            'business_priority',
            ${goalValue},
            'active',
            ${i + 1},
            NOW(),
            NOW()
          )
          ON CONFLICT DO NOTHING
        `
      }
    }

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
