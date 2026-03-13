import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

    const adminClient = createAdminClient()

    // 1. Create organization
    const { data: orgData, error: orgError } = await adminClient
      .from("organizations")
      .insert({
        name: organizationName,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    let organizationId: string

    if (orgData && !orgError) {
      organizationId = orgData.id
    } else {
      // Organization might already exist, try to fetch it
      const { data: existingOrg } = await adminClient
        .from("organizations")
        .select("id")
        .eq("created_by", user.id)
        .limit(1)
        .maybeSingle()

      if (existingOrg) {
        organizationId = existingOrg.id
      } else {
        // Create with a different approach if conflict happened
        const { data: newOrg, error: newOrgError } = await adminClient
          .from("organizations")
          .insert({
            name: organizationName,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (newOrgError) throw newOrgError
        organizationId = newOrg.id
      }
    }

    // 2. Update profile with organization_id and role
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          organization_id: organizationId,
          role,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (profileError) throw profileError

    // 3. Create/update user_context with all onboarding data
    const { error: contextError } = await adminClient
      .from("user_context")
      .upsert(
        {
          user_id: user.id,
          organization_id: organizationId,
          role,
          department,
          seniority_level: seniorityLevel,
          business_stage: businessStage,
          company_size: companySize,
          industry,
          goals: selectedGoals || [],
          onboarding_completed: true,
          onboarding_step: 3,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (contextError) throw contextError

    // 4. Create user_goals from selected goals
    if (selectedGoals && selectedGoals.length > 0) {
      for (let i = 0; i < selectedGoals.length; i++) {
        const goalValue = selectedGoals[i]
        await adminClient
          .from("user_goals")
          .upsert(
            {
              user_id: user.id,
              organization_id: organizationId,
              goal_type: "business_priority",
              title: goalValue,
              status: "active",
              priority: i + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { ignoreDuplicates: true }
          )
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
