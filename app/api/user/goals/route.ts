import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserContextService } from "@/lib/user-context-service"

// GET - Fetch user goals
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const context = await UserContextService.getUserContext(user.id)
    
    return NextResponse.json({ goals: context?.goals || [] })
    
  } catch (error) {
    console.error("[API] Error fetching goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    )
  }
}

// POST - Add a new goal
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const goal = await request.json()
    
    const goalId = await UserContextService.addGoal(user.id, goal)
    
    if (!goalId) {
      return NextResponse.json(
        { error: "Failed to add goal" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ goalId, success: true })
    
  } catch (error) {
    console.error("[API] Error adding goal:", error)
    return NextResponse.json(
      { error: "Failed to add goal" },
      { status: 500 }
    )
  }
}
