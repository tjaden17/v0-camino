export default function MSSScope() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0a1e]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <p className="text-sm font-medium text-[#a78bfa] mb-1">Camino Signal</p>
          <h1 className="text-2xl font-bold tracking-tight">Minimum Sellable Service - Recommended Scope</h1>
          <p className="text-sm text-white/50 mt-1">Draft v2 - Revised with prioritisation, refined acceptance criteria, and build guidance</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* Billing Definition */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#a78bfa]">Definition of Billable</h2>
          <p className="text-white/70 leading-relaxed">
            The customer agrees to pay when ALL of the following are true:
          </p>
          <div className="grid gap-3">
            {[
              "They have been onboarded and the system understands their role, goals, and context",
              "Their data has been ingested and the system has normalised it into a persistent org data layer",
              "The system has generated at least 3 signals from their real data, with values and trends",
              "Each signal has a 5-section AI analysis that is specific to their context, not generic",
              "The user can view, expand, and browse their signals in a deployed production app",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                <p className="text-white/80 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Tiers */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#a78bfa]">Priority Tiers</h2>
          <p className="text-white/70 leading-relaxed text-sm">
            User stories are grouped into three tiers. Tier 1 is the critical path to billing. Tier 2 enables retention. Tier 3 is operational infrastructure.
          </p>
          <div className="grid gap-4">
            <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/30 rounded-xl p-5">
              <h3 className="font-bold text-[#a78bfa] mb-2">Tier 1: Critical Path to Billing</h3>
              <p className="text-white/60 text-sm mb-3">Without these, the customer will not pay. Build first.</p>
              <div className="space-y-1 text-sm text-white/80">
                <p>US1 - Collect user context (discovery + admin CP)</p>
                <p>US3 - Data input (CSV upload + admin assist + normalisation)</p>
                <p>US4 - Signal generation (3+ signals from real data)</p>
                <p>US5 - Signal card display (basic info + expanded AI analysis)</p>
                <p>US6 - AI analysis engine (5-section contextual analysis)</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-2">Tier 2: Enables Retention</h3>
              <p className="text-white/60 text-sm mb-3">Without these, the customer pays once but churns. Build within 2 weeks of first billing.</p>
              <div className="space-y-1 text-sm text-white/80">
                <p>US7 - Signal browsing dashboard</p>
                <p>US10 - Weekly signal refresh cadence (NEW)</p>
                <p>US11 - Signal sharing (NEW)</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-2">Tier 3: Operational Infrastructure</h3>
              <p className="text-white/60 text-sm mb-3">Required to operate but not customer-facing value. Build in parallel.</p>
              <div className="space-y-1 text-sm text-white/80">
                <p>US2 - User profile page (read-only)</p>
                <p>US8 - Admin panel (users, orgs, data management)</p>
                <p>US9 - Production deployment</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* US1 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">TIER 1</span>
            <h2 className="text-xl font-bold">US1: Collect User Context</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Camino Admin, I want to capture a new customer{"'"}s role, goals, upcoming decisions, signal preferences, and organisation context during a discovery call, so the system can generate relevant, personalised signals.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="1.1" text="Admin CP has a 'Create Organisation' form with fields: org name, industry, company size (headcount range), ARR range, funding stage, product category." />
                <ACItem id="1.2" text="Admin CP has a 'Create User' form with fields: name, email, role (dropdown from role-config list), primary goal (free text), upcoming decisions (free text, max 3), signal preferences (multi-select from category list: Customer, Market, Product, Sales, Marketing, Engineering, Delivery)." />
                <ACItem id="1.3" text="Admin can assign a user to an organisation. One user belongs to one org. One org can have multiple users." />
                <ACItem id="1.4" text="All user and org data is persisted to the database immediately on save." />
                <ACItem id="1.5" text="Admin can edit any user or org field after creation." />
                <ACItem id="1.6" text="System stores a 'context snapshot' (JSON blob of all user + org fields) that is passed to the AI prompt in US6. This snapshot is versioned so changes over time are tracked." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">User self-registration. User editing their own profile. Automated context collection. Multi-org users.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Build the Admin CP as a simple protected route (/admin). Use Supabase Auth with a single admin account (your email). Forms can be basic shadcn/ui form components. No need for a polished design - this is internal tooling. Spend max 1-2 days here.
              </p>
            </div>
          </div>
        </section>

        {/* US2 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 3</span>
            <h2 className="text-xl font-bold">US2: User Can See Their Profile</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User, I want to see my profile information so I can confirm the system understands my role, goals, and what matters to me.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="2.1" text="User sees a read-only profile card showing: their name, role, organisation name, primary goal, upcoming decisions, and signal preferences." />
                <ACItem id="2.2" text="Profile data is fetched from the database (not hardcoded or localStorage)." />
                <ACItem id="2.3" text="If any field is missing, show 'Not set' in muted text (not an error)." />
                <ACItem id="2.4" text="A small note at the bottom: 'Contact your Camino advisor to update your profile.'" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">Edit functionality. Profile photo. Notification preferences. Data integration management.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Single card component. Fetch user record from Supabase on page load. Half a day max. Do not build a full profile page - a single card in the top of the signals dashboard is sufficient.
              </p>
            </div>
          </div>
        </section>

        {/* US3 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">TIER 1</span>
            <h2 className="text-xl font-bold">US3: Data Input</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User (or Camino Admin on their behalf), I want to upload CSV files containing business data so the system can ingest, normalise, and store it for signal generation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="3.1" text="User can upload 1 or more CSV files via a drag-and-drop zone or file picker. Max file size: 10MB. Accepted format: .csv only." />
                <ACItem id="3.2" text="On upload, system parses the CSV headers and first 10 rows to understand the data structure." />
                <ACItem id="3.3" text="System generates up to 3 clarifying prompts about the data. Examples: 'What does the column amount represent - monthly revenue or total contract value?', 'What currency are these values in?', 'What date range does this data cover?'" />
                <ACItem id="3.4" text="Camino Admin (via Admin CP) OR the user can answer the prompts. Answers are stored alongside the file metadata." />
                <ACItem id="3.5" text="System normalises column names to a standard taxonomy. For example: 'cust_acq_cost' maps to 'customer_acquisition_cost'. Normalisation uses LLM-assisted field matching with pre-built templates for common naming patterns." />
                <ACItem id="3.6" text="Normalised data is stored in a persistent org data layer (Supabase table partitioned by org_id). Each upload is timestamped. Subsequent uploads append to or update the existing data layer, not replace it." />
                <ACItem id="3.7" text="System stores file metadata: original filename, upload date, uploader (user or admin), row count, column count, normalisation mappings applied, prompt answers." />
                <ACItem id="3.8" text="Upload status is visible: 'Processing', 'Ready', or 'Needs Attention' (if prompts are unanswered or normalisation confidence is below 70%)." />
                <ACItem id="3.9" text="Admin CP shows a data management view: list of all uploads per org, with status, row counts, and ability to re-upload or delete." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Data Normalisation Detail</h3>
              <div className="bg-black/30 rounded-lg p-4 text-sm text-white/70 space-y-2">
                <p><strong className="text-white/90">Step 1:</strong> Parse CSV headers. Extract column names and infer data types from first 10 rows (string, number, date, currency).</p>
                <p><strong className="text-white/90">Step 2:</strong> Match against known taxonomy. Use pre-built mapping templates for common data sources (Stripe exports, Salesforce reports, HubSpot exports, Google Analytics).</p>
                <p><strong className="text-white/90">Step 3:</strong> LLM fallback. For unrecognised fields, send column name + sample values to LLM. Ask: {"'"} What business metric does this column likely represent? Return standardised metric name and confidence score.{"'"}</p>
                <p><strong className="text-white/90">Step 4:</strong> Store mapping. Save the original-to-normalised field mapping per file. Reuse for future uploads from the same source.</p>
                <p><strong className="text-white/90">Step 5:</strong> Flag low confidence. If any mapping has confidence below 70%, mark file as {"'"}Needs Attention{"'"} and generate a clarifying prompt.</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">API integrations (Stripe, Salesforce direct connect). Real-time data sync. Excel/Google Sheets formats. Data validation rules beyond type checking.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                This is the hardest user story technically. Break it into two parts: (A) File upload + storage (2 days) using Supabase Storage for raw files and a Supabase table for parsed data, and (B) Normalisation pipeline (3-4 days) using an LLM call to map columns. For MVP, the normalisation can run server-side in a Next.js API route triggered after upload. Do not try to build a real ETL pipeline. A simple parse-map-store flow is sufficient.
              </p>
            </div>
          </div>
        </section>

        {/* US4 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">TIER 1</span>
            <h2 className="text-xl font-bold">US4: Signal Generation</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                System, I want to analyse the normalised org data layer and generate at least 3 meaningful signals with basic metric information, so users see immediate value from their uploaded data.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="4.1" text="Signal generation is triggered automatically after a file upload reaches 'Ready' status (all prompts answered, normalisation complete)." />
                <ACItem id="4.2" text="System reads all normalised data fields for the org and identifies which metrics can be calculated (e.g., if 'monthly_revenue' column exists with multiple months, system can calculate MRR and MRR trend)." />
                <ACItem id="4.3" text="System generates a minimum of 3 signals. Each signal contains: signal name (human-readable, e.g., 'Monthly Recurring Revenue'), current value (calculated from latest data point), trend direction (up, down, flat - calculated by comparing latest value to previous period), percentage change (numeric, e.g., '+12.4%'), category (mapped to one of: Customer, Market, Product, Sales, Marketing, Engineering, Delivery)." />
                <ACItem id="4.4" text="If the system cannot generate 3 signals from available data, it flags this to Camino Admin via the Admin CP with a message: 'Only [N] signals generated. Additional data may be needed.' Admin can then request more files from the customer." />
                <ACItem id="4.5" text="Signals are persisted to the database, linked to the org. Each signal has a generated_at timestamp." />
                <ACItem id="4.6" text="Signal values are recalculated when new data is uploaded. Previous signal values are retained (not overwritten) to enable historical trend tracking." />
                <ACItem id="4.7" text="Signal generation completes within 60 seconds of trigger. User sees a 'Generating your signals...' loading state if they are on the dashboard during generation." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Signal Discovery Logic</h3>
              <div className="bg-black/30 rounded-lg p-4 text-sm text-white/70 space-y-2">
                <p><strong className="text-white/90">Input:</strong> Normalised data fields + user context snapshot (role, goals, preferences from US1).</p>
                <p><strong className="text-white/90">Step 1:</strong> Identify calculable metrics. For each normalised field, check if it has enough data points (min 2 time periods) to calculate a trend.</p>
                <p><strong className="text-white/90">Step 2:</strong> Rank by relevance. Use user{"'"}s role and signal preferences to prioritise. A Head of Sales sees pipeline signals first. A Head of Delivery sees velocity signals first.</p>
                <p><strong className="text-white/90">Step 3:</strong> Select top signals. Pick the 3-5 highest-relevance signals that have sufficient data quality (no nulls in key fields, at least 2 time periods).</p>
                <p><strong className="text-white/90">Step 4:</strong> Calculate values. Run aggregation queries on the normalised data: SUM, AVG, COUNT, or custom formulas depending on metric type.</p>
                <p><strong className="text-white/90">Step 5:</strong> Calculate trends. Compare current period to previous period. Determine direction (up/down/flat) and percentage change.</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">Benchmark comparisons in signal generation. Cross-org signal analysis. Predictive signals. Alert thresholds.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Signal generation is an LLM call, not a rules engine. Send the normalised schema + sample data + user context to Claude and ask it to identify the top signals and calculate values. The LLM handles the intelligence; you handle the data access and storage. This is 2-3 days of work: 1 day for the prompt engineering, 1 day for the calculation logic, 1 day for storage and error handling.
              </p>
            </div>
          </div>
        </section>

        {/* US5 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">TIER 1</span>
            <h2 className="text-xl font-bold">US5: Signal Card Display</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User, I want to see my signals displayed as clear, scannable cards with the option to expand each one for detailed AI analysis, so I can quickly understand what{"'"}s happening and go deeper when needed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="5.1" text="Each signal is displayed as a card showing: signal name (bold, primary text), current value (large, prominent), trend indicator (up arrow green, down arrow red, flat arrow grey), percentage change (coloured to match trend), category badge (e.g., 'Sales', 'Customer')." />
                <ACItem id="5.2" text="Cards are displayed in a vertical scrollable list. Default sort: by relevance to user's role (most relevant first)." />
                <ACItem id="5.3" text="Tapping/clicking a card expands an accordion or opens a detail view showing the full 5-section AI analysis (from US6)." />
                <ACItem id="5.4" text="If AI analysis has not yet been generated for a signal, the expanded view shows a loading skeleton with text: 'Generating analysis...'. Analysis should appear within 10 seconds." />
                <ACItem id="5.5" text="Each card shows a 'last updated' timestamp in muted text (e.g., 'Updated 2 hours ago')." />
                <ACItem id="5.6" text="Cards render correctly on mobile (375px width) and desktop (up to 1440px). Mobile is the primary design target." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">Saving/bookmarking signals. Sharing signals. Commenting on signals. Editing signal names. Charts or sparklines within cards.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                You already have the InsightCard component in v0. Adapt it to read from the database instead of mock data. The expanded view is where customers decide to pay - make the AI analysis text beautifully formatted with clear section headers. This is 1-2 days: connect existing component to real data, style the expanded view.
              </p>
            </div>
          </div>
        </section>

        {/* US6 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">TIER 1</span>
            <h2 className="text-xl font-bold">US6: AI Analysis Engine</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                System, I want to generate a 5-section contextual analysis for each signal, using the user{"'"}s org context and data, so the user receives consulting-grade insight rather than a raw number.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="6.1" text="For each signal generated in US4, system sends a prompt to the LLM containing: the signal name, value, trend, percentage change, the underlying data (relevant rows/columns), the user context snapshot (role, goals, upcoming decisions), and the org context (industry, stage, size)." />
                <ACItem id="6.2" text="LLM returns a structured 5-section analysis. Section 1 - What's Happening: Plain-language summary of the metric and its current state (2-3 sentences). Section 2 - Why It Matters: Explanation of why this signal is relevant to this specific user's role and goals (2-3 sentences). Section 3 - Root Cause Indicators: What might be driving this trend, based on available data and industry patterns (2-4 bullet points). Section 4 - Risk & Opportunity: What happens if this trend continues - both downside risk and upside opportunity (2-3 sentences). Section 5 - Recommended Actions: 2-3 specific, actionable next steps the user could take this week (numbered list)." />
                <ACItem id="6.3" text="Each section is returned as structured JSON (not a single text blob) so the frontend can render each section with its own heading and styling." />
                <ACItem id="6.4" text="Analysis is generated immediately after signal generation (US4). Both run as a single pipeline: upload triggers signal generation triggers analysis generation." />
                <ACItem id="6.5" text="Analysis is cached in the database. Subsequent views of the same signal serve the cached version (no repeated LLM calls). Cache is invalidated when new data is uploaded." />
                <ACItem id="6.6" text="If LLM call fails, system retries once after 5 seconds. If retry fails, signal card shows: 'Analysis temporarily unavailable. Check back shortly.' Admin is notified via Admin CP." />
                <ACItem id="6.7" text="Analysis quality bar: every analysis must reference specific numbers from the user's data (e.g., 'Your CAC increased from $42 to $58'), not generic statements. The prompt must enforce this." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Prompt Structure</h3>
              <div className="bg-black/30 rounded-lg p-4 text-sm text-white/70 space-y-2 font-mono">
                <p className="text-white/50">{"// Simplified prompt structure"}</p>
                <p>{"You are a senior business analyst advising a {user.role} at a {org.stage} {org.industry} company with {org.headcount} employees and {org.arr} ARR."}</p>
                <p className="mt-2">{"Their primary goal is: {user.primary_goal}"}</p>
                <p>{"Their upcoming decisions include: {user.upcoming_decisions}"}</p>
                <p className="mt-2">{"Analyse this signal:"}</p>
                <p>{"Signal: {signal.name}"}</p>
                <p>{"Current Value: {signal.value}"}</p>
                <p>{"Previous Value: {signal.previous_value}"}</p>
                <p>{"Change: {signal.percentage_change}"}</p>
                <p>{"Trend: {signal.trend}"}</p>
                <p>{"Underlying Data: {signal.data_summary}"}</p>
                <p className="mt-2">{"Return JSON with exactly 5 sections..."}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">User feedback on analysis quality (thumbs up/down). Analysis refinement based on user questions. Comparative analysis across multiple signals. Benchmark references within analysis.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                This is the most important user story for billing. Spend 3-4 days here, with at least 1 full day on prompt engineering alone. Test with real-ish data (export your own Stripe data, a sample Salesforce report). The difference between a generic analysis and a great one is entirely in the prompt. Use Claude Sonnet via Vercel AI Gateway. Request structured output (JSON mode) to avoid parsing issues.
              </p>
            </div>
          </div>
        </section>

        {/* US7 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 2</span>
            <h2 className="text-xl font-bold">US7: Signal Browsing Dashboard</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User, I want to browse through all my signals in a simple, scrollable dashboard so I can scan what{"'"}s important and focus on what needs my attention.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="7.1" text="Dashboard shows all signals for the user's org in a vertical scrollable list. Default: single-card focus view (one card prominent, others peeking above/below)." />
                <ACItem id="7.2" text="User can toggle to a stacked/compact view showing 3-4 cards visible at once (smaller cards, less detail)." />
                <ACItem id="7.3" text="Signals are sorted by: most recently updated first (default). No additional sort options for MSS." />
                <ACItem id="7.4" text="Dashboard shows total signal count at the top: 'You have [N] signals'." />
                <ACItem id="7.5" text="If zero signals exist, show an empty state: 'Your signals are being generated. This usually takes a few minutes after data upload.'" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">Filtering by category. Search. Favouriting. Signal grouping. Drag to reorder.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Keep this dead simple for MSS. A list of cards with a view toggle. No filtering, no categories, no search. You have 3-10 signals per customer at this stage - they do not need a complex dashboard. 1 day max.
              </p>
            </div>
          </div>
        </section>

        {/* US8 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 3</span>
            <h2 className="text-xl font-bold">US8: Admin Panel</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Camino Admin, I want a control panel to manage organisations, users, data uploads, and signal generation so I can operate the service efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="8.1" text="Admin panel is accessible at /admin, protected by Supabase Auth. Only the admin email can access." />
                <ACItem id="8.2" text="Organisations view: list all orgs, create new org, edit org, see number of users and uploads per org." />
                <ACItem id="8.3" text="Users view: list all users (filterable by org), create new user, edit user, assign user to org." />
                <ACItem id="8.4" text="Data view: list all uploads per org, see upload status (Processing/Ready/Needs Attention), view clarifying prompts and answer them, trigger re-processing of a file, delete a file." />
                <ACItem id="8.5" text="Signals view: list all signals per org, see signal status (generated/pending/failed), manually trigger signal regeneration for an org, view AI analysis output for quality checking." />
                <ACItem id="8.6" text="Dashboard: total orgs, total users, total uploads, total signals, uploads needing attention (count)." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Out of Scope</h3>
              <p className="text-white/60 text-sm">Multi-admin access. Role-based admin permissions. Audit logging. Analytics/reporting on admin actions.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Build this incrementally alongside the other stories. When you build US1, add the org/user forms to /admin. When you build US3, add the data management view. Do not build the full admin panel upfront. Use basic shadcn/ui tables and forms. No fancy design needed. This is your operations tool, not a customer-facing product.
              </p>
            </div>
          </div>
        </section>

        {/* US9 */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 3</span>
            <h2 className="text-xl font-bold">US9: Production Deployment</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Camino Admin, I want the app deployed to a production URL with proper authentication so customers can access their signals securely from any device.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="9.1" text="App is deployed to Vercel on a custom domain (e.g., app.camino.signal or similar)." />
                <ACItem id="9.2" text="User authentication via Supabase Auth. Users log in with email + password (set by admin during onboarding). No self-registration." />
                <ACItem id="9.3" text="All pages except /login are protected. Unauthenticated users are redirected to /login." />
                <ACItem id="9.4" text="User can only see signals and data belonging to their own organisation. Row-level security enforced at the database level." />
                <ACItem id="9.5" text="HTTPS enforced on all routes (Vercel handles this by default)." />
                <ACItem id="9.6" text="App loads in under 3 seconds on mobile 4G connection." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Vercel deployment is automatic from git push. Supabase Auth setup is 2-3 hours. Row-level security is 1-2 hours of SQL policies. Custom domain is 30 minutes. Total: 1 day. Do this in week 1 so every subsequent build is tested on the real production URL.
              </p>
            </div>
          </div>
        </section>

        {/* US10 - NEW */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 2</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">NEW</span>
            <h2 className="text-xl font-bold">US10: Weekly Signal Refresh</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User, I want my signals to be refreshed weekly with updated data and analysis so the platform remains valuable beyond the first week and I have a reason to return.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="10.1" text="Every Monday at 9am, system sends the user (and Camino Admin) an email: 'Time to refresh your signals. Upload your latest data or reply to this email with updated files.'" />
                <ACItem id="10.2" text="If user uploads new data, signal generation (US4) and analysis (US6) are re-triggered automatically. New signal values are stored alongside historical values (append, not replace)." />
                <ACItem id="10.3" text="If user does not upload new data within 48 hours, Camino Admin follows up manually. This is a human process, not automated." />
                <ACItem id="10.4" text="When signals are refreshed, the card shows both the current value and the previous value, with a 'since last week' comparison." />
                <ACItem id="10.5" text="Dashboard shows a 'Last refreshed: [date]' indicator at the top. If signals are older than 7 days, show a muted prompt: 'Your signals are due for a refresh. Upload new data to get the latest insights.'" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Why This Is Critical for Retention</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Without fresh signals, customers see the same 3 cards every time they log in. By week 3, they stop logging in. The weekly refresh creates a reason to return, a habit loop, and increasing value as historical trends accumulate. This is the difference between a one-time report and an ongoing service.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                The email can be a simple Resend API call triggered by a Vercel cron job. The refresh logic is identical to the initial generation pipeline - just re-run US4 + US6 with the new data. The week-over-week comparison is a simple database query comparing the two most recent signal values. 1-2 days of work.
              </p>
            </div>
          </div>
        </section>

        {/* US11 - NEW */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">TIER 2</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">NEW</span>
            <h2 className="text-xl font-bold">US11: Signal Sharing</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">As a...</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                User, I want to share a signal (card + AI analysis) with a colleague via email or link so I can use insights in conversations, meetings, and decisions without screenshotting.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                <ACItem id="11.1" text="Each signal card has a 'Share' button (icon only on mobile, icon + label on desktop)." />
                <ACItem id="11.2" text="Tapping Share opens a modal with two options: 'Copy Link' (generates a read-only shareable URL) and 'Send via Email' (sends the signal card + analysis as a formatted email to a specified address)." />
                <ACItem id="11.3" text="Shared link shows the signal card and full analysis on a public read-only page. No login required. Link expires after 30 days." />
                <ACItem id="11.4" text="Shared page includes a subtle footer: 'Powered by Camino Signal - Get insights for your team' with a link to a signup/contact page." />
                <ACItem id="11.5" text="Email share sends a clean, formatted email with the signal summary and a link to the full analysis page." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Why This Drives Growth</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Every shared signal is a product demo sent by your customer to a potential customer. The colleague sees a beautifully formatted insight, thinks {"'"}where did this come from?{"'"}, and sees the Camino branding. This is your lowest-cost acquisition channel.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Build Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Shareable links are a public Next.js page at /share/[token]. Token is a random string mapped to a signal ID in the database. Email is a Resend API call with a React Email template. 1-2 days of work. Build this immediately after US5 because it{"'"}s the primary growth mechanism.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Build Timeline */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#a78bfa]">Recommended Build Order</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Sequenced to deliver the billing exit criteria as fast as possible, then retention features.
          </p>
          <div className="space-y-4">
            <TimelineWeek
              week="Week 1"
              label="Foundation"
              items={[
                "US9: Deploy to production + Supabase Auth + RLS (Day 1)",
                "US8: Admin panel skeleton - create org + create user forms (Day 2)",
                "US1: User context collection via Admin CP (Day 3-4)",
                "US2: Read-only profile card (Day 4, afternoon)",
              ]}
            />
            <TimelineWeek
              week="Week 2"
              label="Data Pipeline"
              items={[
                "US3: CSV upload + file storage (Day 1-2)",
                "US3: Normalisation pipeline with LLM (Day 3-4)",
                "US3: Clarifying prompts + admin answers (Day 5)",
              ]}
            />
            <TimelineWeek
              week="Week 3"
              label="Signal Engine"
              items={[
                "US4: Signal generation from normalised data (Day 1-2)",
                "US6: AI analysis engine + prompt engineering (Day 3-5)",
                "Test with real data: export your own Stripe/analytics CSV",
              ]}
            />
            <TimelineWeek
              week="Week 4"
              label="Customer-Facing UI"
              items={[
                "US5: Signal card display + expanded analysis view (Day 1-2)",
                "US7: Signal browsing dashboard with view toggle (Day 3)",
                "End-to-end testing: upload CSV, see signals, read analysis (Day 4-5)",
              ]}
            />
            <TimelineWeek
              week="Week 5"
              label="First Customer"
              items={[
                "Onboard first pilot customer via discovery call",
                "Upload their data, generate signals, quality-check analysis",
                "Bug fixes and UI polish based on real usage",
              ]}
            />
            <TimelineWeek
              week="Week 6-7"
              label="Retention Features"
              items={[
                "US10: Weekly signal refresh + email reminders (2 days)",
                "US11: Signal sharing via link + email (2 days)",
                "Iterate on analysis quality based on customer feedback",
                "Ask customer: 'Would you pay for this?'",
              ]}
            />
          </div>
        </section>

        {/* Database Schema */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#a78bfa]">Core Database Schema</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Minimum tables required to support all user stories. Every table has RLS policies scoping access by org_id.
          </p>
          <div className="bg-black/30 rounded-xl p-5 font-mono text-sm text-white/70 space-y-4 overflow-x-auto">
            <div>
              <p className="text-[#a78bfa]">-- organisations</p>
              <p>id, name, industry, headcount_range, arr_range, funding_stage, product_category, created_at</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- users</p>
              <p>id, org_id, email, name, role, primary_goal, upcoming_decisions (jsonb), signal_preferences (text[]), context_snapshot (jsonb), created_at</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- uploads</p>
              <p>id, org_id, uploaded_by, filename, storage_path, row_count, column_count, status (processing/ready/needs_attention), normalisation_mappings (jsonb), prompt_answers (jsonb), created_at</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- org_data</p>
              <p>id, org_id, upload_id, metric_name (normalised), value, period_start, period_end, raw_column_name, created_at</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- signals</p>
              <p>id, org_id, signal_name, category, current_value, previous_value, trend (up/down/flat), percentage_change, generated_at, data_source_upload_id</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- signal_analyses</p>
              <p>id, signal_id, whats_happening (text), why_it_matters (text), root_causes (jsonb), risk_opportunity (text), recommended_actions (jsonb), generated_at, llm_model, prompt_version</p>
            </div>
            <div>
              <p className="text-[#a78bfa]">-- shared_signals</p>
              <p>id, signal_id, token (unique), created_by, expires_at, view_count, created_at</p>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#a78bfa]">Success Metrics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-3">Billing Metrics</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>Time from first upload to signals visible: target {"<"} 24 hours</p>
                <p>Signals generated per customer: target 3-5 minimum</p>
                <p>Customer says {"'"} I would pay for this{"'"}: within 2 weeks of onboarding</p>
                <p>First invoice sent: within 4 weeks of onboarding</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-3">Retention Metrics</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>Weekly return rate: target 60%+ of users log in weekly</p>
                <p>Data refresh rate: target 75%+ upload new data weekly</p>
                <p>Signals shared per customer per month: target 2+</p>
                <p>Month 2 retention: target 80%+ still active</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-3">Quality Metrics</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>Signal accuracy: customer confirms {"'"} this is correct{"'"} for 90%+ signals</p>
                <p>Analysis usefulness: customer references analysis in a real meeting</p>
                <p>Normalisation success rate: 80%+ fields auto-mapped correctly</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white/90 mb-3">Operational Metrics</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>Admin time per customer per week: target {"<"} 1 hour</p>
                <p>LLM cost per signal analysis: target {"<"} $0.50</p>
                <p>Uptime: 99%+ (Vercel handles this)</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

function ACItem({ id, text }: { id: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 text-xs font-mono text-[#a78bfa]/70 mt-0.5 w-8">{id}</span>
      <p className="text-white/80 text-sm leading-relaxed">{text}</p>
    </div>
  )
}

function TimelineWeek({ week, label, items }: { week: string; label: string; items: string[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="px-3 py-1 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-xs font-bold">{week}</span>
        <span className="text-white/90 font-semibold text-sm">{label}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <p key={i} className="text-white/70 text-sm pl-1">{item}</p>
        ))}
      </div>
    </div>
  )
}
