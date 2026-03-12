// Smart signal detection and prioritization
// Works with or without user-defined KPIs

export interface SignalScore {
  signalId: string
  relevanceScore: number // 0-100
  urgencyScore: number // 0-100
  impactScore: number // 0-100
  overallScore: number // weighted average
  reasons: string[] // Why this signal matters
}

export class SignalIntelligence {
  calculateSignalImportance(
    signal: any,
    userKPIs: string[],
    orgContext: { industry?: string; size?: string } = {},
  ): SignalScore {
    const scores = {
      signalId: signal.id || signal.name,
      relevanceScore: 0,
      urgencyScore: 0,
      impactScore: 0,
      overallScore: 0,
      reasons: [] as string[],
    }

    // 1. KPI Relevance (if KPIs are set)
    if (userKPIs && userKPIs.length > 0) {
      scores.relevanceScore += this.calculateKPIRelevance(signal, userKPIs, scores.reasons)
    } else {
      // Default relevance based on category importance
      scores.relevanceScore += this.calculateCategoryImportance(signal.category, scores.reasons)
    }

    // 2. Urgency (based on trends and benchmarks)
    scores.urgencyScore = this.calculateUrgency(signal, scores.reasons)

    // 3. Impact (based on value magnitude and business context)
    scores.impactScore = this.calculateImpact(signal, orgContext, scores.reasons)

    // Weighted average: Relevance 30%, Urgency 35%, Impact 35%
    scores.overallScore = scores.relevanceScore * 0.3 + scores.urgencyScore * 0.35 + scores.impactScore * 0.35

    return scores
  }

  private calculateKPIRelevance(signal: any, userKPIs: string[], reasons: string[]): number {
    let score = 0
    const relatedKPIs = signal.metadata?.relatedKPIs || []
    const kpiTags = signal.metadata?.kpiTags || []

    for (const userKPI of userKPIs) {
      const lowerKPI = userKPI.toLowerCase()

      // Direct match in signal name
      if (signal.name.toLowerCase().includes(lowerKPI)) {
        score += 35
        reasons.push(`Directly matches your KPI: ${userKPI}`)
        break
      }

      // Match in related KPIs
      const hasRelatedMatch = relatedKPIs.some((related: string) => related.toLowerCase().includes(lowerKPI))
      if (hasRelatedMatch) {
        score += 25
        reasons.push(`Related to your KPI: ${userKPI}`)
      }

      // Match in tags
      const hasTagMatch = kpiTags.some((tag: string) => tag.toLowerCase().includes(lowerKPI))
      if (hasTagMatch) {
        score += 20
        reasons.push(`Tagged with: ${userKPI}`)
      }
    }

    return Math.min(score, 100)
  }

  private calculateCategoryImportance(category: string, reasons: string[]): number {
    const categoryScores: Record<string, { score: number; reason: string }> = {
      sales: { score: 90, reason: "Revenue-generating activity" },
      finance: { score: 85, reason: "Financial health indicator" },
      support: { score: 75, reason: "Customer satisfaction metric" },
      operations: { score: 70, reason: "Operational efficiency" },
      marketing: { score: 65, reason: "Growth and acquisition" },
      product: { score: 60, reason: "Product performance" },
      custom: { score: 50, reason: "Custom business metric" },
    }

    const categoryInfo = categoryScores[category] || categoryScores.custom
    reasons.push(categoryInfo.reason)
    return categoryInfo.score
  }

  private calculateUrgency(signal: any, reasons: string[]): number {
    let score = 0

    // Priority flag
    if (signal.priority === "high") {
      score += 40
      reasons.push("Flagged as high priority")
    } else if (signal.priority === "medium") {
      score += 20
    }

    // Negative trend
    if (signal.trend === "decreasing") {
      score += 30
      reasons.push("Declining trend detected")
    }

    // Below benchmark
    if (signal.benchmark_value && signal.current_value) {
      const percentOfBenchmark = (signal.current_value / signal.benchmark_value) * 100

      if (percentOfBenchmark < 70) {
        score += 40
        reasons.push(`Significantly below target (${percentOfBenchmark.toFixed(0)}%)`)
      } else if (percentOfBenchmark < 90) {
        score += 25
        reasons.push(`Below target (${percentOfBenchmark.toFixed(0)}%)`)
      }
    }

    // Recent activity (check updated_at)
    if (signal.updated_at) {
      const daysSinceUpdate = (Date.now() - new Date(signal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate < 7) {
        score += 15
        reasons.push("Recently updated")
      }
    }

    return Math.min(score, 100)
  }

  private calculateImpact(signal: any, orgContext: any, reasons: string[]): number {
    let score = 0

    // High-value metrics
    const highValueKeywords = ["revenue", "profit", "cost", "conversion", "churn", "retention"]
    const hasHighValueKeyword = highValueKeywords.some((keyword) => signal.name.toLowerCase().includes(keyword))

    if (hasHighValueKeyword) {
      score += 35
      reasons.push("High-impact business metric")
    }

    // Value magnitude (if it's a monetary value)
    if (signal.current_value && signal.metadata?.unit === "$") {
      if (signal.current_value > 100000) {
        score += 30
        reasons.push("High monetary value")
      } else if (signal.current_value > 10000) {
        score += 20
      }
    }

    // Number of affected users/customers (from metadata)
    const affectedCount = signal.metadata?.affected_count || 0
    if (affectedCount > 100) {
      score += 25
      reasons.push(`Affects ${affectedCount}+ users/customers`)
    } else if (affectedCount > 10) {
      score += 15
    }

    // Critical business functions
    const criticalKeywords = ["customer", "payment", "security", "compliance"]
    const isCritical = criticalKeywords.some((keyword) => signal.name.toLowerCase().includes(keyword))
    if (isCritical) {
      score += 20
      reasons.push("Critical business function")
    }

    return Math.min(score, 100)
  }

  generateSmartCategories(): { id: string; name: string; description: string; priority: number }[] {
    return [
      {
        id: "revenue-health",
        name: "Revenue Health",
        description: "Sales performance, deal pipeline, and revenue trends",
        priority: 1,
      },
      {
        id: "customer-satisfaction",
        name: "Customer Satisfaction",
        description: "Support quality, response times, and CSAT scores",
        priority: 2,
      },
      {
        id: "operational-efficiency",
        name: "Operational Efficiency",
        description: "Process performance, resource utilization, and productivity",
        priority: 3,
      },
      {
        id: "growth-indicators",
        name: "Growth Indicators",
        description: "Lead generation, conversion rates, and market expansion",
        priority: 4,
      },
      {
        id: "risk-alerts",
        name: "Risk Alerts",
        description: "Declining metrics, missed targets, and potential issues",
        priority: 5,
      },
    ]
  }

  categorizeSignal(signal: any): string {
    const name = signal.name.toLowerCase()
    const category = signal.category.toLowerCase()

    if (
      name.includes("revenue") ||
      name.includes("deal") ||
      name.includes("sales") ||
      category === "sales" ||
      category === "finance"
    ) {
      return "revenue-health"
    }

    if (
      name.includes("satisfaction") ||
      name.includes("support") ||
      name.includes("ticket") ||
      name.includes("csat") ||
      category === "support"
    ) {
      return "customer-satisfaction"
    }

    if (
      name.includes("efficiency") ||
      name.includes("productivity") ||
      name.includes("utilization") ||
      category === "operations"
    ) {
      return "operational-efficiency"
    }

    if (
      name.includes("lead") ||
      name.includes("conversion") ||
      name.includes("acquisition") ||
      category === "marketing"
    ) {
      return "growth-indicators"
    }

    // Risk signals: anything below benchmark or declining
    if (signal.priority === "high" || signal.trend === "decreasing") {
      return "risk-alerts"
    }

    return "operational-efficiency" // default
  }
}
