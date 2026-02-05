"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, ArrowRight, Database, Users, Target, Settings } from "lucide-react"

export default function OnboardingSpecPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-primary">Onboarding Flow Specification</h1>
          <p className="text-muted-foreground mt-2">Complete technical specification for user onboarding experience</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Executive Summary */}
        <Card className="p-8 mb-8 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Purpose:</strong> Capture user context and personalize their metric
              dashboard based on role, goals, and outcomes within 2-3 minutes.
            </p>
            <p>
              <strong className="text-foreground">User Journey:</strong> Tell me about yourself → Select smart metrics
              → Enter dashboard
            </p>
            <p>
              <strong className="text-foreground">Success Criteria:</strong> {'>'} 80% completion rate, {'<'} 3 min time-to-value,
              accurate metric recommendations
            </p>
          </div>
        </Card>

        {/* Flow Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-primary" />
            Flow Overview
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg">User Story</h3>
                  <Badge variant="outline" className="mt-1">30-60 seconds</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Select role (16 options)</li>
                <li>• Select goal (role-specific)</li>
                <li>• Select outcome (role-specific)</li>
                <li>• Creates personalized context</li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg">Smart Metrics</h3>
                  <Badge variant="outline" className="mt-1">60-90 seconds</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• View role-based recommendations</li>
                <li>• Review lagging metrics</li>
                <li>• Review leading metrics</li>
                <li>• Add additional metrics (optional)</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Step 1 Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Step 1: User Story
          </h2>

          <Card className="p-8 mb-6">
            <h3 className="text-xl font-bold mb-4">User Interface</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Layout</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Mobile-first design, centered layout, max-width 448px</li>
                  <li>• Header: Logo (left) + Auth buttons (right)</li>
                  <li>• Progress indicator: 2 dots (Step 1 active)</li>
                  <li>• Main heading: "Tell me about yourself"</li>
                  <li>• Example card showing completed statement format</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Form Fields</h4>
                <div className="space-y-4 ml-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm mb-2">1. Role Selection</p>
                    <p className="text-xs text-muted-foreground">Dropdown with 16 role options: CEO, CTO, CPO, Product Manager, Engineering Manager, Design Lead, Sales Manager, Marketing Manager, Customer Success Manager, Finance Manager, Delivery Manager, Product Analyst, Product Designer, Data Analyst, Data Scientist, UX Researcher, Sales Rep</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm mb-2">2. Goal Selection (Dynamic)</p>
                    <p className="text-xs text-muted-foreground">Populated based on selected role. 4-5 options per role. Example for Product Manager: "improve retention", "increase engagement", "optimize adoption funnels", "improve CSAT"</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm mb-2">3. Outcome Selection (Dynamic)</p>
                    <p className="text-xs text-muted-foreground">Populated based on selected role. 3-4 options per role. Example for Product Manager: "we solve customer problems", "we drive product growth", "we improve user satisfaction"</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Validation</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• All three fields required</li>
                  <li>• Continue button disabled until complete</li>
                  <li>• No error messages needed (progressive disclosure)</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h3 className="text-xl font-bold mb-4">Data Captured</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Field</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Storage</th>
                    <th className="text-left py-3 px-4 font-semibold">Usage</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3 px-4">selectedRole</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">localStorage, DB</td>
                    <td className="py-3 px-4">Metric recommendations</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">selectedGoal</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">localStorage, DB</td>
                    <td className="py-3 px-4">User context string</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">selectedOutcome</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">localStorage, DB</td>
                    <td className="py-3 px-4">User context string</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">userContext</td>
                    <td className="py-3 px-4">string (composed)</td>
                    <td className="py-3 px-4">localStorage</td>
                    <td className="py-3 px-4">Profile display</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-bold mb-4">Technical Implementation</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// State Management</p>
                <p>const [selectedRole, setSelectedRole] = useState("")</p>
                <p>const [selectedGoal, setSelectedGoal] = useState("")</p>
                <p>const [selectedOutcome, setSelectedOutcome] = useState("")</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// Role Configuration Lookup</p>
                <p>const roleConfig = roleConfigurations[selectedRole]</p>
                <p>const goalOptions = roleConfig?.defaultGoals || []</p>
                <p>const outcomeOptions = roleConfig?.defaultOutcomes || []</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// Context String Composition</p>
                <p>{`const context = \`I am a \${selectedRole}. I want to \${selectedGoal} so that \${selectedOutcome}.\``}</p>
                <p>localStorage.setItem("camino-user-context", context)</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Step 2 Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Step 2: Smart Metrics
          </h2>

          <Card className="p-8 mb-6">
            <h3 className="text-xl font-bold mb-4">User Interface</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Layout</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Same header as Step 1</li>
                  <li>• Progress indicator: 2 dots (Step 2 active)</li>
                  <li>• Title: "Your Smart Metrics"</li>
                  <li>• Subtitle: "Based on your role and goals" + "You can customize this later"</li>
                  <li>• Scrollable content area with fixed bottom navigation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Metric Display</h4>
                <div className="space-y-4 ml-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Lagging Metrics Section
                    </p>
                    <p className="text-xs text-muted-foreground">Company-level goals and outcomes. 2-5 cards per role. Each card shows: metric name, description, checkbox (selected by default)</p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      Leading Metrics Section
                    </p>
                    <p className="text-xs text-muted-foreground">Leading indicators of lagging metrics. 3-8 cards per role. Each card shows: metric name, description, checkbox (selected by default)</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Other Metrics (Collapsible)
                    </p>
                    <p className="text-xs text-muted-foreground">Expandable section with all metrics from other roles. Organized by lagging/leading. Users can add additional metrics. Shows count of available metrics.</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Interactions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Click card to toggle selection</li>
                  <li>• Selected cards: primary border + background tint + checkmark</li>
                  <li>• Unselected cards: muted border + empty circle</li>
                  <li>• Click "Add Other Metrics" to expand additional options</li>
                  <li>• Back button returns to Step 1</li>
                  <li>• Continue button disabled if no metrics selected</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h3 className="text-xl font-bold mb-4">Data Captured</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Field</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Storage</th>
                    <th className="text-left py-3 px-4 font-semibold">Usage</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3 px-4">selectedMetrics</td>
                    <td className="py-3 px-4">Set{`<string>`}</td>
                    <td className="py-3 px-4">Component state</td>
                    <td className="py-3 px-4">Track user selections</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">camino-selected-metrics</td>
                    <td className="py-3 px-4">string[] (JSON)</td>
                    <td className="py-3 px-4">localStorage</td>
                    <td className="py-3 px-4">Persist across sessions</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">metricRecommendations</td>
                    <td className="py-3 px-4">MetricRecommendation[]</td>
                    <td className="py-3 px-4">Passed to onNext()</td>
                    <td className="py-3 px-4">Full metric details</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="font-semibold text-sm mb-2">MetricRecommendation Interface</p>
              <div className="font-mono text-xs space-y-1 text-muted-foreground">
                <p>{`{ name: string`}</p>
                <p>{`  description: string`}</p>
                <p>{`  category: "lagging" | "leading"`}</p>
                <p>{`  requiredDatasets: string[]`}</p>
                <p>{`  decisionsEnabled: string[] }`}</p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-bold mb-4">Technical Implementation</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// Fetch role-based metrics</p>
                <p>const allMetrics = getMetricsByRole(role)</p>
                <p>const laggingMetrics = allMetrics.filter(m ={'>'} m.category === "lagging")</p>
                <p>const leadingMetrics = allMetrics.filter(m ={'>'} m.category === "leading")</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// Get other available metrics</p>
                <p>const roleMetricNames = new Set(allMetrics.map(m ={'>'} m.name))</p>
                <p>const otherMetrics = getAllAvailableMetrics()</p>
                <p>  .filter(m ={'>'} !roleMetricNames.has(m.name))</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
                <p className="text-muted-foreground mb-2">// Save and navigate</p>
                <p>const selected = allAvailable.filter(m ={'>'} selectedMetrics.has(m.name))</p>
                <p>localStorage.setItem("camino-selected-metrics", JSON.stringify(metricNames))</p>
                <p>router.push("/insights")</p>
              </div>
            </div>
          </Card>
        </section>

        {/* User Profile Creation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Profile Creation
          </h2>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Profile Data Structure</h4>
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-1">
                  <p>{`saveUserProfile({`}</p>
                  <p className="ml-4">{`id: "user-\${Date.now()}",`}</p>
                  <p className="ml-4">{`name: "User",`}</p>
                  <p className="ml-4">{`email: "user@example.com",`}</p>
                  <p className="ml-4">{`userType: "elt" | "manager" | "ic",`}</p>
                  <p className="ml-4">{`role: UserRole,`}</p>
                  <p className="ml-4">{`groups: UserGroup[],`}</p>
                  <p className="ml-4">{`permissions: UserPermission[],`}</p>
                  <p className="ml-4">{`context: string,`}</p>
                  <p className="ml-4">{`createdAt: ISO string`}</p>
                  <p>{`})`}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Permission Assignment Logic</h4>
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
                  <p>• <strong>ELT roles</strong> (CEO, CTO, CPO): ["view", "edit", "request"]</p>
                  <p>• <strong>Manager roles</strong>: ["view", "edit"]</p>
                  <p>• <strong>IC roles</strong>: ["view"]</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Trial Subscription Setup</h4>
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-1">
                  <p>{`updateUserSubscription({`}</p>
                  <p className="ml-4">{`planType: "team",`}</p>
                  <p className="ml-4">{`status: "trial",`}</p>
                  <p className="ml-4">{`trialEndsAt: +30 days,`}</p>
                  <p className="ml-4">{`signalsUsed: 0,`}</p>
                  <p className="ml-4">{`datasetsUsed: 0`}</p>
                  <p>{`})`}</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Success Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Success Metrics & KPIs
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-primary mb-2">{'>'} 80%</p>
              <p className="text-xs text-muted-foreground">Users who start onboarding and reach the dashboard</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Time to Value</h3>
              <p className="text-3xl font-bold text-primary mb-2">{'<'} 3 min</p>
              <p className="text-xs text-muted-foreground">Average time from start to dashboard entry</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Metric Selection</h3>
              <p className="text-3xl font-bold text-primary mb-2">5-12</p>
              <p className="text-xs text-muted-foreground">Average number of metrics selected per user</p>
            </Card>
          </div>

          <Card className="p-8 mt-6">
            <h3 className="text-xl font-bold mb-4">Drop-off Points to Monitor</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Circle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Step 1 abandonment:</strong> Users who don't complete role/goal/outcome selection. Target {'<'} 15% drop-off.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Circle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Step 2 confusion:</strong> Users who deselect all metrics or spend {'>'} 2 min without action. Target {'<'} 10% confusion rate.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Circle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Back button usage:</strong> Users who return to Step 1. Target {'<'} 20% back-navigation.
                </div>
              </li>
            </ul>
          </Card>
        </section>

        {/* Edge Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Edge Cases & Error Handling</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                No Metrics Selected
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                User deselects all recommended metrics
              </p>
              <div className="p-3 bg-muted/50 rounded text-sm">
                <strong>Behavior:</strong> Continue button disabled. No error message. User cannot proceed with 0 metrics.
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Badge variant="outline">Medium</Badge>
                localStorage Not Available
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Private browsing or localStorage disabled
              </p>
              <div className="p-3 bg-muted/50 rounded text-sm">
                <strong>Behavior:</strong> Use in-memory state only. Show warning banner: "Some features may not persist. Please enable cookies."
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Badge variant="outline">Low</Badge>
                Returning User
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                User already has profile and metrics saved
              </p>
              <div className="p-3 bg-muted/50 rounded text-sm">
                <strong>Behavior:</strong> Skip onboarding, redirect directly to /insights. Option to edit profile in settings.
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Badge variant="outline">Low</Badge>
                Back Button from Step 2
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                User clicks Back on Smart Metrics screen
              </p>
              <div className="p-3 bg-muted/50 rounded text-sm">
                <strong>Behavior:</strong> Return to Step 1 with all previous selections preserved. User can change role/goal/outcome.
              </div>
            </Card>
          </div>
        </section>

        {/* Technical Dependencies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Technical Dependencies</h2>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Required Files</h4>
                <ul className="space-y-2 text-sm text-muted-foreground font-mono">
                  <li>• components/onboarding-screen.tsx</li>
                  <li>• components/smart-metrics-screen.tsx</li>
                  <li>• lib/role-config.ts</li>
                  <li>• lib/metrics-by-role.ts</li>
                  <li>• lib/user-utils.ts</li>
                  <li>• lib/types.ts</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">External Dependencies</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js App Router (navigation)</li>
                  <li>• React hooks (useState)</li>
                  <li>• shadcn/ui components (Button, Select, Card)</li>
                  <li>• localStorage API (browser)</li>
                  <li>• lucide-react icons</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">Data Flows</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-muted/50 rounded">
                    <p className="font-medium mb-1">Step 1 → Step 2</p>
                    <p className="text-muted-foreground">Pass role string to SmartMetricsScreen via props</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <p className="font-medium mb-1">Step 2 → Dashboard</p>
                    <p className="text-muted-foreground">Call onNext(selectedMetrics), save to localStorage, navigate to /insights</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <p className="font-medium mb-1">Profile Creation</p>
                    <p className="text-muted-foreground">saveUserProfile() + updateUserSubscription() on completion</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Future Enhancements */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Future Enhancements (Post-MVP)</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold mb-3">Email & Name Collection</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Add email/name fields after metrics selection for personalization and communication
              </p>
              <Badge variant="outline">Phase 2</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Team Invitation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Allow users to invite teammates during onboarding with role pre-selection
              </p>
              <Badge variant="outline">Phase 2</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Metric Preview</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Show sample dashboard preview with selected metrics before completion
              </p>
              <Badge variant="outline">Phase 3</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Onboarding Analytics</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Track time spent per step, drop-off points, and metric selection patterns
              </p>
              <Badge variant="outline">Phase 2</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">A/B Testing Framework</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test variations of copy, flow order, and default selections
              </p>
              <Badge variant="outline">Phase 3</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Skip Option</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Allow power users to skip onboarding and configure manually
              </p>
              <Badge variant="outline">Phase 3</Badge>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
