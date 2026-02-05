import type { Insight } from "./types"

export const demoSignals: Insight[] = [
  {
    id: "demo-1",
    category: "product",
    header: "User Engagement",
    metric: "Daily Active Users",
    value: "12,450",
    change: "+8.5%",
    trend: "up",
    timeframe: "vs last week",
    description: "Daily active users increased by 8.5% compared to last week",
    summary:
      "Strong growth in user engagement driven by new feature adoption. Mobile users showing particularly strong engagement patterns.",
    benchmark: "Industry average: +5.2%",
    analysis:
      "The increase is primarily driven by the new onboarding flow launched last week. Mobile engagement is outpacing desktop by 12%.",
    implications:
      "Continue investing in mobile experience. Consider expanding the onboarding improvements to other user journeys.",
    nextSteps:
      "1. Analyze which features are driving engagement\n2. Survey new users about onboarding experience\n3. Plan mobile-first features for next sprint",
    source: "Product Analytics",
    isRAG: false,
    team: "product",
  },
  {
    id: "demo-2",
    category: "market",
    header: "Win Rate",
    metric: "Sales Win Rate",
    value: "32%",
    change: "+5%",
    trend: "up",
    timeframe: "vs last month",
    description: "Sales win rate improved to 32%, up 5% from last month",
    summary:
      "Sales team closing more deals with improved qualification process. Enterprise segment showing strongest performance.",
    benchmark: "Industry average: 28%",
    analysis:
      "New sales playbook and better lead qualification contributing to higher win rates. Enterprise deals closing faster.",
    implications: "Scale the successful sales playbook across all regions. Invest more in enterprise sales resources.",
    nextSteps:
      "1. Document winning strategies\n2. Train all sales reps on new playbook\n3. Increase enterprise marketing budget",
    source: "CRM Data",
    isRAG: false,
    team: "sales",
  },
  {
    id: "demo-3",
    category: "business",
    header: "Customer Retention",
    metric: "Monthly Retention Rate",
    value: "94%",
    change: "+2%",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Customer retention improved to 94%, up 2% from last quarter",
    summary: "Retention improvements driven by enhanced customer success program and product stability improvements.",
    benchmark: "Industry average: 89%",
    analysis:
      "Proactive customer success outreach and reduced technical issues contributing to better retention. High-value customers showing 98% retention.",
    implications:
      "Continue investing in customer success. Focus on replicating high-value customer experience across all segments.",
    nextSteps:
      "1. Expand customer success team\n2. Implement early warning system for at-risk accounts\n3. Launch customer advisory board",
    source: "Customer Success Platform",
    isRAG: false,
    team: "product",
  },
  {
    id: "demo-4",
    category: "tech",
    header: "System Performance",
    metric: "API Response Time",
    value: "145ms",
    change: "-15%",
    trend: "up",
    timeframe: "vs last week",
    description: "API response time improved by 15%, now averaging 145ms",
    summary:
      "Infrastructure optimizations and caching improvements leading to faster response times and better user experience.",
    benchmark: "Target: <200ms",
    analysis:
      "Database query optimizations and CDN improvements driving performance gains. Peak load handling improved significantly.",
    implications:
      "Continue performance optimization efforts. Consider expanding infrastructure in high-growth regions.",
    nextSteps:
      "1. Monitor performance during peak usage\n2. Implement additional caching layers\n3. Plan infrastructure scaling for Q2",
    source: "Application Monitoring",
    isRAG: false,
    team: "product",
  },
  {
    id: "demo-5",
    category: "market",
    header: "Campaign Performance",
    metric: "Marketing ROI",
    value: "3.2x",
    change: "+12%",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Marketing campaigns delivering 3.2x return on investment",
    summary:
      "Digital marketing campaigns showing strong performance with improved targeting and creative optimization.",
    benchmark: "Industry average: 2.5x",
    analysis:
      "Social media and content marketing driving highest returns. Email campaigns showing improved engagement rates.",
    implications:
      "Increase budget allocation to top-performing channels. Test new creative formats in high-performing segments.",
    nextSteps:
      "1. Scale successful campaigns\n2. A/B test new creative approaches\n3. Expand to similar audience segments",
    source: "Marketing Analytics",
    isRAG: false,
    team: "marketing",
  },
]

export function isDemoSignal(insightId: string): boolean {
  return insightId.startsWith("demo-")
}
