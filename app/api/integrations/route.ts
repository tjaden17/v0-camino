import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoOAuthService, type ZohoProvider } from '@/lib/zoho-oauth-service'

// GET: List all integrations for the user's organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    let integrations = []
    try {
      integrations = await ZohoOAuthService.getOrganizationIntegrations(
        profile.organization_id
      )
    } catch (err) {
      console.error('[v0] Failed to fetch integrations from database:', err)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ integrations: [] })
    }

    // Remove sensitive data before sending to client
    const sanitizedIntegrations = integrations.map(integration => ({
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
      last_sync_at: integration.last_sync_at,
      last_error: integration.last_error,
      created_at: integration.created_at,
      config: {
        data_center: integration.config.data_center,
        scopes: integration.config.scopes
      }
    }))

    return NextResponse.json({ integrations: sanitizedIntegrations })
  } catch (error) {
    console.error('[v0] Get integrations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// DELETE: Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const body = await request.json()
    const { provider } = body as { provider: ZohoProvider }

    if (!provider) {
      return NextResponse.json({ error: 'Provider required' }, { status: 400 })
    }

    await ZohoOAuthService.deleteIntegration(
      profile.organization_id,
      provider
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Delete integration error:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
