-- Create margin call events table for tracking margin call escalation
CREATE TABLE IF NOT EXISTS public.margin_call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'escalated', 'liquidating', 'resolved', 'failed')),
  severity TEXT NOT NULL CHECK (severity IN ('WARNING', 'CRITICAL', 'LIQUIDATION_TRIGGER')),
  margin_level NUMERIC NOT NULL,
  account_equity NUMERIC NOT NULL,
  margin_used NUMERIC NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  liquidated_at TIMESTAMPTZ,
  resolution_type TEXT CHECK (resolution_type IN ('manual_deposit', 'price_recovery', 'liquidation_complete', 'failed')),
  grace_period_expires_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  escalation_count INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_margin_call_events_user_id ON public.margin_call_events(user_id);
CREATE INDEX IF NOT EXISTS idx_margin_call_events_status ON public.margin_call_events(status);
CREATE INDEX IF NOT EXISTS idx_margin_call_events_severity ON public.margin_call_events(severity);
CREATE INDEX IF NOT EXISTS idx_margin_call_events_triggered_at ON public.margin_call_events(triggered_at);
CREATE INDEX IF NOT EXISTS idx_margin_call_events_active ON public.margin_call_events(user_id, status) WHERE status IN ('pending', 'notified', 'escalated');

-- Create liquidation events table for audit trail
CREATE TABLE IF NOT EXISTS public.liquidation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  margin_call_event_id UUID REFERENCES public.margin_call_events(id),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'processing', 'completed', 'failed', 'partial')),
  reason TEXT NOT NULL,
  initial_margin_level NUMERIC NOT NULL,
  final_margin_level NUMERIC,
  initial_equity NUMERIC NOT NULL,
  final_equity NUMERIC,
  total_positions_closed INTEGER DEFAULT 0,
  total_positions_failed INTEGER DEFAULT 0,
  total_loss_realized NUMERIC DEFAULT 0,
  total_slippage_applied NUMERIC DEFAULT 0,
  slippage_multiplier NUMERIC DEFAULT 1.5,
  execution_time_ms INTEGER,
  closed_positions JSONB DEFAULT '[]'::jsonb,
  failed_positions JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for liquidation events
CREATE INDEX IF NOT EXISTS idx_liquidation_events_user_id ON public.liquidation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_liquidation_events_status ON public.liquidation_events(status);
CREATE INDEX IF NOT EXISTS idx_liquidation_events_margin_call ON public.liquidation_events(margin_call_event_id);
CREATE INDEX IF NOT EXISTS idx_liquidation_events_initiated_at ON public.liquidation_events(initiated_at);

-- Enable RLS on margin_call_events
ALTER TABLE public.margin_call_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own margin call events
CREATE POLICY "Users can view own margin calls"
ON public.margin_call_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all margin call events
CREATE POLICY "Admins can view all margin calls"
ON public.margin_call_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only edge functions can insert/update margin call events
CREATE POLICY "Margin calls created via edge functions only"
ON public.margin_call_events FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Margin calls updated via edge functions only"
ON public.margin_call_events FOR UPDATE
TO authenticated
USING (false);

-- Enable RLS on liquidation_events
ALTER TABLE public.liquidation_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own liquidation events
CREATE POLICY "Users can view own liquidations"
ON public.liquidation_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all liquidation events
CREATE POLICY "Admins can view all liquidations"
ON public.liquidation_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only edge functions can create liquidation events
CREATE POLICY "Liquidations created via edge functions only"
ON public.liquidation_events FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Liquidations updated via edge functions only"
ON public.liquidation_events FOR UPDATE
TO authenticated
USING (false);

-- Create trigger to update updated_at
CREATE TRIGGER update_margin_call_events_updated_at
BEFORE UPDATE ON public.margin_call_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liquidation_events_updated_at
BEFORE UPDATE ON public.liquidation_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();