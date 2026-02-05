export interface SignalNode {
  id: string
  name: string
  value: string
  change: string
  trend: "up" | "down"
  owner?: string // Made optional - some signals may not have assigned user/team
  ownerType?: "team" | "individual"
  level: "primary" | "secondary" | "tertiary"
  children?: SignalNode[]
}

// Mock signal system - in production this would be pulled from user preferences
export const mockSignalSystem: SignalNode = {
  id: "revenue",
  name: "Revenue Growth",
  value: "$2.4M",
  change: "+18%",
  trend: "up",
  owner: "CEO",
  ownerType: "individual",
  level: "primary",
  children: [
    {
      id: "new-customers",
      name: "New Customer Acquisition",
      value: "145",
      change: "+22%",
      trend: "up",
      level: "secondary",
      children: [
        {
          id: "pipeline",
          name: "Sales Pipeline",
          value: "$2.4M",
          change: "-15%",
          trend: "down",
          owner: "Sarah Chen - Sales Manager",
          ownerType: "individual",
          level: "tertiary",
        },
        {
          id: "win-rate",
          name: "Win Rate",
          value: "24%",
          change: "-8%",
          trend: "down",
          level: "tertiary",
        },
        {
          id: "avg-deal-size",
          name: "Average Deal Size",
          value: "$28.5K",
          change: "+12%",
          trend: "up",
          level: "tertiary",
        },
      ],
    },
    {
      id: "expansion",
      name: "Customer Expansion",
      value: "$680K",
      change: "+15%",
      trend: "up",
      owner: "Customer Success Team",
      ownerType: "team",
      level: "secondary",
      children: [
        {
          id: "upsells",
          name: "Upsell Rate",
          value: "34%",
          change: "+8%",
          trend: "up",
          level: "tertiary",
        },
        {
          id: "feature-adoption",
          name: "Feature Adoption",
          value: "31%",
          change: "+12%",
          trend: "up",
          level: "tertiary",
        },
      ],
    },
    {
      id: "retention",
      name: "Customer Retention",
      value: "96.2%",
      change: "+1.2%",
      trend: "up",
      level: "secondary",
      children: [
        {
          id: "churn",
          name: "Churn Rate",
          value: "3.8%",
          change: "-1.2%",
          trend: "up",
          owner: "Rachel Martinez - CS Lead",
          ownerType: "individual",
          level: "tertiary",
        },
        {
          id: "csat",
          name: "Customer Satisfaction",
          value: "74%",
          change: "-4%",
          trend: "down",
          level: "tertiary",
        },
        {
          id: "nps",
          name: "Net Promoter Score",
          value: "42",
          change: "+5",
          trend: "up",
          level: "tertiary",
        },
      ],
    },
  ],
}
