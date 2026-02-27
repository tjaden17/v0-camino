# Staging Layer (Option B) – Recalc & Mining

## Overview

The **generate flow** (3-question upload) now persists each tab’s data into the staging layer so you can:

- **Recalc:** Re-run updated calculations (e.g. new formulas) over the last N uploads.
- **Mine:** Query and discover across uploads over time (which columns exist, which uploads have which data).

## What Gets Stored

When a user submits the generate flow:

1. **`raw_data_uploads`** (one row per tab)
   - `organization_id`, `uploaded_by`, `upload_name` (tab name), `file_name`, `total_rows`, `column_names`
   - **`upload_metadata`**: `{ answers, tabKey, tabName, signalDefinitions }` so you can replay the same flow (answers + which signals were requested).

2. **`raw_data_rows`** (one row per data row in that tab)
   - `upload_id`, `organization_id`, `row_index`, **`original_data`** (full row as JSONB).

3. **Signals** are linked via **`source_upload_id`** to the `raw_data_uploads` row for that tab.

## Schema (Neon)

Run once in Neon SQL Editor:

- **`scripts/016_raw_data_staging_neon.sql`**

Creates (or extends):

- `raw_data_uploads` – upload metadata + `upload_metadata` for replay.
- `raw_data_rows` – row-level data.
- `signals.source_upload_id` (and optional `source_row_ids`) for traceability.

## Recalc

To “re-run calculations over the last N uploads”:

1. Query: `SELECT * FROM raw_data_uploads WHERE organization_id = $org ORDER BY uploaded_at DESC LIMIT N`.
2. For each upload, load rows: `SELECT row_index, original_data FROM raw_data_rows WHERE upload_id = $id ORDER BY row_index`.
3. Read `upload_metadata` to get `answers` and `signalDefinitions`.
4. Rebuild the same shape the generate route expects (tabs + rows + signals) and call the same `calculateSignal` + persist logic (or POST to generate with that payload).

## Mining (Discovery)

- **By org:** `raw_data_uploads` and `raw_data_rows` are keyed by `organization_id`.
- **By columns:** `column_names` (and optionally scanning `original_data` keys) tell you what columns exist per upload.
- **By time:** `uploaded_at` on `raw_data_uploads` for “what did we have when”.

You can build discovery APIs (e.g. “which uploads have column X?”, “suggest new signals from available columns”) on top of this layer.

### Recalc API

- **POST /api/upload/recalculate** – Body: `{ "limit": 5 }` (optional; default 5, max 20). Returns `{ success, signalsUpdated, uploadsProcessed, errors? }`. Uses session auth.

### Discovery API

- **GET /api/upload/discovery?limit=10** – Returns `{ success, uploads: [{ id, uploadName, fileName, totalRows, columnNames, uploadMetadata, uploadedAt }, ...] }`. Use for mining columns and driving a recalc UI.

## Notes

- Staging write is **non-fatal**: if the tables don’t exist or the write fails, the generate flow still completes and signals are still created.
- **Replace (1):** One active upload per (org, source_key). Same file+tab (e.g. zoho_crm_leads) re-uploaded **replaces** the previous staging data; run `scripts/017_raw_data_source_key.sql` to add `source_key`.
- One **raw_data_uploads** row per **(org, source_key)** (multi-tab file = one row per tab).
- Row inserts are batched in chunks of 100 for performance.
