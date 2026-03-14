# Camino — MSS 10-Week Roadmap
> Status: Approved
> Version: 1.0
> Date: March 2026
> Owner: Founder (CPO/CTO)
> Customer: Surge Singh, CEO, Locumate

---

## How to Use This Document

Each milestone has:
- **Goal** — what the milestone achieves strategically
- **Tasks** — the concrete build items, checkboxed
- **Acceptance Criteria** — the specific, measurable conditions that confirm the milestone is done
- **Exit Gate** — the single question that must be answered YES before moving to the next milestone

Weeks are grouped into five milestones. Two weeks per milestone. Week 9-10 is a buffer/hardening phase before payment is requested.

---

## Overview

| Milestone | Weeks | Theme | Exit Gate |
|---|---|---|---|
| M1 | 1-2 | Verified Numbers | Do Surge's numbers match Zoho? |
| M2 | 3-4 | The Insight Moment + First Brief | Did Surge say "I didn't know that"? |
| M3 | 5-6 | Automated Delivery | Did two briefs arrive without founder involvement? |
| M4 | 7-8 | Full Synthesis | Did Surge make a decision informed by Camino? |
| M5 | 9-10 | Hardening + Payment | Is Surge paying? |

---

## Pre-Work (Before Week 1)

These must be complete before a single line of code is written.

- [ ] Founder has conducted onboarding call with Surge (60 min)
- [ ] Onboarding call output documented: goals, priorities, concerns, 90-day focus areas
- [ ] `customer_profiles` entry prepared for Surge (to be entered in week 1)
- [ ] Surge's three CSV files received and reviewed: Zoho CRM Deals, Zoho Shifts, Zoho Desk
- [ ] Column headers and sample rows reviewed for all three files
- [ ] Ambiguous stage names clarified with Sam (e.g. which stages count as "Lost" for win rate)
- [ ] Supabase project created, environment variables confirmed in Vercel
- [ ] `pg_trgm` extension enabled in Supabase: `CREATE EXTENSION IF NOT EXISTS pg_trgm`
- [ ] Vercel project connected to GitHub
- [ ] Resend account created, domain verified, API key in environment variables
- [ ] Claude API key confirmed in Vercel environment variables

---

## MILESTONE 1 — Weeks 1-2: Verified Numbers

**Goal:** Surge opens Camino and sees KPI numbers that match his Zoho exactly. Trust is established at the data level. Sam can verify every formula.

---

### Database Setup

- [ ] Create Supabase migration: `source_uploads` table
- [ ] Create Supabase migration: `raw_deals` table (JSONB)
- [ ] Create Supabase migration: `raw_shifts` table (JSONB)
- [ ] Create Supabase migration: `schema_fingerprints` table
- [ ] Create Supabase migration: `normalised_deals` table (semantic columns)
- [ ] Create Supabase migration: `normalised_shifts` table (semantic columns)
- [ ] Create Supabase migration: `kpi_snapshots` table
- [ ] Create Supabase migration: `customer_profiles` table (goals, priorities, concerns, company context)
- [ ] Create Supabase migration: `users` table with `role` field (`exec` | `admin`)
- [ ] Create future-ready tables (no data yet): `signal_flags`, `decision_log`, `org_group_memberships`, `benchmark_snapshots`
- [ ] Enable Row Level Security on all tables — `customer_id` isolation policy
- [ ] Populate `customer_profiles` row for Surge from onboarding call notes

### Ingest Layer (Layer 1)

- [ ] Build `POST /api/ingest/upload` route handler
- [ ] Integrate Papaparse streaming CSV parser
- [ ] Write upload metadata to `source_uploads`
- [ ] Write raw rows as JSONB to `raw_deals` (if source_type = zoho_crm_deals)
- [ ] Write raw rows as JSONB to `raw_shifts` (if source_type = zoho_shifts)
- [ ] Route returns upload ID and row count on success
- [ ] Error handling: malformed CSV, empty file, wrong source type

### Normalise Layer (Layer 2)

- [ ] Build `POST /api/ingest/analyse-schema` route handler
- [ ] Extract column names and 10 sample rows from uploaded JSONB
- [ ] Build Claude `generateObject` call with Zod schema (column_mappings, value_mappings, join_keys)
- [ ] Build schema fingerprint review UI — Sam sees proposed mappings, can correct any field
- [ ] On Sam approval: save `schema_fingerprints` record
- [ ] Build normalisation job: read `raw_deals`, apply fingerprint, write to `normalised_deals`
- [ ] Build normalisation job: read `raw_shifts`, apply fingerprint, write to `normalised_shifts`
- [ ] If fingerprint already exists for this customer + source_type: skip review, run normalisation immediately
- [ ] Normalisation status updates `source_uploads.status` field

### Compute Layer (Layer 3) — SQL Views

- [ ] Create SQL view: `v_win_rate` (closed_won / total closed)
- [ ] Create SQL view: `v_pipeline_value` (open pipeline, weighted pipeline)
- [ ] Create SQL view: `v_avg_deal_size` (average value of closed_won deals)
- [ ] Create SQL view: `v_avg_sales_cycle` (days from created_at to closed_at for closed_won)
- [ ] Create SQL view: `v_pipeline_by_stage` (deal count and value by stage)
- [ ] Create SQL view: `v_deals_by_lead_source` (deal count by lead_source)
- [ ] Create SQL view: `v_sales_concentration` (% of pipeline by owner)
- [ ] Create SQL view: `v_late_stage_stall` (deals >90 days in proposal/contract stage)
- [ ] Create SQL view: `v_shift_fill_rate` (finished / total by month)
- [ ] Create SQL view: `v_agency_usage` (agency / total by month)
- [ ] Create SQL view: `v_gmv_by_group` (shift_value sum by pharmacy group)
- [ ] Create SQL view: `v_locum_supply_health` (unique active locums by month)
- [ ] Create SQL view: `v_pharmacy_feedback_trend` (avg feedback score by month)
- [ ] All views filter by `customer_id` — confirmed parameterised

### Snapshot Layer (Layer 4)

- [ ] Create `snapshot_kpis(customer_id, upload_id)` Postgres function
- [ ] Function inserts one row per KPI into `kpi_snapshots` for each view
- [ ] Delta query working: LAG window function returns current vs. previous value per KPI
- [ ] Snapshot function is called automatically after normalisation completes

### Signal Card UI

- [ ] Supabase Auth setup — Surge and Sam accounts created
- [ ] `role` field on user accounts: `exec` for Surge, `admin` for Sam
- [ ] Mobile-first signal card component: KPI name, current value, delta, direction indicator
- [ ] Scrollable signal feed as default home screen — all active signals, newest first
- [ ] One card per screen on mobile (full-bleed), condensed list on desktop
- [ ] Admin toggle: if `role = admin`, signal cards show expandable "Calculation Detail" panel
- [ ] Calculation Detail panel contains: formula in plain English, source table name, row count, 3 sample rows, SQL view name
- [ ] Exec accounts (`role = exec`) never see the Calculation Detail panel

### Milestone 1 Acceptance Criteria

- [ ] Surge opens Camino on mobile and sees Win Rate displayed as a signal card
- [ ] Surge confirms the Win Rate value matches what he calculates in Zoho — within 1 decimal point
- [ ] Surge confirms Agency Usage % matches his own calculation
- [ ] Surge confirms Shift Fill Rate matches his own calculation
- [ ] Sam opens the same Win Rate card in admin mode and sees the formula: "Closed Won deals divided by total Closed deals (Won + Lost)"
- [ ] Sam sees 3 sample rows confirming which deals were counted as Closed Won
- [ ] All 14 SQL views return data without errors
- [ ] `kpi_snapshots` table has at least one row per KPI after upload
- [ ] RLS confirmed: a test query with a different `customer_id` returns zero rows

**M1 Exit Gate:** Does Surge say the numbers match Zoho? YES / NO

---

## MILESTONE 2 — Weeks 3-4: The Insight Moment + First Brief

**Goal:** Surge sees something Camino can show him that Zoho cannot. He receives his first weekly brief and reads it.

---

### Cross-Table Intelligence (Layer 3 continued)

- [ ] Confirm `pg_trgm` extension is active
- [ ] Create SQL view: `v_operational_not_subscribed` — fuzzy join `normalised_shifts.group_name` to `normalised_deals.account_name` using `similarity() > 0.6`, filter to groups with NO closed_won deal
- [ ] Create SQL view: `v_gmv_vs_subscription_value` — for groups WITH a subscription deal, compare shift GMV to deal value
- [ ] Tune similarity threshold: test against Surge's actual group names vs. account names, adjust threshold until matches are correct
- [ ] Cross-table insight card UI — visually distinct from single-table signal cards (different colour treatment or label: "Cross-source insight")
- [ ] `v_operational_not_subscribed` surfaced as a named card: "Operational accounts with no subscription"
- [ ] Card shows: list of group names, their GMV, their active days on platform, total revenue at risk

### Signal Ranking Layer (Layer 5)

- [ ] Build `POST /api/signals/rank` route handler
- [ ] Delta query runs and returns current + previous values for all KPIs
- [ ] Claude Haiku `generateObject` call with Zod schema (ranked_signals, materiality_score, one_line_reason, decision_relevance)
- [ ] Goal context from `customer_profiles` injected into ranking prompt
- [ ] Output: top 5 ranked signals with materiality score and reason
- [ ] Ranked signals stored in database for use by synthesis layer

### Brief Generation Layer (Layer 6)

- [ ] Build `POST /api/brief/generate` route handler
- [ ] Claude Opus `generateObject` call with Zod schema (headline, signal_memos, cross_table_insight, week_in_summary)
- [ ] Brief prompt includes: company context, exec priorities, top 5 ranked signals, cross-table discoveries
- [ ] Each signal memo contains: what (precise numbers), so what (interpretation), now what (question/action)
- [ ] Cross-table insight included as a dedicated section
- [ ] Generated brief saved to `briefs` table with customer_id, generated_at, content
- [ ] Brief email sent via Resend — formatted, mobile-readable, plain text + HTML

### Brief UI in App

- [ ] Brief view in app — accessible from home screen
- [ ] Brief renders as stacked signal cards on mobile (swipeable)
- [ ] Each signal card shows: KPI name, value, delta %, one-line "what", expandable "so what" + "now what"
- [ ] Cross-table insight rendered as a visually distinct card at the bottom of the brief
- [ ] Headline and week summary displayed at top and bottom of brief

### Milestone 2 Acceptance Criteria

- [ ] `v_operational_not_subscribed` returns at least one pharmacy group that Surge recognises as a real account
- [ ] Surge confirms the cross-table insight is accurate: "Yes, [group name] is on the platform but I haven't signed them up yet"
- [ ] Surge says "I didn't know that" or equivalent — unprompted
- [ ] First weekly brief generated without errors
- [ ] Brief delivered to Surge's email — renders correctly on mobile
- [ ] Brief is readable in under 2 minutes (word count target: 300-400 words)
- [ ] Brief references at least one of Surge's stated priorities from the onboarding call
- [ ] All 5 signal memos contain precise numbers — no rounded or approximated values
- [ ] Surge reads the brief (confirmed by email open event or direct confirmation)

**M2 Exit Gate:** Did Surge say "I didn't know that" about the cross-table insight? YES / NO

---

## MILESTONE 3 — Weeks 5-6: Automated Delivery

**Goal:** The brief arrives on Monday morning without any manual action from the founder or from Surge. Two consecutive automated briefs confirm the pipeline is stable.

---

### Automated Ingest

- [ ] Confirm with Sam: what is the most reliable way to export Zoho data on a weekly schedule? (email report, scheduled export, manual trigger)
- [ ] Set up scheduled Zoho export: Surge's Zoho CRM generates a weekly Deals report every Sunday at 10pm
- [ ] Set up scheduled Zoho export: Shifts data exported every Sunday at 10pm
- [ ] Build inbound email handler (`POST /api/ingest/email`) — receives forwarded/automated email with CSV attachment
- [ ] Email handler: parse attachment, identify source type from filename or sender, trigger ingest pipeline
- [ ] Alternatively (if email handler is complex): build a simple "upload link" that Sam bookmarks — she visits it Sunday evening, uploads latest exports, pipeline triggers automatically
- [ ] Decision: email handler vs. Sam-triggered upload. Document which approach is used and why.

### Vercel Cron Job

- [ ] Create Vercel Cron Job: runs every Monday at 6:00am AEST
- [ ] Cron job checks: has new data been uploaded since last brief? If yes, trigger signal ranking + brief generation
- [ ] Cron job checks: if no new data, send a "no new data" notification rather than generating a stale brief
- [ ] Cron job logs: execution time, brief ID generated, email delivery status
- [ ] Error alerting: if cron job fails, founder receives a Slack or email alert immediately

### Push Notifications (Stretch Goal)

- [ ] Evaluate push notification library — web push (PWA) vs. in-app notification badge
- [ ] Implement: when brief is generated, trigger a push notification to Surge's device
- [ ] Notification copy: "Your Camino brief for the week of [date] is ready. [Headline signal]."
- [ ] Test on iOS Safari and Chrome mobile

### Reliability and Error Handling

- [ ] Pipeline has retry logic: if schema fingerprint is not found, flag the error rather than silently failing
- [ ] If Claude API call fails, retry once before sending a "brief delayed" notification
- [ ] All pipeline errors logged to Supabase `pipeline_logs` table: step, error message, customer_id, timestamp
- [ ] Founder can see pipeline status from an admin view (simple table — not a full dashboard)

### Milestone 3 Acceptance Criteria

- [ ] Week 1 automated brief: arrives in Surge's inbox by 6:30am Monday without any founder action
- [ ] Week 2 automated brief: arrives in Surge's inbox by 6:30am Monday without any founder action
- [ ] Both briefs contain fresh data (not a repeat of the previous week's numbers)
- [ ] Pipeline logs show no errors for both runs
- [ ] If push notifications are implemented: Surge receives a push notification on his phone before opening the email
- [ ] Sam confirms she did not manually trigger anything for either brief
- [ ] Founder confirms they did not manually trigger anything for either brief

**M3 Exit Gate:** Did two consecutive briefs arrive automatically without founder or founder involvement? YES / NO

---

## MILESTONE 4 — Weeks 7-8: Full Synthesis + Retention Signal

**Goal:** Surge receives a brief that surfaces a signal he didn't ask for, interprets it in the context of a real decision he is facing, and takes action. He forwards a brief externally.

---

### Synthesis Quality

- [ ] Review first 4 weeks of briefs with Surge — what was useful, what was noise?
- [ ] Tune synthesis prompt for Locumate domain specifically: healthcare staffing marketplace, B2B SaaS, Australia market
- [ ] Add domain context to prompt: "Locumate connects pharmacies with locum pharmacists. The platform model means GMV and subscription revenue are related but distinct."
- [ ] Add the "didn't ask for" signal types to the ranking prompt: sales concentration index, late stage stall rate, geographic mismatch between operational presence and pipeline
- [ ] Tune materiality scoring in signal ranking: Surge's threshold alerts (agency > 30% = high priority) are encoded into the ranking weights
- [ ] Validate that each brief's "so what" connects directly to a decision Surge is currently facing — check against onboarding call priorities

### KPI Trend View

- [ ] Build a simple trend view in app: for each KPI, show the last 6 snapshot values as a sparkline
- [ ] Trend view accessible from signal card — tap the delta badge to see the 6-week trend
- [ ] Visual indicator: is this KPI trending in the right direction vs. Surge's stated goal?
- [ ] No complex charting required — sparkline only, value + date on tap

### Brief History

- [ ] Brief history view in app — list of all previous briefs, newest first
- [ ] Tap any previous brief to read it in full
- [ ] Visual indicator: which briefs contained a cross-table insight

### KPI Impact Tracking (Minimal Org Memory)

- [ ] When a KPI was flagged in a previous brief, and this week's value has improved: surface a "this moved in the right direction" callout
- [ ] Format: "Agency usage was flagged 3 weeks ago at 31%. It is now 27%. Down 4 points."
- [ ] This is the only org memory feature in the MSS — did Camino's signal correlate with improvement?

### Milestone 4 Acceptance Criteria

- [ ] Surge receives a brief containing at least one signal he confirms he was not already tracking
- [ ] Surge can articulate a decision he made (or intends to make) based on a Camino signal
- [ ] Surge has opened the brief on mobile at least 3 times across the 4-week period (weeks 5-8)
- [ ] Surge has forwarded at least one brief to a board member, investor, or team member
- [ ] Brief word count stays under 450 words — no padding, no generic statements
- [ ] Every "so what" statement in the brief references a specific number from the data
- [ ] KPI trend view is live — Surge can see the 6-week history of any signal
- [ ] Brief history view is live — Surge can read any brief from the past 8 weeks
- [ ] At least one "moved in the right direction" callout has fired correctly

**M4 Exit Gate:** Did Surge make a business decision informed by a Camino signal? YES / NO

---

## MILESTONE 5 — Weeks 9-10: Hardening + Payment

**Goal:** The product is stable, secure, and reliable enough to charge for. Surge converts to a paid subscription.

---

### Security and Data Integrity

- [ ] Audit RLS policies — confirm no cross-customer data leakage is possible via any query
- [ ] Confirm all API routes require authenticated session — no unauthenticated access to any data
- [ ] Confirm CSV files are not stored publicly — Supabase Storage with private bucket policy
- [ ] Review all Claude prompts — confirm no customer data is logged or retained by Anthropic beyond API call
- [ ] Confirm `customer_id` is validated server-side on every ingest, not just client-side

### Performance

- [ ] Signal card feed loads in under 2 seconds on a 4G mobile connection
- [ ] Brief view loads in under 2 seconds on a 4G mobile connection
- [ ] CSV upload handles Surge's file size (confirm row count) without timeout
- [ ] All SQL views have appropriate indexes on `customer_id` and date columns
- [ ] Supabase query performance reviewed — no N+1 queries in the signal feed

### Mobile Experience

- [ ] Test on iOS Safari (Surge's likely browser)
- [ ] Test on Android Chrome
- [ ] Signal cards render correctly at all iPhone screen sizes (SE, 15 Pro, 15 Pro Max)
- [ ] Brief email renders correctly in Gmail mobile and Apple Mail
- [ ] All tap targets are minimum 44x44px
- [ ] No horizontal scrolling on any screen

### Product Completeness Checklist

- [ ] Surge can log in on a new device without founder assistance
- [ ] If Surge forgets his password, the reset flow works without founder involvement
- [ ] Sam can log in and access the admin toggle without founder assistance
- [ ] A new CSV upload triggers the full pipeline without any manual steps
- [ ] The cron job has run successfully for at least 4 consecutive Mondays
- [ ] No brief has been generated with empty or placeholder content

### Pricing and Payment Setup

- [ ] Pricing confirmed with Surge — amount, cadence (monthly), payment method
- [ ] Stripe or equivalent payment link created
- [ ] First invoice sent to Surge
- [ ] Payment received

### Final Success Criteria — MSS Complete

- [ ] Surge is paying for Camino
- [ ] Surge has opened the brief for 6 consecutive weeks
- [ ] Surge has made at least one documented business decision informed by a Camino signal
- [ ] Sam has used the admin toggle to verify at least 3 signal formulas
- [ ] No brief has been missed — 10 briefs generated, 10 briefs delivered
- [ ] Zero cross-customer data leakage confirmed by RLS audit
- [ ] Founder has not manually intervened in the pipeline for at least 4 weeks
- [ ] Post-MSS backlog is documented and prioritised: self-service onboarding, signal thread (operator Level 2), native Zoho integration

**M5 Exit Gate:** Is Surge paying? YES / NO

---

## What Comes Next (Post-MSS Backlog, Pre-Prioritised)

| Priority | Feature | Why now |
|---|---|---|
| P0 | Self-service progressive onboarding | Makes Camino scalable beyond Surge. Required before customer 2. |
| P0 | Operator Level 2 — signal thread | Loop closes inside Camino. Sam responds to flagged signals in-product. |
| P1 | Native Zoho OAuth integration | Removes CSV friction. Daily data freshness becomes possible. |
| P1 | Thumbs up / thumbs down signal feedback | Trust loop — exec rates each signal, output improves over time. |
| P2 | Second customer onboarding | Validates the pipeline works for a different data shape. |
| P2 | Scheduled export automation (daily) | Data freshness upgrade — no manual action required at all. |
| P3 | Benchmark data via LLM research | Adds market context to signals — "your win rate vs. industry median". |
| P3 | Operator Level 3 — full operator surface | Sam's own dashboard, queue, investigation tools, action log. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Surge's numbers don't match Zoho at M1 | Medium | High — blocks all trust | Pre-validate stage mappings with Sam before Week 1 build starts |
| Claude synthesis quality is too generic | Medium | High — Surge stops reading | Tune prompt with Locumate-specific domain context in Week 7-8 |
| Cron job fails silently | Low | High — missed brief = trust damage | Error alerting to founder on any pipeline failure |
| pg_trgm fuzzy match produces wrong group joins | Medium | Medium — wrong cross-table insight | Test threshold manually against all group names before shipping M2 |
| Sam doesn't engage with admin toggle | Low | Medium — UC5 gap remains open | Walk Sam through the toggle on a screen share in Week 1 |
| Surge loses interest before M4 | Low | Critical | Weekly check-in call with Surge through M1-M3. Don't go dark. |
| Data file format changes (Zoho export format update) | Low | Medium | Store raw JSONB — replay normalisation at any time with corrected fingerprint |

---
