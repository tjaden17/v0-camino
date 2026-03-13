import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, context, target_date, signal_ids } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const { data: decision, error: decisionError } = await supabase
      .from("decisions")
      .insert({
        title,
        owner_id: user.id,
        context: context || null,
        target_date: target_date || null,
        status: "upcoming",
        created_by: user.id,
      })
      .select()
      .single()

    if (decisionError || !decision) {
      console.error("[v0] Create decision error:", decisionError)
      return NextResponse.json({ error: "Failed to create decision" }, { status: 500 })
    }

    if (signal_ids && signal_ids.length > 0) {
      for (const signalId of signal_ids) {
        const { data: latestPoint } = await supabase
          .from("data_points")
          .select("value, date")
          .eq("signal_id", signalId)
          .order("date", { ascending: false })
          .limit(1)
          .single()

        const { data: signal } = await supabase.from("signals").select("benchmark_value").eq("id", signalId).single()

        await supabase.from("decision_signals").insert({
          decision_id: decision.id,
          signal_id: signalId,
          snapshot_value: latestPoint?.value || null,
          snapshot_benchmark: signal?.benchmark_value || null,
          snapshot_date: latestPoint?.date || null,
        })
      }
    }

    return NextResponse.json({
      success: true,
      decision_id: decision.id,
    })
  } catch (error) {
    console.error("[v0] POST /api/decisions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
