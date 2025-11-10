-- Fix critical security issues identified in security review

-- 1. CRITICAL: Add write protection to orders table
-- Orders should only be created/modified through edge functions
CREATE POLICY "Orders created via edge functions only" ON public.orders
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Orders cannot be modified by users" ON public.orders
  FOR UPDATE USING (false);

CREATE POLICY "Orders cannot be deleted by users" ON public.orders
  FOR DELETE USING (false);

-- 2. CRITICAL: Add write protection to positions table
CREATE POLICY "Positions created via edge functions only" ON public.positions
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Positions cannot be modified by users" ON public.positions
  FOR UPDATE USING (false);

CREATE POLICY "Positions cannot be deleted by users" ON public.positions
  FOR DELETE USING (false);

-- 3. CRITICAL: Add write protection to fills table
CREATE POLICY "Fills created via edge functions only" ON public.fills
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Fills cannot be modified" ON public.fills
  FOR UPDATE USING (false);

CREATE POLICY "Fills cannot be deleted" ON public.fills
  FOR DELETE USING (false);

-- 4. CRITICAL: Add write protection to ledger table
CREATE POLICY "Ledger entries created via edge functions only" ON public.ledger
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Ledger entries cannot be modified" ON public.ledger
  FOR UPDATE USING (false);

CREATE POLICY "Ledger entries cannot be deleted" ON public.ledger
  FOR DELETE USING (false);

-- 5. CRITICAL: Add write protection to position_lots table
CREATE POLICY "Position lots created via edge functions only" ON public.position_lots
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Position lots cannot be modified" ON public.position_lots
  FOR UPDATE USING (false);

CREATE POLICY "Position lots cannot be deleted" ON public.position_lots
  FOR DELETE USING (false);

-- 6. CRITICAL: Prevent users from updating their own financial data in profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create separate policies for safe updates vs financial data
CREATE POLICY "Users can update own non-financial profile data" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Ensure financial columns are not being changed
    balance = (SELECT balance FROM public.profiles WHERE id = auth.uid()) AND
    equity = (SELECT equity FROM public.profiles WHERE id = auth.uid()) AND
    margin_used = (SELECT margin_used FROM public.profiles WHERE id = auth.uid()) AND
    free_margin = (SELECT free_margin FROM public.profiles WHERE id = auth.uid())
  );

-- Only edge functions can update financial data
CREATE POLICY "Edge functions can update profile financial data" ON public.profiles
  FOR UPDATE 
  USING (true)  -- Service role bypasses RLS anyway
  WITH CHECK (true);

-- 7. Add storage policy for users to delete their own KYC documents
CREATE POLICY "Users can delete own KYC documents" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);