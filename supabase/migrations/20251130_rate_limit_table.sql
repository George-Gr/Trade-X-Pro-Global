-- Rate Limiting Infrastructure
-- Date: 2025-11-30
-- Purpose: Ensure check_rate_limit() has backing table/indexes for perf
-- Existing fn assumed; add table if missing + indexes

-- Rate limits table (sliding window)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (service_role only writes)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role rate limits" ON public.rate_limits FOR ALL USING (auth.role() = 'service_role');

-- Indexes for fast lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_user_endpoint_window 
ON rate_limits (user_id, endpoint, window_start DESC);

-- Cleanup old windows (cron via pg_cron or edge fn)
-- DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours';

-- Verify fn exists (manual)
-- SELECT * FROM pg_proc WHERE proname = 'check_rate_limit';