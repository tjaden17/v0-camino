-- MSS Week 1: Add unique constraints for signal upserts

-- Unique constraint on signals(name, organization_id) for upserts
-- Handle NULLs in organization_id with COALESCE
CREATE UNIQUE INDEX IF NOT EXISTS signals_name_org_unique 
ON signals (name, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'));

-- Unique constraint on signal_data_points(signal_id, date) for upserts
CREATE UNIQUE INDEX IF NOT EXISTS signal_data_points_signal_date_unique 
ON signal_data_points (signal_id, date);
