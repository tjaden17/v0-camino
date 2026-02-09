/**
 * Centralized data points access layer.
 * 
 * All AI analysis services read time-series signal data through this module.
 * Data is stored in the Neon `signal_data_points` table, written during upload
 * calculation (/api/upload/calculate) and integration sync.
 * 
 * Table: signal_data_points
 *   - signal_id (uuid, FK -> signals)
 *   - date (timestamptz)
 *   - value (numeric)
 *   - metadata (jsonb) - source, period, rowCount, calcType
 */

import { sql } from "@/lib/db/neon"

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
    let rows

    if (sinceDate) {
      if (ascending) {
        rows = await sql`
          SELECT date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ${signalId}::uuid
            AND date >= ${sinceDate}
          ORDER BY date ASC
          LIMIT ${limit}
        `
      } else {
        rows = await sql`
          SELECT date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ${signalId}::uuid
            AND date >= ${sinceDate}
          ORDER BY date DESC
          LIMIT ${limit}
        `
      }
    } else {
      if (ascending) {
        rows = await sql`
          SELECT date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ${signalId}::uuid
          ORDER BY date ASC
          LIMIT ${limit}
        `
      } else {
        rows = await sql`
          SELECT date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ${signalId}::uuid
          ORDER BY date DESC
          LIMIT ${limit}
        `
      }
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
    const result = await sql`
      SELECT COUNT(*) as count FROM signal_data_points WHERE signal_id = ${signalId}::uuid
    `
    return Number(result?.[0]?.count || 0)
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
    // Query all at once, then group
    const rows = ascending
      ? await sql`
          SELECT signal_id, date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ANY(${signalIds}::uuid[])
          ORDER BY signal_id, date ASC
        `
      : await sql`
          SELECT signal_id, date, value, metadata
          FROM signal_data_points
          WHERE signal_id = ANY(${signalIds}::uuid[])
          ORDER BY signal_id, date DESC
        `

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
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM signal_data_points sdp
      JOIN signals s ON s.id = sdp.signal_id
      WHERE s.organization_id = ${organizationId}
    `
    return Number(result?.[0]?.count || 0)
  } catch {
    return 0
  }
}
