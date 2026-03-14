# Camino: Revised Architecture
> Status: Approved — post sign-off session
> Version: 2.0
> Author: CTO/CPO Strategy Session
> Date: March 2026
> Sign-off decisions incorporated: A1, A3, B1, B2, C1–C4, D1, D2, E1–E3, F1–F3, G1–G2

---

## Context

This document captures the recommended technical architecture for Camino, derived from a strategic review of the current spec-driven approach and its limitations. It covers why the architecture was redesigned, how each layer works, how it will be built, and how it serves both the immediate 8-week milestones and long-term scalability.

The core problem the current spec-driven approach could not solve:
- Hard-coded column mappings break on every new customer's data shape
- KPI formulas require significant manual mental effort to define and verify
- Every new customer is effectively a new consulting engagement
- The approach could not scale without a data engineering team

---

## Confirmed Scope Decisions

**Data sources in scope for Minimum Sellable Service (8 weeks):**
- Zoho CRM Deals
- Zoho Desk (support tickets)
- Shifts data (internal operational data)
- Zoho CRM Leads (lower priority — data quality currently poor, include but deprioritise)

**CSV is temporary scaffolding.** It exists to learn data shapes before native integrations are built. The canonical schema is designed now to accommodate native integrations later. The customer never re-onboards when the delivery mechanism changes.

**Operator surface (Sam/CSM view) is post-MSS.** The 8-week build is exec-only. The signal share primitive and action log schema are designed into the data model from day one, but the operator UI is built in the MVP phase (months 3-6).

**Organisational memory is post-MSS.** The only memory captured in weeks 1-8 is whether Camino's signals helped KPIs trend in the right direction. Full annotation, decision log, and goal evolution tracking come later.

**Benchmark data** will be sourced from LLM research against public databases — not from aggregated customer data. No consent or privacy implications in the near term.

---

## The Guiding Principle

> Build the pipeline once. Let the data delivery mechanism change over time without touching anything downstream.

CSV upload today. Scheduled export in weeks 6-8. Native Zoho API in month 3+. In all three phases, the customer never re-onboards. Their KPIs, history, and signals are fully preserved.

---

## The Full Stack

**Confirmed database decision: Supabase Postgres only. No Neon. No separate data warehouse.**

| Concern | Technology | Reason |
|---|---|---|
| Database | Supabase (Postgres) | Single database. SQL views, JSONB, pg_trgm fuzzy match, point-in-time snapshots. RLS for customer data isolation. |
| Backend | Next.js Route Handlers | Already in stack, handles async pipeline chains |
| AI layer | Vercel AI SDK + Claude Anthropic | `generateObject` for structured outputs, Haiku for ranking, Opus for synthesis |
| Schema validation | Zod | Type-safe AI outputs, prevents broken pipeline from malformed LLM responses |
| ORM | Drizzle | SQL-first, lightweight, pairs with Supabase, manages view migrations |
| File parsing | Papaparse | Streaming CSV parse, handles large files without memory issues |
| Scheduling | Vercel Cron Jobs | Weekly brief generation trigger |
| Email delivery | Resend | Transactional email for weekly brief delivery |

**Supabase-specific advantages for this architecture:**
- Row Level Security (RLS) enforces `customer_id` isolation at the database level — one policy ensures no customer ever sees another's data, without application-layer guards
- Supabase Storage can hold raw CSV files for audit replay if needed
- Supabase Auth handles operator and exec user accounts natively
- `pg_trgm` extension available — needed for the cross-table fuzzy group name matching

---

## The Six Layers

```
SOURCE DATA (CSV / Scheduled Export / API — swappable)
         ↓
  [ 1. INGEST ]         — receive and store raw data faithfully, no transformation
         ↓
  [ 2. NORMALISE ]      — AI maps columns to semantic schema, human confirms once
         ↓
  [ 3. COMPUTE ]        — deterministic SQL views calculate KPIs
         ↓
  [ 4. SNAPSHOT ]       — point-in-time KPI values written on every upload
         ↓
  [ 5. SIGNAL RANKING ] — AI ranks top 5 material changes given exec's goals
         ↓
  [ 6. SYNTHESIS ]      — AI writes the weekly McKinsey brief
```

---

## Layer 1: INGEST

**Job:** Receive any data file, store every row as-is. No opinions about schema at this stage.

**Route:** `POST /api/ingest/upload`

**Process:**
1. Receive multipart form data (CSV + customer metadata)
2. Parse with Papaparse (streaming)
3. Write upload metadata to `source_uploads`
4. Write each raw row as JSONB to `raw_deals` or `raw_shifts`
5. Trigger normalisation job

**Database schema:**
```sql
source_uploads (
  id             uuid PRIMARY KEY,
  customer_id    uuid,
  source_type    text,          -- 'zoho_crm_deals', 'zoho_shifts', etc.
  filename       text,
  row_count      int,
  uploaded_at    timestamptz,
  status         text           -- 'pending' | 'normalised' | 'computed' | 'error'
)

raw_deals (
  id             uuid PRIMARY KEY,
  upload_id      uuid REFERENCES source_uploads,
  customer_id    uuid,
  raw_data       jsonb,         -- entire source row, nothing dropped
  ingested_at    timestamptz
)

raw_shifts (
  id             uuid PRIMARY KEY,
  upload_id      uuid REFERENCES source_uploads,
  customer_id    uuid,
  raw_data       jsonb,
  ingested_at    timestamptz
)
```

**Why JSONB?** At ingest time the schema is unknown. Storing the full row as JSONB means nothing is ever lost. The normalisation layer reads the JSONB and extracts what it needs. This also means replaying normalisation with a corrected fingerprint is always possible — the raw data is always available.

**Future-proofing:** When the Zoho API connector is built, it writes to the same `raw_deals` table using the same JSONB pattern. The ingest layer has no opinion about source. Swapping CSV for API is a new ingest handler, nothing more.

---

## Layer 2: NORMALISE

**Job:** Map raw column names to the internal semantic schema. Run once at onboarding, reused forever.

**Route:** `POST /api/ingest/analyse-schema`

**Process:**
1. Read first 10 rows of JSONB from the upload
2. Extract column names and sample values
3. Call Claude via AI SDK `generateObject` with Zod schema
4. Return proposed mapping to CSM review UI
5. CSM confirms or corrects
6. Save approved mapping as `schema_fingerprint`
7. Run normalisation job: read `raw_deals`, apply fingerprint, write to `normalised_deals`

**The AI call pattern:**
```typescript
import { generateObject } from 'ai'
import { z } from 'zod'

const result = await generateObject({
  model: 'anthropic/claude-opus-4',
  schema: z.object({
    table_type: z.enum(['crm_deals', 'crm_leads', 'shifts', 'support_tickets', 'unknown']),
    confidence: z.number(),
    column_mappings: z.array(z.object({
      source_column:  z.string(),   // "Amount"
      semantic_name:  z.string(),   // "deal_value"
      data_type:      z.enum(['currency', 'percentage', 'text', 'date', 'integer', 'boolean']),
      confidence:     z.number(),
      notes:          z.string().optional()
    })),
    value_mappings: z.array(z.object({
      column:         z.string(),   // "Stage"
      source_value:   z.string(),   // "Won - Closed"
      semantic_value: z.string()    // "closed_won"
    })),
    join_keys: z.array(z.object({
      this_column:        z.string(),
      joins_to_table:     z.string(),
      joins_to_column:    z.string(),
      confidence:         z.number()
    }))
  }),
  prompt: `...`
})
```

**Why `generateObject` with Zod?** Structured, type-safe output that can be stored in the database and rendered in a UI. Free-text LLM responses break data pipelines. `generateObject` guarantees the shape.

**Database schema:**
```sql
schema_fingerprints (
  id               uuid PRIMARY KEY,
  customer_id      uuid,
  source_type      text,
  column_mappings  jsonb,
  value_mappings   jsonb,
  join_keys        jsonb,
  validated_by     text,          -- CSM email
  validated_at     timestamptz,
  version          int            -- incremented on re-validation
)

normalised_deals (
  id             uuid PRIMARY KEY,
  customer_id    uuid,
  upload_id      uuid,
  deal_name      text,
  deal_value     numeric,
  stage          text,            -- always semantic: 'closed_won', 'closed_lost', etc.
  probability    numeric,
  owner          text,
  created_at     date,
  closed_at      date,
  lead_source    text,
  account_name   text,
  raw_id         uuid             -- audit link back to raw_deals
)

normalised_shifts (
  id              uuid PRIMARY KEY,
  customer_id     uuid,
  upload_id       uuid,
  pharmacy_name   text,
  group_name      text,
  shift_date      date,
  status          text,           -- 'finished', 'cancelled', 'agency'
  shift_value     numeric,
  rate            numeric,
  locum_id        text,
  feedback_score  numeric,
  state           text,
  raw_id          uuid
)
```

**Key design decision:** The normalised tables use semantic column names (`stage = 'closed_won'`) not source names (`Stage = 'Won - Closed'`). All downstream layers speak this semantic language exclusively. Customer 2 might have completely different stage names — the normalised layer translates them to the same internal vocabulary. SQL views work identically for all customers.

---

## Layer 3: COMPUTE (SQL Views)

**Job:** Calculate KPIs deterministically from normalised data. These are mathematical definitions. They do not change between customers.

**Tech:** Postgres SQL views, managed via Drizzle migrations.

**The critical architectural distinction:**

> Hard-coding the mathematical definition of win rate is correct and necessary.
> Hard-coding what win rate means for a specific customer's business is wrong.
>
> `COUNT(stage='closed_won') / COUNT(stage IN ('closed_won','closed_lost'))` is a fact.
> "Your win rate of 34% is a risk" is a judgment. SQL owns the former. AI owns the latter.

**Full view set for Surge (derived from actual data provided):**

```sql
-- SALES VIEWS (from normalised_deals)

CREATE VIEW v_win_rate AS
SELECT
  customer_id,
  COUNT(*) FILTER (WHERE stage = 'closed_won')::float /
  NULLIF(COUNT(*) FILTER (WHERE stage IN ('closed_won','closed_lost')), 0) AS win_rate,
  COUNT(*) FILTER (WHERE stage = 'closed_won') AS won_count,
  COUNT(*) FILTER (WHERE stage IN ('closed_won','closed_lost')) AS total_closed
FROM normalised_deals
GROUP BY customer_id;

CREATE VIEW v_pipeline_value AS
SELECT
  customer_id,
  SUM(deal_value) FILTER (WHERE stage NOT IN ('closed_won','closed_lost')) AS open_pipeline,
  SUM(deal_value * probability / 100) FILTER (WHERE stage NOT IN ('closed_won','closed_lost')) AS weighted_pipeline
FROM normalised_deals
GROUP BY customer_id;

CREATE VIEW v_sales_concentration AS
SELECT
  customer_id,
  owner,
  COUNT(*) AS deal_count,
  COUNT(*)::float / SUM(COUNT(*)) OVER (PARTITION BY customer_id) AS pct_of_pipeline
FROM normalised_deals
WHERE stage NOT IN ('closed_won','closed_lost')
GROUP BY customer_id, owner;

CREATE VIEW v_late_stage_stall AS
SELECT
  customer_id,
  deal_name,
  stage,
  deal_value,
  created_at,
  CURRENT_DATE - created_at AS age_days
FROM normalised_deals
WHERE stage IN ('closed_won' -- exclude), stage ILIKE '%proposal%' OR stage ILIKE '%contract%'
AND (CURRENT_DATE - created_at) > 90
AND stage NOT IN ('closed_won','closed_lost');

-- OPERATIONS VIEWS (from normalised_shifts)

CREATE VIEW v_shift_fill_rate AS
SELECT
  customer_id,
  date_trunc('month', shift_date) AS month,
  COUNT(*) FILTER (WHERE status = 'finished')::float / NULLIF(COUNT(*), 0) AS fill_rate
FROM normalised_shifts
GROUP BY customer_id, date_trunc('month', shift_date);

CREATE VIEW v_agency_usage AS
SELECT
  customer_id,
  date_trunc('month', shift_date) AS month,
  COUNT(*) FILTER (WHERE status = 'agency')::float / NULLIF(COUNT(*), 0) AS agency_pct,
  COUNT(*) AS total_shifts
FROM normalised_shifts
GROUP BY customer_id, date_trunc('month', shift_date);

CREATE VIEW v_gmv_by_group AS
SELECT
  customer_id,
  group_name,
  SUM(shift_value) AS total_gmv,
  COUNT(*) FILTER (WHERE status = 'finished') AS completed_shifts
FROM normalised_shifts
GROUP BY customer_id, group_name;

-- CROSS-TABLE VIEW (the insight Zoho can never show)
-- Requires pg_trgm extension: CREATE EXTENSION pg_trgm;

CREATE VIEW v_operational_not_subscribed AS
SELECT
  s.customer_id,
  s.group_name,
  SUM(s.shift_value) AS total_gmv,
  COUNT(DISTINCT s.shift_date) AS active_days,
  d.id IS NULL AS no_subscription_deal
FROM normalised_shifts s
LEFT JOIN normalised_deals d
  ON  s.customer_id = d.customer_id
  AND similarity(s.group_name, d.account_name) > 0.6
  AND d.stage = 'closed_won'
WHERE s.status = 'finished'
GROUP BY s.customer_id, s.group_name, d.id
HAVING d.id IS NULL;
```

**The cross-table join note:** Surge's Shifts table has `group_name = "TerryWhite Chemmart"` and his Deals table has `account_name = "TWC Network Store Subscription"`. These do not match on exact string equality. `pg_trgm` trigram similarity with a threshold of 0.6 resolves this without AI involvement — pure Postgres.

---

## Layer 4: SNAPSHOT

**Job:** On every upload, run all views and write point-in-time KPI values to a single snapshots table. This is the memory of the system — it enables trends.

**Route:** Triggered automatically after normalisation completes.

**Database schema:**
```sql
kpi_snapshots (
  id             uuid PRIMARY KEY,
  customer_id    uuid,
  kpi_name       text,           -- 'win_rate', 'agency_usage_pct', etc.
  value          numeric,
  period_label   text,           -- 'Q1 2025', 'March 2025'
  period_start   date,
  period_end     date,
  upload_id      uuid,
  computed_at    timestamptz
)
```

**The snapshot Postgres function:**
```sql
CREATE OR REPLACE FUNCTION snapshot_kpis(p_customer_id uuid, p_upload_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO kpi_snapshots (customer_id, kpi_name, value, upload_id, computed_at)
  SELECT p_customer_id, 'win_rate', win_rate, p_upload_id, now()
  FROM v_win_rate WHERE customer_id = p_customer_id;

  INSERT INTO kpi_snapshots (customer_id, kpi_name, value, upload_id, computed_at)
  SELECT p_customer_id, 'agency_usage_pct', agency_pct, p_upload_id, now()
  FROM v_agency_usage
  WHERE customer_id = p_customer_id ORDER BY month DESC LIMIT 1;

  -- ... one INSERT per KPI view
END;
$$ LANGUAGE plpgsql;
```

**Delta calculation for the Signal Ranking layer:**
```sql
SELECT
  kpi_name,
  value AS current_value,
  LAG(value) OVER (PARTITION BY customer_id, kpi_name ORDER BY computed_at) AS previous_value,
  value - LAG(value) OVER (PARTITION BY customer_id, kpi_name ORDER BY computed_at) AS delta
FROM kpi_snapshots
WHERE customer_id = $1
ORDER BY kpi_name, computed_at DESC;
```

This delta query is the input to Layer 5. It is a pure SQL window function — no application logic.

---

## Layer 5: SIGNAL RANKING

**Job:** Look at all KPI deltas. Decide which five are worth the executive's attention this week, given their stated goals and priorities.

**Route:** `POST /api/signals/rank`

**Model:** Claude Haiku (fast, cheap — this is a classification task, not a reasoning task)

```typescript
const { object: signals } = await generateObject({
  model: 'anthropic/claude-haiku-4',
  schema: z.object({
    ranked_signals: z.array(z.object({
      kpi_name:             z.string(),
      current_value:        z.number(),
      previous_value:       z.number(),
      delta:                z.number(),
      delta_pct:            z.number(),
      direction:            z.enum(['up', 'down', 'flat']),
      is_positive:          z.boolean(),
      materiality_score:    z.number(),   // 0-10
      one_line_reason:      z.string(),
      decision_relevance:   z.string()    // maps to customer's decisions
    })).max(5)
  }),
  prompt: `You are a business intelligence analyst reviewing weekly KPI movements
           for an executive. Rank the top 5 most material signals given their 
           priorities. A signal is material if: the % change is significant, 
           it connects to a stated priority, or it indicates an emerging risk.
           
           Executive priorities: ${goalContext.priorities}
           Current concerns: ${goalContext.concerns}
           KPI changes this period: ${JSON.stringify(deltas)}`
})
```

**Why Claude Haiku not Opus here?** Signal ranking is a classification and filtering task. The LLM is looking at numbers and applying a relevance filter based on stated priorities. Haiku handles this reliably at a fraction of the cost. Opus is reserved for where reasoning quality directly impacts the exec-facing output.

---

## Layer 6: SYNTHESIS

**Job:** Take the top 5 ranked signals and write the weekly brief. This is the product. This is what Surge cannot get from Zoho.

**Route:** `POST /api/brief/generate`

**Model:** Claude Opus (this is the exec-facing output — quality is everything)

```typescript
const { object: brief } = await generateObject({
  model: 'anthropic/claude-opus-4',
  schema: z.object({
    headline:         z.string(),
    signal_memos: z.array(z.object({
      title:          z.string(),
      what:           z.string(),    // the fact, precise numbers
      so_what:        z.string(),    // the interpretation
      now_what:       z.string(),    // the question or action
      kpi_name:       z.string(),
      value:          z.number(),
      delta_pct:      z.number()
    })).max(5),
    cross_table_insight: z.object({
      title:                z.string(),
      insight:              z.string(),
      supporting_data:      z.string(),
      decision_connection:  z.string()
    }).optional(),
    week_in_summary:  z.string()
  }),
  prompt: `You are a McKinsey-trained analyst writing a weekly intelligence brief 
           for a CEO. Be direct, specific, and actionable. Use their data exactly —
           never round numbers or approximate. Connect signals to decisions.
           
           Company context: ${customerProfile.company_context}
           Executive priorities: ${customerProfile.priorities}
           Top signals this week: ${JSON.stringify(rankedSignals)}
           Cross-table discoveries: ${JSON.stringify(crossTableInsights)}
           
           Write the brief. For each signal: what happened (precise numbers), 
           why it matters (interpretation), what to do (specific question or action).
           Include one insight they did not ask for but should know.`
})
```

**Brief structure delivered to the exec:**
```
WEEKLY INTELLIGENCE BRIEF — Week of [date]

HEADLINE
One sentence. The most important thing that happened this week.

5 SIGNAL MEMOS
Each: What happened → So what → Now what

THE INSIGHT YOU DIDN'T ASK FOR
One cross-table discovery. Something invisible in any single system.

WEEK IN SUMMARY
Two sentences. Where the business stands heading into next week.
```

---

## Orchestration: The Full Pipeline

Every upload triggers the following chain:

```
Upload received (POST /api/ingest/upload)
    → Parse CSV (Papaparse streaming)
    → Write raw rows to raw_deals / raw_shifts (JSONB)
    → Check if schema_fingerprint exists for this customer + source_type
        YES → run normalisation job immediately
        NO  → run schema analysis (Claude), send CSM to review UI
    → Normalisation complete → write to normalised_deals / normalised_shifts
    → Call snapshot_kpis() Postgres function
    → Snapshots written → call /api/signals/rank (Claude Haiku)
    → Signals ranked → call /api/brief/generate (Claude Opus)
    → Brief saved to database
    → Send email via Resend
    → Revalidate signal card UI
```

In weeks 1-4: this runs synchronously. The user uploads and waits for a result.
In weeks 6-8: move to background jobs using Vercel `waitUntil` so the user gets immediate feedback and the brief appears asynchronously.

---

## The Three-Phase Data Delivery Evolution

| Phase | When | Ingest method | Customer experience |
|---|---|---|---|
| 1 | Weeks 1-5 | Manual CSV upload | Upload file, see brief within minutes |
| 2 | Weeks 6-8 | Scheduled Zoho export to monitored inbox | Brief updates automatically, no upload needed |
| 3 | Month 3+ | Native Zoho / HubSpot OAuth API connector | Real-time or daily automatic refresh |

**In all three phases:** Layers 2-6 are identical. The schema fingerprint from Phase 1 is reused in Phase 2 and 3. The customer's KPI history, approved formulas, and signal context carry forward. They never re-onboard.

---

## Scalability Analysis

| Concern | How the architecture handles it |
|---|---|
| New customer with different column names | New schema fingerprint. Same normalised tables. Same SQL views. No new code. |
| New data source (HubSpot instead of Zoho) | New ingest handler. Same raw table (JSONB accepts any shape). Same everything downstream. |
| New KPI needed | New SQL view. Runs for all customers immediately. No per-customer work. |
| 10x more customers | `customer_id` partitioning in Postgres. Views already filter by it. Linear scaling. |
| Brief quality improvement | Better prompt. Redeploys in minutes. All customers benefit immediately. |
| Native API integration | New ingest handler writes same raw tables. Fingerprint reused. Zero re-onboarding. |

---

## How Each Layer Maps to the Strategy House

| Layer | Strategic Pillar |
|---|---|
| Ingest + Normalise | **Radical Trust** — source-faithful, CSM-validated, auditable |
| SQL Views + Snapshot | **Radical Trust** — deterministic, verifiable, matches source |
| Signal Ranking | **Superior Synthesis** — contextual, goal-aware, not generic |
| Brief / Memo | **Superior Synthesis** — cross-table insight Zoho never shows |
| Phase 2/3 integrations | **Agentic Intelligence** — self-updating, zero admin friction |
| Fingerprint + history | **Agentic Intelligence** — system builds a model of the customer's business over time |

---

## First KPIs to Build for Surge (Derived from His Actual Data)

These are derivable from the three files already provided (Zoho CRM Deals, Zoho Shifts, Zoho CRM Leads).

**Single-table (Deals):** win_rate, open_pipeline_value, weighted_pipeline, avg_deal_size_won, avg_sales_cycle_days, pipeline_by_stage, deals_by_lead_source, sales_concentration_pct, late_stage_stall_count, late_stage_stall_value

**Single-table (Shifts):** shift_fill_rate, agency_usage_pct, gmv_by_group, gmv_by_state, locum_supply_concentration, avg_shift_rate, pharmacy_feedback_avg, active_pharmacy_count

**Cross-table (Deals + Shifts):** operational_not_subscribed (pharmacy groups active on platform with no Closed Won deal), gmv_per_subscribed_account (expansion signal)

**The join key:** `normalised_shifts.group_name` ↔ `normalised_deals.account_name` via `pg_trgm` similarity > 0.6

---

*Document generated from CTO/CPO strategy session, March 2026.*
*To be reviewed and refined as architecture is validated against Surge's live data.*
