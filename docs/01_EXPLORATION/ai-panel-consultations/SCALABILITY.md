# AI Expert Panel Consultation: Scalability & Data Architecture

Date: Feb 16, 2026
Topic: Universal schema, data onboarding, opportunities/risks analysis, and synthesis data requirements

---

## Extended Consultation: Non-CRM Data Shapes (Feb 25, 2026)

Topic: What happens when customers bring data that is NOT CRM — support tickets, product analytics, financial exports?

### The Core Problem

The universal schema works for CRM because deal and lead data is predictable. But our market uses data that has completely different shapes, and a single universal schema cannot cover all of them.

Three categories we have not fully designed for:

**Ticket / Case Data (Zendesk, Pendo, Freshdesk, Intercom)**
Each row is a discrete event with a timestamp and status lifecycle. Signals here are duration and volume based — average resolution time, open ticket count, tickets by category. Completely different math than pipeline signals.

**Product / Usage Analytics (Pendo, Mixpanel, Amplitude)**
Each row is a behavioural event — user did something at a point in time. The properties column is a freeform JSON blob. Every product defines its own event names. There is no universal schema possible here without tool-specific extractors.

**Financial / Operational (Xero, QuickBooks, custom exports)**
Each row is a ledger entry or transaction. Chart of accounts varies per business. "Revenue" might be split five ways or one way depending on the company.

### The Recommended Solution: Data Shape Registry

Instead of one universal schema, maintain a registry of schemas — one per data type. Each schema has its own alias library, its own signal library, and its own calculation logic.

The architectural rule: every schema, every alias, every signal definition lives in the database as configuration — not in application code. Adding Freshdesk support should mean inserting rows into an alias table, not writing and deploying code.

### The JSON Problem for Product Analytics

Do not try to build a generic JSON parser for event properties. Build tool-specific extractors instead — a Pendo extractor that knows Pendo's standard event taxonomy, a Mixpanel extractor that knows Mixpanel's structure. One adapter per tool, built once, reused for every customer on that tool.

### Decision

Full architecture decision saved to: 00_DECISIONS/architecture/DATA_SHAPE_REGISTRY.md

---

## Question 1: Universal Data Schema & Scale

**Jordan (Data Engineer):**

The universal data schema is the key to making Camino work across Zoho, HubSpot, Salesforce, and any future tool without rewriting the calculation engine. Let me explain how it works and why it matters.

### What is the Universal Schema?

The universal schema is a set of **normalized field names** that represent business concepts, not tool-specific column names:

**Deals Schema:**
- `deal_value` (not "Amount" or "amount" or "Revenue")
- `stage` (not "Stage" or "dealstage" or "Status")
- `close_date` (not "Closing Date" or "closedate" or "Expected Close Date")
- `owner` (not "Deal Owner Name" or "Owner" or "Assigned To")
- `account_name` (not "Account Name" or "Company" or "Organization")
- `probability` (not "Probability %" or "Win Probability")
- `lead_source` (not "Lead Source" or "Source" or "Origin")

**Leads Schema:**
- `lead_status` (not "Lead Status" or "Status" or "State")
- `created_date` (not "Created Time" or "Date Created" or "Created At")
- `is_converted` (not "Is Converted" or "Converted" or "Conversion Status")
- `lead_owner` (not "Lead Owner" or "Owner Name" or "Assigned To")
- `company` (not "Company" or "Account" or "Organization")

**Tickets Schema:**
- `ticket_status` (not "Status" or "Ticket Status" or "State")
- `priority` (not "Priority" or "Ticket Priority" or "Severity")
- `resolution_time` (not "Resolution Time in Business Hours" or "Time to Resolve" or "Resolution Duration")
- `first_response_time` (not "First Response Time" or "Initial Response" or "Time to First Reply")
- `created_date` (not "Created Time" or "createdTime" or "Date Opened")
- `category` (not "Category" or "Type" or "Issue Type")
- `agent` (not "Agent Email" or "Assigned Agent" or "Owner")

### How it Enables Scale

**With universal schema:**
\`\`\`typescript
// Signal definition (universal)
{
  signalId: "pipeline_value",
  calcSpec: {
    operation: "sum",
    valueField: "deal_value",  // ← Universal field name
    filters: [
      { field: "stage", op: "excludes", values: ["closed won", "closed lost"] }
    ]
  }
}

// Works for ANY tool because the mapping happens earlier:
// Zoho: "Amount" → deal_value
// HubSpot: "amount" → deal_value
// Salesforce: "Amount" → deal_value
// Custom spreadsheet: "Revenue" → deal_value
\`\`\`

**Without universal schema:**
\`\`\`typescript
// Would need tool-specific signal definitions
{
  signalId: "pipeline_value_zoho",
  calcSpec: { valueField: "Amount", filters: [{ field: "Stage", ... }] }
}
{
  signalId: "pipeline_value_hubspot",
  calcSpec: { valueField: "amount", filters: [{ field: "dealstage", ... }] }
}
// ← Every signal needs 3+ versions. Unmaintainable.
\`\`\`

### How It Works in Practice

**Layer 1: Tool-specific raw data**
\`\`\`csv
Amount,Stage,Closing Date,Deal Owner Name
AUD 54000.00,Closed Won,11-Oct-2025,Surge Singh
\`\`\`

**Layer 2: FIELD_ALIASES mapping (automatic)**
\`\`\`typescript
FIELD_ALIASES = {
  deal_value: ["amount", "deal amount", "revenue", "deal value", "value", "total value"],
  stage: ["stage", "dealstage", "deal stage", "status", "opportunity stage"],
  close_date: ["closing date", "closedate", "expected close date", "close date"],
  owner: ["deal owner", "deal owner name", "owner", "assigned to", "owner name"]
}

// System searches for "Amount" in all aliases
// Finds "amount" in deal_value aliases
// Maps: "Amount" → deal_value
\`\`\`

**Layer 3: Normalized data (what the calc engine sees)**
\`\`\`json
{
  "deal_value": 54000.00,
  "stage": "closed won",
  "close_date": "2025-10-11",
  "owner": "Surge Singh"
}
\`\`\`

**Layer 4: Calculation (universal, works for any tool)**
\`\`\`typescript
// SUM(deal_value) WHERE stage NOT IN ["closed won", "closed lost"]
// This formula never changes regardless of source tool
\`\`\`

### Why This Matters for Scale

**Adding customer #2 (HubSpot user):**
1. Upload HubSpot CSV with columns: `amount`, `dealstage`, `closedate`, `hubspot_owner_id`
2. System checks FIELD_ALIASES: "amount" → `deal_value`, "dealstage" → `stage`, "closedate" → `close_date`
3. "hubspot_owner_id" doesn't match any alias → 3-question flow asks admin to confirm mapping
4. Admin confirms: "hubspot_owner_id" → `owner`
5. Mapping stored in database for this org
6. Same 7 signals, same calculation engine, same AI interpretation

**Adding customer #10 (Salesforce user):**
1. Upload Salesforce CSV: `Amount`, `StageName`, `CloseDate`, `Owner.Name`
2. "Amount" → `deal_value` (already in aliases)
3. "StageName" → `stage` (add to aliases)
4. "CloseDate" → `close_date` (already in aliases)
5. "Owner.Name" → `owner` (add to aliases)
6. Everything works. No code changes.

**Adding customer #50 (custom in-house CRM):**
1. Upload CSV: `Revenue_USD`, `Deal_Status`, `Expected_Signature_Date`, `Sales_Rep_Email`
2. None of these match aliases exactly
3. 3-question flow: admin maps each one to universal fields
4. Mapping stored
5. Everything works

### Data Types That Scale

The universal schema handles these entity types (expandable):

**Core entities (MSS focus):**
- Deals / Opportunities
- Leads / Prospects
- Tickets / Support cases
- Accounts / Customers

**Future entities (Tier 2+):**
- Users / Contacts
- Invoices / Subscriptions (for churn)
- Activities / Events (for engagement)
- Products / Line items (for product analytics)

Each entity has a universal schema. The system is designed so that adding a new entity type (e.g., "subscriptions") means:
1. Define the universal schema for subscriptions (12-15 fields)
2. Add FIELD_ALIASES for common billing tools (Stripe, Chargebee, Recurly)
3. Create 3-5 signals relevant to subscriptions (MRR, churn rate, expansion revenue)
4. Done. No changes to the calculation engine.

### The Key Constraint

The universal schema only works if **signals are defined in terms of business concepts, not tool-specific columns**. That's why Week 1 MSS cut to 20 signals with explicit calcSpecs. Every signal is defined as "sum this universal field, filter by this universal field" instead of "add up the Amount column where Stage is Closed Won."

If you hardcode Zoho column names into signal definitions, you'll need to rewrite signals for HubSpot. If you use universal fields, you only need to map columns once per org and all signals work.

---

## Question 2: Should Admin Have More Than 3 Questions?

**Jordan (Data Engineer) continuing:**

The 3-question flow is actually really smart. Here's why it works and when you'd add more questions.

### The Current 3 Questions

1. **"What does each row represent?"** (deals, leads, tickets, etc.)
   - This determines which entity schema to use
   - Tells the system which signals are even possible (can't calculate win rate from tickets)
   
2. **"Which column is the main metric?"** (Amount, Revenue, Count, etc.)
   - Maps to `deal_value`, `ticket_count`, etc. in the universal schema
   - Enables sum/average signals
   
3. **"Which column is the date?"** (Closing Date, Created Time, etc.)
   - Maps to `close_date`, `created_date`, etc. in the universal schema
   - Enables trend detection and time-series

### Why 3 Is Enough for MSS

These 3 questions give you enough information to:
- Generate 5-7 signals automatically (count, sum, average, monthly rate, group by owner/stage)
- Calculate all the signals Surge asked for (win rate needs stage, which is inferred from the data)
- Produce time-series for trends

The genius is that **most columns are inferred, not asked**. The system looks for:
- A column with "stage" or "status" in the name → maps to `stage` or `ticket_status`
- A column with "owner" or "assigned" in the name → maps to `owner`
- A column with "priority" in the name → maps to `priority`
- A column with "resolution" and "time" in the name → maps to `resolution_time`

If the inference is wrong, the 3-question flow can be expanded. But for MSS, ask only what you must.

### When You'd Add Question 4

**Question 4 would be: "Which column represents the status/stage?"**

You'd add this when:
- The status column name is ambiguous (e.g., a CSV has both "Stage" and "Status" columns)
- The system infers the wrong column (e.g., maps "Department Status" to `stage` instead of "Deal Stage")
- You want to calculate rate-based signals (win rate, conversion rate) and need to ensure the status column is correctly identified

For customer #2, I'd add this question if they have data where inference fails > 20% of the time. For Locumate, inference works perfectly (their Zoho data is clean and has predictable column names).

### When You'd Add Question 5

**Question 5 would be: "Should we exclude any rows from calculations?"**

You'd add this when:
- There are test/dummy records in the data (e.g., deals with "Test Company" in the name)
- There are bulk-generated tickets that aren't real (like Locumate's "Policy acknowledgment required" tickets)
- There are closed/cancelled deals that shouldn't count toward historical metrics

For MSS, I'd handle this in the admin review step instead of asking the user. After signals are generated, admin sees the count ("4,100 tickets") and can add an exclusion filter ("exclude where subject contains 'Policy acknowledgment'"). That's more flexible than asking up-front.

### When You'd Add Question 6

**Question 6 would be: "What's your fiscal year start month?"**

You'd add this when:
- The business doesn't use calendar year for reporting
- You want to show "YTD revenue" or "Q2 pipeline" and need to know their fiscal calendar

This is a nice-to-have for Tier 2. For MSS, just use calendar months.

### The Rule

Add questions only when:
1. The system can't infer the answer reliably (> 80% accuracy)
2. The answer changes the signals generated (not just display formatting)
3. The user/admin can answer it in < 10 seconds without looking up documentation

For MSS with clean Zoho data, 3 questions is perfect. For customer #10 with messy spreadsheet data, maybe 4-5 questions.

---

## Question 3: Opportunities/Risks Per-Metric vs Org-Level?

**Sam (Management Consultant):**

This is a product philosophy question. Let me break down both approaches and tell you which one I'd ship for MSS.

### Approach A: Opportunities/Risks Per-Metric

Every signal gets its own opportunities and risks sections.

**Example for Win Rate = 66.7%:**

**Opportunities:**
- Your win rate is above typical B2B SaaS (50-60%). This suggests strong product-market fit.
- With 8 wins from 12 closed deals, you have repeatable evidence of what works. Codify your winning sales process.
- Opportunity to increase deal velocity: focus your sales process on deal types with highest win rate.

**Risks:**
- Sample size is small (12 closed deals). Win rate could fluctuate significantly with next 3-5 deals.
- All deals are owned by CEO (Surge). If he's unavailable, pipeline stalls. Key person dependency.
- 4 lost deals worth AUD $200K+ need post-mortem analysis to avoid similar losses.

**Pros:**
- Every metric gets specific, actionable insights
- Easy to understand: "This is what this number means for you"
- Easy to implement: the AI prompt already has all the context for the specific signal

**Cons:**
- Feels repetitive. If 3 signals all say "risk: all owned by CEO", that's noise
- CEO has to read 7 × 2 = 14 sections to understand the full picture
- Opportunities and risks are often cross-signal (e.g., high pipeline + low win rate = bottleneck at close stage)

### Approach B: Opportunities/Risks Org-Level

One combined section showing the biggest opportunities and risks across all signals.

**Example for Org (Locumate):**

**Top 3 Opportunities:**
1. **Win rate strength (66.7%)** - Your close rate is strong. Opportunity: increase pipeline generation to feed more deals into a proven sales motion. Current pipeline of AUD $450K could close at ~$300K based on historical win rate.

2. **Fast support response (avg 8.2 hours)** - Customer success is performing well. Opportunity: use this as a sales differentiator. "We respond to all tickets within 24 hours" is a competitive advantage in health-tech.

3. **Concentrated ownership** - 85% of deals owned by CEO. Opportunity: if Surge documents his sales process, you could hire and train a second rep to double deal flow while maintaining quality.

**Top 3 Risks:**
1. **Key person dependency** - Surge owns nearly every deal and most leads. Risk: if he's unavailable for 2 weeks, revenue generation stops. Mitigation: hire sales rep or redistribute leads to Tiani.

2. **Small sample size** - Many metrics (win rate, lead conversion) are based on < 20 data points. Risk: numbers could swing significantly month-to-month, making them unreliable for decision-making. Mitigation: track trends over 3+ months before acting on signal changes.

3. **Pipeline coverage** - Pipeline value (AUD $450K) is only 2.5x this quarter's closed revenue ($180K). Risk: if win rate drops to 50%, you'll miss quarterly targets. Mitigation: increase prospecting activity to build 3-4x coverage buffer.

**Pros:**
- Gives the CEO a single "executive summary" view
- Highlights cross-signal patterns (e.g., high win rate + low pipeline = volume problem, not quality problem)
- Forces prioritization: only show the top 3-5 of each, not every possible insight

**Cons:**
- Harder to implement: requires analyzing all signals together, not one at a time
- Risks oversimplification: might miss nuances in individual metrics
- Unclear which signal each opportunity/risk is connected to

### My Recommendation: Hybrid Approach

**For MSS, do Approach A (per-metric), but with one change:**

Show opportunities and risks per-metric, but add a **"Key Dependencies"** section that highlights cross-signal patterns. Example:

**Win Rate (66.7%) - Per-Metric Analysis:**
- Opportunities: Strong close rate, repeatable motion
- Risks: Small sample size, key person dependency

**Pipeline Value (AUD $450K) - Per-Metric Analysis:**
- Opportunities: Solid pipeline, diverse deal sizes
- Risks: Coverage is 2.5x, need 3-4x for buffer

**Org-Level Key Dependencies (shown once at the top of the signals page):**
"Your high win rate (66.7%) + moderate pipeline coverage (2.5x) suggests a **volume opportunity**: you close deals well, but don't have enough pipeline. Focus on lead generation and prospecting rather than improving sales process."

This gives both:
- Specific, actionable insights per metric (easy for the CS Manager to understand "what ticket resolution time means")
- Strategic, synthesized view for the CEO (easy to see "the biggest lever to pull is pipeline generation")

### Why This Works for MSS

The CEO (Surge) will log in, see his 3 KPIs (win rate, leads per month, closed revenue), and read the opportunities/risks for each. That's his daily/weekly check-in.

But if he wants to understand the big picture, there's a single summary section at the top: "Here's what all your data is telling you, in priority order."

This is a 2-hour addition to Week 2 of the build. The per-metric opportunities/risks already exist. The org-level summary is a single additional AI call that takes all signals as input and produces a 3-paragraph synthesis.

---

## Question 4: What Data for Reliable 6-Section Synthesis?

**Sam (Management Consultant) with Alex (BI Analyst) weighing in:**

The 6-section framework (actually 5 sections per the current code, but I assume you meant the org-level synthesis with opportunities/risks) needs specific data to be reliable. Let me break down what's required and what's optional for each section.

### Section 1: What We Found (Factual Data)

**Required data:**
- Absolute value of the metric (e.g., "Win Rate = 66.7%")
- Trend direction (increasing, decreasing, stable)
- Sample size (number of data points used in calculation)
- Time period (e.g., "last 90 days", "Jan 2024 - Jan 2026")

**Optional but valuable:**
- Comparison to previous period (e.g., "up 5% from last month")
- Data quality metrics (e.g., "calculated from 12 deals, 100% had valid stage data")

**Where this comes from:**
- Signal value: from the calculation engine
- Trend: from time-series analysis in the calculation engine
- Sample size: count of rows that passed filters
- Time period: from the date range in the uploaded data

**Reliability threshold:**
Alex (BI Analyst): I'd mark this section as "reliable" only if sample size > 10 data points. Below that, flag it with "small sample - interpret with caution."

### Section 2: What It Means (Interpretation)

**Required data:**
- Why the metric changed (requires historical data to show what changed)
- Benchmark comparison (requires industry benchmarks OR the user's own historical baseline)

**Optional but valuable:**
- Scope: which customers, products, or segments this affects
- Breakdown: what drove the change (e.g., "win rate up because you closed 3 high-probability deals this month")

**Where this comes from:**
- Why change happened: compare current period vs previous period, identify what's different (e.g., more deals closed, higher average deal size)
- Benchmark: either hardcoded industry benchmarks (e.g., "typical B2B SaaS win rate is 50-60%") OR calculated from the user's own historical data (e.g., "your win rate last quarter was 55%")
- Scope: requires breakdown by segment (e.g., "win rate for deals > AUD $50K is 80%, for deals < AUD $50K is 50%"). Not available in MSS without group-by signals.

**Reliability threshold:**
Alex: You need at least 2 time periods to say "why it changed." If you only have 1 month of data, you can't say "win rate increased" because there's no baseline. For MSS, I'd require at least 2 months of data for the "What It Means" section to be reliable.

### Section 3: So What (Business Impact)

**Required data:**
- User's role (CEO, CS Manager, Ops Manager) - to personalize impact
- User's KPIs (what they said they care about) - to connect impact to their goals
- Direction: is this positive, negative, or neutral for the business?

**Optional but valuable:**
- User's upcoming priorities (e.g., "you said Q2 focus is hitting $500K revenue target")
- Company stage, size, industry (to contextualize impact)

**Where this comes from:**
- User role: from user profile in database
- User KPIs: from onboarding questionnaire
- Direction: calculated from trend + benchmark (e.g., win rate above benchmark + increasing = positive)
- Upcoming priorities: from user profile (free text field captured during onboarding)

**Reliability threshold:**
Sam: This section is only as reliable as the user profile data. If the user said "I care about revenue growth" and you're showing them ticket resolution time, the "So What" will feel generic. You need the user's actual priorities to make this section valuable.

### Section 4: Opportunities (Positive Scenarios)

**Required data:**
- Current metric value
- Trend (to identify what's working)
- User's role (to suggest role-appropriate actions)

**Optional but valuable:**
- Related signals (e.g., if win rate is high but pipeline is low, opportunity is "increase prospecting")
- Historical patterns (e.g., "win rate is highest for deals sourced from referrals - opportunity to incentivize referrals")

**Where this comes from:**
- Current value + trend: from signal calculation
- Related signals: from signal_relationships table (if you implement cross-signal correlation, which is Tier 2)
- Role-based actions: hardcoded per signal + role (e.g., CEO opportunity for high win rate = "scale sales team", CS Manager opportunity for low resolution time = "document best practices for training")

**Reliability threshold:**
Sam: Opportunities are most reliable when they're based on what's already working (high metric + positive trend). Don't suggest opportunities for metrics with small sample sizes or unstable trends. Only suggest opportunities for metrics with "high" confidence (per Alex's confidence field).

### Section 5: Risks (Negative Scenarios)

**Required data:**
- Current metric value
- Trend (to identify what's declining)
- User's role (to suggest role-appropriate mitigations)

**Optional but valuable:**
- Related signals (e.g., if pipeline is decreasing AND lead volume is decreasing, root cause is lead gen)
- Thresholds (e.g., "risk: pipeline coverage below 3x is dangerous for hitting targets")

**Where this comes from:**
- Current value + trend: from signal calculation
- Related signals: from signal_relationships table (Tier 2)
- Role-based mitigations: hardcoded per signal + role
- Thresholds: either industry benchmarks OR derived from user's historical data

**Reliability threshold:**
Sam: Risks should only be flagged if they're actionable. Don't say "risk: small sample size" without suggesting a mitigation ("upload 3+ months of data"). Don't say "risk: win rate is decreasing" if the decrease is within normal variance (< 5% change).

### Section 6: Org-Level Synthesis (If You Add It)

**Required data:**
- All signals for the org (at least 3-5 signals)
- User's top 3 KPIs (to know what to prioritize in the synthesis)
- User's role (CEO gets strategic synthesis, CS Manager gets operational synthesis)

**Optional but valuable:**
- Cross-signal correlations (e.g., "when lead volume increases, win rate decreases - suggests sales team is capacity-constrained")
- User's business context (industry, stage, team size) to make recommendations realistic

**Where this comes from:**
- All signals: from the database (fetch all signals for this org)
- User KPIs: from user profile
- Cross-signal patterns: calculated by comparing trends across signals (Tier 2)

**Reliability threshold:**
Sam: The synthesis is only reliable if you have at least 3 signals with "high" confidence. If only 1-2 signals have sufficient data, don't try to synthesize - just show those 1-2 signals with full analysis.

### Summary: MSS Data Requirements

**To ship a reliable 5-section analysis for MSS, you need:**

1. **Signal calculation data** (you have this):
   - Value, trend, sample size, time period, formula

2. **User profile data** (partially have this):
   - Role ✅ (from Supabase auth)
   - KPIs ✅ (from onboarding)
   - Upcoming priorities ❌ (need to add to onboarding)
   - Business context (industry, stage, size) ❌ (need to add to onboarding)

3. **Historical data** (you have this after first upload):
   - At least 2 time periods (2 months of data) to show trend
   - Previous period values to calculate "change from last period"

4. **Benchmarks** (you DON'T have this yet):
   - Industry benchmarks for common metrics (win rate, sales cycle, resolution time)
   - Can start with hardcoded benchmarks for MSS
   - Later: calculate benchmarks from aggregate across all customers (anonymized)

### What to Build for MSS

**Week 1:**
- Signal calculation engine already produces: value, trend, sample size, time period, formula ✅

**Week 2:**
- Add to user profile: upcoming priorities (free text), business context (dropdown: industry, stage, team size)
- Add confidence field to signals: "high", "medium", "low" based on sample size and data quality
- Wire user profile (role, KPIs, priorities, context) into AI prompt

**Week 3:**
- Store previous period values when re-uploading data
- Calculate "change from last period" for each signal
- Add this to the AI prompt

**Week 4:**
- Hardcode industry benchmarks for the 7 signals (win rate, sales cycle, resolution time, etc.)
- Add benchmarks to AI prompt for the "What It Means" section

That gives you everything needed for a reliable 5-section analysis.

---

## Recommendations Summary

**Jordan (Data Engineer):**
- The universal schema already exists in your FIELD_ALIASES dictionary and calcSpec design. It's scalable to HubSpot, Salesforce, and custom tools with minimal effort.
- Keep the 3-question flow for MSS. Add question 4 ("which column is the status?") only if customer #2's data has ambiguous columns.
- Persist column mappings per org in a `column_mappings` table. That's a half-day addition to Week 1.

**Sam (Management Consultant):**
- Do opportunities/risks per-metric for MSS. Add an org-level synthesis section in Week 3 or 4 as a "nice to have."
- The 5-section analysis needs: signal data (have it), user profile with priorities and context (add to onboarding), historical data for trends (have it after re-upload), and industry benchmarks (hardcode for MSS).
- Don't try to synthesize across signals unless you have at least 3 signals with "high" confidence. It's better to show 2 reliable insights than 5 shaky ones.

**Alex (BI Analyst):**
- Add a `confidence` field to every signal: "high" (sample size > 10, data quality > 80%), "medium" (sample size 5-10 OR data quality 60-80%), "low" (sample size < 5 OR data quality < 60%).
- Never show opportunities or risks for low-confidence signals. Flag them with "insufficient data for reliable analysis."
- For "What It Means" to be reliable, you need at least 2 time periods (2 months of data). If the customer only uploads 1 month, say so: "Upload 2+ months of data to see trend analysis."

**Next Steps:**
1. Week 1: Add confidence field, persist column mappings
2. Week 2: Expand user profile (priorities, context), wire into AI prompt
3. Week 3: Calculate previous period change, add to AI prompt
4. Week 4: Hardcode industry benchmarks for the 7 signals
