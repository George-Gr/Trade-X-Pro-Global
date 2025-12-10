-- Fix critical security vulnerability: Remove overly permissive RLS policy
-- The "Edge functions can update profile financial data" policy uses USING(true) WITH CHECK(true)
-- which allows ANY authenticated user to modify ANY profile's financial data.
-- Service role already bypasses RLS, so this policy is unnecessary and dangerous.

DROP POLICY IF EXISTS "Edge functions can update profile financial data" ON public.profiles;