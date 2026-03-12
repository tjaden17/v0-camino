import { NextResponse } from "next/server"
import { multiSourceIntelligence } from "@/lib/multi-source-intelligence-service"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const organizationId = profile?.organization_id

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    // Analyze data quality
    const qualityReports = await multiSourceIntelligence.analyzeDataQuality(organizationId)

    // Calculate overall health
    const avgScore = qualityReports.length > 0
      ? qualityReports.reduce((sum, r) => sum + r.overallScore, 0) / qualityReports.length
      : 0

    const totalIssues = qualityReports.reduce((sum, r) => sum + r.issues.length, 0)
    const criticalIssues = qualityReports.reduce(
      (sum, r) => sum + r.issues.filter(i => i.severity === "high").length, 
      0
    )

    return NextResponse.json({
      reports: qualityReports,
      summary: {
        averageScore: avgScore,
        totalIssues,
        criticalIssues,
        sourcesAnalyzed: qualityReports.length,
        overallHealth: avgScore > 0.8 ? "healthy" : avgScore > 0.5 ? "warning" : "critical"
      }
    })
  } catch (error) {
    console.error("[v0] Error analyzing data quality:", error)
    return NextResponse.json({ error: "Failed to analyze data quality" }, { status: 500 })
  }
}
