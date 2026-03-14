# Camino — Minimum Sellable Service
## 8-Week Scope Document
> Status: Approved
> Version: 1.0
> Date: March 2026
> Based on: sign-off session covering 22 product, architecture, and strategy decisions

---

## The Goal

By the end of week 8, Surge (CEO, Locumate) is paying for Camino. He opens the weekly brief every Monday. He has made at least one business decision informed by a Camino signal. The brief saves him meaningful time compared to pulling reports from Zoho manually.

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
| Operator (Sam) UI surface | MVP — months 3-6 |
| Signal share primitive (exec to operator) | MVP — months 3-6 |
| Action log and decision notes | MVP — months 3-6 |
| Push notification threshold alerts | Week 6 stretch goal |
| Native Zoho OAuth API integration | Month 3+ |
| External virality features | Growth phase — months 7-18 |
| Group formation and portfolio views | Growth phase |
| Full organisational memory (annotation, decision log, goal evolution) | Growth phase |
| Benchmark data against market | Month 6+ |
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
- Signal card UI — mobile-first, one card per screen

**Test:** Surge looks at Win Rate in Camino and confirms it matches what he calculates in Zoho. Trust established.

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

**Test:** Surge sees the cross-table card. He recognises the pharmacy groups. He says "I didn't know that."

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
