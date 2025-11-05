-- =========================================
-- ORDER EXECUTION: ATOMIC STORED PROCEDURE
-- =========================================

-- Create asset specifications table for trading parameters
CREATE TABLE IF NOT EXISTS public.asset_specs (
    symbol TEXT PRIMARY KEY,
    asset_class TEXT NOT NULL,
    min_quantity DECIMAL(15, 8) DEFAULT 0.01,
    max_quantity DECIMAL(15, 8) DEFAULT 1000.00,
    leverage DECIMAL(5, 2) DEFAULT 100.00,
    pip_size DECIMAL(10, 8) DEFAULT 0.0001,
    base_commission DECIMAL(10, 4) DEFAULT 7.00,
    commission_type TEXT DEFAULT 'per_lot', -- 'per_lot' or 'percentage'
    is_tradable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on asset_specs (public data)
ALTER TABLE public.asset_specs ENABLE ROW LEVEL SECURITY;

-- Public read access for asset specs
CREATE POLICY "Anyone can view asset specs" ON public.asset_specs
    FOR SELECT USING (true);

-- Insert default asset specifications
INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission) VALUES
-- Forex pairs
('EURUSD', 'forex', 0.01, 100.00, 500.00, 0.0001, 7.00),
('GBPUSD', 'forex', 0.01, 100.00, 500.00, 0.0001, 7.00),
('USDJPY', 'forex', 0.01, 100.00, 500.00, 0.01, 7.00),
('AUDUSD', 'forex', 0.01, 100.00, 500.00, 0.0001, 7.00),
('USDCAD', 'forex', 0.01, 100.00, 500.00, 0.0001, 7.00),
-- Commodities
('XAUUSD', 'commodity', 0.01, 50.00, 200.00, 0.01, 10.00),
('XAGUSD', 'commodity', 0.01, 100.00, 200.00, 0.001, 10.00),
('USOIL', 'commodity', 0.01, 100.00, 100.00, 0.01, 8.00),
-- Crypto
('BTCUSD', 'crypto', 0.001, 10.00, 100.00, 1.00, 15.00),
('ETHUSD', 'crypto', 0.01, 100.00, 100.00, 0.01, 12.00),
-- Stocks
('AAPL', 'stock', 1.00, 1000.00, 20.00, 0.01, 10.00),
('GOOGL', 'stock', 1.00, 1000.00, 20.00, 0.01, 10.00),
('MSFT', 'stock', 1.00, 1000.00, 20.00, 0.01, 10.00),
('AMZN', 'stock', 1.00, 1000.00, 20.00, 0.01, 10.00),
('TSLA', 'stock', 1.00, 1000.00, 20.00, 0.01, 10.00)
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- ATOMIC ORDER EXECUTION PROCEDURE
-- =========================================
CREATE OR REPLACE FUNCTION public.execute_order_atomic(
    p_user_id UUID,
    p_symbol TEXT,
    p_order_type order_type,
    p_side order_side,
    p_quantity DECIMAL,
    p_price DECIMAL,
    p_stop_loss DECIMAL,
    p_take_profit DECIMAL,
    p_idempotency_key TEXT,
    p_current_price DECIMAL,
    p_slippage DECIMAL DEFAULT 0.0005
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_fill_id UUID;
    v_position_id UUID;
    v_execution_price DECIMAL;
    v_commission DECIMAL;
    v_margin_required DECIMAL;
    v_user_balance DECIMAL;
    v_user_equity DECIMAL;
    v_user_margin_used DECIMAL;
    v_free_margin DECIMAL;
    v_leverage DECIMAL;
    v_contract_size DECIMAL := 100000; -- Standard lot size
    v_existing_position RECORD;
    v_new_quantity DECIMAL;
    v_weighted_entry_price DECIMAL;
    v_result JSON;
BEGIN
    -- Start transaction
    -- Get user financial data with row lock
    SELECT balance, equity, margin_used
    INTO v_user_balance, v_user_equity, v_user_margin_used
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Get asset leverage
    SELECT leverage INTO v_leverage
    FROM public.asset_specs
    WHERE symbol = p_symbol;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Asset not found or not tradable';
    END IF;

    -- Calculate execution price with slippage for market orders
    IF p_order_type = 'market' THEN
        IF p_side = 'buy' THEN
            v_execution_price := p_current_price * (1 + p_slippage);
        ELSE
            v_execution_price := p_current_price * (1 - p_slippage);
        END IF;
    ELSE
        v_execution_price := p_price;
    END IF;

    -- Calculate commission (per lot)
    SELECT base_commission INTO v_commission
    FROM public.asset_specs
    WHERE symbol = p_symbol;
    
    v_commission := v_commission * p_quantity;

    -- Calculate margin required
    v_margin_required := (p_quantity * v_contract_size * v_execution_price) / v_leverage;

    -- Calculate free margin
    v_free_margin := v_user_equity - v_user_margin_used;

    -- Check if user has sufficient margin
    IF v_free_margin < v_margin_required THEN
        RAISE EXCEPTION 'Insufficient margin. Required: %, Available: %', v_margin_required, v_free_margin;
    END IF;

    -- Check if user has sufficient balance for commission
    IF v_user_balance < v_commission THEN
        RAISE EXCEPTION 'Insufficient balance for commission. Required: %, Available: %', v_commission, v_user_balance;
    END IF;

    -- Insert order record
    INSERT INTO public.orders (
        user_id, symbol, order_type, side, quantity, 
        price, stop_loss, take_profit, fill_price, 
        status, commission, idempotency_key, filled_at
    ) VALUES (
        p_user_id, p_symbol, p_order_type, p_side, p_quantity,
        p_price, p_stop_loss, p_take_profit, v_execution_price,
        'filled', v_commission, p_idempotency_key, now()
    )
    RETURNING id INTO v_order_id;

    -- Create fill record
    INSERT INTO public.fills (
        order_id, user_id, symbol, quantity, price, commission
    ) VALUES (
        v_order_id, p_user_id, p_symbol, p_quantity, v_execution_price, v_commission
    )
    RETURNING id INTO v_fill_id;

    -- Check for existing open position for same symbol and side
    SELECT * INTO v_existing_position
    FROM public.positions
    WHERE user_id = p_user_id
      AND symbol = p_symbol
      AND side = p_side
      AND status = 'open'
    FOR UPDATE;

    IF FOUND THEN
        -- Merge with existing position (weighted average entry price)
        v_new_quantity := v_existing_position.quantity + p_quantity;
        v_weighted_entry_price := (
            (v_existing_position.entry_price * v_existing_position.quantity) +
            (v_execution_price * p_quantity)
        ) / v_new_quantity;

        UPDATE public.positions
        SET 
            quantity = v_new_quantity,
            entry_price = v_weighted_entry_price,
            current_price = v_execution_price,
            margin_used = margin_used + v_margin_required
        WHERE id = v_existing_position.id
        RETURNING id INTO v_position_id;
    ELSE
        -- Create new position
        INSERT INTO public.positions (
            user_id, symbol, side, quantity, entry_price, 
            current_price, margin_used, status
        ) VALUES (
            p_user_id, p_symbol, p_side, p_quantity, v_execution_price,
            v_execution_price, v_margin_required, 'open'
        )
        RETURNING id INTO v_position_id;
    END IF;

    -- Deduct commission from balance
    UPDATE public.profiles
    SET 
        balance = balance - v_commission,
        margin_used = margin_used + v_margin_required
    WHERE id = p_user_id;

    -- Create ledger entry for commission
    INSERT INTO public.ledger (
        user_id, transaction_type, amount, 
        balance_before, balance_after, 
        description, reference_id
    ) VALUES (
        p_user_id, 'commission', -v_commission,
        v_user_balance, v_user_balance - v_commission,
        'Order commission for ' || p_symbol, v_order_id
    );

    -- Build result JSON
    v_result := json_build_object(
        'order_id', v_order_id,
        'position_id', v_position_id,
        'fill_id', v_fill_id,
        'fill_price', v_execution_price,
        'slippage', v_execution_price - p_current_price,
        'commission', v_commission,
        'margin_required', v_margin_required,
        'status', 'filled'
    );

    RETURN v_result;
END;
$$;