import { createClient } from "@/lib/supabase/server"

export interface SignalRelationship {
  id: string
  signalAId: string
  signalBId: string
  signalAName?: string
  signalBName?: string
  relationshipType: "causes" | "correlates" | "impacts" | "leads_to" | "affected_by"
  confidenceScore: number
  timeLagDays?: number
  evidenceType: "statistical" | "user_defined" | "ai_detected" | "domain_knowledge"
  evidenceData?: any
  detectedAt: string
  verifiedBy?: string
  verifiedAt?: string
  isActive: boolean
}

export interface RelationshipChain {
  signals: Array<{
    id: string
    name: string
    value?: number
    change?: number
  }>
  relationships: Array<{
    from: string
    to: string
    type: string
    confidence: number
  }>
  totalConfidence: number
}

export class SignalRelationshipsService {
  /**
   * Detect statistical correlations between signals
   */
  static async detectCorrelations(userId: string): Promise<SignalRelationship[]> {
    const supabase = await createClient()

    // Get all signals for user
    const { data: signals } = await supabase.from("signals").select("id, name, category").eq("user_id", userId)

    if (!signals || signals.length < 2) {
      return []
    }

    const relationships: SignalRelationship[] = []

    // Compare each pair of signals
    for (let i = 0; i < signals.length; i++) {
      for (let j = i + 1; j < signals.length; j++) {
        const signalA = signals[i]
        const signalB = signals[j]

        // Get data points for both signals
        const { data: dataA } = await supabase
          .from("data_points")
          .select("date, value")
          .eq("signal_id", signalA.id)
          .order("date", { ascending: true })

        const { data: dataB } = await supabase
          .from("data_points")
          .select("date, value")
          .eq("signal_id", signalB.id)
          .order("date", { ascending: true })

        if (!dataA || !dataB || dataA.length < 3 || dataB.length < 3) continue

        // Check for correlation
        const correlation = this.calculateCorrelation(dataA, dataB)

        if (Math.abs(correlation.coefficient) > 0.6) {
          // Strong correlation found
          const relationship: SignalRelationship = {
            id: `${signalA.id}-${signalB.id}`,
            signalAId: signalA.id,
            signalBId: signalB.id,
            signalAName: signalA.name,
            signalBName: signalB.name,
            relationshipType: this.inferRelationshipType(signalA, signalB, correlation.coefficient > 0),
            confidenceScore: Math.abs(correlation.coefficient),
            timeLagDays: correlation.lag,
            evidenceType: "statistical",
            evidenceData: {
              correlationCoefficient: correlation.coefficient,
              sampleSize: Math.min(dataA.length, dataB.length),
            },
            detectedAt: new Date().toISOString(),
            isActive: true,
          }

          relationships.push(relationship)
        }
      }
    }

    return relationships
  }

  /**
   * Save detected relationships to database
   */
  static async saveRelationships(relationships: SignalRelationship[]): Promise<number> {
    const supabase = await createClient()

    let savedCount = 0

    for (const rel of relationships) {
      const { error } = await supabase.from("signal_relationships").upsert(
        {
          signal_a_id: rel.signalAId,
          signal_b_id: rel.signalBId,
          relationship_type: rel.relationshipType,
          confidence_score: rel.confidenceScore,
          time_lag_days: rel.timeLagDays,
          evidence_type: rel.evidenceType,
          evidence_data: rel.evidenceData,
          detected_at: rel.detectedAt,
          is_active: rel.isActive,
        },
        {
          onConflict: "signal_a_id,signal_b_id,relationship_type",
        },
      )

      if (!error) savedCount++
    }

    return savedCount
  }

  /**
   * Get all relationships for a signal
   */
  static async getSignalRelationships(signalId: string): Promise<SignalRelationship[]> {
    const supabase = await createClient()

    const { data: outgoing } = await supabase
      .from("signal_relationships")
      .select(
        `
        *,
        signalA:signal_a_id(name),
        signalB:signal_b_id(name)
      `,
      )
      .eq("signal_a_id", signalId)
      .eq("is_active", true)

    const { data: incoming } = await supabase
      .from("signal_relationships")
      .select(
        `
        *,
        signalA:signal_a_id(name),
        signalB:signal_b_id(name)
      `,
      )
      .eq("signal_b_id", signalId)
      .eq("is_active", true)

    const relationships: SignalRelationship[] = []

    if (outgoing) {
      relationships.push(
        ...outgoing.map((rel: any) => ({
          id: rel.id,
          signalAId: rel.signal_a_id,
          signalBId: rel.signal_b_id,
          signalAName: rel.signalA?.name,
          signalBName: rel.signalB?.name,
          relationshipType: rel.relationship_type,
          confidenceScore: rel.confidence_score,
          timeLagDays: rel.time_lag_days,
          evidenceType: rel.evidence_type,
          evidenceData: rel.evidence_data,
          detectedAt: rel.detected_at,
          verifiedBy: rel.verified_by,
          verifiedAt: rel.verified_at,
          isActive: rel.is_active,
        })),
      )
    }

    if (incoming) {
      relationships.push(
        ...incoming.map((rel: any) => ({
          id: rel.id,
          signalAId: rel.signal_a_id,
          signalBId: rel.signal_b_id,
          signalAName: rel.signalA?.name,
          signalBName: rel.signalB?.name,
          relationshipType: rel.relationship_type,
          confidenceScore: rel.confidence_score,
          timeLagDays: rel.time_lag_days,
          evidenceType: rel.evidence_type,
          evidenceData: rel.evidence_data,
          detectedAt: rel.detected_at,
          verifiedBy: rel.verified_by,
          verifiedAt: rel.verified_at,
          isActive: rel.is_active,
        })),
      )
    }

    return relationships
  }

  /**
   * Find relationship chains (e.g., A → B → C)
   */
  static async findRelationshipChains(startSignalId: string, maxDepth = 3): Promise<RelationshipChain[]> {
    const supabase = await createClient()

    const chains: RelationshipChain[] = []
    const visited = new Set<string>()

    // Get signal data
    const { data: startSignal } = await supabase.from("signals").select("*").eq("id", startSignalId).single()

    if (!startSignal) return []

    // Recursive DFS to find chains
    const findChains = async (currentId: string, currentChain: any[], depth: number) => {
      if (depth >= maxDepth || visited.has(currentId)) return

      visited.add(currentId)

      // Get outgoing relationships
      const { data: outgoing } = await supabase
        .from("signal_relationships")
        .select(
          `
          *,
          signalB:signal_b_id(id, name, current_value, change_percent)
        `,
        )
        .eq("signal_a_id", currentId)
        .eq("is_active", true)
        .gte("confidence_score", 0.6)

      if (!outgoing || outgoing.length === 0) {
        // End of chain - save if length > 1
        if (currentChain.length > 1) {
          const totalConfidence =
            currentChain.reduce((sum: number, rel: any) => sum + rel.confidence_score, 0) / currentChain.length

          chains.push({
            signals: currentChain.map((rel: any) => ({
              id: rel.signal_b_id,
              name: rel.signalB?.name,
              value: rel.signalB?.current_value,
              change: rel.signalB?.change_percent,
            })),
            relationships: currentChain.map((rel: any) => ({
              from: rel.signal_a_id,
              to: rel.signal_b_id,
              type: rel.relationship_type,
              confidence: rel.confidence_score,
            })),
            totalConfidence,
          })
        }
        return
      }

      // Continue chain
      for (const rel of outgoing) {
        await findChains(rel.signal_b_id, [...currentChain, rel], depth + 1)
      }
    }

    await findChains(startSignalId, [], 0)

    return chains.sort((a, b) => b.totalConfidence - a.totalConfidence)
  }

  /**
   * Calculate correlation between two time series
   */
  private static calculateCorrelation(
    dataA: Array<{ date: string; value: number }>,
    dataB: Array<{ date: string; value: number }>,
  ): { coefficient: number; lag: number } {
    // Align data points by date
    const aligned = this.alignDataPoints(dataA, dataB)
    if (aligned.length < 3) return { coefficient: 0, lag: 0 }

    // Calculate correlation coefficient (Pearson)
    const valuesA = aligned.map((d) => d.valueA)
    const valuesB = aligned.map((d) => d.valueB)

    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length

    let numerator = 0
    let denominatorA = 0
    let denominatorB = 0

    for (let i = 0; i < valuesA.length; i++) {
      const diffA = valuesA[i] - meanA
      const diffB = valuesB[i] - meanB
      numerator += diffA * diffB
      denominatorA += diffA * diffA
      denominatorB += diffB * diffB
    }

    const coefficient = numerator / Math.sqrt(denominatorA * denominatorB)

    // Check for time lag (simple: check if B lags A by 7, 14, 30 days)
    let bestLag = 0
    let bestCorrelation = Math.abs(coefficient)

    for (const lag of [7, 14, 30]) {
      const laggedCorrelation = this.calculateLaggedCorrelation(dataA, dataB, lag)
      if (Math.abs(laggedCorrelation) > bestCorrelation) {
        bestCorrelation = Math.abs(laggedCorrelation)
        bestLag = lag
      }
    }

    return {
      coefficient: isNaN(coefficient) ? 0 : coefficient,
      lag: bestLag,
    }
  }

  private static calculateLaggedCorrelation(
    dataA: Array<{ date: string; value: number }>,
    dataB: Array<{ date: string; value: number }>,
    lagDays: number,
  ): number {
    // Shift dataB forward by lagDays and recalculate correlation
    const laggedB = dataB.map((d) => ({
      date: new Date(new Date(d.date).getTime() - lagDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      value: d.value,
    }))

    const aligned = this.alignDataPoints(dataA, laggedB)
    if (aligned.length < 3) return 0

    const valuesA = aligned.map((d) => d.valueA)
    const valuesB = aligned.map((d) => d.valueB)

    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length

    let numerator = 0
    let denominatorA = 0
    let denominatorB = 0

    for (let i = 0; i < valuesA.length; i++) {
      const diffA = valuesA[i] - meanA
      const diffB = valuesB[i] - meanB
      numerator += diffA * diffB
      denominatorA += diffA * diffA
      denominatorB += diffB * diffB
    }

    const coefficient = numerator / Math.sqrt(denominatorA * denominatorB)
    return isNaN(coefficient) ? 0 : coefficient
  }

  private static alignDataPoints(
    dataA: Array<{ date: string; value: number }>,
    dataB: Array<{ date: string; value: number }>,
  ): Array<{ date: string; valueA: number; valueB: number }> {
    const mapB = new Map(dataB.map((d) => [d.date, d.value]))

    return dataA
      .filter((d) => mapB.has(d.date))
      .map((d) => ({
        date: d.date,
        valueA: d.value,
        valueB: mapB.get(d.date)!,
      }))
  }

  private static inferRelationshipType(
    signalA: any,
    signalB: any,
    positiveCorrelation: boolean,
  ): "causes" | "correlates" | "impacts" | "leads_to" | "affected_by" {
    // Simple heuristics based on signal categories
    const categoryA = signalA.category?.toLowerCase()
    const categoryB = signalB.category?.toLowerCase()

    // Marketing/Sales → Revenue
    if (
      (categoryA?.includes("marketing") || categoryA?.includes("sales")) &&
      (categoryB?.includes("revenue") || categoryB?.includes("financial"))
    ) {
      return positiveCorrelation ? "leads_to" : "affected_by"
    }

    // Product → Retention
    if (categoryA?.includes("product") && (categoryB?.includes("retention") || categoryB?.includes("customer"))) {
      return positiveCorrelation ? "impacts" : "affects"
    }

    // Default
    return "correlates"
  }
}
