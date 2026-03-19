# Camino — KPI Requirements & Gap Detection Design
> Status: Approved design — ready to build against
> Version: 1.0
> Date: March 2026
> Purpose: Define the canonical KPI requirements for Surge (Locumate), the gap detection logic, and the database tables that power both signal cards and gap cards.

---

## The Design Principle

Every KPI in Camino has a formal definition before any code is written. That definition specifies:
1. What it means in plain English
2. What canonical fields it needs
3. Which normalised table(s) it reads from
4. Whether an approximation is possible if a field is missing
5. What the signal card shows if the data is incomplete

This document is the source of truth. SQL views are written to match these definitions — not the other way around.

---

## The Three Tables This Document Drives

```sql
-- 1. What every KPI needs (static config — defined here, seeded once)
kpi_requirements (
  kpi_name          text PRIMARY KEY,
  display_name      text,
  description       text,           -- plain English definition
  required_fields   jsonb,          -- array of canonical field names
  required_sources  text[],         -- ['normalised_deals', 'normalised_shifts']
  approximation     text,           -- null if no approximation possible
  category          text,           -- 'sales' | 'operations' | 'cross_table'
  sql_view_name     text            -- the view that calculates it
)

-- 2. Per-customer KPI status (dynamic — updated at fingerprint save time)
customer_kpi_status (
  id                uuid PRIMARY KEY,
  customer_id       uuid,
  kpi_name          text REFERENCES kpi_requirements,
  status            text,           -- 'calculable' | 'approximated' | 'missing_field' | 'missing_source' | 'skipped'
  gap_reason        text,           -- human-readable explanation if not calculable
  missing_fields    text[],         -- which specific fields are absent
  missing_sources   text[],         -- which data sources haven't been uploaded
  approximation_note text,          -- shown on signal card if approximated
  resolved_at       timestamptz,    -- null until gap is resolved
  updated_at        timestamptz
)

-- 3. Gap resolution requests (what Sam needs to chase)
kpi_gap_actions (
  id                uuid PRIMARY KEY,
  customer_id       uuid,
  kpi_name          text,
  action_type       text,           -- 'upload_source' | 'add_field' | 'skip'
  action_note       text,           -- instructions for Sam
  status            text,           -- 'open' | 'resolved' | 'skipped'
  created_at        timestamptz,
  resolved_at       timestamptz
)
```

---

## Surge's KPI Requirements — Full Definition

### SALES KPIs (source: normalised_deals)

---

#### KPI: win_rate
**Display name:** Win Rate
**Definition:** The percentage of closed deals that were won. Closed = stage is closed_won OR closed_lost. Open deals are excluded.

**Formula:**
```
win_rate = COUNT(stage = 'closed_won') / COUNT(stage IN ('closed_won', 'closed_lost'))
```

**Required fields:**
- `stage` — must contain mappable closed_won / closed_lost values
- `closed_at` — needed for period-based calculation (monthly trend)

**Required source:** `normalised_deals`

**Gap scenario:** If stage values cannot be mapped to closed_won / closed_lost (e.g. all stages are custom text with no obvious win/loss meaning), the gap_reason is: "Stage values could not be classified as won or lost. Sam needs to confirm which stages represent a closed win and which represent a closed loss."

**Approximation:** None. This KPI cannot be approximated. If stage mapping is absent, show gap card.

**Key question for Sam before building:** Which of Surge's Zoho stage values count as "Closed Lost"? (e.g. "Closed - No Budget", "Closed - Timing", "Closed - Competitor" — all should map to closed_lost)

**SQL view:** `v_win_rate`

---

#### KPI: active_pipeline_value
**Display name:** Active Pipeline
**Definition:** Total deal value of all open opportunities — i.e. deals not yet closed (not closed_won, not closed_lost).

**Formula:**
```
active_pipeline = SUM(deal_value) WHERE stage NOT IN ('closed_won', 'closed_lost')
```

**Required fields:**
- `stage` — to exclude closed deals
- `deal_value` — numeric deal amount

**Required source:** `normalised_deals`

**Gap scenario:** If `deal_value` is missing or unmappable (e.g. no amount column in the CSV), gap_reason: "No deal value column found in your CRM data. Pipeline value cannot be calculated without a numeric deal amount."

**Approximation:** None. Cannot approximate revenue without revenue data.

**SQL view:** `v_pipeline_value`

---

#### KPI: weighted_pipeline
**Display name:** Weighted Pipeline
**Definition:** Probability-adjusted pipeline value. Each open deal's value multiplied by its close probability, then summed. More conservative than raw pipeline — shows expected revenue.

**Formula:**
```
weighted_pipeline = SUM(deal_value * probability / 100) WHERE stage NOT IN ('closed_won', 'closed_lost')
```

**Required fields:**
- `stage`
- `deal_value`
- `probability` — close probability percentage (0-100)

**Required source:** `normalised_deals`

**Gap scenario:** If `probability` is missing, gap_reason: "Your CRM export doesn't include a close probability field. Weighted pipeline requires a probability percentage per deal."

**Approximation:** If probability is missing but stage is present, approximate using stage-based defaults: Proposal = 30%, Negotiation = 60%, Verbal Commitment = 80%. Show approximation badge. approximation_note: "Probability estimated from deal stage — upload a probability column for precise figures."

**SQL view:** `v_pipeline_value` (same view, second column)

---

#### KPI: avg_deal_size
**Display name:** Average Deal Size (Won)
**Definition:** The average value of deals that reached closed_won. A rising average deal size indicates improving qualification. A falling average indicates either smaller deals or discounting.

**Formula:**
```
avg_deal_size = AVG(deal_value) WHERE stage = 'closed_won'
```

**Required fields:**
- `stage`
- `deal_value`

**Required source:** `normalised_deals`

**Gap scenario:** Same as active_pipeline_value — missing deal_value blocks this KPI.

**Approximation:** None.

**SQL view:** `v_avg_deal_size`

---

#### KPI: avg_sales_cycle
**Display name:** Avg Sales Cycle (Days)
**Definition:** Average number of days from deal creation to closed_won. Longer cycles indicate friction in the closing process.

**Formula:**
```
avg_sales_cycle = AVG(closed_at - created_at) WHERE stage = 'closed_won'
```

**Required fields:**
- `created_at` — deal creation date
- `closed_at` — deal close date
- `stage`

**Required source:** `normalised_deals`

**Gap scenario:** If `created_at` is missing, gap_reason: "Your CRM export doesn't include a deal creation date. Sales cycle duration requires both a creation date and a close date."

**Approximation:** None.

**SQL view:** `v_avg_sales_cycle`

---

#### KPI: sales_concentration
**Display name:** Sales Concentration
**Definition:** The percentage of open pipeline owned by a single person (specifically: what % does Surge personally own?). High concentration in a founder is a structural risk — revenue depends on one person's relationships.

**Formula:**
```
concentration = COUNT(deals WHERE owner = surge_name) / COUNT(all open deals)
```

**Required fields:**
- `owner` — deal owner name
- `stage`

**Required source:** `normalised_deals`

**Gap scenario:** If `owner` is missing, gap_reason: "Your CRM export doesn't include a deal owner field. Sales concentration cannot be calculated without knowing who owns each deal."

**Approximation:** None.

**Special config:** Surge's owner name must be stored in `customer_profiles.exec_name` so the view can filter correctly. This is set during onboarding.

**SQL view:** `v_sales_concentration`

---

#### KPI: late_stage_stall
**Display name:** Late Stage Stall
**Definition:** Deals in late-stage (Proposal, Negotiation, Verbal Commitment) that have been in that stage for more than 90 days. These are deals at risk of dying silently.

**Formula:**
```
stalled = deals WHERE stage IN (late_stage_values) AND (today - created_at) > 90
```

**Required fields:**
- `stage`
- `created_at`

**Required source:** `normalised_deals`

**Gap scenario:** If `created_at` is missing, this KPI cannot be calculated.

**Approximation:** None.

**Special config:** "Late stage" values are customer-specific. For Surge, these need to be confirmed with Sam. Likely: Proposal Sent, In Negotiation, Verbal Commitment.

**SQL view:** `v_late_stage_stall`

---

### OPERATIONS KPIs (source: normalised_shifts)

---

#### KPI: shift_fill_rate
**Display name:** Shift Fill Rate
**Definition:** The percentage of shifts that were successfully filled (status = finished). Core platform health metric. A fill rate below 85% indicates supply-side risk.

**Formula:**
```
fill_rate = COUNT(status = 'finished') / COUNT(all shifts)
```

**Required fields:**
- `status` — must map to 'finished' | 'cancelled' | 'agency'
- `shift_date` — for period grouping

**Required source:** `normalised_shifts`

**Gap scenario:** If status values cannot be classified, gap_reason: "Shift status values could not be mapped. Sam needs to confirm which values represent a successfully completed shift."

**Approximation:** None.

**Key question for Sam:** What are the exact status values in the shifts CSV? (e.g. "Completed", "Finished", "Done" — these should all map to 'finished')

**SQL view:** `v_shift_fill_rate`

---

#### KPI: agency_usage_pct
**Display name:** Agency Usage
**Definition:** The percentage of shifts filled by agency rather than through the Locumate platform. Surge flagged this as a critical concern — above 30% indicates revenue leakage. Each agency shift is a shift the platform did not monetise.

**Formula:**
```
agency_pct = COUNT(status = 'agency') / COUNT(all shifts)
```

**Required fields:**
- `status` — must have an identifiable 'agency' value

**Required source:** `normalised_shifts`

**Gap scenario:** If no status value maps clearly to agency use, gap_reason: "No agency status value identified in your shifts data. Sam needs to confirm how agency-filled shifts are marked."

**Approximation:** None. This is too important to approximate.

**Threshold:** 30% is the concern threshold for Surge. Store in `customer_kpi_thresholds` table (see below).

**SQL view:** `v_agency_usage`

---

#### KPI: gmv_by_group
**Display name:** GMV by Pharmacy Group
**Definition:** Total shift value (revenue) generated per pharmacy group. Shows which groups are the most operationally active — and therefore highest-value customers.

**Formula:**
```
gmv = SUM(shift_value) GROUP BY group_name
```

**Required fields:**
- `group_name` — pharmacy group identifier
- `shift_value` — numeric shift value

**Required source:** `normalised_shifts`

**Gap scenario:** If `shift_value` is missing, gap_reason: "Your shifts data doesn't include a shift value or rate column. GMV cannot be calculated without a monetary value per shift." If `group_name` is missing: "Your shifts data doesn't include a pharmacy group column. GMV can be calculated at the pharmacy level but not at the group level."

**Approximation:** If `group_name` is missing but `pharmacy_name` is present, calculate at pharmacy level and note: "Grouped by pharmacy — group-level rollup unavailable without a group identifier column."

**SQL view:** `v_gmv_by_group`

---

#### KPI: active_pharmacy_groups
**Display name:** Active Pharmacy Groups
**Definition:** Count of distinct pharmacy groups with at least one completed shift this month. A declining count is an early churn signal.

**Formula:**
```
active_groups = COUNT(DISTINCT group_name) WHERE status = 'finished' AND shift_date >= month_start
```

**Required fields:**
- `group_name`
- `status`
- `shift_date`

**Required source:** `normalised_shifts`

**Gap scenario:** If `group_name` is missing, fall back to `pharmacy_name`. approximation_note: "Counted by pharmacy location — group rollup unavailable."

**SQL view:** `v_active_groups`

---

#### KPI: locum_repeat_rate
**Display name:** Locum Repeat Rate
**Definition:** Percentage of locums who completed 2 or more shifts in the period. High repeat rate = locums like the platform. Low repeat rate = supply-side churn risk.

**Formula:**
```
repeat_rate = COUNT(DISTINCT locum_id WHERE shift_count >= 2) / COUNT(DISTINCT locum_id)
```

**Required fields:**
- `locum_id` — unique locum identifier

**Required source:** `normalised_shifts`

**Gap scenario — missing_field:** If no locum identifier column exists, gap_reason: "Your shifts data doesn't include a locum identifier (ID or name). Repeat rate cannot be calculated without knowing which locum did which shift."

**Approximation:** If `locum_id` is missing but `locum_name` or similar text field is present, use name-based matching with approximation_note: "Calculated using locum name — name variations may cause minor errors. Add a locum ID column for precise tracking."

**SQL view:** `v_locum_repeat_rate`

---

### CROSS-TABLE KPIs (source: normalised_deals + normalised_shifts)

---

#### KPI: operational_not_subscribed
**Display name:** Ops Without Subscription
**Definition:** Pharmacy groups generating shift GMV on the platform but with no active subscription deal in the CRM. These are accounts generating revenue from the operations product but not paying for the subscription product. Direct revenue opportunity.

**Formula:**
```
operational_not_subscribed =
  pharmacy groups in normalised_shifts (with GMV > 0)
  LEFT JOIN normalised_deals ON similarity(group_name, account_name) > 0.6
  WHERE closed_won deal IS NULL
```

**Required fields:**
- `group_name` (shifts)
- `shift_value` (shifts)
- `account_name` (deals)
- `stage` (deals — to filter closed_won)

**Required sources:** BOTH `normalised_shifts` AND `normalised_deals`

**Gap scenario — missing_source:** If either source is absent, this KPI cannot be calculated. gap_reason: "This insight requires both your CRM deals data and your shifts data. Upload both to unlock cross-table discovery."

**Special requirement:** `pg_trgm` extension must be enabled in Supabase. Fuzzy match threshold: 0.6 (configurable).

**Approximation:** None. The value of this KPI is its precision — approximate matching would produce noise.

**SQL view:** `v_operational_not_subscribed`

---

#### KPI: gmv_vs_subscription_ratio
**Display name:** GMV vs Subscription Value
**Definition:** For accounts with both a subscription deal and active shifts, compare their monthly GMV to their subscription deal value. A high ratio means the subscription is undersized relative to the operational activity — repricing opportunity.

**Formula:**
```
ratio = SUM(shift_value per group per month) / deal_value (closed_won deal for that group)
```

**Required fields:**
- `group_name` (shifts)
- `shift_value` (shifts)
- `account_name` (deals)
- `deal_value` (deals)
- `stage` (deals)

**Required sources:** BOTH `normalised_shifts` AND `normalised_deals`

**Gap scenario:** Same as operational_not_subscribed — both sources required.

**SQL view:** `v_gmv_vs_subscription_ratio`

---

## The KPI Threshold Config Table

Some KPIs have exec-defined concern thresholds. These are stored per customer, not hard-coded in SQL.

```sql
customer_kpi_thresholds (
  id              uuid PRIMARY KEY,
  customer_id     uuid,
  kpi_name        text,
  threshold_value numeric,
  threshold_type  text,     -- 'above_is_bad' | 'below_is_bad'
  threshold_label text      -- shown on signal card: "above your 30% concern threshold"
)
```

**Surge's confirmed thresholds:**

| KPI | Threshold | Type | Label |
|---|---|---|---|
| agency_usage_pct | 0.30 | above_is_bad | "above your 30% concern threshold" |
| shift_fill_rate | 0.85 | below_is_bad | "below your 85% target" |
| sales_concentration | 0.60 | above_is_bad | "Surge owns more than 60% of pipeline" |
| late_stage_stall | 3 | above_is_bad | "more than 3 deals stalled over 90 days" |

---

## Gap Detection Logic — How It Runs

This runs automatically at schema fingerprint save time.

```
INPUT: validated schema fingerprint for customer X, source type Y
OUTPUT: customer_kpi_status rows updated for all KPIs that depend on source Y

FOR EACH kpi IN kpi_requirements WHERE source Y is in required_sources:

  1. Get required_fields for this KPI
  2. Get mapped fields from the fingerprint (what columns exist in the normalised table)
  3. Compare:
     - All required_fields present AND mappable → status = 'calculable'
     - Some required_fields missing BUT approximation defined → status = 'approximated'
     - Required_fields missing AND no approximation → status = 'missing_field'
     - Source not yet uploaded → status = 'missing_source'

  4. Write result to customer_kpi_status
  5. If not calculable → write a row to kpi_gap_actions for Sam to resolve
```

---

## What Surge Sees on His Signal Feed

**Calculable KPI:**
```
┌─────────────────────────────────────────────────────┐
│  Agency Usage                    needs attention     │
│  31%  ↑ up 8pts from last month                     │
│  ████████ Jan  ████████████ Feb  ████████████ Mar   │
│  "Above your 30% concern threshold. Platform        │
│   losing shifts to agency — revenue leakage."        │
└─────────────────────────────────────────────────────┘
```

**Approximated KPI:**
```
┌─────────────────────────────────────────────────────┐
│  Weighted Pipeline               approximated        │
│  AUD 1.2M  ↓ down 15% from last month               │
│  Note: probability estimated from deal stage.        │
│  Add a probability column for precise figures.       │
└─────────────────────────────────────────────────────┘
```

**Gap card — missing field:**
```
┌─────────────────────────────────────────────────────┐
│  Locum Repeat Rate               data needed         │
│  Your shifts data doesn't include a locum           │
│  identifier. Sam can resolve this.                  │
│  [Remind Sam →]                                     │
└─────────────────────────────────────────────────────┘
```

**Gap card — missing source:**
```
┌─────────────────────────────────────────────────────┐
│  Ops Without Subscription        data needed         │
│  This insight needs your Zoho Desk data.            │
│  Upload it to unlock cross-table discovery.         │
│  [Upload now →]                                     │
└─────────────────────────────────────────────────────┘
```

---

## The Seed Data — What Gets Inserted at Setup

When Camino's database is initialised, `kpi_requirements` is seeded with one row per KPI. This is static config — it never changes per customer.

```sql
INSERT INTO kpi_requirements VALUES
  ('win_rate',                'Win Rate',             'sales',       'v_win_rate',                  ARRAY['normalised_deals'],                          '["stage","closed_at"]',                null),
  ('active_pipeline_value',   'Active Pipeline',      'sales',       'v_pipeline_value',             ARRAY['normalised_deals'],                          '["stage","deal_value"]',               null),
  ('weighted_pipeline',       'Weighted Pipeline',    'sales',       'v_pipeline_value',             ARRAY['normalised_deals'],                          '["stage","deal_value","probability"]', 'stage_based_probability'),
  ('avg_deal_size',           'Avg Deal Size',        'sales',       'v_avg_deal_size',              ARRAY['normalised_deals'],                          '["stage","deal_value"]',               null),
  ('avg_sales_cycle',         'Avg Sales Cycle',      'sales',       'v_avg_sales_cycle',            ARRAY['normalised_deals'],                          '["stage","created_at","closed_at"]',   null),
  ('sales_concentration',     'Sales Concentration',  'sales',       'v_sales_concentration',        ARRAY['normalised_deals'],                          '["stage","owner"]',                    null),
  ('late_stage_stall',        'Late Stage Stall',     'sales',       'v_late_stage_stall',           ARRAY['normalised_deals'],                          '["stage","created_at"]',               null),
  ('shift_fill_rate',         'Shift Fill Rate',      'operations',  'v_shift_fill_rate',            ARRAY['normalised_shifts'],                         '["status","shift_date"]',              null),
  ('agency_usage_pct',        'Agency Usage',         'operations',  'v_agency_usage',               ARRAY['normalised_shifts'],                         '["status","shift_date"]',              null),
  ('gmv_by_group',            'GMV by Group',         'operations',  'v_gmv_by_group',               ARRAY['normalised_shifts'],                         '["group_name","shift_value"]',         'pharmacy_level_fallback'),
  ('active_pharmacy_groups',  'Active Groups',        'operations',  'v_active_groups',              ARRAY['normalised_shifts'],                         '["group_name","status","shift_date"]', 'pharmacy_level_fallback'),
  ('locum_repeat_rate',       'Locum Repeat Rate',    'operations',  'v_locum_repeat_rate',          ARRAY['normalised_shifts'],                         '["locum_id"]',                         'name_based_matching'),
  ('operational_not_subscribed','Ops Without Sub',    'cross_table', 'v_operational_not_subscribed', ARRAY['normalised_shifts','normalised_deals'],       '["group_name","shift_value","account_name","stage"]', null),
  ('gmv_vs_subscription_ratio','GMV vs Sub Ratio',    'cross_table', 'v_gmv_vs_subscription_ratio',  ARRAY['normalised_shifts','normalised_deals'],       '["group_name","shift_value","account_name","deal_value","stage"]', null);
```

---

## The Build Sequence for This Layer

```
Step 1: Create kpi_requirements table and seed with above data
        — no code, just a SQL migration
        — DONE when: table exists, 13 rows, all fields populated

Step 2: Create customer_kpi_status table
        — no code, just a SQL migration
        — DONE when: table exists, RLS policy applied

Step 3: Create kpi_gap_actions table
        — no code, just a SQL migration
        — DONE when: table exists

Step 4: Create customer_kpi_thresholds table and seed Surge's thresholds
        — no code, just a SQL migration + 4 seed rows
        — DONE when: Surge's 4 thresholds are in the table

Step 5: Write the gap detection function (runs at fingerprint save)
        — ~50 lines of TypeScript in /lib/gap-detection.ts
        — DONE when: uploading a CSV with a missing field creates a 'missing_field' row in customer_kpi_status

Step 6: Update signal card component to read kpi_status
        — show gap card if status != 'calculable' and status != 'approximated'
        — show approximation badge if status == 'approximated'
        — DONE when: a KPI with missing_field status shows a gap card, not an error

Step 7: Sam's admin gap view
        — list of all kpi_gap_actions for the customer, with instructions
        — DONE when: Sam can see which KPIs have gaps and what she needs to do
```

**Critical path:** Step 1 → 2 → 3 → 4 must be done before Step 5. Step 5 must be done before Step 6. Step 7 can be done in parallel with Step 6.

---

## Questions to Resolve with Sam Before Building SQL Views

These are business questions, not technical ones. The SQL views cannot be finalised until these are answered.

| Question | Why it matters | Who answers |
|---|---|---|
| Which Zoho stage values = closed_won? | Win rate formula depends on this | Sam |
| Which Zoho stage values = closed_lost? | Win rate formula depends on this | Sam |
| Which stage values are "late stage" for stall tracking? | Late stage stall KPI | Sam |
| What is the exact column name for deal value in Surge's Zoho export? | Pipeline value KPI | Sam |
| What is the exact column name for close probability? | Weighted pipeline KPI | Sam |
| What are the shift status values and which = agency? | Agency usage KPI — most critical | Sam |
| What are the shift status values and which = finished? | Fill rate KPI | Sam |
| Does the shifts CSV have a locum identifier column? | Locum repeat rate KPI | Sam |
| Does the shifts CSV have a pharmacy group column? | GMV by group + cross-table KPI | Sam |
| What is Surge's Zoho owner name exactly as it appears in the CSV? | Sales concentration KPI | Sam |
