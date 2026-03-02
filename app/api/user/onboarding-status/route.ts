import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user_context for onboarding status
    const adminClient = createAdminClient()
    const { data: context, error } = await adminClient
      .from("user_context")
      .select("onboarding_completed, onboarding_step, organization_id, role, department")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) throw error

    if (context) {
      return NextResponse.json({
        onboardingCompleted: context.onboarding_completed || false,
        onboardingStep: context.onboarding_step || 0,
        organizationId: context.organization_id,
        role: context.role,
        department: context.department,
      })
    }

    // No user_context found, onboarding not started
    return NextResponse.json({
      onboardingCompleted: false,
      onboardingStep: 0,
      organizationId: null,
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
