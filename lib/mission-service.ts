import { createClient } from "@/lib/supabase/server"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string | null
  organization: string | null
  industry: string | null
  business_context: string | null
  kpi_1?: string
  kpi_2?: string
  kpi_3?: string
}

export interface KPIOwnership {
  signal_id: string
  signal_name: string
  is_primary: boolean
  latest_value: number | null
  trend: string | null
}

export interface Decision {
  id: string
  title: string
  owner_id: string
  status: string
  context: string | null
  target_date: string | null
  created_at: string
  owner_name: string | null
  signal_count: number
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

  if (error || !data) {
    console.error("[v0] getUserProfile error:", error)
    return null
  }

  return data
}

export async function getUserKPIs(userId: string): Promise<KPIOwnership[]> {
  const supabase = await createClient()

  // First get the user's 3 main KPIs from their profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("kpi_1, kpi_2, kpi_3")
    .eq("id", userId)
    .maybeSingle()

  if (profileError || !profile) {
    console.error("[v0] getUserKPIs profile error:", profileError)
    return []
  }

  // Collect the KPI names
  const kpiNames = [profile.kpi_1, profile.kpi_2, profile.kpi_3].filter(Boolean)

  if (kpiNames.length === 0) {
    return []
  }

  // Return formatted KPI data with the names from the profile
  return kpiNames.map((kpiName, index) => ({
    signal_id: `profile-kpi-${index}`,
    signal_name: kpiName as string,
    is_primary: index === 0, // First KPI is primary
    latest_value: null,
    trend: null,
  }))
}

export async function getUpcomingDecisions(userId: string): Promise<Decision[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("decisions")
    .select(
      `
      *,
      profiles:owner_id (full_name)
    `,
    )
    .eq("owner_id", userId)
    .eq("status", "upcoming")
    .order("target_date", { ascending: true })

  if (error) {
    console.error("[v0] getUpcomingDecisions error:", error)
    return []
  }

  if (!data) return []

  const decisionsWithSignals = await Promise.all(
    data.map(async (decision: any) => {
      const { count } = await supabase
        .from("decision_signals")
        .select("*", { count: "exact", head: true })
        .eq("decision_id", decision.id)

      return {
        ...decision,
        owner_name: decision.profiles?.full_name || null,
        signal_count: count || 0,
      }
    }),
  )

  return decisionsWithSignals
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, organization")
    .order("full_name")

  if (error) {
    console.error("[v0] getAllUsers error:", error)
    return []
  }

  return data || []
}

export async function getUsersWithKPIs() {
  const supabase = await createClient()

  const { data: users } = await supabase.from("profiles").select("id, full_name, role, organization").order("full_name")

  if (!users) return []

  const usersWithKPIs = await Promise.all(
    users.map(async (user) => {
      const { data: kpis } = await supabase
        .from("kpi_ownership")
        .select(
          `
          signals (name)
        `,
        )
        .eq("user_id", user.id)
        .eq("is_primary", true)

      return {
        ...user,
        kpis: kpis?.map((k: any) => k.signals?.name).filter(Boolean) || [],
      }
    }),
  )

  return usersWithKPIs
}
