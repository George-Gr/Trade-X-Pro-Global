-- Create leads table for registration tracking
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  lead_number TEXT NOT NULL UNIQUE,
  
  -- Personal Information (Step 1)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  
  -- Trading Profile (Step 2)
  trading_experience TEXT NOT NULL,
  occupation TEXT NOT NULL,
  financial_capability TEXT NOT NULL,
  reason_for_joining TEXT NOT NULL,
  trading_goals TEXT NOT NULL,
  
  -- Lead Status
  status TEXT NOT NULL DEFAULT 'new',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users can view own lead"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Leads created via edge functions only"
ON public.leads
FOR INSERT
WITH CHECK (false);

-- Create function to generate unique lead number
CREATE OR REPLACE FUNCTION public.generate_lead_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_lead_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_lead_number := 'TXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leads WHERE lead_number = new_lead_number);
    counter := counter + 1;
  END LOOP;
  RETURN new_lead_number;
END;
$$;

-- Update handle_new_user function to set initial balance to 0
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert profile with 0 balance for fresh accounts
    INSERT INTO public.profiles (id, email, full_name, balance, equity)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        0,
        0
    );
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Enable realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Create index for faster queries
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);