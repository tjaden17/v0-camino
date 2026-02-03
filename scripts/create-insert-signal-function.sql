-- Create an RPC function to insert signals (bypasses PostgREST schema cache issues)
CREATE OR REPLACE FUNCTION insert_signal(
  p_name TEXT,
  p_category TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_absolute_value TEXT DEFAULT NULL,
  p_trend TEXT DEFAULT NULL,
  p_trend_value TEXT DEFAULT NULL,
  p_source_type TEXT DEFAULT 'upload',
  p_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_signal_id UUID;
BEGIN
  INSERT INTO signals (
    id,
    name,
    category,
    organization_id,
    absolute_value,
    trend,
    trend_value,
    source_type,
    summary,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_name,
    p_category,
    p_organization_id,
    p_absolute_value,
    p_trend,
    p_trend_value,
    p_source_type,
    p_summary,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_signal_id;
  
  RETURN v_signal_id;
END;
$$;

-- Also create a function to get signal by id (for returning the full signal after insert)
CREATE OR REPLACE FUNCTION get_signal_by_id(p_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'id', s.id,
    'name', s.name,
    'category', s.category,
    'organization_id', s.organization_id,
    'absolute_value', s.absolute_value,
    'trend', s.trend,
    'trend_value', s.trend_value,
    'source_type', s.source_type,
    'summary', s.summary,
    'created_at', s.created_at,
    'updated_at', s.updated_at
  ) INTO v_result
  FROM signals s
  WHERE s.id = p_id;
  
  RETURN v_result;
END;
$$;
