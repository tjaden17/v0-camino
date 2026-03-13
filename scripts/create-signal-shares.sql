-- Create signal_shares table for tracking shares
-- Per product spec: tracks copy, slack, and email shares

CREATE TABLE IF NOT EXISTS signal_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('copy', 'slack', 'email')),
  destination TEXT,
  summary_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_signal_shares_signal_id ON signal_shares(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_shares_shared_by ON signal_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_signal_shares_created_at ON signal_shares(created_at);
