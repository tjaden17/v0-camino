# CAMINO ROADMAP (FINAL)

*Source of Truth for Product Architecture & Delivery*

Last Updated: February 2026

---

## 1. USER PROBLEMS WE ARE SOLVING

### Problem 1: Too Slow
Current company workflow is too slow to surface valuable information required for action.
- **Desired Outcome:** Increased speed to valuable information. Decrease time to produce reports, analyse information, find opportunities and risks.

### Problem 2: So What?
Lacking "so what" from managers who are providing data and reporting.
- **Desired Outcome:** Better business results from actions.

### Problem 3: Overwhelm
Execs find it difficult to use current tools, which are analyst-first.
- **Desired Outcome:** Improved ease and intuitiveness in exploring valuable information.

### Problem 4: Easy Integrations
Easy for team members to connect and update data. No IT department required.
- **Desired Outcome:** Decreased time to produce reports.

---

## 2. TECH ARCHITECTURE OVERVIEW

Camino is structured as a **modular monolith** — logically separated modules within a single deployment. This provides simplicity now while enabling future extraction to services when scale demands it.

---

## 3. MODULAR AREAS

### Module 1: Understanding
**Goal:** Understand the user to personalize the experience based on user role, preferences, and organization settings.

**How it works:**
- Stores user KPI preferences
- Stores business context (e.g., business stage)
- Applies role-based defaults (executive sees signals relevant to role)
- Applies business context
- Manages org level settings
- Stores all data required to find relevant signals
- Stores all data required to provide context to AI analysis for signals

**Key Signals:** 7 tool-agnostic signal types (Pipeline value, win rate, etc.)

**Onboarding includes:**
- Upcoming priorities (free text)
- Business context (dropdown)

**Panel Review Notes:**
- Ask customer what KPI they want
- Only show signals the data can support. Prioritise what they asked for
- Make the gap visible (e.g., to get X, you need to Y)

---

### Module 2: DataIn
**Goal:** Get data into the system from any source, validate it, and prepare it for signal calculation.

**How it works:**
- Accepts file uploads (CSV, Excel) via drag-drop or file picker
- Future: Connects to external APIs (HubSpot, Salesforce, Stripe, Zoho)
- Cleans and transforms data to make it easier for Signal Calcs and Signal Interpretation services to consume
- Has a 'data onboarding' workflow to help the system understand an organisation's data shape
  - Admin provides the system with examples of data
  - System queries with admin until it accurately understands the data
  - User has no role in 'data onboarding'. This is a manual process for admin to interact with the system
  - In future, there will be a service to perform data-onboarding without admin intervention
- Reads the files related to the 'Understanding' module to understand what signals are needed
- Discovers which signals can be found from the data
- Categorises signals as new, updated, or partial
- Stages validated data for processing by signal calcs

**Data Architecture Layers:**

**Layer 1:** Raw data

**Layer 2:** Column mapping, per org, stored in database
- `field_aliases` covers Zoho, HubSpot, Salesforce (the translation)
- Add 5-question flow as MSS to suit first 10 customers
- 3-question flow handles edge cases where columns don't auto-map
- Save column mappings for each new tool — auto-applied on re-upload

**Layer 3:** Normalised data (universal)
- Every org's deal data looks the same, regardless of source tool
- Store previous period values when re-uploading data
- Calculate "change from last period" for each signal
- Add this to the AI prompt

**Benchmarking:**
- Hardcode industry benchmarks for the 7 signals (win rate, sales cycle, resolution time, etc.)
- Add benchmarks to AI prompt for "What It Means" section

**Panel Review Notes:**
- Column mapping is critical
- Auto-apply saved mappings on re-upload
- Admin screen to edit/verify mappings per org
- Fix Win Rate to handle "Closed - No Budget" as a closed-lost stage
- Fix Amount parser for "AUD" prefix
- Parse "Resolution Time in Business Hours" format ("X days Y hrs")

---

### Module 3: Signal Calcs
**Goal:** From the staging data, calculate signal values, trends, and cross-source correlations.

**How it works:**
- Takes staged data and applies calculation methods based on the signal and signal calculation
- Tracks values over time to detect trends
- Identifies cross-source patterns (e.g., "churn up + NPS down")

**7 Signals (Hard-coded for MVP):**
The 7 signal types (pipeline value, win rate, etc.) are universal across any B2B SaaS company.

**7 Operations:**
count, sum, average, rate, group_by, monthly_rate, duration_avg

**Panel Review Notes:**
- Calculate all 7 signals
- Tag each one as either "requested" (matches a KPI) or "recommended" (we suggest it)
- Calcspec finds columns in field aliases
- Add a confidence field to each signal output
- Store column mappings per org in database (`column_mappings` table)
- On re-upload, auto-apply saved mappings instead of asking 3 questions again
- Admin screen to edit/verify mappings per org
- Fix Win Rate to handle "Closed - No Budget" as a closed-lost stage
- Fix Amount parser for "AUD" prefix
- Parse "Resolution Time in Business Hours" format ("X days Y hrs")

---

### Module 4: Interpretation
**Goal:** Transform raw data and calculated signals into exec-ready insights using AI. Interpret signal data in relation to the user and organisation.

**How it works:**
- Takes signal data as input
- Takes user context/understanding as input
- Makes a single unified AI call to generate 6-section analysis

**6-Section Analysis:**
1. **Executive Summary** — What the data shows
2. **Takeaway Breakdown** — Was change directionally good or bad? Was change expected or unexpected?
3. **Benchmark Comparison** — How it compares to norms (and specifics about who informed those norms)
4. **Root Cause Analysis** — Why it happened. Deeper drivers
5. **Relationship with Other Metrics** — Performs causal chain analysis to map signal relationships
   - Identifies which signals influence others
   - Traces sequences of cause-and-effect (e.g., "churn up → NPS down → revenue at risk")
   - Detects leading indicators
   - Summarises causal networks for complex multi-source scenarios
6. **Implications on Goals** — Business impact

**Implementation:**
- Caches interpretations to avoid redundant AI calls
- Auto-trigger interpretation after signal calculation
- Connect user profile data into AI prompt
- Make the 5-section analysis reference their actual numbers, not generic text
- For requested KPIs, AI says "Here's what your win rate means for your business"
- For recommended signals, AI says "We're flagging this because..." with clear reason

**Panel Review Notes:**
- Wire user context into AI interpretation
- If keeping opps and risks, keep it signal level
- Have 'weekly brief' summary
- How do we build a signal calc quality layer to QA signal calcs? Not just for calcs, but the design of the signals calcs

---

### Module 5: Presentation
**Goal:** Render signals and insights in consumable formats for different use cases.

**How it works:**
- In the signal screen: Displays signals as expandable cards with L1 (summary) and L2 (details) views
- Provides filtering (to be confirmed)
- In the 'Weekly Brief' screen: Creates a weekly focus brief
  - Max 5 items across 3 buckets (Needs Attention, Tracking Well, For Your Awareness)
  - Each includes a metric and framed as a decision prompt

**Signal Organisation:**
1. **Your KPIs** — what they asked for
2. **Recommended** (~2 additional KPIs) + Why suggesting it (be an advisor, not a dashboard)
3. **Available** (collapsed behind a 'see more' link. For exploration, not daily use. No AI interpretation unless user requests)
4. **Requested, Unavailable** — Customer asked for it but data can't support it. Be explicit: "You asked for customer retention rate. To calculate this, we'd need customer subscription data. Upload your billing data to enable this signal."

**Implementation:**
- Show user's requested KPIs first
- Show the formula for every signal
- Role-based signal visibility
- Show period-over-period change visually
- Signal recommendations table: `signal_recommendations` table with `org_id`, `signal_id`, `reason`, `recommended_at`
- Connect signals to decisions

---

## 4. PRODUCT/DELIVERY ROADMAP

### Methodology
- **Roadmap (monthly decisions):** Each goal = one decision moment
- **Critical path (feature dependencies):** What must be built to reach that decision?
- **Weekly goals (execution checkpoints):** By Friday, X must be true to stay on critical path
- **Rule:** If it's not on the critical path to the next decision, defer it

---

## 5. MONTHLY GOALS

### GOAL 1: START CHARGING
**Decision Moment:** Will Surge pay by Mar 14?
**Timeline:** Month 1 (4 weeks)

#### Week 1: Foundation
- **Critical:** Column mapping template (can't upload without this)
- **Critical:** Ticket filtering logic (wrong numbers = broken trust)
- **Critical:** User accounts with KPI fields (can't personalise without this)

**Tasks:**
- Create 2 user accounts with role-based profiles
- Admin to create in Admin CP
- Update KPIs (chosen from 7)
- Exec can update business context
- Each user can confirm upcoming priorities
- Pre-built column mapping templates per tool
- Filter out non-real tickets
- Persist column mappings per org
- Store user's requested KPIs from onboarding
- Expand onboarding (optional) profile
- Add: upcoming priorities (free text, e.g. "hit $500K revenue in Q2")
- CEO to add business context (industry, stage, team size)
- Wire into AI prompts

#### Week 2: Data to Signals
- **Critical:** Admin uploads 3 CSVs (can't calculate without data)
- **Critical:** Signal calc produces 7 correct numbers (can't interpret without signals)
- **Critical:** Verify numbers against Surge's internal records (trust checkpoint)

**Tasks:**
- Admin upload-on-behalf flow
- Lock to 7 signals, remove everything else
- Fix Win Rate & other calculations
- Add confidence scoring to every signal
- Validate every signal against manual spreadsheet
- Recommend 1-2 signals beyond what they asked for

#### Week 3: Interpretation to Presentation
- **Critical:** AI interpretation wired to user KPIs (can't deliver personalised value without this)
- **Critical:** Period over period trends calculated (just numbers = reporting tool)
- **Critical:** 2 users can log in and see specific signals

**Tasks:**
- Wire user context into AI interpretation
- Auto-trigger interpretation after calculation
- Per-metric opportunities and risks
- Use AI for benchmarks
- Calculate period-over-period change, 7, 30 (default), 90 days
- "Insufficient data for weekly comparison" messaging
- Show user's requested KPIs first
- Show the formula for every signal
- Role-based signal visibility
- Show period-over-period change visually
- Per-metric opportunities and risks

#### Week 4: Polish for Demo
- Mobile responsive
- Fix bugs found
- Admin walkthrough with real workflow
- Friday demo to Surge

**Non-Critical (Parallel):**
- Email notifications
- Admin audit logs

**Deferred (doesn't enable goal 1 decision):**
- OAuth integration (CSV upload works for demo)
- Weekly briefs (not required for billing decisions)

---

### GOAL 2: RETAIN FIRST CUSTOMER FOR 3 MONTHS
**Decision:** Will Surge pay for 3 months?
**Timeline:** Month 2-3

**Objective:** Locumate stays subscribed. The product becomes part of their weekly routine. Each user checks their signals regularly.

**Key Initiatives:**
- Evolving signal recommendations
- OAuth flow for Zoho CRM and Zoho Desk
  - One-time pull of deals, leads, tickets via API
  - Parse API response, map to universal schema (deal_value, stage, etc.)
  - Store raw response + normalized data in database
  - Manual trigger: admin clicks "sync data" in admin panel
  - No error handling beyond "sync failed, try again"
- Add org-level synthesis section
- Show benchmark context alongside values

---

### GOAL 3: WIN AND DELIVER VALUE TO FIRST 5 CUSTOMERS
**Decision:** Will customers 2-5 commit?
**Timeline:** Month 3-4

**Objective:** Onboard 4 more customers from different companies. Prove the product works beyond one customer.

**Key Initiatives:**
- Confidence scoring in lead magnet
- Auto-detect source tool from column headers
- Support HubSpot and Salesforce column naming
- Lead magnet restrictions
- Same 7 signals work for all 5 customers
- Lead magnet AI interpretation (lighter version)
- Build the self-service lead magnet

---

### GOAL 4: WIN CUSTOMERS 5-50 FROM VARYING SEGMENTS AND TOOLS
**Decision:** Will strangers self serve?
**Timeline:** Month 5-8

**Objective:** Scale beyond manual onboarding. Support diverse tools, data shapes, and business types.

**Key Initiatives:**

**Understanding:**
- Self-service onboarding (no admin required)
- Segment-specific signal packs
- Role-based dashboard templates

**DataIn:**
- API integrations (Zoho, HubSpot, Salesforce)
- Expand to new entity types

**Signal Calcs:**
- Custom signal builder
- Multi-source signal correlation

**Presentation:**
- Weekly brief / focus brief
- Role-based dashboard views

---

## 6. BACKLOG TRADEOFFS

### Customer Metrics vs Universal Metrics
Only add if every org will want it.

### Progressive Signal Discovery
Automatically discovering new signals from data without user input. Accuracy matters more than volume. Better to have 7 reliable signals than 20 auto-discovered wrong ones. Revisit at 50+ customers. *(Alex, CTO)*

### Real-Time Data Sync
Continuous sync with CRM APIs. SMB data doesn't change fast enough. Daily/weekly refresh is sufficient. Real-time adds cost and complexity. Revisit for enterprise tier. *(CTO, Jordan)*

---

## 7. OPEN QUESTIONS FOR PANEL

### Data Engineer
- Help me understand the universal data schema. How will it help with scale to other types of tools, data shapes?
- How will we update the universal schema entities later? What is best practice so we can update it with new clients?
- How do we ensure the field aliases will catch all? Manual contingency?
- What if field aliases are wrong? How can we correct them?
- Want it MSS to suit customer #10, with messy data.
- For data onboarding, the admin can help system understand column. Should we have more than 3 questions?

### Management Consultant
- Should opps and risks analysis be for each metric, or for org overall?
- What data do we need to collect in order to produce a reliable, accurate synthesis for the 6 section analysis?
- Data flow: From DataIn to being shown in relation to universal schema?

---

## 8. CRITICAL SUCCESS FACTORS

### Trust & Accuracy
- Validate every signal against manual records before demo
- Show formulas transparently
- Confidence scoring on every signal

### Personalisation
- Connect user profile (role, goals, business context) into every analysis
- Show requested KPIs first; recommended second; available last
- Make gaps explicit ("You asked for X, we need Y data")

### Simplicity
- 7 signals, not 70
- 3-question onboarding, not 10
- 6-section analysis, not customisable

### Speed to Value
- Demo-ready by end of Week 4
- Full signal interpretation by Week 3
- Verify accuracy before customer sees it
