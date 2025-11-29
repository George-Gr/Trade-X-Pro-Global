-- Fix rate_limits table RLS policy to prevent bypass
-- Drop the overly permissive policy that allowed all roles to access
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create restrictive policy: only service role can manage rate limits
CREATE POLICY "Rate limits managed by service role only"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Optional: Allow users to view their own rate limits (read-only)
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);