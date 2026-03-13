-- MSS Week 1: Deduplicate then index

-- Step 1: Dedup signals - delete all but the newest per (name, organization_id)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY name, COALESCE(organization_id::text, '__null__')
    ORDER BY updated_at DESC NULLS LAST
  ) AS rn
  FROM signals
)
DELETE FROM signals WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: Dedup signal_data_points
WITH ranked_dp AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY signal_id, date
    ORDER BY created_at DESC NULLS LAST
  ) AS rn
  FROM signal_data_points
)
DELETE FROM signal_data_points WHERE id IN (SELECT id FROM ranked_dp WHERE rn > 1);

-- Step 3: Drop existing indexes
DROP INDEX IF EXISTS signals_name_org_unique;
DROP INDEX IF EXISTS signals_name_null_org_unique;
DROP INDEX IF EXISTS signal_data_points_signal_date_unique;

-- Step 4: Create indexes
CREATE UNIQUE INDEX signals_name_org_unique 
ON signals (name, organization_id) WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX signals_name_null_org_unique 
ON signals (name) WHERE organization_id IS NULL;

CREATE UNIQUE INDEX signal_data_points_signal_date_unique 
ON signal_data_points (signal_id, date);
