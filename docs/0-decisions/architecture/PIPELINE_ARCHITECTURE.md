# Camino: Approved Pipeline Architecture
> Status: Approved — CTO/CPO Review Complete
> Supersedes: `docs/exploration/REVISED_ARCHITECTURE.md`
> Date: March 2026
> Scope: v1 — One customer (Surge). Supabase only. In-app delivery.

---

## Context

The original spec-driven approach had a structural problem: hard-coded column mappings break on every new customer's data shape, KPI formulas require manual re-definition per customer, and every onboarding is effectively a new consulting engagement.

This architecture solves that with a six-layer pipeline where the ingest and normalise layers absorb all customer-specific variation, and every downstream layer — compute, snapshot, ranking, synthesis — is customer-agnostic.

**What was reviewed and rejected during the architecture session:**

| Rejected element | Decision |
|---|---|
| Drizzle ORM | Removed. Existing SQL migration pattern (`scripts/`) works. No additional ORM layer needed. |
| Claude/Anthropic AI | Removed. Vercel AI SDK + OpenAI already in stack. `generateObject` works identically. Zero switching benefit. |
| Resend email delivery | Removed for v1. In-app brief only. Email is week 8+ if the brief format validates with Surge. |
| `raw_deals` + `raw_shifts` as separate tables | Merged into a single `raw_rows` table with a `source_type` column. Truly generic. |
| CSM review UI | Simplified to `/admin/fingerprints` — founder reviews manually. Not a polished product feature yet. |
| Synchronous pipeline | Rejected. Will hit Vercel 60s timeout. `waitUntil` from day one. |
| Cross-table join (`v_operational_not_subscribed`) | Deferred. Validate with Surge before building — see end of this document. |
| "Universal" scalability claims | Deferred. The SQL views are Surge-shaped. That's correct for v1. Don't design for customer 3 until customer 2 exists. |

---

## Guiding Principle

> Build the pipeline once. Let the data delivery mechanism change over time without touching anything downstream.

CSV upload today. Scheduled export in weeks 6–8. Native Zoho/HubSpot API in month 3+. In all three cases, the customer never re-onboards. Their KPIs, history, and signals are fully preserved.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Database | Supabase (Postgres) — SQL views, JSONB, `pg_trgm` fuzzy match, point-in-time snapshots |
| Backend | Next.js Route Handlers — async pipeline chains via `waitUntil` |
| AI layer | Vercel AI SDK + OpenAI — `generateObject` for structured outputs |
| Schema validation | Zod — type-safe AI outputs, prevents malformed LLM responses breaking the pipeline |
| File parsing | Papaparse — streaming CSV parse |
| Migrations | `scripts/` SQL files — existing pattern, no ORM |

---

## The Six Layers

```
SOURCE DATA (CSV / Scheduled Export / API — swappable)
         ↓
  [ 1. INGEST ]         — receive and store raw data faithfully, no transformation
         ↓
  [ 2. NORMALISE ]      — AI maps columns to semantic schema, founder confirms once
         ↓
  [ 3. COMPUTE ]        — deterministic SQL views calculate KPIs
         ↓
  [ 4. SNAPSHOT ]       — point-in-time KPI values written on every upload
         ↓
  [ 5. SIGNAL RANKING ] — AI ranks top 5 material changes given exec's goals
         ↓
  [ 6. SYNTHESIS ]      — AI writes the weekly brief + signal memos
```

---

## Layer 1: INGEST

**Job:** Receive any data file, store every row as-is. No schema opinions at this stage.

**Route:** `POST /api/ingest/upload`

**Process:**
1. Receive multipart form data (CSV + customer metadata)
2. Parse with Papaparse (streaming)
3. Write upload metadata to `source_uploads`
4. Write each raw row as JSONB to `raw_rows` with `source_type`
5. Trigger normalisation job (via `waitUntil`)

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

raw_rows (
  id             uuid PRIMARY KEY,
  upload_id      uuid REFERENCES source_uploads,
  customer_id    uuid,
  source_type    text,          -- 'zoho_crm_deals', 'zoho_shifts', etc.
  raw_data       jsonb,         -- entire source row, nothing dropped
  ingested_at    timestamptz
)
```

**Why a single `raw_rows` table?** JSONB accepts any shape. `source_type` distinguishes deals from shifts. One table is simpler to query, simpler to replay, and means new data sources require no schema migration — just a new `source_type` value.

**Why JSONB?** At ingest time the schema is unknown. Storing the full row as JSONB means nothing is ever lost. Normalisation can be replayed with a corrected fingerprint at any time — the raw data is always available.

---

## Layer 2: NORMALISE

**Job:** Map raw column names to the internal semantic schema. Run once at onboarding, reused forever.

**Route:** `POST /api/ingest/analyse-schema`

**Process:**
1. Read first 10 rows of JSONB from the upload
2. Extract column names and sample values
3. Call OpenAI via `generateObject` with Zod schema
4. Propose mapping to founder via `/admin/fingerprints` page
5. Founder confirms or corrects
6. Save approved mapping as `schema_fingerprint`
7. Run normalisation job: read `raw_rows`, apply fingerprint, write to `normalised_deals` or `normalised_shifts`

**The AI call pattern:**
```typescript
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const result = await generateObject({
  model: openai('gpt-4o'),
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

**Why `generateObject` with Zod?** Structured, type-safe output that can be stored and rendered in a UI. Free-text LLM responses break data pipelines. `generateObject` guarantees the shape.

**Database schema:**
```sql
schema_fingerprints (
  id               uuid PRIMARY KEY,
  customer_id      uuid,
  source_type      text,
  column_mappings  jsonb,
  value_mappings   jsonb,
  join_keys        jsonb,
  validated_by     text,          -- founder email
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
  raw_id         uuid             -- audit link back to raw_rows
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

**Key design decision:** Normalised tables use semantic column names (`stage = 'closed_won'`) not source names (`Stage = 'Won - Closed'`). All downstream layers speak this semantic language exclusively. Customer 2 might have completely different stage names — the normalise layer translates them to the same internal vocabulary. SQL views work identically for all customers.

---

## Layer 3: COMPUTE (SQL Views)

**Job:** Calculate KPIs deterministically from normalised data. Mathematical definitions. Do not change between customers.

**Tech:** Postgres SQL views in Supabase, managed via `scripts/` SQL migration files.

**The critical architectural distinction:**

> Hard-coding the mathematical definition of win rate is correct and necessary.
> Hard-coding what win rate *means* for a specific customer's business is wrong.
>
> `COUNT(stage='closed_won') / COUNT(stage IN ('closed_won','closed_lost'))` is a fact.
> "Your win rate of 34% is a risk" is a judgment. SQL owns the former. AI owns the latter.

**Full view set for Surge (v1):**

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
WHERE (stage ILIKE '%proposal%' OR stage ILIKE '%contract%')
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
```

> **Cross-table view (`v_operational_not_subscribed`) is deferred** — see end of document.

---

## Layer 4: SNAPSHOT

**Job:** On every upload, run all views and write point-in-time KPI values to a snapshots table. This is the system's memory — it enables trends.

**Trigger:** Called automatically after normalisation completes (within the `waitUntil` chain).

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

  -- one INSERT per KPI view
END;
$$ LANGUAGE plpgsql;
```

**Delta calculation (input to Signal Ranking):**
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

Pure SQL window function. No application logic.

---

## Layer 5: SIGNAL RANKING

**Job:** Look at all KPI deltas. Decide which five are worth the executive's attention this week, given their stated goals and priorities.

**Route:** Called internally within the pipeline — not exposed as a standalone endpoint.

**Model:** `gpt-4o-mini` — this is a classification and filtering task, not a reasoning task. Fast and cheap.

```typescript
const { object: signals } = await generateObject({
  model: openai('gpt-4o-mini'),
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
      decision_relevance:   z.string()    // maps to customer's stated priorities
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

**Why `gpt-4o-mini` not `gpt-4o`?** Signal ranking is a classification task — the LLM is applying a relevance filter based on stated priorities to a list of numbers. `gpt-4o-mini` handles this reliably. `gpt-4o` is reserved for the exec-facing synthesis output where reasoning quality is visible.

---

## Layer 6: SYNTHESIS

**Job:** Take the top 5 ranked signals and write the weekly brief plus individual signal memos. This is the product — what Surge cannot get from Zoho.

**Route:** `POST /api/brief/generate`

**Model:** `gpt-4o` — exec-facing output, quality matters.

> **Week 5 validation gate:** Before committing the Zod schema below, generate a mock brief manually using Surge's actual data and get his reaction. The McKinsey memo format is a hypothesis. Only proceed to a typed schema after the format is validated.

```typescript
const { object: brief } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    headline:         z.string(),
    signal_memos: z.array(z.object({
      title:          z.string(),
      what:           z.string(),    // the fact, with precise numbers
      so_what:        z.string(),    // the interpretation
      now_what:       z.string(),    // the question or specific action
      kpi_name:       z.string(),
      value:          z.number(),
      delta_pct:      z.number()
    })).max(5),
    week_in_summary:  z.string()
  }),
  prompt: `You are a McKinsey-trained analyst writing a weekly intelligence brief
           for a CEO. Be direct, specific, and actionable. Use their data exactly —
           never round numbers or approximate. Connect signals to decisions.

           Company context: ${customerProfile.company_context}
           Executive priorities: ${customerProfile.priorities}
           Top signals this week: ${JSON.stringify(rankedSignals)}

           Write the brief. For each signal: what happened (precise numbers),
           why it matters (interpretation), what to do (specific question or action).`
})
```

**Brief structure delivered to the exec:**
```
WEEKLY INTELLIGENCE BRIEF — Week of [date]

HEADLINE
One sentence. The most important thing that happened this week.

5 SIGNAL MEMOS
Each: What happened → So what → Now what

WEEK IN SUMMARY
Two sentences. Where the business stands heading into next week.
```

---

## Signal Memos + Mobile Signal Cards

After the brief is generated, individual signal memos are written to the database. These power the Level 3 deep-dive on mobile signal accordion cards.

**Database schema:**
```sql
signal_memos (
  id             uuid PRIMARY KEY,
  customer_id    uuid,
  kpi_name       text,
  what           text,
  so_what        text,
  now_what       text,
  computed_at    timestamptz,
  upload_id      uuid
)
```

**Two generation modes:**

| Mode | Which signals | When | How |
|---|---|---|---|
| Automatic | Top 5 ranked signals | Every upload, part of brief pipeline | Written during `POST /api/brief/generate` |
| On-demand | All other signals | When user taps Level 3 on a signal card | `POST /api/signals/[id]/memo` |

**Mobile card flow:**
- Level 1 + 2 (metric + trend): reads from `kpi_snapshots`
- Level 3 (What / So What / Now What): reads latest memo from `signal_memos`
- If no memo exists: shows "Generate insight" button → calls on-demand endpoint

**Where this replaces existing code:** `signal-accordion-card.tsx` currently reads from `ai_analysis_cache`. Update to read from `signal_memos` instead.

---

## Async Pipeline (waitUntil)

The full upload → brief chain runs asynchronously from day one. This avoids Vercel's 60s timeout and gives the user immediate feedback after upload.

```
POST /api/ingest/upload
  → respond 200 immediately ("Upload received, processing...")
  → waitUntil(
      parseCSV()
        → writeRawRows()           // raw_rows table
        → checkFingerprint()
            YES → normalise()      // normalised_deals / normalised_shifts
            NO  → analyseSchema()  // propose to /admin/fingerprints, STOP
        → snapshotKPIs()           // kpi_snapshots table
        → rankSignals()            // gpt-4o-mini
        → generateBrief()          // gpt-4o → briefs table
        → writeSignalMemos()       // signal_memos table (top 5)
        → revalidateUI()           // Next.js revalidatePath
    )
```

If no fingerprint exists (new customer or new source type), the pipeline pauses after schema analysis and waits for founder approval at `/admin/fingerprints`. Once approved, the normalisation job is re-triggered.

---

## 8-Week Build Sequence

**Weeks 1–2: Schema + pipeline skeleton**
- Create `raw_rows`, `schema_fingerprints`, `kpi_snapshots`, `signal_memos` tables
- Wire ingest handler (CSV → `raw_rows`)
- Build normalisation job (fingerprint → `normalised_deals` / `normalised_shifts`)
- `/admin/fingerprints` page (approve/reject mapping)

**Weeks 3–4: SQL views + snapshot**
- Create all 7 SQL views in Supabase
- `snapshot_kpis()` Postgres function
- Full async pipeline via `waitUntil`
- Signal cards reading from `kpi_snapshots`

**Week 5 (validation gate): Prototype brief with Surge's real data**
- Generate brief manually or with a simple prompt — no Zod schema yet
- Show Surge. Get format feedback.
- Only proceed to Week 6 with a confirmed format.

**Weeks 6–7: Brief synthesis**
- `generateObject` endpoint with validated Zod schema
- In-app brief display
- Signal ranking (top 5 → brief input)
- `signal_memos` written, Level 3 card updated

**Week 8: Surge live**
- End-to-end upload → brief flow
- Cross-table insight (if Surge validated it in Week 5)
- Polish + reliability

---

## What Already Exists (Extend, Don't Rewrite)

| Existing | How it's used |
|---|---|
| `lib/ai-analysis-service.ts` | Extend with brief synthesis function |
| `lib/signal-intelligence.ts` | Wire existing scoring to pass top 5 into brief generation |
| `components/signal-accordion-card.tsx` | Update Level 3 to read from `signal_memos` |
| CSV parser (Papaparse) | Already in stack — wire to `raw_rows` writer |
| Vercel AI SDK | Already configured — swap model to `openai('gpt-4o')` |
| `column_mappings` table | `schema_fingerprints` extends this pattern |

**Files to create (critical path only):**
- `scripts/013_pipeline_schema.sql` — `raw_rows`, `schema_fingerprints`, `kpi_snapshots`, `signal_memos`, SQL views
- `lib/ingest-service.ts` — raw JSONB storage
- `lib/normalisation-service.ts` — applies fingerprint to raw rows
- `lib/snapshot-service.ts` — calls `snapshot_kpis()`
- `app/api/ingest/upload/route.ts` — upload endpoint with `waitUntil`
- `app/api/ingest/analyse-schema/route.ts` — schema analysis + fingerprint proposal
- `app/api/brief/generate/route.ts` — brief synthesis
- `app/admin/fingerprints/page.tsx` — minimal approval UI

---

## Cross-Table Join (Deferred)

**What it does:** Finds pharmacy groups actively booking shifts (generating GMV) that have no Closed Won subscription deal in the CRM. Answers "who are your biggest platform users who aren't paying subscribers?" — invisible inside either Zoho system alone.

**Why technically interesting:** Group names won't match exactly (`"TerryWhite Chemmart Bondi"` vs `"TWC Network - Store Subscription"`). `pg_trgm` fuzzy matching at 0.6 similarity threshold handles this in pure Postgres — no AI needed.

```sql
-- Only build after Surge confirms this is a genuine blind spot

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE VIEW v_operational_not_subscribed AS
SELECT
  s.customer_id,
  s.group_name,
  SUM(s.shift_value) AS total_gmv,
  COUNT(DISTINCT s.shift_date) AS active_days
FROM normalised_shifts s
LEFT JOIN normalised_deals d
  ON  s.customer_id = d.customer_id
  AND similarity(s.group_name, d.account_name) > 0.6
  AND d.stage = 'closed_won'
WHERE s.status = 'finished'
  AND d.id IS NULL
GROUP BY s.customer_id, s.group_name;
```

**Decision:** Do not build until Surge confirms this is a genuine blind spot. Question to ask him in Week 5: *"Do you have pharmacy groups generating meaningful shift revenue who haven't formally signed a subscription? And would knowing that list change what you do this week?"*

- Yes → build in Week 8
- No → defer to customer 2

---

## Scalability (Honest Scope)

The SQL views are Surge-shaped. That is correct for v1 — don't design for customer 3 until customer 2 exists.

| Concern | How the architecture handles it when the time comes |
|---|---|
| New customer with different column names | New schema fingerprint. Same normalised tables. Same SQL views. No new code. |
| New data source (HubSpot instead of Zoho) | New ingest handler. Same `raw_rows` table (JSONB accepts any shape). Same everything downstream. |
| New KPI needed | New SQL view. Runs for all customers immediately. No per-customer work. |
| Brief quality improvement | Better prompt or schema. Redeploys in minutes. All customers benefit immediately. |
| Native API integration | New ingest handler writes same `raw_rows` table. Fingerprint reused. Zero re-onboarding. |

---

*Approved: CTO/CPO architecture session, March 2026.*
*For build sequencing questions, see `docs/0-decisions/roadmap/`.*
