import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user_context for onboarding status and organization
    const result = await sql`
      SELECT 
        uc.onboarding_completed,
        uc.onboarding_step,
        uc.organization_id,
        uc.role,
        uc.department,
        o.name as organization_name
      FROM user_context uc
      LEFT JOIN organizations o ON uc.organization_id = o.id
      WHERE uc.user_id = ${user.id}
      LIMIT 1
    `

    if (result && result.length > 0) {
      const context = result[0]
      return NextResponse.json({
        onboardingCompleted: context.onboarding_completed || false,
        onboardingStep: context.onboarding_step || 0,
        organizationId: context.organization_id,
        organizationName: context.organization_name,
        role: context.role,
        department: context.department,
      })
    }

    // No user_context found, onboarding not started
    return NextResponse.json({
      onboardingCompleted: false,
      onboardingStep: 0,
      organizationId: null,
      organizationName: null,
      role: null,
      department: null,
    })

  } catch (error) {
    console.error("[onboarding-status] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get onboarding status" },
      { status: 500 }
    )
  }
}
