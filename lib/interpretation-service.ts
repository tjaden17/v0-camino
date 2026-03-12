/**
 * Signal Interpretation Service
 * 
 * Generates AI-powered interpretations for signals following the
 * 5-section framework in a single unified AI call:
 * 1. What We Found (factual data)
 * 2. What It Means (interpretation)
 * 3. So What (business impact)
 * 4. Opportunities (positive scenarios)
 * 5. Risks (negative scenarios)
 */

import { createAdminClient } from "@/lib/supabase/admin"
import { generateText } from "ai"
import { getSignalDataPoints } from "@/lib/data-points-service"

// Interpretation structure matching the new 5-section spec
export interface SignalInterpretation {
  id?: string
  signal_id: string
  period: string
  what_we_found: {
    absolute_value: string
    trend: string
    data_sources_connected: string[]
    data_sources_recommended: string[]
    sample_size: number
    time_period: string
    signal_consistency: "high" | "medium" | "low"
  }
  what_it_means: {
    why_change_happened: string
    benchmark: string
    why_analysis: string
    scope_customers: string
    scope_revenue: string
  }
  so_what: {
    direction: "positive" | "negative" | "neutral"
    expected_vs_unexpected: string
    kpi_impact: string
  }
  opportunities: {
    description: string
    potential_impact: string
    action_items: string[]
  }
  risks: {
    description: string
    potential_impact: string
    mitigation_steps: string[]
  }
  generated_at: string
  stale: boolean
}

export interface InterpretationGenerationResult {
  interpretation: SignalInterpretation
  prompt: string
  rawOutput: any
  tokenCost: number
  cached: boolean
}

/**
 * Get or generate interpretation for a signal
 */
export async function getOrGenerateInterpretation(
  signalId: string,
  period?: string,
  forceRefresh = false
): Promise<SignalInterpretation | null> {
  const result = await getInterpretation(signalId, forceRefresh)
  return result?.interpretation || null
}

export async function getInterpretation(
  signalId: string,
  forceRefresh = false
): Promise<InterpretationGenerationResult | null> {
  const supabase = createAdminClient()

  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from("signal_interpretations")
      .select("*")
      .eq("signal_id", signalId)
      .eq("stale", false)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cached) {
      return {
        interpretation: cached as SignalInterpretation,
        prompt: "",
        rawOutput: null,
        tokenCost: 0,
        cached: true,
      }
    }
  }

  // Generate new interpretation
  return generateInterpretation(signalId)
}

/**
 * Generate a new interpretation for a signal
 */
export async function generateInterpretation(
  signalId: string
): Promise<InterpretationGenerationResult | null> {
  const supabase = createAdminClient()

  // Fetch signal data
  const { data: signal, error: signalError } = await supabase
    .from("signals")
    .select("*")
    .eq("id", signalId)
    .single()

  if (signalError || !signal) {
    console.error("[v0] Signal not found:", signalId)
    return null
  }

  // Fetch recent data points from Neon signal_data_points
  const dataPoints = await getSignalDataPoints(signalId, { limit: 90 })

  if (dataPoints.length < 2) {
    console.error("[v0] Insufficient data points for signal:", signalId)
    return null
  }

  // Fetch related signals for context
  const { data: relatedSignals } = await supabase
    .from("signal_relationships")
    .select(`
      correlation_strength,
      relationship_type,
      signalB:signal_b_id(name, category)
    `)
    .eq("signal_a_id", signalId)
    .eq("is_active", true)
    .order("correlation_strength", { ascending: false })
    .limit(5)

  // Calculate metrics for prompt
  const latestValue = dataPoints[0].value
  const previousValue = dataPoints[1].value
  const changePercent = previousValue !== 0 
    ? ((latestValue - previousValue) / previousValue) * 100 
    : 0
  
  // Determine trend direction
  const recentTrend = calculateTrendDirection(dataPoints.slice(0, 7))
  
  // Calculate consistency
  const consistency = calculateConsistency(dataPoints)

  // Build the prompt
  const prompt = buildInterpretationPrompt({
    signal,
    dataPoints,
    latestValue,
    previousValue,
    changePercent,
    recentTrend,
    consistency,
    relatedSignals: relatedSignals || [],
  })

  try {
    const { text, usage } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    const parsedOutput = parseInterpretationResponse(text)
    
    // Build interpretation object
    const currentPeriod = new Date().toISOString().slice(0, 7) + "-W" + getWeekNumber(new Date())
    
    const interpretation: SignalInterpretation = {
      signal_id: signalId,
      period: currentPeriod,
      what_we_found: {
        absolute_value: `${latestValue} ${signal.unit || ""}`.trim(),
        trend: `${recentTrend} for ${countTrendDuration(dataPoints)} weeks`,
        data_sources_connected: [signal.source_type || "Manual Upload"],
        data_sources_recommended: getRecommendedSources(signal.category),
        sample_size: dataPoints.length,
        time_period: `${dataPoints[dataPoints.length - 1].date} to ${dataPoints[0].date}`,
        signal_consistency: consistency,
      },
      what_it_means: {
        why_change_happened: parsedOutput.whyChange || "Analysis pending",
        benchmark: parsedOutput.benchmark || compareToBenchmark(latestValue, signal.benchmark_value),
        why_analysis: parsedOutput.whyAnalysis || "Pattern analysis in progress",
        scope_customers: parsedOutput.scopeCustomers || "Scope analysis pending",
        scope_revenue: parsedOutput.scopeRevenue || "Revenue impact pending",
      },
      so_what: {
        direction: determineDirection(changePercent, signal.good_direction),
        expected_vs_unexpected: parsedOutput.expectedVsUnexpected || "Variance analysis pending",
        kpi_impact: parsedOutput.kpiImpact || "KPI impact assessment pending",
      },
      opportunities: {
        description: (Array.isArray(parsedOutput.opportunities) && parsedOutput.opportunities.length > 0) 
          ? parsedOutput.opportunities[0] 
          : "Opportunities assessment pending",
        potential_impact: (Array.isArray(parsedOutput.opportunities) && parsedOutput.opportunities.length > 1) 
          ? parsedOutput.opportunities[1] 
          : "Impact analysis pending",
        action_items: (Array.isArray(parsedOutput.opportunities) && parsedOutput.opportunities.length > 2) 
          ? parsedOutput.opportunities.slice(2) 
          : [],
      },
      risks: {
        description: (Array.isArray(parsedOutput.risks) && parsedOutput.risks.length > 0) 
          ? parsedOutput.risks[0] 
          : "Risk assessment pending",
        potential_impact: (Array.isArray(parsedOutput.risks) && parsedOutput.risks.length > 1) 
          ? parsedOutput.risks[1] 
          : "Impact assessment pending",
        mitigation_steps: (Array.isArray(parsedOutput.risks) && parsedOutput.risks.length > 2) 
          ? parsedOutput.risks.slice(2) 
          : [],
      },
      generated_at: new Date().toISOString(),
      stale: false,
    }

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from("signal_interpretations")
      .insert(interpretation)
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving interpretation:", saveError)
    }

    return {
      interpretation: saved || interpretation,
      prompt,
      rawOutput: parsedOutput,
      tokenCost: usage?.totalTokens || 0,
      cached: false,
    }
  } catch (error) {
    console.error("[v0] Error generating interpretation:", error)
    return null
  }
}

/**
 * Mark interpretations as stale when new data is uploaded
 */
export async function markInterpretationsStale(signalIds: string[]): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from("signal_interpretations")
    .update({ stale: true })
    .in("signal_id", signalIds)
}

/**
 * Regenerate stale interpretations (called by cron job)
 */
export async function regenerateStaleInterpretations(): Promise<number> {
  const supabase = createAdminClient()

  // Find stale interpretations
  const { data: staleSignals } = await supabase
    .from("signal_interpretations")
    .select("signal_id")
    .eq("stale", true)
    .limit(10) // Process in batches

  if (!staleSignals || staleSignals.length === 0) {
    return 0
  }

  // Regenerate each
  const results = await Promise.allSettled(
    staleSignals.map((s) => generateInterpretation(s.signal_id))
  )

  const successful = results.filter((r) => r.status === "fulfilled" && r.value !== null).length
  console.log(`[v0] Regenerated ${successful} / ${staleSignals.length} interpretations`)

  return successful
}

// Helper functions

function buildInterpretationPrompt(context: {
  signal: any
  dataPoints: { value: number; date: string }[]
  latestValue: number
  previousValue: number
  changePercent: number
  recentTrend: string
  consistency: "high" | "medium" | "low"
  relatedSignals: any[]
}): string {
  const { signal, dataPoints, latestValue, previousValue, changePercent, recentTrend, consistency, relatedSignals } = context

  const relatedContext = relatedSignals.length > 0
    ? `Related signals: ${relatedSignals.map((r) => `${r.signalB?.name} (${r.relationship_type})`).join(", ")}`
    : "No related signals identified yet"

  return `You are a business analyst helping executives understand their metrics. Analyze this signal and provide comprehensive insights covering all key dimensions.

SIGNAL: ${signal.name}
Category: ${signal.category || "General"}
Current Value: ${latestValue}${signal.unit ? ` ${signal.unit}` : ""}
Previous Value: ${previousValue}${signal.unit ? ` ${signal.unit}` : ""}
Change: ${changePercent.toFixed(1)}%
Recent Trend: ${recentTrend}
Consistency: ${consistency}
Benchmark: ${signal.benchmark_value || "Not set"}
Good Direction: ${signal.good_direction || "up"} is better

Recent Data (last 7 points): ${dataPoints.slice(0, 7).map((d) => `${d.date}: ${d.value}`).join(", ")}

${relatedContext}

Provide a comprehensive interpretation in this exact format, addressing all 5 dimensions:

WHAT_WE_FOUND: [One sentence stating the current state and trend]

WHAT_IT_MEANS: [2-3 sentences explaining WHY this metric is changing and how it compares to benchmarks]

SO_WHAT: [2-3 sentences on business impact - which KPIs are affected, is this expected, what's the severity?]

OPPORTUNITIES: [2-3 specific, actionable opportunities to capitalize on positive trends or reach targets. Format as bullet points starting with "-"]

RISKS: [2-3 specific risks if trends continue or if action isn't taken. Format as bullet points starting with "-"]

Be specific, data-driven, and focus on actionable insights. Avoid generic statements.`
}

function parseInterpretationResponse(text: string): {
  whyChange?: string
  benchmark?: string
  whyAnalysis?: string
  scopeCustomers?: string
  scopeRevenue?: string
  expectedVsUnexpected?: string
  kpiImpact?: string
  opportunities?: string[]
  risks?: string[]
} {
  const lines = text.split("\n")
  const result: Record<string, string | string[]> = {}

  let currentSection = ""
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith("WHAT_WE_FOUND:")) {
      if (currentSection && currentContent.length > 0) {
        result[currentSection] = currentContent.join(" ").trim()
      }
      currentSection = "whyChange"
      currentContent = [trimmed.replace("WHAT_WE_FOUND:", "").trim()]
    } else if (trimmed.startsWith("WHAT_IT_MEANS:")) {
      if (currentSection && currentContent.length > 0) {
        result[currentSection] = currentContent.join(" ").trim()
      }
      currentSection = "whyAnalysis"
      currentContent = [trimmed.replace("WHAT_IT_MEANS:", "").trim()]
    } else if (trimmed.startsWith("SO_WHAT:")) {
      if (currentSection && currentContent.length > 0) {
        result[currentSection] = currentContent.join(" ").trim()
      }
      currentSection = "kpiImpact"
      currentContent = [trimmed.replace("SO_WHAT:", "").trim()]
    } else if (trimmed.startsWith("OPPORTUNITIES:")) {
      if (currentSection && currentContent.length > 0) {
        result[currentSection] = currentContent.join(" ").trim()
      }
      currentSection = "opportunities"
      currentContent = [trimmed.replace("OPPORTUNITIES:", "").trim()]
    } else if (trimmed.startsWith("RISKS:")) {
      if (currentSection && currentContent.length > 0) {
        if (currentSection === "opportunities") {
          result[currentSection] = currentContent.filter(l => l).map(l => l.replace(/^-\s*/, ""))
        } else {
          result[currentSection] = currentContent.join(" ").trim()
        }
      }
      currentSection = "risks"
      currentContent = [trimmed.replace("RISKS:", "").trim()]
    } else if (trimmed && (trimmed.startsWith("-") || currentSection)) {
      currentContent.push(trimmed)
    }
  }

  // Process last section
  if (currentSection && currentContent.length > 0) {
    if (currentSection === "opportunities" || currentSection === "risks") {
      result[currentSection] = currentContent.filter(l => l).map(l => l.replace(/^-\s*/, ""))
    } else {
      result[currentSection] = currentContent.join(" ").trim()
    }
  }

  return result as any
}

function calculateTrendDirection(dataPoints: { value: number; date: string }[]): string {
  if (dataPoints.length < 2) return "stable"
  
  const first = dataPoints[dataPoints.length - 1].value
  const last = dataPoints[0].value
  const change = ((last - first) / first) * 100

  if (change > 5) return "up"
  if (change < -5) return "down"
  return "stable"
}

function countTrendDuration(dataPoints: { value: number; date: string }[]): number {
  if (dataPoints.length < 2) return 1

  let direction = dataPoints[0].value >= dataPoints[1].value ? "up" : "down"
  let count = 1

  for (let i = 1; i < dataPoints.length - 1; i++) {
    const currentDirection = dataPoints[i].value >= dataPoints[i + 1].value ? "up" : "down"
    if (currentDirection === direction) {
      count++
    } else {
      break
    }
  }

  return Math.min(count, 12) // Cap at 12 weeks
}

function calculateConsistency(dataPoints: { value: number; date: string }[]): "high" | "medium" | "low" {
  if (dataPoints.length < 5) return "medium"

  const values = dataPoints.map((d) => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = (stdDev / mean) * 100

  if (coefficientOfVariation < 10) return "high"
  if (coefficientOfVariation < 25) return "medium"
  return "low"
}

function getRecommendedSources(category: string | null): string[] {
  const recommendations: Record<string, string[]> = {
    "Customer Service": ["Zoho Desk", "Zendesk", "Freshdesk"],
    "Sales": ["HubSpot CRM", "Zoho CRM", "Salesforce"],
    "Marketing": ["Google Analytics", "HubSpot Marketing"],
    "Finance": ["QuickBooks", "Xero", "Spreadsheets"],
  }

  return recommendations[category || ""] || ["CSV Import", "Manual Entry"]
}

function compareToBenchmark(value: number, benchmark: number | null): string {
  if (!benchmark) return "No benchmark set for comparison"
  
  const diff = ((value - benchmark) / benchmark) * 100
  if (diff > 10) return `${Math.abs(diff).toFixed(0)}% above target`
  if (diff < -10) return `${Math.abs(diff).toFixed(0)}% below target`
  return "On target"
}

function determineDirection(changePercent: number, goodDirection: string | null): "positive" | "negative" | "neutral" {
  const isUp = changePercent > 0
  const upIsGood = goodDirection === "up" || goodDirection === null

  if (Math.abs(changePercent) < 5) return "neutral"
  if (upIsGood) return isUp ? "positive" : "negative"
  return isUp ? "negative" : "positive"
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
}
