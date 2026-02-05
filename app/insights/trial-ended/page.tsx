"use client"

import { useEffect, useState } from "react"
import { TrialEndedModal } from "@/components/trial-ended-modal"
import { getUserSubscription } from "@/lib/plans"
import { useRouter } from "next/navigation"

export default function TrialEndedPage() {
  const router = useRouter()
  const [daysRemaining, setDaysRemaining] = useState(3)

  useEffect(() => {
    const subscription = getUserSubscription()
    if (subscription.status === "trial" && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt)
      const today = new Date()
      const diffTime = trialEnd.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(Math.max(0, diffDays))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <TrialEndedModal daysRemaining={daysRemaining} onClose={() => router.push("/insights")} />
    </div>
  )
}
