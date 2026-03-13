-- Add unique constraint on signal_data_points for upsert support
-- This ensures we don't duplicate data points for the same signal+date
CREATE UNIQUE INDEX IF NOT EXISTS idx_signal_data_points_signal_date 
ON signal_data_points (signal_id, date);
