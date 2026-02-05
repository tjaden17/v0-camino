"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { plans } from "@/lib/plans"
import { getUserSubscription, updateUserSubscription } from "@/lib/plans"
import { useRouter } from "next/navigation"
import type { PlanType } from "@/lib/types"

export function ViewPlansScreen() {
  const router = useRouter()
  const subscription = getUserSubscription()
  const [currentPlan, setCurrentPlan] = useState<PlanType>(subscription.planType)

  const handleSelectPlan = (planType: PlanType) => {
    if (planType === "team") {
      // Start team trial
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 30)
      updateUserSubscription({
        planType: "team",
        status: "trial",
        trialEndsAt: trialEndsAt.toISOString(),
        signalsUsed: subscription.signalsUsed || 0,
        datasetsUsed: subscription.datasetsUsed || 0,
      })
      setCurrentPlan("team")
      router.push("/profile")
    } else if (planType === "individual") {
      updateUserSubscription({
        planType: "individual",
        status: "active",
        signalsUsed: subscription.signalsUsed || 0,
        datasetsUsed: subscription.datasetsUsed || 0,
      })
      setCurrentPlan("individual")
      router.push("/profile")
    } else if (planType === "business") {
      // Contact sales for business plan
      alert("Please contact sales for Business plan pricing")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select the plan that best fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.isRecommended ? "border-primary shadow-lg" : ""} ${
                currentPlan === plan.id ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Recommended</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price === null ? (
                    <span className="text-3xl font-bold text-foreground">Custom pricing</span>
                  ) : plan.price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">$0/month</span>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">${plan.price}/month</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {currentPlan === plan.id ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleSelectPlan(plan.id)}>
                    {plan.id === "business" ? "Contact Sales" : "Select Plan"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
