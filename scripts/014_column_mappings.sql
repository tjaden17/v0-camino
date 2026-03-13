-- Column mapping templates per tool (DATA IN - Pre-built templates)
-- Roadmap Task 1.3: column_mappings table + Locumate as first entry
-- Schema per ADMIN_UPLOAD_FLOW_ACCEPTANCE_CRITERIA.md

CREATE TABLE IF NOT EXISTS column_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source_tool TEXT NOT NULL,
  row_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  field_mappings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_column_mappings_org ON column_mappings(organization_id);
CREATE INDEX IF NOT EXISTS idx_column_mappings_source ON column_mappings(source_tool);

COMMENT ON TABLE column_mappings IS 'Pre-built and org-saved column mappings: normalized field -> CSV column name';
COMMENT ON COLUMN column_mappings.field_mappings IS 'JSON: normalized field name -> CSV column name, e.g. {"deal_value": "Amount", "stage": "Stage"}';
