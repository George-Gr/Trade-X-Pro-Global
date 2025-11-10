-- Create risk_settings table for user-specific risk limits
CREATE TABLE public.risk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Margin management
  margin_call_level NUMERIC NOT NULL DEFAULT 50.00, -- Alert when margin level < 50%
  stop_out_level NUMERIC NOT NULL DEFAULT 20.00,     -- Force close when margin level < 20%
  
  -- Position limits
  max_position_size NUMERIC NOT NULL DEFAULT 10.00,  -- Maximum lots per position
  max_total_exposure NUMERIC NOT NULL DEFAULT 100000.00, -- Maximum total exposure
  max_positions INTEGER NOT NULL DEFAULT 10,          -- Maximum open positions
  
  -- Daily limits
  daily_loss_limit NUMERIC NOT NULL DEFAULT 5000.00, -- Maximum daily loss
  daily_trade_limit INTEGER NOT NULL DEFAULT 50,     -- Maximum trades per day
  
  -- Stop-loss settings
  enforce_stop_loss BOOLEAN NOT NULL DEFAULT true,
  min_stop_loss_distance NUMERIC NOT NULL DEFAULT 10.00, -- Minimum pips from entry
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own risk settings"
ON public.risk_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own risk settings"
ON public.risk_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Risk settings created via trigger only"
ON public.risk_settings FOR INSERT
WITH CHECK (false);

CREATE POLICY "Admins can view all risk settings"
ON public.risk_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all risk settings"
ON public.risk_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create daily_pnl_tracking table
CREATE TABLE public.daily_pnl_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  realized_pnl NUMERIC NOT NULL DEFAULT 0.00,
  trade_count INTEGER NOT NULL DEFAULT 0,
  breached_daily_limit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, trading_date)
);

-- Enable RLS
ALTER TABLE public.daily_pnl_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own daily PnL"
ON public.daily_pnl_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily PnL"
ON public.daily_pnl_tracking FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Daily PnL updated via edge functions only"
ON public.daily_pnl_tracking FOR INSERT
WITH CHECK (false);

CREATE POLICY "Daily PnL cannot be modified"
ON public.daily_pnl_tracking FOR UPDATE
USING (false);

-- Create risk_events table for audit trail
CREATE TABLE public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'margin_call', 'stop_out', 'daily_limit', 'position_limit'
  severity TEXT NOT NULL,   -- 'info', 'warning', 'critical'
  description TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own risk events"
ON public.risk_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all risk events"
ON public.risk_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Risk events created via edge functions only"
ON public.risk_events FOR INSERT
WITH CHECK (false);

CREATE POLICY "Risk events cannot be modified"
ON public.risk_events FOR UPDATE
USING (false);

-- Create indexes
CREATE INDEX idx_risk_settings_user ON public.risk_settings(user_id);
CREATE INDEX idx_daily_pnl_user_date ON public.daily_pnl_tracking(user_id, trading_date DESC);
CREATE INDEX idx_risk_events_user ON public.risk_events(user_id, created_at DESC);
CREATE INDEX idx_risk_events_unresolved ON public.risk_events(user_id, resolved) WHERE NOT resolved;

-- Create trigger to auto-create risk settings for new users
CREATE OR REPLACE FUNCTION public.create_default_risk_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.risk_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_risk_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_risk_settings();

-- Update trigger for risk_settings
CREATE TRIGGER update_risk_settings_updated_at
  BEFORE UPDATE ON public.risk_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();