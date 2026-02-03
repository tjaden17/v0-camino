/**
 * Impact Module
 * 
 * Responsibility: Connect signals to business outcomes
 * - Goal mapping
 * - Impact scoring
 * - Projections ("if trend continues...")
 * - Directional assessment (good/bad, expected/unexpected)
 */

import { createClient } from '@/lib/supabase/server'
import type { Trend } from '@/lib/modules/analysis'

// Types
export interface Goal {
  id: string
  name: string
  description: string
  target_value: number
  current_value: number
  unit: string
  owner_id: string
  due_date: string | null
  type: 'personal' | 'team' | 'company'
}

export interface SignalGoalMapping {
  signal_id: string
  goal_id: string
  relationship: 'positive' | 'negative' | 'neutral'
  weight: number // 0-1, how much this signal influences the goal
}

export interface Impact {
  signal_id: string
  goal_id: string
  direction: 'positive' | 'negative' | 'neutral'
  magnitude: 'high' | 'medium' | 'low'
  is_expected: boolean
  summary: string
}

export interface Projection {
  signal_id: string
  current_value: number
  projected_value: number
  projection_date: string
  confidence: number
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
  goal_impact: string
}

export interface DirectionalAssessment {
  signal_id: string
  is_positive: boolean
  is_expected: boolean
  explanation: string
  action_needed: boolean
  urgency: 'high' | 'medium' | 'low' | 'none'
}

// Predefined goal-signal relationships
const SIGNAL_GOAL_RELATIONSHIPS: Record<string, { goals: string[]; relationship: 'positive' | 'negative' }> = {
  'total_pipeline_value': { goals: ['revenue_growth', 'sales_target'], relationship: 'positive' },
  'win_rate': { goals: ['revenue_growth', 'sales_efficiency'], relationship: 'positive' },
  'average_deal_size': { goals: ['revenue_growth'], relationship: 'positive' },
  'open_tickets': { goals: ['customer_satisfaction', 'support_efficiency'], relationship: 'negative' },
  'avg_resolution_time': { goals: ['customer_satisfaction', 'support_efficiency'], relationship: 'negative' },
  'escalation_rate': { goals: ['customer_satisfaction', 'support_quality'], relationship: 'negative' },
  'customer_health_score': { goals: ['retention', 'customer_satisfaction'], relationship: 'positive' },
  'revenue_at_risk': { goals: ['revenue_growth', 'retention'], relationship: 'negative' }
}

// Get goals related to a signal
export async function getRelatedGoals(signalId: string, organizationId: string): Promise<Goal[]> {
  const supabase = await createClient()
  
  // Get goal mappings for this signal
  const { data: mappings } = await supabase
    .from('signal_goal_mappings')
    .select('goal_id')
    .eq('signal_id', signalId)
  
  if (mappings && mappings.length > 0) {
    const goalIds = mappings.map(m => m.goal_id)
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .in('id', goalIds)
    
    return goals || []
  }
  
  // Fallback to predefined relationships
  const relationships = SIGNAL_GOAL_RELATIONSHIPS[signalId]
  if (relationships) {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', organizationId)
      .in('name', relationships.goals)
    
    return goals || []
  }
  
  return []
}

// Calculate impact of signal change on goals
export function calculateImpact(
  signalId: string,
  signalTrend: Trend,
  goal: Goal
): Impact {
  const relationships = SIGNAL_GOAL_RELATIONSHIPS[signalId]
  const signalRelationship = relationships?.relationship || 'neutral'
  
  // Determine direction
  let direction: Impact['direction'] = 'neutral'
  if (signalTrend.direction === 'up') {
    direction = signalRelationship === 'positive' ? 'positive' 
      : signalRelationship === 'negative' ? 'negative' 
      : 'neutral'
  } else if (signalTrend.direction === 'down') {
    direction = signalRelationship === 'positive' ? 'negative' 
      : signalRelationship === 'negative' ? 'positive' 
      : 'neutral'
  }
  
  // Determine magnitude based on change percentage
  const absChange = Math.abs(signalTrend.change_percentage)
  let magnitude: Impact['magnitude'] = 'low'
  if (absChange > 20) magnitude = 'high'
  else if (absChange > 10) magnitude = 'medium'
  
  // Determine if expected (small changes are expected)
  const isExpected = absChange < 15
  
  // Generate summary
  const directionWord = direction === 'positive' ? 'positively' 
    : direction === 'negative' ? 'negatively' 
    : 'neutrally'
  const summary = `Signal is trending ${signalTrend.direction} (${signalTrend.change_percentage > 0 ? '+' : ''}${signalTrend.change_percentage}%), ${directionWord} impacting "${goal.name}"`
  
  return {
    signal_id: signalId,
    goal_id: goal.id,
    direction,
    magnitude,
    is_expected: isExpected,
    summary
  }
}

// Project signal value into the future
export function projectTrend(
  signalId: string,
  currentValue: number,
  trend: Trend,
  daysAhead: number = 30
): Projection {
  // Calculate daily rate of change
  const periodDays = trend.period === '30d' ? 30 : trend.period === '60d' ? 60 : 90
  const dailyChangeRate = trend.change_percentage / periodDays
  
  // Project value
  const projectedChange = dailyChangeRate * daysAhead
  const projectedValue = currentValue * (1 + projectedChange / 100)
  
  // Confidence decreases with projection distance
  const confidence = Math.max(20, trend.confidence - (daysAhead / 3))
  
  // Determine goal impact
  let goalImpact = ''
  if (projectedChange > 10) {
    goalImpact = 'Significant positive progress toward goals expected'
  } else if (projectedChange > 0) {
    goalImpact = 'Modest progress toward goals expected'
  } else if (projectedChange > -10) {
    goalImpact = 'Slight regression from goals possible'
  } else {
    goalImpact = 'Significant risk to goal achievement'
  }
  
  const projectionDate = new Date()
  projectionDate.setDate(projectionDate.getDate() + daysAhead)
  
  return {
    signal_id: signalId,
    current_value: currentValue,
    projected_value: Math.round(projectedValue * 100) / 100,
    projection_date: projectionDate.toISOString(),
    confidence: Math.round(confidence),
    scenario: 'realistic',
    goal_impact: goalImpact
  }
}

// Assess direction and urgency
export function assessDirection(
  signalId: string,
  trend: Trend,
  goals: Goal[]
): DirectionalAssessment {
  const relationships = SIGNAL_GOAL_RELATIONSHIPS[signalId]
  const signalRelationship = relationships?.relationship || 'neutral'
  
  // Is the change positive for business?
  let isPositive = trend.direction === 'stable'
  if (trend.direction === 'up') {
    isPositive = signalRelationship === 'positive'
  } else if (trend.direction === 'down') {
    isPositive = signalRelationship === 'negative'
  }
  
  // Is it expected? (small changes are expected)
  const isExpected = Math.abs(trend.change_percentage) < 15
  
  // Determine urgency
  let urgency: DirectionalAssessment['urgency'] = 'none'
  const actionNeeded = !isPositive && Math.abs(trend.change_percentage) > 5
  
  if (!isPositive) {
    if (Math.abs(trend.change_percentage) > 20) urgency = 'high'
    else if (Math.abs(trend.change_percentage) > 10) urgency = 'medium'
    else if (Math.abs(trend.change_percentage) > 5) urgency = 'low'
  }
  
  // Generate explanation
  let explanation = ''
  if (isPositive && isExpected) {
    explanation = 'Signal is moving in a positive direction as expected. Continue current approach.'
  } else if (isPositive && !isExpected) {
    explanation = 'Signal showing unexpectedly positive movement. Investigate what\'s working well.'
  } else if (!isPositive && isExpected) {
    explanation = 'Signal declining within expected ranges. Monitor closely.'
  } else {
    explanation = 'Signal showing unexpected negative movement. Immediate investigation recommended.'
  }
  
  return {
    signal_id: signalId,
    is_positive: isPositive,
    is_expected: isExpected,
    explanation,
    action_needed: actionNeeded,
    urgency
  }
}

// Generate complete "So What" view for a signal
export async function generateSoWhatView(
  signalId: string,
  organizationId: string,
  currentValue: number,
  trend: Trend
): Promise<{
  impact: Impact[]
  projection: Projection
  assessment: DirectionalAssessment
  relatedGoals: Goal[]
}> {
  const relatedGoals = await getRelatedGoals(signalId, organizationId)
  
  const impact = relatedGoals.map(goal => calculateImpact(signalId, trend, goal))
  const projection = projectTrend(signalId, currentValue, trend)
  const assessment = assessDirection(signalId, trend, relatedGoals)
  
  return {
    impact,
    projection,
    assessment,
    relatedGoals
  }
}
