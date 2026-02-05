export default function MVPRecommendation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-balance">Minimum Sellable Product</h1>
          <p className="text-xl text-muted-foreground text-balance">
            A lean MVP balancing customer value with technical feasibility
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Executive Summary</h2>
          <div className="space-y-3 text-lg">
            <p>
              <strong>Build Time:</strong> 8-12 weeks with 2-3 engineers
            </p>
            <p>
              <strong>Development Cost:</strong> $80K-120K
            </p>
            <p>
              <strong>Strategy:</strong> 60% real product, 40% Wizard of Oz
            </p>
            <p>
              <strong>Target:</strong> 10-20 pilot customers (CXOs at Series A-D tech companies)
            </p>
            <p>
              <strong>Key Insight:</strong> Focus on insight quality over automation. Manual curation beats mediocre
              automation for early customers.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-teal-500/10 p-8 shadow-lg">
          <h2 className="mb-4 text-3xl font-bold">Minimum Sellable Product Strategy</h2>
          <p className="mb-2 text-lg text-muted-foreground">
            <strong>Strategy:</strong> 70% automated, 30% Wizard of Oz
          </p>
          <p>
            <strong>Target:</strong> 10-20 pilot customers (CXOs at Series A-D tech companies)
          </p>
          <p>
            <strong>Key Insight:</strong> Automate the daily data refresh and insight generation to create a "real-time
            feel" while keeping data source connections manual initially.
          </p>
        </div>

        {/* Build vs. Fake Matrix */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">Build vs. Fake: The Matrix</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Build Real */}
            <div className="rounded-xl border-2 border-teal-500/50 bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-teal-500 p-2">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-teal-600">Build (Automated)</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">1. Automated Daily Data Pipeline</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What it does:</strong> Scheduled job runs every night (2-4am) → Pulls data from connected
                    sources → Updates metric values → Stores in database
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Technical approach:</strong> Node.js cron job + API wrappers for top 5 data sources
                    (Salesforce, HubSpot, Stripe, Google Analytics, Amplitude) → Transform data to standard schema →
                    Bulk insert to Postgres
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 3-4 weeks</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This creates the "real-time feel" customers expect - dashboard shows "Updated 3 hours ago"
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">2. Automated Daily Insight Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What it does:</strong> After data pull completes → LLM generates fresh insights for all
                    customer metrics → Stores in database → Appears instantly when users click cards
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Technical approach:</strong> OpenAI/Anthropic API + structured prompts → Generate insights
                    for each metric change → Quality scoring filter → Store in insights table with timestamps
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 2-3 weeks</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cost: ~$200-400/month for AI API calls (10-20 customers, 20-30 insights each, daily generation)
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">3. Dashboard & Metric Cards</h4>
                  <p className="text-sm text-muted-foreground">
                    Beautiful UI showing metrics organized by role → Click card → Insight appears instantly
                    (pre-generated) → Export to PDF
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 2 weeks (already mostly built)</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">4. User Profile & Onboarding</h4>
                  <p className="text-sm text-muted-foreground">
                    Role selection → Smart metric recommendations → Profile context (product stage, business stage) →
                    Drives personalization
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 1-2 weeks (already built)</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">5. Admin Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    Your team's control center → View all customers → Monitor data pipeline status → Review insight
                    quality → Manual overrides when needed
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 2-3 weeks</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">6. Basic Authentication & Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Email/password auth → OAuth for data sources → Encryption at rest/transit → Audit logs
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-600">Dev effort: 2 weeks</p>
                </div>
              </div>
            </div>

            {/* Fake / Wizard of Oz */}
            <div className="rounded-xl border-2 border-purple-500/50 bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-purple-500 p-2">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-600">Wizard of Oz (Manual Operations)</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">1. Data Source Connection Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What customers see:</strong> "Connect Salesforce" button → OAuth flow → Success message →
                    "Syncing data..."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Behind the scenes:</strong> Customer completes OAuth → Your team manually configures which
                    fields to pull → Sets up API credentials in admin panel → Tests connection → Enables automated daily
                    sync
                  </p>
                  <p className="mt-2 text-xs font-medium text-purple-600">
                    Effort: 1-2 hours per customer (one-time setup)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Once configured, the automated pipeline handles all future data pulls
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">2. Insight Quality Review (Spot Checks)</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What customers see:</strong> Insights appear instantly when clicking metric cards
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Behind the scenes:</strong> Automated LLM generates all insights daily → Your team
                    spot-checks 10-15% for quality (morning review) → Flags low-quality insights for manual rewrite →
                    Learns what good prompts look like
                  </p>
                  <p className="mt-2 text-xs font-medium text-purple-600">
                    Effort: 30-60 min/day (decreases as prompts improve)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Quality gate ensures customers see consulting-level analysis, not generic AI output
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">3. Benchmark Data Curation</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What customers see:</strong> Industry benchmarks appear for their metrics
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Behind the scenes:</strong> Your team researches benchmarks from reports (OpenView, SaaStr,
                    etc.) → Manually enters into admin panel → Tags by industry/stage/size
                  </p>
                  <p className="mt-2 text-xs font-medium text-purple-600">
                    Effort: 4-6 hours upfront, 1-2 hours/month updates
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">4. Custom Metric Requests</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>What customers see:</strong> "Request Custom Metric" button → Form submission → Gets
                    notified when ready
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Behind the scenes:</strong> Your team evaluates request → Determines data source needed →
                    Manually adds metric to their dashboard → Configures automated data pull for it
                  </p>
                  <p className="mt-2 text-xs font-medium text-purple-600">Effort: 2-4 hours per custom metric</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">MVP Technical Architecture</h2>

          <div className="space-y-6">
            {/* Frontend */}
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-primary">Frontend</span>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Framework:</strong> Next.js 15 (App Router) - What you have now
                </p>
                <p>
                  <strong className="text-foreground">State:</strong> React useState + localStorage (upgrade to database
                  later)
                </p>
                <p>
                  <strong className="text-foreground">UI:</strong> shadcn/ui components - Already built
                </p>
                <p>
                  <strong className="text-foreground">Charts:</strong> Recharts for metric visualization
                </p>
                <p>
                  <strong className="text-foreground">PDF Export:</strong> react-pdf or jsPDF
                </p>
              </div>
            </div>

            {/* Backend */}
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-primary">Backend</span>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Database:</strong> Supabase Postgres (already integrated)
                </p>
                <p>
                  <strong className="text-foreground">Auth:</strong> Supabase Auth - Email/password only for MVP
                </p>
                <p>
                  <strong className="text-foreground">API:</strong> Next.js Server Actions (no separate backend needed)
                </p>
                <p>
                  <strong className="text-foreground">File Storage:</strong> Vercel Blob for PDF exports
                </p>
              </div>
            </div>

            {/* Admin Panel */}
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span className="rounded-lg bg-purple-500/10 px-3 py-1 text-purple-600">Admin Panel (Critical!)</span>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Purpose:</strong> Your team's control center for Wizard of Oz
                  operations
                </p>
                <p>
                  <strong className="text-foreground">Features needed:</strong>
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Upload customer data (CSV import)</li>
                  <li>Update metric values manually</li>
                  <li>Queue for insight requests (shows when customer clicks a card)</li>
                  <li>Write/approve insights before they go live</li>
                  <li>Customer management (view profiles, assigned metrics)</li>
                </ul>
                <p className="text-sm bg-purple-500/10 p-3 rounded-lg text-purple-900 dark:text-purple-100 mt-4">
                  <strong>Dev effort:</strong> 2-3 weeks. This is essential for scaling to 10-20 customers without
                  chaos.
                </p>
              </div>
            </div>

            {/* LLM Integration */}
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-primary">LLM Integration</span>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Phase 1 (MVP - Weeks 1-8):</strong> Weekly batch generation using
                  AI API (OpenAI/Anthropic) + human quality review → Pre-load insights into database
                </p>
                <div className="ml-4 mt-2 p-3 bg-blue-500/10 rounded-lg text-sm">
                  <p className="font-semibold text-blue-600 mb-2">Weekly Insight Generation Workflow:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-blue-900 dark:text-blue-100">
                    <li>Sunday night: Script pulls customer metrics data</li>
                    <li>AI generates insights for all metrics (20-30 per customer)</li>
                    <li>Monday morning: Team reviews batch for quality (1-2 hours)</li>
                    <li>Approved insights go live in customer dashboards</li>
                    <li>Customers see instant insights all week</li>
                  </ol>
                </div>
                <p>
                  <strong className="text-foreground">Phase 2 (Month 3-4):</strong> Automated quality scoring → Only
                  low-confidence insights need human review (reduces review time by 70%)
                </p>
                <p>
                  <strong className="text-foreground">Phase 3 (Month 5+):</strong> Fully automated real-time generation
                  with spot-check quality monitoring
                </p>
                <p className="text-sm bg-green-500/10 p-3 rounded-lg text-green-900 dark:text-green-100 mt-4">
                  <strong>Why this works:</strong> Batch processing lets you maintain quality while appearing instant to
                  customers. Cost: ~$50-100/month in AI API calls for 20 customers.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-primary">
                  LLM Integration (Automated Daily)
                </span>
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Phase 1 (MVP - Months 1-2):</strong> Automated daily batch
                  generation with human spot-check quality review (10-15% sample)
                </p>
                <div className="ml-4 mt-2 p-3 bg-blue-500/10 rounded-lg text-sm">
                  <p className="font-semibold text-blue-600 mb-2">Daily Automated Workflow:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-blue-900 dark:text-blue-100">
                    <li>2-4am: Automated data pipeline pulls fresh data from all connected sources</li>
                    <li>4-6am: LLM generates insights for all updated metrics (20-30 per customer)</li>
                    <li>6-7am: Quality scoring algorithm filters low-confidence insights</li>
                    <li>8-9am: Team spot-checks 10-15% of insights, rewrites if needed</li>
                    <li>9am: All insights go live - customers see "instant" results when clicking cards</li>
                  </ol>
                </div>
                <p className="mt-2 text-sm bg-green-500/10 p-3 rounded-lg text-green-900 dark:text-green-100">
                  <strong>Cost:</strong> $200-400/month for AI API calls (10-20 customers × 25 insights × 30 days ≈ 15K
                  insights/month @ $0.02 per insight)
                </p>
                <p>
                  <strong className="text-foreground">Phase 2 (Month 3-4):</strong> Improved prompts based on 60-90 days
                  of quality reviews → Spot-check drops to 5% → Add customer rating feedback loop
                </p>
                <p>
                  <strong className="text-foreground">Phase 3 (Month 5+):</strong> Fully automated with real-time
                  generation on-demand → Only manually review flagged low-quality insights ({"<"} 2% of volume)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Schema */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">Minimum Database Schema</h2>

          <div className="rounded-xl bg-card p-6 shadow-lg border overflow-x-auto">
            <pre className="text-sm">
              {`-- Users (Supabase Auth handles this, extend with profile)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  role TEXT NOT NULL,
  goal TEXT,
  company_name TEXT,
  product_category TEXT,
  product_stage TEXT,
  business_stage TEXT,
  selected_metrics TEXT[], -- Array of metric IDs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Metrics (static library, seeded once)
CREATE TABLE metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Customer, Product, Sales, etc.
  subcategory TEXT,
  roles TEXT[], -- Which roles this metric is relevant for
  description TEXT,
  unit TEXT, -- %, $, count, etc.
  is_benchmark BOOLEAN DEFAULT FALSE
);

-- Metric Values (updated by your team via admin panel)
CREATE TABLE metric_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  metric_id TEXT REFERENCES metrics(id),
  value TEXT NOT NULL,
  previous_value TEXT,
  change_percent DECIMAL,
  trend TEXT, -- up, down, stable
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insights (human-curated or LLM-generated)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  metric_id TEXT REFERENCES metrics(id),
  status TEXT DEFAULT 'pending', -- pending, approved, published
  analysis TEXT NOT NULL,
  implications TEXT,
  recommendations TEXT,
  created_by UUID, -- Which admin created this
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Saved Items (for PDF export)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  metric_id TEXT REFERENCES metrics(id),
  insight_id UUID REFERENCES insights(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users (your team)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  role TEXT DEFAULT 'analyst', -- analyst, admin
  created_at TIMESTAMP DEFAULT NOW()
);`}
            </pre>
          </div>
        </div>

        {/* Development Phases */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">8-Week Development Roadmap</h2>

          <div className="space-y-4">
            {[
              {
                week: "Week 1-2",
                title: "Foundation",
                items: [
                  "Set up Supabase database schema",
                  "Build user profile screen and onboarding flow",
                  "Create role-to-metrics mapping table (content work)",
                  "Basic authentication (email/password)",
                ],
                color: "blue",
              },
              {
                week: "Week 3-4",
                title: "Core Dashboard",
                items: [
                  "Personalized dashboard with metric cards",
                  "Filter by role/recommended/department",
                  "Metric card design with trends",
                  "Expanded insight card UI (static content for now)",
                ],
                color: "green",
              },
              {
                week: "Week 5-6",
                title: "Admin Panel",
                items: [
                  "Admin authentication and RBAC",
                  "CSV upload for customer data",
                  "Manual metric value editor",
                  "Insight queue and approval system",
                  "Customer list and profile management",
                ],
                color: "purple",
              },
              {
                week: "Week 7-8",
                title: "Polish & Export",
                items: [
                  "PDF export functionality",
                  "Saved items collection",
                  "Benchmark card display",
                  "Loading states and error handling",
                  "Pilot customer onboarding docs",
                ],
                color: "orange",
              },
            ].map((phase) => (
              <div key={phase.week} className="rounded-xl bg-card p-6 shadow-lg border">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`rounded-lg bg-${phase.color}-500/10 px-3 py-1 font-semibold text-${phase.color}-600`}
                  >
                    {phase.week}
                  </span>
                  <h3 className="text-xl font-bold">{phase.title}</h3>
                </div>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  {phase.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-lg border">
          <h3 className="mb-6 text-2xl font-bold">Development Timeline</h3>
          <div className="space-y-4">
            <TimelineItem week="Weeks 1-2" task="Core Dashboard & User Profile" status="Foundation" />
            <TimelineItem week="Weeks 3-4" task="Authentication & Database Schema" status="Foundation" />
            <TimelineItem week="Weeks 5-7" task="Automated Data Pipeline (Top 5 Sources)" status="Critical" />
            <TimelineItem week="Weeks 6-8" task="LLM Insight Generation System" status="Critical" />
            <TimelineItem week="Weeks 7-9" task="Admin Panel for Operations" status="Critical" />
            <TimelineItem week="Weeks 9-10" task="PDF Export & Polish" status="MVP Complete" />
          </div>
          <div className="mt-6 rounded-lg bg-primary/10 p-4">
            <p className="font-semibold text-primary">Total: 10 weeks with 2-3 engineers</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Then 2-week pilot onboarding period to test with first 3-5 customers
            </p>
          </div>
        </div>

        {/* What NOT to Build */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">What NOT to Build (Yet)</h2>

          <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Real-time data integrations</h4>
                  <p className="text-sm text-muted-foreground">
                    OAuth, API polling, webhooks - all too complex for MVP. Manual data uploads are fine for 10-20
                    customers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Automated insight generation</h4>
                  <p className="text-sm text-muted-foreground">
                    You need to learn what "great" looks like first. 50-100 manual examples before automation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Team collaboration features</h4>
                  <p className="text-sm text-muted-foreground">
                    Comments, @mentions, shared workspaces - overkill for MVP. One user per customer is enough.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Custom metric builder</h4>
                  <p className="text-sm text-muted-foreground">
                    Let customers request custom metrics → You add them manually → Learn patterns → Automate later.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Mobile app</h4>
                  <p className="text-sm text-muted-foreground">
                    Responsive web is enough. CXOs will use this on laptops for board prep.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-semibold text-destructive">Advanced security (SOC 2, SSO)</h4>
                  <p className="text-sm text-muted-foreground">
                    Email/password + basic encryption is enough for pilots. Add enterprise security when you have paying
                    customers demanding it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-lg border">
          <h3 className="mb-6 text-2xl font-bold">Cost Breakdown</h3>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-bold">Development (One-Time)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2 Full-stack Engineers × 10 weeks</span>
                  <span className="font-semibold">$100K-150K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">1 Product Designer × 4 weeks</span>
                  <span className="font-semibold">$15K-25K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Infrastructure setup & tools</span>
                  <span className="font-semibold">$5K-10K</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Development Cost</span>
                  <span className="font-bold text-primary">$120K-185K</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-bold">Ongoing (Monthly)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Infrastructure (Vercel, Supabase, etc.)</span>
                  <span className="font-semibold">$500-800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LLM API costs (OpenAI/Anthropic)</span>
                  <span className="font-semibold">$200-400</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data pipeline API costs</span>
                  <span className="font-semibold">$100-200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operations team (0.5 FTE for quality review)</span>
                  <span className="font-semibold">$4K-6K</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Monthly Cost</span>
                  <span className="font-bold text-primary">$4.8K-7.4K</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                At 10-20 pilot customers, this is $240-740/customer/month in operational cost
              </p>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">MVP Success Criteria</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold text-green-600">Customer Validation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>10 pilot customers signed up and onboarded</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>7/10 customers use product weekly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>5/10 customers export insights for board meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>3/10 customers express willingness to pay</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold text-blue-600">Product Quality</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Insights rated 8+/10 by customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Customers save average 5+ hours per board prep</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Zero data breaches or security incidents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Admin team can onboard new customer in &lt;2 hours</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold text-purple-600">Operational Efficiency</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Team spends &lt;5 hours/week per customer on data updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Insight generation averages &lt;20 min per request</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Identified clear automation opportunities from patterns</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold text-orange-600">Learning Goals</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Validated which metrics matter most per role</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Documented insight quality framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Identified top 5 data sources to automate first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Clear pricing model based on customer feedback</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Updated Success Metrics for automated approach */}
        <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold">Success Metrics for MVP</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-card p-6 shadow border">
              <h3 className="mb-4 font-bold text-lg text-primary">Product Metrics</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>10-20 pilot customers</strong> using product weekly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>80%+ data pipeline success rate</strong> (daily syncs complete without errors)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>3+ insights clicked per user per week</strong> (engagement signal)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>8+/10 average insight quality rating</strong> from customer feedback
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>2+ PDF exports per customer per month</strong> (board prep usage)
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-card p-6 shadow border">
              <h3 className="mb-4 font-bold text-lg text-primary">Business Metrics</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>$5K-15K ACV</strong> per pilot customer (validates pricing)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>3+ customer testimonials</strong> citing time savings and decision quality
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>50%+ would recommend</strong> to peers (NPS {">"} 50)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>2-3 reference customers</strong> willing to do case studies
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>
                    <strong>Clear automation roadmap</strong> for Series A based on learnings
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Mitigation */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">Risk Mitigation for MVP</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-yellow-600">Risk: Data Security with Manual Access</h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Customers give you read-only access to their systems. What if there's a breach?
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-semibold text-sm">Mitigation:</p>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
                      <li>Use customer's built-in access controls (read-only API keys, not passwords)</li>
                      <li>Store credentials in Vercel environment variables (encrypted at rest)</li>
                      <li>Document every data access in audit log</li>
                      <li>Sign data processing agreement (DPA) with each customer</li>
                      <li>Delete all customer data within 30 days of pilot end</li>
                      <li>Get cyber insurance ($1M-2M coverage, ~$2K/year)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-yellow-600">Risk: Data Pipeline Breaks or API Rate Limits</h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Automated pipelines can fail due to API changes, rate limits, auth expiration, or data schema
                    changes.
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-semibold text-sm">Mitigation:</p>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
                      <li>Build robust error handling + retry logic with exponential backoff</li>
                      <li>Admin dashboard shows pipeline health status for each customer</li>
                      <li>Alert system (Slack/email) when pipeline fails for &gt; 24 hours</li>
                      <li>Maintain manual CSV upload as backup when APIs fail</li>
                      <li>Start with most reliable APIs (Stripe, Salesforce) before flaky ones</li>
                      <li>Cache OAuth tokens with refresh logic to prevent auth failures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-orange-600">Risk: Manual Process Doesn't Scale</h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    What if you get 50 customers? Team will burn out updating metrics manually.
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-semibold text-sm">Mitigation:</p>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
                      <li>Cap pilot at 20 customers maximum</li>
                      <li>Build admin panel to make manual updates efficient (Week 5-6)</li>
                      <li>Track time spent per customer → Identify automation priorities</li>
                      <li>Automate most time-consuming tasks first (likely data pulls from top 3 sources)</li>
                      <li>Use pilot learnings to build automation roadmap for Series A fundraise</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/10 p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-red-600">Risk: Insight Quality Is Inconsistent</h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Without automation, different analysts might produce different quality insights.
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-semibold text-sm">Mitigation:</p>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
                      <li>Create detailed prompt templates for each metric type</li>
                      <li>Require peer review before publishing insights</li>
                      <li>Maintain "examples library" of 10/10 quality insights</li>
                      <li>Weekly quality review meeting with team</li>
                      <li>Collect customer ratings on every insight (8+/10 is the bar)</li>
                      <li>This manual curation is actually your competitive advantage vs. generic AI tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Updated risk about LLM insights being wrong or generic */}
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/10 p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-red-600">Risk: LLM-Generated Insights Are Wrong or Generic</h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Without human review, AI could produce hallucinated metrics, incorrect analysis, or bland generic
                    insights.
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-semibold text-sm">Mitigation:</p>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
                      <li>Daily spot-check quality review (10-15% sample) for first 2-3 months</li>
                      <li>Structured prompts with examples of great vs. poor insights</li>
                      <li>Quality scoring algorithm filters obviously bad insights before human review</li>
                      <li>Customer rating system (thumbs up/down) on every insight to track quality</li>
                      <li>Build "examples library" of 50+ great insights to improve prompts over time</li>
                      <li>If insight quality drops below 8/10 average, flag for immediate review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Requirements */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">Team & Budget</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold">Development Team</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">1 Senior Full-Stack Engineer</p>
                  <p className="text-sm text-muted-foreground">Frontend + backend + database</p>
                  <p className="text-sm font-medium text-primary mt-1">8 weeks, $40K-60K</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">1 Mid-Level Engineer</p>
                  <p className="text-sm text-muted-foreground">UI components + admin panel</p>
                  <p className="text-sm font-medium text-primary mt-1">8 weeks, $30K-40K</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">1 Product Designer (Part-time)</p>
                  <p className="text-sm text-muted-foreground">UI/UX for core flows</p>
                  <p className="text-sm font-medium text-primary mt-1">2 weeks, $8K-12K</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-lg border">
              <h3 className="mb-4 text-lg font-bold">Operations Team (Post-Launch)</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">1 Customer Success / Data Analyst</p>
                  <p className="text-sm text-muted-foreground">Data collection + insight curation</p>
                  <p className="text-sm font-medium text-primary mt-1">10-15 hrs/week, $25-35/hr</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">Tools & Infrastructure</p>
                  <p className="text-sm text-muted-foreground">Hosting, database, AI API costs</p>
                  <p className="text-sm font-medium text-primary mt-1">$200-500/month</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold">Total Ongoing Cost</p>
                  <p className="text-sm text-muted-foreground">For 10-20 pilot customers</p>
                  <p className="text-sm font-medium text-primary mt-1">$1,500-2,500/month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
            <h3 className="mb-2 text-xl font-bold">Total MVP Investment</h3>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <p className="mb-1 opacity-90">Development Cost</p>
                <p className="text-2xl font-bold">$80K-120K</p>
              </div>
              <div>
                <p className="mb-1 opacity-90">Time to Launch</p>
                <p className="text-2xl font-bold">8-10 weeks</p>
              </div>
              <div>
                <p className="mb-1 opacity-90">Monthly Operating</p>
                <p className="text-2xl font-bold">$2K-3K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 p-8">
          <h2 className="mb-6 text-3xl font-bold">Recommended Next Steps</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold">Validate with 3-5 Target Customers</p>
                <p className="text-sm text-muted-foreground">
                  Show current prototype + this plan. Get commitment to pilot.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold">Hire Development Team</p>
                <p className="text-sm text-muted-foreground">1 senior + 1 mid-level engineer. Start Week 1.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold">Build Admin Panel First</p>
                <p className="text-sm text-muted-foreground">You need this to operate efficiently. Don't skip it.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold">Document Everything</p>
                <p className="text-sm text-muted-foreground">
                  Track what works, what doesn't. This informs automation priorities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                5
              </div>
              <div className="flex-1">
                <p className="font-semibold">Plan Fundraise Around Traction</p>
                <p className="text-sm text-muted-foreground">
                  10 happy pilots + clear automation roadmap = strong seed/Series A story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for timeline items
function TimelineItem({ week, task, status }: { week: string; task: string; status: string }) {
  const statusColorMap: { [key: string]: string } = {
    Foundation: "bg-blue-500/10 text-blue-600",
    Critical: "bg-red-500/10 text-red-600",
    "MVP Complete": "bg-green-500/10 text-green-600",
  }
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-bold text-lg">{week}</span>
        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${statusColorMap[status]}`}>{status}</span>
      </div>
      <p className="text-muted-foreground">{task}</p>
    </div>
  )
}
