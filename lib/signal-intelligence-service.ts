import { createClient } from "@/lib/supabase/server"
import { UserContextService, UserContext, RoleSignalRelevance } from "./user-context-service"

/**
 * Signal Intelligence Service
 * Ranks and prioritizes signals based on user context, goals, and behavior
 */

export interface RankedSignal {
  signalId: string
  signalName: string
  category: string
  
  // Current value & change
  currentValue?: number
  previousValue?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'stable'
  
  // Ranking factors
  relevanceScore: number  // 0-100 based on role/preferences
  urgencyScore: number    // 0-100 based on anomalies/thresholds
  goalAlignmentScore: number  // 0-100 based on user goals
  
  // Combined score
  overallScore: number
  
  // Flags
  isPinned: boolean
  isHidden: boolean
  isCoreMetric: boolean
  hasAnomaly: boolean
  
  // Context
  rankingReasons: string[]
}

export interface SignalRankingResult {
  signals: RankedSignal[]
  userContext: UserContext
  totalSignals: number
  filteredOut: number
}

export class SignalIntelligenceService {
  /**
   * Get ranked signals for a user's dashboard
   */
  static async getRankedSignals(
    userId: string,
    options: {
      limit?: number
      includeHidden?: boolean
      categoryFilter?: string[]
    } = {}
  ): Promise<SignalRankingResult> {
    const { limit = 20, includeHidden = false, categoryFilter } = options
    
    // Get user context
    const userContext = await UserContextService.getUserContext(userId)
    if (!userContext) {
      return {
        signals: [],
        userContext: { userId, priorityAreas: [], goals: [], preferredCategories: [], pinnedSignals: [], hiddenSignals: [] },
        totalSignals: 0,
        filteredOut: 0
      }
    }
    
    // Get role relevance mappings
    const roleRelevance = userContext.role 
      ? await UserContextService.getRoleSignalRelevance(userContext.role)
      : []
    
    // Get all signals for the organization
    const supabase = await createClient()
    
    let query = supabase
      .from('signals')
      .select(`
        id,
        name,
        category,
        current_value,
        previous_value,
        change_percent,
        trend,
        is_anomaly,
        organization_id
      `)
    
    if (userContext.organizationId) {
      query = query.eq('organization_id', userContext.organizationId)
    }
    
    if (categoryFilter && categoryFilter.length > 0) {
      query = query.in('category', categoryFilter)
    }
    
    const { data: signals, error } = await query
    
    if (error) {
      console.error('[SignalIntelligence] Error fetching signals:', error)
      return {
        signals: [],
        userContext,
        totalSignals: 0,
        filteredOut: 0
      }
    }
    
    // Rank each signal
    const rankedSignals = signals.map(signal => 
      this.calculateSignalRanking(signal, userContext, roleRelevance)
    )
    
    // Filter hidden signals unless requested
    let filteredSignals = rankedSignals
    let filteredOut = 0
    
    if (!includeHidden) {
      const beforeCount = filteredSignals.length
      filteredSignals = filteredSignals.filter(s => !s.isHidden)
      filteredOut = beforeCount - filteredSignals.length
    }
    
    // Sort by overall score (pinned first, then by score)
    filteredSignals.sort((a, b) => {
      // Pinned signals always come first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then by overall score
      return b.overallScore - a.overallScore
    })
    
    // Apply limit
    const limitedSignals = filteredSignals.slice(0, limit)
    
    return {
      signals: limitedSignals,
      userContext,
      totalSignals: signals.length,
      filteredOut
    }
  }
  
  /**
   * Calculate ranking score for a single signal
   */
  private static calculateSignalRanking(
    signal: any,
    context: UserContext,
    roleRelevance: RoleSignalRelevance[]
  ): RankedSignal {
    const reasons: string[] = []
    
    // 1. Role-based relevance (0-100)
    let relevanceScore = 50  // Default middle score
    let isCoreMetric = false
    
    const categoryRelevance = roleRelevance.find(r => 
      r.signalCategory.toLowerCase() === signal.category?.toLowerCase() ||
      signal.category?.toLowerCase().includes(r.signalCategory.toLowerCase())
    )
    
    if (categoryRelevance) {
      relevanceScore = categoryRelevance.relevanceScore * 10  // Convert 1-10 to 10-100
      isCoreMetric = categoryRelevance.isCoreMetric
      if (isCoreMetric) {
        reasons.push(`Core metric for ${context.role}`)
      } else if (relevanceScore >= 70) {
        reasons.push(`Highly relevant to ${context.role}`)
      }
    }
    
    // Boost for preferred categories
    if (context.preferredCategories.includes(signal.category)) {
      relevanceScore = Math.min(100, relevanceScore + 15)
      reasons.push('In your preferred categories')
    }
    
    // 2. Goal alignment score (0-100)
    let goalAlignmentScore = 0
    
    for (const goal of context.goals) {
      if (goal.signalId === signal.id) {
        goalAlignmentScore = 100
        reasons.push(`Tracked in goal: "${goal.title}"`)
        break
      }
      
      // Check if signal name matches goal signal name
      if (goal.signalName && signal.name.toLowerCase().includes(goal.signalName.toLowerCase())) {
        goalAlignmentScore = Math.max(goalAlignmentScore, 80)
        reasons.push(`Related to goal: "${goal.title}"`)
      }
    }
    
    // Check legacy KPIs
    const kpis = [context.kpi1, context.kpi2, context.kpi3].filter(Boolean)
    for (const kpi of kpis) {
      if (kpi && signal.name.toLowerCase().includes(kpi.toLowerCase())) {
        goalAlignmentScore = Math.max(goalAlignmentScore, 70)
        reasons.push(`Matches your KPI: ${kpi}`)
        break
      }
    }
    
    // 3. Urgency score (0-100) based on anomalies and significant changes
    let urgencyScore = 0
    
    if (signal.is_anomaly) {
      urgencyScore = 90
      reasons.push('Anomaly detected')
    }
    
    if (signal.change_percent !== null) {
      const absChange = Math.abs(signal.change_percent)
      if (absChange >= 50) {
        urgencyScore = Math.max(urgencyScore, 85)
        reasons.push(`Significant change: ${signal.change_percent > 0 ? '+' : ''}${signal.change_percent.toFixed(1)}%`)
      } else if (absChange >= 25) {
        urgencyScore = Math.max(urgencyScore, 60)
      } else if (absChange >= 10) {
        urgencyScore = Math.max(urgencyScore, 40)
      }
    }
    
    // 4. Calculate overall score
    // Weights: Relevance 40%, Goals 35%, Urgency 25%
    const overallScore = (
      relevanceScore * 0.40 +
      goalAlignmentScore * 0.35 +
      urgencyScore * 0.25
    )
    
    // Check pinned/hidden status
    const isPinned = context.pinnedSignals.includes(signal.id)
    const isHidden = context.hiddenSignals.includes(signal.id)
    
    if (isPinned) {
      reasons.unshift('Pinned by you')
    }
    
    return {
      signalId: signal.id,
      signalName: signal.name,
      category: signal.category || 'Uncategorized',
      
      currentValue: signal.current_value,
      previousValue: signal.previous_value,
      changePercent: signal.change_percent,
      trend: signal.trend,
      
      relevanceScore,
      urgencyScore,
      goalAlignmentScore,
      overallScore,
      
      isPinned,
      isHidden,
      isCoreMetric,
      hasAnomaly: signal.is_anomaly || false,
      
      rankingReasons: reasons
    }
  }
  
  /**
   * Get signals that should be proactively shown to user
   * (anomalies, significant changes, goal-related)
   */
  static async getProactiveSignals(userId: string): Promise<RankedSignal[]> {
    const result = await this.getRankedSignals(userId, { limit: 100 })
    
    // Filter to signals that warrant attention
    return result.signals.filter(signal => 
      signal.hasAnomaly ||
      signal.urgencyScore >= 60 ||
      signal.goalAlignmentScore >= 80 ||
      signal.isCoreMetric
    ).slice(0, 10)
  }
  
  /**
   * Get signals for exploration (signals user hasn't seen much)
   */
  static async getExplorationSignals(userId: string): Promise<RankedSignal[]> {
    const supabase = await createClient()
    
    // Get user's activity to find frequently viewed signals
    const { data: activity } = await supabase
      .from('user_activity_log')
      .select('entity_id')
      .eq('user_id', userId)
      .eq('activity_type', 'view_signal')
      .order('created_at', { ascending: false })
      .limit(100)
    
    const frequentlyViewed = new Set((activity || []).map(a => a.entity_id))
    
    // Get all ranked signals
    const result = await this.getRankedSignals(userId, { limit: 100 })
    
    // Filter to signals not frequently viewed but still relevant
    return result.signals
      .filter(signal => 
        !frequentlyViewed.has(signal.signalId) &&
        signal.relevanceScore >= 40 &&
        !signal.isPinned
      )
      .slice(0, 5)
  }
  
  /**
   * Get signals grouped by category with rankings
   */
  static async getSignalsByCategory(userId: string): Promise<Map<string, RankedSignal[]>> {
    const result = await this.getRankedSignals(userId, { limit: 200 })
    
    const categoryMap = new Map<string, RankedSignal[]>()
    
    for (const signal of result.signals) {
      if (!categoryMap.has(signal.category)) {
        categoryMap.set(signal.category, [])
      }
      categoryMap.get(signal.category)!.push(signal)
    }
    
    // Sort signals within each category
    for (const [, signals] of categoryMap) {
      signals.sort((a, b) => b.overallScore - a.overallScore)
    }
    
    return categoryMap
  }
  
  /**
   * Get summary stats for the user's signals
   */
  static async getSignalSummary(userId: string): Promise<{
    totalSignals: number
    coreMetrics: number
    anomalies: number
    improving: number
    declining: number
    byCategory: { category: string; count: number }[]
  }> {
    const result = await this.getRankedSignals(userId, { limit: 500 })
    
    let coreMetrics = 0
    let anomalies = 0
    let improving = 0
    let declining = 0
    const categoryCount = new Map<string, number>()
    
    for (const signal of result.signals) {
      if (signal.isCoreMetric) coreMetrics++
      if (signal.hasAnomaly) anomalies++
      if (signal.trend === 'up') improving++
      if (signal.trend === 'down') declining++
      
      categoryCount.set(signal.category, (categoryCount.get(signal.category) || 0) + 1)
    }
    
    return {
      totalSignals: result.totalSignals,
      coreMetrics,
      anomalies,
      improving,
      declining,
      byCategory: Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
    }
  }
}
