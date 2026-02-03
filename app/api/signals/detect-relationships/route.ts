import { SignalRelationshipsService } from "@/lib/signal-relationships-service"
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

    // Detect relationships
    const relationships = await SignalRelationshipsService.detectCorrelations(user.id)

    // Save relationships
    const savedCount = await SignalRelationshipsService.saveRelationships(relationships)

    return NextResponse.json({
      success: true,
      detected: relationships.length,
      saved: savedCount,
      relationships: relationships.slice(0, 10), // Return top 10
    })
  } catch (error) {
    console.error("[API] Error detecting relationships:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
