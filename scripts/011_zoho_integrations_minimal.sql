-- Zoho Integrations - Minimal Schema (No external dependencies)
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS integration_sync_jobs CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;

-- Create integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('zoho_desk', 'zoho_crm', 'hubspot', 'salesforce')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'error', 'disconnected')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  api_domain TEXT,
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, provider)
);

-- Create sync jobs table
CREATE TABLE integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('analytics', 'bulk_export', 'incremental', 'full_refresh')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  records_synced INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_sync_jobs_integration ON integration_sync_jobs(integration_id);
CREATE INDEX idx_sync_jobs_status ON integration_sync_jobs(status);

-- Disable RLS for now (we'll handle auth in the API layer)
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON integrations TO authenticated;
GRANT ALL ON integrations TO service_role;
GRANT ALL ON integration_sync_jobs TO authenticated;
GRANT ALL ON integration_sync_jobs TO service_role;

-- Success message
SELECT 'Integrations tables created successfully!' as result;
