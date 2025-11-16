-- Create withdrawal_requests table for tracking withdrawal requests
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BNB')),
  amount NUMERIC NOT NULL,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  fee_amount NUMERIC,
  network_fee NUMERIC,
  transaction_hash TEXT,
  confirmations INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient queries
CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Withdrawal requests created via edge functions only
CREATE POLICY "Withdrawal requests created via edge functions only"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (false);

-- Withdrawal requests updated via edge functions only
CREATE POLICY "Withdrawal requests updated via edge functions only"
ON public.withdrawal_requests
FOR UPDATE
USING (false);

-- Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create withdrawal_limits table for tracking daily/monthly limits
CREATE TABLE public.withdrawal_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily', 'monthly')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  limit_amount NUMERIC NOT NULL,
  reset_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_withdrawal_limits_user_id ON public.withdrawal_limits(user_id);
CREATE INDEX idx_withdrawal_limits_period ON public.withdrawal_limits(period);
CREATE INDEX idx_withdrawal_limits_reset_date ON public.withdrawal_limits(reset_date);

-- Enable RLS
ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own limits
CREATE POLICY "Users can view own withdrawal limits"
ON public.withdrawal_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Limits updated via edge functions only
CREATE POLICY "Withdrawal limits updated via edge functions only"
ON public.withdrawal_limits
FOR UPDATE
USING (false);

-- Admins can view all limits
CREATE POLICY "Admins can view all withdrawal limits"
ON public.withdrawal_limits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create audit log for withdrawal events
CREATE TABLE public.withdrawal_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  withdrawal_id UUID REFERENCES public.withdrawal_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled')),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for audit log
CREATE INDEX idx_withdrawal_audit_withdrawal_id ON public.withdrawal_audit(withdrawal_id);
CREATE INDEX idx_withdrawal_audit_user_id ON public.withdrawal_audit(user_id);
CREATE INDEX idx_withdrawal_audit_admin_id ON public.withdrawal_audit(admin_id);
CREATE INDEX idx_withdrawal_audit_created_at ON public.withdrawal_audit(created_at);

-- Enable RLS on audit log
ALTER TABLE public.withdrawal_audit ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for their withdrawals
CREATE POLICY "Users can view own withdrawal audit logs"
ON public.withdrawal_audit
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all withdrawal audit logs"
ON public.withdrawal_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit log created via edge functions only
CREATE POLICY "Withdrawal audit logs created via edge functions only"
ON public.withdrawal_audit
FOR INSERT
WITH CHECK (false);

-- Create payment_fees lookup table
CREATE TABLE public.payment_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT NOT NULL UNIQUE,
  network_fee_amount NUMERIC NOT NULL,
  platform_fee_percentage NUMERIC NOT NULL DEFAULT 0.5,
  min_withdrawal NUMERIC NOT NULL,
  max_daily_withdrawal NUMERIC NOT NULL,
  max_transaction NUMERIC NOT NULL,
  blockchain NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default fees for supported currencies
INSERT INTO public.payment_fees (currency, network_fee_amount, platform_fee_percentage, min_withdrawal, max_daily_withdrawal, max_transaction, blockchain) VALUES
('BTC', 0.0001, 0.5, 0.001, 10000, 5000, 1),
('ETH', 0.005, 0.5, 0.01, 10000, 5000, 1),
('USDT', 1, 0.5, 10, 10000, 5000, 1),
('USDC', 1, 0.5, 10, 10000, 5000, 1),
('LTC', 0.001, 0.5, 0.1, 10000, 5000, 1),
('BNB', 0.005, 0.5, 0.01, 10000, 5000, 1)
ON CONFLICT (currency) DO UPDATE SET updated_at = now();

-- Create index on payment_fees
CREATE INDEX idx_payment_fees_currency ON public.payment_fees(currency);

-- Enable RLS on payment_fees (publicly readable)
ALTER TABLE public.payment_fees ENABLE ROW LEVEL SECURITY;

-- Everyone can read fee info
CREATE POLICY "Public can read payment fees"
ON public.payment_fees
FOR SELECT
USING (true);

-- Only admins can modify fees
CREATE POLICY "Admins can modify payment fees"
ON public.payment_fees
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
