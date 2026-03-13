-- Staging layer tables for cross-source signal discovery
-- Run this in Neon SQL Editor: https://console.neon.tech

-- 1. Staged uploads - tracks each file upload before processing
CREATE TABLE IF NOT EXISTS staged_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  source_type TEXT,
  row_count INTEGER DEFAULT 0,
  column_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'staged',
  metadata JSONB DEFAULT '{}'
);

-- 2. Staged fields - normalized fields from uploads
CREATE TABLE IF NOT EXISTS staged_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL,
  original_column_name TEXT NOT NULL,
  normalized_field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  sample_values JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Staged data points - the actual data values
CREATE TABLE IF NOT EXISTS staged_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL,
  field_id UUID NOT NULL,
  row_index INTEGER NOT NULL,
  value TEXT,
  numeric_value NUMERIC,
  date_value TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Discovered signal opportunities - signals that can be calculated
CREATE TABLE IF NOT EXISTS signal_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  signal_name TEXT NOT NULL,
  signal_category TEXT NOT NULL,
  discovery_type TEXT NOT NULL,
  required_fields JSONB NOT NULL,
  available_fields JSONB NOT NULL,
  missing_fields JSONB DEFAULT '[]',
  source_uploads JSONB NOT NULL,
  is_calculable BOOLEAN DEFAULT FALSE,
  confidence_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'discovered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Field availability index - quick lookup of what fields exist
CREATE TABLE IF NOT EXISTS field_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  normalized_field_name TEXT NOT NULL,
  upload_ids JSONB DEFAULT '[]',
  total_data_points INTEGER DEFAULT 0,
  latest_upload_at TIMESTAMP WITH TIME ZONE,
  field_type TEXT,
  UNIQUE(user_id, normalized_field_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staged_uploads_user ON staged_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_staged_uploads_status ON staged_uploads(status);
CREATE INDEX IF NOT EXISTS idx_staged_fields_upload ON staged_fields(upload_id);
CREATE INDEX IF NOT EXISTS idx_staged_fields_normalized ON staged_fields(normalized_field_name);
CREATE INDEX IF NOT EXISTS idx_staged_data_points_upload ON staged_data_points(upload_id);
CREATE INDEX IF NOT EXISTS idx_staged_data_points_field ON staged_data_points(field_id);
CREATE INDEX IF NOT EXISTS idx_signal_opportunities_user ON signal_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_opportunities_calculable ON signal_opportunities(is_calculable);
CREATE INDEX IF NOT EXISTS idx_field_availability_user ON field_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_field_availability_field ON field_availability(normalized_field_name);
