-- Create saved_signals table for users to save/bookmark signals
-- This enables the "My Signals" feature for executives
-- Note: Uses profiles(id) instead of auth.users for Neon compatibility

CREATE TABLE IF NOT EXISTS saved_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  -- Prevent duplicate saves
  UNIQUE(user_id, signal_id)
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_saved_signals_user_id ON saved_signals(user_id);

-- Create index for checking if a signal is saved
CREATE INDEX IF NOT EXISTS idx_saved_signals_signal_id ON saved_signals(signal_id);

-- Create signal_interpretations table if not exists
CREATE TABLE IF NOT EXISTS signal_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL,
  period TEXT NOT NULL,
  what_we_found JSONB NOT NULL DEFAULT '{}',
  what_it_means JSONB NOT NULL DEFAULT '{}',
  so_what JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stale BOOLEAN DEFAULT FALSE,
  
  -- One interpretation per signal per period
  UNIQUE(signal_id, period)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_signal_interpretations_signal_id ON signal_interpretations(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_interpretations_stale ON signal_interpretations(stale) WHERE stale = true;
