import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import { getSignalDataPoints } from "@/lib/data-points-service"

export interface Signal {
  id: string
  name: string
  category: string | null
  owner_id: string | null
  benchmark_value: number | null
  benchmark_type: string | null
  trend: string | null
  absolute_value: string | null
  trend_value: string | null
  source_type: string | null
  summary: string | null
  organization_id: string | null
  created_at: string
  updated_at: string
}

export interface DataPoint {
  id: string
  signal_id: string
  value: number
  date: string
  created_at: string
}

export interface SignalWithData extends Signal {
  latest_value: number | null
  previous_value: number | null
  change: number | null
  change_percent: number | null
  data_points: DataPoint[]
  owner_name: string | null
  is_saved?: boolean
  status?: 'needs_attention' | 'opportunity' | 'improved' | 'steady' | 'new'
}

export interface SavedSignal {
  id: string
  user_id: string
  signal_id: string
  saved_at: string
  notes: string | null
}

export async function getSignals(organizationId?: string | null): Promise<SignalWithData[]> {
  try {
    // Query signals from Neon with deduplication (keep most recent by updated_at)
    let signals: Signal[]
    
    if (organizationId) {
      signals = await sql`
        SELECT DISTINCT ON (name) * FROM signals 
        WHERE organization_id = ${organizationId}
        ORDER BY name, updated_at DESC
      `
    } else {
      signals = await sql`
        SELECT DISTINCT ON (name) * FROM signals 
        WHERE organization_id IS NULL
        ORDER BY name, updated_at DESC
      `
    }

    if (!signals || signals.length === 0) {
      return []
    }

    // For now, return signals with basic data structure
    // Data points will be fetched separately if needed
    const signalsWithData: SignalWithData[] = signals.map((signal) => {
      // Parse absolute_value as the latest value
      const latestValue = signal.absolute_value ? parseFloat(signal.absolute_value) : null
      
      return {
        ...signal,
        latest_value: latestValue,
        previous_value: null,
        change: null,
        change_percent: null,
        data_points: [],
        owner_name: null,
      }
    })

    return signalsWithData
  } catch (error) {
    console.error("[v0] getSignals error:", error)
    return []
  }
}

export async function getSignalById(signalId: string): Promise<SignalWithData | null> {
  try {
    const signals = await sql`
      SELECT * FROM signals WHERE id = ${signalId} LIMIT 1
    `

    if (!signals || signals.length === 0) {
      return null
    }

    const signal = signals[0] as Signal
    const latestValue = signal.absolute_value ? parseFloat(signal.absolute_value) : null

    return {
      ...signal,
      latest_value: latestValue,
      previous_value: null,
      change: null,
      change_percent: null,
      data_points: [],
      owner_name: null,
    }
  } catch (error) {
    console.error("[v0] getSignalById error:", error)
    return null
  }
}

// Calculate signal status based on change and trend
export function calculateSignalStatus(
  change_percent: number | null,
  trend: string | null,
  good_direction: string | null,
  has_previous_data: boolean
): 'needs_attention' | 'opportunity' | 'improved' | 'steady' | 'new' {
  if (!has_previous_data) return 'new'
  if (change_percent === null) return 'steady'

  const isGoodDirection = good_direction === 'higher_is_better' 
    ? change_percent > 0 
    : change_percent < 0

  const absChange = Math.abs(change_percent)

  // Bad direction with significant change or sustained bad trend
  if (!isGoodDirection && absChange > 20) return 'needs_attention'
  if (!isGoodDirection && trend === 'decreasing' && absChange > 10) return 'needs_attention'
  
  // Good direction
  if (isGoodDirection && absChange > 10) return 'opportunity'
  if (isGoodDirection && absChange > 5) return 'improved'
  
  return 'steady'
}

// Save a signal for a user
export async function saveSignal(userId: string, signalId: string, notes?: string): Promise<SavedSignal | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_signals')
    .upsert({
      user_id: userId,
      signal_id: signalId,
      notes: notes || null,
      saved_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,signal_id'
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] saveSignal error:', error)
    return null
  }

  return data
}

// Remove a saved signal
export async function unsaveSignal(userId: string, signalId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('saved_signals')
    .delete()
    .eq('user_id', userId)
    .eq('signal_id', signalId)

  if (error) {
    console.error('[v0] unsaveSignal error:', error)
    return false
  }

  return true
}

// Check if a signal is saved by user
export async function isSignalSaved(userId: string, signalId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_signals')
    .select('id')
    .eq('user_id', userId)
    .eq('signal_id', signalId)
    .maybeSingle()

  if (error) {
    console.error('[v0] isSignalSaved error:', error)
    return false
  }

  return !!data
}

// Get all saved signal IDs for a user
export async function getSavedSignalIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('saved_signals')
    .select('signal_id')
    .eq('user_id', userId)

  if (error) {
    console.error('[v0] getSavedSignalIds error:', error)
    return []
  }

  return data?.map(s => s.signal_id) || []
}

// Get signals with saved status for a user
export async function getSignalsWithSavedStatus(userId: string, savedOnly: boolean = false): Promise<SignalWithData[]> {
  const supabase = await createClient()

  // Get saved signal IDs first
  const savedIds = await getSavedSignalIds(userId)
  const savedIdSet = new Set(savedIds)

  // Get all signals
  let query = supabase.from("signals").select("*").order("name")

  // If savedOnly, filter to only saved signals
  if (savedOnly && savedIds.length > 0) {
    query = query.in('id', savedIds)
  } else if (savedOnly && savedIds.length === 0) {
    return []
  }

  const { data: signals, error } = await query

  if (error) {
    console.error("[v0] getSignalsWithSavedStatus error:", error)
    return []
  }

  if (!signals) return []

  const signalsWithData = await Promise.all(
    signals.map(async (signal) => {
      let owner_name = null
      if (signal.owner_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", signal.owner_id)
          .maybeSingle()

        owner_name = profile?.full_name || null
      }

  const points = await getSignalDataPoints(signal.id, { limit: 90 })
      const latest = points[0]
      const previous = points[1]

      let change = null
      let change_percent = null

      if (latest && previous) {
        change = latest.value - previous.value
        change_percent = Number.parseFloat(((change / previous.value) * 100).toFixed(1))
      }

      const status = calculateSignalStatus(
        change_percent,
        signal.trend,
        signal.good_direction || 'higher_is_better',
        !!previous
      )

      return {
        ...signal,
        latest_value: latest?.value || null,
        previous_value: previous?.value || null,
        change,
        change_percent,
        data_points: points,
        owner_name,
        is_saved: savedIdSet.has(signal.id),
        status,
      }
    }),
  )

  return signalsWithData
}

// Group signals by status
export function groupSignalsByStatus(signals: SignalWithData[]): Record<string, SignalWithData[]> {
  const groups: Record<string, SignalWithData[]> = {
    needs_attention: [],
    opportunity: [],
    improved: [],
    steady: [],
    new: [],
  }

  for (const signal of signals) {
    const status = signal.status || 'steady'
    if (groups[status]) {
      groups[status].push(signal)
    }
  }

  return groups
}

  export async function calculate90DayAverage(signalId: string): Promise<number | null> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  
  const dataPoints = await getSignalDataPoints(signalId, { 
    limit: 90, 
    sinceDate: ninetyDaysAgo.toISOString() 
  })
  
  if (dataPoints.length === 0) return null
  
  const sum = dataPoints.reduce((acc, point) => acc + point.value, 0)
  return sum / dataPoints.length
}
