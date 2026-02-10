-- MSS Week 1: Add unique constraints for signal upserts

-- Drop old index if exists from failed attempt
DROP INDEX IF EXISTS signals_name_org_unique;

-- Two partial indexes: one for non-null org_id, one for null
CREATE UNIQUE INDEX IF NOT EXISTS signals_name_org_unique 
ON signals (name, organization_id) WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS signals_name_null_org_unique 
ON signals (name) WHERE organization_id IS NULL;

-- Unique constraint on signal_data_points(signal_id, date) for upserts
DROP INDEX IF EXISTS signal_data_points_signal_date_unique;
CREATE UNIQUE INDEX IF NOT EXISTS signal_data_points_signal_date_unique 
ON signal_data_points (signal_id, date);
