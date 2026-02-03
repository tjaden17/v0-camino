export interface BenchmarkCompany {
  name: string
  industry: string
  stage: string
}

export interface BenchmarkStrategicFocus {
  company: BenchmarkCompany
  topIssues: Array<{
    id: string
    name: string
    rationale: string
  }>
}

export interface BenchmarkTopography {
  company: BenchmarkCompany
  issueOwnership: Array<{
    issueId: string
    issueName: string
    ownerRole: string
    teamSize: number
  }>
}

export const benchmarkStrategicData: BenchmarkStrategicFocus[] = [
  {
    company: { name: "Stripe", industry: "Fintech", stage: "Growth" },
    topIssues: [
      {
        id: "developer-experience",
        name: "Developer Experience Score",
        rationale: "API simplicity drives adoption - 90% of new customers cite docs quality",
      },
      {
        id: "payment-success-rate",
        name: "Payment Success Rate",
        rationale: "Every 1% improvement = $50M ARR - highest ROI metric",
      },
      {
        id: "fraud-prevention",
        name: "Fraud Detection Accuracy",
        rationale: "Trust is non-negotiable in payments - prevents $2B annual losses",
      },
    ],
  },
  {
    company: { name: "Notion", industry: "Productivity SaaS", stage: "Scale" },
    topIssues: [
      {
        id: "collaboration-engagement",
        name: "Team Collaboration Rate",
        rationale: "Network effects drive retention - teams > individuals by 3x LTV",
      },
      {
        id: "page-load-performance",
        name: "Page Load Speed",
        rationale: "Sub-200ms loads correlate with 60% higher DAU",
      },
      {
        id: "template-adoption",
        name: "Template Usage Growth",
        rationale: "Templates reduce time-to-value from weeks to hours",
      },
    ],
  },
  {
    company: { name: "Datadog", industry: "DevOps/Monitoring", stage: "Enterprise" },
    topIssues: [
      {
        id: "alert-accuracy",
        name: "Alert Signal-to-Noise Ratio",
        rationale: "False positives kill trust - 95% accuracy threshold for renewals",
      },
      {
        id: "data-ingestion-latency",
        name: "Real-time Data Latency",
        rationale: "Sub-second visibility = competitive moat in incident response",
      },
      {
        id: "integration-coverage",
        name: "Integration Ecosystem Breadth",
        rationale: "500+ integrations drive 80% of enterprise deals",
      },
    ],
  },
]

export const benchmarkTopographyData: BenchmarkTopography[] = [
  {
    company: { name: "Slack", industry: "Communication SaaS", stage: "Mature" },
    issueOwnership: [
      { issueId: "message-delivery", issueName: "Message Delivery Rate", ownerRole: "VP Engineering", teamSize: 25 },
      { issueId: "search-quality", issueName: "Search Relevance Score", ownerRole: "Head of Product", teamSize: 8 },
      { issueId: "notification-engagement", issueName: "Notification CTR", ownerRole: "Head of Growth", teamSize: 12 },
      { issueId: "enterprise-security", issueName: "Security Compliance", ownerRole: "CISO", teamSize: 15 },
      { issueId: "app-ecosystem", issueName: "App Directory Growth", ownerRole: "VP Partnerships", teamSize: 6 },
    ],
  },
  {
    company: { name: "Figma", industry: "Design Tools", stage: "Growth" },
    issueOwnership: [
      {
        issueId: "real-time-sync",
        issueName: "Multiplayer Sync Latency",
        ownerRole: "Head of Infrastructure",
        teamSize: 18,
      },
      { issueId: "plugin-performance", issueName: "Plugin Load Time", ownerRole: "Platform Lead", teamSize: 10 },
      {
        issueId: "file-size-optimization",
        issueName: "File Size Efficiency",
        ownerRole: "Staff Engineer",
        teamSize: 5,
      },
      { issueId: "design-handoff", issueName: "Dev Handoff Accuracy", ownerRole: "Product Manager", teamSize: 7 },
      {
        issueId: "community-templates",
        issueName: "Community Template Quality",
        ownerRole: "Community Manager",
        teamSize: 4,
      },
    ],
  },
]
