-- Database schema for saving mapping templates

-- Create mapping templates table for reusable column mappings
CREATE TABLE IF NOT EXISTS mapping_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL, -- e.g., 'zoho_desk', 'hubspot_crm', 'general'
  mappings JSONB NOT NULL, -- { "Ticket ID": "unique_id", "Status": "status" }
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_mapping_templates_org ON mapping_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_mapping_templates_source ON mapping_templates(source_type);

-- RLS policies
ALTER TABLE mapping_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's templates"
  ON mapping_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their organization"
  ON mapping_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's templates"
  ON mapping_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's templates"
  ON mapping_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
