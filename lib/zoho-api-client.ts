// Zoho API client for actual data fetching

interface ZohoTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export class ZohoAPIClient {
  private baseUrl: string
  private tokens: ZohoTokens

  constructor(tokens: ZohoTokens, datacenter = "com") {
    this.tokens = tokens
    this.baseUrl = `https://www.zohoapis.${datacenter}`
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        refresh_token: this.tokens.refresh_token,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh Zoho access token")
    }

    const data = await response.json()
    this.tokens.access_token = data.access_token
    this.tokens.expires_at = Date.now() + data.expires_in * 1000
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Check if token needs refresh
    if (Date.now() >= this.tokens.expires_at) {
      await this.refreshAccessToken()
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${this.tokens.access_token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Zoho API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Zoho CRM Methods
  async getCRMDeals(params?: { modified_since?: string; page?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      per_page: "200",
      ...(params?.modified_since && { "If-Modified-Since": params.modified_since }),
    })

    const data = await this.request(`/crm/v3/Deals?${queryParams}`)
    return data.data || []
  }

  async getCRMContacts(params?: { modified_since?: string; page?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      per_page: "200",
      ...(params?.modified_since && { "If-Modified-Since": params.modified_since }),
    })

    const data = await this.request(`/crm/v3/Contacts?${queryParams}`)
    return data.data || []
  }

  async getCRMMetrics(): Promise<Record<string, number>> {
    // Aggregate metrics from CRM
    const deals = await this.getCRMDeals()

    const metrics = {
      total_revenue: deals.reduce((sum, deal) => sum + (Number.parseFloat(deal.Amount) || 0), 0),
      deals_count: deals.length,
      won_deals: deals.filter((d) => d.Stage === "Closed Won").length,
      pipeline_value: deals
        .filter((d) => d.Stage !== "Closed Won" && d.Stage !== "Closed Lost")
        .reduce((sum, deal) => sum + (Number.parseFloat(deal.Amount) || 0), 0),
    }

    return metrics
  }

  // Zoho Desk Methods
  async getDeskTickets(params?: { modified_since?: string; limit?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 100),
      sortBy: "createdTime",
      ...(params?.modified_since && { modifiedTimeRange: params.modified_since }),
    })

    const data = await this.request(`/desk/v1/tickets?${queryParams}`)
    return data.data || []
  }

  async getDeskMetrics(): Promise<Record<string, number>> {
    const tickets = await this.getDeskTickets({ limit: 1000 })

    const metrics = {
      total_tickets: tickets.length,
      open_tickets: tickets.filter((t) => t.status === "Open").length,
      resolved_tickets: tickets.filter((t) => t.status === "Closed").length,
      avg_response_time: this.calculateAvgResponseTime(tickets),
    }

    return metrics
  }

  private calculateAvgResponseTime(tickets: any[]): number {
    const responseTimes = tickets
      .filter((t) => t.firstResponseTime && t.createdTime)
      .map((t) => {
        const created = new Date(t.createdTime).getTime()
        const responded = new Date(t.firstResponseTime).getTime()
        return (responded - created) / (1000 * 60 * 60) // hours
      })

    if (responseTimes.length === 0) return 0
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  }
}

export async function createZohoClient(integrationId: string): Promise<ZohoAPIClient> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: integration } = await supabase.from("integrations").select("*").eq("id", integrationId).maybeSingle()

  if (!integration || !integration.metadata?.tokens) {
    throw new Error("Integration not found or missing tokens")
  }

  return new ZohoAPIClient(integration.metadata.tokens, integration.metadata.datacenter || "com")
}
