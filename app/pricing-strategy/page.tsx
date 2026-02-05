import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ArrowRight, Zap, TrendingUp, Users, Lock, Sparkles } from "lucide-react"

export default function PricingStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Monetization Strategy</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Pricing & Packaging Recommendation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A low-friction, value-driven monetization strategy that converts users naturally through the product
            experience
          </p>
        </div>

        {/* Core Philosophy */}
        <Card className="p-8 mb-12 border-primary/20 bg-card/50 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Pricing Philosophy: "Value Before Payment"
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
              <div className="text-3xl font-bold text-primary mb-2">1. Experience Value First</div>
              <p className="text-sm text-muted-foreground">
                Users see real insights from their data within 24 hours, creating an "aha moment" before any payment
                discussion
              </p>
            </div>

            <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/10">
              <div className="text-3xl font-bold text-secondary mb-2">2. Natural Expansion</div>
              <p className="text-sm text-muted-foreground">
                Users hit meaningful limits that create desire to upgrade, not frustration
              </p>
            </div>

            <div className="bg-accent/5 p-6 rounded-lg border border-accent/10">
              <div className="text-3xl font-bold text-accent mb-2">3. Outcome-Based Pricing</div>
              <p className="text-sm text-muted-foreground">
                Price tied to value delivered (decisions made, time saved, team size) not arbitrary seat limits
              </p>
            </div>
          </div>
        </Card>

        {/* Recommended Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Recommended Pricing Tiers</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Free Trial */}
            <Card className="p-6 border-2 border-muted relative">
              <Badge className="mb-4 bg-muted text-muted-foreground">14-Day Trial</Badge>
              <div className="mb-4">
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">For 14 days</div>
              </div>

              <div className="mb-6">
                <div className="font-semibold mb-2">Full access includes:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Connect 2 data sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>10 tracked metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Daily insights (last 30 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>PDF export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>1 user only</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground italic">No credit card required</div>
            </Card>

            {/* Starter */}
            <Card className="p-6 border-2 border-primary/30 relative">
              <Badge className="mb-4 bg-primary/10 text-primary">Starter</Badge>
              <div className="mb-4">
                <div className="text-4xl font-bold">$199</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <div className="mb-6">
                <div className="font-semibold mb-2">Everything in trial, plus:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Connect 5 data sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>25 tracked metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>6 months historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Up to 3 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Email support</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground">Perfect for: Solo founders, small leadership teams</div>
            </Card>

            {/* Growth */}
            <Card className="p-6 border-2 border-secondary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1">
                MOST POPULAR
              </div>
              <Badge className="mb-4 bg-secondary/10 text-secondary">Growth</Badge>
              <div className="mb-4">
                <div className="text-4xl font-bold">$499</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <div className="mb-6">
                <div className="font-semibold mb-2">Everything in Starter, plus:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Unlimited data sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>50 tracked metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>12 months historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Up to 10 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Custom benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Slack integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground">
                Perfect for: Series A-B companies, full leadership teams
              </div>
            </Card>

            {/* Enterprise */}
            <Card className="p-6 border-2 border-accent relative">
              <Badge className="mb-4 bg-accent/10 text-accent">Enterprise</Badge>
              <div className="mb-4">
                <div className="text-4xl font-bold">Custom</div>
                <div className="text-sm text-muted-foreground">Contact sales</div>
              </div>

              <div className="mb-6">
                <div className="font-semibold mb-2">Everything in Growth, plus:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Unlimited everything</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Custom data pipelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>SSO & advanced security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Dedicated success manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>SLA guarantee</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground">Perfect for: Series C+, large enterprises</div>
            </Card>
          </div>
        </div>

        {/* Pricing Rationale */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-6">Why These Prices Work</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Value Anchoring
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • <strong>$199 Starter:</strong> Less than 1 day of analyst time ({">"}$1K saved per decision)
                </li>
                <li>
                  • <strong>$499 Growth:</strong> Replaces 2-3 days monthly data work (~$5K value)
                </li>
                <li>
                  • <strong>Enterprise:</strong> Saves 40+ hours/month across team (~$15-30K value)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Natural Expansion Path
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • <strong>Trial → Starter:</strong> Add teammates (3 seats)
                </li>
                <li>
                  • <strong>Starter → Growth:</strong> More data sources + history
                </li>
                <li>
                  • <strong>Growth → Enterprise:</strong> Scale team + custom needs
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="font-semibold mb-2">Competitive Positioning:</div>
            <div className="text-sm text-muted-foreground">
              Positioned <strong>20-30% below</strong> traditional BI tools (Tableau $70/user, Looker $3K+/month) but
              <strong> 3-5x higher</strong> than basic dashboards (Databox $72/mo). You're selling strategic insights,
              not just charts.
            </div>
          </div>
        </Card>

        {/* In-App Monetization UX */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">In-App Monetization Experience</h2>

          <div className="space-y-6">
            {/* Onboarding */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">1. Onboarding: Zero Friction Entry</h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    User signs up → Selects role → Connects first data source → Sees insights within 24 hours.
                    <strong> No payment discussion for 14 days.</strong>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="font-mono text-xs mb-2 text-muted-foreground">// UX Implementation</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        ✓ <strong>Day 1:</strong> "Welcome! Let's connect your first data source (2 of 2 remaining)"
                      </div>
                      <div>
                        ✓ <strong>Day 2:</strong> Email: "Your first insights are ready! 🎉"
                      </div>
                      <div>
                        ✓ <strong>Day 7:</strong> In-app: "You've viewed 47 insights this week. See what else you're
                        missing → Explore all categories"
                      </div>
                      <div className="text-muted-foreground italic">
                        → No upgrade prompts yet, just value demonstration
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Natural Limits */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Lock className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">2. Hitting Meaningful Limits</h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    Users encounter limits that create <strong>desire</strong>, not frustration. Limits are tied to
                    "wanting more value" not arbitrary restrictions.
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                      <div className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Good Limits (Create Desire)
                      </div>
                      <ul className="space-y-1 text-xs">
                        <li>• "You've tracked 10/10 metrics. Add more to see full picture"</li>
                        <li>• "Connect HubSpot to see how sales affects churn"</li>
                        <li>• "Invite your Head of Product to see their metrics"</li>
                        <li>• "View 6 more months of trends to spot patterns"</li>
                      </ul>
                    </div>

                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                      <div className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Bad Limits (Create Frustration)
                      </div>
                      <ul className="space-y-1 text-xs">
                        <li>• "You've viewed 50 insights this month" (arbitrary)</li>
                        <li>• "Upgrade to refresh data" (core functionality)</li>
                        <li>• "Pay to export PDF" (expected feature)</li>
                        <li>• "Premium users only" (no context of value)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upgrade Prompts */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">3. Smart Upgrade Prompts</h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    Contextual, value-focused upgrade prompts at moments of high intent.
                  </div>

                  <div className="space-y-3">
                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                      <div className="font-semibold text-sm mb-1">Trigger: User tries to connect 3rd data source</div>
                      <div className="text-xs text-muted-foreground italic mb-2">
                        Intent: High (actively trying to expand)
                      </div>
                      <div className="bg-background p-3 rounded border text-sm">
                        "Great choice! Connecting Google Analytics will show you how product usage affects revenue.
                        <br />
                        Upgrade to Starter ($199/mo) to connect 5 sources + invite 2 teammates."
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" className="h-8">
                            Upgrade Now
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8">
                            Maybe Later
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-secondary">
                      <div className="font-semibold text-sm mb-1">
                        Trigger: User views insight but can't see historical trend
                      </div>
                      <div className="text-xs text-muted-foreground italic mb-2">
                        Intent: Medium (curious but not blocked)
                      </div>
                      <div className="bg-background p-3 rounded border text-sm">
                        "Your MRR grew 47% in the last 30 days! Want to see the 6-month trend?
                        <br />
                        Growth plan includes 12 months of history + custom benchmarks."
                        <div className="mt-2">
                          <a href="#" className="text-primary underline text-sm">
                            Compare plans →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-accent">
                      <div className="font-semibold text-sm mb-1">Trigger: Day 10 of trial, user engaged daily</div>
                      <div className="text-xs text-muted-foreground italic mb-2">
                        Intent: Very High (power user pattern)
                      </div>
                      <div className="bg-background p-3 rounded border text-sm">
                        "You're crushing it! You've viewed 127 insights and exported 3 reports this week.
                        <br />
                        Just 4 days left in your trial. Start your first month at 20% off?"
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                            Get 20% Off
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 bg-transparent">
                            Extend Trial 7 Days
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Team Expansion */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">4. Viral Team Expansion</h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    Make inviting teammates feel like a feature, not an upsell.
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">1️⃣</div>
                        <div>
                          <strong>After user exports their first report:</strong>
                          <br />
                          "Want to share this with your Head of Sales? Invite them to see their metrics in real-time
                          instead of sending PDFs."
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="text-2xl">2️⃣</div>
                        <div>
                          <strong>When user assigns a metric:</strong>
                          <br />
                          "John will get notified via email. Want him to track this in real-time? Invite him to join
                          your workspace."
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="text-2xl">3️⃣</div>
                        <div>
                          <strong>Starter plan hit 3-user limit:</strong>
                          <br />
                          "Your team is growing! 2 teammates are waiting to join. Upgrade to Growth for 10 seats (just
                          $50/user)."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Feature Gating Strategy */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-secondary/5 to-accent/5">
          <h2 className="text-2xl font-bold mb-6">Feature Gating: What to Lock & When</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Trial</th>
                  <th className="text-center py-3 px-4 font-semibold">Starter</th>
                  <th className="text-center py-3 px-4 font-semibold">Growth</th>
                  <th className="text-center py-3 px-4 font-semibold">Enterprise</th>
                  <th className="text-left py-3 px-4 font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 font-medium">Data Sources</td>
                  <td className="text-center py-3 px-4">2</td>
                  <td className="text-center py-3 px-4">5</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Core differentiator - more sources = more complete picture
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Tracked Metrics</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">25</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Natural expansion as user sees value in more metrics
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Historical Data</td>
                  <td className="text-center py-3 px-4">30 days</td>
                  <td className="text-center py-3 px-4">6 months</td>
                  <td className="text-center py-3 px-4">12 months</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Trend analysis becomes critical after initial "aha"
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Team Seats</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Viral growth driver - limits create upgrade pressure
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">PDF Export</td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Never lock - it's a sharing mechanism that drives adoption
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Benchmarks</td>
                  <td className="text-center py-3 px-4">Generic</td>
                  <td className="text-center py-3 px-4">Generic</td>
                  <td className="text-center py-3 px-4">Custom</td>
                  <td className="text-center py-3 px-4">Custom</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Custom benchmarks = premium feature for mature companies
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Slack Integration</td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Team collaboration feature - pairs with more seats
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">API Access</td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Enterprise need only - requires custom support</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <strong className="text-amber-700 dark:text-amber-400">Golden Rule:</strong>
            <span className="text-sm ml-2">
              Never lock core insight viewing. Users should always be able to SEE value, limits are about EXPANDING
              value.
            </span>
          </div>
        </Card>

        {/* Upgrade Psychology */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Upgrade Psychology & Timing</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                High-Intent Moments
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
                  <strong>Moment:</strong> User tries to connect blocked data source
                  <br />
                  <strong>Conversion Rate:</strong> 35-45%
                  <br />
                  <strong>Why:</strong> Active intent + immediate value
                </div>

                <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
                  <strong>Moment:</strong> User invites 4th teammate (over limit)
                  <br />
                  <strong>Conversion Rate:</strong> 40-50%
                  <br />
                  <strong>Why:</strong> Social proof + organizational buy-in
                </div>

                <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
                  <strong>Moment:</strong> Day 10-12 of trial (engaged users)
                  <br />
                  <strong>Conversion Rate:</strong> 25-35%
                  <br />
                  <strong>Why:</strong> Proven value + urgency
                </div>

                <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
                  <strong>Moment:</strong> Board meeting in calendar (detected)
                  <br />
                  <strong>Conversion Rate:</strong> 30-40%
                  <br />
                  <strong>Why:</strong> High-stakes need + timeline pressure
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Low-Intent Moments (Avoid)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-red-500/5 p-3 rounded border-l-4 border-red-500">
                  <strong>Moment:</strong> First login
                  <br />
                  <strong>Problem:</strong> No value demonstrated yet
                  <br />
                  <strong>Result:</strong> Creates negative first impression
                </div>

                <div className="bg-red-500/5 p-3 rounded border-l-4 border-red-500">
                  <strong>Moment:</strong> Every page load (banner)
                  <br />
                  <strong>Problem:</strong> Interrupts workflow, feels desperate
                  <br />
                  <strong>Result:</strong> Banner blindness + annoyance
                </div>

                <div className="bg-red-500/5 p-3 rounded border-l-4 border-red-500">
                  <strong>Moment:</strong> User exploring passively
                  <br />
                  <strong>Problem:</strong> Not actively trying to do anything
                  <br />
                  <strong>Result:</strong> Low conversion + interrupts learning
                </div>

                <div className="bg-red-500/5 p-3 rounded border-l-4 border-red-500">
                  <strong>Moment:</strong> Generic email on Day 3
                  <br />
                  <strong>Problem:</strong> Too early, no behavior data yet
                  <br />
                  <strong>Result:</strong> Ignored or marks as spam
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Email Drip Campaign */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Trial → Paid Conversion Email Sequence</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  1
                </div>
                <div className="w-0.5 h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold mb-1">Day 1: Welcome & Setup</div>
                <div className="text-sm text-muted-foreground mb-2">Subject: "Your insights are generating... 🚀"</div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: Getting them to connect first data source. Show example insights they'll get. No mention of
                  pricing.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-0.5 h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold mb-1">Day 3: First Value Moment</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Subject: "Your CAC increased 23% last month - here's why"
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: Share their most surprising insight. Show the "aha moment". Soft CTA: "Connect more sources to
                  see the full picture"
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  3
                </div>
                <div className="w-0.5 h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold mb-1">Day 7: Social Proof</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Subject: "How [Similar Company] used this insight for their Series B"
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: Case study from similar-stage company. Show specific outcome (raised at 2x valuation, reduced
                  CAC 30%, etc.). CTA: "See what other metrics they track"
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  4
                </div>
                <div className="w-0.5 h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold mb-1">Day 10: Upgrade Prompt</div>
                <div className="text-sm text-muted-foreground mb-2">Subject: "4 days left - start at 20% off?"</div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: Personal usage stats ("You've viewed 87 insights!"). Time-limited discount. CTA: "Start Starter
                  plan at $159/mo (save $480/year)"
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  5
                </div>
                <div className="w-0.5 h-full bg-border mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold mb-1">Day 13: Last Chance</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Subject: "Your trial ends tomorrow - don't lose access"
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: Loss aversion. Show what they'll lose (insights go away, teammates lose access). CTA: "Keep
                  your data for just $6.50/day"
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  6
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Day 16: Re-engagement (if not converted)</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Subject: "Want to extend your trial for 7 days?"
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded">
                  Focus: No-pressure extension offer. Ask for feedback on why they didn't convert. CTA: "Continue trial"
                  or "Book a call to discuss"
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-accent/5 to-primary/5">
          <h2 className="text-2xl font-bold mb-6">Implementation Roadmap</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6 py-2">
              <div className="font-bold mb-2">Phase 1: Launch (Week 1-2)</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Set up 14-day trial with email signup (no credit card)</li>
                <li>• Implement hard limits: 2 data sources, 10 metrics, 1 user, 30 days history</li>
                <li>• Build basic upgrade modal that appears when hitting limits</li>
                <li>• Stripe integration for payment processing</li>
                <li>• Basic email sequence (Days 1, 7, 13)</li>
              </ul>
              <div className="mt-2 text-xs">
                <strong>Goal:</strong> Get first 5-10 paying customers with manual white-glove service
              </div>
            </div>

            <div className="border-l-4 border-secondary pl-6 py-2">
              <div className="font-bold mb-2">Phase 2: Optimize (Week 3-6)</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Add contextual upgrade prompts (connect 3rd source, invite teammate, view history)</li>
                <li>• Implement usage tracking to identify high-intent moments</li>
                <li>• A/B test discount offers (20% vs extended trial vs no discount)</li>
                <li>• Build team invitation flow with viral messaging</li>
                <li>• Add Growth tier with custom benchmarks</li>
              </ul>
              <div className="mt-2 text-xs">
                <strong>Goal:</strong> 15-20% trial-to-paid conversion rate
              </div>
            </div>

            <div className="border-l-4 border-accent pl-6 py-2">
              <div className="font-bold mb-2">Phase 3: Scale (Month 3-6)</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Implement seat-based expansion tracking and prompts</li>
                <li>• Build self-service upgrade path (no sales call required)</li>
                <li>• Add annual billing option with 15-20% discount</li>
                <li>• Create Enterprise tier with custom pricing</li>
                <li>• Implement churn prevention: usage drop alerts, win-back campaigns</li>
              </ul>
              <div className="mt-2 text-xs">
                <strong>Goal:</strong> 20-25% trial-to-paid conversion, 110-120% net revenue retention
              </div>
            </div>
          </div>
        </Card>

        {/* Success Metrics */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <h2 className="text-2xl font-bold mb-6">Success Metrics to Track</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Acquisition</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Trial signup rate</span>
                  <strong>{">"}40%</strong>
                </li>
                <li className="flex justify-between">
                  <span>Time to first insight</span>
                  <strong>{"<"}24h</strong>
                </li>
                <li className="flex justify-between">
                  <span>Data source connection</span>
                  <strong>{">"}80%</strong>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-secondary">Activation & Conversion</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Trial-to-paid</span>
                  <strong>15-25%</strong>
                </li>
                <li className="flex justify-between">
                  <span>Time to upgrade</span>
                  <strong>8-10 days</strong>
                </li>
                <li className="flex justify-between">
                  <span>Team invite rate</span>
                  <strong>{">"}30%</strong>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-accent">Retention & Expansion</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Monthly churn</span>
                  <strong>{"<"}3%</strong>
                </li>
                <li className="flex justify-between">
                  <span>Net revenue retention</span>
                  <strong>{">"}110%</strong>
                </li>
                <li className="flex justify-between">
                  <span>Upsell rate (tier jump)</span>
                  <strong>20-30%</strong>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
