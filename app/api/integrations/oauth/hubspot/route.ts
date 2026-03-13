import { type NextRequest, NextResponse } from "next/server"
import { createBrowserClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = process.env.HUBSPOT_CLIENT_ID
    const redirectUri = process.env.HUBSPOT_REDIRECT_URI || `${request.nextUrl.origin}/api/integrations/oauth/callback`

    if (!clientId) {
      return NextResponse.json(
        {
          error:
            "HubSpot integration not configured. Please add HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET to environment variables.",
        },
        { status: 500 },
      )
    }

    const authUrl = new URL("https://app.hubspot.com/oauth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", "crm.objects.contacts.read crm.objects.deals.read")
    authUrl.searchParams.set("state", JSON.stringify({ provider: "hubspot", userId: user.id }))

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("[v0] HubSpot OAuth error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
