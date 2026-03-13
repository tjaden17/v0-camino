-- MSS Week 1: Deduplicate signals then add unique indexes

-- Step 1: Remove duplicate signals (keep the most recently updated one per name+org)
DELETE FROM signals s1
USING signals s2
WHERE s1.name = s2.name
  AND s1.organization_id IS NOT DISTINCT FROM s2.organization_id
  AND s1.updated_at < s2.updated_at;

-- Step 2: Remove duplicate data points (keep most recent per signal_id+date)  
DELETE FROM signal_data_points dp1
USING signal_data_points dp2
WHERE dp1.signal_id = dp2.signal_id
  AND dp1.date = dp2.date
  AND dp1.created_at < dp2.created_at;

-- Step 3: Drop any existing partial indexes
DROP INDEX IF EXISTS signals_name_org_unique;
DROP INDEX IF EXISTS signals_name_null_org_unique;
DROP INDEX IF EXISTS signal_data_points_signal_date_unique;

-- Step 4: Create unique indexes
CREATE UNIQUE INDEX signals_name_org_unique 
ON signals (name, organization_id) WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX signals_name_null_org_unique 
ON signals (name) WHERE organization_id IS NULL;

CREATE UNIQUE INDEX signal_data_points_signal_date_unique 
ON signal_data_points (signal_id, date);
