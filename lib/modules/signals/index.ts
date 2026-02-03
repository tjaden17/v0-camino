/**
 * Signals Module
 * 
 * Responsibility: Signal discovery, calculation, and quality
 * - Signal definitions
 * - Discovery from staged data
 * - Value calculation
 * - Quality scoring
 */

import { createClient } from '@/lib/supabase/server'
import { getDataSources } from '@/lib/modules/staging'
import type { DataSource } from '@/lib/modules/staging'

// Types
export interface SignalDefinition {
  id: string
  name: string
  description: string
  category: 'sales' | 'support' | 'customer' | 'operations' | 'finance'
  required_data_sources: DataSource['data_type'][]
  calculation: string
  unit: 'count' | 'currency' | 'percentage' | 'days' | 'hours'
}

export interface Signal {
  id: string
  name: string
  category: string
  owner_id: string
  benchmark_value: number | null
  benchmark_type: 'internal' | 'industry' | 'user_defined'
  trend: 'up' | 'down' | 'stable'
  created_at: string
}

export interface SignalValue {
  signal_id: string
  value: number
  calculated_at: string
  data_sources_used: string[]
}

export interface QualityScore {
  signal_id: string
  score: number // 0-100
  factors: {
    data_completeness: number
    data_recency: number
    sample_size: number
    consistency: number
  }
  recommendations: string[]
}

// Signal definitions registry
export const SIGNAL_DEFINITIONS: SignalDefinition[] = [
  // Single-source signals (CRM)
  {
    id: 'total_pipeline_value',
    name: 'Total Pipeline Value',
    description: 'Sum of all open deal amounts',
    category: 'sales',
    required_data_sources: ['deals'],
    calculation: 'SUM(amount) WHERE stage NOT IN (Closed Won, Closed Lost)',
    unit: 'currency'
  },
  {
    id: 'deals_closing_this_month',
    name: 'Deals Closing This Month',
    description: 'Number of deals with closing date this month',
    category: 'sales',
    required_data_sources: ['deals'],
    calculation: 'COUNT(*) WHERE closing_date IN current_month',
    unit: 'count'
  },
  {
    id: 'average_deal_size',
    name: 'Average Deal Size',
    description: 'Average amount across all deals',
    category: 'sales',
    required_data_sources: ['deals'],
    calculation: 'AVG(amount)',
    unit: 'currency'
  },
  {
    id: 'win_rate',
    name: 'Win Rate',
    description: 'Percentage of deals won vs total closed',
    category: 'sales',
    required_data_sources: ['deals'],
    calculation: 'COUNT(Closed Won) / COUNT(Closed Won + Closed Lost) * 100',
    unit: 'percentage'
  },
  
  // Single-source signals (Support)
  {
    id: 'open_tickets',
    name: 'Open Tickets',
    description: 'Number of unresolved support tickets',
    category: 'support',
    required_data_sources: ['tickets'],
    calculation: 'COUNT(*) WHERE status NOT IN (Closed, Resolved)',
    unit: 'count'
  },
  {
    id: 'avg_resolution_time',
    name: 'Avg Resolution Time',
    description: 'Average time to resolve tickets',
    category: 'support',
    required_data_sources: ['tickets'],
    calculation: 'AVG(resolution_time_hours)',
    unit: 'hours'
  },
  {
    id: 'escalation_rate',
    name: 'Escalation Rate',
    description: 'Percentage of tickets that get escalated',
    category: 'support',
    required_data_sources: ['tickets'],
    calculation: 'COUNT(is_escalated=true) / COUNT(*) * 100',
    unit: 'percentage'
  },
  {
    id: 'first_response_time',
    name: 'First Response Time',
    description: 'Average time to first response',
    category: 'support',
    required_data_sources: ['tickets'],
    calculation: 'AVG(first_response_time_hours)',
    unit: 'hours'
  },
  
  // Multi-source signals (CRM + Support)
  {
    id: 'customer_health_score',
    name: 'Customer Health Score',
    description: 'Combined metric of account value and support burden',
    category: 'customer',
    required_data_sources: ['deals', 'tickets', 'accounts'],
    calculation: 'WEIGHTED(deal_value, ticket_frequency, sentiment)',
    unit: 'percentage'
  },
  {
    id: 'revenue_at_risk',
    name: 'Revenue at Risk',
    description: 'Value of deals from accounts with high support issues',
    category: 'sales',
    required_data_sources: ['deals', 'tickets'],
    calculation: 'SUM(deal.amount) WHERE account IN (SELECT account FROM tickets WHERE is_escalated OR sentiment=negative)',
    unit: 'currency'
  },
  {
    id: 'support_cost_ratio',
    name: 'Support Cost per Deal Value',
    description: 'Ratio of support tickets to deal value by account',
    category: 'operations',
    required_data_sources: ['deals', 'tickets', 'accounts'],
    calculation: 'COUNT(tickets) / SUM(deal.amount) GROUP BY account',
    unit: 'percentage'
  }
]

// Get available signals based on current data sources
export async function getAvailableSignals(organizationId: string): Promise<{
  available: SignalDefinition[]
  locked: Array<SignalDefinition & { missing: DataSource['data_type'][] }>
}> {
  const dataSources = await getDataSources(organizationId)
  const availableTypes = dataSources.map(ds => ds.data_type)
  
  const available: SignalDefinition[] = []
  const locked: Array<SignalDefinition & { missing: DataSource['data_type'][] }> = []
  
  for (const signal of SIGNAL_DEFINITIONS) {
    const missing = signal.required_data_sources.filter(req => !availableTypes.includes(req))
    
    if (missing.length === 0) {
      available.push(signal)
    } else {
      locked.push({ ...signal, missing })
    }
  }
  
  return { available, locked }
}

// Calculate a signal value
export async function calculateSignal(
  signalId: string,
  organizationId: string
): Promise<SignalValue | null> {
  const supabase = await createClient()
  const definition = SIGNAL_DEFINITIONS.find(s => s.id === signalId)
  
  if (!definition) {
    console.error(`Signal definition not found: ${signalId}`)
    return null
  }
  
  // Check data sources are available
  const dataSources = await getDataSources(organizationId)
  const availableTypes = dataSources.map(ds => ds.data_type)
  const missing = definition.required_data_sources.filter(req => !availableTypes.includes(req))
  
  if (missing.length > 0) {
    console.error(`Missing data sources for signal ${signalId}: ${missing.join(', ')}`)
    return null
  }
  
  let value = 0
  
  // Calculate based on signal type
  switch (signalId) {
    case 'total_pipeline_value': {
      const { data } = await supabase
        .from('zoho_deals')
        .select('amount')
        .eq('organization_id', organizationId)
        .not('stage', 'in', '("Closed Won","Closed Lost")')
      value = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      break
    }
    
    case 'average_deal_size': {
      const { data } = await supabase
        .from('zoho_deals')
        .select('amount')
        .eq('organization_id', organizationId)
        .not('amount', 'is', null)
      if (data && data.length > 0) {
        value = data.reduce((sum, d) => sum + (d.amount || 0), 0) / data.length
      }
      break
    }
    
    case 'open_tickets': {
      const { count } = await supabase
        .from('zoho_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .not('status', 'in', '("Closed","Resolved")')
      value = count || 0
      break
    }
    
    case 'avg_resolution_time': {
      const { data } = await supabase
        .from('zoho_tickets')
        .select('resolution_time_hours')
        .eq('organization_id', organizationId)
        .not('resolution_time_hours', 'is', null)
      if (data && data.length > 0) {
        value = data.reduce((sum, t) => sum + (t.resolution_time_hours || 0), 0) / data.length
      }
      break
    }
    
    case 'escalation_rate': {
      const { count: total } = await supabase
        .from('zoho_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
      
      const { count: escalated } = await supabase
        .from('zoho_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_escalated', true)
      
      if (total && total > 0) {
        value = ((escalated || 0) / total) * 100
      }
      break
    }
    
    // Add more calculations as needed
    default:
      console.warn(`Calculation not implemented for signal: ${signalId}`)
      return null
  }
  
  return {
    signal_id: signalId,
    value,
    calculated_at: new Date().toISOString(),
    data_sources_used: definition.required_data_sources
  }
}

// Score signal quality
export function scoreSignalQuality(
  sampleSize: number,
  dataRecencyDays: number,
  completenessPercentage: number
): QualityScore {
  // Sample size scoring (0-100)
  let sampleScore = Math.min(100, (sampleSize / 100) * 100) // 100+ records = full score
  
  // Recency scoring (0-100) - data older than 30 days starts losing points
  let recencyScore = Math.max(0, 100 - (Math.max(0, dataRecencyDays - 7) * 3))
  
  // Completeness scoring (direct percentage)
  let completenessScore = completenessPercentage
  
  // Consistency scoring (placeholder - would need historical data)
  let consistencyScore = 80 // Default good
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (sampleScore * 0.25) +
    (recencyScore * 0.25) +
    (completenessScore * 0.35) +
    (consistencyScore * 0.15)
  )
  
  // Generate recommendations
  const recommendations: string[] = []
  if (sampleScore < 70) {
    recommendations.push('Import more historical data for better accuracy')
  }
  if (recencyScore < 70) {
    recommendations.push('Data is getting stale - consider a fresh import')
  }
  if (completenessScore < 70) {
    recommendations.push('Many records have missing fields - check data quality at source')
  }
  
  return {
    signal_id: '',
    score: overallScore,
    factors: {
      data_completeness: completenessScore,
      data_recency: recencyScore,
      sample_size: sampleScore,
      consistency: consistencyScore
    },
    recommendations
  }
}

// Create or update a signal in the database
export async function upsertSignal(
  name: string,
  category: string,
  ownerId: string,
  value?: number
): Promise<Signal | null> {
  const supabase = await createClient()
  
  // Check if exists
  const { data: existing } = await supabase
    .from('signals')
    .select('id')
    .eq('name', name)
    .single()
  
  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('signals')
      .update({
        benchmark_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating signal:', error)
      return null
    }
    return data
  }
  
  // Create
  const { data, error } = await supabase
    .from('signals')
    .insert({
      name,
      category,
      owner_id: ownerId,
      created_by: ownerId,
      benchmark_value: value,
      benchmark_type: 'internal',
      trend: 'stable'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating signal:', error)
    return null
  }
  
  return data
}
