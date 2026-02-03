import { NextResponse } from "next/server"
import { relationshipDetectionEngine } from "@/lib/relationship-detection-engine"
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

    // Get relationships
    const relationships = await relationshipDetectionEngine.getRelationships(organizationId)
    const causalChains = await relationshipDetectionEngine.getCausalChains(organizationId)

    return NextResponse.json({
      relationships,
      causalChains
    })
  } catch (error) {
    console.error("[v0] Error fetching relationships:", error)
    return NextResponse.json({ error: "Failed to fetch relationships" }, { status: 500 })
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

    // Detect relationships
    const { relationships, insights, causalChains } = 
      await relationshipDetectionEngine.detectRelationships(organizationId)

    // Save to database
    await relationshipDetectionEngine.saveRelationships(organizationId, relationships, insights)
    await relationshipDetectionEngine.saveCausalChains(organizationId, causalChains)

    return NextResponse.json({
      success: true,
      detected: {
        relationships: relationships.length,
        insights: insights.length,
        causalChains: causalChains.length
      },
      relationships,
      causalChains
    })
  } catch (error) {
    console.error("[v0] Error detecting relationships:", error)
    return NextResponse.json({ error: "Failed to detect relationships" }, { status: 500 })
  }
}
