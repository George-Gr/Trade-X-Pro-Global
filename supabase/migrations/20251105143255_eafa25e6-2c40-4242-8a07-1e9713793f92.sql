-- =========================================
-- TRADEPRO v10: CORE DATABASE SCHEMA
-- Phase 1: Foundation Tables & Security
-- =========================================

-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected', 'resubmitted');

-- Create account status enum
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'closed');

-- Create order type enum
CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');

-- Create order side enum
CREATE TYPE public.order_side AS ENUM ('buy', 'sell');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'filled', 'partial', 'cancelled', 'rejected');

-- Create position status enum
CREATE TYPE public.position_status AS ENUM ('open', 'closed');

-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'commission', 'profit', 'loss', 'swap', 'adjustment');

-- =========================================
-- USER ROLES TABLE (Critical for security)
-- =========================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =========================================
-- PROFILES TABLE (User accounts & financials)
-- =========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    country TEXT,
    
    -- Financial columns
    balance DECIMAL(15, 4) DEFAULT 10000.00 NOT NULL CHECK (balance >= 0),
    equity DECIMAL(15, 4) DEFAULT 10000.00 NOT NULL CHECK (equity >= 0),
    margin_used DECIMAL(15, 4) DEFAULT 0.00 NOT NULL CHECK (margin_used >= 0),
    free_margin DECIMAL(15, 4) GENERATED ALWAYS AS (equity - margin_used) STORED,
    margin_level DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN margin_used > 0 THEN (equity / margin_used) * 100
            ELSE NULL
        END
    ) STORED,
    
    -- Account status
    kyc_status kyc_status DEFAULT 'pending',
    account_status account_status DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- KYC DOCUMENTS TABLE
-- =========================================
CREATE TABLE public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status kyc_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on kyc_documents
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- =========================================
-- ORDERS TABLE
-- =========================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    order_type order_type NOT NULL,
    side order_side NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL CHECK (quantity > 0),
    price DECIMAL(15, 8),
    stop_loss DECIMAL(15, 8),
    take_profit DECIMAL(15, 8),
    fill_price DECIMAL(15, 8),
    status order_status DEFAULT 'pending',
    commission DECIMAL(15, 4) DEFAULT 0,
    idempotency_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    filled_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, idempotency_key)
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX idx_orders_symbol ON public.orders(symbol);

-- =========================================
-- POSITIONS TABLE
-- =========================================
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    side order_side NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL CHECK (quantity > 0),
    entry_price DECIMAL(15, 8) NOT NULL,
    current_price DECIMAL(15, 8),
    unrealized_pnl DECIMAL(15, 4) DEFAULT 0,
    realized_pnl DECIMAL(15, 4) DEFAULT 0,
    margin_used DECIMAL(15, 4) NOT NULL,
    status position_status DEFAULT 'open',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_positions_user_status ON public.positions(user_id, status);
CREATE INDEX idx_positions_symbol ON public.positions(symbol);

-- =========================================
-- FILLS TABLE (Execution details)
-- =========================================
CREATE TABLE public.fills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 8) NOT NULL,
    commission DECIMAL(15, 4) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on fills
ALTER TABLE public.fills ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_fills_user ON public.fills(user_id);
CREATE INDEX idx_fills_order ON public.fills(order_id);

-- =========================================
-- LEDGER TABLE (Transaction history)
-- =========================================
CREATE TABLE public.ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15, 4) NOT NULL,
    balance_before DECIMAL(15, 4) NOT NULL,
    balance_after DECIMAL(15, 4) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ledger
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_ledger_user_created ON public.ledger(user_id, created_at DESC);

-- =========================================
-- RLS POLICIES
-- =========================================

-- User Roles: Users can view their own role, admins can view all
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can view/update their own, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- KYC Documents: Users can view/insert their own, admins can manage all
CREATE POLICY "Users can view own KYC docs" ON public.kyc_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC docs" ON public.kyc_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all KYC docs" ON public.kyc_documents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Positions: Users can view their own positions
CREATE POLICY "Users can view own positions" ON public.positions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all positions" ON public.positions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Fills: Users can view their own fills
CREATE POLICY "Users can view own fills" ON public.fills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fills" ON public.fills
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Ledger: Users can view their own transactions
CREATE POLICY "Users can view own ledger" ON public.ledger
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ledger entries" ON public.ledger
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TRIGGERS FOR AUTO-UPDATE
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to kyc_documents
CREATE TRIGGER update_kyc_documents_updated_at
    BEFORE UPDATE ON public.kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- FUNCTION TO CREATE PROFILE ON USER SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();