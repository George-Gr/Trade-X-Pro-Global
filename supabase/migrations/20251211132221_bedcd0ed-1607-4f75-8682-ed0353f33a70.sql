-- TASK-039: Large JSON Field Optimization
-- Add indexes on frequently queried JSON fields

-- Create index on liquidation_events closed_positions JSONB field
CREATE INDEX IF NOT EXISTS idx_liquidation_events_closed_positions 
ON public.liquidation_events USING GIN (closed_positions);

-- Create index on margin_call_events details JSONB field
CREATE INDEX IF NOT EXISTS idx_margin_call_events_details 
ON public.margin_call_events USING GIN (details);

-- Create index on risk_events details JSONB field
CREATE INDEX IF NOT EXISTS idx_risk_events_details 
ON public.risk_events USING GIN (details);

-- Create index on notifications data JSONB field
CREATE INDEX IF NOT EXISTS idx_notifications_data 
ON public.notifications USING GIN (data);

-- Create index on crypto_transactions metadata JSONB field
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_metadata 
ON public.crypto_transactions USING GIN (metadata);

-- Create composite index on orders for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON public.orders (user_id, status, created_at DESC);

-- Create composite index on positions for performance
CREATE INDEX IF NOT EXISTS idx_positions_user_status 
ON public.positions (user_id, status);

-- Create index on fills for fast lookups
CREATE INDEX IF NOT EXISTS idx_fills_user_executed 
ON public.fills (user_id, executed_at DESC);

-- Create index on ledger for transaction history
CREATE INDEX IF NOT EXISTS idx_ledger_user_created 
ON public.ledger (user_id, created_at DESC);

-- TASK-040: Archive Old Data Strategy
-- Create archive tables for old data

-- Create archive table for orders older than 1 year
CREATE TABLE IF NOT EXISTS public.orders_archive (
  LIKE public.orders INCLUDING ALL
);

-- Create archive table for fills older than 1 year
CREATE TABLE IF NOT EXISTS public.fills_archive (
  LIKE public.fills INCLUDING ALL
);

-- Create archive table for ledger entries older than 1 year
CREATE TABLE IF NOT EXISTS public.ledger_archive (
  LIKE public.ledger INCLUDING ALL
);

-- Create archive table for closed positions older than 1 year
CREATE TABLE IF NOT EXISTS public.positions_archive (
  LIKE public.positions INCLUDING ALL
);

-- Enable RLS on archive tables (read-only for users)
ALTER TABLE public.orders_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fills_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions_archive ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only view their own archived data
CREATE POLICY "Users can view own archived orders"
ON public.orders_archive FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own archived fills"
ON public.fills_archive FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own archived ledger"
ON public.ledger_archive FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own archived positions"
ON public.positions_archive FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all archived data
CREATE POLICY "Admins can view all archived orders"
ON public.orders_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all archived fills"
ON public.fills_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all archived ledger"
ON public.ledger_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all archived positions"
ON public.positions_archive FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to archive old data (to be called by cron)
CREATE OR REPLACE FUNCTION public.archive_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archive_date TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '1 year';
  orders_archived INTEGER := 0;
  fills_archived INTEGER := 0;
  ledger_archived INTEGER := 0;
  positions_archived INTEGER := 0;
BEGIN
  -- Archive old filled/cancelled orders
  WITH moved_orders AS (
    DELETE FROM public.orders
    WHERE created_at < archive_date
      AND status IN ('filled', 'cancelled', 'rejected')
    RETURNING *
  )
  INSERT INTO public.orders_archive
  SELECT * FROM moved_orders;
  
  GET DIAGNOSTICS orders_archived = ROW_COUNT;

  -- Archive old fills
  WITH moved_fills AS (
    DELETE FROM public.fills
    WHERE executed_at < archive_date
    RETURNING *
  )
  INSERT INTO public.fills_archive
  SELECT * FROM moved_fills;
  
  GET DIAGNOSTICS fills_archived = ROW_COUNT;

  -- Archive old ledger entries
  WITH moved_ledger AS (
    DELETE FROM public.ledger
    WHERE created_at < archive_date
    RETURNING *
  )
  INSERT INTO public.ledger_archive
  SELECT * FROM moved_ledger;
  
  GET DIAGNOSTICS ledger_archived = ROW_COUNT;

  -- Archive old closed positions
  WITH moved_positions AS (
    DELETE FROM public.positions
    WHERE closed_at < archive_date
      AND status = 'closed'
    RETURNING *
  )
  INSERT INTO public.positions_archive
  SELECT * FROM moved_positions;
  
  GET DIAGNOSTICS positions_archived = ROW_COUNT;

  -- Log the archival operation
  RAISE NOTICE 'Archived data: orders=%, fills=%, ledger=%, positions=%',
    orders_archived, fills_archived, ledger_archived, positions_archived;
END;
$$;

-- Add comment to document the archive function
COMMENT ON FUNCTION public.archive_old_data IS 'Archives data older than 1 year to archive tables. Call monthly via cron job.';