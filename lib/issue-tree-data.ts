export interface SubIssue {
  id: string
  name: string
  summary: string
  trend: string
  trendValue: string
  timeframe: string
  dataSource: string[]
  owner?: string // Added optional owner field
  subIssues?: SubIssue[]
  detail?: IssueDetail
  analysis?: AnalysisData // Added analysis data
  synthesis?: SynthesisData // Added synthesis data
}

export interface IssueDetail {
  analysisKeyTakeaway: string
  benchmark: string
  rootCauseHypothesis: string
  implications: string
  risks: string
  dataSource: string
  dataSourceUrl: string
}

export interface Issue {
  id: string
  name: string
  trend: "up" | "down" | "stable"
  trendValue: string
  summary: string
  timeframe: string
  owner: string
  dataSource: string[]
  detail?: IssueDetail
  subIssues: SubIssue[]
}

export interface AnalysisData {
  quantTheme1: {
    title: string
    description: string
  }
  quantTheme2: {
    title: string
    description: string
  }
  qualTheme: string
}

export interface SynthesisData {
  goodOrBad: string
  expectedOrUnexpected: string
  rootCause: string
  companyMissionImpact: string
  myMissionImpact: string
  otherTeamsMissionImpact: string
}

// Mock data representing the issue tree
export const issueTreeData: Issue = {
  id: "main-issue",
  name: "Company Revenue",
  trend: "up",
  trendValue: "+12%",
  summary: "Overall company revenue performance and growth trajectory",
  timeframe: "Quarterly",
  owner: "CEO",
  dataSource: ["Stripe", "QuickBooks"],
  detail: {
    analysisKeyTakeaway:
      "Revenue growth of 12% QoQ is strong, but 73% is coming from just 3 enterprise accounts who expanded their seats. Your mid-market segment (20-100 employees) actually contracted 4% this quarter.",
    benchmark: "Growth rate is 2x industry average, but concentration risk is high",
    rootCauseHypothesis:
      "Enterprise expansion driven by new features your SMB customers don't value. Interview data shows smaller customers struggle with complexity you added for enterprise buyers.",
    implications:
      "If top 3 accounts churn, you lose $2.1M ARR. Consider building a separate 'Pro' tier with simplified feature set.",
    risks: "Chasing enterprise deals while SMB churn accelerates.",
    dataSource: "Stripe",
    dataSourceUrl: "#",
  },
  subIssues: [
    {
      id: "customer-support-score",
      name: "Customer Support Score",
      summary: "Overall customer satisfaction with support quality",
      trend: "down",
      trendValue: "-8%",
      timeframe: "Last 30 days",
      owner: "Sarah Johnson",
      dataSource: ["Zendesk"],
      detail: {
        analysisKeyTakeaway:
          "CSAT dropped from 87% to 79% in 30 days. Root cause: Your best support engineer (Emma) left 3 weeks ago, and she handled 40% of complex technical tickets.",
        benchmark: "Below industry standard of 85% for B2B SaaS support",
        rootCauseHypothesis:
          "Knowledge silos - Emma had tribal knowledge of legacy code. Your documentation has 200+ outdated articles. New hires escalate 3x more tickets.",
        implications:
          "For Head of CS: Budget for 2 more senior hires immediately. Customers threatening to leave: Acme Corp ($120K ARR) and DataFlow ($85K ARR).",
        risks: "Continued score decline will trigger churn in next 60 days.",
        dataSource: "Zendesk",
        dataSourceUrl: "#",
      },
      subIssues: [
        {
          id: "response-time",
          name: "First Response Time",
          summary: "Time to initial response on support tickets",
          trend: "up",
          trendValue: "+25%",
          timeframe: "Last 7 days",
          owner: "Marcus Lee",
          dataSource: ["Zendesk"],
          detail: {
            analysisKeyTakeaway:
              "Response time jumped from 2.3 to 4.8 hours. Spike began when you launched new pricing page - it generated 312 'how does billing work?' tickets in 7 days.",
            benchmark: "Industry target is under 2 hours for first response",
            rootCauseHypothesis:
              "Pricing page redesign removed FAQ and changed to per-usage model. 68% of tickets are 'I don't understand my bill'.",
            implications:
              "For Product: Add calculator to pricing page. For Sales: Create pre-sales channel. For CS: Auto-response with billing FAQ.",
            risks: "Slow responses hurting conversion - 23 trials mentioned this in exit surveys.",
            dataSource: "Zendesk",
            dataSourceUrl: "#",
          },
        },
        {
          id: "resolution-rate",
          name: "First Contact Resolution",
          summary: "Issues resolved in first interaction",
          trend: "down",
          trendValue: "-18%",
          timeframe: "Last 30 days",
          owner: "Alex Chen",
          dataSource: ["Zendesk"],
          detail: {
            analysisKeyTakeaway:
              "FCR dropped from 68% to 50%. 89% of failures are API integration questions. Your REST API v2 launched 28 days ago with minimal docs.",
            benchmark: "Best-in-class is 70%+ FCR for technical support",
            rootCauseHypothesis:
              "API docs are reference-only with no quickstart. Support agents aren't engineers, so they escalate to product team.",
            implications:
              "For Product: Hire technical writer for API tutorials. For CS: Let top 2 engineers spend 50% time learning API deeply.",
            risks: "Slow API adoption = low switching costs = high churn risk.",
            dataSource: "Zendesk",
            dataSourceUrl: "#",
          },
        },
        {
          id: "ticket-volume",
          name: "Support Ticket Volume",
          summary: "Increase in support requests",
          trend: "up",
          trendValue: "+30%",
          timeframe: "Last 30 days",
          owner: "Rachel Kumar",
          dataSource: ["Zendesk"],
          detail: {
            analysisKeyTakeaway:
              "Tickets surged 30%. 42% are about one bug: Dashboard charts wrong after timezone changes. Affects 500+ customers across 15 timezones.",
            benchmark: "Should grow proportional to user base (12% this quarter)",
            rootCauseHypothesis:
              "DST fix had unintended consequence for manual timezone users (35% of customers). Bug caught in QA but deprioritized as 'low impact'.",
            implications:
              "For Engineering: Ship hotfix today or volume doubles next week. For CS: Proactive email to affected customers. Cost: $40K in support hours.",
            risks: "Bug reports on Twitter going viral - PR risk increasing.",
            dataSource: "Zendesk",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "product-quality",
      name: "Product Quality",
      summary: "Product reliability and user experience metrics",
      trend: "stable",
      trendValue: "0%",
      timeframe: "Last 30 days",
      dataSource: ["Sentry", "DataDog"],
      subIssues: [
        {
          id: "bug-rate",
          name: "Bug Discovery Rate",
          summary: "New bugs reported by users",
          trend: "down",
          trendValue: "-15%",
          timeframe: "Last 30 days",
          owner: "Dev Lead",
          dataSource: ["Jira", "Sentry"],
          detail: {
            analysisKeyTakeaway:
              "Bug rate down 15% despite shipping 40% more features. New QA process and automated testing working. But: 80% of remaining bugs are in checkout flow.",
            benchmark: "Below industry average of 2.3 bugs per 1000 lines of code",
            rootCauseHypothesis:
              "Investment in testing infrastructure paying off. Checkout bugs stem from payment provider API changes - Stripe updated webhooks and your error handling broke.",
            implications:
              "For Engineering: Ship hotfix today or volume doubles next week. For CS: Proactive email to affected customers. Cost: $40K in support hours.",
            risks: "Bug reports on Twitter going viral - PR risk increasing.",
            dataSource: "Sentry",
            dataSourceUrl: "#",
          },
        },
        {
          id: "uptime",
          name: "System Uptime",
          summary: "Application availability and performance",
          trend: "up",
          trendValue: "+2%",
          timeframe: "Last 30 days",
          dataSource: ["DataDog", "PagerDuty"],
          detail: {
            analysisKeyTakeaway:
              "Uptime improved to 99.97% (from 99.1%). Only 1 incident in 30 days. Database optimization and new load balancer working. Peak traffic handling improved 3x.",
            benchmark: "At 99.97% you're now matching enterprise SaaS standards",
            rootCauseHypothesis:
              "Previous incidents were database connection pool exhaustion during traffic spikes. New autoscaling config and read replicas solved this.",
            implications:
              "Can now confidently target enterprise customers who require 99.9%+ SLAs. Removes a common objection from sales process.",
            risks: "Need to maintain this - one major outage erases months of reliability gains.",
            dataSource: "DataDog",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "sales-metrics",
      name: "Sales Performance",
      summary: "Sales team efficiency and conversion rates",
      trend: "up",
      trendValue: "+18%",
      timeframe: "Last quarter",
      owner: "Head of Sales",
      dataSource: ["Salesforce", "HubSpot"],
      subIssues: [
        {
          id: "conversion-rate",
          name: "Lead Conversion Rate",
          summary: "Trial to paid conversion performance",
          trend: "up",
          trendValue: "+12%",
          timeframe: "Last 30 days",
          owner: "Sales Manager",
          dataSource: ["Salesforce", "HubSpot"],
          detail: {
            analysisKeyTakeaway:
              "Conversion jumped from 18% to 22%. New sales playbook working. But: SMB converts at 28% while Enterprise at only 9%. You're spending equal time on both.",
            benchmark: "22% conversion is top quartile for B2B SaaS trials",
            rootCauseHypothesis:
              "SMB customers self-serve well. Enterprise needs custom demos and security reviews - your sales team isn't staffed for this (avg 2 weeks to schedule demo).",
            implications:
              "For Sales: Hire 2 Enterprise AEs and 1 Solutions Engineer. For Marketing: Segment campaigns - SMB should be product-led growth, Enterprise needs high-touch.",
            risks: "Chasing enterprise without proper resources wastes sales capacity.",
            dataSource: "Salesforce",
            dataSourceUrl: "#",
          },
        },
        {
          id: "deal-size",
          name: "Average Deal Size",
          summary: "Revenue per closed deal",
          trend: "up",
          trendValue: "+25%",
          timeframe: "Last quarter",
          owner: "Sales Ops",
          dataSource: ["Salesforce"],
          detail: {
            analysisKeyTakeaway:
              "ACV increased from $12K to $15K. Driven by: seat expansion (customers buying 40% more seats) and add-on module sales (analytics package attached to 60% of deals).",
            benchmark: "Deal size growth outpacing market average of 8% annually",
            rootCauseHypothesis:
              "Product is sticky - customers expand teams onto platform. Analytics module launched 90 days ago is a hit ($3K average, 15% margin).",
            implications:
              "For Product: Analytics module is revenue driver - invest in v2 with more features. For Sales: Train team to always demo add-ons. For Finance: Increases LTV to $45K.",
            risks: "Don't become dependent on one module - need multiple expansion paths.",
            dataSource: "Salesforce",
            dataSourceUrl: "#",
          },
        },
        {
          id: "pipeline-velocity",
          name: "Pipeline Velocity",
          summary: "Speed of deals through sales funnel",
          trend: "up",
          trendValue: "+15%",
          timeframe: "Last 30 days",
          owner: "RevOps Lead",
          dataSource: ["Salesforce"],
          detail: {
            analysisKeyTakeaway:
              "Sales cycle shortened from 45 to 38 days. Biggest improvement: demo-to-proposal stage (was 18 days, now 11 days). Legal/security reviews still take 12 days.",
            benchmark: "38-day cycle is competitive for mid-market B2B SaaS",
            rootCauseHypothesis:
              "New proposal template with ROI calculator accelerates buying decisions. Security reviews slow because you lack SOC 2 - prospects need internal approvals for non-compliant vendors.",
            implications:
              "For Sales: Velocity gains = can close 20% more deals with same team. For Security: SOC 2 certification would eliminate 12-day bottleneck, worth $200K investment.",
            risks: "Competitors with compliance certifications have unfair advantage.",
            dataSource: "Salesforce",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "marketing-performance",
      name: "Marketing ROI",
      summary: "Marketing channel effectiveness and spend efficiency",
      trend: "up",
      trendValue: "+20%",
      timeframe: "Last quarter",
      owner: "Head of Marketing",
      dataSource: ["HubSpot", "Google Analytics"],
      subIssues: [
        {
          id: "cac",
          name: "Customer Acquisition Cost",
          summary: "Cost to acquire new customers",
          trend: "down",
          trendValue: "-18%",
          timeframe: "Last quarter",
          owner: "Growth PM",
          dataSource: ["HubSpot", "Stripe"],
          detail: {
            analysisKeyTakeaway:
              "CAC dropped from $2,400 to $1,960. Organic traffic up 45% (SEO investment paying off). Paid ads ROI improved from 1.8x to 2.6x by cutting underperforming keywords.",
            benchmark: "At $1,960 CAC and $45K LTV, you have healthy 23x ratio",
            rootCauseHypothesis:
              "Content marketing flywheel kicking in - 80 blog posts published in 6 months now rank for 1,200+ keywords. Referral program launched (customers get $500 credit for referrals).",
            implications:
              "For Marketing: Double down on content - hire 2 more writers. For Product: Referral program drives 15% of signups now, make it more prominent in UI.",
            risks: "SEO rankings can drop with Google updates - diversify channels.",
            dataSource: "HubSpot",
            dataSourceUrl: "#",
          },
        },
        {
          id: "lead-quality",
          name: "Lead Quality Score",
          summary: "Quality of marketing-generated leads",
          trend: "up",
          trendValue: "+22%",
          timeframe: "Last 30 days",
          owner: "Demand Gen",
          dataSource: ["HubSpot", "Clearbit"],
          detail: {
            analysisKeyTakeaway:
              "Lead quality up 22% measured by: fit score (company size, role, industry) and engagement (demo requests, not just ebook downloads). Sales team close rate on these leads is 35%.",
            benchmark: "Top quartile SaaS companies see 30%+ close rates on qualified leads",
            rootCauseHypothesis:
              "Switched from broad 'download our guide' campaigns to specific 'see how [Company X] solved [Problem Y]' case studies. Gated content now requires business email (no Gmail).",
            implications:
              "For Marketing: Generate fewer but better leads - sales team prefers this. For Sales: Spend time on MQLs, ignore unqualified inbound. For Product: Case study requests up - need more customer spotlights.",
            risks: "Lead volume down 15% - need to balance quality with quantity for growth targets.",
            dataSource: "HubSpot",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "customer-retention",
      name: "Customer Retention",
      summary: "Customer retention and expansion metrics",
      trend: "stable",
      trendValue: "+2%",
      timeframe: "Last quarter",
      owner: "Head of CS",
      dataSource: ["ChartMogul", "Stripe"],
      subIssues: [
        {
          id: "churn-rate",
          name: "Monthly Churn Rate",
          summary: "Rate of customer cancellations",
          trend: "down",
          trendValue: "-5%",
          timeframe: "Last 30 days",
          owner: "CS Manager",
          dataSource: ["ChartMogul"],
          detail: {
            analysisKeyTakeaway:
              "Churn dropped from 4.2% to 3.8% monthly. Proactive outreach working - CS team contacts customers when usage drops 30%. Saved 14 accounts ($167K ARR) last month through intervention.",
            benchmark: "3.8% monthly churn is good for B2B SaaS (target is <3%)",
            rootCauseHypothesis:
              "Implemented health scores (usage frequency, feature adoption, support tickets, NPS). Red accounts get executive check-in calls. Also: improved onboarding reduced early churn by 40%.",
            implications:
              "For CS: Health score model working - invest in automation to scale this. For Product: Top churn reason is 'too complex' - need simplified tier for smaller customers.",
            risks: "Churn concentrated in $5-10K accounts - at risk of losing mid-market segment.",
            dataSource: "ChartMogul",
            dataSourceUrl: "#",
          },
        },
        {
          id: "ndr",
          name: "Net Dollar Retention",
          summary: "Revenue retention including expansion",
          trend: "up",
          trendValue: "+8%",
          timeframe: "Last quarter",
          owner: "Revenue Ops",
          dataSource: ["ChartMogul", "Stripe"],
          detail: {
            analysisKeyTakeaway:
              "NDR at 112% (up from 104%). Expansion revenue from existing customers ($890K) now exceeds churn losses ($520K). Upsells happening 6 months into customer lifecycle.",
            benchmark: "112% NDR puts you in top 25% of B2B SaaS companies",
            rootCauseHypothesis:
              "Customers naturally expand as teams grow and adopt more features. Analytics module drives 60% of expansion. Usage-based pricing means revenue scales with customer value.",
            implications:
              "For Finance: Can grow revenue by 12% annually from existing base alone. For Product: Land-and-expand working - optimize for quick time-to-value on initial sale.",
            risks: "Expansion dependent on customer growth - recession would hit this metric.",
            dataSource: "ChartMogul",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "product-adoption",
      name: "Product Adoption",
      summary: "User engagement and feature usage metrics",
      trend: "up",
      trendValue: "+15%",
      timeframe: "Last 30 days",
      owner: "Head of Product",
      dataSource: ["Amplitude", "Pendo"],
      subIssues: [
        {
          id: "dau",
          name: "Daily Active Users",
          summary: "Users logging in daily",
          trend: "up",
          trendValue: "+18%",
          timeframe: "Last 30 days",
          owner: "Product Analytics",
          dataSource: ["Amplitude"],
          detail: {
            analysisKeyTakeaway:
              "DAU grew from 12,400 to 14,600. But: 60% growth is from one customer (Acme Corp rolled out to 800 users). Organic growth is only 8%. Dependency risk on single customer.",
            benchmark: "DAU/MAU ratio of 0.42 indicates good product stickiness",
            rootCauseHypothesis:
              "Acme deployment was successful enterprise rollout. Organic growth driven by new collaboration features (comments, @mentions) - team usage creates network effects.",
            implications:
              "For Product: Success with Acme proves enterprise deployment works - create playbook to replicate. For Sales: Use Acme as case study. For Eng: Ensure infrastructure scales.",
            risks: "If Acme churns (renewal in 8 months), DAU drops 35% overnight.",
            dataSource: "Amplitude",
            dataSourceUrl: "#",
          },
        },
        {
          id: "feature-adoption",
          name: "New Feature Adoption",
          summary: "Adoption rate of recently launched features",
          trend: "up",
          trendValue: "+25%",
          timeframe: "Last 30 days",
          owner: "Product Manager",
          dataSource: ["Amplitude", "Pendo"],
          detail: {
            analysisKeyTakeaway:
              "25% of users tried new 'Smart Filters' feature in first 30 days. But: only 8% used it more than once. High trial, low retention indicates unclear value or UX issues.",
            benchmark: "Successful features see 20%+ adoption and 50%+ retention after trial",
            rootCauseHypothesis:
              "Feature was marketed well (in-app tooltip, email campaign) but: users don't understand how to configure filters. Tutorial is 8 minutes long - too complex. Power users love it (NPS 72) but casual users bounce.",
            implications:
              "For Product: Simplify onboarding - add templates for common filter use cases. For UX: 8-minute tutorial is too long - make it 2 minutes with video. For CS: Proactively offer setup help to trial users.",
            risks: "Low retention kills feature investment ROI - need to fix in next 30 days.",
            dataSource: "Amplitude",
            dataSourceUrl: "#",
          },
        },
      ],
    },
    {
      id: "product-engagement",
      name: "Product Engagement Score",
      summary: "User engagement with core product features",
      trend: "down",
      trendValue: "-12%",
      timeframe: "Last 30 days",
      owner: "Alex Chen",
      dataSource: ["Amplitude", "Mixpanel"],
      detail: {
        analysisKeyTakeaway:
          "Daily Active Users dropped from 68% to 60% of your user base. The decline started exactly when you rolled out the new dashboard redesign on Nov 15th.",
        benchmark: "DAU/MAU ratio of 60% is concerning - best-in-class SaaS maintains 70%+",
        rootCauseHypothesis:
          "Your 'modern' redesign moved frequently-used features 2 clicks deeper. Power users (who make up 40% of revenue) are frustrated. Session duration dropped 18 minutes to 12 minutes.",
        implications:
          "For Product: Revert navigation or add customizable shortcuts. For Customer Success: Reach out to top 50 accounts proactively. Risk: These users will explore alternatives.",
        risks: "Power user churn could accelerate if not addressed in next 2 weeks.",
        dataSource: "Amplitude",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
    {
      id: "sales-conversion-rate",
      name: "Sales Conversion Rate",
      summary: "Trial to paid customer conversion performance",
      trend: "down",
      trendValue: "-15%",
      timeframe: "Last quarter",
      owner: "Jordan Martinez",
      dataSource: ["Salesforce", "HubSpot"],
      detail: {
        analysisKeyTakeaway:
          "Trial-to-paid conversion dropped from 18% to 15.3%. But it's not uniform - SMB trials convert at 22% while Enterprise trials only convert at 8%.",
        benchmark: "Enterprise conversion of 8% is well below industry average of 15%",
        rootCauseHypothesis:
          "Enterprise deals require API access and SSO during trial, but you gate these behind 'Enterprise' tier. Competitors offer them in trials. Lost 12 enterprise deals citing 'couldn't properly evaluate'.",
        implications:
          "For Sales: Enable SSO + API in trials with usage limits. For Product: Build 'evaluation mode' for enterprise features. Expected impact: +$840K ARR recovered.",
        risks: "Continuing to lose enterprise deals to competitors with better trial experience.",
        dataSource: "Salesforce",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
    {
      id: "churn-rate",
      name: "Customer Churn Rate",
      summary: "Rate of customers canceling subscriptions",
      trend: "up",
      trendValue: "+18%",
      timeframe: "Last quarter",
      owner: "Taylor Kim",
      dataSource: ["Stripe", "ChartMogul"],
      detail: {
        analysisKeyTakeaway:
          "Monthly churn increased from 2.1% to 2.5%. Critical insight: 89% of churned customers never used your new 'Pro' features, yet paid for them. They felt overcharged.",
        benchmark: "2.5% monthly churn is at the warning threshold for B2B SaaS",
        rootCauseHypothesis:
          "Your pricing update forced everyone to 'Pro' tier at +40% price, but only 18% of customers use Pro features. Exit surveys say 'forced upgrade for features I don't need'.",
        implications:
          "For Product: Bring back 'Starter' tier immediately. For Finance: Accept short-term revenue dip to save customer base. For CS: Win-back campaign offering downgrade option.",
        risks: "If churn continues at this rate, you'll lose 30% of customer base in 12 months.",
        dataSource: "Stripe",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
    {
      id: "feature-adoption",
      name: "New Feature Adoption",
      summary: "Adoption rate of recently launched features",
      trend: "down",
      trendValue: "-22%",
      timeframe: "Last 60 days",
      owner: "Morgan Davis",
      dataSource: ["Amplitude", "Pendo"],
      detail: {
        analysisKeyTakeaway:
          "Only 11% of users have tried your new 'Smart Reports' feature launched 2 months ago, despite it being your biggest product investment this year ($450K dev cost).",
        benchmark: "Healthy feature adoption is 30%+ within 60 days of launch",
        rootCauseHypothesis:
          "Feature is buried in Settings > Advanced > Reports. No in-app prompts, no onboarding flow. Users who DO find it love it (NPS: 72), but discovery is the blocker.",
        implications:
          "For Product: Add prominent entry point on main dashboard + in-app tutorial. For Marketing: Create demo video and email campaign. Expected: 3x adoption in 30 days.",
        risks: "Without adoption, leadership may question product team's roadmap decisions.",
        dataSource: "Amplitude",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
    {
      id: "api-usage",
      name: "API Usage Growth",
      summary: "Growth in API calls and integration usage",
      trend: "up",
      trendValue: "+35%",
      timeframe: "Last quarter",
      owner: "Casey Wright",
      dataSource: ["Datadog", "AWS CloudWatch"],
      detail: {
        analysisKeyTakeaway:
          "API usage grew 35% QoQ - excellent signal of product stickiness. But 71% of growth comes from just 8 customers. Your API is 'sticky' but not 'widespread'.",
        benchmark: "Growth is strong, but concentration risk mirrors your revenue problem",
        rootCauseHypothesis:
          "API docs are developer-first (great for experts), but lack simple 'quick start' guides. Non-technical PM's can't enable integrations without engineering help.",
        implications:
          "For Product: Create no-code Zapier integration + visual API builder. For Docs: Add 'recipes' for common use cases. Target: Democratize API access beyond engineering teams.",
        risks: "Losing any of the top 8 API customers would significantly impact this metric.",
        dataSource: "Datadog",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
  ],
}

export function findIssueById(id: string, node: SubIssue | Issue = issueTreeData): SubIssue | Issue | null {
  if (node.id === id) return node
  if ("subIssues" in node && node.subIssues) {
    for (const subIssue of node.subIssues) {
      const found = findIssueById(id, subIssue)
      if (found) return found
    }
  }
  return null
}

export function getParentIssue(
  childId: string,
  issues: SubIssue[] = issueTreeData.subIssues,
  parent: SubIssue | Issue | null = null,
): SubIssue | Issue | null {
  for (const issue of issues) {
    if (issue.id === childId) return parent
    if (issue.subIssues) {
      const found = getParentIssue(childId, issue.subIssues, issue)
      if (found) return found
    }
  }
  return null
}

export function getChildIssues(parentId: string): SubIssue[] {
  if (parentId === "main-issue") return issueTreeData.subIssues
  const parent = findIssueById(parentId)
  return parent?.subIssues || []
}
