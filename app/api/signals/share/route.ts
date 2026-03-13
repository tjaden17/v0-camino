import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { signalId, shareMethod, recipientEmail } = await request.json()

    if (!signalId || !shareMethod) {
      return NextResponse.json({ error: "signalId and shareMethod are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("signal_shares")
      .insert({
        signal_id: signalId,
        shared_by: user.id,
        share_method: shareMethod,
        recipient_email: recipientEmail || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error logging share:", error)
      return NextResponse.json({ error: "Failed to log share" }, { status: 500 })
    }

    return NextResponse.json({ share: data })
  } catch (error) {
    console.error("Share API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
