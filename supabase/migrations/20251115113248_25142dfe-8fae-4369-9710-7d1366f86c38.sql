-- 1. Add Missing Column to asset_specs
ALTER TABLE public.asset_specs 
ADD COLUMN IF NOT EXISTS asset_class TEXT NOT NULL DEFAULT 'forex';

-- Update existing rows with intelligent asset class detection
UPDATE public.asset_specs 
SET asset_class = CASE
  WHEN symbol LIKE '%/%' THEN 'forex'
  WHEN symbol LIKE 'BTC%' OR symbol LIKE 'ETH%' THEN 'crypto'
  WHEN symbol LIKE 'US %' OR symbol LIKE 'UK %' THEN 'index'
  ELSE 'stock'
END;

-- 2. Add Performance Indexes
CREATE INDEX IF NOT EXISTS idx_positions_user_status ON public.positions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_fills_order_id ON public.fills(order_id);
CREATE INDEX IF NOT EXISTS idx_position_lots_position_id ON public.position_lots(position_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_ledger_user_created ON public.ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol_triggered ON public.price_alerts(symbol, triggered);

-- 3. Add Data Integrity Constraints (using DO blocks to check existence)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_quantity' AND conrelid = 'public.positions'::regclass
  ) THEN
    ALTER TABLE public.positions ADD CONSTRAINT check_positive_quantity CHECK (quantity > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_order_quantity' AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT check_positive_order_quantity CHECK (quantity > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_balance_consistency' AND conrelid = 'public.ledger'::regclass
  ) THEN
    ALTER TABLE public.ledger ADD CONSTRAINT check_balance_consistency CHECK (balance_after = balance_before + amount);
  END IF;
END $$;