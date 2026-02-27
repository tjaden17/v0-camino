-- Migration: Consolidate signal_data_points into Supabase
-- Previously this table only existed in Neon. This migration ensures it exists
-- in Supabase as part of the single-database consolidation.

-- 1. Create signal_data_points table
CREATE TABLE IF NOT EXISTS signal_data_points (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id uuid REFERENCES signals(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  value numeric NOT NULL,
  metadata jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(signal_id, date)
);

-- 2. Index for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_sdp_signal_date ON signal_data_points(signal_id, date DESC);

-- 3. RLS policies
ALTER TABLE signal_data_points ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_data_points' AND policyname = 'Authenticated users can view data points'
  ) THEN
    CREATE POLICY "Authenticated users can view data points"
      ON signal_data_points FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_data_points' AND policyname = 'Authenticated users can insert data points'
  ) THEN
    CREATE POLICY "Authenticated users can insert data points"
      ON signal_data_points FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_data_points' AND policyname = 'Authenticated users can update data points'
  ) THEN
    CREATE POLICY "Authenticated users can update data points"
      ON signal_data_points FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Add KPI columns to profiles (previously only in Neon)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kpi_1 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kpi_2 text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kpi_3 text;
