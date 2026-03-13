-- Add demo mode fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS demo_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS demo_integrations text[];

-- Add is_demo flag to signals table
ALTER TABLE signals
ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- Create index for demo signals
CREATE INDEX IF NOT EXISTS idx_signals_is_demo ON signals(is_demo);

COMMENT ON COLUMN profiles.demo_mode IS 'Whether user has demo mode enabled';
COMMENT ON COLUMN profiles.demo_integrations IS 'Array of demo integration IDs user selected';
COMMENT ON COLUMN signals.is_demo IS 'Whether this signal is demo/mock data';
