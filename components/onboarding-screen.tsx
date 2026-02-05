"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveUserProfile } from "@/lib/user-utils"
import { roleConfigurations, getSeniorityFromRole } from "@/lib/role-config"
import type { UserType, UserGroup, UserPermission } from "@/lib/types"
import type { MetricRecommendation } from "@/lib/metrics-by-role"
import { useRouter } from "next/navigation"
import { updateUserSubscription } from "@/lib/plans"
import { SmartMetricsScreen } from "@/components/smart-metrics-screen"

interface OnboardingScreenProps {
  onComplete?: () => void
}

const roleOptions = Object.values(roleConfigurations).map((config) => config.label)

const stageOptions = ["ideation", "introduction", "growth", "maturity", "decline"]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Part 1 state
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")
  const [selectedOutcome, setSelectedOutcome] = useState("")

  const [selectedMetrics, setSelectedMetrics] = useState<MetricRecommendation[]>([])

  const getRoleConfig = (roleLabel: string) => {
    return Object.values(roleConfigurations).find((config) => config.label === roleLabel)
  }

  const currentRoleConfig = selectedRole ? getRoleConfig(selectedRole) : null
  const goalOptions = currentRoleConfig?.defaultGoals || []
  const outcomeOptions = currentRoleConfig?.defaultOutcomes || []

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedRole && selectedGoal && selectedOutcome) {
        setCurrentStep(2)
      }
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleMetricsSelected = (metrics: MetricRecommendation[]) => {
    setSelectedMetrics(metrics)

    const context = `I am a ${selectedRole}. I want to ${selectedGoal} so that ${selectedOutcome}.`
    localStorage.setItem("camino-user-context", context)

    const roleConfig = Object.values(roleConfigurations).find((config) => config.label === selectedRole)
    const roleKey = roleConfig?.role

    const userType: UserType = roleKey ? (getSeniorityFromRole(roleKey).toLowerCase() as UserType) : "ic"
    const groups: UserGroup[] = roleConfig ? [roleConfig.team] : ["product"]
    const permissions: UserPermission[] =
      userType === "elt" ? ["view", "edit", "request"] : userType === "manager" ? ["view", "edit"] : ["view"]

    saveUserProfile({
      id: `user-${Date.now()}`,
      name: "User", // Default name since we're not collecting it
      email: "user@example.com", // Default email
      userType,
      role: roleKey,
      groups,
      permissions,
      context,
      createdAt: new Date().toISOString(),
    })

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)
    updateUserSubscription({
      planType: "team",
      status: "trial",
      trialEndsAt: trialEndsAt.toISOString(),
      signalsUsed: 0,
      datasetsUsed: 0,
    })

    router.push("/insights")
    onComplete?.()
  }

  const roleConfig = selectedRole ? getRoleConfig(selectedRole) : null
  const roleKey = roleConfig?.role

  if (currentStep === 2 && roleKey) {
    return <SmartMetricsScreen role={roleKey} onNext={handleMetricsSelected} onBack={handleBack} />
  }

  const isFormComplete = selectedRole && selectedGoal && selectedOutcome

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 py-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 w-full">
        <h1 className="text-2xl font-bold text-primary">Camino</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs px-2">
            Sign In
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 bg-transparent">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${currentStep === 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${currentStep === 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {currentStep === 1 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance px-2">
                Tell me about yourself
              </h2>
            </div>

            <div className="w-full space-y-6 mb-8">
              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Example:</p>
                <p className="text-sm leading-relaxed">
                  I am a <span className="font-medium">Product Manager</span>. I want to{" "}
                  <span className="font-medium">improve retention</span> so that{" "}
                  <span className="font-medium">we solve customer problems</span>.
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">I am a</label>
                <Select
                  value={selectedRole}
                  onValueChange={(role) => {
                    setSelectedRole(role)
                    setSelectedGoal("")
                    setSelectedOutcome("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Selection */}
              {selectedRole && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">I want to</label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map((goal) => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Outcome Selection */}
              {selectedRole && selectedGoal && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">So that</label>
                  <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select desired outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomeOptions.map((outcome) => (
                        <SelectItem key={outcome} value={outcome}>
                          {outcome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="w-full flex gap-3">
          <Button
            onClick={handleNext}
            disabled={!isFormComplete}
            className="flex-1 py-6 text-lg font-semibold"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Modals */}
      {/* Modals can remain unchanged or be updated based on new requirements */}
    </div>
  )
}
