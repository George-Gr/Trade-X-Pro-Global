-- Create crypto_transactions table for tracking deposits/withdrawals
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  payment_id TEXT UNIQUE, -- NowPayments payment ID
  currency TEXT NOT NULL, -- Crypto currency (BTC, ETH, etc)
  amount NUMERIC NOT NULL,
  usd_amount NUMERIC, -- USD equivalent
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'confirmed', 'completed', 'failed', 'expired', 'refunded')),
  payment_address TEXT, -- Crypto address to send to
  payment_url TEXT, -- NowPayments payment URL
  actual_amount_received NUMERIC, -- Actual crypto received
  confirmations INTEGER DEFAULT 0,
  network_fee NUMERIC,
  metadata JSONB, -- Additional NowPayments data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient queries
CREATE INDEX idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_payment_id ON public.crypto_transactions(payment_id);
CREATE INDEX idx_crypto_transactions_status ON public.crypto_transactions(status);

-- Enable RLS
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own crypto transactions"
ON public.crypto_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Transactions created via edge functions only
CREATE POLICY "Crypto transactions created via edge functions only"
ON public.crypto_transactions
FOR INSERT
WITH CHECK (false);

-- Transactions updated via edge functions only
CREATE POLICY "Crypto transactions updated via edge functions only"
ON public.crypto_transactions
FOR UPDATE
USING (false);

-- Admins can view all transactions
CREATE POLICY "Admins can view all crypto transactions"
ON public.crypto_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_crypto_transactions_updated_at
BEFORE UPDATE ON public.crypto_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();