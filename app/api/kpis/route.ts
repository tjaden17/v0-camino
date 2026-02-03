import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { signalIds } = body

    if (!Array.isArray(signalIds)) {
      return NextResponse.json({ error: "signalIds must be an array" }, { status: 400 })
    }

    // Delete existing KPI ownership for user
    await supabase.from("kpi_ownership").delete().eq("user_id", user.id)

    // Insert new KPI ownership
    if (signalIds.length > 0) {
      const { error: insertError } = await supabase.from("kpi_ownership").insert(
        signalIds.map((signalId) => ({
          user_id: user.id,
          signal_id: signalId,
        })),
      )

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating KPIs:", error)
    return NextResponse.json({ error: "Failed to update KPIs" }, { status: 500 })
  }
}
