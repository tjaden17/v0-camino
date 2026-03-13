import { createClient } from "@/lib/supabase/server"
import { SignalRelationshipsService } from "./signal-relationships-service"

export interface ImpactPrediction {
  signalId: string
  signalName: string
  predictedImpact: "positive" | "negative" | "neutral"
  impactScore: number // 0-10
  confidence: number // 0-1
  affectedKPIs: Array<{
    kpiId: string
    kpiName: string
    expectedChange: number // percentage
    reasoning: string
  }>
  affectedSignals: Array<{
    signalId: string
    signalName: string
    relationshipType: string
    expectedChange: number
    timeLag?: number
  }>
  recommendations: string[]
  calculatedAt: string
}

export interface KPIImpactMatrix {
  kpiId: string
  kpiName: string
  impactingSignals: Array<{
    signalId: string
    signalName: string
    currentValue: number
    change: number
    impactWeight: number
    direction: "positive" | "negative"
  }>
  overallHealth: "good" | "warning" | "critical"
  predictedTrend: "improving" | "declining" | "stable"
}

export class ImpactPredictionService {
  /**
   * Predict impact of a signal change on KPIs and other signals
   */
  static async predictImpact(signalId: string, hypotheticalChange?: number): Promise<ImpactPrediction | null> {
    const supabase = await createClient()

    // Get signal data
    const { data: signal } = await supabase.from("signals").select("*").eq("id", signalId).single()

    if (!signal) return null

    // Get relationships
    const relationships = await SignalRelationshipsService.getSignalRelationships(signalId)

    // Get user KPIs
    const { data: kpiOwnerships } = await supabase
      .from("kpi_ownership")
      .select(
        `
        *,
        signals(id, name, current_value, benchmark_value)
      `,
      )
      .eq("user_id", signal.user_id)

    const affectedSignals: any[] = []
    const affectedKPIs: any[] = []

    // Calculate impact on related signals
    for (const rel of relationships.filter((r) => r.signalAId === signalId)) {
      const impact = this.calculateSignalImpact(signal, rel, hypotheticalChange)
      if (impact) {
        affectedSignals.push(impact)
      }
    }

    // Calculate impact on KPIs
    if (kpiOwnerships) {
      for (const kpiOwnership of kpiOwnerships) {
        const kpiSignal = kpiOwnership.signals
        if (!kpiSignal) continue

        // Check if this signal affects the KPI
        const hasRelationship = relationships.some(
          (r) =>
            (r.signalAId === signalId && r.signalBId === kpiSignal.id) ||
            (r.signalBId === signalId && r.signalAId === kpiSignal.id),
        )

        if (hasRelationship) {
          const kpiImpact = this.calculateKPIImpact(signal, kpiSignal, hypotheticalChange)
          if (kpiImpact) {
            affectedKPIs.push(kpiImpact)
          }
        }
      }
    }

    // Determine overall impact
    const impactScore = this.calculateOverallImpactScore(signal, affectedSignals, affectedKPIs)
    const predictedImpact = impactScore > 5 ? "positive" : impactScore < -5 ? "negative" : "neutral"

    // Generate recommendations
    const recommendations = this.generateRecommendations(signal, affectedSignals, affectedKPIs, impactScore)

    return {
      signalId: signal.id,
      signalName: signal.name,
      predictedImpact,
      impactScore: Math.abs(impactScore),
      confidence: this.calculateConfidence(relationships.length, kpiOwnerships?.length || 0),
      affectedKPIs,
      affectedSignals,
      recommendations,
      calculatedAt: new Date().toISOString(),
    }
  }

  /**
   * Generate KPI impact matrix for a user
   */
  static async generateKPIImpactMatrix(userId: string): Promise<KPIImpactMatrix[]> {
    const supabase = await createClient()

    // Get user's KPIs
    const { data: kpiOwnerships } = await supabase
      .from("kpi_ownership")
      .select(
        `
        *,
        signals(*)
      `,
      )
      .eq("user_id", userId)
      .eq("is_primary", true)
      .order("priority", { ascending: false })

    if (!kpiOwnerships || kpiOwnerships.length === 0) {
      return []
    }

    const matrices: KPIImpactMatrix[] = []

    for (const kpi of kpiOwnerships) {
      const kpiSignal = kpi.signals
      if (!kpiSignal) continue

      // Find all signals that impact this KPI
      const { data: relationships } = await supabase
        .from("signal_relationships")
        .select(
          `
          *,
          signalA:signal_a_id(id, name, current_value, change_percent, category)
        `,
        )
        .eq("signal_b_id", kpiSignal.id)
        .eq("is_active", true)
        .gte("confidence_score", 0.6)

      const impactingSignals: any[] = []

      if (relationships) {
        for (const rel of relationships) {
          const signalA = rel.signalA
          if (!signalA) continue

          // Calculate impact weight based on relationship strength
          const impactWeight = rel.confidence_score * (rel.relationship_type === "causes" ? 1.5 : 1.0)

          // Determine direction
          const direction = this.determineImpactDirection(rel.relationship_type, signalA.change_percent)

          impactingSignals.push({
            signalId: signalA.id,
            signalName: signalA.name,
            currentValue: signalA.current_value,
            change: signalA.change_percent,
            impactWeight,
            direction,
          })
        }
      }

      // Determine overall health
      const overallHealth = this.assessKPIHealth(kpiSignal, impactingSignals)
      const predictedTrend = this.predictKPITrend(impactingSignals)

      matrices.push({
        kpiId: kpiSignal.id,
        kpiName: kpiSignal.name,
        impactingSignals,
        overallHealth,
        predictedTrend,
      })
    }

    return matrices
  }

  /**
   * Predict what happens if a signal reaches a target value
   */
  static async simulateTargetScenario(signalId: string, targetValue: number): Promise<any> {
    const supabase = await createClient()

    const { data: signal } = await supabase.from("signals").select("*").eq("id", signalId).single()

    if (!signal) return null

    const currentValue = signal.current_value || 0
    const percentageChange = ((targetValue - currentValue) / currentValue) * 100

    return await this.predictImpact(signalId, percentageChange)
  }

  // Helper methods
  private static calculateSignalImpact(signal: any, relationship: any, hypotheticalChange?: number): any {
    const change = hypotheticalChange || signal.change_percent || 0

    // Estimate impact based on relationship strength and type
    let expectedChange = change * relationship.confidenceScore

    if (relationship.relationshipType === "causes" || relationship.relationshipType === "leads_to") {
      expectedChange *= 0.8 // Causal relationships have stronger impact
    } else {
      expectedChange *= 0.5 // Correlations have weaker impact
    }

    return {
      signalId: relationship.signalBId,
      signalName: relationship.signalBName,
      relationshipType: relationship.relationshipType,
      expectedChange: Math.round(expectedChange * 10) / 10,
      timeLag: relationship.timeLagDays,
    }
  }

  private static calculateKPIImpact(signal: any, kpiSignal: any, hypotheticalChange?: number): any {
    const change = hypotheticalChange || signal.change_percent || 0

    // Simple linear impact model
    const impactMultiplier = 0.6
    const expectedChange = change * impactMultiplier

    let reasoning = ""
    if (expectedChange > 0) {
      reasoning = `As ${signal.name} increases, ${kpiSignal.name} is expected to increase proportionally`
    } else if (expectedChange < 0) {
      reasoning = `As ${signal.name} decreases, ${kpiSignal.name} is expected to decrease`
    } else {
      reasoning = `Current ${signal.name} changes are unlikely to significantly impact ${kpiSignal.name}`
    }

    return {
      kpiId: kpiSignal.id,
      kpiName: kpiSignal.name,
      expectedChange: Math.round(expectedChange * 10) / 10,
      reasoning,
    }
  }

  private static calculateOverallImpactScore(signal: any, affectedSignals: any[], affectedKPIs: any[]): number {
    let score = 0

    // Weight KPI impacts more heavily
    for (const kpi of affectedKPIs) {
      score += kpi.expectedChange * 2
    }

    // Add signal impacts
    for (const sig of affectedSignals) {
      score += sig.expectedChange
    }

    // Normalize to -10 to +10 scale
    const normalizedScore = Math.max(
      -10,
      Math.min(10, score / Math.max(affectedSignals.length + affectedKPIs.length, 1)),
    )

    return Math.round(normalizedScore * 10) / 10
  }

  private static calculateConfidence(relationshipCount: number, kpiCount: number): number {
    // More relationships and KPIs = higher confidence
    const relationshipFactor = Math.min(relationshipCount / 5, 1) * 0.6
    const kpiFactor = Math.min(kpiCount / 3, 1) * 0.4

    return Math.min(relationshipFactor + kpiFactor, 1)
  }

  private static generateRecommendations(
    signal: any,
    affectedSignals: any[],
    affectedKPIs: any[],
    impactScore: number,
  ): string[] {
    const recommendations: string[] = []

    if (impactScore > 5) {
      recommendations.push(
        "This signal is trending positively. Consider documenting what's working to replicate success.",
      )
      if (affectedKPIs.length > 0) {
        recommendations.push(`Positive impact expected on ${affectedKPIs.length} KPI(s). Monitor closely to confirm.`)
      }
    } else if (impactScore < -5) {
      recommendations.push("This signal is declining and may negatively impact your KPIs. Investigate root causes.")
      recommendations.push("Consider setting up alerts to catch similar issues earlier in the future.")
    } else {
      recommendations.push("Signal is stable. Continue monitoring for any changes.")
    }

    if (affectedSignals.length > 0) {
      recommendations.push(
        `Changes will likely ripple to ${affectedSignals.length} related signal(s) within ${affectedSignals[0].timeLag || "a few"} days.`,
      )
    }

    return recommendations
  }

  private static determineImpactDirection(relationshipType: string, change: number): "positive" | "negative" {
    if (relationshipType === "affected_by") {
      return change > 0 ? "negative" : "positive"
    }
    return change > 0 ? "positive" : "negative"
  }

  private static assessKPIHealth(kpiSignal: any, impactingSignals: any[]): "good" | "warning" | "critical" {
    // Compare current value to benchmark
    if (kpiSignal.benchmark_value) {
      const deviation = ((kpiSignal.current_value - kpiSignal.benchmark_value) / kpiSignal.benchmark_value) * 100

      if (deviation < -20) return "critical"
      if (deviation < -10) return "warning"
    }

    // Check if impacting signals are mostly negative
    const negativeCount = impactingSignals.filter((s) => s.direction === "negative").length
    const positiveCount = impactingSignals.filter((s) => s.direction === "positive").length

    if (negativeCount > positiveCount * 2) return "warning"

    return "good"
  }

  private static predictKPITrend(impactingSignals: any[]): "improving" | "declining" | "stable" {
    if (impactingSignals.length === 0) return "stable"

    const weightedSum = impactingSignals.reduce((sum, signal) => {
      const direction = signal.direction === "positive" ? 1 : -1
      return sum + direction * signal.impactWeight * signal.change
    }, 0)

    if (weightedSum > 5) return "improving"
    if (weightedSum < -5) return "declining"
    return "stable"
  }
}
