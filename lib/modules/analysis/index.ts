/**
 * Analysis Module
 * 
 * Responsibility: Generate insights from signal data
 * - Trend calculation (30/60/90 day)
 * - Root cause analysis
 * - Sub-segment identification
 * - Anomaly detection
 */

import { createClient } from '@/lib/supabase/server'

// Types
export interface Trend {
  signal_id: string
  period: '30d' | '60d' | '90d'
  direction: 'up' | 'down' | 'stable'
  change_percentage: number
  data_points: Array<{ date: string; value: number }>
  confidence: number
}

export interface RootCause {
  signal_id: string
  potential_causes: Array<{
    factor: string
    impact: 'high' | 'medium' | 'low'
    evidence: string
    data_support: number // 0-100
  }>
  generated_at: string
}

export interface Segment {
  name: string
  filter: Record<string, unknown>
  count: number
  avg_value: number
  trend: 'up' | 'down' | 'stable'
  notable: boolean
}

export interface Anomaly {
  signal_id: string
  detected_at: string
  type: 'spike' | 'drop' | 'pattern_break'
  severity: 'high' | 'medium' | 'low'
  value: number
  expected_value: number
  deviation_percentage: number
}

// Calculate trend for a signal
export async function calculateTrend(
  signalId: string,
  organizationId: string,
  period: Trend['period'] = '30d'
): Promise<Trend | null> {
  const supabase = await createClient()
  
  // Determine date range
  const days = period === '30d' ? 30 : period === '60d' ? 60 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Get historical data points
  const { data: dataPoints } = await supabase
    .from('signal_data_points')
    .select('value, recorded_at')
    .eq('signal_id', signalId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true })
  
  if (!dataPoints || dataPoints.length < 2) {
    return null
  }
  
  // Calculate trend
  const firstValue = dataPoints[0].value
  const lastValue = dataPoints[dataPoints.length - 1].value
  const changePercentage = firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : 0
  
  // Determine direction
  let direction: Trend['direction'] = 'stable'
  if (changePercentage > 5) direction = 'up'
  else if (changePercentage < -5) direction = 'down'
  
  // Calculate confidence based on data points
  const confidence = Math.min(100, (dataPoints.length / days) * 100)
  
  return {
    signal_id: signalId,
    period,
    direction,
    change_percentage: Math.round(changePercentage * 10) / 10,
    data_points: dataPoints.map(dp => ({
      date: dp.recorded_at,
      value: dp.value
    })),
    confidence
  }
}

// Analyze potential root causes for a signal change
export async function analyzeRootCause(
  signalId: string,
  organizationId: string
): Promise<RootCause> {
  const supabase = await createClient()
  
  // Get signal definition to understand what data it uses
  const { data: signal } = await supabase
    .from('signals')
    .select('*')
    .eq('id', signalId)
    .single()
  
  const causes: RootCause['potential_causes'] = []
  
  // Analyze based on signal category
  if (signal?.category === 'sales') {
    // Check deal stage distribution changes
    const { data: deals } = await supabase
      .from('zoho_deals')
      .select('stage, amount, created_time')
      .eq('organization_id', organizationId)
      .order('created_time', { ascending: false })
      .limit(100)
    
    if (deals && deals.length > 0) {
      // Group by stage
      const stageDistribution: Record<string, number> = {}
      deals.forEach(d => {
        stageDistribution[d.stage] = (stageDistribution[d.stage] || 0) + 1
      })
      
      // Find dominant stage
      const topStage = Object.entries(stageDistribution)
        .sort((a, b) => b[1] - a[1])[0]
      
      if (topStage) {
        causes.push({
          factor: `High concentration of deals in "${topStage[0]}" stage`,
          impact: 'medium',
          evidence: `${topStage[1]} of ${deals.length} recent deals (${Math.round(topStage[1]/deals.length*100)}%)`,
          data_support: Math.round(topStage[1]/deals.length*100)
        })
      }
    }
  }
  
  if (signal?.category === 'support') {
    // Check ticket patterns
    const { data: tickets } = await supabase
      .from('zoho_tickets')
      .select('priority, channel, is_escalated, created_time')
      .eq('organization_id', organizationId)
      .order('created_time', { ascending: false })
      .limit(100)
    
    if (tickets && tickets.length > 0) {
      const escalatedCount = tickets.filter(t => t.is_escalated).length
      const escalationRate = (escalatedCount / tickets.length) * 100
      
      if (escalationRate > 20) {
        causes.push({
          factor: 'High escalation rate',
          impact: 'high',
          evidence: `${escalatedCount} of ${tickets.length} recent tickets escalated (${Math.round(escalationRate)}%)`,
          data_support: Math.round(escalationRate)
        })
      }
      
      // Check channel distribution
      const channelDistribution: Record<string, number> = {}
      tickets.forEach(t => {
        if (t.channel) {
          channelDistribution[t.channel] = (channelDistribution[t.channel] || 0) + 1
        }
      })
      
      const topChannel = Object.entries(channelDistribution)
        .sort((a, b) => b[1] - a[1])[0]
      
      if (topChannel && topChannel[1] / tickets.length > 0.5) {
        causes.push({
          factor: `Most tickets coming through ${topChannel[0]} channel`,
          impact: 'low',
          evidence: `${Math.round(topChannel[1]/tickets.length*100)}% of tickets`,
          data_support: Math.round(topChannel[1]/tickets.length*100)
        })
      }
    }
  }
  
  // If no specific causes found, add generic one
  if (causes.length === 0) {
    causes.push({
      factor: 'Insufficient data for root cause analysis',
      impact: 'low',
      evidence: 'More historical data needed',
      data_support: 0
    })
  }
  
  return {
    signal_id: signalId,
    potential_causes: causes,
    generated_at: new Date().toISOString()
  }
}

// Identify sub-segments within the data
export async function identifySegments(
  dataType: 'deals' | 'tickets' | 'accounts',
  organizationId: string,
  segmentBy: string
): Promise<Segment[]> {
  const supabase = await createClient()
  const table = `zoho_${dataType}`
  
  const { data } = await supabase
    .from(table)
    .select('*')
    .eq('organization_id', organizationId)
  
  if (!data || data.length === 0) {
    return []
  }
  
  // Group by segment field
  const groups: Record<string, typeof data> = {}
  data.forEach(record => {
    const key = record[segmentBy] || 'Unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(record)
  })
  
  // Calculate segment metrics
  const segments: Segment[] = Object.entries(groups).map(([name, records]) => {
    let avgValue = 0
    
    if (dataType === 'deals') {
      avgValue = records.reduce((sum, r) => sum + (r.amount || 0), 0) / records.length
    } else if (dataType === 'tickets') {
      avgValue = records.reduce((sum, r) => sum + (r.resolution_time_hours || 0), 0) / records.length
    }
    
    return {
      name,
      filter: { [segmentBy]: name },
      count: records.length,
      avg_value: Math.round(avgValue * 100) / 100,
      trend: 'stable' as const, // Would need historical data
      notable: records.length > data.length * 0.2 // Notable if >20% of total
    }
  })
  
  // Sort by count descending
  return segments.sort((a, b) => b.count - a.count)
}

// Detect anomalies in signal data
export async function detectAnomalies(
  signalId: string,
  organizationId: string
): Promise<Anomaly[]> {
  const supabase = await createClient()
  
  // Get historical data
  const { data: dataPoints } = await supabase
    .from('signal_data_points')
    .select('value, recorded_at')
    .eq('signal_id', signalId)
    .order('recorded_at', { ascending: true })
  
  if (!dataPoints || dataPoints.length < 10) {
    return [] // Need enough data for anomaly detection
  }
  
  // Calculate mean and standard deviation
  const values = dataPoints.map(dp => dp.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  )
  
  const anomalies: Anomaly[] = []
  
  // Detect points outside 2 standard deviations
  dataPoints.forEach(dp => {
    const deviation = Math.abs(dp.value - mean)
    if (deviation > 2 * stdDev) {
      const deviationPercentage = (deviation / mean) * 100
      anomalies.push({
        signal_id: signalId,
        detected_at: dp.recorded_at,
        type: dp.value > mean ? 'spike' : 'drop',
        severity: deviation > 3 * stdDev ? 'high' : 'medium',
        value: dp.value,
        expected_value: mean,
        deviation_percentage: Math.round(deviationPercentage)
      })
    }
  })
  
  return anomalies
}
