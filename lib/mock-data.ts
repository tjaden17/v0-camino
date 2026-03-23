import type { Insight } from "./types"

export const mockInsights: Insight[] = [
  {
    id: "sales-1",
    category: "market",
    header: "Win/Loss Rate",
    metric: "Sales Win Rate",
    value: "24%",
    change: "-8%",
    trend: "down",
    timeframe: "vs last month",
    description: "Sales win rate declined to 24%, down 8% from last month",
    summary:
      "Win rate has decreased significantly due to increased competition and longer sales cycles. Enterprise deals facing more scrutiny and budget constraints.",
    benchmark: "Industry average: 28%",
    analysis:
      "Analysis shows 45% of lost deals went to Competitor A on price, 30% to feature gaps, and 25% to timing/budget issues. Average deal size remained stable but close rates dropped.",
    implications:
      "Declining win rate impacts revenue targets and may indicate need for pricing adjustments or product enhancements to remain competitive.",
    nextSteps:
      "1. Conduct win/loss analysis interviews\n2. Review pricing strategy\n3. Address top feature gaps\n4. Improve sales qualification process",
    source: "CRM Data",
    dataSources: [
      {
        name: "Salesforce CRM",
        url: "/integrations/salesforce",
        description: "Opportunity and deal closure data",
      },
      {
        name: "Gong.io",
        url: "/integrations/gong",
        description: "Sales call analysis and competitor mentions",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-2",
    category: "market",
    header: "Deal Velocity",
    metric: "Average Sales Cycle",
    value: "47 days",
    change: "+12 days",
    trend: "down",
    timeframe: "vs last quarter",
    description: "Sales cycle lengthened to 47 days, up from 35 days last quarter",
    summary:
      "Sales cycles are taking longer to close, particularly in enterprise segment where decision-making has become more complex with additional stakeholders.",
    benchmark: "Industry average: 42 days",
    analysis:
      "Extended cycles driven by increased procurement involvement (avg +8 days), technical evaluation requirements (+5 days), and budget approval delays (+4 days).",
    implications:
      "Longer sales cycles impact revenue predictability and increase customer acquisition costs. May need to adjust sales forecasting models.",
    nextSteps:
      "1. Streamline technical evaluation process\n2. Develop procurement-friendly materials\n3. Implement champion development program\n4. Create executive sponsor engagement playbook",
    source: "CRM Analytics",
    dataSources: [
      {
        name: "HubSpot",
        url: "/integrations/hubspot",
        description: "Deal stage progression tracking",
      },
      {
        name: "Salesforce",
        description: "Historical deal cycle data",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-3",
    category: "market",
    header: "Pipeline Health",
    metric: "Qualified Pipeline",
    value: "$2.4M",
    change: "-15%",
    trend: "down",
    timeframe: "vs last month",
    description: "Qualified pipeline decreased by 15% to $2.4M",
    summary:
      "Sales pipeline has contracted due to slower lead generation and higher disqualification rates. Marketing-sourced leads down 22% month-over-month.",
    benchmark: "Target pipeline: $3.2M",
    analysis:
      "Pipeline decline attributed to reduced marketing spend (40%), seasonal slowdown (35%), and stricter lead qualification criteria (25%). Conversion rates stable at 18%.",
    implications:
      "Reduced pipeline threatens Q4 revenue targets. Need immediate action to rebuild pipeline through increased marketing activity and sales prospecting.",
    nextSteps:
      "1. Increase marketing campaign budget\n2. Launch targeted outbound campaigns\n3. Accelerate partner channel development\n4. Review and adjust lead qualification criteria",
    source: "Sales Operations",
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-4",
    category: "market",
    header: "Lost Deals",
    metric: "Deals Lost to Competition",
    value: "18 deals",
    change: "+6 deals",
    trend: "down",
    timeframe: "this month",
    description: "Lost 18 deals to competitors this month, up from 12 last month",
    summary:
      "Competitive losses increasing, primarily to Competitor A (60%) and Competitor B (25%). Price sensitivity and feature parity cited as main reasons.",
    benchmark: "Target: <10 deals/month",
    analysis:
      "Competitor A undercutting on price by avg 25%. Competitor B winning on AI features and integrations. Our response time to RFPs averaging 5.2 days vs competitor 3.1 days.",
    implications:
      "Rising competitive losses indicate market share erosion risk. Need to strengthen competitive positioning and accelerate product differentiation.",
    nextSteps:
      "1. Develop competitive battle cards\n2. Fast-track AI feature development\n3. Create flexible pricing options\n4. Improve RFP response process",
    source: "Win/Loss Analysis",
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-5",
    category: "business",
    header: "Sales Quota Attainment",
    metric: "Team Quota Achievement",
    value: "67%",
    change: "-18%",
    trend: "down",
    timeframe: "this quarter",
    description: "Sales team achieving 67% of quota, down from 85% last quarter",
    summary:
      "Quota attainment has dropped significantly with only 4 of 12 reps on track to hit targets. Enterprise team particularly struggling at 58% attainment.",
    benchmark: "Target: 85%+ quota attainment",
    analysis:
      "Underperformance driven by pipeline gaps (40%), longer sales cycles (30%), and competitive losses (30%). New reps ramping slower than expected.",
    implications:
      "Low quota attainment threatens revenue targets and may impact team morale. Risk of rep turnover if trend continues.",
    nextSteps:
      "1. Implement sales coaching program\n2. Adjust quotas based on market conditions\n3. Accelerate new rep onboarding\n4. Provide additional sales enablement resources",
    source: "Sales Performance Dashboard",
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-6",
    category: "market",
    header: "Average Deal Size",
    metric: "Average Contract Value",
    value: "$28,500",
    change: "+$3,200",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Average deal size increased to $28,500, up from $25,300",
    summary:
      "Deal sizes growing as sales team focuses on larger accounts and multi-year contracts. Enterprise segment showing particularly strong ACV growth.",
    benchmark: "Industry average: $24,000",
    analysis:
      "ACV growth driven by multi-year contracts (45% of deals vs 30% prior), expanded seat counts (avg 42 vs 35), and premium tier adoption (38% vs 28%).",
    implications:
      "Larger deal sizes improve unit economics and LTV. However, may require longer sales cycles and more resources per deal.",
    nextSteps:
      "1. Develop enterprise sales playbook\n2. Create multi-year contract incentives\n3. Build premium tier value proposition\n4. Train team on upselling strategies",
    source: "Revenue Analytics",
    isRAG: true,
    team: "sales",
  },
  {
    id: "3",
    category: "market",
    header: "Market Share",
    metric: "Market Share",
    value: "+2.3%",
    change: "+2.3%",
    trend: "up",
    timeframe: "this quarter",
    description: "Gaining ground against competitors",
    summary:
      "Market share has grown by 2.3% this quarter, primarily through expansion in the mid-market segment. Winning 65% of head-to-head deals against Competitor A.",
    benchmark:
      "Market leaders typically hold 15-25% share in our category. Our 12.3% share positions us as a strong challenger with significant growth potential.",
    analysis:
      "Win rate analysis shows superior pricing (avg 20% lower) and faster implementation (30 days vs 60) as key differentiators in mid-market segment.",
    implications:
      "Continued market share growth positions us well for the next funding round and validates our product-market fit in the mid-market segment.",
    nextSteps:
      "1) Increase sales team focus on mid-market 2) Develop case studies from recent wins 3) Enhance competitive positioning materials",
    source: "Industry Analysis & Public Data",
    isRAG: false,
    team: "sales",
  },
  {
    id: "4",
    category: "business",
    header: "MRR Growth",
    metric: "Monthly Recurring Revenue",
    value: "+18%",
    change: "+18%",
    trend: "up",
    timeframe: "month over month",
    description: "Monthly recurring revenue acceleration",
    summary:
      "Monthly recurring revenue grew 18% month-over-month, driven by both new customer acquisition and expansion revenue from existing accounts.",
    benchmark:
      "High-growth SaaS companies typically see 10-15% monthly MRR growth. Our 18% significantly exceeds benchmark, indicating strong market traction.",
    analysis:
      "Revenue breakdown: 60% new customers, 40% expansion. Enterprise deals (>$50K ARR) contributed 45% of growth with avg deal size up 23%.",
    implications:
      "Strong MRR growth indicates healthy business fundamentals and suggests we're on track to meet quarterly revenue targets and growth projections.",
    nextSteps:
      "1) Scale enterprise sales team 2) Develop expansion playbook for existing customers 3) Optimize pricing for new market segments",
    source: "Revenue Operations System",
    isRAG: true,
    team: "sales",
  },
  {
    id: "5",
    category: "tech",
    header: "API Latency",
    metric: "API Response Time",
    value: "-23ms",
    change: "-23ms",
    trend: "up",
    timeframe: "average response time",
    description: "Performance improvements showing results",
    summary:
      "API response times have improved by 23ms on average following recent infrastructure optimizations. Data-heavy endpoints show 40ms+ improvements.",
    benchmark:
      "Industry standard API response time is <200ms. Our current 145ms average puts us in the top 25% for performance in our category.",
    analysis:
      "Performance gains from database query optimization (40%), CDN improvements (35%), and code refactoring (25%). Peak load handling improved 60%.",
    implications:
      "Reduced latency improves user experience and may contribute to higher engagement rates. Performance gains also reduce infrastructure costs by 15%.",
    nextSteps:
      "1) Monitor performance metrics closely 2) Implement additional caching layers 3) Plan infrastructure scaling for projected growth",
    source: "Infrastructure Monitoring Tools",
    isRAG: true,
    team: "product",
  },
  {
    id: "6",
    category: "product",
    header: "Feature Adoption",
    metric: "New Feature Usage",
    value: "+31%",
    change: "+31%",
    trend: "up",
    timeframe: "new feature usage",
    description: "Latest feature seeing strong uptake",
    summary:
      "The new collaboration feature launched last month has achieved 31% adoption among active users, exceeding our 25% target.",
    benchmark:
      "Typical new feature adoption in SaaS is 15-25% within first month. Our 31% adoption rate indicates strong product-market fit for collaboration features.",
    analysis:
      "Power users drive adoption with 78% weekly usage. Feature correlates with 25% increase in session duration and 15% improvement in team retention.",
    implications:
      "High feature adoption validates our product roadmap decisions and suggests users find real value in collaboration capabilities.",
    nextSteps:
      "1) Expand collaboration features based on user feedback 2) Create in-app tutorials for broader adoption 3) Develop team-based pricing tiers",
    source: "Feature Analytics Platform",
    isRAG: true,
    team: "product",
  },
  {
    id: "7",
    category: "market",
    header: "Industry Trends",
    metric: "Market Growth",
    value: "+15%",
    change: "+15%",
    trend: "up",
    timeframe: "industry wide",
    description: "SaaS market showing strong growth",
    summary:
      "The SaaS industry is experiencing 15% year-over-year growth, driven by digital transformation initiatives and remote work adoption.",
    benchmark:
      "Global SaaS market expected to reach $623B by 2025. Current growth rate of 15% aligns with analyst predictions for continued expansion.",
    analysis:
      "Growth drivers include AI integration (35%), mobile-first solutions (28%), and vertical-specific platforms (22%). Enterprise adoption accelerating.",
    implications:
      "Strong industry tailwinds create favorable conditions for expansion and new customer acquisition across all market segments.",
    nextSteps:
      "1) Align product roadmap with industry trends 2) Increase marketing spend to capture market growth 3) Explore AI integration opportunities",
    source: "Industry Research & Market Reports",
    isRAG: false,
    team: "marketing",
  },
  {
    id: "8",
    category: "business",
    header: "Funding Trends",
    metric: "VC Investment",
    value: "-12%",
    change: "-12%",
    trend: "down",
    timeframe: "in Q3",
    description: "VC funding showing seasonal decline",
    summary:
      "Venture capital investment in SaaS companies decreased 12% in Q3, reflecting broader market conditions and increased investor selectivity.",
    benchmark:
      "Typical Q3 funding decline is 8-10% due to seasonal patterns. The 12% decrease is slightly above historical averages but within normal range.",
    analysis:
      "Funding concentrated in later-stage companies (Series B+) with proven metrics. Early-stage funding down 18% while growth-stage down only 6%.",
    implications:
      "Tighter funding environment emphasizes importance of strong unit economics and clear path to profitability for future fundraising.",
    nextSteps:
      "1) Focus on revenue growth and margin improvement 2) Prepare detailed financial projections 3) Build relationships with growth-stage investors",
    source: "VC Market Analysis & Public Filings",
    isRAG: false,
    team: "sales",
  },
  {
    id: "9",
    category: "tech",
    header: "System Uptime",
    metric: "Service Availability",
    value: "99.97%",
    change: "+0.12%",
    trend: "up",
    timeframe: "this month",
    description: "Infrastructure reliability improvements",
    summary:
      "System uptime has improved to 99.97% this month, exceeding our 99.9% SLA commitment through infrastructure redundancy and proactive monitoring.",
    benchmark:
      "Enterprise SaaS standard is 99.9% uptime. Our 99.97% exceeds industry expectations and positions us as a highly reliable platform.",
    analysis:
      "Improvements from automated failover systems (45%), enhanced monitoring (30%), and infrastructure redundancy (25%). Zero critical incidents this month.",
    implications:
      "Higher uptime strengthens customer trust and reduces churn risk. Exceeding SLA commitments provides competitive advantage in enterprise sales.",
    nextSteps:
      "1) Document reliability improvements for sales materials 2) Implement predictive maintenance 3) Expand monitoring coverage",
    source: "Infrastructure Monitoring System",
    isRAG: true,
    team: "product",
  },
  {
    id: "10",
    category: "product",
    header: "Churn Rate",
    metric: "Customer Churn",
    value: "-1.2%",
    change: "-1.2%",
    trend: "up",
    timeframe: "this quarter",
    description: "Customer retention improving",
    summary:
      "Churn rate decreased to 3.8% this quarter from 5.0% last quarter, driven by improved customer success initiatives and product enhancements.",
    benchmark:
      "SaaS industry average churn is 5-7% annually. Our quarterly rate of 3.8% translates to ~15% annual churn, indicating room for improvement.",
    analysis:
      "Churn reduction primarily from mid-market segment (down 2.1%). Proactive customer success outreach reduced at-risk account churn by 35%.",
    implications:
      "Lower churn improves LTV and unit economics. Continued focus on retention will accelerate path to profitability and improve growth efficiency.",
    nextSteps:
      "1) Expand customer success team 2) Implement early warning system for at-risk accounts 3) Develop retention playbooks",
    source: "Customer Success Platform",
    isRAG: true,
    team: "product",
  },
  {
    id: "11",
    category: "market",
    header: "Competitor Activity",
    metric: "Competitive Landscape",
    value: "3 new",
    change: "+3",
    trend: "down",
    timeframe: "new entrants",
    description: "Increased competition in market",
    summary:
      "Three new competitors entered the market this quarter, bringing total competitive landscape to 15 direct competitors with similar offerings.",
    benchmark:
      "Market consolidation typical in mature SaaS categories. Current competitive intensity is moderate compared to other enterprise software segments.",
    analysis:
      "New entrants focus on niche verticals (2) and AI-powered features (1). Average funding $8M seed rounds. Limited enterprise traction to date.",
    implications:
      "Increased competition may pressure pricing and require stronger differentiation. Early-stage competitors validate market opportunity.",
    nextSteps:
      "1) Strengthen competitive positioning 2) Accelerate product differentiation 3) Monitor competitor feature releases closely",
    source: "Market Intelligence & News",
    isRAG: false,
    team: "marketing",
  },
  {
    id: "12",
    category: "business",
    header: "CAC Payback",
    metric: "Customer Acquisition Cost Payback",
    value: "8.2 months",
    change: "-1.3 mo",
    trend: "up",
    timeframe: "average payback",
    description: "Improving unit economics",
    summary:
      "CAC payback period improved to 8.2 months from 9.5 months last quarter, driven by higher ACV and improved sales efficiency.",
    benchmark:
      "Best-in-class SaaS companies achieve 6-12 month CAC payback. Our 8.2 months is within healthy range and trending positively.",
    analysis:
      "Improvement from 23% increase in average contract value and 15% reduction in sales cycle length. Enterprise segment shows 6.5 month payback.",
    implications:
      "Faster payback improves cash flow efficiency and enables more aggressive growth investment. Strong signal for investors and board.",
    nextSteps:
      "1) Focus on enterprise segment expansion 2) Optimize marketing spend allocation 3) Develop upsell strategies for faster payback",
    source: "Financial Analytics System",
    isRAG: true,
    team: "sales",
  },
  {
    id: "1",
    category: "customer",
    header: "CSAT",
    metric: "Customer Satisfaction",
    value: "74%",
    change: "-4%",
    trend: "down",
    timeframe: "in 7 days",
    description: "Customer satisfaction scores have declined",
    summary:
      "Customer satisfaction has dropped by 4% over the past week, primarily driven by increased response times in customer support and reported issues with the new checkout flow.",
    benchmark:
      "Industry average CSAT is 78%. Our current score of 74% is below benchmark, indicating urgent need for improvement to maintain competitive position.",
    analysis:
      "Root cause analysis reveals 60% of complaints relate to support response times (avg 4.2hrs vs target 2hrs) and 40% to checkout flow friction points introduced in last release.",
    implications:
      "This trend could impact customer retention and renewal rates. Immediate action needed to address support bottlenecks and checkout flow issues to prevent further satisfaction decline.",
    nextSteps:
      "1) Deploy hotfix for checkout flow issues by EOW 2) Increase support team capacity 3) Implement proactive customer outreach for affected users",
    source: "Customer Survey Platform",
    dataSources: [
      {
        name: "Zendesk",
        url: "/integrations/zendesk",
        description: "Support ticket data and CSAT scores",
      },
      {
        name: "Intercom",
        url: "/integrations/intercom",
        description: "In-app survey responses",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "2",
    category: "product",
    header: "D1 Engagement",
    metric: "Day 1 Engagement",
    value: "+12%",
    change: "+12%",
    trend: "up",
    timeframe: "vs last month",
    description: "Day 1 user engagement is up significantly",
    summary:
      "First-day user engagement has increased by 12% compared to last month, driven by the new onboarding flow and improved feature discovery.",
    benchmark:
      "Best-in-class D1 engagement for SaaS products is 40-60%. Our current 52% puts us in the top quartile, indicating strong product-market fit.",
    analysis:
      "A/B testing shows the new progressive onboarding increased completion rates by 23%. Mobile users show 18% higher engagement than desktop users.",
    implications:
      "Higher D1 engagement typically correlates with improved long-term retention. This positive trend suggests the recent product improvements are resonating with new users.",
    nextSteps:
      "1) Roll out mobile-optimized onboarding to all users 2) Analyze successful user paths for further optimization 3) Test personalized onboarding flows",
    source: "Product Analytics Dashboard",
    isRAG: true,
    team: "product",
  },
  {
    id: "customer-2",
    category: "customer",
    header: "NPS",
    metric: "Net Promoter Score",
    value: "42",
    change: "+5",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Net Promoter Score improved to 42, up 5 points from last quarter",
    summary:
      "NPS has shown steady improvement driven by product enhancements and faster customer support response times. Promoters increased from 45% to 52%.",
    benchmark: "Industry average NPS: 36",
    analysis:
      "Improvement primarily from enterprise customers (NPS 48) vs SMB (NPS 38). Key drivers: new collaboration features (+12 points) and improved onboarding (-8 points detractor reduction).",
    implications:
      "Rising NPS indicates stronger customer advocacy and lower churn risk. Promoters drive 3x more referrals than passive customers.",
    nextSteps:
      "1. Launch referral program targeting promoters\n2. Address SMB customer pain points\n3. Scale support team for continued fast response times\n4. Capture customer testimonials from promoters",
    source: "Customer Feedback Surveys",
    dataSources: [
      {
        name: "Delighted",
        url: "/integrations/delighted",
        description: "NPS survey responses and tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "customer-3",
    category: "customer",
    header: "Customer Retention",
    metric: "12-Month Retention Rate",
    value: "92%",
    change: "+3%",
    trend: "up",
    timeframe: "vs last year",
    description: "12-month customer retention improved to 92%",
    summary:
      "Customer retention has increased by 3% year-over-year, driven by proactive customer success initiatives and product improvements addressing top churn reasons.",
    benchmark: "SaaS industry average: 85-90%",
    analysis:
      "Retention improvements strongest in accounts with quarterly business reviews (96% retention) vs those without (88%). Product usage frequency correlates directly with retention.",
    implications:
      "Higher retention improves LTV by 25% and reduces pressure on new customer acquisition. Strong retention signals product-market fit.",
    nextSteps:
      "1. Scale quarterly business review program\n2. Implement usage-based health scoring\n3. Develop at-risk customer playbook\n4. Create customer success training program",
    source: "Customer Success Platform",
    dataSources: [
      {
        name: "Gainsight",
        url: "/integrations/gainsight",
        description: "Customer health and retention tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "customer-4",
    category: "customer",
    header: "Support Tickets",
    metric: "Monthly Support Volume",
    value: "1,247",
    change: "+18%",
    trend: "down",
    timeframe: "vs last month",
    description: "Support ticket volume increased by 18% to 1,247 tickets",
    summary:
      "Support ticket volume spiked following the recent product release, with 62% of new tickets related to navigation changes and feature discovery issues.",
    benchmark: "Target: <1,000 tickets/month",
    analysis:
      "Ticket breakdown: Navigation issues (35%), feature questions (27%), bug reports (22%), account management (16%). Average resolution time: 6.4 hours.",
    implications:
      "Increased ticket volume strains support team capacity and may impact customer satisfaction if not addressed quickly.",
    nextSteps:
      "1. Deploy in-app tooltips for new navigation\n2. Create video tutorials for new features\n3. Hire 2 additional support agents\n4. Implement self-service knowledge base",
    source: "Support Ticketing System",
    dataSources: [
      {
        name: "Zendesk",
        url: "/integrations/zendesk",
        description: "Support ticket volume and categorization",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "customer-5",
    category: "customer",
    header: "Customer Lifetime Value",
    metric: "Average LTV",
    value: "$42,500",
    change: "+$8,200",
    trend: "up",
    timeframe: "vs last year",
    description: "Customer lifetime value increased to $42,500",
    summary:
      "LTV has grown by 24% year-over-year driven by longer customer tenure (avg 3.2 years vs 2.8) and increased expansion revenue through upsells and cross-sells.",
    benchmark: "Target LTV:CAC ratio > 3:1 (Current: 3.4:1)",
    analysis:
      "LTV growth from enterprise customers ($68K avg) significantly higher than SMB ($24K avg). Expansion revenue now represents 38% of total revenue vs 29% last year.",
    implications:
      "Increasing LTV improves unit economics and enables higher CAC spending for growth. Strong LTV signals healthy business model.",
    nextSteps:
      "1. Focus sales on enterprise segment\n2. Develop systematic upsell playbook\n3. Launch premium feature tiers\n4. Implement customer success automation",
    source: "Financial Analytics",
    isRAG: true,
    team: "sales",
  },
  {
    id: "customer-6",
    category: "customer",
    header: "Health Score",
    metric: "Average Customer Health",
    value: "78/100",
    change: "+4 pts",
    trend: "up",
    timeframe: "this month",
    description: "Average customer health score improved to 78 out of 100",
    summary:
      "Customer health scores have improved by 4 points this month, with 68% of accounts now in 'healthy' or 'thriving' status vs 61% last month.",
    benchmark: "Target: 75+ average health score",
    analysis:
      "Health improvements driven by increased product usage (35%), fewer support tickets (28%), and successful onboarding completion (22%). At-risk accounts down to 12%.",
    implications:
      "Higher health scores indicate lower churn risk and greater expansion opportunity. Healthy accounts have 4x higher upsell conversion rates.",
    nextSteps:
      "1. Prioritize at-risk account outreach\n2. Develop health score improvement playbooks\n3. Automate health score monitoring\n4. Train CS team on intervention strategies",
    source: "Customer Success Platform",
    dataSources: [
      {
        name: "Gainsight",
        url: "/integrations/gainsight",
        description: "Health score calculation and tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "customer-7",
    category: "customer",
    header: "Usage Frequency",
    metric: "Weekly Active Users",
    value: "8,425",
    change: "+12%",
    trend: "up",
    timeframe: "vs last month",
    description: "Weekly active users increased by 12% to 8,425",
    summary:
      "User engagement continues to grow with WAU reaching 8,425, representing 74% of total user base. Mobile usage up 22% month-over-month.",
    benchmark: "Target WAU/MAU ratio: 70%+ (Current: 74%)",
    analysis:
      "Engagement growth driven by new collaboration features (used by 58% of WAU) and mobile app improvements. Average session duration: 18 minutes.",
    implications:
      "High usage frequency correlates with retention and indicates strong product stickiness. Mobile-first users show 15% higher retention rates.",
    nextSteps:
      "1. Continue mobile optimization efforts\n2. Develop engagement campaigns for inactive users\n3. Add more collaboration features\n4. Implement usage-based pricing tier",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Amplitude",
        url: "/integrations/amplitude",
        description: "User engagement and activity tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "market-5",
    category: "market",
    header: "Pipeline Coverage",
    metric: "Pipeline to Quota Ratio",
    value: "3.2x",
    change: "+0.4x",
    trend: "up",
    timeframe: "this quarter",
    description: "Pipeline coverage ratio improved to 3.2x quota",
    summary:
      "Sales pipeline now covers 3.2x quarterly quota, up from 2.8x last quarter. Healthy pipeline coverage reduces revenue risk and improves forecast accuracy.",
    benchmark: "Best practice: 3-4x pipeline coverage",
    analysis:
      "Pipeline growth from increased marketing leads (45%), improved SDR productivity (32%), and partner channel activation (23%). Enterprise pipeline at 2.8x, SMB at 3.6x.",
    implications:
      "Strong pipeline coverage indicates high probability of meeting revenue targets. Provides buffer for deal slippage and competitive losses.",
    nextSteps:
      "1. Maintain marketing lead gen momentum\n2. Focus on enterprise pipeline building\n3. Optimize pipeline conversion rates\n4. Develop partner channel further",
    source: "Sales Operations",
    dataSources: [
      {
        name: "Salesforce",
        url: "/integrations/salesforce",
        description: "Pipeline and quota tracking",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "market-6",
    category: "market",
    header: "Market Growth Rate",
    metric: "Segment Growth",
    value: "18%",
    change: "+3%",
    trend: "up",
    timeframe: "year over year",
    description: "Our target market segment growing at 18% annually",
    summary:
      "The mid-market B2B SaaS segment is experiencing 18% year-over-year growth, driven by digital transformation and increased cloud adoption.",
    benchmark: "Overall SaaS market growth: 15%",
    analysis:
      "Growth concentrated in companies $10M-$50M ARR (22% growth) vs larger enterprises (14% growth). AI-powered solutions growing 28% annually.",
    implications:
      "Strong market tailwinds create favorable conditions for growth. Our 42% growth rate significantly outpaces market, indicating market share gains.",
    nextSteps:
      "1. Align product roadmap with market trends\n2. Increase marketing investment to capture growth\n3. Develop AI capabilities\n4. Target high-growth sub-segments",
    source: "Market Research Reports",
    isRAG: false,
    team: "marketing",
  },
  {
    id: "market-7",
    category: "market",
    header: "Competitive Position",
    metric: "Win Rate vs Top Competitor",
    value: "58%",
    change: "+6%",
    trend: "up",
    timeframe: "this quarter",
    description: "Head-to-head win rate vs top competitor improved to 58%",
    summary:
      "Competitive win rate against Competitor A has increased from 52% to 58% this quarter, driven by improved product differentiation and competitive positioning.",
    benchmark: "Target: >55% win rate in head-to-head deals",
    analysis:
      "Winning on implementation speed (avg 4 weeks vs 8), pricing flexibility, and customer support quality. Losing on enterprise features and brand recognition.",
    implications:
      "Improving competitive position strengthens market positioning and enables premium pricing. Win rate improvements directly impact revenue growth.",
    nextSteps:
      "1. Develop enterprise feature roadmap\n2. Invest in brand awareness campaigns\n3. Create competitive battle cards\n4. Train sales team on differentiation",
    source: "Win/Loss Analysis",
    isRAG: true,
    team: "sales",
  },
  {
    id: "product-5",
    category: "product",
    header: "User Engagement",
    metric: "Daily Active Users",
    value: "3,247",
    change: "+8%",
    trend: "up",
    timeframe: "vs last week",
    description: "Daily active users increased 8% to 3,247",
    summary:
      "DAU continues growing with strong engagement across core features. Power users (daily active) represent 28% of total user base, up from 24% last month.",
    benchmark: "Target DAU/MAU ratio: 25%+ (Current: 28%)",
    analysis:
      "Engagement driven by core workflow features (used by 92% of DAU) and real-time collaboration (used by 64%). Average 2.4 sessions per day.",
    implications:
      "High DAU ratio indicates product stickiness and habit formation. Daily users have 8x lower churn risk than weekly users.",
    nextSteps:
      "1. Develop features encouraging daily usage\n2. Implement push notifications for engagement\n3. Create daily digest emails\n4. Optimize mobile experience",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Mixpanel",
        url: "/integrations/mixpanel",
        description: "Daily engagement and session tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "product-6",
    category: "product",
    header: "Activation Rate",
    metric: "New User Activation",
    value: "62%",
    change: "+9%",
    trend: "up",
    timeframe: "this month",
    description: "New user activation rate improved to 62%",
    summary:
      "Activation rate (users completing key onboarding actions) has increased by 9% following new onboarding flow launch. Time to first value reduced from 3.2 days to 1.8 days.",
    benchmark: "Best-in-class SaaS activation: 60-70%",
    analysis:
      "Activation improvements from progressive onboarding (38% impact), in-app guidance (32%), and reduced friction in setup (30%). Mobile activation rate: 68%.",
    implications:
      "Higher activation drives long-term retention. Activated users have 5x higher 90-day retention than non-activated users.",
    nextSteps:
      "1. Personalize onboarding by user role\n2. A/B test activation flow variations\n3. Implement activation email campaigns\n4. Add onboarding analytics dashboard",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Amplitude",
        url: "/integrations/amplitude",
        description: "Activation funnel and milestone tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "product-7",
    category: "product",
    header: "Onboarding Completion",
    metric: "Onboarding Completion Rate",
    value: "78%",
    change: "+14%",
    trend: "up",
    timeframe: "vs last month",
    description: "Onboarding completion rate jumped to 78%",
    summary:
      "New interactive onboarding flow has dramatically improved completion rates from 64% to 78%. Users completing onboarding have 3x higher retention rates.",
    benchmark: "Target onboarding completion: 75%+",
    analysis:
      "Completion improvements from step reduction (5 steps vs 8), progress indicators, and contextual help. Average completion time: 8 minutes vs 14 previously.",
    implications:
      "High onboarding completion is strongest predictor of long-term success. Each 1% improvement in completion adds $42K annual recurring revenue.",
    nextSteps:
      "1. Continue optimizing onboarding flow\n2. Add role-specific onboarding paths\n3. Implement onboarding milestone celebrations\n4. Create video walkthrough options",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Mixpanel",
        url: "/integrations/mixpanel",
        description: "Onboarding funnel completion tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "product-8",
    category: "product",
    header: "Time to Value",
    metric: "Days to First Value",
    value: "1.8 days",
    change: "-1.4 days",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Time to first value reduced to 1.8 days",
    summary:
      "Users are reaching their first 'aha moment' 44% faster than last quarter, driven by streamlined onboarding and improved product education.",
    benchmark: "Target time to value: <2 days",
    analysis:
      "Improvement from pre-populated templates (35% impact), interactive tutorials (32%), and automated setup (33%). Enterprise users: 2.4 days, SMB users: 1.3 days.",
    implications:
      "Faster time to value increases activation rates and reduces early churn. Users reaching value in <2 days have 70% higher retention.",
    nextSteps:
      "1. Develop more industry-specific templates\n2. Implement AI-powered setup recommendations\n3. Create quick-start guides\n4. Reduce enterprise setup complexity",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Amplitude",
        url: "/integrations/amplitude",
        description: "Time to milestone tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "product-9",
    category: "product",
    header: "Product Usage",
    metric: "Feature Usage Rate",
    value: "64%",
    change: "+7%",
    trend: "up",
    timeframe: "this month",
    description: "Average feature usage rate increased to 64%",
    summary:
      "Users are engaging with more features, with average feature usage rate (features used / features available) increasing from 57% to 64%.",
    benchmark: "Target feature usage: 60%+",
    analysis:
      "Usage growth driven by feature discovery improvements (in-app tips), feature bundling, and improved UX. Power users using 82% of available features.",
    implications:
      "Higher feature usage indicates product stickiness and justifies pricing. Users engaging with 5+ features have 4x higher retention.",
    nextSteps:
      "1. Develop feature adoption campaigns\n2. Create feature bundling strategies\n3. Improve feature discoverability\n4. Sunset low-usage features",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Amplitude",
        url: "/integrations/amplitude",
        description: "Feature usage and adoption tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "product-10",
    category: "product",
    header: "Task Completion",
    metric: "Successful Task Rate",
    value: "87%",
    change: "+5%",
    trend: "up",
    timeframe: "this month",
    description: "Task completion rate improved to 87%",
    summary:
      "Users successfully completing their primary workflows has increased from 82% to 87%, indicating improved product usability and reduced friction.",
    benchmark: "Target task completion: 85%+",
    analysis:
      "Completion improvements from simplified workflows (42% impact), better error handling (31%), and contextual guidance (27%). Mobile completion rate: 84%.",
    implications:
      "High task completion indicates product-market fit and user satisfaction. Users with >90% completion rate have 65% lower churn.",
    nextSteps:
      "1. Analyze incomplete task patterns\n2. Simplify complex workflows further\n3. Improve error messages and recovery\n4. Add workflow templates",
    source: "Product Analytics",
    dataSources: [
      {
        name: "Mixpanel",
        url: "/integrations/mixpanel",
        description: "Task and workflow completion tracking",
      },
    ],
    isRAG: true,
    team: "product",
  },
  {
    id: "sales-7",
    category: "sales",
    header: "Sales Cycle Length",
    metric: "Average Days to Close",
    value: "42 days",
    change: "-5 days",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Sales cycle shortened to 42 days from 47 days",
    summary:
      "Sales cycle improvements driven by better lead qualification, streamlined demo process, and improved sales enablement materials.",
    benchmark: "Industry average: 45-60 days",
    analysis:
      "Cycle reduction from improved qualification (saved 3 days), automated proposal generation (saved 2 days), and faster contract processing. Enterprise: 68 days, SMB: 28 days.",
    implications:
      "Shorter sales cycles improve revenue predictability and sales team productivity. Each 1-day reduction saves $8K in sales costs per deal.",
    nextSteps:
      "1. Implement automated contract generation\n2. Develop fast-track sales process for SMB\n3. Create decision-maker mapping tools\n4. Streamline legal review process",
    source: "CRM Analytics",
    dataSources: [
      {
        name: "Salesforce",
        url: "/integrations/salesforce",
        description: "Deal stage duration tracking",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-8",
    category: "sales",
    header: "Lead Conversion Rate",
    metric: "MQL to SQL Conversion",
    value: "28%",
    change: "+4%",
    trend: "up",
    timeframe: "this quarter",
    description: "Lead conversion rate improved to 28%",
    summary:
      "Marketing qualified lead to sales qualified lead conversion has increased from 24% to 28% through improved lead scoring and SDR enablement.",
    benchmark: "Best-in-class conversion: 25-30%",
    analysis:
      "Conversion improvements from refined lead scoring model (improved relevance by 32%), better SDR training (improved pitch success), and faster follow-up.",
    implications:
      "Higher conversion rates improve marketing ROI and reduce CAC. Each 1% conversion improvement generates $125K additional pipeline annually.",
    nextSteps:
      "1. Refine lead scoring model further\n2. Implement AI-powered lead prioritization\n3. Develop SDR coaching program\n4. Automate lead routing",
    source: "Marketing Operations",
    dataSources: [
      {
        name: "HubSpot",
        url: "/integrations/hubspot",
        description: "Lead conversion funnel tracking",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "sales-9",
    category: "sales",
    header: "Average Contract Value",
    metric: "Average ACV",
    value: "$32,400",
    change: "+$4,100",
    trend: "up",
    timeframe: "this quarter",
    description: "Average contract value increased to $32,400",
    summary:
      "ACV growth driven by successful upselling, multi-year contracts, and enterprise segment focus. Premium tier adoption up 45%.",
    benchmark: "Target ACV: $35,000",
    analysis:
      "ACV improvements from larger seat counts (avg 48 vs 38), premium tier mix (42% vs 32%), and annual vs monthly billing (72% annual).",
    implications:
      "Higher ACV improves unit economics and LTV. Each $1K ACV increase adds $2.4M annual recurring revenue at current growth rate.",
    nextSteps:
      "1. Train sales team on upselling techniques\n2. Create multi-year contract incentives\n3. Develop enterprise packaging\n4. Implement value-based pricing",
    source: "Sales Analytics",
    dataSources: [
      {
        name: "Salesforce",
        url: "/integrations/salesforce",
        description: "Contract value and deal size tracking",
      },
    ],
    isRAG: true,
    team: "sales",
  },
  {
    id: "marketing-1",
    category: "marketing",
    header: "Lead Generation Rate",
    metric: "Monthly Lead Volume",
    value: "842",
    change: "+18%",
    trend: "up",
    timeframe: "vs last month",
    description: "Lead generation up 18% to 842 monthly leads",
    summary:
      "Strong lead generation growth driven by content marketing (35%), paid campaigns (32%), and partner referrals (22%). Lead quality scores also improving.",
    benchmark: "Target: 1,000 leads/month",
    analysis:
      "Lead sources: Organic search (28%), paid ads (25%), content downloads (22%), webinars (15%), partner referrals (10%). MQL rate: 34%.",
    implications:
      "Increased lead volume provides sales team with more pipeline opportunity. Maintaining lead quality while scaling is critical.",
    nextSteps:
      "1. Scale top-performing channels\n2. Optimize lead qualification criteria\n3. Develop lead nurturing campaigns\n4. Expand partner program",
    source: "Marketing Automation",
    dataSources: [
      {
        name: "HubSpot",
        url: "/integrations/hubspot",
        description: "Lead generation and source tracking",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "marketing-2",
    category: "marketing",
    header: "Marketing Qualified Leads",
    metric: "MQL Volume",
    value: "287",
    change: "+22%",
    trend: "up",
    timeframe: "this month",
    description: "Marketing qualified leads increased 22% to 287",
    summary:
      "MQL volume growth outpacing overall lead generation, indicating improving lead quality and scoring accuracy. Conversion to SQL at 28%.",
    benchmark: "Target MQL conversion to SQL: 30%",
    analysis:
      "MQL growth from refined scoring model (better fit identification), improved content targeting, and intent signal integration. Enterprise MQLs up 35%.",
    implications:
      "Higher MQL volume and quality reduces sales team wasted effort and improves pipeline conversion. Each MQL generates avg $9K pipeline value.",
    nextSteps:
      "1. Continue refining lead scoring\n2. Develop account-based marketing campaigns\n3. Implement intent data tools\n4. Create MQL nurturing sequences",
    source: "Marketing Automation",
    dataSources: [
      {
        name: "HubSpot",
        url: "/integrations/hubspot",
        description: "MQL identification and tracking",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "marketing-3",
    category: "marketing",
    header: "Campaign ROI",
    metric: "Marketing Campaign Return",
    value: "4.2x",
    change: "+0.8x",
    trend: "up",
    timeframe: "this quarter",
    description: "Campaign ROI improved to 4.2x return on spend",
    summary:
      "Marketing campaigns generating $4.20 in pipeline for every dollar spent, up from 3.4x last quarter. Content marketing showing highest ROI at 6.8x.",
    benchmark: "Target marketing ROI: 4x+",
    analysis:
      "ROI by channel: Content (6.8x), SEO (5.2x), Paid search (3.8x), Paid social (2.9x), Events (2.4x). Enterprise campaigns outperforming SMB.",
    implications:
      "Strong ROI justifies increased marketing investment. Reallocating budget to high-ROI channels can accelerate growth.",
    nextSteps:
      "1. Increase investment in content and SEO\n2. Optimize paid campaign targeting\n3. Develop attribution model\n4. Test new high-ROI channels",
    source: "Marketing Analytics",
    dataSources: [
      {
        name: "HubSpot",
        url: "/integrations/hubspot",
        description: "Campaign performance and attribution",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "marketing-4",
    category: "marketing",
    header: "Brand Awareness",
    metric: "Brand Search Volume",
    value: "3,420",
    change: "+28%",
    trend: "up",
    timeframe: "this month",
    description: "Branded search volume increased 28% to 3,420 searches",
    summary:
      "Brand awareness growing significantly driven by content marketing, thought leadership, and customer success stories. Share of voice up 15%.",
    benchmark: "Target: 5,000 monthly brand searches",
    analysis:
      "Search growth from PR coverage (32% impact), content distribution (28%), customer advocacy (24%), and paid brand campaigns (16%).",
    implications:
      "Increasing brand awareness reduces CAC over time and improves inbound lead quality. Brand searches convert 3x higher than generic searches.",
    nextSteps:
      "1. Amplify thought leadership content\n2. Launch customer advocacy program\n3. Increase PR and media outreach\n4. Invest in brand awareness campaigns",
    source: "SEO Analytics",
    dataSources: [
      {
        name: "Google Search Console",
        url: "/integrations/google-search",
        description: "Brand search volume tracking",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "marketing-5",
    category: "marketing",
    header: "ROAS",
    metric: "Return on Ad Spend",
    value: "3.8x",
    change: "+0.6x",
    trend: "up",
    timeframe: "this month",
    description: "Return on ad spend improved to 3.8x",
    summary:
      "Paid advertising generating $3.80 in revenue for every dollar spent, up from 3.2x last month. Search ads performing best at 4.6x ROAS.",
    benchmark: "Target ROAS: 3.5x+",
    analysis:
      "ROAS by platform: Google Ads (4.6x), LinkedIn Ads (3.2x), Facebook Ads (2.8x). Retargeting campaigns showing 5.2x ROAS.",
    implications:
      "Strong ROAS enables increased ad spend for growth. Optimizing underperforming channels can further improve efficiency.",
    nextSteps:
      "1. Scale high-ROAS campaigns\n2. Optimize creative for low-ROAS platforms\n3. Expand retargeting programs\n4. Test new ad formats",
    source: "Ad Platform Analytics",
    dataSources: [
      {
        name: "Google Ads",
        description: "Ad spend and revenue attribution",
      },
      {
        name: "LinkedIn Ads",
        description: "Campaign performance metrics",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "marketing-6",
    category: "marketing",
    header: "Traffic",
    metric: "Website Monthly Visitors",
    value: "42,350",
    change: "+15%",
    trend: "up",
    timeframe: "vs last month",
    description: "Website traffic increased 15% to 42,350 visitors",
    summary:
      "Traffic growth driven by organic search (38% of traffic), direct (25%), and paid campaigns (22%). Mobile traffic up 22%, now 58% of total.",
    benchmark: "Target: 50,000 monthly visitors",
    analysis:
      "Traffic sources: Organic (38%), Direct (25%), Paid (22%), Referral (10%), Social (5%). Bounce rate: 42%, avg session: 3.2 minutes.",
    implications:
      "Increasing traffic provides more opportunities for lead generation. Traffic quality (measured by engagement) more important than volume.",
    nextSteps:
      "1. Optimize high-traffic pages for conversion\n2. Improve mobile user experience\n3. Develop content for organic growth\n4. Reduce bounce rate through UX improvements",
    source: "Web Analytics",
    dataSources: [
      {
        name: "Google Analytics",
        url: "/integrations/google-analytics",
        description: "Website traffic and engagement tracking",
      },
    ],
    isRAG: true,
    team: "marketing",
  },
  {
    id: "engineering-1",
    category: "engineering",
    header: "Deploy Frequency",
    metric: "Weekly Deployments",
    value: "12",
    change: "+4",
    trend: "up",
    timeframe: "vs last month",
    description: "Deployment frequency increased to 12 per week",
    summary:
      "Engineering team shipping faster with 12 deployments per week, up from 8 last month. Continuous deployment practices improving development velocity.",
    benchmark: "Elite teams: >1 deployment per day",
    analysis:
      "Frequency improvements from automated testing (35% impact), improved CI/CD pipeline (32%), and smaller batch sizes (33%). Zero failed deployments this month.",
    implications:
      "Higher deployment frequency enables faster feature delivery and bug fixes. Correlates with improved team productivity and customer satisfaction.",
    nextSteps:
      "1. Further automate deployment pipeline\n2. Implement feature flags for safer releases\n3. Reduce deployment batch size\n4. Expand automated test coverage",
    source: "CI/CD System",
    dataSources: [
      {
        name: "GitHub Actions",
        url: "/integrations/github",
        description: "Deployment frequency and success tracking",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "engineering-2",
    category: "engineering",
    header: "Change Failure Rate",
    metric: "Failed Deployment Rate",
    value: "2.4%",
    change: "-1.8%",
    trend: "up",
    timeframe: "this month",
    description: "Change failure rate reduced to 2.4%",
    summary:
      "Deployment quality improving with only 2.4% of changes requiring rollback or hotfix, down from 4.2% last month. Testing improvements paying off.",
    benchmark: "Elite teams: <5% change failure rate",
    analysis:
      "Failure reduction from expanded test coverage (78% vs 62%), better code review process, and improved staging environment. No critical failures.",
    implications:
      "Lower failure rate reduces engineering overhead and improves system stability. Enables more confident and frequent deployments.",
    nextSteps:
      "1. Achieve 85% test coverage target\n2. Implement chaos engineering practices\n3. Enhance code review guidelines\n4. Add pre-production testing stage",
    source: "Deployment Monitoring",
    dataSources: [
      {
        name: "Datadog",
        url: "/integrations/datadog",
        description: "Deployment success and failure tracking",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "engineering-3",
    category: "engineering",
    header: "Mean Time to Recovery",
    metric: "MTTR",
    value: "18 min",
    change: "-12 min",
    trend: "up",
    timeframe: "vs last quarter",
    description: "Mean time to recovery reduced to 18 minutes",
    summary:
      "System recovery time dramatically improved from 30 minutes to 18 minutes through better monitoring, automated rollback, and improved incident response.",
    benchmark: "Elite teams: <1 hour MTTR",
    analysis:
      "MTTR improvement from automated alerts (35% faster), improved runbooks (28%), automated rollback (22%), and on-call training (15%).",
    implications:
      "Faster recovery minimizes customer impact and reduces revenue loss from incidents. Strong MTTR indicates mature incident management.",
    nextSteps:
      "1. Implement automated incident response\n2. Develop more detailed runbooks\n3. Add chaos engineering drills\n4. Improve monitoring coverage",
    source: "Incident Management",
    dataSources: [
      {
        name: "PagerDuty",
        url: "/integrations/pagerduty",
        description: "Incident response and recovery tracking",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "engineering-4",
    category: "engineering",
    header: "Code Quality Score",
    metric: "Code Quality Rating",
    value: "8.2/10",
    change: "+0.4",
    trend: "up",
    timeframe: "this month",
    description: "Code quality rating improved to 8.2 out of 10",
    summary:
      "Code quality metrics improving through stricter code review standards, automated linting, and refactoring initiatives. Technical debt down 15%.",
    benchmark: "Target code quality: 8.0+",
    analysis:
      "Quality improvements from automated code analysis tools, peer review culture, and dedicated refactoring time (10% of sprint). Code coverage: 78%.",
    implications:
      "Higher code quality reduces bugs, improves maintainability, and accelerates feature development. Reduces technical debt accumulation.",
    nextSteps:
      "1. Maintain 10% refactoring time allocation\n2. Expand automated code analysis\n3. Conduct quarterly architecture reviews\n4. Document coding standards",
    source: "Code Analysis Tools",
    dataSources: [
      {
        name: "SonarQube",
        description: "Code quality metrics and analysis",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "engineering-5",
    category: "engineering",
    header: "Incident Rate",
    metric: "Monthly Incidents",
    value: "3",
    change: "-5",
    trend: "up",
    timeframe: "vs last month",
    description: "Incidents reduced to 3 per month from 8",
    summary:
      "Significant reduction in production incidents through improved testing, monitoring, and proactive issue detection. Zero critical incidents this month.",
    benchmark: "Target: <5 incidents/month",
    analysis:
      "Incident reduction from better test coverage (42% impact), improved monitoring (31%), and proactive performance optimization (27%).",
    implications:
      "Fewer incidents improves system reliability, reduces engineering overhead, and increases customer satisfaction. Indicates maturing engineering practices.",
    nextSteps:
      "1. Continue expanding monitoring coverage\n2. Implement predictive alerting\n3. Conduct blameless postmortems\n4. Build incident prevention playbooks",
    source: "Incident Tracking",
    dataSources: [
      {
        name: "PagerDuty",
        url: "/integrations/pagerduty",
        description: "Incident frequency and severity tracking",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "engineering-6",
    category: "engineering",
    header: "Velocity",
    metric: "Sprint Velocity",
    value: "42 pts",
    change: "+6 pts",
    trend: "up",
    timeframe: "vs last sprint",
    description: "Team velocity increased to 42 story points",
    summary:
      "Engineering velocity improving with team completing 42 story points per sprint, up from 36. Indicates improved estimation accuracy and team efficiency.",
    benchmark: "Target: Stable velocity ±10%",
    analysis:
      "Velocity improvements from reduced context switching (28% impact), better sprint planning (25%), improved tooling (24%), and team growth (23%).",
    implications:
      "Higher, stable velocity enables more predictable delivery and roadmap planning. Velocity gains allow more features per quarter.",
    nextSteps:
      "1. Maintain focus on sprint commitment\n2. Continue reducing technical debt\n3. Improve estimation accuracy\n4. Minimize mid-sprint scope changes",
    source: "Project Management",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Sprint velocity and story point tracking",
      },
    ],
    isRAG: true,
    team: "engineering",
  },
  {
    id: "delivery-1",
    category: "delivery",
    header: "On-Time Delivery Rate",
    metric: "Delivery Schedule Adherence",
    value: "82%",
    change: "+8%",
    trend: "up",
    timeframe: "this quarter",
    description: "On-time delivery improved to 82%",
    summary:
      "Project delivery predictability improving with 82% of commitments delivered on schedule, up from 74% last quarter. Better estimation and scope management.",
    benchmark: "Target on-time delivery: 85%+",
    analysis:
      "Improvements from better sprint planning (32% impact), reduced scope creep (28%), improved estimation accuracy (24%), and buffer time allocation (16%).",
    implications:
      "Higher on-time delivery builds stakeholder trust and improves roadmap predictability. Reduces emergency work and team stress.",
    nextSteps:
      "1. Implement rolling wave planning\n2. Improve scope change management\n3. Build contingency buffers\n4. Enhance estimation techniques",
    source: "Project Tracking",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Delivery timeline and milestone tracking",
      },
    ],
    isRAG: true,
    team: "delivery",
  },
  {
    id: "delivery-2",
    category: "delivery",
    header: "Customer Satisfaction",
    metric: "Internal Stakeholder CSAT",
    value: "8.4/10",
    change: "+0.6",
    trend: "up",
    timeframe: "this month",
    description: "Stakeholder satisfaction with delivery improved to 8.4",
    summary:
      "Internal stakeholder satisfaction with delivery team performance has increased, reflecting improved communication, delivery predictability, and quality.",
    benchmark: "Target stakeholder CSAT: 8.5+",
    analysis:
      "Satisfaction improvements from better status communication (35% impact), fewer last-minute surprises (32%), and higher quality deliverables (33%).",
    implications:
      "High stakeholder satisfaction indicates effective delivery processes and builds organizational trust. Enables more ambitious roadmap commitments.",
    nextSteps:
      "1. Maintain weekly stakeholder updates\n2. Implement early risk flagging\n3. Improve delivery quality checks\n4. Create feedback loops",
    source: "Internal Surveys",
    isRAG: true,
    team: "delivery",
  },
  {
    id: "delivery-3",
    category: "delivery",
    header: "Sprint Velocity",
    metric: "Team Story Points",
    value: "38 pts",
    change: "+5 pts",
    trend: "up",
    timeframe: "vs last sprint",
    description: "Sprint velocity increased to 38 story points",
    summary:
      "Delivery team velocity growing with consistent 38 story point completion per sprint. Reflects improved process efficiency and team maturity.",
    benchmark: "Target: Stable velocity within 15% variance",
    analysis:
      "Velocity growth from improved story sizing (28% impact), reduced dependencies (25%), better resource allocation (24%), and team collaboration (23%).",
    implications:
      "Consistent velocity enables accurate delivery forecasting and capacity planning. Supports reliable roadmap commitments.",
    nextSteps:
      "1. Maintain story sizing discipline\n2. Continue dependency management\n3. Monitor velocity trends\n4. Adjust team capacity planning",
    source: "Sprint Metrics",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Sprint velocity and capacity tracking",
      },
    ],
    isRAG: true,
    team: "delivery",
  },
  {
    id: "delivery-4",
    category: "delivery",
    header: "Cycle Time",
    metric: "Average Cycle Time",
    value: "4.2 days",
    change: "-1.3 days",
    trend: "up",
    timeframe: "this month",
    description: "Cycle time reduced to 4.2 days",
    summary:
      "Work item cycle time (from start to done) has decreased by 24% from 5.5 to 4.2 days, indicating improved flow efficiency and reduced bottlenecks.",
    benchmark: "Target cycle time: <5 days",
    analysis:
      "Cycle time reduction from WIP limits (35% impact), reduced handoffs (28%), improved automation (22%), and faster code reviews (15%).",
    implications:
      "Shorter cycle times enable faster value delivery and improved responsiveness to changing priorities. Indicates efficient delivery processes.",
    nextSteps:
      "1. Maintain WIP limits\n2. Automate manual tasks further\n3. Streamline approval processes\n4. Reduce context switching",
    source: "Workflow Analytics",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Work item cycle time tracking",
      },
    ],
    isRAG: true,
    team: "delivery",
  },
  {
    id: "delivery-5",
    category: "delivery",
    header: "WIP",
    metric: "Work In Progress",
    value: "12",
    change: "-5",
    trend: "up",
    timeframe: "vs last sprint",
    description: "Work in progress reduced to 12 items",
    summary:
      "Team has successfully reduced work in progress from 17 to 12 items, improving focus and throughput. WIP limits helping manage capacity.",
    benchmark: "Target WIP: 10-15 items for team size",
    analysis:
      "WIP reduction from enforced limits (42% impact), better sprint planning (31%), and completing work before starting new items (27%).",
    implications:
      "Lower WIP improves cycle time, quality, and team focus. Reduces context switching overhead and improves delivery predictability.",
    nextSteps:
      "1. Enforce WIP limits strictly\n2. Complete started work first\n3. Minimize mid-sprint additions\n4. Balance team workload",
    source: "Kanban Metrics",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Work in progress tracking",
      },
    ],
    isRAG: true,
    team: "delivery",
  },
  {
    id: "delivery-6",
    category: "delivery",
    header: "Burndown",
    metric: "Sprint Burndown Rate",
    value: "On Track",
    change: "Healthy",
    trend: "up",
    timeframe: "current sprint",
    description: "Sprint burndown tracking ahead of schedule",
    summary:
      "Current sprint showing healthy burndown pattern with work completion tracking 8% ahead of ideal burndown line. Team on track to complete sprint commitment.",
    benchmark: "Target: Complete 90%+ of sprint commitment",
    analysis:
      "Healthy burndown from good sprint planning, accurate estimates, and consistent team velocity. No scope additions mid-sprint.",
    implications:
      "Predictable burndown enables accurate delivery forecasting and builds stakeholder confidence. Reflects mature agile practices.",
    nextSteps:
      "1. Continue current sprint practices\n2. Monitor for burndown anomalies\n3. Address blockers immediately\n4. Maintain scope discipline",
    source: "Sprint Tracking",
    dataSources: [
      {
        name: "Jira",
        url: "/integrations/jira",
        description: "Sprint burndown chart data",
      },
    ],
    isRAG: true,
    team: "delivery",
  },
  {
    id: "benchmark-b2b-growth-1",
    category: "sales",
    header: "Win Rate Benchmark",
    metric: "Sales Win Rate",
    value: "32%",
    change: "N/A",
    trend: "up",
    timeframe: "industry average",
    description: "B2B SaaS companies in growth stage achieve 32% win rates on average",
    summary:
      "Companies at growth stage with PMF achieved typically see win rates between 28-35%. Top quartile performers achieve 40%+ through strong product-market fit and sales process optimization.",
    benchmark: "Industry benchmark for B2B SaaS Growth Stage",
    analysis:
      "Win rate benchmarks vary by deal size: SMB (40-50%), Mid-market (30-40%), Enterprise (20-30%). Growth stage companies typically focus on mid-market for optimal conversion.",
    implications:
      "Understanding benchmark win rates helps set realistic targets and identify performance gaps. Significant deviation indicates need for sales process or product improvements.",
    nextSteps:
      "1. Compare your win rate to segment benchmark\n2. Analyze win/loss patterns\n3. Identify competitive differentiators\n4. Optimize for your sweet spot segment",
    source: "Industry Benchmark Data",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-b2b-early-1",
    category: "customer",
    header: "Churn Benchmark",
    metric: "Monthly Churn Rate",
    value: "5-8%",
    change: "N/A",
    trend: "up",
    timeframe: "industry range",
    description: "Early traction B2B SaaS typically experiences 5-8% monthly churn",
    summary:
      "Companies seeking PMF in early traction phase see higher churn as they iterate on product and target market. This is normal and expected during the discovery phase.",
    benchmark: "Benchmark for B2B SaaS Early Traction",
    analysis:
      "Early stage churn drivers: product-market fit iteration (40%), pricing experimentation (30%), feature gaps (20%), onboarding issues (10%). Expect improvement as PMF is achieved.",
    implications:
      "Higher churn in early stage is acceptable if you're learning and iterating. Focus on cohort retention improvements over absolute churn reduction.",
    nextSteps:
      "1. Track churn by customer segment\n2. Interview churned customers\n3. Focus on one ICP segment\n4. Measure retention improvements over time",
    source: "SaaS Industry Research",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Early Traction (PMF seeking)", "MVP / Beta"],
      businessStage: ["Pre-seed", "Seed"],
    },
  },
  {
    id: "benchmark-marketplace-growth-1",
    category: "market",
    header: "GMV Growth Benchmark",
    metric: "Quarterly GMV Growth",
    value: "25-40%",
    change: "N/A",
    trend: "up",
    timeframe: "quarterly",
    description: "Growth-stage marketplaces typically see 25-40% quarterly GMV growth",
    summary:
      "Marketplaces in growth stage with network effects kicking in experience accelerating GMV growth. Top performers exceed 50% quarterly growth through supply-demand balance.",
    benchmark: "Marketplace Growth Stage Benchmark",
    analysis:
      "GMV growth drivers: supply side expansion (35%), demand side growth (35%), take rate optimization (20%), geographic expansion (10%). Network effects accelerate growth.",
    implications:
      "Marketplace growth is non-linear. Once you achieve liquidity in core market, growth accelerates. Focus on maintaining balanced supply-demand ratio.",
    nextSteps:
      "1. Track supply-demand ratio\n2. Optimize matching algorithms\n3. Expand to adjacent categories\n4. Increase marketing to both sides",
    source: "Marketplace Benchmarking Data",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Marketplace"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-ecommerce-early-1",
    category: "marketing",
    header: "CAC Benchmark",
    metric: "Customer Acquisition Cost",
    value: "$45-75",
    change: "N/A",
    trend: "up",
    timeframe: "per customer",
    description: "Early-stage e-commerce CAC typically ranges $45-75",
    summary:
      "E-commerce companies in early traction phase see higher CAC as they test channels and optimize conversion. LTV should be 3x+ CAC for sustainable growth.",
    benchmark: "E-commerce Early Traction Benchmark",
    analysis:
      "CAC by channel: Paid social ($60-80), Paid search ($50-70), Influencer ($40-60), Organic/SEO ($15-25). Blended CAC decreases as organic channels scale.",
    implications:
      "Early CAC is higher as you test and learn. Focus on improving LTV:CAC ratio through retention and repeat purchases rather than only reducing CAC.",
    nextSteps:
      "1. Test multiple acquisition channels\n2. Optimize landing page conversion\n3. Implement referral program\n4. Build organic channel foundation",
    source: "E-commerce Industry Data",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["E-commerce"],
      productStage: ["Early Traction (PMF seeking)", "MVP / Beta"],
      businessStage: ["Pre-seed", "Seed", "Series A"],
    },
  },
  {
    id: "benchmark-fintech-growth-1",
    category: "product",
    header: "Transaction Volume Benchmark",
    metric: "Monthly Transaction Volume",
    value: "$2M-8M",
    change: "N/A",
    trend: "up",
    timeframe: "monthly",
    description: "Growth-stage fintech platforms process $2M-8M monthly transaction volume",
    summary:
      "Fintech companies in growth stage with Series A funding typically process $2-8M in monthly transaction volume. Top quartile processes $10M+ through market penetration.",
    benchmark: "Fintech Growth Stage Benchmark",
    analysis:
      "Transaction volume scales with user acquisition (40%), average transaction size (35%), and transaction frequency (25%). Regulatory compliance becomes critical at scale.",
    implications:
      "Transaction volume is key metric for fintech valuations. Sustainable growth requires balancing volume growth with fraud prevention and compliance.",
    nextSteps:
      "1. Optimize transaction success rates\n2. Implement fraud detection\n3. Scale compliance operations\n4. Add high-value transaction features",
    source: "Fintech Industry Analysis",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Fintech"],
      productStage: ["Growth Stage (PMF achieved)"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-devtools-early-1",
    category: "product",
    header: "API Usage Benchmark",
    metric: "Monthly API Calls",
    value: "5M-15M",
    change: "N/A",
    trend: "up",
    timeframe: "monthly",
    description: "Early traction developer tools see 5-15M monthly API calls",
    summary:
      "Developer tools in early traction phase with growing adoption typically serve 5-15M API calls monthly. Usage-based pricing aligns revenue with value delivered.",
    benchmark: "Developer Tools Early Traction",
    analysis:
      "API usage growth correlates with active integrations (45%), developer adoption (35%), and use case expansion (20%). Focus on making integration easy.",
    implications:
      "API call volume indicates product stickiness and value creation. High usage users are retention anchors and expansion revenue opportunities.",
    nextSteps:
      "1. Optimize API performance and reliability\n2. Create comprehensive documentation\n3. Build developer community\n4. Implement usage-based pricing",
    source: "Developer Tools Benchmarks",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Developer Tools"],
      productStage: ["Early Traction (PMF seeking)", "Growth Stage (PMF achieved)"],
      businessStage: ["Seed", "Series A"],
    },
  },
  {
    id: "benchmark-b2c-mvp-1",
    category: "product",
    header: "Retention Benchmark",
    metric: "Day 7 Retention",
    value: "25-35%",
    change: "N/A",
    trend: "up",
    timeframe: "7-day retention",
    description: "B2C SaaS at MVP stage typically achieves 25-35% Day 7 retention",
    summary:
      "Consumer products in MVP/Beta phase see 25-35% week-1 retention. Top performers exceed 40% through strong onboarding and early value demonstration.",
    benchmark: "B2C SaaS MVP Stage Benchmark",
    analysis:
      "Retention drivers: aha moment in first session (50% impact), onboarding completion (30%), social/network features (20%). Mobile apps typically see higher retention.",
    implications:
      "Day 7 retention is leading indicator of product-market fit for consumer products. Below 20% indicates fundamental product issues.",
    nextSteps:
      "1. Optimize time to first value\n2. Improve onboarding flow\n3. Add habit-forming features\n4. Implement push notifications",
    source: "Consumer SaaS Benchmarks",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2C SaaS"],
      productStage: ["MVP / Beta", "Early Traction (PMF seeking)"],
      businessStage: ["Pre-seed", "Seed"],
    },
  },
  {
    id: "benchmark-analytics-scale-1",
    category: "engineering",
    header: "Data Processing Benchmark",
    metric: "Daily Events Processed",
    value: "500M-2B",
    change: "N/A",
    trend: "up",
    timeframe: "daily",
    description: "Analytics platforms at scale process 500M-2B daily events",
    summary:
      "Analytics platforms in scale stage process massive data volumes while maintaining performance. Infrastructure costs become significant portion of COGS.",
    benchmark: "Analytics Platform Scale Stage",
    analysis:
      "Processing volume scales with customer base (50%), events per customer (30%), and data retention (20%). Requires sophisticated data infrastructure.",
    implications:
      "Data processing volume directly impacts infrastructure costs and pricing strategy. Optimization becomes critical for margin improvement.",
    nextSteps:
      "1. Implement data compression\n2. Optimize query performance\n3. Add data sampling options\n4. Develop tiered retention policies",
    source: "Analytics Platform Benchmarks",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Analytics Platform"],
      productStage: ["Scale Stage", "Mature / Market Leader"],
      businessStage: ["Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-productivity-growth-1",
    category: "sales",
    header: "Team Size Benchmark",
    metric: "Average Team Size",
    value: "8-15 users",
    change: "N/A",
    trend: "up",
    timeframe: "per account",
    description: "Productivity software at growth stage sees 8-15 users per team",
    summary:
      "Team productivity tools in growth stage achieve 8-15 seat deployments on average. Viral adoption within teams drives expansion revenue.",
    benchmark: "Productivity Software Growth Benchmark",
    analysis:
      "Team size growth from organic adoption (60%), admin-led rollout (25%), and integration dependencies (15%). Land-and-expand strategy critical.",
    implications:
      "Average team size indicates product virality and expansion potential. Focus on features that encourage team-wide adoption.",
    nextSteps:
      "1. Build collaboration features\n2. Optimize team onboarding\n3. Create admin dashboards\n4. Implement usage-based pricing",
    source: "Productivity Software Data",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Productivity Software"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-healthcare-growth-1",
    category: "customer",
    header: "Implementation Time Benchmark",
    metric: "Average Implementation",
    value: "45-90 days",
    change: "N/A",
    trend: "up",
    timeframe: "enterprise deals",
    description: "Healthcare tech implementations take 45-90 days on average",
    summary:
      "Healthcare technology requires longer implementation due to compliance, integration, and training requirements. Security and HIPAA compliance add complexity.",
    benchmark: "Healthcare Tech Growth Stage",
    analysis:
      "Implementation timeline: Technical setup (30%), Compliance/security (25%), Integration (25%), Training (20%). Larger providers take 90-180 days.",
    implications:
      "Long implementation cycles impact revenue recognition and cash flow. Requires dedicated customer success resources and professional services.",
    nextSteps:
      "1. Develop implementation playbooks\n2. Automate compliance processes\n3. Build standard integrations\n4. Create training programs",
    source: "Healthcare Tech Benchmarks",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["Healthcare Tech"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  // Customer Category Benchmarks
  {
    id: "benchmark-customer-csat",
    category: "customer",
    header: "CSAT Benchmark",
    metric: "CSAT",
    value: "85-92%",
    change: "N/A",
    trend: "up",
    timeframe: "industry average",
    description: "Top-performing B2B SaaS companies maintain 85-92% CSAT scores",
    summary:
      "Customer satisfaction scores above 85% indicate strong product-market fit and service quality. Enterprise customers typically expect 90%+ satisfaction levels.",
    benchmark: "Industry benchmark for B2B SaaS",
    analysis:
      "CSAT drivers: product reliability (40%), customer support quality (30%), feature completeness (20%), pricing perception (10%).",
    implications:
      "CSAT scores directly correlate with retention and expansion revenue. Below 80% indicates urgent need for improvement.",
    nextSteps:
      "1. Survey customers regularly\n2. Address top pain points\n3. Improve support response times\n4. Close feature gaps",
    source: "SaaS Customer Success Benchmarks",
    isRAG: false,
    team: "customer success",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-customer-nps",
    category: "customer",
    header: "NPS Benchmark",
    metric: "NPS",
    value: "30-50",
    change: "N/A",
    trend: "up",
    timeframe: "industry average",
    description: "B2B SaaS companies achieve 30-50 NPS on average, with top performers exceeding 60",
    summary:
      "Net Promoter Score measures customer loyalty and likelihood to recommend. Scores above 50 indicate exceptional product experience and strong word-of-mouth potential.",
    benchmark: "B2B SaaS Industry Benchmark",
    analysis:
      "NPS correlates with organic growth rate. Companies with 50+ NPS see 2x faster customer acquisition through referrals.",
    implications:
      "NPS is leading indicator of sustainable growth. Focus on converting passives to promoters through product improvements.",
    nextSteps:
      "1. Follow up with detractors\n2. Amplify promoter voices\n3. Build referral program\n4. Track NPS by segment",
    source: "B2B SaaS Research",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Seed", "Series A", "Series B"],
    },
  },
  {
    id: "benchmark-customer-retention",
    category: "customer",
    header: "Customer Retention Benchmark",
    metric: "Customer Retention",
    value: "90-95%",
    change: "N/A",
    trend: "up",
    timeframe: "annual",
    description: "Best-in-class B2B SaaS maintains 90-95% annual customer retention",
    summary:
      "Net revenue retention above 100% requires high customer retention (90%+) plus expansion. Enterprise segments typically show higher retention than SMB.",
    benchmark: "B2B SaaS Retention Benchmark",
    analysis:
      "Retention by segment: Enterprise (92-97%), Mid-market (85-92%), SMB (70-85%). Higher ACV correlates with better retention.",
    implications:
      "Customer retention is foundation for sustainable SaaS business. Focus on customer success for at-risk accounts.",
    nextSteps:
      "1. Identify churn risk signals\n2. Implement health scoring\n3. Proactive CS outreach\n4. Build customer community",
    source: "SaaS Benchmarking Study",
    isRAG: false,
    team: "customer success",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-customer-tickets",
    category: "customer",
    header: "Support Tickets Benchmark",
    metric: "Support Tickets",
    value: "8-12%",
    change: "N/A",
    trend: "up",
    timeframe: "monthly per customer",
    description: "B2B SaaS sees 8-12% of customers submit tickets monthly",
    summary:
      "Support ticket rate indicates product usability and complexity. Lower rates suggest intuitive product; higher rates may indicate bugs or missing documentation.",
    benchmark: "SaaS Support Benchmark",
    analysis:
      "Ticket drivers: product bugs (35%), feature questions (30%), integration issues (20%), billing questions (15%).",
    implications:
      "Track ticket trends to identify systemic product issues. Self-service resources reduce ticket volume by 30-40%.",
    nextSteps: "1. Build knowledge base\n2. Add in-app guidance\n3. Fix top bug categories\n4. Improve onboarding",
    source: "Customer Support Benchmarks",
    isRAG: false,
    team: "customer success",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-customer-ltv",
    category: "customer",
    header: "Customer LTV Benchmark",
    metric: "Customer Lifetime Value",
    value: "$15K-50K",
    change: "N/A",
    trend: "up",
    timeframe: "per customer",
    description: "Mid-market B2B SaaS achieves $15-50K LTV per customer",
    summary:
      "Customer lifetime value varies by segment and business model. Enterprise LTV often exceeds $100K while SMB ranges $3-10K.",
    benchmark: "B2B SaaS LTV by Segment",
    analysis: "LTV components: Average ACV × Gross retention × Expansion rate. Aim for LTV:CAC ratio of 3:1 or higher.",
    implications:
      "LTV determines viable customer acquisition channels and growth strategy. Higher LTV enables more expensive acquisition tactics.",
    nextSteps: "1. Calculate LTV by segment\n2. Improve expansion revenue\n3. Reduce churn\n4. Optimize pricing tiers",
    source: "SaaS Financial Benchmarks",
    isRAG: false,
    team: "finance",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-customer-health",
    category: "customer",
    header: "Health Score Benchmark",
    metric: "Health Score",
    value: "75-85",
    change: "N/A",
    trend: "up",
    timeframe: "average score",
    description: "Healthy B2B SaaS customers score 75-85 on composite health metrics",
    summary:
      "Health scores combine product usage, support interactions, and engagement metrics. Scores below 60 indicate churn risk requiring immediate attention.",
    benchmark: "Customer Success Health Scoring",
    analysis:
      "Health score inputs: Login frequency (25%), feature adoption (25%), support sentiment (20%), payment history (15%), engagement (15%).",
    implications:
      "Automated health scoring enables proactive customer success. Focus CS resources on accounts scoring below 60.",
    nextSteps:
      "1. Define health scoring model\n2. Automate score calculation\n3. Create intervention playbooks\n4. Monitor score trends",
    source: "Customer Success Best Practices",
    isRAG: false,
    team: "customer success",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-customer-usage",
    category: "customer",
    header: "Usage Frequency Benchmark",
    metric: "Usage Frequency",
    value: "3-5x weekly",
    change: "N/A",
    trend: "up",
    timeframe: "per user",
    description: "Engaged users access B2B SaaS products 3-5 times per week",
    summary:
      "Usage frequency indicates product stickiness and value realization. Daily active usage (5-7x weekly) correlates with near-zero churn risk.",
    benchmark: "SaaS Engagement Benchmark",
    analysis:
      "Usage patterns: Power users (daily), Regular users (3-5x/week), At-risk users (<1x/week). Focus on moving regulars to power users.",
    implications:
      "Usage frequency is leading indicator of retention. Products with daily use cases show 3x better retention than weekly use cases.",
    nextSteps:
      "1. Track usage cohorts\n2. Identify power user behaviors\n3. Build habit loops\n4. Send re-engagement campaigns",
    source: "Product Analytics Benchmarks",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Productivity Software"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Seed", "Series A", "Series B"],
    },
  },

  // Market Category Benchmarks
  {
    id: "benchmark-market-share",
    category: "market",
    header: "Market Share Benchmark",
    metric: "Market Share",
    value: "3-8%",
    change: "N/A",
    trend: "up",
    timeframe: "category",
    description: "Growth-stage companies capture 3-8% of addressable market",
    summary:
      "Market share grows from <1% at seed stage to 5-15% at scale stage. Category leaders achieve 30%+ market share with strong network effects.",
    benchmark: "Market Penetration by Stage",
    analysis:
      "Market share growth: Product expansion (40%), geographic expansion (30%), competitive displacement (20%), market creation (10%).",
    implications:
      "Market share trajectory determines competitive positioning and valuation. Aim for 10% within 3-5 years of achieving PMF.",
    nextSteps:
      "1. Define addressable market\n2. Track competitive wins/losses\n3. Expand into adjacent segments\n4. Build category awareness",
    source: "Market Analysis Research",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Marketplace"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-market-deal-velocity",
    category: "market",
    header: "Deal Velocity Benchmark",
    metric: "Deal Velocity",
    value: "45-90 days",
    change: "N/A",
    trend: "up",
    timeframe: "sales cycle",
    description: "Mid-market B2B SaaS closes deals in 45-90 days on average",
    summary:
      "Deal velocity varies by segment: SMB (7-30 days), Mid-market (45-90 days), Enterprise (120-180 days). Product-led growth shortens cycles significantly.",
    benchmark: "B2B Sales Cycle Benchmark",
    analysis:
      "Cycle length drivers: Decision maker count (30%), deal size (25%), technical complexity (20%), competitive landscape (15%), procurement (10%).",
    implications:
      "Shorter sales cycles improve cash efficiency and allow faster iteration. PLG motion can reduce mid-market cycles to 30-45 days.",
    nextSteps:
      "1. Remove friction from buyer journey\n2. Provide self-service trials\n3. Streamline contract process\n4. Build buying champions early",
    source: "B2B Sales Benchmarking",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-market-pipeline",
    category: "market",
    header: "Pipeline Coverage Benchmark",
    metric: "Pipeline Coverage",
    value: "3-4x",
    change: "N/A",
    trend: "up",
    timeframe: "quarterly",
    description: "Healthy sales organizations maintain 3-4x pipeline coverage",
    summary:
      "Pipeline coverage measures pipeline value relative to quota. 3-4x coverage ensures hitting targets with typical win rates and deal slippage.",
    benchmark: "Sales Pipeline Management",
    analysis:
      "Coverage needs vary by stage: Early-stage (4-5x), Growth (3-4x), Scale (2.5-3.5x). Higher coverage compensates for deal uncertainty.",
    implications:
      "Insufficient pipeline leads to missed targets. Over-coverage may indicate poor qualification. Optimize for 3-4x sustainable coverage.",
    nextSteps:
      "1. Track coverage by rep and segment\n2. Improve lead quality\n3. Accelerate pipeline generation\n4. Regular pipeline reviews",
    source: "Sales Operations Research",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-market-growth-rate",
    category: "market",
    header: "Market Growth Benchmark",
    metric: "Market Growth Rate",
    value: "15-25%",
    change: "N/A",
    trend: "up",
    timeframe: "annually",
    description: "High-growth software categories expand 15-25% annually",
    summary:
      "Market growth rate determines total addressable market expansion. Categories growing >20% annually attract more competition and investment.",
    benchmark: "Software Market Growth Rates",
    analysis:
      "Growth drivers: Digital transformation (40%), replacement of legacy systems (30%), new use cases (20%), geographic expansion (10%).",
    implications:
      "Fast-growing markets enable multiple winners. Slower markets require competitive displacement for growth.",
    nextSteps:
      "1. Track category growth trends\n2. Position for market expansion\n3. Identify emerging segments\n4. Build thought leadership",
    source: "Market Research Reports",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-market-competitive",
    category: "market",
    header: "Competitive Position Benchmark",
    metric: "Competitive Position",
    value: "Top 3",
    change: "N/A",
    trend: "up",
    timeframe: "category ranking",
    description: "Successful companies achieve top 3 competitive position in their category",
    summary:
      "Market leaders capture disproportionate value. Top 3 players in a category typically capture 70%+ of market share and funding.",
    benchmark: "Competitive Positioning Analysis",
    analysis:
      "Positioning factors: Product differentiation (30%), brand awareness (25%), customer satisfaction (25%), pricing (10%), partnerships (10%).",
    implications:
      "Being top 3 in your category dramatically improves growth prospects and exit multiples. Focus beats being broad.",
    nextSteps:
      "1. Define your specific category\n2. Track competitive mentions\n3. Build unique capabilities\n4. Dominate 1-2 use cases",
    source: "Competitive Intelligence Data",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Marketplace", "E-commerce"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },

  // Product Category Benchmarks
  {
    id: "benchmark-product-engagement",
    category: "product",
    header: "User Engagement Benchmark",
    metric: "User Engagement",
    value: "40-60%",
    change: "N/A",
    trend: "up",
    timeframe: "monthly active users",
    description: "B2B SaaS sees 40-60% of licensed users actively engaged monthly",
    summary:
      "User engagement rates vary by deployment model. Products with strong onboarding and ongoing value achieve 60%+ MAU/Total Users ratio.",
    benchmark: "SaaS Engagement Benchmark",
    analysis:
      "Engagement drivers: Onboarding quality (35%), ongoing value delivery (30%), integration depth (20%), user notifications (15%).",
    implications:
      "Low engagement indicates adoption challenges or weak value prop. Focus on activating dormant users through campaigns and product improvements.",
    nextSteps:
      "1. Segment users by activity\n2. Build re-engagement flows\n3. Improve onboarding\n4. Add collaborative features",
    source: "Product Analytics Research",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Productivity Software"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-product-activation",
    category: "product",
    header: "Activation Rate Benchmark",
    metric: "Activation Rate",
    value: "30-50%",
    change: "N/A",
    trend: "up",
    timeframe: "trial to activated",
    description: "B2B SaaS converts 30-50% of trial users to activated state",
    summary:
      "Activation rate measures users reaching key value moment. Top PLG companies achieve 50%+ activation through optimized onboarding.",
    benchmark: "Product-Led Growth Benchmark",
    analysis:
      "Activation factors: Time to value (40%), onboarding friction (30%), feature complexity (20%), support availability (10%).",
    implications:
      "Activation rate is critical PLG metric. Small improvements compound into significant growth. Focus on removing onboarding friction.",
    nextSteps:
      "1. Define activation criteria\n2. Map user journey\n3. Reduce time to value\n4. Test onboarding variants",
    source: "PLG Benchmarking Study",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)"],
      businessStage: ["Seed", "Series A"],
    },
  },
  {
    id: "benchmark-product-onboarding",
    category: "product",
    header: "Onboarding Completion Benchmark",
    metric: "Onboarding Completion",
    value: "60-75%",
    change: "N/A",
    trend: "up",
    timeframe: "completion rate",
    description: "Well-designed onboarding flows achieve 60-75% completion rates",
    summary:
      "Onboarding completion strongly predicts long-term retention. Users completing onboarding show 3x higher retention than those who don't.",
    benchmark: "SaaS Onboarding Best Practices",
    analysis:
      "Completion drivers: Clear value prop (30%), minimal steps (30%), progress indicators (20%), contextual help (20%).",
    implications:
      "Every 10% improvement in onboarding completion increases overall retention by 5-8%. Prioritize onboarding optimization.",
    nextSteps:
      "1. Reduce onboarding steps\n2. Show progress clearly\n3. Celebrate milestones\n4. Offer guided walkthroughs",
    source: "Product Onboarding Research",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS"],
      productStage: ["Early Traction (PMF seeking)", "Growth Stage (PMF achieved)"],
      businessStage: ["Seed", "Series A"],
    },
  },
  {
    id: "benchmark-product-time-to-value",
    category: "product",
    header: "Time to Value Benchmark",
    metric: "Time to Value",
    value: "< 1 hour",
    change: "N/A",
    trend: "up",
    timeframe: "first value",
    description: "Top products deliver value in under 1 hour for new users",
    summary:
      "Time to value (TTV) measures how quickly users experience core product benefit. Faster TTV correlates strongly with activation and retention.",
    benchmark: "Product Experience Benchmark",
    analysis:
      "TTV varies by product: Simple tools (<15 min), Mid-complexity (30-60 min), Enterprise platforms (1-3 hours). Reduce through better UX.",
    implications:
      "Long TTV increases drop-off risk. Every minute saved in TTV improves activation rate. Focus on immediate value demonstration.",
    nextSteps:
      "1. Map user's first session\n2. Identify fastest path to value\n3. Remove setup friction\n4. Pre-populate with examples",
    source: "UX Research Findings",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS", "Developer Tools"],
      productStage: ["MVP / Beta", "Early Traction (PMF seeking)"],
      businessStage: ["Pre-seed", "Seed"],
    },
  },
  {
    id: "benchmark-product-usage",
    category: "product",
    header: "Product Usage Benchmark",
    metric: "Product Usage",
    value: "25-35%",
    change: "N/A",
    trend: "up",
    timeframe: "DAU/MAU ratio",
    description: "Sticky products achieve 25-35% DAU/MAU ratio",
    summary:
      "DAU/MAU ratio measures product stickiness. Ratios above 30% indicate high engagement and habit formation.",
    benchmark: "Product Stickiness Benchmark",
    analysis:
      "Stickiness varies by category: Collaboration tools (40-60%), Analytics (20-30%), Marketing tools (15-25%). Higher is better.",
    implications:
      "Stickiness predicts retention and expansion. Focus on daily use cases and habit-forming features to improve ratio.",
    nextSteps: "1. Track DAU/MAU trends\n2. Build daily workflows\n3. Add notifications\n4. Create engagement loops",
    source: "Product Metrics Research",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS", "Productivity Software"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-product-task-completion",
    category: "product",
    header: "Task Completion Benchmark",
    metric: "Task Completion",
    value: "70-85%",
    change: "N/A",
    trend: "up",
    timeframe: "success rate",
    description: "Intuitive products achieve 70-85% task completion rates",
    summary:
      "Task completion rate measures how often users successfully complete their intended action. High rates indicate good UX and product-market fit.",
    benchmark: "Product Usability Benchmark",
    analysis:
      "Completion drivers: Intuitive UI (40%), clear guidance (25%), performance (20%), error prevention (15%).",
    implications:
      "Low completion rates frustrate users and reduce retention. Use analytics to identify drop-off points and optimize flows.",
    nextSteps:
      "1. Track completion funnels\n2. Identify failure points\n3. Add contextual help\n4. Simplify complex flows",
    source: "UX Usability Studies",
    isRAG: false,
    team: "product",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Seed", "Series A", "Series B"],
    },
  },

  // Sales Category Benchmarks
  {
    id: "benchmark-sales-cycle-length",
    category: "sales",
    header: "Sales Cycle Length Benchmark",
    metric: "Sales Cycle Length",
    value: "60-90 days",
    change: "N/A",
    trend: "up",
    timeframe: "average",
    description: "Mid-market B2B deals close in 60-90 days on average",
    summary:
      "Sales cycle length varies by ACV and complexity: <$10K (14-30 days), $10-50K (45-90 days), $50K+ (90-180 days).",
    benchmark: "B2B Sales Cycle Benchmark",
    analysis:
      "Cycle drivers: Stakeholder count (30%), budget approval process (25%), technical evaluation (20%), legal review (15%), procurement (10%).",
    implications:
      "Shorter cycles improve efficiency and predictability. Focus on reducing friction and building multi-threading relationships.",
    nextSteps:
      "1. Map typical buyer journey\n2. Streamline technical evaluation\n3. Build champion relationships\n4. Accelerate legal/procurement",
    source: "Sales Performance Data",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-sales-conversion",
    category: "sales",
    header: "Lead Conversion Benchmark",
    metric: "Lead Conversion Rate",
    value: "15-25%",
    change: "N/A",
    trend: "up",
    timeframe: "lead to opportunity",
    description: "Quality B2B lead generation converts 15-25% to opportunities",
    summary:
      "Conversion rates vary by lead source: Referrals (30-40%), Inbound (20-30%), Outbound (10-15%). Focus on high-converting channels.",
    benchmark: "Lead Conversion Benchmark",
    analysis:
      "Conversion factors: Lead quality/fit (40%), speed to contact (25%), sales messaging (20%), competitive timing (15%).",
    implications:
      "Low conversion indicates lead quality or sales process issues. Prioritize lead scoring and qualification before SDR outreach.",
    nextSteps:
      "1. Implement lead scoring\n2. Reduce response time\n3. Refine ICP definition\n4. Train SDRs on qualification",
    source: "Sales Development Research",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-sales-acv",
    category: "sales",
    header: "Average Contract Value Benchmark",
    metric: "Average Contract Value",
    value: "$15K-50K",
    change: "N/A",
    trend: "up",
    timeframe: "annual",
    description: "Mid-market B2B SaaS achieves $15-50K average contract value",
    summary:
      "ACV varies by segment: SMB ($3-15K), Mid-market ($15-75K), Enterprise ($75K-500K+). Higher ACV enables better unit economics.",
    benchmark: "B2B SaaS Pricing Benchmark",
    analysis:
      "ACV growth drivers: Seat expansion (35%), feature upsells (30%), pricing increases (20%), multi-product (15%).",
    implications: "ACV determines viable GTM motion. <$10K requires PLG, $15-50K inside sales, $50K+ field sales.",
    nextSteps:
      "1. Analyze ACV by segment\n2. Build expansion playbooks\n3. Optimize pricing tiers\n4. Add premium features",
    source: "SaaS Pricing Research",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-sales-pipeline-health",
    category: "sales",
    header: "Pipeline Health Benchmark",
    metric: "Pipeline Health",
    value: "75-85%",
    change: "N/A",
    trend: "up",
    timeframe: "qualified score",
    description: "Healthy pipelines score 75-85% on composite health metrics",
    summary:
      "Pipeline health combines coverage, age, velocity, and conversion metrics. Scores above 75% indicate predictable revenue outcomes.",
    benchmark: "Sales Pipeline Management",
    analysis:
      "Health factors: Adequate coverage (30%), balanced stages (25%), acceptable age (25%), strong activity (20%).",
    implications:
      "Poor pipeline health leads to missed forecasts. Regular pipeline hygiene and deal progression reviews essential.",
    nextSteps: "1. Define health criteria\n2. Weekly pipeline reviews\n3. Remove stale deals\n4. Focus on stuck deals",
    source: "Sales Operations Best Practices",
    isRAG: false,
    team: "sales",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },

  // Marketing Category Benchmarks
  {
    id: "benchmark-marketing-lead-gen",
    category: "marketing",
    header: "Lead Generation Benchmark",
    metric: "Lead Generation Rate",
    value: "200-500",
    change: "N/A",
    trend: "up",
    timeframe: "MQLs per month",
    description: "Growth-stage B2B companies generate 200-500 MQLs monthly",
    summary:
      "Lead generation scales with marketing budget and CAC targets. $20-50K monthly spend typically generates 200-500 qualified leads.",
    benchmark: "B2B Marketing Benchmark",
    analysis: "Lead sources: Content/SEO (30%), Paid ads (25%), Events (20%), Partnerships (15%), Outbound (10%).",
    implications:
      "Lead volume must support sales capacity. Insufficient leads constrain growth; excess unqualified leads waste sales time.",
    nextSteps: "1. Diversify lead sources\n2. Optimize landing pages\n3. Build content library\n4. Test new channels",
    source: "B2B Marketing Research",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-marketing-mqls",
    category: "marketing",
    header: "MQL Benchmark",
    metric: "Marketing Qualified Leads",
    value: "25-35%",
    change: "N/A",
    trend: "up",
    timeframe: "lead to MQL rate",
    description: "Quality B2B marketing converts 25-35% of leads to MQL status",
    summary:
      "MQL rate indicates lead quality and scoring accuracy. Higher rates improve sales efficiency but may indicate overly loose criteria.",
    benchmark: "Lead Quality Benchmark",
    analysis:
      "MQL criteria: Firmographic fit (30%), engagement score (25%), intent signals (25%), budget/authority (20%).",
    implications:
      "Balance MQL volume and quality. Too strict hurts pipeline; too loose wastes sales cycles. Iterate scoring with sales feedback.",
    nextSteps:
      "1. Define MQL criteria with sales\n2. Track MQL→SQL conversion\n3. Refine scoring model\n4. Focus on fit+intent",
    source: "Marketing Operations Data",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-marketing-roi",
    category: "marketing",
    header: "Campaign ROI Benchmark",
    metric: "Campaign ROI",
    value: "3-5x",
    change: "N/A",
    trend: "up",
    timeframe: "return on spend",
    description: "Effective marketing campaigns achieve 3-5x ROI on spend",
    summary:
      "Campaign ROI varies by channel and maturity. Early-stage typically sees 2-3x; growth-stage 3-5x; scale-stage 4-6x+ ROI.",
    benchmark: "Marketing ROI Benchmark",
    analysis:
      "High ROI channels: Organic/content (5-10x), Paid search (3-5x), Paid social (2-4x), Events (2-3x). Blend determines overall ROI.",
    implications:
      "Track ROI by channel to optimize budget allocation. Scale what works, cut what doesn't. Build compounding organic assets.",
    nextSteps:
      "1. Measure channel ROI\n2. Increase budget on top performers\n3. Test new channels\n4. Build content flywheel",
    source: "Marketing Performance Data",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "E-commerce"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-marketing-awareness",
    category: "marketing",
    header: "Brand Awareness Benchmark",
    metric: "Brand Awareness",
    value: "20-35%",
    change: "N/A",
    trend: "up",
    timeframe: "aided awareness",
    description: "Growth-stage B2B brands achieve 20-35% aided awareness in target market",
    summary:
      "Brand awareness grows with category maturity and marketing investment. Market leaders achieve 60%+ awareness while challengers range 15-30%.",
    benchmark: "Brand Awareness Research",
    analysis:
      "Awareness drivers: Content marketing (30%), Event presence (25%), PR/media (20%), Paid advertising (15%), Word of mouth (10%).",
    implications:
      "Brand awareness amplifies all marketing efforts. Improves conversion rates, reduces CAC, and enables premium pricing.",
    nextSteps:
      "1. Survey target audience\n2. Track unaided/aided awareness\n3. Build thought leadership\n4. Increase share of voice",
    source: "Brand Research Studies",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Marketplace"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-marketing-roas",
    category: "marketing",
    header: "ROAS Benchmark",
    metric: "ROAS",
    value: "3-4x",
    change: "N/A",
    trend: "up",
    timeframe: "return on ad spend",
    description: "Profitable paid advertising delivers 3-4x ROAS",
    summary:
      "ROAS varies by channel and funnel stage: Brand awareness (1-2x), Consideration (2-3x), Conversion (3-5x). Blended ROAS should exceed 3x.",
    benchmark: "Paid Advertising Benchmark",
    analysis:
      "ROAS optimization: Audience targeting (35%), Creative quality (30%), Landing page (20%), Bidding strategy (15%).",
    implications:
      "ROAS below 2x indicates need for optimization or channel shift. Above 5x suggests underspending on working channels.",
    nextSteps:
      "1. Track ROAS by channel\n2. Test audience segments\n3. Optimize landing pages\n4. Increase best-performing budgets",
    source: "Digital Advertising Research",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["E-commerce", "B2C SaaS", "B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-marketing-traffic",
    category: "marketing",
    header: "Website Traffic Benchmark",
    metric: "Traffic",
    value: "50K-200K",
    change: "N/A",
    trend: "up",
    timeframe: "monthly visitors",
    description: "Growth-stage B2B SaaS attracts 50-200K monthly website visitors",
    summary:
      "Traffic scales with content investment and SEO maturity. Early stage (10-50K), Growth (50-200K), Scale (200K-1M+) monthly visitors.",
    benchmark: "Website Traffic Benchmark",
    analysis:
      "Traffic sources: Organic search (40-60%), Direct (15-25%), Referral (10-15%), Paid (10-20%), Social (5-10%).",
    implications:
      "Traffic quality matters more than quantity. Focus on high-intent visitors from ICP companies. Build organic traffic foundation.",
    nextSteps: "1. Create content strategy\n2. Optimize for SEO\n3. Build backlinks\n4. Track engagement metrics",
    source: "Web Analytics Data",
    isRAG: false,
    team: "marketing",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "B2C SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },

  // Engineering Category Benchmarks
  {
    id: "benchmark-engineering-deploy-freq",
    category: "engineering",
    header: "Deploy Frequency Benchmark",
    metric: "Deploy Frequency",
    value: "10-50x weekly",
    change: "N/A",
    trend: "up",
    timeframe: "per week",
    description: "High-performing teams deploy 10-50 times per week",
    summary:
      "Deploy frequency indicates development velocity and CI/CD maturity. Elite teams deploy multiple times daily; median teams weekly.",
    benchmark: "DORA Metrics Benchmark",
    analysis:
      "Frequency enablers: Automated testing (30%), CI/CD pipelines (25%), Feature flags (20%), Monitoring (15%), Team culture (10%).",
    implications:
      "Higher deploy frequency enables faster iteration and reduces change risk. Requires investment in automation and testing.",
    nextSteps: "1. Implement CI/CD pipeline\n2. Automate testing\n3. Add feature flags\n4. Improve monitoring",
    source: "DORA State of DevOps",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-engineering-change-failure",
    category: "engineering",
    header: "Change Failure Rate Benchmark",
    metric: "Change Failure Rate",
    value: "0-15%",
    change: "N/A",
    trend: "up",
    timeframe: "deployment failures",
    description: "Elite teams maintain <5% change failure rate; high performers <15%",
    summary:
      "Change failure rate measures deployment quality and testing effectiveness. Lower rates indicate mature development practices.",
    benchmark: "DORA Metrics - Change Failure",
    analysis:
      "Failure prevention: Comprehensive testing (40%), Code review (25%), Staging environments (20%), Gradual rollouts (15%).",
    implications:
      "High failure rates erode team confidence and customer trust. Invest in testing and quality gates to reduce failures.",
    nextSteps:
      "1. Expand test coverage\n2. Improve code review process\n3. Use canary deployments\n4. Post-mortem all incidents",
    source: "DORA Research",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-engineering-mttr",
    category: "engineering",
    header: "MTTR Benchmark",
    metric: "Mean Time to Recovery",
    value: "< 1 hour",
    change: "N/A",
    trend: "up",
    timeframe: "incident recovery",
    description: "Elite teams recover from incidents in under 1 hour",
    summary:
      "MTTR measures incident response effectiveness. Elite (<1 hour), High performers (< 1 day), Medium (< 1 week), Low (> 1 week).",
    benchmark: "DORA Metrics - Recovery Time",
    analysis:
      "Recovery speed drivers: Monitoring/alerting (35%), On-call process (25%), Runbooks (20%), Rollback capability (20%).",
    implications:
      "Fast recovery minimizes customer impact and maintains trust. Requires investment in observability and incident response.",
    nextSteps:
      "1. Improve monitoring\n2. Create incident runbooks\n3. Practice incident response\n4. Enable fast rollbacks",
    source: "DORA State of DevOps",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Fintech"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-engineering-code-quality",
    category: "engineering",
    header: "Code Quality Benchmark",
    metric: "Code Quality Score",
    value: "A-B rating",
    change: "N/A",
    trend: "up",
    timeframe: "overall rating",
    description: "Healthy codebases maintain A or B quality ratings",
    summary:
      "Code quality affects development velocity and system reliability. Technical debt accumulates when quality drops below B rating.",
    benchmark: "Code Quality Metrics",
    analysis:
      "Quality factors: Test coverage (30%), Code complexity (25%), Documentation (20%), Security issues (15%), Duplication (10%).",
    implications:
      "Poor code quality compounds into slower development and more bugs. Regular refactoring maintains velocity long-term.",
    nextSteps:
      "1. Track quality metrics\n2. Address critical issues\n3. Set quality gates\n4. Allocate refactoring time",
    source: "Software Quality Research",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Seed", "Series A", "Series B"],
    },
  },
  {
    id: "benchmark-engineering-incident-rate",
    category: "engineering",
    header: "Incident Rate Benchmark",
    metric: "Incident Rate",
    value: "2-5 per month",
    change: "N/A",
    trend: "up",
    timeframe: "P0/P1 incidents",
    description: "Well-operated systems experience 2-5 P0/P1 incidents monthly",
    summary:
      "Incident rate indicates system stability and quality. As complexity grows, incident management becomes more important than prevention.",
    benchmark: "System Reliability Benchmark",
    analysis:
      "Incident causes: Code bugs (35%), Infrastructure (25%), External dependencies (20%), Configuration (15%), Capacity (5%).",
    implications:
      "Zero incidents unrealistic as systems scale. Focus on faster detection, response, and learning from incidents.",
    nextSteps:
      "1. Improve observability\n2. Automate incident response\n3. Conduct blameless post-mortems\n4. Track incident trends",
    source: "SRE Best Practices",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Fintech"],
      productStage: ["Scale Stage"],
      businessStage: ["Series B", "Series C+"],
    },
  },
  {
    id: "benchmark-engineering-velocity",
    category: "engineering",
    header: "Engineering Velocity Benchmark",
    metric: "Velocity",
    value: "20-30",
    change: "N/A",
    trend: "up",
    timeframe: "story points per sprint",
    description: "Mature teams deliver 20-30 story points per sprint",
    summary:
      "Velocity measures team output and predictability. Consistent velocity enables reliable roadmap planning and commitments.",
    benchmark: "Agile Development Metrics",
    analysis:
      "Velocity factors: Team experience (30%), Technical debt (25%), Requirements clarity (20%), Team size (15%), Complexity (10%).",
    implications:
      "Velocity varies by team and context. Focus on consistency and trend rather than absolute numbers. Avoid velocity gaming.",
    nextSteps: "1. Track velocity trends\n2. Manage technical debt\n3. Improve story estimation\n4. Remove blockers",
    source: "Agile Metrics Research",
    isRAG: false,
    team: "engineering",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },

  // Delivery Category Benchmarks
  {
    id: "benchmark-delivery-on-time",
    category: "delivery",
    header: "On-Time Delivery Benchmark",
    metric: "On-Time Delivery Rate",
    value: "80-90%",
    change: "N/A",
    trend: "up",
    timeframe: "sprint/project completion",
    description: "High-performing teams deliver 80-90% of commitments on time",
    summary:
      "On-time delivery indicates planning accuracy and execution effectiveness. Elite teams exceed 90% through disciplined estimation.",
    benchmark: "Delivery Performance Benchmark",
    analysis:
      "On-time factors: Accurate estimation (35%), Scope management (30%), Blocker resolution (20%), Team capacity planning (15%).",
    implications:
      "Consistent delivery builds stakeholder trust and enables roadmap confidence. Below 70% indicates estimation or execution issues.",
    nextSteps:
      "1. Improve estimation process\n2. Protect scope commitments\n3. Build contingency buffers\n4. Enhance estimation techniques",
    source: "Project Management Research",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-delivery-satisfaction",
    category: "delivery",
    header: "Stakeholder Satisfaction Benchmark",
    metric: "Customer Satisfaction",
    value: "4.0-4.5",
    change: "N/A",
    trend: "up",
    timeframe: "out of 5",
    description: "Strong delivery teams achieve 4.0-4.5 stakeholder satisfaction scores",
    summary:
      "Stakeholder satisfaction measures delivery team effectiveness and communication. Scores above 4.0 indicate well-managed expectations.",
    benchmark: "Delivery Team Satisfaction",
    analysis:
      "Satisfaction drivers: Communication (35%), Meeting commitments (30%), Quality (20%), Responsiveness (15%).",
    implications:
      "Low satisfaction creates friction and reduces team effectiveness. Regular check-ins and transparent communication build trust.",
    nextSteps:
      "1. Survey stakeholders regularly\n2. Improve communication cadence\n3. Set realistic expectations\n4. Celebrate deliveries",
    source: "Team Effectiveness Studies",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-delivery-sprint-velocity",
    category: "delivery",
    header: "Sprint Velocity Benchmark",
    metric: "Sprint Velocity",
    value: "25-35",
    change: "N/A",
    trend: "up",
    timeframe: "points per sprint",
    description: "Consistent teams maintain 25-35 story points per sprint",
    summary:
      "Sprint velocity measures team capacity and predictability. Stable velocity enables reliable planning; high variance indicates issues.",
    benchmark: "Sprint Performance Benchmark",
    analysis:
      "Velocity stability factors: Team consistency (35%), Sprint discipline (30%), Story sizing (20%), Technical debt (15%).",
    implications:
      "Velocity should remain consistent over time. Increasing velocity through team pressure causes burnout and quality issues.",
    nextSteps:
      "1. Track velocity range\n2. Maintain sprint discipline\n3. Standardize story sizing\n4. Protect team from interruptions",
    source: "Agile Team Metrics",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-delivery-cycle-time",
    category: "delivery",
    header: "Cycle Time Benchmark",
    metric: "Cycle Time",
    value: "3-7 days",
    change: "N/A",
    trend: "up",
    timeframe: "commit to deploy",
    description: "Efficient teams complete features in 3-7 days from start to deploy",
    summary:
      "Cycle time measures how quickly work flows through the system. Shorter cycles enable faster feedback and iteration.",
    benchmark: "Development Cycle Benchmark",
    analysis:
      "Cycle time components: Development (40%), Code review (20%), Testing (20%), Deployment (10%), Waiting (10%).",
    implications:
      "Long cycle times indicate process bottlenecks or excessive WIP. Reduce batch sizes and eliminate wait states.",
    nextSteps: "1. Measure cycle time\n2. Identify bottlenecks\n3. Limit WIP\n4. Automate handoffs",
    source: "Lean Software Development",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "benchmark-delivery-wip",
    category: "delivery",
    header: "WIP Benchmark",
    metric: "WIP",
    value: "3-5",
    change: "N/A",
    trend: "up",
    timeframe: "items per developer",
    description: "Focused teams maintain 3-5 work items in progress per developer",
    summary:
      "WIP (Work In Progress) measures focus and flow. Lower WIP improves throughput and reduces context switching.",
    benchmark: "Kanban WIP Limits",
    analysis:
      "Optimal WIP varies by team size and work complexity. Smaller teams (2-3 WIP), larger teams (4-5 WIP). Monitor flow efficiency.",
    implications: "Excess WIP causes context switching and delays. Limit WIP to improve flow and predictability.",
    nextSteps: "1. Set WIP limits\n2. Finish before starting\n3. Swarm on blockers\n4. Track flow efficiency",
    source: "Kanban Metrics Research",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Seed", "Series A", "Series B"],
    },
  },
  {
    id: "benchmark-delivery-burndown",
    category: "delivery",
    header: "Burndown Benchmark",
    metric: "Burndown",
    value: "Linear trend",
    change: "N/A",
    trend: "up",
    timeframe: "sprint progress",
    description: "Healthy sprints show consistent, linear burndown progress",
    summary:
      "Burndown chart shows work completion over sprint. Linear trend indicates good planning and execution; flat then steep suggests issues.",
    benchmark: "Sprint Health Metrics",
    analysis:
      "Ideal burndown: Steady daily progress, minimal scope changes, early identification of risks, team collaboration on blockers.",
    implications:
      "Irregular burndown indicates planning issues, scope creep, or blockers. Review sprint discipline and estimation accuracy.",
    nextSteps:
      "1. Review burndown daily\n2. Address blockers quickly\n3. Protect sprint scope\n4. Improve story breakdown",
    source: "Scrum Best Practices",
    isRAG: false,
    team: "delivery",
    isBenchmark: true,
    benchmarkContext: {
      productCategory: ["B2B SaaS", "Developer Tools"],
      productStage: ["Growth Stage (PMF achieved)", "Scale Stage"],
      businessStage: ["Series A", "Series B"],
    },
  },
  {
    id: "insufficient-1",
    category: "customer",
    header: "Customer Lifetime Value (LTV)",
    metric: "LTV",
    value: "--",
    change: "N/A",
    trend: "up",
    timeframe: "",
    description: "Insufficient data to calculate LTV",
    summary: "",
    analysis: "",
    implications: "",
    nextSteps: "",
    source: "CRM / Billing",
    isRAG: false,
    team: "customer",
    insufficientData: {
      reason: "Customer Lifetime Value requires both revenue per customer and churn data across a sufficient time period. Your connected data sources currently do not include subscription revenue history or customer cancellation events, so LTV cannot be calculated.",
      formula: "LTV = Average Revenue Per User (ARPU) ÷ Customer Churn Rate\n\nor alternatively:\n\nLTV = Average Purchase Value × Purchase Frequency × Customer Lifespan",
      requiredData: [
        {
          field: "Revenue per customer",
          description: "Monthly or annual subscription amount paid by each individual customer, broken down by customer ID.",
          source: "Billing system (Stripe, Chargebee)",
          example: "customer_id: cus_123, amount: $299, interval: monthly",
        },
        {
          field: "Customer start date",
          description: "The date each customer first became a paying subscriber, used to calculate tenure.",
          source: "CRM or billing system",
          example: "customer_id: cus_123, started_at: 2023-01-15",
        },
        {
          field: "Customer churn events",
          description: "Records of when customers cancelled, churned, or did not renew, including the cancellation date.",
          source: "CRM (Salesforce, HubSpot) or billing system",
          example: "customer_id: cus_123, churned_at: 2024-03-01",
        },
      ],
      howToConnect: "Connect your billing system (Stripe or Chargebee) via the Data Integrations section in your Profile. Once connected, the system will automatically pull subscription and cancellation history. Alternatively, upload a CSV export of your customer revenue records using the manual upload option.",
    },
  },
  {
    id: "insufficient-2",
    category: "sales",
    header: "Sales Pipeline Coverage Ratio",
    metric: "Pipeline Coverage",
    value: "--",
    change: "N/A",
    trend: "up",
    timeframe: "",
    description: "Insufficient data to calculate pipeline coverage",
    summary: "",
    analysis: "",
    implications: "",
    nextSteps: "",
    source: "CRM",
    isRAG: false,
    team: "sales",
    insufficientData: {
      reason: "Pipeline Coverage Ratio compares the total value of open pipeline opportunities against your current revenue target. Your CRM is not yet connected, so open opportunity values and stage data are unavailable.",
      formula: "Pipeline Coverage Ratio = Total Pipeline Value ÷ Revenue Target\n\nA healthy ratio is typically 3x–4x your target (e.g. $3M pipeline for a $1M target).",
      requiredData: [
        {
          field: "Open opportunities with value",
          description: "All active deals in your CRM with an estimated close value and current stage.",
          source: "CRM (Salesforce, HubSpot, Pipedrive)",
          example: "opportunity: Acme Corp, stage: Proposal, value: $45,000",
        },
        {
          field: "Revenue target (current period)",
          description: "Your quarterly or monthly sales target, either from a quota management tool or manually entered.",
          source: "CRM, spreadsheet, or manual input",
          example: "Q2 target: $500,000",
        },
        {
          field: "Opportunity close date",
          description: "Expected close dates for each deal, used to filter which opportunities fall within the current period.",
          source: "CRM",
          example: "close_date: 2024-06-30",
        },
      ],
      howToConnect: "Connect Salesforce or HubSpot via Data Integrations in your Profile. The system will pull all open opportunities, deal values, and stage data automatically. You can also manually enter your revenue target in the Settings section if it is not stored in your CRM.",
    },
  },
  {
    id: "insufficient-3",
    category: "product",
    header: "Feature Adoption Rate",
    metric: "Feature Adoption",
    value: "--",
    change: "N/A",
    trend: "up",
    timeframe: "",
    description: "Insufficient data to calculate feature adoption",
    summary: "",
    analysis: "",
    implications: "",
    nextSteps: "",
    source: "Product Analytics",
    isRAG: false,
    team: "product",
    insufficientData: {
      reason: "Feature Adoption Rate measures the percentage of active users who have used a specific feature at least once within a given period. No product analytics tool is currently connected, so user-level feature interaction data is unavailable.",
      formula: "Feature Adoption Rate = (Users who used the feature ÷ Total active users) × 100\n\nMeasured over a rolling 30-day window.",
      requiredData: [
        {
          field: "Feature interaction events",
          description: "User-level event tracking showing which features each user has triggered, with timestamps.",
          source: "Product analytics (Amplitude, Mixpanel, PostHog, Segment)",
          example: "user_id: u_456, event: 'export_report_clicked', timestamp: 2024-05-01T14:32:00Z",
        },
        {
          field: "Active user list",
          description: "List of users who have logged in or performed any action within the measurement period.",
          source: "Product analytics or auth system",
          example: "user_id: u_456, last_active: 2024-05-03",
        },
        {
          field: "Feature taxonomy",
          description: "A mapping of event names to named features, so raw events can be grouped by feature area.",
          source: "Product analytics configuration",
          example: "event: 'export_report_clicked' → feature: 'Report Export'",
        },
      ],
      howToConnect: "Connect Amplitude, Mixpanel, or PostHog via Data Integrations in your Profile. Ensure event tracking is implemented for the features you want to measure. Once connected, select the features you want to track from the signal configuration panel.",
    },
  },
]
