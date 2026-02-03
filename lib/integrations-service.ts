import { createBrowserClient } from "@/lib/supabase/client"

export interface Integration {
  id: string
  user_id: string
  provider: "zoho_crm" | "zoho_desk" | "hubspot"
  provider_account_id?: string
  status: "active" | "expired" | "disconnected"
  metadata: any
  created_at: string
  updated_at: string
}

export interface SyncHistory {
  id: string
  integration_id: string
  user_id: string
  status: "success" | "failed" | "in_progress"
  records_synced: number
  signals_created: number
  signals_updated: number
  error_message?: string
  started_at: string
  completed_at?: string
}

export const INTEGRATION_PROVIDERS = [
  {
    id: "zoho_crm",
    name: "Zoho CRM",
    description: "Sync deals, contacts, and sales metrics from Zoho CRM",
    icon: "🔷",
    category: "CRM",
    metrics: ["Revenue", "Deals Closed", "Pipeline Value", "Win Rate"],
  },
  {
    id: "zoho_desk",
    name: "Zoho Desk",
    description: "Sync support tickets and customer satisfaction metrics",
    icon: "🎫",
    category: "Support",
    metrics: ["Tickets Created", "Tickets Resolved", "CSAT Score", "Response Time"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts, deals, and marketing metrics from HubSpot",
    icon: "🧡",
    category: "CRM & Marketing",
    metrics: ["Contacts", "Deals", "Email Open Rate", "Lead Conversion"],
  },
]

export async function getUserIntegrations(userId: string): Promise<Integration[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getIntegration(userId: string, provider: string): Promise<Integration | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle()

  if (error) return null
  return data
}

export async function disconnectIntegration(integrationId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("integrations").update({ status: "disconnected" }).eq("id", integrationId)

  if (error) throw error
}

export async function getSyncHistory(integrationId: string): Promise<SyncHistory[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("sync_history")
    .select("*")
    .eq("integration_id", integrationId)
    .order("started_at", { ascending: false })
    .limit(10)

  if (error) throw error
  return data || []
}

export async function triggerSync(integrationId: string): Promise<void> {
  const response = await fetch("/api/integrations/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ integrationId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to trigger sync")
  }
}
