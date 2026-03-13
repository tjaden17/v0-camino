import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createZohoClient } from "@/lib/zoho-api-client"
import { transformToUniversalSchema, ZOHO_CRM_MAPPINGS } from "@/lib/universal-schema"
import { SignalGenerator } from "@/lib/signal-generator"

export async function POST(request: NextRequest) {
  try {
    const { integrationId } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get integration
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*, profiles!inner(organization_id)")
      .eq("id", integrationId)
      .eq("user_id", user.id)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 })
    }

    const orgId = (integration as any).profiles.organization_id

    // Create sync history record
    const { data: syncRecord } = await supabase
      .from("sync_history")
      .insert({
        integration_id: integrationId,
        user_id: user.id,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    let result
    try {
      if (integration.provider === "zoho_crm") {
        result = await syncZohoCRM(integration, user.id, orgId)
      } else if (integration.provider === "zoho_desk") {
        result = await syncZohoDesk(integration, user.id, orgId)
      } else if (integration.provider === "hubspot") {
        result = await syncHubSpot(integration, user.id, orgId)
      } else {
        throw new Error(`Unsupported provider: ${integration.provider}`)
      }
    } catch (error) {
      console.error("[v0] Sync error:", error)
      result = {
        success: false,
        recordsSynced: 0,
        signalsCreated: 0,
        signalsUpdated: 0,
        error: error instanceof Error ? error.message : "Unknown sync error",
      }
    }

    // Update sync history
    await supabase
      .from("sync_history")
      .update({
        status: result.success ? "success" : "failed",
        records_synced: result.recordsSynced,
        signals_created: result.signalsCreated,
        signals_updated: result.signalsUpdated,
        error_message: result.error,
        completed_at: new Date().toISOString(),
      })
      .eq("id", syncRecord!.id)

    return NextResponse.json({
      success: result.success,
      message: result.message || (result.success ? "Sync completed successfully" : "Sync failed"),
      details: {
        recordsSynced: result.recordsSynced,
        signalsCreated: result.signalsCreated,
        signalsUpdated: result.signalsUpdated,
      },
    })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function syncZohoCRM(integration: any, userId: string, orgId: string) {
  const zohoClient = await createZohoClient(integration.id)
  const generator = new SignalGenerator()

  // Fetch CRM data
  const [deals, metrics] = await Promise.all([zohoClient.getCRMDeals(), zohoClient.getCRMMetrics()])

  // Transform deals to universal schema
  const dealDataPoints = transformToUniversalSchema(deals, ZOHO_CRM_MAPPINGS.deals, {
    category: "sales",
    source: "zoho_crm",
  })

  // Create aggregate signals from metrics
  const metricDataPoints = Object.entries(metrics).map(([name, value]) => ({
    name,
    value,
    date: new Date(),
    category: "sales" as const,
    source: "zoho_crm" as const,
  }))

  // Generate signals
  const allDataPoints = [...dealDataPoints, ...metricDataPoints]
  const signals = await generator.generateSignalsFromData(allDataPoints, userId, orgId)

  return {
    success: true,
    recordsSynced: deals.length,
    signalsCreated: signals.length,
    signalsUpdated: 0,
    message: `Successfully synced ${deals.length} deals from Zoho CRM`,
  }
}

async function syncZohoDesk(integration: any, userId: string, orgId: string) {
  const zohoClient = await createZohoClient(integration.id)
  const generator = new SignalGenerator()

  // Fetch Desk data
  const [tickets, metrics] = await Promise.all([zohoClient.getDeskTickets(), zohoClient.getDeskMetrics()])

  // Create signals from metrics
  const metricDataPoints = Object.entries(metrics).map(([name, value]) => ({
    name,
    value,
    date: new Date(),
    category: "support" as const,
    source: "zoho_desk" as const,
  }))

  // Generate signals
  const signals = await generator.generateSignalsFromData(metricDataPoints, userId, orgId)

  return {
    success: true,
    recordsSynced: tickets.length,
    signalsCreated: signals.length,
    signalsUpdated: 0,
    message: `Successfully synced ${tickets.length} tickets from Zoho Desk`,
  }
}

async function syncHubSpot(integration: any, userId: string, orgId: string) {
  // TODO: Implement HubSpot API integration
  return {
    success: false,
    recordsSynced: 0,
    signalsCreated: 0,
    signalsUpdated: 0,
    error: "HubSpot integration not yet implemented",
    message: "HubSpot integration coming soon",
  }
}
