'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react';

export default function SoloBuildPlan() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Solo Build Plan: 14 Weeks to Launch</h1>
          <p className="text-lg text-muted-foreground">v0 + Cursor + Occasional Technical Feedback</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Total Timeline</p>
                <p className="text-2xl font-bold text-foreground">14 weeks</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="text-2xl font-bold text-foreground">You + 1 Friend</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Launch Status</p>
                <p className="text-2xl font-bold text-foreground">Week 10</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Quality Target</p>
                <p className="text-2xl font-bold text-foreground">75-80%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Principles */}
        <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-bold mb-4 text-foreground">How This Works</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">You focus on:</p>
                <p className="text-sm text-muted-foreground">Product direction, UI/UX, customer feedback, deciding what to build next</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Cursor/v0 handles:</p>
                <p className="text-sm text-muted-foreground">Actual coding - UI generation, backend logic, data transformations, API integrations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Your friend reviews:</p>
                <p className="text-sm text-muted-foreground">Architecture decisions (weeks 2, 4, 6), code quality (week 8), production readiness (week 10)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Breakdown */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Week-by-Week Breakdown</h2>
          
          {/* Week 1-2: Setup & Onboarding */}
          <WeekCard
            week="1-2"
            title="Setup & Onboarding Flow"
            hours={20}
            focus="v0"
            tasks={[
              "Setup project (Next.js 16, Supabase, Vercel)",
              "Design onboarding screens in v0 (User story → Smart metrics → Dashboard)",
              "Build user profile schema (role, goal, product category, stage)",
              "Create authentication scaffolding with Supabase",
              "Deploy dev environment"
            ]}
            tools={["v0", "Cursor", "Supabase console"]}
            checkpoint="✓ Deploy to dev.yourapp.com, can register & create profile"
            feedback={false}
          />

          {/* Week 3-4: Smart Metrics & Dashboard */}
          <WeekCard
            week="3-4"
            title="Smart Metrics Selection & Insights Dashboard"
            hours={24}
            focus="v0 + Cursor"
            tasks={[
              "Build smart metrics screen with role-based suggestions in v0",
              "Create Insights dashboard (signal cards, filters) in v0",
              "Build API routes for metrics fetching (Cursor + mock data)",
              "Implement localStorage for metric selections",
              "Add filter/search functionality"
            ]}
            tools={["v0", "Cursor", "Recharts"]}
            checkpoint="✓ Can select metrics, see personalized dashboard"
            feedback={true}
            feedbackPrompt="Show your friend: Complete user flow from signup → metric selection → dashboard. Ask: 'Does the flow make sense? Any obvious bugs?'"
          />

          {/* Week 5-6: Data Mapping & Integration Setup */}
          <WeekCard
            week="5-6"
            title="Data Source Mapping & Integration Flow"
            hours={28}
            focus="Cursor + v0"
            tasks={[
              "Build data mapping UI in v0 (show schema, let user map fields)",
              "Create mapping validation API in Cursor (Cursor is heavy here)",
              "Build dataset connection flow modal (5 common sources) in v0",
              "Create OAuth scaffolding for Stripe, Salesforce (Cursor)",
              "Implement mock data pull for dev (Cursor)"
            ]}
            tools={["v0", "Cursor", "OAuth libraries"]}
            checkpoint="✓ Can connect mock data source, see fields appear in dashboard"
            feedback={false}
          />

          {/* Week 7: LLM Integration */}
          <WeekCard
            week="7"
            title="LLM Insight Generation Pipeline"
            hours={20}
            focus="Cursor"
            tasks={[
              "Setup daily batch job for insight generation (Cursor)",
              "Create LLM prompts for 3-5 metric types (Cursor + Claude for iteration)",
              "Build insight storage & retrieval API (Cursor)",
              "Test prompt quality with sample data (manual iteration)",
              "Setup error handling & logging"
            ]}
            tools={["Cursor", "Claude API", "Vercel Cron"]}
            checkpoint="✓ Daily cron job generates insights, visible in dashboard"
            feedback={true}
            feedbackPrompt="Show your friend: Insights generated. Ask: 'Do these insights make business sense? Any obvious hallucinations? Architecture look reasonable?'"
          />

          {/* Week 8: Production Setup & Testing */}
          <WeekCard
            week="8"
            title="Production Hardening & Testing"
            hours={18}
            focus="Both"
            tasks={[
              "Setup production Supabase (backups, RLS policies)",
              "Configure error tracking (Sentry) - Cursor handles setup",
              "Load test the dashboard (v0 UI perf + Cursor API perf)",
              "Test data integrations with real Stripe/Salesforce accounts (you)",
              "Security review checklist (auth, data access, API keys)"
            ]}
            tools={["Sentry", "Cursor", "Vercel analytics"]}
            checkpoint="✓ Deployed to production.yourapp.com with real data source"
            feedback={true}
            feedbackPrompt="Full production readiness review: 'Any glaring security issues? Performance OK? Ready for 1 real customer?'"
          />

          {/* Week 9: Pilot Customer Prep */}
          <WeekCard
            week="9"
            title="Pilot Customer Setup & Documentation"
            hours={12}
            focus="You"
            tasks={[
              "Recruit 1-2 pilot customers (use your network)",
              "Create onboarding guide for customers",
              "Setup customer monitoring (which features they use, errors)",
              "Create feedback survey template",
              "Setup customer comms process (email template, Slack/email for issues)"
            ]}
            tools={["Notion", "Typeform", "Segment/Mixpanel"]}
            checkpoint="✓ Pilot customers ready to sign up"
            feedback={false}
          />

          {/* Week 10: LAUNCH */}
          <WeekCard
            week="10"
            title="🚀 LAUNCH - 1-2 Pilot Customers"
            hours={8}
            focus="You + Friend"
            tasks={[
              "Onboard first customer (hands-on setup call)",
              "Monitor production 24/7 (have friend on standby)",
              "Collect customer feedback (what's confusing, what's broken)",
              "Log all bugs & issues in Notion",
              "Daily standup: What broke, what customers want"
            ]}
            tools={["Slack", "Sentry", "Customer support template"]}
            checkpoint="✓ Real customers using real data"
            feedback={true}
            feedbackPrompt="Daily: 'Here's what broke today. Should I fix it now or defer?'"
          />

          {/* Week 11-12: Iterate Based on Customer Feedback */}
          <WeekCard
            week="11-12"
            title="Customer Feedback Loop & Iteration"
            hours={30}
            focus="Both"
            tasks={[
              "Fix critical bugs (data not showing, errors on load)",
              "Improve data mapping UX based on customer struggles",
              "Add requested features if they're small (filters, exports)",
              "Improve LLM insights based on feedback",
              "Documentation improvements"
            ]}
            tools={["v0", "Cursor", "Customer interviews"]}
            checkpoint="✓ Customer feedback integrated, happy customers"
            feedback={false}
          />

          {/* Week 13: Scaling Prep */}
          <WeekCard
            week="13"
            title="Scale to 3-5 Customers & Optimize"
            hours={20}
            focus="Cursor"
            tasks={[
              "Onboard 2-3 more customers (using automated process)",
              "Database optimization (indexes for slow queries)",
              "Cache insights (avoid re-generating same insights)",
              "API rate limiting & abuse prevention",
              "Document architecture for future engineer"
            ]}
            tools={["Cursor", "Vercel Analytics"]}
            checkpoint="✓ 5 paying customers, profitable on LLM costs"
            feedback={false}
          />

          {/* Week 14: Polish & Future Planning */}
          <WeekCard
            week="14"
            title="Polish, Metrics, & Plan Next Phase"
            hours={16}
            focus="You"
            tasks={[
              "Polish UI (animations, edge cases, mobile)",
              "Setup analytics (track user behavior, feature adoption)",
              "Create monthly metrics dashboard for yourself (revenue, churn, NPS)",
              "Document what worked & what didn't",
              "Plan next features based on customer feedback"
            ]}
            tools={["v0", "Mixpanel", "Notion"]}
            checkpoint="✓ Ready for serious customer acquisition"
            feedback={false}
          />
        </div>

        {/* Realistic Challenges Section */}
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Realistic Challenges You'll Hit
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-2">Week 3-4: Context Switching Fatigue</p>
              <p className="text-sm text-muted-foreground">Flipping between v0 (UI) and Cursor (backend) is mentally exhausting. Solution: Batch work - "v0 Tuesday-Wednesday", "Cursor Thursday-Friday"</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Week 5-6: Data Integration Rabbit Hole</p>
              <p className="text-sm text-muted-foreground">OAuth + schema mapping + error handling takes 3-4x longer than estimated. Solution: Start with mock integrations, add real OAuth week 8+</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Week 7: LLM Quality Issues</p>
              <p className="text-sm text-muted-foreground">First insights are mediocre. Prompt engineering takes longer than expected. Solution: Use best-in-class LLM (Claude 3.5 Sonnet), iterate heavily, don't worry about perfection</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Week 10: Production Breaks</p>
              <p className="text-sm text-muted-foreground">Something works in dev, breaks in production. Classic issues: environment variables missing, data volumes expose N+1 queries, API limits. Solution: Ask friend to do pre-launch review</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Week 11-12: Feature Creep</p>
              <p className="text-sm text-muted-foreground">Customers ask for features that would take 1-2 weeks. You want to say yes. Solution: Say "Week 3 of customer success plan" instead</p>
            </div>
          </div>
        </Card>

        {/* How to Work with Your Friend */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-bold mb-4 text-foreground">How to Work with Your Technical Friend</h2>
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="font-semibold text-foreground mb-2">Schedule: 4 Review Sessions Total</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>Week 4 (30 min):</strong> "Here's the flow. Does it look right?"</p>
                <p>• <strong>Week 7 (45 min):</strong> "Here's the LLM pipeline. Any obvious problems?"</p>
                <p>• <strong>Week 9 (1 hour):</strong> "Full production review. Ready for customers?"</p>
                <p>• <strong>Week 10 (daily 15 min):</strong> "What broke? Should I fix it now?"</p>
              </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="font-semibold text-foreground mb-2">What to Ask Your Friend</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>✓ Architecture questions ("Is this the right way to structure data flow?")</p>
                <p>✓ Production readiness ("Any security holes?")</p>
                <p>✓ Code quality issues ("Am I building technical debt?")</p>
                <p>✗ Don't ask: "Can you just code this for me?" (defeats the purpose)</p>
                <p>✗ Don't ask: Small debugging help (Google it, ask AI tools)</p>
              </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="font-semibold text-foreground mb-2">How to Prepare for Each Review</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Run the app live (show, don't tell)</p>
                <p>2. Have 2-3 specific questions ready ("Is Supabase RLS sufficient for multi-tenant?")</p>
                <p>3. Show them the current state in Cursor/v0</p>
                <p>4. Record the call if they say yes - reference later</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tooling Stack */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-bold mb-4 text-foreground">Your Tooling Stack (Optimized for Solo)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground mb-3">Frontend (v0)</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Onboarding (4 screens): 4 hours</li>
                <li>✓ Dashboard (Insights): 6 hours</li>
                <li>✓ Data mapping UI: 4 hours</li>
                <li>✓ Integration flow: 5 hours</li>
                <li>✓ Polish & tweaks: 8 hours</li>
                <li className="font-semibold pt-2">Total: ~27 hours v0 time</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Backend (Cursor)</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Auth & DB schema: 8 hours</li>
                <li>✓ API routes (metrics): 12 hours</li>
                <li>✓ Data mapping logic: 10 hours</li>
                <li>✓ LLM integration: 20 hours</li>
                <li>✓ Debugging & fixes: 30 hours</li>
                <li className="font-semibold pt-2">Total: ~80 hours Cursor time</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Infrastructure</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Vercel (Next.js hosting)</li>
                <li>• Supabase (database + auth)</li>
                <li>• Claude/GPT-4 API (LLM)</li>
                <li>• Sentry (error tracking)</li>
                <li>• GitHub (version control)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Monthly Costs</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• v0 Pro: $20</li>
                <li>• Cursor Pro: $20</li>
                <li>• Supabase: $25-50</li>
                <li>• LLM API: $50-200</li>
                <li>• Vercel: $20</li>
                <li className="font-semibold">Total: $135-310/mo</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Success Metrics */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-bold mb-4 text-foreground">How You'll Know It's Working</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Week 4</p>
                <p className="text-sm text-muted-foreground">Dashboard works, can select metrics, sees data</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Week 7</p>
                <p className="text-sm text-muted-foreground">Insights appear in dashboard, not embarrassingly bad</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Week 10</p>
                <p className="text-sm text-muted-foreground">Real customer signs up, no critical bugs on day 1</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Week 14</p>
                <p className="text-sm text-muted-foreground">3-5 paying customers, $500-1500 MRR, customers doing real work</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Final Notes */}
        <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-bold mb-4 text-foreground">Final Notes</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Pace yourself:</strong> You're working ~20-25 hrs/week. This is sustainable for 14 weeks without burning out. Don't try to do 50 hrs/week - you'll make mistakes.</p>
            <p><strong>Don't get stuck:</strong> If something takes longer than expected, ask Claude/Cursor for help. If still stuck after 2 hours, slack your friend asking for direction (not implementation).</p>
            <p><strong>Ship &gt; Perfect:</strong> Aim for 75% quality for launch. Real customers will tell you what matters. Fix the important stuff, ignore edge cases.</p>
            <p><strong>Celebrate Week 10:</strong> Getting real customers is the hard part. Post launch milestones on Twitter/LinkedIn - people love solo founder journeys.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WeekCard({ 
  week, 
  title, 
  hours, 
  focus, 
  tasks, 
  tools, 
  checkpoint,
  feedback,
  feedbackPrompt
}: {
  week: string;
  title: string;
  hours: number;
  focus: string;
  tasks: string[];
  tools: string[];
  checkpoint: string;
  feedback: boolean;
  feedbackPrompt?: string;
}) {
  return (
    <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-primary">Week {week}</p>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{hours} hours</p>
          <p className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded mt-1">{focus}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Tasks:</p>
          <ul className="space-y-1">
            {tasks.map((task, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Tools:</p>
            <div className="flex flex-wrap gap-1">
              {tools.map((tool) => (
                <span key={tool} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-3 rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-1">Checkpoint:</p>
          <p className="text-sm text-muted-foreground">{checkpoint}</p>
        </div>

        {feedback && (
          <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20">
            <p className="text-sm font-semibold text-destructive mb-1">👥 Get Feedback from Friend</p>
            <p className="text-sm text-muted-foreground">{feedbackPrompt}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
