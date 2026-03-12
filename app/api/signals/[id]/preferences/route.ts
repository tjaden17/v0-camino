import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserContextService } from "@/lib/user-context-service"

// POST - Pin, unpin, hide, or unhide a signal
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id: signalId } = await params
    const { action } = await request.json()
    
    let success = false
    
    switch (action) {
      case "pin":
        success = await UserContextService.pinSignal(user.id, signalId)
        break
      case "unpin":
        success = await UserContextService.unpinSignal(user.id, signalId)
        break
      case "hide":
        success = await UserContextService.hideSignal(user.id, signalId)
        break
      case "unhide":
        success = await UserContextService.unhideSignal(user.id, signalId)
        break
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: pin, unpin, hide, unhide" },
          { status: 400 }
        )
    }
    
    if (!success) {
      return NextResponse.json(
        { error: `Failed to ${action} signal` },
        { status: 500 }
      )
    }
    
    // Log activity
    await UserContextService.logActivity(
      user.id,
      `${action}_signal`,
      "signal",
      signalId
    )
    
    return NextResponse.json({ success: true, action, signalId })
    
  } catch (error) {
    console.error("[API] Error updating signal preference:", error)
    return NextResponse.json(
      { error: "Failed to update signal preference" },
      { status: 500 }
    )
  }
}
