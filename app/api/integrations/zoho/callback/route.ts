import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZohoOAuthService } from '@/lib/zoho-oauth-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('[v0] Zoho OAuth error:', error)
      return NextResponse.redirect(
        `${request.nextUrl.origin}/admin/integrations?error=oauth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/admin/integrations?error=missing_params`
      )
    }

    // Decode state to get provider and organization ID
    const { provider, organizationId } = ZohoOAuthService.decodeState(state)

    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/admin/integrations?error=unauthorized`
      )
    }

    // Verify user belongs to the organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profile?.organization_id !== organizationId) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/admin/integrations?error=invalid_organization`
      )
    }

    // Exchange code for tokens
    const redirectUri = `${request.nextUrl.origin}/api/integrations/zoho/callback`
    const tokens = await ZohoOAuthService.exchangeCodeForTokens(
      provider,
      code,
      redirectUri
    )

    // Store integration
    await ZohoOAuthService.storeIntegration(
      organizationId,
      provider,
      tokens,
      user.id
    )

    // Redirect to integrations page with success
    return NextResponse.redirect(
      `${request.nextUrl.origin}/admin/integrations?success=${provider}`
    )
  } catch (error) {
    console.error('[v0] Zoho callback error:', error)
    return NextResponse.redirect(
      `${request.nextUrl.origin}/admin/integrations?error=callback_failed`
    )
  }
}
