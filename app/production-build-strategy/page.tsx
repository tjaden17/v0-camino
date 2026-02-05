'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Lock, Zap, Users, GitBranch, Shield } from 'lucide-react';

export default function ProductionBuildStrategy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Production Build Strategy
          </h1>
          <p className="text-xl text-purple-200">
            Balancing Technical Skills, Code Rigor & Shipping Speed
          </p>
          <p className="text-sm text-purple-300 mt-4">
            A framework for building production-ready SaaS with realistic constraints
          </p>
        </div>

        {/* Core Principle */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-purple-400" />
            Core Strategy: "Leverage Frameworks, Focus on Differentiation"
          </h2>
          <p className="text-lg leading-relaxed">
            Don't build infrastructure. Use managed services. Don't optimize prematurely. Don't hire a big team. 
            Hire specialists for critical paths. Spend 80% of time on your unique insight generation service. 
            Spend 20% on everything else using opinionated tools.
          </p>
        </div>

        {/* Section 1: Technology Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-400" />
            1. Technology Stack (Pre-chosen to minimize complexity)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frontend */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Frontend</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Framework: Next.js 16 (App Router)</p>
                  <p className="text-sm text-slate-300">Why: TypeScript by default, Server Actions, built-in auth</p>
                </div>
                <div>
                  <p className="font-semibold">UI: Shadcn/ui + Tailwind v4</p>
                  <p className="text-sm text-slate-300">Why: Copy-paste components, pre-styled, accessibility built-in</p>
                </div>
                <div>
                  <p className="font-semibold">State: SWR + React Context</p>
                  <p className="text-sm text-slate-300">Why: Minimal setup, auto-refresh, caching out of box</p>
                </div>
                <div>
                  <p className="font-semibold">Forms: React Hook Form</p>
                  <p className="text-sm text-slate-300">Why: Minimal re-renders, small bundle, validation built-in</p>
                </div>
              </div>
            </div>

            {/* Backend */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Backend</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Runtime: Next.js API Routes + Server Actions</p>
                  <p className="text-sm text-slate-300">Why: No separate backend needed, TypeScript everywhere, fast deploys</p>
                </div>
                <div>
                  <p className="font-semibold">Database: Supabase PostgreSQL</p>
                  <p className="text-sm text-slate-300">Why: Row-level security, auth built-in, REST API included, good free tier</p>
                </div>
                <div>
                  <p className="font-semibold">ORM: Drizzle (not Prisma)</p>
                  <p className="text-sm text-slate-300">Why: TypeScript-first, better for Server Actions, simpler migrations</p>
                </div>
                <div>
                  <p className="font-semibold">Background Jobs: Vercel Cron + Queues</p>
                  <p className="text-sm text-slate-300">Why: No infrastructure, integrated with Vercel, pay per execution</p>
                </div>
              </div>
            </div>

            {/* AI/LLM */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">AI/LLM Layer</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">SDK: Vercel AI SDK v6</p>
                  <p className="text-sm text-slate-300">Why: Unified API, provider switching, streaming built-in</p>
                </div>
                <div>
                  <p className="font-semibold">Provider: Vercel AI Gateway (default)</p>
                  <p className="text-sm text-slate-300">Why: Built-in rate limiting, fallbacks, better pricing than direct API</p>
                </div>
                <div>
                  <p className="font-semibold">Backup: Anthropic Claude (direct)</p>
                  <p className="text-sm text-slate-300">Why: Best reasoning for insight generation, pay-as-you-go</p>
                </div>
              </div>
            </div>

            {/* DevOps */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">DevOps/Infrastructure</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Hosting: Vercel (always)</p>
                  <p className="text-sm text-slate-300">Why: Next.js optimized, zero-config deployments, auto-scaling</p>
                </div>
                <div>
                  <p className="font-semibold">Database: Supabase (managed)</p>
                  <p className="text-sm text-slate-300">Why: No DB ops needed, automatic backups, replication built-in</p>
                </div>
                <div>
                  <p className="font-semibold">Monitoring: Vercel Analytics + LogDrain</p>
                  <p className="text-sm text-slate-300">Why: Built-in, no setup, Slack alerts available</p>
                </div>
                <div>
                  <p className="font-semibold">CDN: Vercel Edge Network (included)</p>
                  <p className="text-sm text-slate-300">Why: Global distribution, image optimization, ISR caching</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <p className="font-semibold text-green-300 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Why This Stack
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• TypeScript everywhere reduces bugs by 40%</li>
              <li>• All services are managed (no DevOps needed)</li>
              <li>• Deployment takes 2 minutes (git push → live)</li>
              <li>• Free tier covers 100+ pilot customers</li>
              <li>• Minimal "glue code" between services</li>
              <li>• Easy to hire contractors who know this stack</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Team Structure */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            2. Team Structure (Lean + Specialist)
          </h2>

          <div className="space-y-6">
            {/* Core Team */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Your Team (Full-time)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">You (Founder/Product)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Product direction & decisions</li>
                    <li>• Customer conversations</li>
                    <li>• UX/UI design direction</li>
                    <li>• Business metrics & analytics</li>
                    <li>• Sales conversations (initially)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Full-stack Engineer (1 FTE)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Frontend UI implementation</li>
                    <li>• Backend API routes</li>
                    <li>• Database schema design</li>
                    <li>• Deployment & monitoring</li>
                    <li>• Performance optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contract/Specialist */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Contract Specialists (Part-time / As-needed)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-purple-300 mb-2">AI/LLM Engineer (50 hrs/month)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Prompt engineering</li>
                    <li>• Insight generation pipeline</li>
                    <li>• Quality evaluation</li>
                    <li>• Cost optimization</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-purple-300 mb-2">Data Integration Specialist (30 hrs/month)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• OAuth implementations</li>
                    <li>• Mapping logic</li>
                    <li>• Schema analysis</li>
                    <li>• Customer support</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-purple-300 mb-2">Operations (20 hrs/month)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Customer setup</li>
                    <li>• Daily data pulls</li>
                    <li>• Quality checks</li>
                    <li>• CS support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Monthly Cost Breakdown (Pilots Phase)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Full-stack engineer (1 FTE): $8-12K/month</span>
                  <span className="text-purple-300">$10K</span>
                </div>
                <div className="flex justify-between">
                  <span>AI/LLM specialist contract (50 hrs @ $150/hr): $7.5K</span>
                  <span className="text-purple-300">$7.5K</span>
                </div>
                <div className="flex justify-between">
                  <span>Data integration specialist (30 hrs @ $120/hr): $3.6K</span>
                  <span className="text-purple-300">$3.6K</span>
                </div>
                <div className="flex justify-between">
                  <span>Operations (20 hrs @ $50/hr): $1K</span>
                  <span className="text-purple-300">$1K</span>
                </div>
                <div className="border-t border-purple-500/30 pt-2 mt-2 flex justify-between font-semibold">
                  <span>Infrastructure + services (Vercel, Supabase, LLM)</span>
                  <span className="text-purple-300">$2-3K</span>
                </div>
                <div className="border-t border-purple-500/30 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total Monthly</span>
                  <span className="text-green-400">$24-25K</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Process & Workflow */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-purple-400" />
            3. Process & Workflow (Ship Weekly, Iterate Daily)
          </h2>

          <div className="space-y-6">
            {/* Weekly Cycle */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Weekly Shipping Cycle</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-purple-600/30 border border-purple-400 flex items-center justify-center flex-shrink-0 font-bold">Mon</div>
                  <div>
                    <p className="font-semibold">Planning (1 hour)</p>
                    <p className="text-sm text-slate-300">• Review customer feedback from prior week</p>
                    <p className="text-sm text-slate-300">• Prioritize top 3 bugs + 2 features</p>
                    <p className="text-sm text-slate-300">• Assign to team members</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-purple-600/30 border border-purple-400 flex items-center justify-center flex-shrink-0 font-bold">Tue-Thu</div>
                  <div>
                    <p className="font-semibold">Execution (20-25 hours)</p>
                    <p className="text-sm text-slate-300">• Daily standup (15 min) - what shipped, blockers</p>
                    <p className="text-sm text-slate-300">• Ship small PRs every day (not huge ones)</p>
                    <p className="text-sm text-slate-300">• QA on staging environment</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-purple-600/30 border border-purple-400 flex items-center justify-center flex-shrink-0 font-bold">Fri</div>
                  <div>
                    <p className="font-semibold">Release Day (2-3 hours)</p>
                    <p className="text-sm text-slate-300">• 2pm: Final QA on staging</p>
                    <p className="text-sm text-slate-300">• 3pm: Deploy to production (git push → live in 2 min)</p>
                    <p className="text-sm text-slate-300">• 3:15pm: Monitor for errors (LogDrain, Vercel dashboard)</p>
                    <p className="text-sm text-slate-300">• 3:45pm: Announce to customers (Slack, email)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Workflow */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Daily Workflow (How to work with your technical skills)</h3>
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded p-4 border border-purple-500/10">
                  <p className="font-semibold text-purple-300 mb-2">Developer (Full-stack engineer):</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Write & deploy code</li>
                    <li>✓ Handle database migrations</li>
                    <li>✓ Fix production bugs</li>
                    <li>✗ NOT: Design prompts, tune LLM, manually pull data</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4 border border-purple-500/10">
                  <p className="font-semibold text-purple-300 mb-2">You (Founder/Product):</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Talk to customers daily</li>
                    <li>✓ Define product requirements & wireframes</li>
                    <li>✓ Review code changes (feedback, not approval)</li>
                    <li>✓ Monitor metrics & analytics</li>
                    <li>✗ NOT: Write code, deploy, handle infrastructure</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4 border border-purple-500/10">
                  <p className="font-semibold text-purple-300 mb-2">AI Specialist (Contract):</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Design insight generation prompts</li>
                    <li>✓ Evaluate insight quality</li>
                    <li>✓ A/B test different LLM approaches</li>
                    <li>✓ Optimize costs (model selection, caching)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Code Quality Rules */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Code Quality (Automated, Not Manual)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-purple-300 mb-2">Enforce Automatically</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Biome (linting & formatting)</li>
                    <li>• TypeScript strict mode</li>
                    <li>• Pre-commit hooks (prevent bad code)</li>
                    <li>• GitHub branch protection (require review)</li>
                    <li>• Automated tests on PRs</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-purple-300 mb-2">Skip (Until You Need It)</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Performance profiling</li>
                    <li>• E2E testing (manual testing ok for now)</li>
                    <li>• Load testing</li>
                    <li>• A/B testing framework</li>
                    <li>• Analytics instrumentation (start simple)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Deployment Strategy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            4. Deployment & Risk Management
          </h2>

          <div className="space-y-6">
            {/* Deployment Checklist */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Deployment Checklist (Friday Release)</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">All PRs reviewed & approved</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">Database migrations tested on staging</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">No breaking changes to API</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">Environment variables added to prod</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">Feature flags added (kill switch for new features)</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">Sentry/error tracking configured</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">LogDrain connected (errors sent to Slack)</span>
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-purple-500" checked readOnly />
                  <span className="text-slate-300">Staging deployment verified (manual QA)</span>
                </div>
              </div>
            </div>

            {/* Risk Mitigation */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Risk Mitigation Strategy</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-300">Risk: Production database data loss</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Supabase automatic daily backups + point-in-time recovery enabled. Test restore monthly.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-300">Risk: Bad code release breaks app</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Feature flags for all new features (kill switch), small PRs reviewed before merge, staging environment before prod.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-300">Risk: LLM API down (insight generation fails)</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Vercel AI Gateway with built-in fallbacks + backup provider. Cache insights for 24 hours (show stale data if needed).
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-300">Risk: Customer data integration breaks</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Status page (real-time connection status), email alerts on connection failure, ops specialist checks daily.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-300">Risk: Data exposure / security breach</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Supabase row-level security (RLS) enforced, encrypted API keys, no PII logging, monthly security audit.
                  </p>
                </div>
              </div>
            </div>

            {/* Monitoring Dashboard */}
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Daily Monitoring (5-minute health check)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                  <span>App uptime (Vercel dashboard)</span>
                  <span className="text-green-400">✓ Target: 99.5%+</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                  <span>Error rate (Sentry)</span>
                  <span className="text-green-400">✓ Target: {'<'}0.5%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                  <span>Database connections (Supabase)</span>
                  <span className="text-green-400">✓ Target: {'<'}90% capacity</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                  <span>LLM API latency</span>
                  <span className="text-green-400">✓ Target: {'<'}5 sec p95</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                  <span>Data integration status</span>
                  <span className="text-green-400">✓ Target: 100% connections active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Technical Debt Management */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            5. Technical Debt Management (Don't Let It Spiral)
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-300">The 80/20 Rule for Technical Debt</h3>
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded p-4">
                  <p className="font-semibold text-green-300 mb-2">Week 1-4 (MVP Phase): 100% on features</p>
                  <p className="text-sm text-slate-300">Speed is everything. Debt is ok. Just don't make 3 breaking changes to same code.</p>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <p className="font-semibold text-green-300 mb-2">Week 5-8 (Pilot Phase): 80% features / 20% debt</p>
                  <p className="text-sm text-slate-300">Refactor code that changed 3+ times. Extract reusable components. Write integration tests for critical paths.</p>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <p className="font-semibold text-green-300 mb-2">Week 9+ (Scale Phase): 70% features / 30% debt</p>
                  <p className="text-sm text-slate-300">Set up performance monitoring. Add E2E tests. Optimize slow queries. Document critical paths.</p>
                </div>
              </div>
            </div>

            {/* Avoid These Mistakes */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-red-300">Don't Make These Mistakes</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-slate-300">"We'll refactor this later" (you won't, and it compounds)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-slate-300">Trying to be perfect on first pass (adds 3x dev time, no benefit)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-slate-300">Adding features without removing anything (codebase bloats, harder to ship)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-slate-300">Skipping tests entirely (bugs compound, harder to refactor later)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-slate-300">Building your own auth, payments, etc. (massive time sink for no differentiation)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Timeline & Milestones */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">6. 12-Week Timeline to Production</h2>

          <div className="space-y-4">
            {[
              {
                weeks: "Week 1-2",
                phase: "Infrastructure Setup",
                tasks: [
                  "GitHub + Vercel + Supabase configured",
                  "Database schema designed & migrations working",
                  "Auth (Supabase Auth) configured",
                  "Basic API routes tested locally"
                ],
                status: "foundational"
              },
              {
                weeks: "Week 3-4",
                phase: "MVP Core (Onboarding + Dashboard)",
                tasks: [
                  "Onboarding flow built (user story → smart metrics)",
                  "Dashboard with insights & signals filtering working",
                  "Basic data source connection (mock for now)",
                  "All on staging environment"
                ],
                status: "core"
              },
              {
                weeks: "Week 5-6",
                phase: "Insight Generation Pipeline",
                tasks: [
                  "Daily data pull pipeline (Vercel Cron)",
                  "LLM insight generation (Claude prompts)",
                  "Insight storage & retrieval working",
                  "Export to PDF working"
                ],
                status: "core"
              },
              {
                weeks: "Week 7-8",
                phase: "Data Integrations (Real)",
                tasks: [
                  "Stripe + HubSpot OAuth connected",
                  "Manual metric mapping UI built",
                  "Google Analytics integration working",
                  "Sync validation & error handling"
                ],
                status: "feature"
              },
              {
                weeks: "Week 9-10",
                phase: "Quality & Hardening",
                tasks: [
                  "Security review (RLS, encryption, API keys)",
                  "Performance testing (load + latency)",
                  "Bug fixes & edge cases",
                  "Documentation for team"
                ],
                status: "quality"
              },
              {
                weeks: "Week 11",
                phase: "First Customer Pilot",
                tasks: [
                  "Deploy to production",
                  "Onboard 1-2 beta customers",
                  "Monitor for issues daily",
                  "Collect feedback"
                ],
                status: "launch"
              },
              {
                weeks: "Week 12",
                phase: "Iteration & Scale",
                tasks: [
                  "Fix bugs reported by pilots",
                  "Onboard 5-10 more pilot customers",
                  "Plan next features based on feedback",
                  "Prepare for public launch"
                ],
                status: "launch"
              }
            ].map((milestone, i) => (
              <div key={i} className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <p className="font-bold text-purple-300 text-sm">{milestone.weeks}</p>
                  <p className="text-xs text-slate-400 mt-1">{milestone.phase}</p>
                </div>
                <div className="flex-1">
                  <ul className="text-sm text-slate-300 space-y-1">
                    {milestone.tasks.map((task, j) => (
                      <li key={j}>• {task}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Key Success Factors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">7. Key Success Factors (This is How You Win)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Do These
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ Talk to customers every day (learn from them)</li>
                <li>✓ Ship small changes frequently (easier to debug)</li>
                <li>✓ Use managed services (focus on product)</li>
                <li>✓ Automate testing & deployment (save time)</li>
                <li>✓ Monitor errors in real-time (catch issues early)</li>
                <li>✓ Hire contractors for specialists (faster, less risky)</li>
                <li>✓ Have 1-week sprint cycles (stay aligned)</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Avoid These
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✗ Building infrastructure (databases, servers)</li>
                <li>✗ Over-architecting early (YAGNI principle)</li>
                <li>✗ Hiring full team before product-market fit</li>
                <li>✗ Skipping manual QA (automation takes time)</li>
                <li>✗ Prioritizing perfection over speed</li>
                <li>✗ Deferring all technical debt (compounds fast)</li>
                <li>✗ Not monitoring production (find bugs late)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Budget Summary */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">8. Total Budget to Production (12 weeks)</h2>

          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>Full-stack Engineer (12 weeks @ $2.5K/week)</span>
                  <span className="text-purple-300 font-semibold">$30K</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>AI/LLM Specialist (12 weeks @ $750/week)</span>
                  <span className="text-purple-300 font-semibold">$9K</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>Data Integration Specialist (6 weeks @ $600/week)</span>
                  <span className="text-purple-300 font-semibold">$3.6K</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>Operations support (manual, part-time)</span>
                  <span className="text-purple-300 font-semibold">$2K</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>Infrastructure (Vercel, Supabase, LLM APIs)</span>
                  <span className="text-purple-300 font-semibold">$4K</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-500/20">
                  <span>Tools (GitHub, monitoring, etc.)</span>
                  <span className="text-purple-300 font-semibold">$1.5K</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold bg-purple-900/30 rounded p-3 mt-3">
                  <span>Total 12-Week Cost</span>
                  <span className="text-green-400">$50.1K</span>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
              <p className="text-green-300 font-semibold mb-2">Then (Monthly Thereafter):</p>
              <div className="text-sm text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Full-time engineer</span>
                  <span>$10K</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract specialists (AI + data + ops)</span>
                  <span>$12K</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure + services</span>
                  <span>$3K</span>
                </div>
                <div className="flex justify-between font-bold border-t border-green-500/20 pt-2 mt-2">
                  <span>Monthly burn</span>
                  <span>$25K</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Advice */}
        <section>
          <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/40 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Final Advice</h2>
            <div className="space-y-4 text-slate-200">
              <p>
                <strong className="text-purple-300">You don't need to be a world-class engineer to build a successful product.</strong> 
                You need clear thinking, good taste, and the ability to hire smart people to fill gaps. The strategy above does that.
              </p>
              <p>
                <strong className="text-purple-300">Your superpower is talking to customers and understanding their problems.</strong> 
                Spend 50% of your time doing that. Spend 30% reviewing product + code. Spend 20% on everything else.
              </p>
              <p>
                <strong className="text-purple-300">Shipping beats perfection every single time in early stage.</strong> 
                A "good enough" product in customers' hands in week 8 is worth 10x more than a "perfect" product in week 16.
              </p>
              <p>
                <strong className="text-purple-300">The bottleneck won't be engineering - it'll be sales + operations.</strong> 
                Focus on getting the product working, then finding customers, then not breaking it as you scale.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
