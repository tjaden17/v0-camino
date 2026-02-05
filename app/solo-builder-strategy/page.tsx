'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Zap, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function SoloBuilderStrategy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-3">Building Solo: Strategy for Non-Technical Founders</h1>
          <p className="text-lg text-muted-foreground">
            How to ship a production product by yourself with realistic constraints and the right tools
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* The Hard Truth */}
        <Card className="mb-8 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">The Hard Truth First</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              <strong>Solo development is hard. Here's what will break:</strong>
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>You cannot build this product end-to-end solo in 3 months at production quality</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>You will hit bugs in production that require 40 hours of debugging to fix</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>You cannot maintain it long-term solo while also running sales, customer success, and operations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>Data integration complexity will overwhelm you; each new data source is 2-3 weeks of work</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>Customer support issues that require code changes will pile up</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Option 1: Cursor AI-Assisted Development */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Option 1: Cursor + Claude/GPT-4 (Recommended Balance)
            </CardTitle>
            <CardDescription>
              AI-assisted development with professional-grade code quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">How It Works:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>You write specifications (what, not how)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Claude generates 80% of the code (Cursor's agent mode)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>You review, test, and fix issues</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Deploy to production with confidence</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Realistic Timeline (Solo):</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 1-2: Setup + Auth</span>
                  <Badge variant="outline">40 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 3-5: Core Dashboard + Data Mapping</span>
                  <Badge variant="outline">80 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 6-8: 2-3 Data Integrations (Stripe, Salesforce, HubSpot)</span>
                  <Badge variant="outline">120 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 9-10: Insight Generation (LLM integration)</span>
                  <Badge variant="outline">60 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 11-12: Testing + Bug Fixes</span>
                  <Badge variant="outline">80 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-primary/20 rounded font-semibold">
                  <span>TOTAL: ~12 weeks</span>
                  <Badge>380 hours</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                At 30 hrs/week: 12-13 weeks. This is realistic assuming you use Cursor effectively.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">What to Expect:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">Code Quality:</span>
                  <span>80-85% (Claude writes good code, but you need to validate patterns)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">Debugging Time:</span>
                  <span>20-30% of dev time (more than with a senior eng, but manageable)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">Production Readiness:</span>
                  <span>Solid MVP, 1-2 critical bugs post-launch (fixable in 1-2 weeks)</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold mb-2">Tools Stack:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Development:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Cursor IDE (AI agent mode)</li>
                    <li>• GitHub Copilot backup</li>
                    <li>• Claude 3.7 Sonnet</li>
                  </ul>
                </div>
                <div>
                  <strong>Infrastructure:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Vercel (Next.js hosting)</li>
                    <li>• Supabase (database)</li>
                    <li>• Upstash (Redis cache)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Success Factor:</strong> Use Cursor's @codebase and @docs features to give Claude context about your entire codebase. This prevents duplicate code and architectural inconsistencies.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Time Commitment</strong>
                  <span className="text-sm text-muted-foreground">30-40 hrs/week for 12-14 weeks (fulltime)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Cost</strong>
                  <span className="text-sm text-muted-foreground">$180/mo (Cursor Pro) + $200/mo (Supabase Pro) + $500/mo (LLM API calls) = ~$900/mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: v0 "Vibe Coding" */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Option 2: v0 + Cursor Hybrid (Fastest to MVP)</CardTitle>
            <CardDescription>
              Use v0 for UI/frontend, Cursor for backend/integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">How It Works:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>v0 generates beautiful, working UI components (70% of frontend)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>You refine v0 components to match your brand/UX</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Cursor builds backend APIs, data integration, LLM pipelines</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Wire them together with simple server actions</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Realistic Timeline (Solo):</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 1-2: Auth + v0 Dashboard UI</span>
                  <Badge variant="outline">30 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 3-4: Data Mapping UI (v0) + Backend (Cursor)</span>
                  <Badge variant="outline">60 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 5-7: Data Integrations (Cursor)</span>
                  <Badge variant="outline">90 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 8-9: Insight Generation + v0 UI</span>
                  <Badge variant="outline">50 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 10-11: Testing + Bug Fixes</span>
                  <Badge variant="outline">60 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-primary/20 rounded font-semibold">
                  <span>TOTAL: ~11 weeks</span>
                  <Badge>290 hours</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <strong>23% faster than pure Cursor.</strong> v0 is really efficient for UI work.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">What to Expect:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">UI Quality:</span>
                  <span>90%+ (v0 is purpose-built for UI; minimal tweaking)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">Backend Quality:</span>
                  <span>75-80% (Claude is good but less for complex logic)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">Time Wasted:</span>
                  <span>Context switching between tools + learning curve</span>
                </li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Risk:</strong> v0 and Cursor generate code in different styles. You'll spend time harmonizing them or dealing with integration friction.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Time Commitment</strong>
                  <span className="text-sm text-muted-foreground">25-35 hrs/week for 10-12 weeks (fulltime+)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Cost</strong>
                  <span className="text-sm text-muted-foreground">$180/mo (Cursor) + $20/mo (v0 pro) + $200/mo (Supabase) + $500/mo (LLM) = ~$900/mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 3: Agencies/Contractors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Option 3: Hybrid - You + Junior Dev (Recommended Actually)</CardTitle>
            <CardDescription>
              One contractor solving your biggest blocker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">The Reality Check:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Honestly? Going fully solo is a trap. You'll spend 60% of your time debugging code, not building product. 
                The best move is hiring <strong>one solid mid-level full-stack engineer</strong> for 3 months, not a team.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Division of Labor:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/30 rounded">
                  <strong className="text-sm">You Focus On:</strong>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Product design & UX (define what to build)</li>
                    <li>• Testing & QA (find bugs before launch)</li>
                    <li>• Customer discovery (talk to users)</li>
                    <li>• Data mapping logic (domain expertise)</li>
                  </ul>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <strong className="text-sm">Dev Focuses On:</strong>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Architecture & scalability</li>
                    <li>• Data integrations & API work</li>
                    <li>• Database design & optimization</li>
                    <li>• DevOps & deployment pipelines</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Timeline With One Dev:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 1-3: MVP Build (both working)</span>
                  <Badge variant="outline">Parallel</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 4-8: Feature Build + You QA</span>
                  <Badge variant="outline">Parallel</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span>Weeks 9-12: Polish + Launch</span>
                  <Badge variant="outline">Together</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-primary/20 rounded font-semibold">
                  <span>TOTAL: 12 weeks (same!)</span>
                  <Badge>Production Ready</Badge>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Why this works:</strong> You move faster together than solo. Dev builds 60% faster. You catch 70% more bugs because you're testing instead of coding. Minus some management overhead, it's a net win.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Your Time Commitment</strong>
                  <span className="text-sm text-muted-foreground">20-30 hrs/week for 12 weeks (part-time possible)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block mb-1">Cost</strong>
                  <span className="text-sm text-muted-foreground">$30-50/hr × 400 hrs = $12-20K (contractor) + $2K infra = ~$14-22K total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Criteria</th>
                    <th className="text-left py-2 px-3 font-semibold">Cursor Solo</th>
                    <th className="text-left py-2 px-3 font-semibold">v0 + Cursor</th>
                    <th className="text-left py-2 px-3 font-semibold">You + Dev</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3">Timeline</td>
                    <td className="py-2 px-3">12-14 weeks</td>
                    <td className="py-2 px-3">10-11 weeks</td>
                    <td className="py-2 px-3">12 weeks (better quality)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Code Quality</td>
                    <td className="py-2 px-3">80%</td>
                    <td className="py-2 px-3">80% (uneven)</td>
                    <td className="py-2 px-3">90%+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Debugging Time</td>
                    <td className="py-2 px-3">25-30%</td>
                    <td className="py-2 px-3">20-25%</td>
                    <td className="py-2 px-3">10-15%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Production Bugs Post-Launch</td>
                    <td className="py-2 px-3">3-5 critical</td>
                    <td className="py-2 px-3">2-4 critical</td>
                    <td className="py-2 px-3">0-2 critical</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Your Time/Week</td>
                    <td className="py-2 px-3">30-40 hrs</td>
                    <td className="py-2 px-3">25-35 hrs</td>
                    <td className="py-2 px-3">20-30 hrs</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Total Cost</td>
                    <td className="py-2 px-3">$900/mo</td>
                    <td className="py-2 px-3">$900/mo</td>
                    <td className="py-2 px-3">$14-22K</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Stress Level</td>
                    <td className="py-2 px-3">Very High</td>
                    <td className="py-2 px-3">High</td>
                    <td className="py-2 px-3">Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* My Recommendation */}
        <Card className="border-primary/30 bg-primary/5 mb-8">
          <CardHeader>
            <CardTitle className="text-primary">My Honest Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">If you have $15-25K budget:</h4>
              <p className="text-sm text-foreground mb-3">
                <strong>Hire one mid-level full-stack dev for 12 weeks (contractor)</strong>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• You get a production-ready product, not a beta</li>
                <li>• You can focus on customers instead of debugging</li>
                <li>• You learn how real code should be written</li>
                <li>• Post-launch, you maintain it (way easier than building it)</li>
                <li>• $14-22K is cheap compared to the value of shipping on time</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">If you only have $0 budget:</h4>
              <p className="text-sm text-foreground mb-3">
                <strong>Cursor Solo (but plan for 6 months, not 3)</strong>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Start with a truly minimal MVP (3-4 data sources max)</li>
                <li>• Use templates and pre-built solutions everywhere possible</li>
                <li>• Plan on 2-3 production incidents in first month</li>
                <li>• You'll spend 50% of your time debugging for 6 months</li>
                <li>• Once stable, it becomes maintainable</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">What I'd Do Personally:</h4>
              <p className="text-sm text-foreground">
                <strong>Start with v0 + Cursor for UI.</strong> Build the absolute MVP (onboarding → dashboard → 1 data source) in 6-8 weeks solo. Then hire a dev to do the data integration work (the hard part). That way you validate product-market fit before spending $20K.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Success Factors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Critical Success Factors (All Paths)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block mb-1">1. Start with a real customer (not a hypothetical one)</strong>
                  <p className="text-xs text-muted-foreground">Get one customer on Day 1 who will test weekly. This keeps you honest about priorities.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block mb-1">2. Use feature flags from Day 1</strong>
                  <p className="text-xs text-muted-foreground">Deploy to production daily. Risk of bugs drops 80% if you can instantly disable features.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block mb-1">3. Automate everything boring</strong>
                  <p className="text-xs text-muted-foreground">Tests, deploys, data backups, monitoring. Spend dev time on product, not ops.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block mb-1">4. Assume every feature will change 3x</strong>
                  <p className="text-xs text-muted-foreground">Don't over-engineer. Build to change. Your customer will tell you the real requirements.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block mb-1">5. Use Cursor's best features</strong>
                  <p className="text-xs text-muted-foreground">@codebase, @docs, agent mode. These turn you into a 2x dev. Learn them week 1.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>If You Choose: Cursor Solo Path (Week-by-week)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Week 1:</strong> Set up Cursor, learn @codebase feature, write detailed spec for MVP (onboarding + 1 data source + dashboard)
              </div>
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Weeks 2-4:</strong> Build onboarding + auth (should be 1-2 weeks)
              </div>
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Weeks 5-8:</strong> Build data mapping + first integration (Stripe). Don't perfect it, just get it working.
              </div>
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Weeks 9-10:</strong> Build dashboard + basic insights (can be dummy data initially)
              </div>
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Weeks 11-12:</strong> Testing + bug fixes. Launch to beta customer.
              </div>
              <div className="p-3 bg-secondary/30 rounded">
                <strong>Weeks 13-16:</strong> Customer feedback + iteration (not part of initial launch, but expect it)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Tools Setup You'll Need</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Development Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>Cursor IDE</strong>
                      <p className="text-xs text-muted-foreground">$20/mo. Essential. Learn agent mode first.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>Claude API</strong>
                      <p className="text-xs text-muted-foreground">Pay-as-you-go. Budget $200-500/mo for LLM calls.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>GitHub + Vercel</strong>
                      <p className="text-xs text-muted-foreground">Free + Pro. Automatic deploys on push.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Infrastructure</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>Supabase</strong>
                      <p className="text-xs text-muted-foreground">$25-100/mo. Database + auth + backups.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>Upstash Redis</strong>
                      <p className="text-xs text-muted-foreground">$20-50/mo. Caching, rate limiting, sessions.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <strong>Sentry + Datadog</strong>
                      <p className="text-xs text-muted-foreground">$30-100/mo. Error tracking + monitoring.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
