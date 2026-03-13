/**
 * Relationship Detection Engine
 * 
 * Analyzes signal data to detect:
 * - Correlations between signals
 * - Causal relationships (leading/lagging indicators)
 * - Inverse correlations
 * - Time-lagged relationships
 * - Causal chains (A -> B -> C)
 */

import { createAdminClient } from "./supabase/admin"

// Types
export interface SignalDataPoint {
  date: Date
  value: number
}

export interface SignalWithData {
  id: string
  name: string
  category: string
  dataPoints: SignalDataPoint[]
}

export interface DetectedRelationship {
  signalAId: string
  signalBId: string
  signalAName: string
  signalBName: string
  relationshipType: RelationshipType
  direction: 'unidirectional' | 'bidirectional'
  correlationCoefficient: number
  confidenceScore: number
  timeLagDays: number
  sampleSize: number
  pValue: number | null
  evidenceType: EvidenceType
  evidenceData: Record<string, unknown>
}

export interface CausalChain {
  chainName: string
  chainDescription: string
  signalSequence: string[]
  relationshipIds: string[]
  totalConfidence: number
  totalLagDays: number
  chainStrength: 'weak' | 'moderate' | 'strong' | 'very_strong'
  businessImpact: string
  rootCauseSignalId: string
  endEffectSignalId: string
}

export interface RelationshipInsight {
  relationshipId: string
  insightType: 'explanation' | 'recommendation' | 'warning' | 'opportunity' | 'prediction'
  title: string
  description: string
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  suggestedActions: string[]
}

export type RelationshipType = 
  | 'causes' 
  | 'correlates' 
  | 'leads_to' 
  | 'impacts' 
  | 'affected_by'
  | 'precedes' 
  | 'follows' 
  | 'inversely_correlates' 
  | 'amplifies' 
  | 'dampens'

export type EvidenceType = 
  | 'statistical' 
  | 'user_defined' 
  | 'ai_detected' 
  | 'domain_knowledge' 
  | 'historical_pattern'

// Known business relationships (domain knowledge)
const KNOWN_RELATIONSHIPS: Array<{
  signalA: string[]  // Signal name patterns
  signalB: string[]
  type: RelationshipType
  direction: 'unidirectional' | 'bidirectional'
  expectedLag: number
  description: string
}> = [
  // Sales -> Revenue relationships
  {
    signalA: ['win rate', 'close rate', 'conversion rate'],
    signalB: ['revenue', 'mrr', 'arr', 'sales'],
    type: 'causes',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'Higher win rates directly impact revenue'
  },
  {
    signalA: ['pipeline', 'pipeline value', 'opportunities'],
    signalB: ['revenue', 'bookings', 'closed won'],
    type: 'leads_to',
    direction: 'unidirectional',
    expectedLag: 30,
    description: 'Pipeline leads to revenue with typical 30-day lag'
  },
  {
    signalA: ['leads', 'new leads', 'lead volume', 'mqls'],
    signalB: ['opportunities', 'pipeline', 'sqls'],
    type: 'leads_to',
    direction: 'unidirectional',
    expectedLag: 14,
    description: 'Leads convert to opportunities over 2 weeks'
  },
  // Customer Success -> Revenue
  {
    signalA: ['nps', 'csat', 'satisfaction'],
    signalB: ['churn', 'churn rate'],
    type: 'inversely_correlates',
    direction: 'unidirectional',
    expectedLag: 60,
    description: 'Low satisfaction predicts higher churn'
  },
  {
    signalA: ['churn', 'churn rate'],
    signalB: ['mrr', 'arr', 'revenue'],
    type: 'impacts',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'Churn directly reduces recurring revenue'
  },
  {
    signalA: ['customer health', 'health score'],
    signalB: ['expansion', 'upsell', 'nrr'],
    type: 'correlates',
    direction: 'unidirectional',
    expectedLag: 30,
    description: 'Healthy customers more likely to expand'
  },
  // Support -> Customer Success
  {
    signalA: ['resolution time', 'response time', 'first response'],
    signalB: ['csat', 'satisfaction', 'nps'],
    type: 'impacts',
    direction: 'unidirectional',
    expectedLag: 7,
    description: 'Faster support improves satisfaction'
  },
  {
    signalA: ['ticket volume', 'support tickets'],
    signalB: ['customer health', 'health score'],
    type: 'inversely_correlates',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'High ticket volume indicates customer issues'
  },
  // Marketing -> Sales
  {
    signalA: ['marketing spend', 'ad spend', 'campaign spend'],
    signalB: ['leads', 'lead volume', 'mqls'],
    type: 'causes',
    direction: 'unidirectional',
    expectedLag: 14,
    description: 'Marketing investment generates leads'
  },
  {
    signalA: ['website traffic', 'visitors'],
    signalB: ['leads', 'signups', 'conversions'],
    type: 'leads_to',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'Traffic converts to leads'
  },
  // Product -> Customer Success
  {
    signalA: ['dau', 'mau', 'active users', 'engagement'],
    signalB: ['retention', 'churn'],
    type: 'inversely_correlates',
    direction: 'unidirectional',
    expectedLag: 30,
    description: 'Higher engagement reduces churn'
  },
  {
    signalA: ['feature adoption', 'activation'],
    signalB: ['retention', 'nrr', 'expansion'],
    type: 'correlates',
    direction: 'unidirectional',
    expectedLag: 30,
    description: 'Feature adoption drives retention and expansion'
  },
  // Finance relationships
  {
    signalA: ['cac', 'acquisition cost'],
    signalB: ['ltv:cac', 'unit economics'],
    type: 'impacts',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'CAC directly affects unit economics'
  },
  {
    signalA: ['burn rate'],
    signalB: ['runway'],
    type: 'inversely_correlates',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'Higher burn reduces runway'
  },
  // HR -> Performance
  {
    signalA: ['employee satisfaction', 'enps'],
    signalB: ['turnover', 'attrition'],
    type: 'inversely_correlates',
    direction: 'unidirectional',
    expectedLag: 90,
    description: 'Low satisfaction predicts turnover'
  },
  {
    signalA: ['headcount'],
    signalB: ['revenue per employee'],
    type: 'impacts',
    direction: 'unidirectional',
    expectedLag: 0,
    description: 'Headcount affects productivity metrics'
  },
]

/**
 * Calculate Pearson correlation coefficient between two data series
 */
function calculateCorrelation(
  seriesA: number[], 
  seriesB: number[]
): { correlation: number; pValue: number | null } {
  if (seriesA.length !== seriesB.length || seriesA.length < 3) {
    return { correlation: 0, pValue: null }
  }

  const n = seriesA.length
  const meanA = seriesA.reduce((a, b) => a + b, 0) / n
  const meanB = seriesB.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denomA = 0
  let denomB = 0

  for (let i = 0; i < n; i++) {
    const diffA = seriesA[i] - meanA
    const diffB = seriesB[i] - meanB
    numerator += diffA * diffB
    denomA += diffA * diffA
    denomB += diffB * diffB
  }

  const denominator = Math.sqrt(denomA * denomB)
  if (denominator === 0) {
    return { correlation: 0, pValue: null }
  }

  const correlation = numerator / denominator

  // Calculate approximate p-value using t-distribution
  const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation))
  // Simplified p-value approximation
  const pValue = n > 30 ? 2 * (1 - normalCDF(Math.abs(t))) : null

  return { correlation, pValue }
}

/**
 * Standard normal CDF approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

/**
 * Align two time series by date and apply time lag
 */
function alignTimeSeries(
  seriesA: SignalDataPoint[],
  seriesB: SignalDataPoint[],
  lagDays: number = 0
): { alignedA: number[]; alignedB: number[] } {
  // Create date maps
  const mapA = new Map<string, number>()
  const mapB = new Map<string, number>()

  for (const point of seriesA) {
    const dateKey = point.date.toISOString().split('T')[0]
    mapA.set(dateKey, point.value)
  }

  for (const point of seriesB) {
    // Apply lag - shift series B dates backward
    const laggedDate = new Date(point.date)
    laggedDate.setDate(laggedDate.getDate() - lagDays)
    const dateKey = laggedDate.toISOString().split('T')[0]
    mapB.set(dateKey, point.value)
  }

  // Find common dates
  const alignedA: number[] = []
  const alignedB: number[] = []

  for (const [date, valueA] of mapA) {
    if (mapB.has(date)) {
      alignedA.push(valueA)
      alignedB.push(mapB.get(date)!)
    }
  }

  return { alignedA, alignedB }
}

/**
 * Find optimal time lag between two signals
 */
function findOptimalLag(
  seriesA: SignalDataPoint[],
  seriesB: SignalDataPoint[],
  maxLagDays: number = 90
): { optimalLag: number; maxCorrelation: number } {
  let optimalLag = 0
  let maxCorrelation = 0

  // Test lags from -maxLagDays to +maxLagDays
  for (let lag = -maxLagDays; lag <= maxLagDays; lag += 7) {
    const { alignedA, alignedB } = alignTimeSeries(seriesA, seriesB, lag)
    if (alignedA.length < 5) continue

    const { correlation } = calculateCorrelation(alignedA, alignedB)
    if (Math.abs(correlation) > Math.abs(maxCorrelation)) {
      maxCorrelation = correlation
      optimalLag = lag
    }
  }

  return { optimalLag, maxCorrelation }
}

/**
 * Check if signal name matches any pattern in the list
 */
function matchesPattern(signalName: string, patterns: string[]): boolean {
  const normalizedName = signalName.toLowerCase()
  return patterns.some(pattern => 
    normalizedName.includes(pattern.toLowerCase())
  )
}

/**
 * Determine relationship type based on correlation and domain knowledge
 */
function determineRelationshipType(
  correlation: number,
  timeLag: number,
  knownRelationship?: typeof KNOWN_RELATIONSHIPS[0]
): RelationshipType {
  if (knownRelationship) {
    return knownRelationship.type
  }

  if (correlation < -0.5) {
    return 'inversely_correlates'
  }

  if (timeLag > 14) {
    return correlation > 0 ? 'leads_to' : 'dampens'
  }

  if (timeLag < -14) {
    return 'follows'
  }

  if (Math.abs(correlation) > 0.7) {
    return correlation > 0 ? 'causes' : 'inversely_correlates'
  }

  return 'correlates'
}

/**
 * Calculate confidence score based on multiple factors
 */
function calculateConfidenceScore(
  correlation: number,
  sampleSize: number,
  pValue: number | null,
  hasKnownRelationship: boolean
): number {
  let confidence = 0

  // Base confidence from correlation strength (0-0.4)
  confidence += Math.abs(correlation) * 0.4

  // Sample size factor (0-0.2)
  const sizeFactor = Math.min(sampleSize / 100, 1) * 0.2
  confidence += sizeFactor

  // Statistical significance factor (0-0.2)
  if (pValue !== null && pValue < 0.05) {
    confidence += 0.2
  } else if (pValue !== null && pValue < 0.1) {
    confidence += 0.1
  }

  // Domain knowledge bonus (0-0.2)
  if (hasKnownRelationship) {
    confidence += 0.2
  }

  return Math.min(confidence, 1)
}

/**
 * Generate business insight for a detected relationship
 */
function generateInsight(
  relationship: DetectedRelationship,
  knownRelationship?: typeof KNOWN_RELATIONSHIPS[0]
): RelationshipInsight {
  const { signalAName, signalBName, relationshipType, correlationCoefficient, timeLagDays } = relationship
  
  let insightType: RelationshipInsight['insightType'] = 'explanation'
  let title = ''
  let description = ''
  let impactLevel: RelationshipInsight['impactLevel'] = 'medium'
  const suggestedActions: string[] = []

  // Use known relationship description if available
  if (knownRelationship) {
    description = knownRelationship.description
  }

  const strength = Math.abs(correlationCoefficient) > 0.7 ? 'strong' : 
                   Math.abs(correlationCoefficient) > 0.5 ? 'moderate' : 'weak'

  switch (relationshipType) {
    case 'causes':
    case 'leads_to':
      title = `${signalAName} drives ${signalBName}`
      description = description || `There is a ${strength} ${correlationCoefficient > 0 ? 'positive' : 'negative'} relationship where changes in ${signalAName} lead to changes in ${signalBName}${timeLagDays > 0 ? ` after approximately ${timeLagDays} days` : ''}.`
      insightType = 'explanation'
      impactLevel = strength === 'strong' ? 'high' : 'medium'
      suggestedActions.push(`Monitor ${signalAName} as a leading indicator for ${signalBName}`)
      if (timeLagDays > 0) {
        suggestedActions.push(`Use ${timeLagDays}-day lag for forecasting ${signalBName}`)
      }
      break

    case 'inversely_correlates':
      title = `${signalAName} inversely affects ${signalBName}`
      description = description || `When ${signalAName} increases, ${signalBName} tends to decrease, and vice versa. This ${strength} inverse relationship${timeLagDays > 0 ? ` has a ${timeLagDays}-day lag` : ''}.`
      insightType = correlationCoefficient < -0.7 ? 'warning' : 'explanation'
      impactLevel = strength === 'strong' ? 'high' : 'medium'
      suggestedActions.push(`Investigate the trade-off between ${signalAName} and ${signalBName}`)
      break

    case 'correlates':
      title = `${signalAName} correlates with ${signalBName}`
      description = description || `${signalAName} and ${signalBName} show a ${strength} ${correlationCoefficient > 0 ? 'positive' : 'negative'} correlation. They tend to move ${correlationCoefficient > 0 ? 'together' : 'in opposite directions'}.`
      insightType = 'explanation'
      impactLevel = 'low'
      suggestedActions.push(`Consider if there's a common cause affecting both metrics`)
      break

    case 'impacts':
    case 'affected_by':
      title = `${signalAName} impacts ${signalBName}`
      description = description || `Changes in ${signalAName} have a measurable impact on ${signalBName}.`
      insightType = 'explanation'
      impactLevel = 'medium'
      suggestedActions.push(`Track ${signalAName} to anticipate changes in ${signalBName}`)
      break

    case 'amplifies':
      title = `${signalAName} amplifies ${signalBName}`
      description = `Increases in ${signalAName} appear to accelerate growth in ${signalBName}.`
      insightType = 'opportunity'
      impactLevel = 'high'
      suggestedActions.push(`Consider investing more in ${signalAName} to boost ${signalBName}`)
      break

    case 'dampens':
      title = `${signalAName} dampens ${signalBName}`
      description = `Higher ${signalAName} appears to slow or reduce ${signalBName}.`
      insightType = 'warning'
      impactLevel = 'medium'
      suggestedActions.push(`Monitor if ${signalAName} is constraining ${signalBName} growth`)
      break

    default:
      title = `Relationship detected between ${signalAName} and ${signalBName}`
      description = `A ${strength} statistical relationship exists between these signals.`
      suggestedActions.push(`Further investigate the nature of this relationship`)
  }

  return {
    relationshipId: '', // Will be set after saving relationship
    insightType,
    title,
    description,
    impactLevel,
    suggestedActions
  }
}

/**
 * Main class for relationship detection
 */
export class RelationshipDetectionEngine {
  private supabase = createAdminClient()

  /**
   * Detect relationships between all signals for an organization
   */
  async detectRelationships(organizationId: string): Promise<{
    relationships: DetectedRelationship[]
    insights: RelationshipInsight[]
    causalChains: CausalChain[]
  }> {
    // Fetch all signals with data points
    const signals = await this.fetchSignalsWithData(organizationId)
    
    if (signals.length < 2) {
      return { relationships: [], insights: [], causalChains: [] }
    }

    const relationships: DetectedRelationship[] = []
    const insights: RelationshipInsight[] = []

    // Compare each pair of signals
    for (let i = 0; i < signals.length; i++) {
      for (let j = i + 1; j < signals.length; j++) {
        const signalA = signals[i]
        const signalB = signals[j]

        // Check for known domain relationships
        const knownRelationship = this.findKnownRelationship(signalA.name, signalB.name)

        // Find optimal time lag
        const { optimalLag, maxCorrelation } = findOptimalLag(
          signalA.dataPoints,
          signalB.dataPoints
        )

        // Skip weak correlations unless there's a known relationship
        if (Math.abs(maxCorrelation) < 0.3 && !knownRelationship) {
          continue
        }

        // Get aligned data for final correlation calculation
        const { alignedA, alignedB } = alignTimeSeries(
          signalA.dataPoints,
          signalB.dataPoints,
          optimalLag
        )

        if (alignedA.length < 5) continue

        const { correlation, pValue } = calculateCorrelation(alignedA, alignedB)
        
        const relationshipType = determineRelationshipType(
          correlation,
          optimalLag,
          knownRelationship
        )

        const confidenceScore = calculateConfidenceScore(
          correlation,
          alignedA.length,
          pValue,
          !!knownRelationship
        )

        const relationship: DetectedRelationship = {
          signalAId: signalA.id,
          signalBId: signalB.id,
          signalAName: signalA.name,
          signalBName: signalB.name,
          relationshipType,
          direction: knownRelationship?.direction || 'unidirectional',
          correlationCoefficient: correlation,
          confidenceScore,
          timeLagDays: optimalLag,
          sampleSize: alignedA.length,
          pValue,
          evidenceType: knownRelationship ? 'domain_knowledge' : 'statistical',
          evidenceData: {
            knownRelationship: !!knownRelationship,
            calculatedAt: new Date().toISOString()
          }
        }

        relationships.push(relationship)

        // Generate insight for this relationship
        const insight = generateInsight(relationship, knownRelationship)
        insights.push(insight)
      }
    }

    // Detect causal chains
    const causalChains = this.detectCausalChains(relationships, signals)

    return { relationships, insights, causalChains }
  }

  /**
   * Find known domain relationship between two signals
   */
  private findKnownRelationship(
    signalAName: string,
    signalBName: string
  ): typeof KNOWN_RELATIONSHIPS[0] | undefined {
    for (const known of KNOWN_RELATIONSHIPS) {
      if (
        (matchesPattern(signalAName, known.signalA) && matchesPattern(signalBName, known.signalB)) ||
        (matchesPattern(signalBName, known.signalA) && matchesPattern(signalAName, known.signalB))
      ) {
        return known
      }
    }
    return undefined
  }

  /**
   * Detect causal chains from relationships
   */
  private detectCausalChains(
    relationships: DetectedRelationship[],
    signals: SignalWithData[]
  ): CausalChain[] {
    const chains: CausalChain[] = []
    const signalMap = new Map(signals.map(s => [s.id, s]))

    // Build adjacency list for causal relationships
    const causalEdges = new Map<string, Array<{ targetId: string; relationship: DetectedRelationship }>>()
    
    for (const rel of relationships) {
      if (['causes', 'leads_to', 'impacts', 'amplifies'].includes(rel.relationshipType)) {
        if (!causalEdges.has(rel.signalAId)) {
          causalEdges.set(rel.signalAId, [])
        }
        causalEdges.get(rel.signalAId)!.push({
          targetId: rel.signalBId,
          relationship: rel
        })
      }
    }

    // Find chains using DFS
    const visited = new Set<string>()
    
    const findChains = (
      startId: string,
      path: string[],
      relPath: DetectedRelationship[],
      totalConfidence: number,
      totalLag: number
    ) => {
      if (path.length >= 3) {
        // Found a chain
        const rootSignal = signalMap.get(path[0])
        const endSignal = signalMap.get(path[path.length - 1])
        
        const chainStrength = totalConfidence > 0.7 ? 'very_strong' :
                             totalConfidence > 0.5 ? 'strong' :
                             totalConfidence > 0.3 ? 'moderate' : 'weak'

        chains.push({
          chainName: `${rootSignal?.name} → ${endSignal?.name} Chain`,
          chainDescription: `${path.map(id => signalMap.get(id)?.name).join(' → ')}`,
          signalSequence: [...path],
          relationshipIds: [], // Will be filled after saving relationships
          totalConfidence,
          totalLagDays: totalLag,
          chainStrength,
          businessImpact: `Changes in ${rootSignal?.name} cascade through to ${endSignal?.name} over ${totalLag} days`,
          rootCauseSignalId: path[0],
          endEffectSignalId: path[path.length - 1]
        })
      }

      if (path.length >= 5) return // Limit chain length

      const edges = causalEdges.get(startId) || []
      for (const edge of edges) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId)
          findChains(
            edge.targetId,
            [...path, edge.targetId],
            [...relPath, edge.relationship],
            totalConfidence * edge.relationship.confidenceScore,
            totalLag + edge.relationship.timeLagDays
          )
          visited.delete(edge.targetId)
        }
      }
    }

    // Start DFS from each signal
    for (const signalId of causalEdges.keys()) {
      visited.clear()
      visited.add(signalId)
      findChains(signalId, [signalId], [], 1, 0)
    }

    // Sort by confidence and return top chains
    return chains
      .sort((a, b) => b.totalConfidence - a.totalConfidence)
      .slice(0, 10)
  }

  /**
   * Fetch signals with their time series data
   */
  private async fetchSignalsWithData(organizationId: string): Promise<SignalWithData[]> {
    const { data: signals, error: signalsError } = await this.supabase
      .from('signals')
      .select('id, name, category')
      .eq('organization_id', organizationId)

    if (signalsError || !signals) {
      console.error('[v0] Error fetching signals:', signalsError)
      return []
    }

    const signalsWithData: SignalWithData[] = []

    for (const signal of signals) {
      const { data: dataPoints, error: dpError } = await this.supabase
        .from('signal_data_points')
        .select('date, value')
        .eq('signal_id', signal.id)
        .order('date', { ascending: true })

      if (dpError || !dataPoints || dataPoints.length < 5) {
        continue
      }

      signalsWithData.push({
        id: signal.id,
        name: signal.name,
        category: signal.category || 'General',
        dataPoints: dataPoints.map(dp => ({
          date: new Date(dp.date),
          value: Number(dp.value)
        }))
      })
    }

    return signalsWithData
  }

  /**
   * Save detected relationships to database
   */
  async saveRelationships(
    organizationId: string,
    relationships: DetectedRelationship[],
    insights: RelationshipInsight[]
  ): Promise<void> {
    for (const rel of relationships) {
      const { data: savedRel, error: relError } = await this.supabase
        .from('signal_relationships')
        .upsert({
          organization_id: organizationId,
          signal_a_id: rel.signalAId,
          signal_b_id: rel.signalBId,
          relationship_type: rel.relationshipType,
          direction: rel.direction,
          confidence_score: rel.confidenceScore,
          correlation_coefficient: rel.correlationCoefficient,
          time_lag_days: rel.timeLagDays,
          sample_size: rel.sampleSize,
          p_value: rel.pValue,
          evidence_type: rel.evidenceType,
          evidence_data: rel.evidenceData,
          last_validated_at: new Date().toISOString()
        }, {
          onConflict: 'signal_a_id,signal_b_id,relationship_type'
        })
        .select('id')
        .single()

      if (relError) {
        console.error('[v0] Error saving relationship:', relError)
        continue
      }

      // Save associated insight
      const matchingInsight = insights.find(i => 
        i.title.includes(rel.signalAName) && i.title.includes(rel.signalBName)
      )

      if (matchingInsight && savedRel) {
        await this.supabase
          .from('relationship_insights')
          .insert({
            relationship_id: savedRel.id,
            insight_type: matchingInsight.insightType,
            title: matchingInsight.title,
            description: matchingInsight.description,
            impact_level: matchingInsight.impactLevel,
            suggested_actions: matchingInsight.suggestedActions
          })
      }
    }
  }

  /**
   * Save causal chains to database
   */
  async saveCausalChains(
    organizationId: string,
    chains: CausalChain[]
  ): Promise<void> {
    for (const chain of chains) {
      await this.supabase
        .from('causal_chains')
        .insert({
          organization_id: organizationId,
          chain_name: chain.chainName,
          chain_description: chain.chainDescription,
          signal_sequence: chain.signalSequence,
          relationship_ids: chain.relationshipIds,
          total_confidence: chain.totalConfidence,
          total_lag_days: chain.totalLagDays,
          chain_strength: chain.chainStrength,
          business_impact: chain.businessImpact,
          root_cause_signal_id: chain.rootCauseSignalId,
          end_effect_signal_id: chain.endEffectSignalId
        })
    }
  }

  /**
   * Get all relationships for an organization
   */
  async getRelationships(organizationId: string): Promise<DetectedRelationship[]> {
    const { data, error } = await this.supabase
      .from('signal_relationships')
      .select(`
        *,
        signal_a:signals!signal_a_id(id, name),
        signal_b:signals!signal_b_id(id, name)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('confidence_score', { ascending: false })

    if (error || !data) {
      console.error('[v0] Error fetching relationships:', error)
      return []
    }

    return data.map(r => ({
      signalAId: r.signal_a_id,
      signalBId: r.signal_b_id,
      signalAName: r.signal_a?.name || 'Unknown',
      signalBName: r.signal_b?.name || 'Unknown',
      relationshipType: r.relationship_type as RelationshipType,
      direction: r.direction,
      correlationCoefficient: Number(r.correlation_coefficient),
      confidenceScore: Number(r.confidence_score),
      timeLagDays: r.time_lag_days,
      sampleSize: r.sample_size,
      pValue: r.p_value ? Number(r.p_value) : null,
      evidenceType: r.evidence_type as EvidenceType,
      evidenceData: r.evidence_data
    }))
  }

  /**
   * Get causal chains for an organization
   */
  async getCausalChains(organizationId: string): Promise<CausalChain[]> {
    const { data, error } = await this.supabase
      .from('causal_chains')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('total_confidence', { ascending: false })

    if (error || !data) {
      console.error('[v0] Error fetching causal chains:', error)
      return []
    }

    return data.map(c => ({
      chainName: c.chain_name,
      chainDescription: c.chain_description,
      signalSequence: c.signal_sequence,
      relationshipIds: c.relationship_ids,
      totalConfidence: Number(c.total_confidence),
      totalLagDays: c.total_lag_days,
      chainStrength: c.chain_strength as CausalChain['chainStrength'],
      businessImpact: c.business_impact,
      rootCauseSignalId: c.root_cause_signal_id,
      endEffectSignalId: c.end_effect_signal_id
    }))
  }
}

// Export singleton instance
export const relationshipDetectionEngine = new RelationshipDetectionEngine()
