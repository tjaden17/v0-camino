import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getDataQualityReport, getUserAlerts } from "@/lib/data-foundations-service"
import { InsightsPageClient } from "@/components/insights-page-client"

export default async function InsightsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const qualityReport = await getDataQualityReport()
  const alerts = await getUserAlerts(user.id)

  return <InsightsPageClient qualityReport={qualityReport} alerts={alerts} />
}
