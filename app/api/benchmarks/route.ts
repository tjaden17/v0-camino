import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { signalId, type, value, source } = body

    if (!signalId || !type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert benchmark
    const { data, error } = await supabase
      .from("benchmarks")
      .insert({
        signal_id: signalId,
        type,
        value,
        source,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ benchmark: data })
  } catch (error) {
    console.error("[v0] Error creating benchmark:", error)
    return NextResponse.json({ error: "Failed to create benchmark" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const signalId = searchParams.get("signalId")

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    const { data: benchmarks, error } = await supabase
      .from("benchmarks")
      .select("*")
      .eq("signal_id", signalId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ benchmarks: benchmarks || [] })
  } catch (error) {
    console.error("[v0] Error fetching benchmarks:", error)
    return NextResponse.json({ error: "Failed to fetch benchmarks" }, { status: 500 })
  }
}
