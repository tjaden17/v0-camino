# Camino — Minimum Sellable Service
## 8-Week Scope Document
> Status: Approved
> Version: 2.0
> Date: March 2026
> Based on: sign-off session (22 decisions) + use case review session (UC1–UC5)
> Key updates: operator layer defined and scoped, goal-setting model confirmed, data freshness confirmed, use cases mapped to build plan

---

## The Goal

By the end of week 8, Surge (CEO, Locumate) is paying for Camino. He opens the weekly brief every Monday. He has made at least one business decision informed by a Camino signal. The brief saves him meaningful time compared to pulling reports from Zoho manually.

---

## Use Case Coverage — MSS v1

Five use cases were validated against the MSS scope. Here is their status:

| Use Case | Description | Primary User | Covered in MSS? | Notes |
|---|---|---|---|---|
| UC1 | Goals and KPIs — setting, tracking, discovering | Admin / Exec / CSM | Partial | Goal context captured via founder-led onboarding call for MSS. Self-service onboarding questionnaire is post-MSS (next product priority). |
| UC2 | Data ingest — pulling data without friction | CSM | Yes — weeks 1-2 | CSV upload for MSS. Weekly cadence confirmed as sufficient. Scheduled export automation is a week 6-8 stretch goal. |
| UC3 | Signal synthesis — "so what" from the data | CSM / Exec | Yes — weeks 4-8 | Progressive trust ladder. Sam verifies signals offline. Admin toggle gives Sam formula transparency inside the app. |
| UC4 | Broad signal exploration — general health browse | CSM / Exec | Yes — week 3+ | Scrollable signal feed as default home screen. Brief pinned at top. Full signal feed below, newest first, browsable anytime. |
| UC5 | Deep dive and validation — investigate a specific problem | CSM | Level 1 only | Admin toggle (formula + sample rows) is in scope. Full operator investigation surface (signal thread, action log, breakdown views) is post-MSS. Loop closes outside Camino for MSS release. |

---

## Operator Layer Decision — Confirmed

**Three levels were defined. Level 1 is in scope for MSS. Levels 2 and 3 are post-MSS.**

| Level | What it is | In MSS? |
|---|---|---|
| Level 1 — Admin toggle | Sam logs in with admin flag. Signal cards show expandable "Calculation Detail" panel: formula in plain English, source table, sample rows, SQL view link. | Yes — 3 days of build |
| Level 2 — Signal thread | Surge flags a signal to Sam inside Camino. Sam investigates and logs findings. Response surfaces back in Surge's view. Loop closes in the product. | Post-MSS — first release after MSS |
| Level 3 — Full operator surface | Sam's own dashboard, queue, investigation tools, breakdown views, action log with status tracking. | Post-MSS — MVP phase months 3-6 |

**Rationale:** In weeks 1-8, Sam already investigates issues using Zoho and Shifts reports. Camino accelerates her by surfacing the signal and framing the context. She doesn't yet need a separate product to investigate. The admin toggle gives her formula verification without requiring a separate surface to be built.

---

## Goal Context — Confirmed Model for MSS

**Goal context is captured via a founder-led onboarding call, not a self-service flow, for the MSS.**

- Founder conducts one onboarding call (60 min) with the exec before brief generation begins
- Output: goals, priorities, concerns, "what's on my mind in the next 90 days" captured as structured notes
- These notes are entered into the `customer_profiles` table manually by the founder
- Signal Ranking (Layer 5) and Brief Synthesis (Layer 6) are both personalised against this context

**Self-service progressive onboarding** (in-app questionnaire, 5-7 structured questions, feeds directly into `customer_profiles`) is the first post-MSS product release. This is what makes Camino scalable beyond white-glove onboarding.

---

## Data Freshness — Confirmed

**Weekly data update cadence is sufficient for the MSS.**

- Surge's needs are met by a weekly brief and a weekly signal card refresh
- Data does not need to move daily in weeks 1-8
- Scheduled export automation (daily cadence) is a week 6-8 stretch goal, not a core requirement
- If Surge requests more frequent updates between briefs, this is addressed in the MVP phase with native API integration

---

## What the MSS Is

A single-sided, exec-only intelligence product that:

1. Ingests data from three sources (Zoho CRM, Zoho Desk, Shifts data) via CSV upload
2. Maps and validates the schema once with Sam (CSM) as the trust intermediary
3. Computes a defined set of KPIs deterministically via SQL
4. Snapshots KPI values on every upload to build trend data
5. Ranks the top signals weekly using AI, weighted by Surge's stated goals
6. Generates a decision-mapped weekly brief — what happened, why it matters, what to do
7. Delivers the brief via push notification and email before Monday morning
8. Presents signal cards in a mobile-first app that Surge can scan in under 90 seconds

---

## What the MSS Is Not

The following are explicitly out of scope for weeks 1-8:

| Out of scope | When it comes |
|---|---|
| Operator Level 2 — signal thread (Surge flags to Sam, loop closes in product) | First post-MSS release |
| Operator Level 3 — full operator surface (Sam's dashboard, queue, breakdown views) | MVP — months 3-6 |
| Self-service onboarding questionnaire (replaces founder-led onboarding call) | First post-MSS release |
| Signal share primitive (exec to operator) | MVP — months 3-6 |
| Action log and decision notes | MVP — months 3-6 |
| Push notification threshold alerts | Week 6 stretch goal |
| Daily data refresh / scheduled export automation | Week 6-8 stretch goal |
| Native Zoho OAuth API integration | Month 3+ |
| External virality features | Growth phase — months 7-18 |
| Group formation and portfolio views | Growth phase |
| Full organisational memory (annotation, decision log, goal evolution) | Growth phase |
| Benchmark data (LLM-researched from public sources) | Month 6+ |
| Thumbs up / thumbs down signal feedback | Post-launch |

---

## The User

**Primary user:** Surge Singh, CEO, Locumate

**Use case:** Monday morning, on mobile. App open or push notification. Scans 3-5 signal cards in under 90 seconds. Understands whether anything needs his attention this week. Reads the weekly brief when he has 2 minutes. Forwards it to his board when relevant.

**Secondary interaction:** Surge sees a signal, flags it mentally. He speaks to Sam. Sam is expected to have investigated it already because she has access to Camino's operator data view. (Sam's formal Camino surface is post-MSS — but she should be using the same data layer informally from week 3 onwards.)

---

## The Data Sources

| Source | Table | Priority | Status |
|---|---|---|---|
| Zoho CRM | Deals | P0 — essential | CSV provided |
| Shifts data | Shifts (non-protected) | P0 — essential | CSV provided |
| Zoho Desk | Support tickets | P1 — include if time | Not yet provided |
| Zoho CRM | Leads | P2 — deprioritise | CSV provided, data quality poor |

**All ingested via CSV for weeks 1-8.** Scheduled export automation is a week 6-8 stretch goal.

---

## The KPI Set

### From Zoho CRM Deals

| KPI | Why it matters to Surge |
|---|---|
| Win rate | Core conversion metric — are we closing? |
| Active pipeline value | Total open opportunity |
| Weighted pipeline | Probability-adjusted view of revenue likelihood |
| Average deal size (won) | Qualification quality signal |
| Average sales cycle duration | Speed to close |
| Pipeline by stage | Where deals are getting stuck |
| Deals by lead source | Which channels are producing |
| Sales concentration | % of pipeline owned by one person (Surge) — structural risk |
| Late stage stall | Deals >90 days in proposal/contracts stage |

### From Shifts Data

| KPI | Why it matters to Surge |
|---|---|
| Shift fill rate | Core platform health — are pharmacies getting locums? |
| Agency usage % | Platform leakage — Surge flagged as a key concern ("up 30%, bad thing") |
| GMV by pharmacy group | Operational revenue concentration |
| Active pharmacy groups | Customer base health |
| Locum supply health | Supply-side risk |
| Geographic distribution | State-level coverage |
| Pharmacy feedback trend | Leading indicator of churn |

### Cross-Table (Deals + Shifts — the MSS's primary "insight you didn't ask for")

| KPI | Why it matters |
|---|---|
| Operational accounts with no subscription deal | Pharmacy groups generating Shifts GMV but with no Closed Won deal — revenue on the table |
| GMV vs subscription value ratio | Are subscription deals sized appropriately for what groups actually generate? |

---

## The Weekly Brief Format

```
CAMINO WEEKLY BRIEF — Week of [date]
Locumate

HEADLINE
[One sentence. The most important thing that happened this week.]

SIGNAL 1: [KPI Name] — [value] — [up/down X%]
What:    [Precise numbers. No rounding.]
So what: [Why this matters given Surge's priorities.]
Now what: [The specific question or action.]

SIGNAL 2–5: [Same format]

THE INSIGHT YOU DIDN'T ASK FOR
[One cross-table discovery. Something no single Zoho report shows.]

THIS WEEK IN SUMMARY
[Two sentences. Where Locumate stands heading into next week.]
```

---

## The Trust Architecture

**The trust ladder — how confidence is earned week by week:**

| Week | What Surge sees | Trust task |
|---|---|---|
| 1-2 | KPI numbers only. No interpretation. | Do these match his Zoho? |
| 3-4 | Trend layer added. "Win rate was 40% last quarter, 34% this quarter." | Does the trend match his perception? |
| 5-6 | Interpretation added. "A 6% drop at this deal stage typically indicates a qualifying gap." | Does this resonate with what he's hearing from the team? |
| 7-8 | Full synthesis + cross-table insight. Proactive discovery. | Does the operational-not-subscribed list look right? Does the join make sense? |

**Sam is the trust intermediary.** Surge verifies signals by asking Sam, not by reading SQL. Sam gets the verification tools — formula transparency, sample rows, audit trail. Surge never sees the plumbing. He sees the verified output.

**Trust is earned through demonstrated accuracy, not claimed through AI confidence scores.**

---

## The 8-Week Build Plan

### Week 1-2: Verified Numbers
**Ship:** Signal cards in mobile-first UI. KPIs computed from Surge's three CSVs. Numbers that match Zoho.

**Build:**
- Supabase schema: `source_uploads`, `raw_deals`, `raw_shifts`, `schema_fingerprints`, `normalised_deals`, `normalised_shifts`
- CSV upload handler with Papaparse streaming
- Schema fingerprint generation — AI maps columns, Sam reviews and confirms
- SQL views for all single-table KPIs (win rate, pipeline, fill rate, agency usage)
- Signal card UI — mobile-first, one card per screen, scrollable feed as default home screen
- Admin toggle: Sam's account flagged as admin. Signal cards gain expandable "Calculation Detail" panel — formula in plain English, source table, row count, 3 sample rows, SQL view name. Exec accounts never see this panel.
- `customer_profiles` table populated from founder onboarding call notes

**Test:** Surge looks at Win Rate in Camino and confirms it matches what he calculates in Zoho. Trust established. Sam opens Calculation Detail on the same card and confirms the formula is correct.

**Key question to resolve with Sam this week:** Which stages count as "Lost" for win rate calculation? ("Closed - No Budget", "Closed - Timing", etc.) — this is a business question, not a technical one.

---

### Week 3: The Insight Moment
**Ship:** Cross-table discovery. Surge sees something Zoho cannot show him.

**Build:**
- Enable `pg_trgm` extension in Supabase
- `v_operational_not_subscribed` view — fuzzy join on group name vs account name
- `v_gmv_vs_subscription_value` view
- Surface as a dedicated "insight card" in the signal feed — visually distinct from single-table signals
- `kpi_snapshots` table and `snapshot_kpis()` Postgres function

**Test:** Surge sees the cross-table card. He recognises the pharmacy groups. He says "I didn't know that." He can also browse the full signal feed — scrolling through all active signals, not just the ones in the brief.

---

### Week 4: First Brief
**Ship:** Weekly intelligence brief. Surge reads it in under 2 minutes.

**Build:**
- Signal ranking route: `POST /api/signals/rank` — Claude Haiku + goal context
- Brief generation route: `POST /api/brief/generate` — Claude Opus
- Brief UI in app — card-based on mobile, readable on desktop
- Brief email delivery via Resend
- Customer profile table: goals, priorities, concerns (populated from onboarding session notes)

**Test:** Surge receives the brief by email and in-app. He reads it. It references at least one decision he is actively facing.

---

### Week 5-6: Automated Delivery
**Ship:** Brief updates without Surge doing anything.

**Build:**
- Scheduled export setup: Surge's Zoho generates a weekly report, emails it to a dedicated Camino inbox
- Inbound email handler: parse attachment, trigger ingest pipeline
- Vercel Cron Job: run brief generation every Monday at 6am
- Push notification: brief available notification

**Test:** Surge receives two consecutive automated briefs without any manual action from the founder or from Surge.

---

### Week 7-8: Synthesis Quality + Retention Signal
**Ship:** Interpretation layer and proactive signals. The "didn't ask for" moments.

**Build:**
- Tune synthesis prompt for Surge's domain specifically (healthcare staffing marketplace, B2B SaaS model)
- Add the "didn't ask for" signals: sales concentration index, late stage stall rate, geographic mismatch
- Tighten signal ranking to Surge's goal context from onboarding notes
- Brief history view — Surge can see previous briefs in app
- Basic KPI trend view — did the metrics Camino flagged move in the right direction?

**Test:** Surge receives three consecutive unprompted brief opens. He forwards at least one brief externally. He says "Camino told me something I didn't know."

---

## The Data Model Designed for What Comes Next

Even though operator features, network effects, and organisational memory are post-MSS, the following are built into the schema from day one:

```sql
-- Supports operator surface (post-MSS)
signal_flags (
  id, customer_id, signal_id, flagged_by, flagged_at,
  note, assigned_to, status   -- 'open' | 'investigating' | 'resolved'
)

-- Supports action log (post-MSS)
decision_log (
  id, customer_id, signal_id, brief_id,
  action_committed, committed_by, committed_at,
  resolved, resolved_at, outcome_notes
)

-- Supports network effects (growth phase)
org_group_memberships (
  id, org_id, group_id, member_role, joined_at
)

-- Supports benchmark data (month 6+)
benchmark_snapshots (
  id, industry, company_size_band, kpi_name,
  median_value, p25_value, p75_value,
  source, sourced_at
)
```

These tables are created in the initial migration. They hold no data during the MSS phase. They are ready when the features arrive.

---

## Success Criteria for Week 8

| Criteria | Measure |
|---|---|
| Surge is paying | Subscription active |
| Brief is opened | 3 consecutive weekly opens |
| Trust is established | Sam has validated all KPI formulas in the system |
| One decision made | Surge can name one business decision informed by a Camino signal |
| No manual founder work | Two consecutive briefs generated and delivered without founder involvement |
| Data model is future-ready | `signal_flags`, `decision_log`, `org_group_memberships` tables exist in schema |

---
