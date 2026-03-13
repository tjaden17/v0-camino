import { SignalTemplatesService } from "@/lib/signal-templates-service"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { templateIds, userId } = body

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json({ error: "Invalid template IDs" }, { status: 400 })
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create signals from templates
    const signalIds = await SignalTemplatesService.bulkCreateSignalsFromTemplates(templateIds, user.id)

    return NextResponse.json({
      success: true,
      signalIds,
      count: signalIds.length,
    })
  } catch (error) {
    console.error("[API] Error creating signals from templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
