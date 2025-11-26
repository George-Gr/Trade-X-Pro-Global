-- Migration: Create margin_history table for sparkline data (Task 2.4)
-- Description: Records historical margin levels for visualizing margin trends in the dashboard
-- Created: 2025-11-26

-- Create margin_history table to track margin level changes over time
CREATE TABLE IF NOT EXISTS margin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  margin_level NUMERIC(10, 4) NOT NULL CHECK (margin_level >= 0 AND margin_level <= 100),
  margin_used NUMERIC(15, 2) NOT NULL,
  equity NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't record the same margin level twice within 1 minute
  CONSTRAINT unique_margin_history_per_minute UNIQUE (user_id, date_trunc('minute', created_at), margin_level)
);

-- Indexes for efficient time-series queries
CREATE INDEX idx_margin_history_user_id ON margin_history(user_id);
CREATE INDEX idx_margin_history_user_created_at ON margin_history(user_id, created_at DESC);
CREATE INDEX idx_margin_history_created_at ON margin_history(created_at DESC);

-- Composite index for most common query pattern (user + recent data)
CREATE INDEX idx_margin_history_user_recent 
  ON margin_history(user_id, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '7 days';

-- Partial index for today's data (frequently accessed)
CREATE INDEX idx_margin_history_today 
  ON margin_history(user_id, created_at DESC) 
  WHERE date(created_at AT TIME ZONE 'UTC') = CURRENT_DATE;

-- Enable RLS (Row Level Security)
ALTER TABLE margin_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own margin history
CREATE POLICY margin_history_user_isolation 
  ON margin_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Service role (Edge Functions) can insert/update margin history
CREATE POLICY margin_history_service_role_insert
  ON margin_history 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY margin_history_service_role_select
  ON margin_history 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Function to record margin history when profile margin changes
CREATE OR REPLACE FUNCTION record_margin_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if margin_used or equity has changed significantly
  IF (OLD.margin_used IS DISTINCT FROM NEW.margin_used) 
     OR (OLD.equity IS DISTINCT FROM NEW.equity) THEN
    INSERT INTO margin_history (
      user_id,
      margin_level,
      margin_used,
      equity
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.equity > 0 THEN ROUND(MIN(100, (NEW.margin_used / NEW.equity) * 100)::NUMERIC, 2)
        ELSE 0
      END,
      NEW.margin_used,
      NEW.equity
    ) ON CONFLICT DO NOTHING; -- Ignore duplicate within-minute entries
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-record margin history when profile updates
CREATE TRIGGER profiles_margin_history_trigger
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION record_margin_history();

-- View for last 7 days of margin history (for dashboard sparkline)
CREATE OR REPLACE VIEW v_margin_history_7day AS
SELECT
  user_id,
  ARRAY_AGG(margin_level ORDER BY created_at ASC) as margin_levels,
  ARRAY_AGG(created_at ORDER BY created_at ASC) as timestamps,
  COUNT(*) as data_points,
  MIN(margin_level) as min_margin,
  MAX(margin_level) as max_margin,
  AVG(margin_level)::NUMERIC(10, 2) as avg_margin,
  MAX(created_at) as last_recorded_at
FROM margin_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id;

-- View for hourly margin history (for more granular charts)
CREATE OR REPLACE VIEW v_margin_history_hourly AS
SELECT
  user_id,
  date_trunc('hour', created_at) as hour,
  AVG(margin_level)::NUMERIC(10, 2) as avg_margin_level,
  MIN(margin_level) as min_margin,
  MAX(margin_level) as max_margin,
  COUNT(*) as data_points
FROM margin_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id, date_trunc('hour', created_at)
ORDER BY hour DESC;

-- Cleanup function to remove old margin history (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_margin_history()
RETURNS void AS $$
BEGIN
  DELETE FROM margin_history
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule this function as a cron job via Supabase pg_cron extension
-- SELECT cron.schedule('cleanup-margin-history', '0 2 * * *', 'SELECT cleanup_old_margin_history()');

-- Grant permissions to authenticated users (read-only for their own data)
GRANT SELECT ON margin_history TO authenticated;
GRANT SELECT ON v_margin_history_7day TO authenticated;
GRANT SELECT ON v_margin_history_hourly TO authenticated;

-- Grant permissions to service role (Edge Functions - full access)
GRANT ALL ON margin_history TO service_role;
GRANT SELECT ON v_margin_history_7day TO service_role;
GRANT SELECT ON v_margin_history_hourly TO service_role;

-- Insert comment for documentation
COMMENT ON TABLE margin_history IS 'Tracks historical margin levels for time-series analysis and dashboard visualization. Auto-populated by profile update triggers.';
COMMENT ON VIEW v_margin_history_7day IS 'Last 7 days of margin history aggregated for dashboard sparkline charts.';
COMMENT ON VIEW v_margin_history_hourly IS 'Hourly aggregated margin history for more detailed analysis over 30 days.';
