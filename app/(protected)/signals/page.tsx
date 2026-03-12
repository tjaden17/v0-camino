import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSignals, getSavedSignalIds } from "@/lib/signals-service"
import { SignalsPageClient } from "@/components/signals-page-client"

export default async function SignalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's organization, role, and KPIs from profile (for "my KPIs at top" ordering)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id, role, kpi_1, kpi_2, kpi_3")
    .eq("id", user.id)
    .maybeSingle()

  const organizationId = profile?.organization_id || null
  const userRole = (profile?.role === "executive" ? "executive" : "manager") as "executive" | "manager"
  const preferredKpis: string[] = [profile?.kpi_1, profile?.kpi_2, profile?.kpi_3].filter(Boolean) as string[]

  const [signals, savedSignalIds] = await Promise.all([
    getSignals(organizationId),
    getSavedSignalIds(user.id)
  ])

  return (
    <SignalsPageClient
      signals={signals}
      userId={user.id}
      savedSignalIds={savedSignalIds}
      userRole={userRole}
      preferredKpis={preferredKpis}
    />
  )
}
