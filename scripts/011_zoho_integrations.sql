-- Zoho Integration Schema
-- Phase 1: Authentication & Authorization Setup

-- Ensure organizations table exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure organization_id column exists in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Ensure organization_members table exists
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'read-only')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(organization_id, user_id)
);

-- Table: integrations
-- Stores OAuth credentials and configuration for Zoho integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('zoho_desk', 'zoho_crm')),
  
  -- OAuth tokens (should be encrypted at application level)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- API configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example config: { "api_domain": "https://desk.zoho.com", "org_id": "123456", "data_center": "US" }
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error', 'disconnected')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one integration per provider per organization
  UNIQUE(organization_id, provider)
);

-- Table: integration_sync_jobs
-- Tracks sync operations for monitoring and debugging
CREATE TABLE IF NOT EXISTS integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('analytics', 'bulk_export', 'incremental', 'webhook')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  
  -- Progress tracking
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example: { "signal_count": 5, "data_points_created": 120, "api_calls_used": 15 }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_integration_id ON integration_sync_jobs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON integration_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_created_at ON integration_sync_jobs(created_at DESC);

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view integrations for their organization
CREATE POLICY "Users can view their organization's integrations"
  ON integrations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Organization admins can manage integrations
CREATE POLICY "Organization admins can manage integrations"
  ON integrations
  FOR ALL
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

-- Policy: Master admin can manage all integrations
CREATE POLICY "Master admin can manage all integrations"
  ON integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- Policy: Users can view sync jobs for their organization's integrations
CREATE POLICY "Users can view their organization's sync jobs"
  ON integration_sync_jobs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT i.id
      FROM integrations i
      WHERE i.organization_id IN (
        SELECT organization_id 
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: System can create/update sync jobs
CREATE POLICY "System can manage sync jobs"
  ON integration_sync_jobs
  FOR ALL
  USING (true);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_integrations_timestamp
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- Comments
COMMENT ON TABLE integrations IS 'Stores OAuth credentials and configuration for third-party integrations (Zoho Desk, Zoho CRM)';
COMMENT ON TABLE integration_sync_jobs IS 'Tracks sync operations for monitoring, debugging, and audit purposes';
COMMENT ON COLUMN integrations.access_token IS 'OAuth access token - should be encrypted at application level before storage';
COMMENT ON COLUMN integrations.refresh_token IS 'OAuth refresh token - should be encrypted at application level before storage';
COMMENT ON COLUMN integrations.config IS 'Provider-specific configuration (API domain, org ID, data center, etc.)';
