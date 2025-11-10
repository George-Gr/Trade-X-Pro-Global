-- Create order_templates table
CREATE TABLE IF NOT EXISTS public.order_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT,
  order_type order_type NOT NULL,
  volume NUMERIC NOT NULL,
  leverage NUMERIC NOT NULL DEFAULT 100,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for order_templates
ALTER TABLE public.order_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order templates"
  ON public.order_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own order templates"
  ON public.order_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order templates"
  ON public.order_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own order templates"
  ON public.order_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trailing stop loss fields to positions table
ALTER TABLE public.positions
ADD COLUMN IF NOT EXISTS trailing_stop_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS trailing_stop_distance NUMERIC,
ADD COLUMN IF NOT EXISTS trailing_stop_price NUMERIC,
ADD COLUMN IF NOT EXISTS highest_price NUMERIC,
ADD COLUMN IF NOT EXISTS lowest_price NUMERIC;

-- Create trigger for order_templates updated_at
CREATE TRIGGER update_order_templates_updated_at
  BEFORE UPDATE ON public.order_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_templates_user_id ON public.order_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_trailing_stop ON public.positions(trailing_stop_enabled) WHERE status = 'open';