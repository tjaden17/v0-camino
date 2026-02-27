-- Replace (1): One active upload per (org, source_key).
-- Same file/source (e.g. zoho-crm-leads) re-uploaded replaces the previous staging data.

-- Add source_key: stable identifier from file name + tab/sheet name (e.g. zoho_crm_leads_leads)
ALTER TABLE raw_data_uploads ADD COLUMN IF NOT EXISTS source_key TEXT;

-- One active upload per (organization_id, source_key). Allow NULL source_key for legacy rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_data_uploads_org_source_key
  ON raw_data_uploads (organization_id, source_key)
  WHERE source_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_raw_data_uploads_source_key ON raw_data_uploads(source_key);

COMMENT ON COLUMN raw_data_uploads.source_key IS 'Stable key from file+tab name; same key = replace previous upload for this org';
