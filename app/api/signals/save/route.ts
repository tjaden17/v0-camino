import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveSignal, unsaveSignal, isSignalSaved } from "@/lib/signals-service"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { signalId, notes } = await request.json()

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    const saved = await saveSignal(user.id, signalId, notes)

    if (!saved) {
      return NextResponse.json({ error: "Failed to save signal" }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved })
  } catch (error) {
    console.error("[v0] Save signal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const signalId = searchParams.get("signalId")

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    const success = await unsaveSignal(user.id, signalId)

    if (!success) {
      return NextResponse.json({ error: "Failed to unsave signal" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unsave signal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const signalId = searchParams.get("signalId")

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    const isSaved = await isSignalSaved(user.id, signalId)

    return NextResponse.json({ isSaved })
  } catch (error) {
    console.error("[v0] Check saved error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
