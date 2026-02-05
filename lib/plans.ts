import type { Plan, PlanType } from "./types"

export const plans: Plan[] = [
  {
    id: "individual",
    name: "Individual",
    price: 0,
    signalsLimit: 3,
    datasetsLimit: 3,
    features: [
      "3 Signals + Insights",
      "3 Datasets",
      "Share signals & insights across business",
      "Purchase additional credits outside of your monthly usage. E.g. more signals, more datasets.",
    ],
  },
  {
    id: "team",
    name: "Team (free trial for 1 month)",
    price: 100,
    signalsLimit: 10,
    datasetsLimit: 10,
    features: [
      "10 Signals + Insights",
      "10 Datasets",
      "Share signals & insights across business",
      "Assign signals to team members",
      "1x Team metrics mapping workshop",
      "Team metrics review",
      "Purchase additional credits outside of your team's usage. E.g. more signals, more datasets.",
    ],
    isRecommended: true,
  },
  {
    id: "business",
    name: "Business",
    price: null, // Custom pricing
    signalsLimit: 50,
    datasetsLimit: 20,
    features: [
      "50+ signals / business",
      "20+ datasets",
      "10 signals / team",
      "Assign signals to managers",
      "Share signals & insights across business",
      "1x Company metrics mapping workshop",
      "Company + Team metrics review",
      "Purchase additional credits outside of your team's usage. E.g. more signals, more datasets.",
    ],
  },
]

export function getPlan(planType: PlanType): Plan | undefined {
  return plans.find((plan) => plan.id === planType)
}

export function getUserSubscription() {
  const subscriptionData = localStorage.getItem("camino-subscription")
  if (subscriptionData) {
    return JSON.parse(subscriptionData)
  }
  // Default to individual plan
  return {
    planType: "individual",
    status: "active",
    signalsUsed: 0,
    datasetsUsed: 0,
  }
}

export function updateUserSubscription(subscription: any) {
  localStorage.setItem("camino-subscription", JSON.stringify(subscription))
}
