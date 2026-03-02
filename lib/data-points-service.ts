/**
 * Centralized data points access layer.
 *
 * All AI analysis services read time-series signal data through this module.
 * Data is stored in the Supabase `signal_data_points` table, written during upload
 * calculation (/api/upload/calculate) and integration sync.
 *
 * Table: signal_data_points
 *   - signal_id (uuid, FK -> signals)
 *   - date (timestamptz)
 *   - value (numeric)
 *   - metadata (jsonb) - source, period, rowCount, calcType
 */

import { createAdminClient } from "@/lib/supabase/admin"

export interface DataPoint {
  date: string
  value: number
  metadata?: Record<string, any>
}

/**
 * Get data points for a signal, ordered by date descending.
 * Used by: AIAnalysisService, InterpretationService, SignalsService, etc.
 */
export async function getSignalDataPoints(
  signalId: string,
  options: {
    limit?: number
    ascending?: boolean
    sinceDate?: string
  } = {}
): Promise<DataPoint[]> {
  const { limit = 90, ascending = false, sinceDate } = options

  try {
    const supabase = createAdminClient()

    let query = supabase
      .from("signal_data_points")
      .select("date, value, metadata")
      .eq("signal_id", signalId)
      .order("date", { ascending })
      .limit(limit)

    if (sinceDate) {
      query = query.gte("date", sinceDate)
    }

    const { data: rows, error } = await query

    if (error) {
      console.error("[DataPointsService] Supabase error:", error)
      return []
    }

    return (rows || []).map((r: any) => ({
      date: r.date instanceof Date ? r.date.toISOString() : r.date,
      value: Number(r.value),
      metadata: r.metadata || undefined,
    }))
  } catch (err) {
    console.error("[DataPointsService] Error fetching data points for signal:", signalId, err)
    return []
  }
}

/**
 * Get data point count for a signal.
 */
export async function getSignalDataPointCount(signalId: string): Promise<number> {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("signal_data_points")
      .select("*", { count: "exact", head: true })
      .eq("signal_id", signalId)

    if (error) {
      console.error("[DataPointsService] count error:", error)
      return 0
    }

    return count || 0
  } catch {
    return 0
  }
}

/**
 * Get data points for multiple signals at once (for relationship detection).
 */
export async function getMultiSignalDataPoints(
  signalIds: string[],
  options: { limit?: number; ascending?: boolean } = {}
): Promise<Map<string, DataPoint[]>> {
  const { limit = 90, ascending = true } = options
  const result = new Map<string, DataPoint[]>()

  if (signalIds.length === 0) return result

  try {
    const supabase = createAdminClient()

    const { data: rows, error } = await supabase
      .from("signal_data_points")
      .select("signal_id, date, value, metadata")
      .in("signal_id", signalIds)
      .order("signal_id")
      .order("date", { ascending })

    if (error) {
      console.error("[DataPointsService] multi-signal error:", error)
      return result
    }

    for (const row of (rows || [])) {
      const id = row.signal_id
      if (!result.has(id)) result.set(id, [])
      const arr = result.get(id)!
      if (arr.length < limit) {
        arr.push({
          date: row.date instanceof Date ? row.date.toISOString() : row.date,
          value: Number(row.value),
          metadata: row.metadata || undefined,
        })
      }
    }
  } catch (err) {
    console.error("[DataPointsService] Error fetching multi-signal data points:", err)
  }

  return result
}

/**
 * Get total data points count across all signals for an org.
 */
export async function getOrgDataPointCount(organizationId: string): Promise<number> {
  try {
    const supabase = createAdminClient()

    // Get all signal IDs for the org, then count their data points
    const { data: signals, error: sigError } = await supabase
      .from("signals")
      .select("id")
      .eq("organization_id", organizationId)

    if (sigError || !signals || signals.length === 0) return 0

    const signalIds = signals.map((s: any) => s.id)

    const { count, error } = await supabase
      .from("signal_data_points")
      .select("*", { count: "exact", head: true })
      .in("signal_id", signalIds)

    if (error) {
      console.error("[DataPointsService] org count error:", error)
      return 0
    }

    return count || 0
  } catch {
    return 0
  }
}
