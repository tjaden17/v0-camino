"use client"

import { ArrowRight, Clock, DollarSign, TrendingDown, AlertCircle, Target, CheckCircle } from "lucide-react"

export default function SalesPitchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">The $2M Decision-Making Problem</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            How scaling tech companies lose millions in slow, low-quality data insights
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* The Problem Statement */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <h2 className="text-3xl font-bold text-foreground">The Problem</h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>For CXOs of scaling tech companies,</strong> who need to make mission-critical decisions (increase
              revenue, decrease costs, improve profit)...
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              <strong>When validating decisions</strong> or forming their own...
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              <strong>They face issues with:</strong>
            </p>
            <ul className="space-y-2 ml-6">
              <li className="text-lg text-muted-foreground flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Slow access to critical data (7-14 day delays)</span>
              </li>
              <li className="text-lg text-muted-foreground flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Low quality, incomplete insights</span>
              </li>
              <li className="text-lg text-muted-foreground flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>18-25% gaps between actual and predicted results</span>
              </li>
              <li className="text-lg text-muted-foreground flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>30-40% cost overruns on strategic initiatives</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Market Size */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Market Opportunity</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="text-sm font-medium text-primary mb-2">TAM</div>
              <div className="text-3xl font-bold text-foreground mb-2">$4-15B</div>
              <div className="text-sm text-muted-foreground">
                ~1M CXOs globally at tech companies with 50+ employees
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-6">
              <div className="text-sm font-medium text-secondary mb-2">SAM</div>
              <div className="text-3xl font-bold text-foreground mb-2">$2B</div>
              <div className="text-sm text-muted-foreground">~200K CXOs at Series A-D companies with acute pain</div>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6">
              <div className="text-sm font-medium text-accent mb-2">SOM (Year 1-3)</div>
              <div className="text-3xl font-bold text-foreground mb-2">$10-40M</div>
              <div className="text-sm text-muted-foreground">1,000-4,000 CXOs at 0.5-2% penetration</div>
            </div>
          </div>
        </section>

        {/* Current Workflow */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-foreground">The Current Workflow</h2>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              <WorkflowStep
                number={1}
                title="Decision Triggered"
                description="CXO identifies need (e.g., board prep for market expansion)"
                time="1 hour"
                teamTime="2 hours"
              />
              <WorkflowStep
                number={2}
                title="Data Collection"
                description="Team manually pulls data from multiple web-based systems"
                time="0.5 hours"
                teamTime="12-16 hours"
                highlight
              />
              <WorkflowStep
                number={3}
                title="Analysis & Synthesis"
                description="Team analyzes data and creates insights"
                time="1 hour"
                teamTime="8-12 hours"
                highlight
              />
              <WorkflowStep
                number={4}
                title="Alignment & Iteration"
                description="2-3 rounds of collaboration to align understanding"
                time="3-4 hours"
                teamTime="6-8 hours"
                highlight
              />
              <WorkflowStep
                number={5}
                title="Deck Creation"
                description="Consolidate insights into presentation format"
                time="1 hour"
                teamTime="4-6 hours"
              />
              <div className="bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total Time per Decision</div>
                    <div className="text-2xl font-bold text-foreground">39-51.5 hours</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-1">CXO Time</div>
                    <div className="text-2xl font-bold text-primary">6.5-7.5 hrs</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Team Time</div>
                    <div className="text-2xl font-bold text-secondary">32-44 hrs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Impact */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-foreground">The Cost of This Problem</h2>
          </div>

          <div className="space-y-6">
            {/* Per Decision Cost */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Per CXO Annual Cost</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Decision frequency per year</span>
                  <span className="text-lg font-semibold text-foreground">150-200 decisions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CXO time cost ($200-400/hr)</span>
                  <span className="text-lg font-semibold text-foreground">$240K-480K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Team time cost ($75-150/hr)</span>
                  <span className="text-lg font-semibold text-foreground">$900K-1.8M</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total annual labor cost</span>
                  <span className="text-2xl font-bold text-destructive">$1.14M-2.28M</span>
                </div>
              </div>
            </div>

            {/* Opportunity Cost */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <TrendingDown className="w-8 h-8 text-destructive mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Decision Delays</h3>
                <div className="text-3xl font-bold text-destructive mb-2">$2-5M</div>
                <p className="text-sm text-muted-foreground">
                  Lost revenue per quarter from delayed market entry and competitive disadvantage
                </p>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Poor Data Quality</h3>
                <div className="text-3xl font-bold text-destructive mb-2">$7.5-12.5M</div>
                <p className="text-sm text-muted-foreground">Annual cost for a $50M ARR company (15-25% of revenue)</p>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Actual vs. Predicted Gaps</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Revenue projection miss</span>
                  <span className="text-lg font-semibold text-destructive">18-25%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Cost overruns</span>
                  <span className="text-lg font-semibold text-destructive">30-40%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Timeline slippage</span>
                  <span className="text-lg font-semibold text-destructive">2-3x longer</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                <p className="text-sm text-muted-foreground mb-2">Example: $5M Market Expansion</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Excess cost from poor data:</span>
                  <span className="text-xl font-bold text-destructive">$1.5-2M</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-foreground">The Solution Impact</h2>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Time Savings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Before</span>
                    <span className="text-lg text-destructive line-through">40-50 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">After</span>
                    <span className="text-lg font-semibold text-green-600">4-6 hours</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-2xl font-bold text-green-600">90% reduction</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Accuracy Improvement</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Before</span>
                    <span className="text-lg text-destructive">75-82% accurate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">After</span>
                    <span className="text-lg font-semibold text-green-600">90-95% accurate</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-2xl font-bold text-green-600">+13-15 points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Workflow */}
          <div className="bg-card border border-border rounded-lg overflow-hidden mt-8">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">How the Solution Works</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">One-Time Setup (15 minutes)</h4>
                  <p className="text-muted-foreground mb-3">
                    CXO selects their role and important metrics during onboarding. System recommends relevant lagging
                    and leading metrics based on role.
                  </p>
                  <div className="text-sm text-green-600 font-medium">Replaces: Hours of meetings to define KPIs</div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">Connect Data Sources (One Time)</h4>
                  <p className="text-muted-foreground mb-3">
                    Connect to existing systems (Salesforce, HubSpot, Google Analytics, etc.) via OAuth. Can delegate to
                    team members or self-serve.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Replaces: Repeated manual data extraction every decision
                  </div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">Automatic Insight Generation</h4>
                  <p className="text-muted-foreground mb-3">
                    System continuously monitors connected data sources and generates insights, benchmarks, and alerts
                    in real-time. No manual refresh needed.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Replaces: 12-16 hours of data collection + 8-12 hours of analysis
                  </div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">Receive Personalized Signals</h4>
                  <p className="text-muted-foreground mb-3">
                    Dashboard shows only metrics relevant to your role and goals. Filter by recommended signals,
                    benchmarks, or assigned metrics. Get context-aware alerts.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Replaces: Hours sorting through irrelevant reports
                  </div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">Export for Decisions</h4>
                  <p className="text-muted-foreground mb-3">
                    One-click export of curated insights for board presentations, strategic planning, or stakeholder
                    updates. Includes analysis, implications, and recommended actions.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Replaces: 4-6 hours of deck creation per decision
                  </div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2">Continuous Monitoring</h4>
                  <p className="text-muted-foreground mb-3">
                    System tracks metric changes and sends proactive alerts when thresholds are crossed or anomalies
                    detected. Always know before problems become crises.
                  </p>
                  <div className="text-sm text-green-600 font-medium">Replaces: Reactive firefighting</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border-t border-green-200 dark:border-green-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Total Time from Decision to Insights
                  </div>
                  <div className="text-2xl font-bold text-foreground">Minutes, not weeks</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground mb-1">CXO Effort Required</div>
                  <div className="text-2xl font-bold text-green-600">30 min/month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Minimization */}
          <div className="bg-card border border-border rounded-lg overflow-hidden mt-8">
            <div className="bg-blue-50 dark:bg-blue-950/20 px-6 py-4 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">How We Minimize Data Connection & Access Risks</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enterprise-grade security and compliance built in from day one
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Security Measures Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">OAuth 2.0 Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        No passwords stored. Secure token-based access that can be revoked instantly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Granular Permissions</h4>
                      <p className="text-sm text-muted-foreground">
                        You control exactly what data is accessed. Read-only by default. No write access to your
                        systems.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Zero Permanent Storage</h4>
                      <p className="text-sm text-muted-foreground">
                        We query data on-demand and cache only aggregated metrics. Your raw data never leaves your
                        systems.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">End-to-End Encryption</h4>
                      <p className="text-sm text-muted-foreground">
                        All data in transit uses TLS 1.3. All data at rest encrypted with AES-256.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Role-Based Access Control</h4>
                      <p className="text-sm text-muted-foreground">
                        Team members only see metrics relevant to their role. Admins control who sees what.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Complete Audit Logs</h4>
                      <p className="text-sm text-muted-foreground">
                        Track every access, every query, every export. Full transparency for compliance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">SOC 2 Type II Compliant</h4>
                      <p className="text-sm text-muted-foreground">
                        Independently audited for security, availability, and confidentiality.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">GDPR & CCPA Ready</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in data privacy controls. Right to access, delete, and export all data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="border border-border rounded-lg overflow-hidden mt-6">
                <div className="bg-muted px-4 py-3">
                  <h4 className="font-semibold text-foreground">Risk Comparison: Manual Process vs. Our Solution</h4>
                </div>
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50">
                    <div className="font-medium text-sm text-foreground">Risk Factor</div>
                    <div className="font-medium text-sm text-destructive">Current Manual Process</div>
                    <div className="font-medium text-sm text-green-600">With Our Solution</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="text-sm text-foreground">Password sharing</div>
                    <div className="text-sm text-destructive">Team members share admin passwords via Slack/email</div>
                    <div className="text-sm text-green-600">
                      Zero password sharing. OAuth tokens only, revocable anytime
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20">
                    <div className="text-sm text-foreground">Access control</div>
                    <div className="text-sm text-destructive">
                      Broad access needed to pull reports from multiple systems
                    </div>
                    <div className="text-sm text-green-600">
                      Minimum permissions, read-only, scoped to specific data
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="text-sm text-foreground">Data leakage</div>
                    <div className="text-sm text-destructive">
                      CSVs and spreadsheets emailed, shared in Slack, stored locally
                    </div>
                    <div className="text-sm text-green-600">
                      No raw data export. Only aggregated insights, encrypted in transit
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20">
                    <div className="text-sm text-foreground">Audit trail</div>
                    <div className="text-sm text-destructive">No visibility into who accessed what data when</div>
                    <div className="text-sm text-green-600">Complete audit logs. Every query tracked and logged</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="text-sm text-foreground">Compliance</div>
                    <div className="text-sm text-destructive">
                      Manual processes hard to audit, fails compliance reviews
                    </div>
                    <div className="text-sm text-green-600">SOC 2, GDPR, CCPA compliant out of the box</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20">
                    <div className="text-sm text-foreground">Access revocation</div>
                    <div className="text-sm text-destructive">
                      When employees leave, difficult to track all shared credentials
                    </div>
                    <div className="text-sm text-green-600">
                      One-click revocation. Immediate deactivation of all access
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Statement */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-foreground mb-3">Enterprise Trust Guarantee</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  We understand that connecting to your business-critical systems requires trust. That's why we:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Undergo annual third-party security audits (SOC 2 Type II)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Maintain 99.9% uptime SLA with financially-backed guarantees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Provide transparent documentation of all data access patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Offer dedicated security reviews for enterprise customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Support SSO, SAML, and custom authentication for enterprise deployments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-primary text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Return on Investment</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-2">Current Annual Cost</div>
                <div className="text-3xl font-bold">$1.14M-2.28M</div>
                <div className="text-sm opacity-75 mt-1">per CXO</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Solution Cost</div>
                <div className="text-3xl font-bold">$60K-120K</div>
                <div className="text-sm opacity-75 mt-1">per year</div>
              </div>
              <div className="border-l border-white/20 pl-6">
                <div className="text-sm opacity-90 mb-2">Net Savings</div>
                <div className="text-3xl font-bold text-green-300">$1M-2.16M</div>
                <div className="text-sm opacity-75 mt-1">10-20x ROI</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-lg">Payback Period</span>
                <span className="text-2xl font-bold text-green-300">&lt; 1 month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12">
          <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Eliminate the $2M Problem?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join leading tech companies in transforming how executives make data-driven decisions
            </p>
            <button className="bg-white text-primary hover:bg-white/90 font-semibold py-4 px-8 rounded-lg text-lg inline-flex items-center gap-3 transition-colors">
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

interface WorkflowStepProps {
  number: number
  title: string
  description: string
  time: string
  teamTime: string
  highlight?: boolean
}

function WorkflowStep({ number, title, description, time, teamTime, highlight }: WorkflowStepProps) {
  return (
    <div className={`p-6 ${highlight ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}`}>
      <div className="flex gap-6">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            highlight ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">CXO: </span>
              <span className="font-medium text-foreground">{time}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Team: </span>
              <span className="font-medium text-foreground">{teamTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
