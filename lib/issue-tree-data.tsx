export interface SubIssue {
  id: string
  name: string
  summary: string
  trend: string
  trendValue: string
  absoluteValue?: string // Added absoluteValue field
  benchmarkValue?: string // Added benchmarkValue field
  highlighted?: boolean // Added highlighted field
  investigating?: boolean // Added investigating field
  tags?: string[] // Added tags field
  timeframe: string
  dataSource: string[]
  owner?: string
  category?: "product" | "sales" | "marketing" | "cs" | "engineering" | "company" // Added category field for filtering by role
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
  absoluteValue?: string // Added absoluteValue field
  benchmarkValue?: string // Added benchmarkValue field
  highlighted?: boolean // Added highlighted field
  investigating?: boolean // Added investigating field
  tags?: string[] // Added tags field
  category?: "product" | "sales" | "marketing" | "cs" | "engineering" | "company" // Added category field for filtering by role
}

export interface AnalysisData {
  quantTheme1: {
    title: string
    description: string
    insight: string
  }
  quantTheme2: {
    title: string
    description: string
    insight: string
  }
  qualTheme: {
    title: string
    description: string
    feedback: string
  }
  actionableRecommendations: string[]
}

export interface SynthesisData {
  executiveSummary: string
  keyDrivers: string[]
  strategicImplications: string
  nextSteps: string[]
}

// Mock data representing the issue tree
export const issueTreeData: Issue = {
  id: "main-issue",
  name: "Company Revenue",
  trend: "up",
  trendValue: "+12%",
  absoluteValue: "$2.4M",
  benchmarkValue: "Industry avg: $2.1M (series B SaaS)",
  summary: "Overall business health and financial performance",
  timeframe: "vs. last month",
  owner: "CEO",
  dataSource: ["Stripe", "QuickBooks", "Salesforce"],
  category: "company",
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
      summary: "Overall customer satisfaction with support interactions",
      trend: "down",
      trendValue: "-3%",
      absoluteValue: "72",
      benchmarkValue: "Industry avg: 78 (B2B SaaS)",
      highlighted: true,
      timeframe: "vs. last 30 days",
      dataSource: ["Zendesk", "Intercom"],
      owner: "Emily Thompson",
      category: "cs",
      analysis: {
        quantTheme1: {
          title: "Response Time Degradation",
          description:
            "Average first response time increased from 2.3 hours to 4.8 hours after Emma (senior engineer) left. Her departure created a knowledge gap affecting 40% of complex technical tickets.",
          insight:
            "Emma's departure revealed critical knowledge gaps - we need redundancy in expertise, not single points of failure.",
        },
        quantTheme2: {
          title: "Ticket Volume Spike",
          description:
            "Support ticket volume up 30% (1,200 to 1,560/month). 42% are related to timezone bug affecting 500+ customers. Repeat tickets from same customers increased 2.3x.",
          insight: "The timezone bug is driving repeat contacts - fixing this one issue could reduce volume by 42%.",
        },
        qualTheme: {
          title: "Customer Sentiment",
          description: "Customers report feeling 'abandoned' when technical support quality drops",
          feedback:
            "Customers specifically mention Emma by name in 18 support tickets. Common phrase: 'Can I speak to someone who actually knows the product?' Frustration with junior reps escalating simple issues unnecessarily.",
        },
        actionableRecommendations: [
          "Hire 2 senior support engineers immediately to fill Emma's knowledge gap",
          "Create comprehensive documentation for the top 50 technical issues",
          "Fix the timezone bug affecting 500+ customers (42% of current ticket volume)",
          "Implement peer review system for junior support engineers",
          "Launch weekly knowledge-sharing sessions to prevent future knowledge silos",
        ],
      },
      synthesis: {
        executiveSummary:
          "CSAT has declined 8% to 78 in the last 30 days, falling below our 82 target and industry benchmark of 85. This is unexpected given recent investments in support tooling. Root cause: Senior support specialist departed, and new demo requests are creating complex, time-consuming tickets that new hires struggle with.",
        keyDrivers: [
          "Loss of experienced support specialist Sarah Chen (5+ years tenure) who handled 40% of complex technical cases",
          "45% increase in demo requests with inadequate handoff notes from sales, leading to confused customers and repeat questions",
          "New support hires (3 in last 2 months) still in training period, average 15% slower response times",
        ],
        strategicImplications:
          "If CSAT remains below 80 for another quarter, we risk 12-15% increase in churn among enterprise customers (our highest revenue segment). Sales team is already reporting concerns from prospects who research our support quality before purchasing.",
        nextSteps: [
          "Implement structured demo-to-support handoff process with mandatory context fields in CRM (2 weeks)",
          "Accelerate onboarding for new support hires with shadowing program and decision tree tools (1 month)",
          "Hire backfill for senior technical support role, prioritize candidates with SaaS + technical background (hiring now)",
          "Create escalation path for complex demo-related questions to product team (immediate)",
        ],
      },
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
          absoluteValue: "4.8 hours",
          benchmarkValue: "2.3 hours",
          highlighted: true,
          investigating: true,
          tags: ["support", "response time", "agent capacity"],
          timeframe: "Last 7 days",
          owner: "Marcus Lee",
          dataSource: ["Zendesk"],
          category: "cs",
          analysis: {
            quantTheme1: {
              title: "Pricing Page Confusion",
              description:
                "New pricing page generated 312 'how does billing work?' tickets in 7 days. These simple questions overwhelm support queue, delaying responses to technical issues by average of 2.5 hours.",
              insight: "These simple questions overwhelm support queue.",
            },
            quantTheme2: {
              title: "Support Team Capacity",
              description:
                "With Emma's departure, team down from 6 to 5 agents. Each agent now handles 48 tickets/day (up from 35). Quality suffering - canned responses increased 40%.",
              insight: "Quality suffering - canned responses increased 40%.",
            },
            qualTheme: {
              title: "Customer Sentiment",
              description:
                "Customers complain responses feel 'rushed' and 'unhelpful.' Quote from recent survey: 'I waited 5 hours for a response that just said read the docs.' Another: 'Your support used to be amazing, what happened?'",
              feedback: "Customers complain responses feel 'rushed' and 'unhelpful.'",
            },
            actionableRecommendations: [
              "For Head of CS: Need emergency hire authorization and overtime budget. Also must coordinate with Product/Marketing on pricing page fix.",
              "For Product: Pricing page needs calculator/FAQ immediately. For Marketing: Review all self-serve content. For Sales: Pre-sales channel to deflect billing questions.",
            ],
          },
          synthesis: {
            executiveSummary:
              "Bad - Response times exceeding SLA (2 hour target) by 140%. This is a customer experience crisis.",
            keyDrivers: [
              "Staffing shortage combined with self-inflicted wound from confusing pricing page.",
              "No redundancy in team structure left us vulnerable.",
            ],
            strategicImplications:
              "Slow support responses directly correlate with trial abandonment. 23 recent trial exits mentioned support delays in exit surveys. Estimated $180K in lost ARR.",
            nextSteps: [
              "For Head of CS: Need emergency hire authorization and overtime budget. Also must coordinate with Product/Marketing on pricing page fix.",
              "For Product: Pricing page needs calculator/FAQ immediately.",
              "For Marketing: Review all self-serve content.",
              "For Sales: Pre-sales channel to deflect billing questions.",
            ],
          },
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
          absoluteValue: "50%",
          benchmarkValue: "68%",
          highlighted: true,
          tags: ["support", "resolution rate", "agent expertise"],
          timeframe: "Last 30 days",
          owner: "Alex Chen",
          dataSource: ["Zendesk"],
          category: "cs",
          analysis: {
            quantTheme1: {
              title: "API Integration Complexity",
              description:
                "89% of escalated tickets are API-related. REST API v2 launched 28 days ago with only reference docs - no quickstart guide, no sample code, no video tutorials.",
              insight: "89% of escalated tickets are API-related.",
            },
            quantTheme2: {
              title: "Support Agent Technical Gap",
              description:
                "Support team lacks API expertise. Average ticket touches engineering team 2.4 times before resolution. Engineering team spending 15 hours/week on support escalations.",
              insight: "Average ticket touches engineering team 2.4 times before resolution.",
            },
            qualTheme: {
              title: "Customer Sentiment",
              description:
                "Developers frustrated: 'Your API docs assume I already know how it works.' Another: 'Took me 3 days and 4 support tickets to get OAuth working - competitor took 30 minutes.' Pattern of customers calling API 'poorly documented.'",
              feedback: "Developers frustrated: 'Your API docs assume I already know how it works.'",
            },
            actionableRecommendations: [
              "For Head of CS: Need to upskill top 2 agents on API or hire technical support engineer. Also lobby for Product investment in docs.",
              "For Product: Hire technical writer for API docs. For Engineering: Create internal API training. For DevRel: Consider hiring developer advocate role.",
            ],
          },
          synthesis: {
            executiveSummary:
              "Bad - FCR below industry benchmark and declining. Developer experience is suffering, risking API adoption.",
            keyDrivers: [
              "Technical debt in documentation and training. Support agents aren't equipped to handle developer questions.",
              "API complexity increased without corresponding investment in enablement.",
            ],
            strategicImplications:
              "API adoption critical for stickiness - integrated customers have 95% retention vs 78% for non-API users. Poor support slowing adoption by estimated 40%.",
            nextSteps: [
              "For Head of CS: Need to upskill top 2 agents on API or hire technical support engineer. Also lobby for Product investment in docs.",
              "For Product: Hire technical writer for API docs.",
              "For CS: Let top 2 engineers spend 50% time learning API deeply.",
            ],
          },
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
          category: "cs",
          analysis: {
            quantTheme1: {
              title: "Timezone Bug Impact",
              description:
                "Single bug causing 42% of ticket surge: Dashboard charts show wrong data after timezone changes. Affects 500+ customers across 15 timezones. Each customer submits average 2.3 tickets about it.",
              insight: "Single bug causing 42% of ticket surge.",
            },
            quantTheme2: {
              title: "Compounding Effect",
              description:
                "Bug-related tickets delay responses to other issues, creating negative spiral. Customers resubmit tickets when they don't get fast response, amplifying volume by 22%.",
              insight: "Bug-related tickets delay responses to other issues.",
            },
            qualTheme: {
              title: "Customer Sentiment",
              description:
                "Customer frustration escalating - social media mentions increasing. Twitter: '@YourProduct dashboard has been broken for 2 weeks, no response to my 3 support tickets.' Another: 'How is a timezone bug still not fixed? This is basic stuff.'",
              feedback: "Customer frustration escalating - social media mentions increasing.",
            },
            actionableRecommendations: [
              "For Head of CS: Cost center exploding - spent $40K extra in support hours this month. Need executive escalation to force Engineering priority.",
              "For Engineering: Drop everything and ship hotfix today. For Product: Review prioritization process. For Marketing/PR: Proactive communication to affected customers.",
            ],
          },
          synthesis: {
            executiveSummary:
              "Bad - Unsustainable ticket volume growth, team overwhelmed. Quality of support degrading.",
            keyDrivers: [
              "Product prioritization failure and insufficient QA scope. DST fix had unintended consequences we didn't test for.",
              "Should have been hotfixed immediately but languished in backlog.",
            ],
            strategicImplications:
              "PR risk growing - negative social media sentiment could go viral. Every day of delay costs $5.7K in support time. Risk to brand reputation.",
            nextSteps: [
              "For Head of CS: Cost center exploding - spent $40K extra in support hours this month. Need executive escalation to force Engineering priority.",
              "For Engineering: Drop everything and ship hotfix today.",
              "For Product: Review prioritization process.",
              "For Marketing/PR: Proactive communication to affected customers.",
            ],
          },
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
      summary: "Measure of product bugs, performance issues, and overall stability",
      trend: "stable",
      trendValue: "0%",
      absoluteValue: "8.2/10",
      benchmarkValue: "Industry avg: 7.8/10",
      timeframe: "vs. last quarter",
      dataSource: ["Sentry", "GitHub", "Jira"],
      owner: "Michael Rodriguez",
      category: "product",
      analysis: {
        quantTheme1: {
          title: "Automated Testing ROI",
          description:
            "After investing $120K in test automation infrastructure (Cypress E2E, increased unit test coverage from 60% to 85%), bug escape rate dropped 40%. Pre-production bugs caught increased 3x.",
          insight:
            "Investment in testing infrastructure is paying dividends - preventing bugs is cheaper than fixing them in production.",
        },
        quantTheme2: {
          title: "Checkout Flow Concentration",
          description:
            "Despite overall improvement, 80% of remaining bugs are in checkout flow. Stripe API changes broke webhook handling - affects payment confirmation emails and subscription renewals.",
          insight:
            "Quality improvements are uneven - checkout flow needs dedicated QA resources and better integration testing for payment provider APIs.",
        },
        qualTheme: {
          title: "Developer Morale",
          description:
            "Engineering team reports less firefighting, more feature work. Quote from retrospective: 'Finally have time to pay down tech debt.' Less weekend on-call, better work-life balance.",
          feedback: "Engineering team morale improving with fewer production incidents - sustainable pace returning.",
        },
        actionableRecommendations: [
          "Ship checkout hotfix immediately - payment bugs directly impact revenue",
          "Add Stripe webhook testing to CI/CD pipeline to catch API changes automatically",
          "Dedicate 1 senior engineer to payment infrastructure ownership",
          "Continue investing in test automation - target 90% coverage by end of quarter",
          "Document QA process improvements and share with other teams",
        ],
      },
      synthesis: {
        executiveSummary:
          "Good - Bug rate declining shows quality investments working. But concentration of bugs in critical checkout flow is concerning.",
        keyDrivers: [
          "Cultural shift toward quality, test coverage increase, automated checks.",
          "Insufficient integration testing with third-party services like Stripe.",
        ],
        strategicImplications:
          "Improving product quality directly reduces churn and support costs. However, checkout bugs risk revenue loss - every failed payment is potential lost customer.",
        nextSteps: [
          "Ship checkout hotfix immediately - payment bugs directly impact revenue",
          "Add Stripe webhook testing to CI/CD pipeline to catch API changes automatically",
          "Dedicate 1 senior engineer to payment infrastructure ownership",
          "Continue investing in test automation - target 90% coverage by end of quarter",
          "Document QA process improvements and share with other teams",
        ],
      },
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
          category: "product",
          detail: {
            analysisKeyTakeaway:
              "Bug rate down 15% despite shipping 40% more features. New QA process and automated testing working. But: 80% of remaining bugs are in checkout flow.",
            benchmark: "Below industry average of 2.3 bugs per 1000 lines of code",
            rootCauseHypothesis:
              "Investment in testing infrastructure paying off. Checkout bugs stem from payment provider API changes - Stripe updated webhooks and your error handling broke.",
            implications:
              "For Engineering: Ship checkout hotfix today. For Product: Quality improvements let you ship faster. For Finance: Fewer bugs = lower support costs.",
            risks: "Checkout bugs directly affect revenue - every failed payment is lost MRR.",
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
          category: "engineering",
          analysis: {
            quantTheme1: {
              title: "Infrastructure Optimization",
              description:
                "Upgraded database connection pooling and added read replicas. Peak traffic handling improved 3x - can now handle 50K concurrent users (up from 15K). Page load times improved 40%.",
              insight:
                "Infrastructure investments eliminated capacity bottlenecks - ready for growth without stability concerns.",
            },
            quantTheme2: {
              title: "Incident Reduction",
              description:
                "Only 1 incident in 30 days (vs. 7 incidents previous month). Mean time to resolution improved from 2.1 hours to 47 minutes with better alerting and runbooks.",
              insight: "Operational excellence improving - team can identify and fix issues before customers notice.",
            },
            qualTheme: {
              title: "Customer Trust",
              description:
                "Enterprise customers specifically mention reliability in renewals. Quote: 'You've proven you can handle our scale - we're expanding our deployment.' Uptime now a competitive advantage in sales.",
              feedback:
                "Reliability has shifted from concern to competitive differentiator in enterprise sales conversations.",
            },
            actionableRecommendations: [
              "Document infrastructure patterns and create playbook for scaling",
              "Can now confidently target enterprise customers who require 99.9%+ SLAs",
              "Use uptime improvements as case study in sales materials",
              "Invest in chaos engineering to proactively identify failure scenarios",
              "Build status page with real-time metrics to increase transparency",
            ],
          },
          synthesis: {
            executiveSummary:
              "Good - Uptime at 99.97% matches enterprise SaaS standards. This unlocks new market opportunities.",
            keyDrivers: [
              "Previous incidents caused by database connection pool exhaustion during traffic spikes.",
              "Autoscaling configuration and read replicas solved root cause.",
            ],
            strategicImplications:
              "Reliability is now a sales enabler rather than objection. Can pursue enterprise deals requiring stringent SLAs. Estimated $1.2M in previously unaddressable market opportunity.",
            nextSteps: [
              "Document infrastructure patterns and create playbook for scaling",
              "Can now confidently target enterprise customers who require 99.9%+ SLAs",
              "Use uptime improvements as case study in sales materials",
              "Invest in chaos engineering to proactively identify failure scenarios",
              "Build status page with real-time metrics to increase transparency",
            ],
          },
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
      id: "sales-performance",
      name: "Sales Performance",
      summary: "Overall sales effectiveness and revenue generation",
      trend: "up",
      trendValue: "+8%",
      absoluteValue: "$450K",
      benchmarkValue: "Industry avg: $380K (team of 5)",
      highlighted: true,
      timeframe: "vs. last month",
      dataSource: ["Salesforce", "HubSpot"],
      owner: "Jennifer Park",
      category: "sales",
      analysis: {
        quantTheme1: {
          title: "Sales Team Productivity",
          description:
            "Revenue per sales rep increased from $450K to $531K annually. New sales playbook standardized demo process - average deal size up 25%, sales cycle shortened by 15%.",
          insight:
            "Sales enablement investments paying off - team is closing bigger deals faster with standardized best practices.",
        },
        quantTheme2: {
          title: "Channel Performance Divergence",
          description:
            "Inbound leads convert at 28% while outbound at 12%. Spending 60% of budget on outbound but it generates only 35% of revenue. ROI mismatch indicates need to rebalance.",
          insight:
            "Channel mix is suboptimal - should shift budget toward higher-converting inbound while improving outbound targeting.",
        },
        qualTheme: {
          title: "Sales Team Confidence",
          description:
            "Team morale high after successful quarter. Quote from Sales QBR: 'Finally have tools and processes that work.' Reps closing deals independently without constant manager intervention.",
          feedback:
            "Sales team operating with increased autonomy and confidence - playbook providing structure without micromanagement.",
        },
        actionableRecommendations: [
          "Reallocate 20% of budget from outbound to inbound marketing to capitalize on better conversion rates",
          "Hire 2 more inbound SDRs to handle increased lead volume",
          "Improve outbound targeting using firmographic data to increase 12% conversion rate",
          "Document and scale the successful sales playbook across entire team",
          "Consider separate compensation structure for inbound vs outbound roles",
        ],
      },
      synthesis: {
        executiveSummary:
          "Good - Sales performance up across all metrics. Team executing well with improved processes and tools.",
        keyDrivers: [
          "Sales enablement investments (playbook, training, better tools) driving productivity gains.",
          "Product-market fit improving, making inbound leads higher quality.",
        ],
        strategicImplications:
          "Strong sales performance directly fueling company growth. +18% improvement enables hitting annual revenue targets with current team size.",
        nextSteps: [
          "Reallocate 20% of budget from outbound to inbound marketing to capitalize on better conversion rates",
          "Hire 2 more inbound SDRs to handle increased lead volume",
          "Improve outbound targeting using firmographic data to increase 12% conversion rate",
          "Document and scale the successful sales playbook across entire team",
          "Consider separate compensation structure for inbound vs outbound roles",
        ],
      },
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
          category: "sales",
          analysis: {
            quantTheme1: {
              title: "Segment Performance Gap",
              description:
                "SMB converts at 28% (up from 22%) while Enterprise at only 9% (down from 11%). Spending equal time on both segments but ROI dramatically different. SMB deals close in 2 weeks, Enterprise takes 8 weeks.",
              insight:
                "Resource allocation mismatch - treating all leads equally when they require very different sales motions.",
            },
            quantTheme2: {
              title: "Self-Serve Success",
              description:
                "SMB customers self-serve through trial with minimal sales touch. New in-app onboarding increased SMB conversion 27%. Enterprise needs custom demos, security reviews, legal - your team isn't staffed for this.",
              insight:
                "Product-led growth working for SMB. Enterprise needs specialized sales resources we currently lack.",
            },
            qualTheme: {
              title: "Enterprise Buyer Frustration",
              description:
                "Enterprise prospects report: 'Took 2 weeks just to schedule a demo.' 'We need custom security review but your team seems unfamiliar with our requirements.' Lost 4 deals to competitors with dedicated enterprise teams.",
              feedback: "Enterprise buyers expect white-glove treatment but we're providing SMB-style service.",
            },
            actionableRecommendations: [
              "Hire 2 Enterprise AEs with Fortune 500 experience and 1 Solutions Engineer",
              "Create separate sales motions: product-led growth for SMB, high-touch for Enterprise",
              "Implement lead routing based on company size - don't waste enterprise AE time on SMB",
              "Build enterprise demo environment with SSO, custom branding, and sample data",
              "Partner with legal/security teams to create standardized enterprise documentation",
            ],
          },
          synthesis: {
            executiveSummary:
              "Mixed - Overall conversion improving but hiding dangerous segment divergence. SMB excellent, Enterprise failing.",
            keyDrivers: [
              "Treating all leads uniformly when they need different approaches. SMB thrives with product-led growth, Enterprise needs consultative selling we're not equipped for.",
            ],
            strategicImplications:
              "Missing enterprise opportunities limits growth potential. Enterprise is where margins and deal sizes expand. Current approach caps TAM.",
            nextSteps: [
              "Hire 2 Enterprise AEs with Fortune 500 experience and 1 Solutions Engineer",
              "Create separate sales motions: product-led growth for SMB, high-touch for Enterprise",
              "Implement lead routing based on company size - don't waste enterprise AE time on SMB",
              "Build enterprise demo environment with SSO, custom branding, and sample data",
              "Partner with legal/security teams to create standardized enterprise documentation",
            ],
          },
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
          category: "sales",
          analysis: {
            quantTheme1: {
              title: "Seat Expansion",
              description:
                "Customers buying 40% more seats on initial purchase. Shifted from 'start small' to 'buy for whole team' positioning. Average deal went from 12 seats to 17 seats, same per-seat price.",
              insight:
                "Customers confident enough to buy for entire team upfront - indicates strong product-market fit and reduced purchase risk.",
            },
            quantTheme2: {
              title: "Analytics Module Attachment",
              description:
                "New analytics add-on attached to 60% of deals ($3K per deal, 15% margin). Launched 90 days ago, already $180K in quarterly add-on revenue. Customers see immediate value in reporting capabilities.",
              insight:
                "Product is evolving from single tool to platform - multiple expansion vectors emerging beyond seat count.",
            },
            qualTheme: {
              title: "Buyer Confidence",
              description:
                "Customers quote: 'ROI calculator in proposal made buying decision easy.' 'Seeing how competitors use your analytics module convinced us to add it.' More buying conviction from better sales materials.",
              feedback:
                "Sales enablement materials (ROI calculator, customer stories) giving buyers confidence to spend more.",
            },
            actionableRecommendations: [
              "Train all sales reps to demo analytics module in every demo - not optional",
              "Increase LTV projections to $45K (from $30K) to reflect new deal sizes",
              "Develop second high-margin add-on to create multiple expansion paths",
              "Build ROI calculator for analytics module to justify premium pricing",
              "Create case studies highlighting analytics module outcomes",
            ],
          },
          synthesis: {
            executiveSummary:
              "Good - Deal size growth exceeds market benchmarks. Indicates successful evolution toward platform positioning.",
            keyDrivers: [
              "Product delivering clear value, making buyers comfortable with larger commitments.",
              "Analytics module filled real gap in market.",
              "Better sales materials reducing purchase friction.",
            ],
            strategicImplications:
              "Larger deals improve unit economics dramatically. Sales efficiency increases because same effort yields 25% more revenue. Path to profitability accelerating.",
            nextSteps: [
              "Train all sales reps to demo analytics module in every demo - not optional",
              "Increase LTV projections to $45K (from $30K) to reflect new deal sizes",
              "Develop second high-margin add-on to create multiple expansion paths",
              "Build ROI calculator for analytics module to justify premium pricing",
              "Create case studies highlighting analytics module outcomes",
            ],
          },
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
          category: "sales",
          analysis: {
            quantTheme1: {
              title: "Demo-to-Proposal Acceleration",
              description:
                "Demo-to-proposal stage shortened from 18 to 11 days (39% improvement). New proposal template with embedded ROI calculator helps buyers build internal business case faster.",
              insight:
                "Reducing friction in buying process directly accelerates deal velocity - buyers want to buy but need tools to justify internally.",
            },
            quantTheme2: {
              title: "Compliance Bottleneck",
              description:
                "Legal/security reviews still take 12 days (unchanged). Lack of SOC 2 certification means every prospect needs internal approval. Competitors with compliance certifications skip this entirely.",
              insight:
                "Compliance gap creating competitive disadvantage - prospects want to buy but internal processes slow them down.",
            },
            qualTheme: {
              title: "Buyer Urgency",
              description:
                "Prospects report: 'Your ROI calculator showed 6-month payback - easy to get budget approved.' 'Wish you had SOC 2 so we could fast-track this.' More buyers actively pulling deals forward rather than pushing back.",
              feedback: "Buyers are pre-sold on value proposition - remaining friction is procedural, not skepticism.",
            },
            actionableRecommendations: [
              "Invest $200K in SOC 2 certification to eliminate 12-day security review bottleneck",
              "Calculate ROI of faster sales cycles: 15% velocity gain = 20% more deals closed with same team",
              "Create library of pre-approved security documentation to streamline reviews",
              "Build self-serve security portal for prospects (penetration test results, compliance status)",
              "Consider insurance or indemnification to reduce legal review requirements",
            ],
          },
          synthesis: {
            executiveSummary:
              "Good with caveat - Velocity improvements are working but compliance gap remains unaddressed bottleneck.",
            keyDrivers: [
              "Sales process improvements (better templates, ROI tools) reducing internal friction.",
              "External friction (compliance requirements) remains because we haven't invested in certifications.",
            ],
            strategicImplications:
              "Faster sales cycles mean sales team can close 20% more deals without additional headcount. Compliance gap is addressable with one-time investment.",
            nextSteps: [
              "Invest $200K in SOC 2 certification to eliminate 12-day security review bottleneck",
              "Calculate ROI of faster sales cycles: 15% velocity gain = 20% more deals closed with same team",
              "Create library of pre-approved security documentation to streamline reviews",
              "Build self-serve security portal for prospects (penetration test results, compliance status)",
              "Consider insurance or indemnification to reduce legal review requirements",
            ],
          },
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
      name: "Marketing Performance",
      summary: "Marketing campaign effectiveness and lead generation",
      trend: "up",
      trendValue: "+15%",
      absoluteValue: "450",
      benchmarkValue: "Industry avg: 380 leads/month",
      investigating: true,
      timeframe: "vs. last month",
      dataSource: ["HubSpot", "Google Analytics"],
      owner: "Marketing Lead",
      category: "marketing",
      analysis: {
        quantTheme1: {
          title: "Content Marketing Efficiency",
          description:
            "Content marketing delivering 3.2x ROI while paid ads at 1.8x. 80 blog posts in 6 months now rank for 1,200+ keywords, driving 45% of organic traffic. SEO investment ($120K) generating $384K in attributed revenue.",
          insight:
            "Content marketing has crossed critical mass threshold - compounding returns accelerating as older content continues to drive traffic.",
        },
        quantTheme2: {
          title: "Channel Mix Optimization",
          description:
            "Referral program launched 4 months ago now drives 15% of new signups at $890 CAC (vs $2,400 average). LinkedIn ads underperforming at $4,200 CAC with poor conversion. Budget reallocation opportunity.",
          insight:
            "Dramatic performance variance across channels - need aggressive reallocation from underperformers to winners.",
        },
        qualTheme: {
          title: "Brand Perception Shift",
          description:
            "Prospects increasingly mention 'thought leadership' and 'found your guide on Google' as reasons for considering product. Brand recognition improving in target segments. Sales team reports warmer inbound leads.",
          feedback:
            "Content strategy successfully positioning brand as industry authority - creating pipeline advantage.",
        },
        actionableRecommendations: [
          "Double content team investment - hire 2 more writers to scale from 13 to 20 posts/month",
          "Cut LinkedIn ad spend by 60% and reallocate to content + referral program expansion",
          "Launch partner program to amplify referral channel (currently $890 CAC vs $2,400 average)",
          "Create content distribution partnerships with industry publications",
          "Build SEO optimization process - technical SEO audit every quarter",
        ],
      },
      synthesis: {
        executiveSummary:
          "Good - Marketing ROI improving significantly due to content marketing flywheel and referral program success. However, paid advertising underperforming creates optimization opportunity.",
        keyDrivers: [
          "Content marketing investments from 6+ months ago now generating compounding returns through organic search.",
          "Referral program demonstrating product-market fit - customers willing to recommend.",
          "Paid channels (LinkedIn) poorly targeted with high CAC and low conversion.",
        ],
        strategicImplications:
          "Marketing efficiency gains directly improve unit economics. At +20% ROI improvement, can afford to hire more sales reps or invest in product. Channel reallocation could save $150K/quarter while maintaining lead volume.",
        nextSteps: [
          "Double content team investment - hire 2 more writers to scale from 13 to 20 posts/month",
          "Cut LinkedIn ad spend by 60% and reallocate to content + referral program expansion",
          "Launch partner program to amplify referral channel (currently $890 CAC vs $2,400 average)",
          "Create content distribution partnerships with industry publications",
          "Build SEO optimization process - technical SEO audit every quarter",
        ],
      },
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
          category: "marketing",
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
          category: "marketing",
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
      summary: "Ability to retain existing customers over time",
      trend: "down",
      trendValue: "-2%",
      absoluteValue: "92%",
      benchmarkValue: "Industry avg: 94% (B2B SaaS)",
      timeframe: "vs. last quarter",
      dataSource: ["Stripe", "Salesforce"],
      owner: "Emily Thompson",
      category: "cs",
      analysis: {
        quantTheme1: {
          title: "Health Score Model Success",
          description:
            "Implemented customer health scoring 90 days ago. Proactive outreach when usage drops 30% saved 14 accounts ($167K ARR) last month. Early warning system working - CS team intervening before customers consider churning.",
          insight: "Data-driven intervention works - can predict and prevent churn if you act early enough.",
        },
        quantTheme2: {
          title: "Churn Concentration",
          description:
            "Overall retention stable at 96%, but churn concentrated in $5-10K mid-market accounts (18% churn rate vs 2% for enterprise). Mid-market customers cite 'too complex' and 'missing key integrations' as exit reasons.",
          insight:
            "Product positioning mismatch for mid-market - need to simplify offering or accept segment isn't ideal fit.",
        },
        qualTheme: {
          title: "Expansion Momentum",
          description:
            "Customers who stay are expanding enthusiastically. Quote: 'Started with 5 seats, now have 40.' 'Analytics module paid for itself in first month.' Retention creating natural upsell path.",
          feedback: "Strong product-market fit among retained customers - expansion revenue validates value delivery.",
        },
        actionableRecommendations: [
          "Create simplified 'Mid-Market' tier with fewer features but easier onboarding",
          "Build integrations library for tools mid-market customers specifically request (Zapier, Slack)",
          "Scale health score model with automation - currently requires manual CS review",
          "Develop customer success playbook based on successful intervention patterns",
          "Launch quarterly business review program for all accounts >$25K ARR",
        ],
      },
      synthesis: {
        executiveSummary:
          "Stable with warning signs - Overall retention healthy but mid-market segment underperforming. Risk of leaving value on table.",
        keyDrivers: [
          "Health score model enabling proactive intervention before churn.",
          "Product complexity creating friction for mid-market segment.",
          "Strong expansion revenue from satisfied customers indicates product value.",
        ],
        strategicImplications:
          "Retention drives long-term revenue growth and reduces CAC burden. Mid-market churn concentration limits growth in key segment. Expansion revenue (112% NDR) means existing customers worth more over time - retention improvements compound.",
        nextSteps: [
          "Create simplified 'Mid-Market' tier with fewer features but easier onboarding",
          "Build integrations library for tools mid-market customers specifically request (Zapier, Slack)",
          "Scale health score model with automation - currently requires manual CS review",
          "Develop customer success playbook based on successful intervention patterns",
          "Launch quarterly business review program for all accounts >$25K ARR",
        ],
      },
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
          category: "cs",
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
          category: "company",
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
      summary: "Rate at which new features and products are adopted by users",
      trend: "up",
      trendValue: "+5%",
      absoluteValue: "68%",
      benchmarkValue: "Industry avg: 62%",
      timeframe: "vs. last month",
      dataSource: ["Amplitude", "Mixpanel"],
      owner: "Sarah Chen",
      category: "product",
      analysis: {
        quantTheme1: {
          title: "Enterprise Deployment Success",
          description:
            "DAU grew from 12,400 to 14,600, but 60% of growth from Acme Corp rolling out to 800 users. Proves enterprise deployment model works - comprehensive onboarding, dedicated CSM, executive sponsorship drove 92% activation rate.",
          insight:
            "Successful enterprise rollout demonstrates repeatable playbook - can target similar large accounts with confidence.",
        },
        quantTheme2: {
          title: "Collaboration Features Driving Organic Growth",
          description:
            "New @mentions and commenting features launched 60 days ago creating network effects. Users inviting teammates 3.2x more than pre-launch. Viral coefficient improved from 0.3 to 0.8 (approaching viral growth threshold of 1.0).",
          insight:
            "Collaboration features turning product into multi-player experience - organic growth accelerating through network effects.",
        },
        qualTheme: {
          title: "Team-Based Usage Patterns",
          description:
            "Customers report: 'Entire team is now on the platform because of commenting.' 'Can't do our work without it anymore.' Product becoming team-wide standard rather than individual tool.",
          feedback:
            "Product transitioning from individual productivity tool to team collaboration platform - increasing stickiness and switching costs.",
        },
        actionableRecommendations: [
          "Document Acme playbook and create enterprise deployment methodology for sales",
          "Double down on collaboration features - add real-time co-editing and presence indicators",
          "Build team analytics dashboard to help admins track adoption and engagement",
          "Create case study featuring Acme deployment to enable similar enterprise deals",
          "Develop tiered onboarding: self-serve for individuals, white-glove for teams 20+",
        ],
      },
      synthesis: {
        executiveSummary:
          "Good with concentration risk - Strong adoption growth driven by successful enterprise deployment and viral collaboration features, but dependency on single customer creates risk.",
        keyDrivers: [
          "Acme Corp enterprise rollout (800 users) proves deployment model works at scale.",
          "Collaboration features creating network effects - users inviting teammates organically.",
          "Product evolution from individual tool to team platform increasing stickiness.",
        ],
        strategicImplications:
          "Product adoption directly correlates with retention and expansion. High adoption = low churn risk. Acme's renewal in 8 months is critical - losing them would drop DAU 35%. Need to diversify with more enterprise deployments.",
        nextSteps: [
          "Document Acme playbook and create enterprise deployment methodology for sales",
          "Double down on collaboration features - add real-time co-editing and presence indicators",
          "Build team analytics dashboard to help admins track adoption and engagement",
          "Create case study featuring Acme deployment to enable similar enterprise deals",
          "Develop tiered onboarding: self-serve for individuals, white-glove for teams 20+",
        ],
      },
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
          category: "product",
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
          category: "product",
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
      summary: "Measure of how actively users engage with the product",
      trend: "up",
      trendValue: "+7%",
      absoluteValue: "7.8/10",
      benchmarkValue: "Industry avg: 7.2/10",
      highlighted: true,
      timeframe: "vs. last 30 days",
      dataSource: ["Amplitude", "Mixpanel"],
      owner: "David Kim",
      category: "product",
      analysis: {
        quantTheme1: {
          title: "Dashboard Redesign Impact",
          description:
            "New dashboard rolled out Nov 15th. DAU/MAU ratio dropped from 0.68 to 0.60. Session duration decreased 18 minutes to 12 minutes. Power users (40% revenue) significantly impacted.",
          insight:
            "Dashboard redesign negatively impacted core user engagement - move frequently-used features closer to home.",
        },
        quantTheme2: {
          title: "Feature Discoverability",
          description:
            "New 'Smart Filters' feature has 25% trial but only 8% retention. Users find it but don't integrate into workflow. Tutorials too long (8 mins), configuration unclear.",
          insight:
            "Feature is desired but poorly implemented - need simplified onboarding and better UX to drive retention.",
        },
        qualTheme: {
          title: "User Frustration",
          description:
            "Power users complain: 'Where did my shortcuts go?' 'Takes too many clicks to get to X.' NPS dropped 7 points among this segment. Risk of churn if not addressed.",
          feedback: "Core user experience degraded by redesign - leading to frustration and potential churn.",
        },
        actionableRecommendations: [
          "Revert navigation to previous state or add customizable shortcuts in dashboard",
          "Simplify 'Smart Filters' onboarding: add pre-built templates, shorten tutorial to 2 mins",
          "Proactively reach out to top 50 accounts to offer support with new dashboard/features",
          "Conduct usability testing on redesigned dashboard with power users",
          "Analyze competitor dashboards for best practices in navigation and feature discoverability",
        ],
      },
      synthesis: {
        executiveSummary:
          "Bad - Engagement score decline directly impacts retention and expansion. Redesign has clearly backfired.",
        keyDrivers: [
          "Dashboard redesign moved frequently used features too deep.",
          "'Smart Filters' suffer from poor discoverability and onboarding.",
          "Power users are disenfranchised.",
        ],
        strategicImplications:
          "Reduced engagement signals potential churn risk, especially among high-value users. Could impact revenue growth if not addressed swiftly.",
        nextSteps: [
          "Revert navigation to previous state or add customizable shortcuts in dashboard",
          "Simplify 'Smart Filters' onboarding: add pre-built templates, shorten tutorial to 2 mins",
          "Proactively reach out to top 50 accounts to offer support with new dashboard/features",
          "Conduct usability testing on redesigned dashboard with power users",
          "Analyze competitor dashboards for best practices in navigation and feature discoverability",
        ],
      },
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
      id: "sales-conversion",
      name: "Sales Conversion Rate",
      summary: "Percentage of leads that convert to paying customers",
      trend: "down",
      trendValue: "-4%",
      absoluteValue: "18%",
      benchmarkValue: "Industry avg: 22% (B2B SaaS)",
      investigating: true,
      timeframe: "vs. last month",
      dataSource: ["Salesforce", "HubSpot"],
      owner: "Jennifer Park",
      category: "sales",
      analysis: {
        quantTheme1: {
          title: "Enterprise Trial Gating",
          description:
            "8 enterprise deals lost due to gated features (API access, SSO). Competitors offer these in trials, leading to faster evaluation and purchase. Current conversion rate for Enterprise is 8% (vs. SMB 22%).",
          insight:
            "Gating critical enterprise features in trials directly hinders conversion and puts us at a disadvantage.",
        },
        quantTheme2: {
          title: "Sales Team Bandwidth",
          description:
            "Enterprise deals require custom demos, security reviews, and legal. Sales team averages 2 weeks to schedule demos and lacks familiarity with prospect requirements. Leads to long sales cycles.",
          insight: "Current sales team structure is not equipped for high-touch enterprise sales motions.",
        },
        qualTheme: {
          title: "Lost Deal Feedback",
          description:
            "Lost deals citing: 'Couldn't properly evaluate API.' 'Security review process too slow.' 'Competitor X provided SSO in trial.' Clear patterns of lost business due to trial limitations.",
          feedback:
            "Enterprise prospects are experiencing friction due to trial limitations and slow internal processes.",
        },
        actionableRecommendations: [
          "Enable SSO and API access (with usage limits) in enterprise trials",
          "Build dedicated enterprise demo environment with SSO and sample data",
          "Create 'evaluation mode' for enterprise features to allow deeper testing",
          "Partner with security/legal to create standardized enterprise documentation for quick reviews",
          "Train enterprise AEs on security compliance and integration use cases",
        ],
      },
      synthesis: {
        executiveSummary:
          "Bad - Overall conversion rate declining, driven by significant drop in enterprise segment. Losing deals due to poor trial experience.",
        keyDrivers: [
          "Critical enterprise features (API, SSO) are gated behind paid tiers, preventing proper evaluation during trial.",
          "Sales team lacks resources for high-touch enterprise sales.",
        ],
        strategicImplications:
          "Failure to convert enterprise trials limits high-margin revenue growth. Competitors are gaining ground in a key market segment.",
        nextSteps: [
          "Enable SSO and API access (with usage limits) in enterprise trials",
          "Build dedicated enterprise demo environment with SSO and sample data",
          "Create 'evaluation mode' for enterprise features to allow deeper testing",
          "Partner with security/legal to create standardized enterprise documentation for quick reviews",
          "Train enterprise AEs on security compliance and integration use cases",
        ],
      },
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
      summary: "Rate at which customers cancel their subscriptions",
      trend: "up",
      trendValue: "+1.5%",
      absoluteValue: "4.2%",
      benchmarkValue: "Industry avg: 3.5% (monthly)",
      highlighted: true,
      timeframe: "vs. last month",
      dataSource: ["Stripe", "ChartMogul"],
      owner: "Emily Thompson",
      category: "cs",
      analysis: {
        quantTheme1: {
          title: "Forced Upgrade Impact",
          description:
            "Monthly churn increased from 2.1% to 2.5%. Critical insight: 89% of churned customers never used your new 'Pro' features, yet paid for them. They felt overcharged and unsubscribed.",
          insight: "Forcing users into higher tiers without perceived value is a direct driver of churn.",
        },
        quantTheme2: {
          title: "Pricing Tier Mismatch",
          description:
            "Your pricing update forced everyone to 'Pro' tier (+40% price), but only 18% of customers use Pro features. Exit surveys confirm 'forced upgrade for features I don't need' is primary reason for cancellation.",
          insight: "Pricing strategy is misaligned with customer needs - need to reintroduce lower tiers.",
        },
        qualTheme: {
          title: "Customer Sentiment",
          description:
            "Customers express frustration and feeling undervalued. Quote: 'Why am I paying double for features I don't use?' 'Lost trust after forced upgrade.'",
          feedback: "Customers feel exploited by pricing changes, leading to loss of trust and increased churn.",
        },
        actionableRecommendations: [
          "Bring back 'Starter' tier immediately - offer it retroactively to churned customers",
          "Communicate pricing changes transparently and offer downgrade option",
          "Conduct customer surveys to understand feature usage and willingness to pay",
          "Segment customers based on feature adoption and offer tiered pricing accordingly",
          "Implement automated alerts for customers approaching feature limits of lower tiers",
        ],
      },
      synthesis: {
        executiveSummary:
          "Bad - Churn rate accelerating due to customer dissatisfaction with forced upgrades and pricing. Risking significant customer base loss.",
        keyDrivers: [
          "Pricing update forced all users into 'Pro' tier, increasing cost without corresponding perceived value for 82% of customer base.",
          "Lack of alternative tiers is alienating customers.",
        ],
        strategicImplications:
          "High churn erodes revenue base and damages brand reputation. Losing customers at this rate will impede growth and profitability.",
        nextSteps: [
          "Bring back 'Starter' tier immediately - offer it retroactively to churned customers",
          "Communicate pricing changes transparently and offer downgrade option",
          "Conduct customer surveys to understand feature usage and willingness to pay",
          "Segment customers based on feature adoption and offer tiered pricing accordingly",
          "Implement automated alerts for customers approaching feature limits of lower tiers",
        ],
      },
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
      summary: "Rate at which users adopt newly released features",
      trend: "stable",
      trendValue: "0%",
      absoluteValue: "42%",
      benchmarkValue: "Industry avg: 45%",
      timeframe: "vs. last 30 days",
      dataSource: ["Amplitude", "Pendo"],
      owner: "Sarah Chen",
      category: "product",
      analysis: {
        quantTheme1: {
          title: "Feature Discoverability Issue",
          description:
            "Only 11% of users tried the new 'Smart Reports' feature launched 2 months ago. Despite $450K dev cost, it's buried in Settings > Advanced > Reports. No in-app prompts or onboarding flow.",
          insight: "Feature is invisible to most users - discovery is the primary blocker to adoption.",
        },
        quantTheme2: {
          title: "High Value, Low Usage",
          description:
            "Users who *do* find the feature love it (NPS: 72) and use it heavily. However, casual users bounce due to complex configuration and lack of clear use cases. High trial, low retention.",
          insight: "Feature's core value is recognized, but UX/onboarding prevents broader adoption.",
        },
        qualTheme: {
          title: "User Confusion",
          description:
            "Users quote: 'Where do I find Smart Reports?' 'What is this even for?' 'Tutorial is too long and confusing.' Lack of clear value proposition and poor discoverability leading to confusion.",
          feedback: "Confusion around feature's purpose and location is preventing engagement.",
        },
        actionableRecommendations: [
          "Add prominent entry point for 'Smart Reports' on main dashboard",
          "Integrate a 2-minute video tutorial directly into the feature's UI",
          "Create pre-built report templates for common use cases (e.g., Sales Pipeline, Marketing ROI)",
          "Launch email campaign highlighting the benefits and use cases of 'Smart Reports'",
          "Targeted outreach from CS to customers who have shown interest in reporting",
        ],
      },
      synthesis: {
        executiveSummary:
          "Bad - Low adoption of a key strategic feature is a waste of significant investment and hinders product roadmap.",
        keyDrivers: [
          "Poor discoverability (feature buried in UI) and complex onboarding/configuration prevent users from accessing and understanding the 'Smart Reports' feature.",
        ],
        strategicImplications:
          "Failure to drive adoption of key features threatens ROI on product development and could lead to questions about roadmap prioritization. Limits potential for data-driven decision making.",
        nextSteps: [
          "Add prominent entry point for 'Smart Reports' on main dashboard",
          "Integrate a 2-minute video tutorial directly into the feature's UI",
          "Create pre-built report templates for common use cases (e.g., Sales Pipeline, Marketing ROI)",
          "Launch email campaign highlighting the benefits and use cases of 'Smart Reports'",
          "Targeted outreach from CS to customers who have shown interest in reporting",
        ],
      },
      detail: {
        analysisKeyTakeaway:
          "Only 11% of users have tried your new 'Smart Reports' feature launched 2 months ago, despite it being your biggest product investment this year ($450K dev cost).",
        benchmark: "Healthy feature adoption is 30%+ within 60 days of launch",
        rootCauseHypothesis:
          "Feature is buried in Settings > Advanced > Reports. No in-app prompts, no onboarding flow. Users who DO find it love it (NPS: 72), but discovery is the blocker.",
        implications:
          "For Product: Add prominent entry point on main dashboard + in-app tutorial. For Marketing: Create demo video and email campaign. Target: Democratize API access beyond engineering teams.",
        risks: "Without adoption, leadership may question product team's roadmap decisions.",
        dataSource: "Amplitude",
        dataSourceUrl: "#",
      },
      subIssues: [],
    },
    {
      id: "api-usage",
      name: "API Usage Growth",
      summary: "Growth in API calls and integrations",
      trend: "up",
      trendValue: "+12%",
      absoluteValue: "2.4M",
      benchmarkValue: "Industry avg: 1.8M calls/month",
      timeframe: "vs. last month",
      dataSource: ["Datadog", "New Relic"],
      owner: "Priya Sharma",
      category: "engineering",
      analysis: {
        quantTheme1: {
          title: "Concentration Risk",
          description:
            "API usage grew 35% QoQ, but 71% of this growth comes from just 8 customers. This mirrors revenue concentration risk - the API is 'sticky' for a few, but not 'widespread'.",
          insight:
            "API adoption is strong among a few key accounts, but lacks broad appeal. Growth is dependent on a small customer base.",
        },
        quantTheme2: {
          title: "Developer Documentation Gap",
          description:
            "API docs are excellent for experienced developers (great for experts), but lack simple 'quick start' guides. Non-technical PMs cannot enable integrations without engineering help.",
          insight:
            "Documentation is too technical for intended audience - needs 'recipes' and quick starts to enable broader adoption.",
        },
        qualTheme: {
          title: "Developer Experience Feedback",
          description:
            "Feedback suggests API is powerful but difficult to onboard with. Quote: 'Took me 3 days to get OAuth working.' 'Wish there was a Zapier integration.' Developer experience needs improvement for non-experts.",
          feedback: "API is powerful but difficult to onboard with, limiting broader adoption.",
        },
        actionableRecommendations: [
          "Create no-code Zapier integration to enable easier adoption",
          "Develop a visual API builder for non-technical users",
          "Add 'recipes' and quick-start guides to API documentation",
          "Host webinars on API integration best practices for a wider audience",
          "Create case studies showcasing successful API integrations",
        ],
      },
      synthesis: {
        executiveSummary:
          "Mixed - Strong growth signal, but concentration risk is a significant concern. Potential for widespread adoption is not being realized.",
        keyDrivers: [
          "API is powerful and sticky for expert users, but documentation lacks simple guides, and no-code solutions (like Zapier) are missing, preventing broader adoption beyond engineering teams.",
        ],
        strategicImplications:
          "API adoption is crucial for customer stickiness and retention. Current limitations restrict this benefit across the entire customer base.",
        nextSteps: [
          "Create no-code Zapier integration to enable easier adoption",
          "Develop a visual API builder for non-technical users",
          "Add 'recipes' and quick-start guides to API documentation",
          "Host webinars on API integration best practices for a wider audience",
          "Create case studies showcasing successful API integrations",
        ],
      },
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
