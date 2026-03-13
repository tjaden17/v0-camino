import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoOAuthService, type ZohoProvider } from '@/lib/zoho-oauth-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { provider } = body as { provider: ZohoProvider }

    if (!provider || !['zoho_desk', 'zoho_crm'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Generate authorization URL
    const redirectUri = `${request.nextUrl.origin}/api/integrations/zoho/callback`
    const authUrl = ZohoOAuthService.getAuthorizationUrl(
      provider,
      profile.organization_id,
      redirectUri
    )

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('[v0] Zoho connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}
