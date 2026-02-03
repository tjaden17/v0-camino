-- Dual Path Storage for Signal Service v2
-- Stores raw uploaded data with all original columns preserved for future AI analysis
-- while generating immediate signals from mapped columns

-- Raw data storage table
CREATE TABLE IF NOT EXISTS raw_data_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Upload metadata
  upload_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'csv', 'zoho_desk', 'zoho_crm', 'hubspot', etc.
  file_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Row count for stats
  total_rows INTEGER NOT NULL DEFAULT 0,
  
  -- Original column names preserved
  column_names JSONB NOT NULL, -- Array of original column names
  
  -- Column mapping used for signal generation
  column_mappings JSONB, -- { "Ticket Number": "unique_id", "Status": "status", ... }
  
  -- Stats about signals generated
  signals_created INTEGER DEFAULT 0,
  signals_updated INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual raw data rows with all original columns preserved
CREATE TABLE IF NOT EXISTS raw_data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES raw_data_uploads(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Row index in the upload
  row_index INTEGER NOT NULL,
  
  -- ALL original data preserved as JSONB
  original_data JSONB NOT NULL, -- Complete row with all columns
  
  -- Normalized/mapped data for quick signal generation
  normalized_data JSONB, -- Only the columns mapped to universal schema
  
  -- Link to generated signals (for traceability)
  generated_signal_ids UUID[], -- Array of signal IDs created from this row
  
  -- Metadata for AI context
  metadata JSONB, -- { source, quality_score, processing_notes, etc. }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for fast queries
  CONSTRAINT unique_upload_row UNIQUE (upload_id, row_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_org ON raw_data_uploads(organization_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_source ON raw_data_uploads(source_type);
CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_date ON raw_data_uploads(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_data_rows_upload ON raw_data_rows(upload_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_rows_org ON raw_data_rows(organization_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_rows_original_data ON raw_data_rows USING GIN (original_data);
CREATE INDEX IF NOT EXISTS idx_raw_data_rows_normalized_data ON raw_data_rows USING GIN (normalized_data);

-- RLS Policies
ALTER TABLE raw_data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data_rows ENABLE ROW LEVEL SECURITY;

-- Organization members can view their own raw data
CREATE POLICY "Users can view their organization's raw uploads"
  ON raw_data_uploads FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's raw data rows"
  ON raw_data_rows FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admin users can insert raw data
CREATE POLICY "Admins can insert raw uploads"
  ON raw_data_uploads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND email = 'admin@admin.com'
    )
  );

CREATE POLICY "Admins can insert raw data rows"
  ON raw_data_rows FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND email = 'admin@admin.com'
    )
  );

-- Link signals to their source raw data
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_upload_id UUID REFERENCES raw_data_uploads(id) ON DELETE SET NULL;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_row_ids UUID[]; -- Links back to raw_data_rows

-- Add index for traceability
CREATE INDEX IF NOT EXISTS idx_signals_source_upload ON signals(source_upload_id);

COMMENT ON TABLE raw_data_uploads IS 'Stores metadata about data uploads with all original columns preserved';
COMMENT ON TABLE raw_data_rows IS 'Stores individual rows of uploaded data with complete original data in JSONB for future AI analysis';
COMMENT ON COLUMN raw_data_rows.original_data IS 'Complete original row data with ALL columns preserved';
COMMENT ON COLUMN raw_data_rows.normalized_data IS 'Only mapped columns in universal schema format for quick signal generation';
COMMENT ON COLUMN signals.source_upload_id IS 'Links signal back to the upload that created it for traceability';
