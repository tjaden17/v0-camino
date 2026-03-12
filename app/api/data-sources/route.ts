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

    // Get data sources and coverage summary
    const sources = await multiSourceIntelligence.getDataSources(organizationId)
    const coverage = await multiSourceIntelligence.getSourceCoverageSummary(organizationId)

    return NextResponse.json({
      sources,
      coverage
    })
  } catch (error) {
    console.error("[v0] Error fetching data sources:", error)
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
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

    const body = await request.json()
    const { sourceName, sourceType, sourceCategory, dataTypes = [], syncFrequency = "daily" } = body

    if (!sourceName || !sourceType || !sourceCategory) {
      return NextResponse.json({ 
        error: "Missing required fields: sourceName, sourceType, sourceCategory" 
      }, { status: 400 })
    }

    // Register the data source
    const source = await multiSourceIntelligence.registerDataSource({
      organizationId,
      sourceName,
      sourceType,
      sourceCategory,
      connectionStatus: "connected",
      connectionConfig: {},
      dataTypes,
      recordCount: 0,
      dateRangeStart: null,
      dateRangeEnd: null,
      lastSyncAt: null,
      lastSyncStatus: null,
      lastSyncRecords: null,
      lastSyncError: null,
      syncFrequency,
      isActive: true
    })

    if (!source) {
      return NextResponse.json({ error: "Failed to register data source" }, { status: 500 })
    }

    return NextResponse.json({ success: true, source })
  } catch (error) {
    console.error("[v0] Error registering data source:", error)
    return NextResponse.json({ error: "Failed to register data source" }, { status: 500 })
  }
}
