import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
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

  // Get user's organization and role from Neon profile (where onboarding saves it)
  const profileResult = await sql`
    SELECT organization_id, role FROM profiles WHERE id = ${user.id} LIMIT 1
  `
  
  const profile = profileResult?.[0] || null
  const organizationId = profile?.organization_id || null
  const userRole = profile?.role || "manager"

  const [signals, savedSignalIds] = await Promise.all([
    getSignals(organizationId),
    getSavedSignalIds(user.id)
  ])

  return <SignalsPageClient signals={signals} userId={user.id} savedSignalIds={savedSignalIds} userRole={userRole} />
}
