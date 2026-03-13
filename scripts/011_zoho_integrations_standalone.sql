-- Zoho Integration Schema - Standalone Version
-- This script can run independently of other migrations

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS integration_sync_jobs CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;

-- Create integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('zoho_desk', 'zoho_crm')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error', 'disconnected')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(organization_id, provider)
);

-- Create integration sync jobs table
CREATE TABLE integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('analytics', 'bulk_export', 'incremental', 'manual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_integrations_organization ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_sync_jobs_integration ON integration_sync_jobs(integration_id);
CREATE INDEX idx_sync_jobs_status ON integration_sync_jobs(status);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations table

-- Allow users to view integrations for their organization
CREATE POLICY "Users can view their organization's integrations"
  ON integrations
  FOR SELECT
  USING (
    organization_id::text IN (
      SELECT organization_id::text
      FROM profiles 
      WHERE user_id = auth.uid()
    )
    OR
    -- Master admin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- Allow admins to insert integrations for their organization
CREATE POLICY "Admins can create integrations for their organization"
  ON integrations
  FOR INSERT
  WITH CHECK (
    organization_id::text IN (
      SELECT om.organization_id::text
      FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
    )
    OR
    -- Master admin can create for any organization
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- Allow admins to update integrations for their organization
CREATE POLICY "Admins can update their organization's integrations"
  ON integrations
  FOR UPDATE
  USING (
    organization_id::text IN (
      SELECT om.organization_id::text
      FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
    )
    OR
    -- Master admin can update all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- Allow admins to delete integrations for their organization
CREATE POLICY "Admins can delete their organization's integrations"
  ON integrations
  FOR DELETE
  USING (
    organization_id::text IN (
      SELECT om.organization_id::text
      FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
    )
    OR
    -- Master admin can delete all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- RLS Policies for integration_sync_jobs table

-- Allow users to view sync jobs for their organization's integrations
CREATE POLICY "Users can view their organization's sync jobs"
  ON integration_sync_jobs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT i.id
      FROM integrations i
      WHERE i.organization_id::text IN (
        SELECT organization_id::text
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    )
    OR
    -- Master admin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'admin@admin.com'
    )
  );

-- Allow system to insert sync jobs
CREATE POLICY "System can create sync jobs"
  ON integration_sync_jobs
  FOR INSERT
  WITH CHECK (true);

-- Allow system to update sync jobs
CREATE POLICY "System can update sync jobs"
  ON integration_sync_jobs
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_integrations_timestamp
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- Grant necessary permissions
GRANT ALL ON integrations TO authenticated;
GRANT ALL ON integration_sync_jobs TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Zoho integrations tables created successfully!';
END $$;
