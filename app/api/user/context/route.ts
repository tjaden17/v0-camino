import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserContextService } from "@/lib/user-context-service"

// GET - Fetch user context
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const context = await UserContextService.getUserContext(user.id)
    
    return NextResponse.json({ context })
    
  } catch (error) {
    console.error("[API] Error fetching user context:", error)
    return NextResponse.json(
      { error: "Failed to fetch user context" },
      { status: 500 }
    )
  }
}

// PUT - Update user context
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const updates = await request.json()
    
    const success = await UserContextService.updateUserContext(user.id, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update user context" },
        { status: 500 }
      )
    }
    
    // Return updated context
    const context = await UserContextService.getUserContext(user.id)
    
    return NextResponse.json({ context, success: true })
    
  } catch (error) {
    console.error("[API] Error updating user context:", error)
    return NextResponse.json(
      { error: "Failed to update user context" },
      { status: 500 }
    )
  }
}
