"use client"

import { OnboardingScreen } from "@/components/onboarding-screen"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = () => {
    localStorage.setItem("camino-onboarding-complete", "true")
    router.push("/insights")
  }

  return (
    <main className="min-h-screen bg-background">
      <OnboardingScreen onComplete={handleOnboardingComplete} />
    </main>
  )
}
