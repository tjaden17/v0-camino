import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get("orgId")

  try {
    const supabase = createAdminClient()
    
    let query = supabase
      .from("signals")
      .select("id, name, category, trend, benchmark_value, benchmark_type")
      .order("name")

    if (orgId) {
      query = query.eq("organization_id", orgId)
    }

    const { data: signals, error } = await query.limit(100)

    if (error) {
      console.error("[v0] Error fetching signals:", error)
      return NextResponse.json({ signals: [] })
    }

    // Enrich with latest values
    const enrichedSignals = await Promise.all(
      (signals || []).map(async (signal) => {
        const { data: dataPoints } = await supabase
          .from("data_points")
          .select("value, date")
          .eq("signal_id", signal.id)
          .order("date", { ascending: false })
          .limit(2)

        const latest = dataPoints?.[0]
        const previous = dataPoints?.[1]
        
        let change_percent = null
        if (latest && previous && previous.value !== 0) {
          change_percent = ((latest.value - previous.value) / previous.value) * 100
        }

        // Determine status based on change
        let status = "steady"
        if (!previous) {
          status = "new"
        } else if (change_percent !== null) {
          if (change_percent < -20) status = "needs_attention"
          else if (change_percent > 10) status = "opportunity"
          else if (change_percent > 5) status = "improved"
        }

        return {
          ...signal,
          latest_value: latest?.value ?? null,
          change_percent,
          status,
        }
      })
    )

    return NextResponse.json({ signals: enrichedSignals })
  } catch (error) {
    console.error("[v0] Signals API error:", error)
    return NextResponse.json({ signals: [] })
  }
}
