-- Add unique constraint on signal_opportunities for upsert support
-- This allows ON CONFLICT (signal_name, organization_id) in the calculate route

CREATE UNIQUE INDEX IF NOT EXISTS idx_signal_opportunities_name_org 
  ON signal_opportunities(signal_name, organization_id);
