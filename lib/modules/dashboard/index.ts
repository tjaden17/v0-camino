/**
 * Dashboard Module
 * 
 * Responsibility: Compose and serve signal cards with three views
 * - "What We Found" - data source, date range, quality
 * - "What It Means" - trends, root cause, segments
 * - "So What" - goals, impact, projections
 */

import { createClient } from '@/lib/supabase/server'
import { getDataSources } from '@/lib/modules/staging'
import { calculateSignal, scoreSignalQuality, SIGNAL_DEFINITIONS } from '@/lib/modules/signals'
import { calculateTrend, analyzeRootCause, identifySegments } from '@/lib/modules/analysis'
import { generateSoWhatView } from '@/lib/modules/impact'
import type { SignalDefinition, QualityScore } from '@/lib/modules/signals'
import type { Trend, RootCause, Segment } from '@/lib/modules/analysis'
import type { Impact, Projection, DirectionalAssessment, Goal } from '@/lib/modules/impact'

// Types
export interface SignalCard {
  id: string
  signal: SignalDefinition
  current_value: number | null
  last_updated: string | null
  trend_direction: 'up' | 'down' | 'stable'
  quality_score: number
  has_full_data: boolean
}

export interface WhatWeFoundView {
  signal_id: string
  data_sources: Array<{
    type: string
    source_system: string
    record_count: number
    last_import: string
  }>
  date_range: {
    start: string
    end: string
  } | null
  data_quality: QualityScore
  signal_quality: QualityScore
  export_available: boolean
}

export interface WhatItMeansView {
  signal_id: string
  trend: Trend | null
  root_causes: RootCause | null
  segments: Segment[]
}

export interface SoWhatView {
  signal_id: string
  impacts: Impact[]
  projection: Projection | null
  assessment: DirectionalAssessment | null
  related_goals: Goal[]
}

// Get signal cards for dashboard
export async function getSignalCards(
  organizationId: string,
  userId: string
): Promise<SignalCard[]> {
  const supabase = await createClient()
  
  // Get user's enabled signals
  const { data: userSignals } = await supabase
    .from('signals')
    .select('*')
    .eq('owner_id', userId)
  
  // Get available data sources
  const dataSources = await getDataSources(organizationId)
  const availableTypes = dataSources.map(ds => ds.data_type)
  
  const cards: SignalCard[] = []
  
  for (const userSignal of userSignals || []) {
    // Find matching definition
    const definition = SIGNAL_DEFINITIONS.find(d => d.name === userSignal.name)
    
    if (definition) {
      // Check if we have all required data
      const hasFullData = definition.required_data_sources.every(
        req => availableTypes.includes(req)
      )
      
      // Calculate current value if possible
      let currentValue: number | null = null
      if (hasFullData) {
        const result = await calculateSignal(definition.id, organizationId)
        currentValue = result?.value ?? null
      }
      
      // Get quality score
      const qualityScore = scoreSignalQuality(
        100, // placeholder sample size
        7,   // placeholder recency
        hasFullData ? 85 : 50
      )
      
      cards.push({
        id: userSignal.id,
        signal: definition,
        current_value: currentValue ?? userSignal.benchmark_value,
        last_updated: userSignal.updated_at,
        trend_direction: userSignal.trend || 'stable',
        quality_score: qualityScore.score,
        has_full_data: hasFullData
      })
    }
  }
  
  return cards
}

// Get "What We Found" view for a signal
export async function getWhatWeFoundView(
  signalId: string,
  organizationId: string
): Promise<WhatWeFoundView> {
  const supabase = await createClient()
  
  // Get signal definition
  const { data: signal } = await supabase
    .from('signals')
    .select('*')
    .eq('id', signalId)
    .single()
  
  const definition = SIGNAL_DEFINITIONS.find(d => d.name === signal?.name)
  
  // Get data sources
  const allSources = await getDataSources(organizationId)
  const relevantSources = definition 
    ? allSources.filter(ds => definition.required_data_sources.includes(ds.data_type))
    : allSources
  
  // Calculate date range from staged data
  let dateRange: { start: string; end: string } | null = null
  if (relevantSources.length > 0) {
    // Get earliest and latest import dates
    const dates = relevantSources.map(s => new Date(s.last_import_at))
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))
    dateRange = {
      start: earliest.toISOString(),
      end: latest.toISOString()
    }
  }
  
  // Calculate quality scores
  const totalRecords = relevantSources.reduce((sum, s) => sum + s.record_count, 0)
  const recencyDays = relevantSources.length > 0 
    ? Math.floor((Date.now() - new Date(relevantSources[0].last_import_at).getTime()) / (1000 * 60 * 60 * 24))
    : 30
  
  const dataQuality = scoreSignalQuality(totalRecords, recencyDays, 80)
  const signalQuality = scoreSignalQuality(totalRecords, recencyDays, relevantSources.length > 0 ? 85 : 50)
  
  return {
    signal_id: signalId,
    data_sources: relevantSources.map(s => ({
      type: s.data_type,
      source_system: s.source_system,
      record_count: s.record_count,
      last_import: s.last_import_at
    })),
    date_range: dateRange,
    data_quality: { ...dataQuality, signal_id: signalId },
    signal_quality: { ...signalQuality, signal_id: signalId },
    export_available: totalRecords > 0
  }
}

// Get "What It Means" view for a signal
export async function getWhatItMeansView(
  signalId: string,
  organizationId: string
): Promise<WhatItMeansView> {
  const supabase = await createClient()
  
  // Get signal info
  const { data: signal } = await supabase
    .from('signals')
    .select('*')
    .eq('id', signalId)
    .single()
  
  const definition = SIGNAL_DEFINITIONS.find(d => d.name === signal?.name)
  
  // Calculate trend
  const trend = await calculateTrend(signalId, organizationId, '30d')
  
  // Get root causes
  const rootCauses = await analyzeRootCause(signalId, organizationId)
  
  // Get segments based on first required data source
  let segments: Segment[] = []
  if (definition && definition.required_data_sources.length > 0) {
    const dataType = definition.required_data_sources[0]
    const segmentBy = dataType === 'deals' ? 'stage' 
      : dataType === 'tickets' ? 'priority'
      : dataType === 'accounts' ? 'industry'
      : 'status'
    
    segments = await identifySegments(
      dataType as 'deals' | 'tickets' | 'accounts',
      organizationId,
      segmentBy
    )
  }
  
  return {
    signal_id: signalId,
    trend,
    root_causes: rootCauses,
    segments
  }
}

// Get "So What" view for a signal
export async function getSoWhatView(
  signalId: string,
  organizationId: string
): Promise<SoWhatView> {
  const supabase = await createClient()
  
  // Get signal info
  const { data: signal } = await supabase
    .from('signals')
    .select('*')
    .eq('id', signalId)
    .single()
  
  const definition = SIGNAL_DEFINITIONS.find(d => d.name === signal?.name)
  
  // Get current value
  let currentValue = signal?.benchmark_value || 0
  if (definition) {
    const result = await calculateSignal(definition.id, organizationId)
    if (result) {
      currentValue = result.value
    }
  }
  
  // Get trend for projections
  const trend = await calculateTrend(signalId, organizationId, '30d')
  
  if (!trend) {
    return {
      signal_id: signalId,
      impacts: [],
      projection: null,
      assessment: null,
      related_goals: []
    }
  }
  
  // Generate full "So What" view
  const soWhat = await generateSoWhatView(signalId, organizationId, currentValue, trend)
  
  return {
    signal_id: signalId,
    impacts: soWhat.impact,
    projection: soWhat.projection,
    assessment: soWhat.assessment,
    related_goals: soWhat.relatedGoals
  }
}

// Compose a complete signal card with all views
export async function composeFullSignalCard(
  signalId: string,
  organizationId: string
): Promise<{
  card: SignalCard | null
  found: WhatWeFoundView
  means: WhatItMeansView
  soWhat: SoWhatView
}> {
  const supabase = await createClient()
  
  const { data: signal } = await supabase
    .from('signals')
    .select('*')
    .eq('id', signalId)
    .single()
  
  if (!signal) {
    throw new Error(`Signal not found: ${signalId}`)
  }
  
  const definition = SIGNAL_DEFINITIONS.find(d => d.name === signal.name)
  
  // Get all views in parallel
  const [found, means, soWhat] = await Promise.all([
    getWhatWeFoundView(signalId, organizationId),
    getWhatItMeansView(signalId, organizationId),
    getSoWhatView(signalId, organizationId)
  ])
  
  // Compose card
  const card: SignalCard | null = definition ? {
    id: signal.id,
    signal: definition,
    current_value: signal.benchmark_value,
    last_updated: signal.updated_at,
    trend_direction: signal.trend || 'stable',
    quality_score: found.signal_quality.score,
    has_full_data: found.data_sources.length >= (definition.required_data_sources.length)
  } : null
  
  return { card, found, means, soWhat }
}
