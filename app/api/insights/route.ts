import { NextResponse } from "next/server"
import { multiSourceIntelligence } from "@/lib/multi-source-intelligence-service"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const organizationId = profile?.organization_id

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    // Get cross-source insights
    const insights = await multiSourceIntelligence.getCrossSourceInsights(organizationId)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[v0] Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const organizationId = profile?.organization_id

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    // Detect new insights
    const insights = await multiSourceIntelligence.detectCrossSourceInsights(organizationId)
    
    // Save to database
    await multiSourceIntelligence.saveCrossSourceInsights(insights)

    return NextResponse.json({
      success: true,
      detected: insights.length,
      insights
    })
  } catch (error) {
    console.error("[v0] Error detecting insights:", error)
    return NextResponse.json({ error: "Failed to detect insights" }, { status: 500 })
  }
}
