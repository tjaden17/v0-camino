"use client"

import type React from "react"
import { AlertCircle } from "lucide-react"

import { Target, TrendingUp, Users, CheckCircle, ArrowRight, Zap, Shield, Clock } from "lucide-react"

export default function DepartmentLeadersPitchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Lead with Data, Not Gut Feel</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            How department leaders transform team performance with real-time insights and industry benchmarks
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        {/* Problem Statement */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Problem</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Department leaders need data to drive strategic decisions, but face systemic barriers to access
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ProblemStatementCard
              role="Head of Delivery"
              icon={<Target className="w-8 h-8" />}
              statement="For Heads of Delivery, who need to optimize engineering velocity and justify resource investments, when planning sprint capacity or presenting to leadership, they face delays in accessing real-time velocity data, lack of industry benchmarks, and inability to prove team performance against comparable companies"
            />

            <ProblemStatementCard
              role="Head of Product"
              icon={<Zap className="w-8 h-8" />}
              statement="For Heads of Product, who need to connect product metrics to business outcomes and guide strategic priorities, when preparing for board meetings or making roadmap decisions, they face data scattered across 5+ disconnected tools, inability to tie feature adoption to revenue, and lack of context on what 'good' looks like"
            />

            <ProblemStatementCard
              role="Head of Sales"
              icon={<TrendingUp className="w-8 h-8" />}
              statement="For Heads of Sales, who need to forecast accurately and manage pipeline health proactively, when building quarterly forecasts or identifying at-risk deals, they face outdated reports with 3-7 day lags, manual calculations prone to error, and lack of real-time visibility into deal velocity and win rate trends"
            />

            <ProblemStatementCard
              role="Head of Customer Success"
              icon={<Users className="w-8 h-8" />}
              statement="For Heads of Customer Success, who need to prevent churn and demonstrate CS impact on revenue, when identifying at-risk accounts or justifying team expansion, they face reactive signals that arrive after customers have already decided to leave, inability to quantify CS revenue contribution, and no benchmarks for health score effectiveness"
            />
          </div>
        </section>

        {/* Current Workflow */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Leaders Solve This Today</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The manual, time-consuming workflow that eats up 15-20 hours per week
            </p>
          </div>

          <div className="space-y-8">
            {/* Head of Delivery Workflow */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Head of Delivery</h3>
              </div>
              <div className="space-y-4">
                <WorkflowStep step={1} text="Ask team leads to manually export velocity data from Jira" time="2 hrs" />
                <WorkflowStep
                  step={2}
                  text="Wait for engineers to compile sprint metrics from multiple boards"
                  time="4-6 hrs"
                />
                <WorkflowStep step={3} text="Consolidate data in spreadsheets, clean inconsistencies" time="3 hrs" />
                <WorkflowStep
                  step={4}
                  text="Google for industry benchmarks, find outdated or irrelevant data"
                  time="2 hrs"
                />
                <WorkflowStep step={5} text="Create presentation deck, iterate with stakeholders" time="4 hrs" />
                <WorkflowStep
                  step={6}
                  text="Present to leadership, answer questions without real-time data"
                  time="1 hr"
                />
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Time:</span>
                    <span className="text-lg font-bold text-destructive">16-18 hours per decision</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Head of Product Workflow */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Head of Product</h3>
              </div>
              <div className="space-y-4">
                <WorkflowStep
                  step={1}
                  text="Log into 5+ tools (Analytics, CRM, Support, Engineering, Finance)"
                  time="30 min"
                />
                <WorkflowStep step={2} text="Export data from each tool, dealing with different formats" time="3 hrs" />
                <WorkflowStep step={3} text="Ask PMs to compile feature adoption metrics manually" time="4 hrs" />
                <WorkflowStep
                  step={4}
                  text="Try to connect product metrics to revenue impact via SQL queries"
                  time="4 hrs"
                />
                <WorkflowStep
                  step={5}
                  text="Search for comparable product benchmarks (often conflicting sources)"
                  time="2 hrs"
                />
                <WorkflowStep step={6} text="Build narrative in slides, sync with CEO on messaging" time="5 hrs" />
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Time:</span>
                    <span className="text-lg font-bold text-destructive">18-20 hours per board prep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Head of Sales Workflow */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Head of Sales</h3>
              </div>
              <div className="space-y-4">
                <WorkflowStep
                  step={1}
                  text="Wait for weekly Salesforce reports (data already 3-7 days old)"
                  time="1 week"
                />
                <WorkflowStep step={2} text="Ask RevOps to create custom pipeline analysis" time="6 hrs" />
                <WorkflowStep step={3} text="Manually calculate win rates, deal velocity by segment" time="3 hrs" />
                <WorkflowStep step={4} text="Call Sales Ops to verify numbers, resolve discrepancies" time="2 hrs" />
                <WorkflowStep
                  step={5}
                  text="Search LinkedIn/Google for industry benchmarks, find vague ranges"
                  time="2 hrs"
                />
                <WorkflowStep step={6} text="Build forecast model in Excel, present to CFO" time="4 hrs" />
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Time:</span>
                    <span className="text-lg font-bold text-destructive">17 hours + 1 week lag</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Head of Customer Success Workflow */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Head of Customer Success</h3>
              </div>
              <div className="space-y-4">
                <WorkflowStep step={1} text="Pull churn data from Stripe, usage from product analytics" time="2 hrs" />
                <WorkflowStep
                  step={2}
                  text="Ask CSMs to manually update health scores in spreadsheet"
                  time="8 hrs team"
                />
                <WorkflowStep
                  step={3}
                  text="Cross-reference support tickets to identify at-risk accounts"
                  time="3 hrs"
                />
                <WorkflowStep step={4} text="Calculate NPS, dig into Zendesk for qualitative feedback" time="2 hrs" />
                <WorkflowStep step={5} text="Try to quantify CS revenue impact (expansion, saves)" time="4 hrs" />
                <WorkflowStep
                  step={6}
                  text="Build business case for more CSMs using outdated benchmarks"
                  time="3 hrs"
                />
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Time:</span>
                    <span className="text-lg font-bold text-destructive">22 hours (+ 8 hrs team time)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">The Hidden Costs</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong>Opportunity cost:</strong> 60-80 hours per month that could be spent on strategy,
                    coaching, and growth initiatives
                  </li>
                  <li>
                    • <strong>Decision delay:</strong> 1-2 week lag means acting on outdated information, missing market
                    opportunities
                  </li>
                  <li>
                    • <strong>Team burnout:</strong> Data analysts spend 70% of time on manual pulls instead of insights
                  </li>
                  <li>
                    • <strong>Accuracy issues:</strong> Manual consolidation leads to errors, conflicting numbers in
                    meetings
                  </li>
                  <li>
                    • <strong>No benchmarks:</strong> Can't prove team performance vs. industry, limiting budget
                    justification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Specific Problems */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Challenge You Face Every Day</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Department leaders are expected to make data-driven decisions, but the data is always out of reach
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RoleProblemCard
              role="Head of Delivery"
              icon={<Target className="w-6 h-6" />}
              problems={[
                "Sprint velocity dropping but you find out 2 weeks later",
                "Can't prove delivery improvements to leadership",
                "Cycle time benchmarks? You're guessing based on articles",
                "Team capacity questions answered with spreadsheets",
              ]}
            />

            <RoleProblemCard
              role="Head of Product"
              icon={<Zap className="w-6 h-6" />}
              problems={[
                "Feature adoption data scattered across 5 tools",
                "Board asks for activation rates—takes 3 days to pull",
                "Time to value? You have anecdotes, not metrics",
                "Can't tie product metrics to business outcomes",
              ]}
            />

            <RoleProblemCard
              role="Head of Sales"
              icon={<TrendingUp className="w-6 h-6" />}
              problems={[
                "Pipeline coverage off—but discovered too late to fix",
                "Win rate declining, but which deals are actually at risk?",
                "Sales cycle benchmarks? Making it up in forecasts",
                "Quota attainment tracking is manual chaos",
              ]}
            />

            <RoleProblemCard
              role="Head of Customer Success"
              icon={<Users className="w-6 h-6" />}
              problems={[
                "Churn signals come after customers already left",
                "NPS trends? Manually calculated in spreadsheets",
                "Health scores exist but nobody actually uses them",
                "Can't show CS impact on revenue to the exec team",
              ]}
            />
          </div>
        </section>

        {/* The Cost */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What This Costs You</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Beyond the obvious time waste, poor data access has real consequences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <CostCard
              title="Personal Time Tax"
              stat="15-20 hrs/week"
              description="Spent chasing data, building reports, and explaining metrics instead of leading your team"
              icon={<Clock className="w-8 h-8 text-orange-500" />}
            />

            <CostCard
              title="Team Productivity Loss"
              stat="30-40%"
              description="Team members duplicating work, waiting for data, or working with outdated information"
              icon={<Users className="w-8 h-8 text-destructive" />}
            />

            <CostCard
              title="Missed Executive Opportunities"
              stat="4-6 per year"
              description="Can't advocate for budget, headcount, or strategic initiatives without compelling data stories"
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
            />
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-foreground mb-4">The Real Impact</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-destructive mb-2">$180K-300K</div>
                <p className="text-muted-foreground">
                  Annual cost of your time spent on data work instead of leadership
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive mb-2">2-3 months</div>
                <p className="text-muted-foreground">
                  Delayed strategic initiatives due to lack of data to justify investments
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Specific Outcomes */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Outcomes You Can Achieve</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transform how you lead with instant access to metrics that matter
            </p>
          </div>

          <div className="space-y-6">
            <RoleOutcomeCard
              role="Head of Delivery"
              outcomes={[
                {
                  title: "Prove Delivery Excellence",
                  description:
                    "Show leadership that your 45 deploys/month and 18-min MTTR put you in the top 10% of Series B companies",
                },
                {
                  title: "Optimize Team Capacity",
                  description:
                    "Track WIP and cycle time in real-time. Know immediately when a team is bottlenecked before it impacts deadlines",
                },
                {
                  title: "Justify Headcount Requests",
                  description:
                    "Use velocity trends and industry benchmarks to demonstrate exactly why you need 3 more engineers",
                },
                {
                  title: "Forecast with Confidence",
                  description:
                    "Historical sprint velocity + current WIP = accurate delivery predictions your exec team can trust",
                },
              ]}
            />

            <RoleOutcomeCard
              role="Head of Product"
              outcomes={[
                {
                  title: "Connect Product to Revenue",
                  description:
                    "Show that your 65% feature adoption rate correlates with 23% higher retention—finally prove product impact",
                },
                {
                  title: "Prioritize with Data",
                  description:
                    "Activation rates, time to value, and engagement metrics in one place. Stop arguing, start deciding",
                },
                {
                  title: "Board Prep in 30 Minutes",
                  description:
                    "Export curated product metrics with context and benchmarks. No more 3-day scrambles before board meetings",
                },
                {
                  title: "Spot Issues Early",
                  description:
                    "Get alerted when onboarding completion drops 15% week-over-week. Fix problems before they become disasters",
                },
              ]}
            />

            <RoleOutcomeCard
              role="Head of Sales"
              outcomes={[
                {
                  title: "Manage Pipeline with Precision",
                  description:
                    "Real-time pipeline coverage, deal velocity, and win rate tracking. Know exactly where you'll land this quarter",
                },
                {
                  title: "Coach with Context",
                  description:
                    "See which reps have 90-day sales cycles vs. 45-day. Replicate what works, coach what doesn't",
                },
                {
                  title: "Optimize Sales Process",
                  description:
                    "Your 67-day sales cycle vs. 52-day industry median? Now you know where to invest in improvements",
                },
                {
                  title: "Forecast Accurately",
                  description:
                    "Historical win rates by deal size + current pipeline = forecasts that are actually reliable for CFO and board",
                },
              ]}
            />

            <RoleOutcomeCard
              role="Head of Customer Success"
              outcomes={[
                {
                  title: "Prevent Churn Proactively",
                  description:
                    "Get alerts when customer health scores drop or usage frequency declines. Save accounts before renewal conversations",
                },
                {
                  title: "Demonstrate CS Value",
                  description:
                    "Show that your 94% retention rate and 8.9 NPS generate $4.2M in expansion revenue annually",
                },
                {
                  title: "Benchmark Your Team",
                  description:
                    "Your 12-hour response time vs. 18-hour industry average? Prove your team is world-class",
                },
                {
                  title: "Scale Without Chaos",
                  description:
                    "Track CSM capacity, customer health trends, and support ticket volume to plan hiring before you're underwater",
                },
              ]}
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works for Department Leaders</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built specifically for functional leaders who need insights, not more dashboards
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Select Your Role & Metrics</h3>
                <p className="text-muted-foreground mb-3">
                  Choose "Head of Delivery" and get instant recommendations for sprint velocity, cycle time, deploy
                  frequency, MTTR, and more. Each role gets pre-configured metrics that matter.
                </p>
                <div className="text-sm text-primary font-medium">Takes 2 minutes during onboarding</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Data Sources</h3>
                <p className="text-muted-foreground mb-3">
                  One-click OAuth to Jira, Linear, Salesforce, Zendesk, or 60+ other tools. No manual CSV uploads. No
                  engineering team required. Connect once, data flows forever.
                </p>
                <div className="text-sm text-primary font-medium">5-10 minutes per integration</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Get Personalized Insights Daily</h3>
                <p className="text-muted-foreground mb-3">
                  Your dashboard shows ONLY the metrics relevant to your role. Filter by "Recommended" to see
                  role-specific signals. No more wading through irrelevant data.
                </p>
                <div className="text-sm text-primary font-medium">Zero ongoing effort—it's automatic</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Compare Against Benchmarks</h3>
                <p className="text-muted-foreground mb-3">
                  See how your metrics stack up against companies at your stage, size, and category. Know if you're
                  ahead or behind industry standards.
                </p>
                <div className="text-sm text-primary font-medium">
                  Benchmarks update automatically based on your profile
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Export for Leadership Conversations</h3>
                <p className="text-muted-foreground mb-3">
                  One-click export of insights with analysis, implications, and recommended actions. Perfect for 1:1s
                  with CEO, board prep, or budget requests.
                </p>
                <div className="text-sm text-primary font-medium">30 seconds to create compelling data stories</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Assign Metrics to Your Team</h3>
                <p className="text-muted-foreground mb-3">
                  Delegate metric ownership to team members. They get notified, can see their assigned metrics, and you
                  maintain visibility across the entire department.
                </p>
                <div className="text-sm text-primary font-medium">Scales from solo leader to 50-person team</div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Enterprise-Grade Security</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Your data security concerns, addressed</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SecurityFeature
              icon={<Shield className="w-6 h-6" />}
              title="OAuth 2.0 Only"
              description="No passwords stored. Revocable access tokens. You control permissions at source system level."
            />
            <SecurityFeature
              icon={<Shield className="w-6 h-6" />}
              title="Zero Permanent Storage"
              description="We cache metrics for speed, not raw data. Your sensitive customer data stays in your systems."
            />
            <SecurityFeature
              icon={<Shield className="w-6 h-6" />}
              title="Granular Permissions"
              description="Control exactly which metrics each team member can see. Role-based access control built-in."
            />
            <SecurityFeature
              icon={<Shield className="w-6 h-6" />}
              title="SOC 2 Type II"
              description="Independently audited security controls. Your procurement team will approve this."
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Compare to Current Process</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-destructive mb-2">❌ Manual Data Pulls</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Passwords shared in Slack</li>
                  <li>• CSV files emailed around</li>
                  <li>• No audit trail of who accessed what</li>
                  <li>• Data leakage to personal devices</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-medium text-green-600 mb-2">✓ Automated Secure Access</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• OAuth tokens, no password sharing</li>
                  <li>• Encrypted in transit and at rest</li>
                  <li>• Complete audit logs of all access</li>
                  <li>• Instant revocation capability</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ROI for Department Leaders */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Your Personal ROI</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              What getting 15-20 hours back per week means for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">15-20 hrs</div>
              <div className="text-sm font-medium text-foreground mb-2">Per Week Saved</div>
              <p className="text-sm text-muted-foreground">
                No more data chasing. Spend time coaching, strategizing, and leading instead of reporting.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">4-6x</div>
              <div className="text-sm font-medium text-foreground mb-2">More Executive Visibility</div>
              <p className="text-sm text-muted-foreground">
                Show up to leadership meetings with compelling data. Get budget, headcount, and strategic wins.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">$180K+</div>
              <div className="text-sm font-medium text-foreground mb-2">Your Time Value</div>
              <p className="text-sm text-muted-foreground">
                If you're spending 20hrs/week on data work, that's $180K-300K/year of leadership capacity wasted.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">What You Can Do With 15 Hours Back</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Strategic Planning</div>
                    <div className="text-sm text-muted-foreground">
                      Actually think about next quarter instead of reacting to last quarter
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Team Development</div>
                    <div className="text-sm text-muted-foreground">
                      1:1s with direct reports, mentoring, career growth
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Cross-Functional Collaboration</div>
                    <div className="text-sm text-muted-foreground">
                      Build relationships with other departments instead of living in spreadsheets
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Process Improvement</div>
                    <div className="text-sm text-muted-foreground">
                      Fix root causes instead of just tracking symptoms
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Customer/Market Research</div>
                    <div className="text-sm text-muted-foreground">Talk to customers, understand market trends</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Actual Leadership</div>
                    <div className="text-sm text-muted-foreground">
                      The work you were hired to do, not report generation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-8">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stop Being a Report Factory</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get back to leading. Let the system handle the data work.
            </p>
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors inline-flex items-center gap-2">
              See Your Personalized Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-white/70 mt-4">Setup takes 15 minutes. See value in the first week.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProblemStatementCard({ role, icon, statement }: { role: string; icon: React.ReactNode; statement: string }) {
  return (
    <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 rounded-lg p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{role}</h3>
      </div>
      <p className="text-base text-foreground leading-relaxed italic">"{statement}"</p>
    </div>
  )
}

function RoleProblemCard({ role, icon, problems }: { role: string; icon: React.ReactNode; problems: string[] }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground">{role}</h3>
      </div>
      <ul className="space-y-3">
        {problems.map((problem, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="text-destructive mt-0.5">•</span>
            <span>{problem}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CostCard({
  title,
  stat,
  description,
  icon,
}: {
  title: string
  stat: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">{icon}</div>
      <div className="text-2xl font-bold text-foreground mb-2">{stat}</div>
      <div className="text-sm font-medium text-foreground mb-2">{title}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function RoleOutcomeCard({
  role,
  outcomes,
}: { role: string; outcomes: Array<{ title: string; description: string }> }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-border">
        <h3 className="text-xl font-semibold text-foreground">{role}</h3>
      </div>
      <div className="p-6 space-y-4">
        {outcomes.map((outcome, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground mb-1">{outcome.title}</div>
              <p className="text-sm text-muted-foreground">{outcome.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-medium text-foreground mb-1">{title}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function WorkflowStep({ step, text, time }: { step: number; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
        {step}
      </div>
      <div>
        <div className="text-sm font-medium text-foreground mb-1">{text}</div>
        <div className="text-sm text-muted-foreground">({time})</div>
      </div>
    </div>
  )
}
