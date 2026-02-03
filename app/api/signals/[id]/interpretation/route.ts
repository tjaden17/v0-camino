import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getInterpretation } from "@/lib/interpretation-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: signalId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    const result = await getInterpretation(signalId, forceRefresh)

    if (!result) {
      return NextResponse.json({ error: "Failed to get interpretation" }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Get interpretation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
