import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile, getUserKPIs, getUpcomingDecisions } from "@/lib/mission-service"
import { MissionPageClient } from "@/components/mission-page-client"

export default async function MissionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getUserProfile(user.id)
  const kpis = await getUserKPIs(user.id)
  const decisions = await getUpcomingDecisions(user.id)

  return <MissionPageClient profile={profile} kpis={kpis} decisions={decisions} />
}
