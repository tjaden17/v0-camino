import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SignalIntelligence } from "@/lib/signal-intelligence"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("kpi_1, kpi_2, kpi_3, organization_id, role, industry")
      .eq("id", user.id)
      .maybeSingle()

    const userKPIs = [profile?.kpi_1, profile?.kpi_2, profile?.kpi_3].filter(Boolean)
    const hasKPIs = userKPIs.length > 0

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const ownedOnly = searchParams.get("owned") === "true"
    const kpiRelevantOnly = searchParams.get("kpiRelevant") === "true"
    const smartSort = searchParams.get("smartSort") !== "false" // Default to smart sorting

    let query = supabase.from("signals").select(`
        *,
        kpi_ownership!left(user_id),
        data_points(value, date)
      `)

    if (profile?.organization_id) {
      query = query.eq("organization_id", profile.organization_id)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (ownedOnly) {
      query = query.not("kpi_ownership", "is", null)
    }

    const { data: signals, error } = await query

    if (error) throw error

    let filteredSignals = signals || []

    if (kpiRelevantOnly && hasKPIs) {
      filteredSignals = filteredSignals.filter((signal) => {
        const relatedKPIs = signal.metadata?.relatedKPIs || []
        const kpiTags = signal.metadata?.kpiTags || []

        const nameMatch = userKPIs.some(
          (kpi) =>
            signal.name.toLowerCase().includes(kpi.toLowerCase()) ||
            kpi.toLowerCase().includes(signal.name.toLowerCase()),
        )

        const metadataMatch = userKPIs.some(
          (kpi) =>
            relatedKPIs.some(
              (related: string) =>
                related.toLowerCase().includes(kpi.toLowerCase()) || kpi.toLowerCase().includes(related.toLowerCase()),
            ) ||
            kpiTags.some(
              (tag: string) =>
                tag.toLowerCase().includes(kpi.toLowerCase()) || kpi.toLowerCase().includes(tag.toLowerCase()),
            ),
        )

        return nameMatch || metadataMatch
      })
    }

    const intelligence = new SignalIntelligence()
    const orgContext = { industry: profile?.industry, role: profile?.role }

    const enrichedSignals = filteredSignals.map((signal) => {
      const latestDataPoint = signal.data_points?.sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]

      const enriched = {
        ...signal,
        current_value: latestDataPoint?.value || signal.current_value,
        kpi_tags: signal.metadata?.kpiTags || [],
        related_kpis: signal.metadata?.relatedKPIs || [],
        user_kpis: userKPIs,
      }

      // Calculate intelligence score
      const score = intelligence.calculateSignalImportance(enriched, userKPIs, orgContext)
      const smartCategory = intelligence.categorizeSignal(enriched)

      return {
        ...enriched,
        intelligence_score: score.overallScore,
        score_breakdown: {
          relevance: score.relevanceScore,
          urgency: score.urgencyScore,
          impact: score.impactScore,
        },
        score_reasons: score.reasons,
        smart_category: smartCategory,
      }
    })

    if (smartSort) {
      enrichedSignals.sort((a, b) => (b.intelligence_score || 0) - (a.intelligence_score || 0))
    }

    const smartCategories = intelligence.generateSmartCategories()

    return NextResponse.json({
      signals: enrichedSignals,
      userKPIs: userKPIs,
      hasKPIs: hasKPIs,
      totalSignals: signals?.length || 0,
      filteredSignals: enrichedSignals.length,
      smartCategories: smartCategories,
      message: hasKPIs
        ? "Signals sorted by relevance to your KPIs"
        : "Signals sorted by business impact (set your KPIs in Profile for personalized insights)",
    })
  } catch (error) {
    console.error("[v0] Error fetching signals:", error)
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 })
  }
}
