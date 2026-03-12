import { type NextRequest, NextResponse } from "next/server"
import { createBrowserClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const stateStr = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`/integrations?error=${error}`)
    }

    if (!code || !stateStr) {
      return NextResponse.redirect("/integrations?error=missing_params")
    }

    const state = JSON.parse(stateStr)
    const { provider, userId } = state

    // Exchange code for access token
    let tokenData
    if (provider === "zoho_crm" || provider === "zoho_desk") {
      tokenData = await exchangeZohoCode(code, provider)
    } else if (provider === "hubspot") {
      tokenData = await exchangeHubSpotCode(code)
    }

    if (!tokenData) {
      return NextResponse.redirect("/integrations?error=token_exchange_failed")
    }

    // Store integration in database
    const supabase = createBrowserClient()
    const { error: dbError } = await supabase.from("integrations").upsert({
      user_id: userId,
      provider,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      status: "active",
    })

    if (dbError) {
      console.error("[v0] Failed to store integration:", dbError)
      return NextResponse.redirect("/integrations?error=storage_failed")
    }

    return NextResponse.redirect(`/integrations/${provider}?success=true`)
  } catch (error) {
    console.error("[v0] OAuth callback error:", error)
    return NextResponse.redirect("/integrations?error=callback_failed")
  }
}

async function exchangeZohoCode(code: string, provider: string) {
  const clientId = provider === "zoho_crm" ? process.env.ZOHO_CRM_CLIENT_ID : process.env.ZOHO_DESK_CLIENT_ID
  const clientSecret =
    provider === "zoho_crm" ? process.env.ZOHO_CRM_CLIENT_SECRET : process.env.ZOHO_DESK_CLIENT_SECRET
  const redirectUri = provider === "zoho_crm" ? process.env.ZOHO_CRM_REDIRECT_URI : process.env.ZOHO_DESK_REDIRECT_URI

  const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
      code,
    }),
  })

  if (!response.ok) return null
  return response.json()
}

async function exchangeHubSpotCode(code: string) {
  const clientId = process.env.HUBSPOT_CLIENT_ID!
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET!
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI!

  const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!response.ok) return null
  return response.json()
}
