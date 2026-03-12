import { createClient } from "@/lib/supabase/server"
import { getSignalDataPoints } from "@/lib/data-points-service"

export interface BenchmarkHistory {
  id: string
  signal_id: string
  benchmark_value: number
  benchmark_type: string
  effective_date: string
  created_at: string
  notes: string | null
}

export interface DataQualityMetrics {
  signal_id: string
  signal_name: string
  completeness_score: number | null
  timeliness_score: number | null
  accuracy_score: number | null
  overall_score: number
  last_update_date: string | null
  data_point_count: number
}

export interface SignalAnalytics {
  signal_id: string
  period_start: string
  period_end: string
  period_type: string
  avg_value: number | null
  min_value: number | null
  max_value: number | null
  trend_direction: string | null
  data_point_count: number
}

export interface SignalAlert {
  id: string
  signal_id: string
  signal_name: string
  alert_type: string
  severity: string
  title: string
  description: string | null
  is_read: boolean
  created_at: string
}

export async function getDataQualityReport(): Promise<DataQualityMetrics[]> {
  const supabase = await createClient()

  const { data: signals } = await supabase.from("signals").select("id, name")

  if (!signals) return []

  const qualityMetrics = await Promise.all(
    signals.map(async (signal) => {
      const today = new Date().toISOString().split("T")[0]

      const { data: quality } = await supabase
        .from("data_quality_metrics")
        .select("*")
        .eq("signal_id", signal.id)
        .eq("metric_date", today)
        .single()

      if (quality) {
        const overall =
          ((quality.completeness_score || 0) + (quality.timeliness_score || 0) + (quality.accuracy_score || 0)) / 3

        return {
          signal_id: signal.id,
          signal_name: signal.name,
          completeness_score: quality.completeness_score,
          timeliness_score: quality.timeliness_score,
          accuracy_score: quality.accuracy_score,
          overall_score: Math.round(overall),
          last_update_date: quality.last_update_date,
          data_point_count: quality.data_point_count || 0,
        }
      }

      // Calculate on the fly if not cached - use Neon signal_data_points
      const dataPoints = await getSignalDataPoints(signal.id, { limit: 500 })

      const count = dataPoints.length
      const lastUpdate = dataPoints[0]?.date || null

      // Simple quality calculation
      const daysSinceUpdate = lastUpdate ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 86400000) : 999
      const timeliness = daysSinceUpdate <= 1 ? 100 : daysSinceUpdate <= 7 ? 80 : daysSinceUpdate <= 30 ? 50 : 20

      const completeness = Math.min(100, (count / 30) * 100)
      const overall = (completeness + timeliness + 90) / 3

      return {
        signal_id: signal.id,
        signal_name: signal.name,
        completeness_score: Math.round(completeness),
        timeliness_score: timeliness,
        accuracy_score: 90,
        overall_score: Math.round(overall),
        last_update_date: lastUpdate,
        data_point_count: count,
      }
    }),
  )

  return qualityMetrics.sort((a, b) => a.overall_score - b.overall_score)
}

export async function getBenchmarkHistory(signalId: string): Promise<BenchmarkHistory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("benchmark_history")
    .select("*")
    .eq("signal_id", signalId)
    .order("effective_date", { ascending: false })

  if (error) {
    console.error("[v0] getBenchmarkHistory error:", error)
    return []
  }

  return data || []
}

export async function getUserAlerts(userId: string): Promise<SignalAlert[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("signal_alerts")
    .select(
      `
      *,
      signals (name)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] getUserAlerts error:", error)
    return []
  }

  return (
    data?.map((alert: any) => ({
      ...alert,
      signal_name: alert.signals?.name || "Unknown Signal",
    })) || []
  )
}

export async function getSignalAnalytics(signalId: string, periodType = "week"): Promise<SignalAnalytics[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("signal_analytics")
    .select("*")
    .eq("signal_id", signalId)
    .eq("period_type", periodType)
    .order("period_start", { ascending: false })
    .limit(12)

  if (error) {
    console.error("[v0] getSignalAnalytics error:", error)
    return []
  }

  return data || []
}

export async function updateBenchmark(
  signalId: string,
  benchmarkValue: number,
  benchmarkType: string,
  effectiveDate: string,
  notes: string | null,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Update signal table
  const { error: signalError } = await supabase
    .from("signals")
    .update({
      benchmark_value: benchmarkValue,
      benchmark_type: benchmarkType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", signalId)

  if (signalError) {
    console.error("[v0] updateBenchmark signal error:", signalError)
    return false
  }

  // Add to history
  const { error: historyError } = await supabase.from("benchmark_history").insert({
    signal_id: signalId,
    benchmark_value: benchmarkValue,
    benchmark_type: benchmarkType,
    effective_date: effectiveDate,
    notes,
    created_by: userId,
  })

  if (historyError) {
    console.error("[v0] updateBenchmark history error:", historyError)
    return false
  }

  return true
}
