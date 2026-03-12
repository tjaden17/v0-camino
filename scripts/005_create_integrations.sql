-- Create integrations table to store OAuth connections
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'zoho_crm', 'zoho_desk', 'hubspot'
  provider_account_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  status text DEFAULT 'active', -- 'active', 'expired', 'disconnected'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create sync_history table to track data syncs
CREATE TABLE IF NOT EXISTS sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL, -- 'success', 'failed', 'in_progress'
  records_synced integer DEFAULT 0,
  signals_created integer DEFAULT 0,
  signals_updated integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_sync_history_integration_id ON sync_history(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view their own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sync_history
CREATE POLICY "Users can view their own sync history" ON sync_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync history" ON sync_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
