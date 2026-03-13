import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ZohoProvider = 'zoho_desk' | 'zoho_crm'

export interface ZohoTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  api_domain?: string
}

export interface ZohoIntegration {
  id: string
  organization_id: string
  provider: ZohoProvider
  access_token: string
  refresh_token: string
  token_expires_at: string
  config: {
    api_domain: string
    org_id?: string
    data_center: string
    scopes: string[]
  }
  status: 'active' | 'expired' | 'error' | 'disconnected'
  last_sync_at?: string
  last_error?: string
  created_at: string
  updated_at: string
}

/**
 * Zoho OAuth Service
 * Handles OAuth 2.0 flow, token management, and API authentication
 */
export class ZohoOAuthService {
  private static ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com'
  
  // OAuth scopes by provider
  private static SCOPES = {
    zoho_desk: [
      'Desk.tickets.READ',
      'Desk.basic.READ',
      'Desk.settings.READ',
      'Desk.reports.READ'
    ],
    zoho_crm: [
      'ZohoCRM.modules.READ',
      'ZohoCRM.settings.READ',
      'ZohoCRM.coql.READ',
      'ZohoCRM.bulk.READ'
    ]
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  static getAuthorizationUrl(
    provider: ZohoProvider,
    organizationId: string,
    redirectUri: string
  ): string {
    const clientId = provider === 'zoho_desk' 
      ? process.env.ZOHO_DESK_CLIENT_ID 
      : process.env.ZOHO_CRM_CLIENT_ID

    if (!clientId) {
      throw new Error(`Missing ${provider.toUpperCase()}_CLIENT_ID environment variable`)
    }

    const scopes = this.SCOPES[provider].join(',')
    const state = this.encodeState({ provider, organizationId })

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      access_type: 'offline',
      prompt: 'consent',
      state
    })

    return `${this.ZOHO_ACCOUNTS_URL}/oauth/v2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForTokens(
    provider: ZohoProvider,
    code: string,
    redirectUri: string
  ): Promise<ZohoTokens> {
    const clientId = provider === 'zoho_desk'
      ? process.env.ZOHO_DESK_CLIENT_ID
      : process.env.ZOHO_CRM_CLIENT_ID

    const clientSecret = provider === 'zoho_desk'
      ? process.env.ZOHO_DESK_CLIENT_SECRET
      : process.env.ZOHO_CRM_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(`Missing Zoho ${provider} credentials`)
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    })

    const response = await fetch(`${this.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for tokens: ${error}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    provider: ZohoProvider,
    refreshToken: string
  ): Promise<ZohoTokens> {
    const clientId = provider === 'zoho_desk'
      ? process.env.ZOHO_DESK_CLIENT_ID
      : process.env.ZOHO_CRM_CLIENT_ID

    const clientSecret = provider === 'zoho_desk'
      ? process.env.ZOHO_DESK_CLIENT_SECRET
      : process.env.ZOHO_CRM_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(`Missing Zoho ${provider} credentials`)
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    })

    const response = await fetch(`${this.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh token: ${error}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Store integration in database
   */
  static async storeIntegration(
    organizationId: string,
    provider: ZohoProvider,
    tokens: ZohoTokens,
    userId: string
  ): Promise<ZohoIntegration> {
    const supabase = createAdminClient()

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Simple encryption (in production, use proper encryption library)
    const encryptedAccessToken = this.simpleEncrypt(tokens.access_token)
    const encryptedRefreshToken = this.simpleEncrypt(tokens.refresh_token)

    const integrationData = {
      organization_id: organizationId,
      provider,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      config: {
        api_domain: tokens.api_domain || this.getDefaultApiDomain(provider),
        data_center: 'US',
        scopes: this.SCOPES[provider]
      },
      status: 'active' as const,
      created_by: userId
    }

    const { data, error } = await supabase
      .from('integrations')
      .upsert(integrationData, {
        onConflict: 'organization_id,provider'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get integration by organization and provider
   */
  static async getIntegration(
    organizationId: string,
    provider: ZohoProvider
  ): Promise<ZohoIntegration | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  /**
   * Get valid access token (refresh if expired)
   */
  static async getValidAccessToken(
    organizationId: string,
    provider: ZohoProvider
  ): Promise<string> {
    const integration = await this.getIntegration(organizationId, provider)
    if (!integration) {
      throw new Error(`No ${provider} integration found for organization`)
    }

    const expiresAt = new Date(integration.token_expires_at)
    const now = new Date()

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const decryptedRefreshToken = this.simpleDecrypt(integration.refresh_token)
      const newTokens = await this.refreshAccessToken(provider, decryptedRefreshToken)
      
      // Update stored tokens
      const supabase = createAdminClient()
      const newExpiresAt = new Date()
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + newTokens.expires_in)

      await supabase
        .from('integrations')
        .update({
          access_token: this.simpleEncrypt(newTokens.access_token),
          token_expires_at: newExpiresAt.toISOString(),
          status: 'active'
        })
        .eq('id', integration.id)

      return newTokens.access_token
    }

    return this.simpleDecrypt(integration.access_token)
  }

  /**
   * Delete integration
   */
  static async deleteIntegration(
    organizationId: string,
    provider: ZohoProvider
  ): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('organization_id', organizationId)
      .eq('provider', provider)

    if (error) throw error
  }

  /**
   * Get all integrations for an organization
   */
  static async getOrganizationIntegrations(
    organizationId: string
  ): Promise<ZohoIntegration[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Helper methods

  private static encodeState(state: { provider: string; organizationId: string }): string {
    return Buffer.from(JSON.stringify(state)).toString('base64url')
  }

  static decodeState(encoded: string): { provider: ZohoProvider; organizationId: string } {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString())
  }

  private static getDefaultApiDomain(provider: ZohoProvider): string {
    return provider === 'zoho_desk' 
      ? 'https://desk.zoho.com' 
      : 'https://www.zohoapis.com'
  }

  // Simple encryption (replace with proper encryption in production)
  private static simpleEncrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-me'
    return Buffer.from(text).toString('base64')
  }

  private static simpleDecrypt(encrypted: string): string {
    return Buffer.from(encrypted, 'base64').toString()
  }
}
