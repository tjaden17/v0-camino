import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SignalIntelligenceService } from "@/lib/signal-intelligence-service"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const includeHidden = searchParams.get("includeHidden") === "true"
    const categories = searchParams.get("categories")?.split(",").filter(Boolean)
    const mode = searchParams.get("mode") || "ranked"  // ranked, proactive, explore
    
    let signals
    
    switch (mode) {
      case "proactive":
        signals = await SignalIntelligenceService.getProactiveSignals(user.id)
        return NextResponse.json({ signals, mode: "proactive" })
        
      case "explore":
        signals = await SignalIntelligenceService.getExplorationSignals(user.id)
        return NextResponse.json({ signals, mode: "explore" })
        
      case "summary":
        const summary = await SignalIntelligenceService.getSignalSummary(user.id)
        return NextResponse.json(summary)
        
      case "by-category":
        const byCategory = await SignalIntelligenceService.getSignalsByCategory(user.id)
        return NextResponse.json({ 
          categories: Array.from(byCategory.entries()).map(([category, signals]) => ({
            category,
            signals
          }))
        })
        
      default:
        // Ranked signals (default)
        const result = await SignalIntelligenceService.getRankedSignals(user.id, {
          limit,
          includeHidden,
          categoryFilter: categories
        })
        return NextResponse.json(result)
    }
    
  } catch (error) {
    console.error("[API] Error getting ranked signals:", error)
    return NextResponse.json(
      { error: "Failed to get ranked signals" },
      { status: 500 }
    )
  }
}
