import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSignalById, calculate90DayAverage, isSignalSaved } from "@/lib/signals-service"
import { getOrGenerateInterpretation } from "@/lib/interpretation-service"
import { SignalDetailClient } from "@/components/signal-detail-client"

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const signal = await getSignalById(id)

  if (!signal) {
    redirect("/signals")
  }

  const [ninetyDayAvg, interpretation, isSaved] = await Promise.all([
    calculate90DayAverage(signal.id),
    getOrGenerateInterpretation(signal.id, "7days"),
    isSignalSaved(user.id, signal.id)
  ])

  return <SignalDetailClient signal={signal} ninetyDayAvg={ninetyDayAvg} interpretation={interpretation} isSaved={isSaved} userId={user.id} />
}
