import { AIAnalysisService } from "@/lib/ai-analysis-service"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { signalId } = body

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    // Generate all analyses in parallel
    const [whyAnalysis, trendAnalysis, recommendations] = await Promise.all([
      AIAnalysisService.getWhyAnalysis(signalId),
      AIAnalysisService.getTrendExplanation(signalId),
      AIAnalysisService.getActionRecommendations(signalId),
    ])

    return NextResponse.json({
      success: true,
      whyAnalysis,
      trendAnalysis,
      recommendations,
      totalTokens: (whyAnalysis?.tokenCost || 0) + (trendAnalysis?.tokenCost || 0) + (recommendations?.tokenCost || 0),
    })
  } catch (error) {
    console.error("[API] Error generating AI analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
