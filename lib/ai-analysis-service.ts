import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { getSignalDataPoints } from "@/lib/data-points-service"

export interface AIAnalysisResult {
  signalId: string
  analysisType: "why_analysis" | "impact_prediction" | "action_recommendation" | "trend_explanation"
  result: {
    summary: string
    keyInsights: string[]
    recommendations?: string[]
    confidence?: number
    reasoning?: string
  }
  tokenCost: number
  cached: boolean
  generatedAt: string
}

export class AIAnalysisService {
  /**
   * Get or generate "why" analysis for a signal
   * Explains WHY a signal is changing
   */
  static async getWhyAnalysis(signalId: string, forceRefresh = false): Promise<AIAnalysisResult | null> {
    const cacheKey = `why-${signalId}`

    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedAnalysis(signalId, "why_analysis", cacheKey)
      if (cached) return cached
    }

    // Generate new analysis
    const supabase = await createClient()

    // Get signal data
    const { data: signal } = await supabase.from("signals").select("*").eq("id", signalId).single()

    if (!signal) return null

    // Get recent data points from Neon signal_data_points
    const dataPoints = await getSignalDataPoints(signalId, { limit: 30 })

    if (dataPoints.length < 3) {
      return null
    }

    // Build prompt
    const prompt = this.buildWhyAnalysisPrompt(signal, dataPoints)

    // Call AI (cost-optimized with smaller model)
    try {
      const { text, usage } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.7,
        maxTokens: 500,
      })

      const result = this.parseWhyAnalysisResponse(text)

      // Cache the result
      await this.cacheAnalysis(signalId, "why_analysis", cacheKey, result, usage?.totalTokens || 0)

      return {
        signalId,
        analysisType: "why_analysis",
        result,
        tokenCost: usage?.totalTokens || 0,
        cached: false,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[AIAnalysisService] Error generating why analysis:", error)
      return null
    }
  }

  /**
   * Get trend explanation
   */
  static async getTrendExplanation(signalId: string, forceRefresh = false): Promise<AIAnalysisResult | null> {
    const cacheKey = `trend-${signalId}`

    if (!forceRefresh) {
      const cached = await this.getCachedAnalysis(signalId, "trend_explanation", cacheKey)
      if (cached) return cached
    }

    const supabase = await createClient()

    const { data: signal } = await supabase.from("signals").select("*").eq("id", signalId).single()

    if (!signal) return null

    const dataPoints = await getSignalDataPoints(signalId, { limit: 60 })

    if (dataPoints.length < 5) return null

    const prompt = this.buildTrendExplanationPrompt(signal, dataPoints)

    try {
      const { text, usage } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.7,
        maxTokens: 400,
      })

      const result = this.parseTrendExplanationResponse(text)

      await this.cacheAnalysis(signalId, "trend_explanation", cacheKey, result, usage?.totalTokens || 0)

      return {
        signalId,
        analysisType: "trend_explanation",
        result,
        tokenCost: usage?.totalTokens || 0,
        cached: false,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[AIAnalysisService] Error generating trend explanation:", error)
      return null
    }
  }

  /**
   * Get action recommendations
   */
  static async getActionRecommendations(signalId: string, forceRefresh = false): Promise<AIAnalysisResult | null> {
    const cacheKey = `action-${signalId}`

    if (!forceRefresh) {
      const cached = await this.getCachedAnalysis(signalId, "action_recommendation", cacheKey)
      if (cached) return cached
    }

    const supabase = await createClient()

    const { data: signal } = await supabase.from("signals").select("*").eq("id", signalId).single()

    if (!signal) return null

    // Get relationships
    const { data: relationships } = await supabase
      .from("signal_relationships")
      .select("*, signalB:signal_b_id(name)")
      .eq("signal_a_id", signalId)
      .eq("is_active", true)
      .limit(5)

    const prompt = this.buildActionRecommendationsPrompt(signal, relationships || [])

    try {
      const { text, usage } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.8,
        maxTokens: 600,
      })

      const result = this.parseActionRecommendationsResponse(text)

      await this.cacheAnalysis(signalId, "action_recommendation", cacheKey, result, usage?.totalTokens || 0)

      return {
        signalId,
        analysisType: "action_recommendation",
        result,
        tokenCost: usage?.totalTokens || 0,
        cached: false,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[AIAnalysisService] Error generating action recommendations:", error)
      return null
    }
  }

  /**
   * Batch analysis for multiple signals (cost-efficient)
   */
  static async batchAnalyze(signalIds: string[]): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = []

    // Process in parallel but limit concurrency
    const batchSize = 3
    for (let i = 0; i < signalIds.length; i += batchSize) {
      const batch = signalIds.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map((id) => this.getWhyAnalysis(id)))
      results.push(...batchResults.filter((r): r is AIAnalysisResult => r !== null))
    }

    return results
  }

  // Cache management
  private static async getCachedAnalysis(
    signalId: string,
    analysisType: string,
    cacheKey: string,
  ): Promise<AIAnalysisResult | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("ai_analysis_cache")
      .select("*")
      .eq("signal_id", signalId)
      .eq("analysis_type", analysisType)
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .order("generated_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    // Update hit count
    await supabase
      .from("ai_analysis_cache")
      .update({
        hit_count: (data.hit_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", data.id)

    return {
      signalId,
      analysisType: analysisType as any,
      result: data.analysis_result,
      tokenCost: data.token_cost || 0,
      cached: true,
      generatedAt: data.generated_at,
    }
  }

  private static async cacheAnalysis(
    signalId: string,
    analysisType: string,
    cacheKey: string,
    result: any,
    tokenCost: number,
  ): Promise<void> {
    const supabase = await createClient()

    // Cache for 7 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await supabase.from("ai_analysis_cache").insert({
      signal_id: signalId,
      analysis_type: analysisType,
      cache_key: cacheKey,
      analysis_result: result,
      token_cost: tokenCost,
      expires_at: expiresAt.toISOString(),
      api_provider: "openai",
    })
  }

  // Prompt builders
  private static buildWhyAnalysisPrompt(signal: any, dataPoints: any[]): string {
    const trend =
      dataPoints.length > 1 ? (dataPoints[0].value > dataPoints[1].value ? "increasing" : "decreasing") : "stable"
    const recentValues = dataPoints.slice(0, 10).map((d) => d.value)

    return `You are a business analyst. Analyze this signal and explain WHY it's changing.

Signal: ${signal.name}
Category: ${signal.category || "Unknown"}
Current Value: ${signal.current_value}
Previous Value: ${signal.previous_value}
Change: ${signal.change_percent}%
Trend: ${trend}
Recent Values: ${recentValues.join(", ")}

Provide a concise analysis with:
1. Summary: One sentence explanation of what's happening
2. Key Insights: 2-3 bullet points about potential causes
3. Confidence: Low/Medium/High based on data quality

Format your response as:
SUMMARY: [one sentence]
INSIGHTS:
- [insight 1]
- [insight 2]
CONFIDENCE: [Low/Medium/High]`
  }

  private static buildTrendExplanationPrompt(signal: any, dataPoints: any[]): string {
    const values = dataPoints.map((d) => ({ date: d.date, value: d.value }))

    return `Analyze the trend for this signal and explain the pattern.

Signal: ${signal.name}
Data Points (last 60 days): ${JSON.stringify(values.slice(0, 15))}

Provide:
1. Summary: Describe the overall trend pattern
2. Key Insights: 2-3 observations about the trend
3. Reasoning: Brief explanation of what might be driving this pattern

Format as:
SUMMARY: [one sentence]
INSIGHTS:
- [insight 1]
- [insight 2]
REASONING: [explanation]`
  }

  private static buildActionRecommendationsPrompt(signal: any, relationships: any[]): string {
    const relatedSignals = relationships.map((r) => r.signalB?.name || "Unknown").join(", ")

    return `Based on this signal's performance, provide actionable recommendations.

Signal: ${signal.name}
Status: ${signal.status || "Unknown"}
Benchmark: ${signal.benchmark_value || "Not set"}
Current Value: ${signal.current_value}
Related Signals: ${relatedSignals || "None"}

Provide:
1. Summary: Overall assessment
2. Recommendations: 3-4 specific actionable steps
3. Confidence: How confident are you in these recommendations

Format as:
SUMMARY: [assessment]
RECOMMENDATIONS:
- [action 1]
- [action 2]
- [action 3]
CONFIDENCE: [Low/Medium/High]`
  }

  // Response parsers
  private static parseWhyAnalysisResponse(text: string): any {
    const lines = text.split("\n")
    const result: any = {
      summary: "",
      keyInsights: [],
      confidence: undefined,
    }

    let currentSection = ""
    for (const line of lines) {
      if (line.startsWith("SUMMARY:")) {
        result.summary = line.replace("SUMMARY:", "").trim()
        currentSection = "summary"
      } else if (line.startsWith("INSIGHTS:")) {
        currentSection = "insights"
      } else if (line.startsWith("CONFIDENCE:")) {
        const conf = line.replace("CONFIDENCE:", "").trim().toLowerCase()
        result.confidence = conf === "high" ? 0.8 : conf === "medium" ? 0.6 : 0.4
        currentSection = ""
      } else if (line.trim().startsWith("-") && currentSection === "insights") {
        result.keyInsights.push(line.trim().substring(1).trim())
      }
    }

    return result
  }

  private static parseTrendExplanationResponse(text: string): any {
    const lines = text.split("\n")
    const result: any = {
      summary: "",
      keyInsights: [],
      reasoning: "",
    }

    let currentSection = ""
    for (const line of lines) {
      if (line.startsWith("SUMMARY:")) {
        result.summary = line.replace("SUMMARY:", "").trim()
      } else if (line.startsWith("INSIGHTS:")) {
        currentSection = "insights"
      } else if (line.startsWith("REASONING:")) {
        result.reasoning = line.replace("REASONING:", "").trim()
        currentSection = "reasoning"
      } else if (line.trim().startsWith("-") && currentSection === "insights") {
        result.keyInsights.push(line.trim().substring(1).trim())
      } else if (currentSection === "reasoning" && line.trim()) {
        result.reasoning += " " + line.trim()
      }
    }

    return result
  }

  private static parseActionRecommendationsResponse(text: string): any {
    const lines = text.split("\n")
    const result: any = {
      summary: "",
      recommendations: [],
      confidence: undefined,
    }

    let currentSection = ""
    for (const line of lines) {
      if (line.startsWith("SUMMARY:")) {
        result.summary = line.replace("SUMMARY:", "").trim()
      } else if (line.startsWith("RECOMMENDATIONS:")) {
        currentSection = "recommendations"
      } else if (line.startsWith("CONFIDENCE:")) {
        const conf = line.replace("CONFIDENCE:", "").trim().toLowerCase()
        result.confidence = conf === "high" ? 0.8 : conf === "medium" ? 0.6 : 0.4
      } else if (line.trim().startsWith("-") && currentSection === "recommendations") {
        result.recommendations.push(line.trim().substring(1).trim())
      }
    }

    return result
  }

  /**
   * Cleanup expired cache entries
   */
  static async cleanupExpiredCache(): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("ai_analysis_cache")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select()

    if (error) {
      console.error("[AIAnalysisService] Error cleaning up cache:", error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalCached: number
    hitRate: number
    totalTokensSaved: number
    byType: Record<string, number>
  }> {
    const supabase = await createClient()

    const { data } = await supabase.from("ai_analysis_cache").select("*").gt("expires_at", new Date().toISOString())

    if (!data) {
      return {
        totalCached: 0,
        hitRate: 0,
        totalTokensSaved: 0,
        byType: {},
      }
    }

    const totalHits = data.reduce((sum, entry) => sum + (entry.hit_count || 0), 0)
    const totalTokensSaved = data.reduce((sum, entry) => sum + (entry.token_cost || 0) * (entry.hit_count || 0), 0)

    const byType = data.reduce(
      (acc, entry) => {
        acc[entry.analysis_type] = (acc[entry.analysis_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalCached: data.length,
      hitRate: totalHits / Math.max(data.length, 1),
      totalTokensSaved,
      byType,
    }
  }
}
