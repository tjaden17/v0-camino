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

    // Get OAuth credentials from environment
    const clientId = process.env.ZOHO_CRM_CLIENT_ID
    const redirectUri = process.env.ZOHO_CRM_REDIRECT_URI || `${request.nextUrl.origin}/api/integrations/oauth/callback`

    if (!clientId) {
      return NextResponse.json(
        {
          error:
            "Zoho CRM integration not configured. Please add ZOHO_CRM_CLIENT_ID and ZOHO_CRM_CLIENT_SECRET to environment variables.",
        },
        { status: 500 },
      )
    }

    // Build Zoho OAuth URL
    const authUrl = new URL("https://accounts.zoho.com/oauth/v2/auth")
    authUrl.searchParams.set("scope", "ZohoCRM.modules.ALL,ZohoCRM.settings.ALL")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("access_type", "offline")
    authUrl.searchParams.set("state", JSON.stringify({ provider: "zoho_crm", userId: user.id }))

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("[v0] Zoho CRM OAuth error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
