-- Create signals table for storing uploaded data
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary TEXT,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  trend_value TEXT,
  absolute_value TEXT,
  benchmark_value TEXT,
  highlighted BOOLEAN DEFAULT false,
  investigating BOOLEAN DEFAULT false,
  timeframe TEXT,
  owner TEXT,
  category TEXT,
  parent_id TEXT,
  data_source TEXT[],
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create signal data points table for time series data
CREATE TABLE IF NOT EXISTS signal_data_points (
  id SERIAL PRIMARY KEY,
  signal_id TEXT NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create upload history table
CREATE TABLE IF NOT EXISTS upload_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  signals_created INTEGER NOT NULL,
  signals_updated INTEGER NOT NULL,
  status TEXT CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signals_category ON signals(category);
CREATE INDEX IF NOT EXISTS idx_signals_owner ON signals(owner);
CREATE INDEX IF NOT EXISTS idx_signal_data_points_signal_id ON signal_data_points(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_data_points_date ON signal_data_points(date);
CREATE INDEX IF NOT EXISTS idx_upload_history_user_id ON upload_history(user_id);
