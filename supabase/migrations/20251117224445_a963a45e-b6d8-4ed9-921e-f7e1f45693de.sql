-- Update RLS policy on positions table to block direct updates
-- This forces all position modifications to go through the modify-position edge function

-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update own positions" ON public.positions;
DROP POLICY IF EXISTS "Positions cannot be modified by users" ON public.positions;

-- Create strict policy that blocks all direct user updates
CREATE POLICY "Positions updated via edge functions only"
ON public.positions
FOR UPDATE
USING (false);

-- Keep the existing policies for other operations intact
-- SELECT: Users can view own positions (existing policy)
-- INSERT: Positions created via edge functions only (existing policy)
-- DELETE: Positions cannot be deleted by users (existing policy)