import type { Project } from "./types"

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Review Q1 2024",
    type: "review",
    createdAt: "2024-01-15",
    createdBy: "current-user",
    sections: {
      action: "Roadmap 2025",
      because: ["1", "2", "3"], // CSAT, D1 Engagement, Feature Adoption insight IDs
      result: ["4", "5", "6"], // MRR Growth, API Latency, Feature Adoption
      resultText: "And overall, we saw an uplift in revenue by 3%",
    },
  },
  {
    id: "project-2",
    name: "Q1 2026",
    type: "recommend",
    createdAt: "2024-01-20",
    createdBy: "current-user",
    sections: {
      action: "Roadmap 2026",
      because: ["7", "8", "9"], // Market Share, MRR Growth, Market Growth
      result: ["10", "11", "12"], // Churn Rate, Competitor Activity, CAC Payback
      resultText: "And overall, we expect an uplift in revenue by 2%",
    },
  },
]
