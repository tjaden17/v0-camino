-- Option B: Staging layer for generate flow (Neon)
-- Enables querying and mining across uploads over time; recalc can read from here.
-- Run in Neon SQL Editor. Tables match 009 shape; no RLS (auth at app layer).

-- 1. Raw upload metadata (one per tab from generate flow)
CREATE TABLE IF NOT EXISTS raw_data_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  upload_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual_upload',
  file_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  total_rows INTEGER NOT NULL DEFAULT 0,
  column_names JSONB NOT NULL,
  column_mappings JSONB,
  upload_metadata JSONB,
  signals_created INTEGER DEFAULT 0,
  signals_updated INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row-level data for replay and mining
CREATE TABLE IF NOT EXISTS raw_data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES raw_data_uploads(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  row_index INTEGER NOT NULL,
  original_data JSONB NOT NULL,
  normalized_data JSONB,
  generated_signal_ids UUID[],
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_upload_row UNIQUE (upload_id, row_index)
);

-- Add upload_metadata if table existed from 009 (no IF NOT EXISTS for column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raw_data_uploads' AND column_name = 'upload_metadata'
  ) THEN
    ALTER TABLE raw_data_uploads ADD COLUMN upload_metadata JSONB;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_org ON raw_data_uploads(organization_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_source ON raw_data_uploads(source_type);
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_date ON raw_data_uploads(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_data_rows_upload ON raw_data_rows(upload_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_rows_org ON raw_data_rows(organization_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_rows_original_data ON raw_data_rows USING GIN (original_data);

-- Link signals to source upload for traceability
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_upload_id UUID REFERENCES raw_data_uploads(id) ON DELETE SET NULL;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_row_ids UUID[];

CREATE INDEX IF NOT EXISTS idx_signals_source_upload ON signals(source_upload_id);

COMMENT ON COLUMN raw_data_uploads.upload_metadata IS 'From generate flow: { answers, tabKey, signalDefinitions } for replay and mining';
