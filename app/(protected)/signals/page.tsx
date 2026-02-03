import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  console.log("[v0] Signals page - user:", user.id)

  const [signals, savedSignalIds] = await Promise.all([
    getSignals(null),
    getSavedSignalIds(user.id),
  ])

  console.log("[v0] Signals page - found", signals.length, "signals")

  return (
    <SignalsPageClient
      signals={signals}
      userId={user.id}
      savedSignalIds={savedSignalIds}
      userRole="manager"
    />
  )
}
