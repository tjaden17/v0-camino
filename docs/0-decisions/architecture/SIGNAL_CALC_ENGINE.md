# Signal Calculation Engine — Architecture Decision

Date: February 25, 2026
Status: DECIDED

---

## The Problem

Signal calculations are currently hardcoded logic in TypeScript. Changing a formula requires a developer and a deploy. This does not scale to multiple customers with different tools, different stage names, and different accuracy thresholds.

## The Decision

Move all signal definitions into the database. The calculation engine reads configuration rows and executes them. No signal formula lives in application code.

---

## The 3 Core Tables

### 1. signal_definitions
What each signal is and how it is calculated.

| Column | Type | Example |
|---|---|---|
| `id` | uuid | |
| `key` | text | `win_rate` |
| `label` | text | `Win Rate` |
| `description` | text | `Percentage of deals that closed won vs total closed` |
| `schema_type` | text | `crm` |
| `operation` | enum | `RATIO` |
| `primary_field` | text | `stage` |
| `numerator_filter` | text | `stage = 'Closed Won'` |
| `denominator_filter` | text | `stage IN ('Closed Won','Closed Lost')` |
| `value_field` | text | `deal_value` (used for SUM/AVERAGE) |
| `start_date_field` | text | `created_at` (used for DURATION) |
| `end_date_field` | text | `closed_at` (used for DURATION) |
| `exclude_filter` | text | `account_name NOT LIKE '%test%'` |
| `format` | enum | `percentage` / `currency` / `number` / `days` |
| `trend_direction` | enum | `up_is_good` / `down_is_good` |
| `urgency_threshold` | text | `< 20` |
| `warning_threshold` | text | `< 30` |
| `is_active` | boolean | `true` |
| `created_at` | timestamp | |

---

### 2. field_aliases
How raw column names from each tool map to universal field names.

| Column | Type | Example |
|---|---|---|
| `id` | uuid | |
| `schema_type` | text | `crm` |
| `source_tool` | text | `hubspot` |
| `raw_column` | text | `hs_deal_stage` |
| `universal_field` | text | `stage` |
| `transform` | text | null / `multiply:0.65` / `uppercase` |
| `confidence` | integer | `95` (percent — used during auto-mapping) |
| `created_at` | timestamp | |

---

### 3. value_mappings
What each tool calls standard values like "Closed Won".

| Column | Type | Example |
|---|---|---|
| `id` | uuid | |
| `schema_type` | text | `crm` |
| `source_tool` | text | `hubspot` |
| `universal_field` | text | `stage` |
| `raw_value` | text | `closedwon` |
| `universal_value` | text | `Closed Won` |
| `created_at` | timestamp | |

---

### 4. signal_overrides
Per-org overrides for thresholds and labels. Never touches the base definition.

| Column | Type | Example |
|---|---|---|
| `id` | uuid | |
| `org_id` | uuid | |
| `signal_key` | text | `win_rate` |
| `custom_label` | text | `Close Rate` |
| `urgency_threshold` | text | `< 15` |
| `warning_threshold` | text | `< 25` |
| `exclude_filter` | text | `owner = 'test_user'` |
| `is_active` | boolean | `true` |
| `created_at` | timestamp | |

---

## The 5 Operations

The engine only needs to support 5 operations. Every signal in the catalog is one of these.

| Operation | Logic | Example Signal |
|---|---|---|
| `COUNT` | Count rows matching `numerator_filter` | Ticket Volume, Open Deals |
| `SUM` | Sum `value_field` matching `numerator_filter` | Pipeline Value, Revenue |
| `AVERAGE` | Average `value_field` matching `numerator_filter` | Average Deal Size |
| `RATIO` | COUNT(numerator_filter) / COUNT(denominator_filter) | Win Rate, CSAT, Churn Rate |
| `DURATION` | Average days between `start_date_field` and `end_date_field` | Sales Cycle, Time to Resolve |

If a signal cannot be expressed as one of these five, it is flagged as needing custom logic and handled as a special case explicitly — not as a pattern.

---

## The Execution Flow

```
Customer uploads data
        |
        v
Field aliases table translates raw columns → universal fields
        |
        v
Value mappings table translates raw values → universal values
        |
        v
Signal definitions table defines what to calculate
        |
        v
Engine executes operation against normalised data
        |
        v
Signal overrides table applies any per-org threshold adjustments
        |
        v
Signal output: value, trend, status (urgent / warning / stable)
```

---

## The Rules

1. Signal definitions NEVER reference raw column names. Only universal field names.
2. Field aliases NEVER live in application code. Only in the aliases table.
3. Adding a new tool = inserting alias rows. Zero code changes.
4. Fixing a wrong alias fixes every signal that uses that field, immediately.
5. Per-customer accuracy issues are resolved via signal_overrides, never by modifying the base definition.

---

## The 3 Accuracy Failure Modes

| Failure | Cause | Fix |
|---|---|---|
| Wrong rows included | Test deals, internal accounts mixed in | `exclude_filter` on signal_definition or signal_override |
| Field mapped incorrectly | Currency mismatch, wrong column | `transform` on field_alias |
| Threshold wrong for this customer | Their baseline is different | `urgency_threshold` on signal_override |

---

## Build Order

| Phase | What to Build | Unlocks |
|---|---|---|
| Now | `signal_definitions` table, engine reads 5 operations | All current signals configurable without redeploy |
| Goal 1 | `field_aliases` table replaces hardcoded column checks | Any Zoho/HubSpot customer with zero code change |
| Goal 2 | `value_mappings` table for stage names | Multi-CRM support |
| Goal 3 | `signal_overrides` table | Per-org accuracy tuning |
| Future | Admin UI for editing definitions | Self-serve, no engineering |

---

## Related Docs

- architecture/DATA_SHAPE_REGISTRY.md — schema types and non-CRM data shapes
- specs/SIGNAL_CATALOG.md — current signal definitions to be migrated into this table
- specs/SIGNAL_SERVICE_MASTER.md — original signal service design
- architecture/SIGNAL_SERVICE_V2.md — v2 architecture this decision extends
