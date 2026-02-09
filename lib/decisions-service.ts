import { createClient } from "@/lib/supabase/server"
import { getSignalDataPoints } from "@/lib/data-points-service"

export interface DecisionWithDetails {
  id: string
  title: string
  owner_id: string
  owner_name: string | null
  status: string
  context: string | null
  target_date: string | null
  created_at: string
  decided_at: string | null
  implemented_at: string | null
  signals: DecisionSignal[]
}

export interface DecisionSignal {
  id: string
  signal_id: string
  signal_name: string
  snapshot_value: number | null
  snapshot_benchmark: number | null
  snapshot_date: string | null
  current_value: number | null
  change: number | null
}

export async function getAllDecisions(): Promise<DecisionWithDetails[]> {
  const supabase = await createClient()

  const { data: decisions, error } = await supabase
    .from("decisions")
    .select(
      `
      *,
      profiles:owner_id (full_name)
    `,
    )
    .order("target_date", { ascending: true })

  if (error || !decisions) {
    console.error("[v0] getAllDecisions error:", error)
    return []
  }

  const decisionsWithDetails = await Promise.all(
    decisions.map(async (decision: any) => {
      const { data: signalLinks } = await supabase
        .from("decision_signals")
        .select(
          `
          id,
          signal_id,
          snapshot_value,
          snapshot_benchmark,
          snapshot_date,
          signals (name)
        `,
        )
        .eq("decision_id", decision.id)

      const signals: DecisionSignal[] = await Promise.all(
        (signalLinks || []).map(async (link: any) => {
  const latestPoints = await getSignalDataPoints(link.signal_id, { limit: 1 })
  
  const current_value = latestPoints[0]?.value || null
  const change =
  current_value !== null && link.snapshot_value !== null ? current_value - link.snapshot_value : null

          return {
            id: link.id,
            signal_id: link.signal_id,
            signal_name: link.signals?.name || "Unknown",
            snapshot_value: link.snapshot_value,
            snapshot_benchmark: link.snapshot_benchmark,
            snapshot_date: link.snapshot_date,
            current_value,
            change,
          }
        }),
      )

      return {
        ...decision,
        owner_name: decision.profiles?.full_name || null,
        signals,
      }
    }),
  )

  return decisionsWithDetails
}

export async function getDecisionById(decisionId: string): Promise<DecisionWithDetails | null> {
  const supabase = await createClient()

  const { data: decision, error } = await supabase
    .from("decisions")
    .select(
      `
      *,
      profiles:owner_id (full_name)
    `,
    )
    .eq("id", decisionId)
    .single()

  if (error || !decision) {
    console.error("[v0] getDecisionById error:", error)
    return null
  }

  const { data: signalLinks } = await supabase
    .from("decision_signals")
    .select(
      `
      id,
      signal_id,
      snapshot_value,
      snapshot_benchmark,
      snapshot_date,
      signals (name)
    `,
    )
    .eq("decision_id", decisionId)

  const signals: DecisionSignal[] = await Promise.all(
    (signalLinks || []).map(async (link: any) => {
      const latestPoints = await getSignalDataPoints(link.signal_id, { limit: 1 })

      const current_value = latestPoints[0]?.value || null
      const change = current_value !== null && link.snapshot_value !== null ? current_value - link.snapshot_value : null

      return {
        id: link.id,
        signal_id: link.signal_id,
        signal_name: link.signals?.name || "Unknown",
        snapshot_value: link.snapshot_value,
        snapshot_benchmark: link.snapshot_benchmark,
        snapshot_date: link.snapshot_date,
        current_value,
        change,
      }
    }),
  )

  return {
    ...decision,
    owner_name: decision.profiles?.full_name || null,
    signals,
  }
}

export async function getUserDecisions(userId: string): Promise<DecisionWithDetails[]> {
  const supabase = await createClient()

  const { data: decisions, error } = await supabase
    .from("decisions")
    .select(
      `
      *,
      profiles:owner_id (full_name)
    `,
    )
    .eq("owner_id", userId)
    .order("target_date", { ascending: true })

  if (error || !decisions) {
    console.error("[v0] getUserDecisions error:", error)
    return []
  }

  const decisionsWithDetails = await Promise.all(
    decisions.map(async (decision: any) => {
      const { data: signalLinks } = await supabase
        .from("decision_signals")
        .select(
          `
          id,
          signal_id,
          snapshot_value,
          snapshot_benchmark,
          snapshot_date,
          signals (name)
        `,
        )
        .eq("decision_id", decision.id)

      const signals: DecisionSignal[] = await Promise.all(
        (signalLinks || []).map(async (link: any) => {
  const latestPoints = await getSignalDataPoints(link.signal_id, { limit: 1 })
  
  const current_value = latestPoints[0]?.value || null
  const change =
  current_value !== null && link.snapshot_value !== null ? current_value - link.snapshot_value : null

          return {
            id: link.id,
            signal_id: link.signal_id,
            signal_name: link.signals?.name || "Unknown",
            snapshot_value: link.snapshot_value,
            snapshot_benchmark: link.snapshot_benchmark,
            snapshot_date: link.snapshot_date,
            current_value,
            change,
          }
        }),
      )

      return {
        ...decision,
        owner_name: decision.profiles?.full_name || null,
        signals,
      }
    }),
  )

  return decisionsWithDetails
}
