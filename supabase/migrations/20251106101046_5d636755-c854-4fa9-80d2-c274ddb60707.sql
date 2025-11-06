-- Create position_lots table for FIFO tracking
CREATE TABLE IF NOT EXISTS public.position_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL,
    order_id UUID NOT NULL,
    fill_id UUID NOT NULL,
    user_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    side order_side NOT NULL,
    quantity DECIMAL NOT NULL,
    remaining_quantity DECIMAL NOT NULL,
    entry_price DECIMAL NOT NULL,
    commission DECIMAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK (remaining_quantity >= 0),
    CHECK (remaining_quantity <= quantity)
);

-- Enable RLS
ALTER TABLE public.position_lots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for position_lots
CREATE POLICY "Users can view own lots"
    ON public.position_lots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all lots"
    ON public.position_lots FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Index for better performance
CREATE INDEX idx_position_lots_position_id ON public.position_lots(position_id);
CREATE INDEX idx_position_lots_user_symbol ON public.position_lots(user_id, symbol);

-- Update execute_order_atomic to create lot entries
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
    v_contract_size DECIMAL := 100000;
    v_existing_position RECORD;
    v_new_quantity DECIMAL;
    v_weighted_entry_price DECIMAL;
    v_result JSON;
BEGIN
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

    -- Calculate commission
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
        -- Merge with existing position
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

    -- Create lot entry for FIFO tracking
    INSERT INTO public.position_lots (
        position_id, order_id, fill_id, user_id, symbol, side,
        quantity, remaining_quantity, entry_price, commission
    ) VALUES (
        v_position_id, v_order_id, v_fill_id, p_user_id, p_symbol, p_side,
        p_quantity, p_quantity, v_execution_price, v_commission
    );

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

-- Create close_position_atomic function with FIFO lot tracking
CREATE OR REPLACE FUNCTION public.close_position_atomic(
    p_user_id UUID,
    p_position_id UUID,
    p_close_quantity DECIMAL,
    p_current_price DECIMAL,
    p_idempotency_key TEXT,
    p_slippage DECIMAL DEFAULT 0.0005
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_position RECORD;
    v_lot RECORD;
    v_close_price DECIMAL;
    v_commission DECIMAL;
    v_total_realized_pnl DECIMAL := 0;
    v_total_commission DECIMAL := 0;
    v_margin_released DECIMAL := 0;
    v_remaining_to_close DECIMAL := p_close_quantity;
    v_lot_close_quantity DECIMAL;
    v_lot_pnl DECIMAL;
    v_lot_margin DECIMAL;
    v_order_id UUID;
    v_fill_id UUID;
    v_user_balance DECIMAL;
    v_contract_size DECIMAL := 100000;
    v_leverage DECIMAL;
    v_lots_closed JSON[] := ARRAY[]::JSON[];
    v_result JSON;
BEGIN
    -- Get position with lock
    SELECT * INTO v_position
    FROM public.positions
    WHERE id = p_position_id
      AND user_id = p_user_id
      AND status = 'open'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Position not found or already closed';
    END IF;

    -- Validate close quantity
    IF p_close_quantity <= 0 OR p_close_quantity > v_position.quantity THEN
        RAISE EXCEPTION 'Invalid close quantity. Must be between 0 and %', v_position.quantity;
    END IF;

    -- Get current balance
    SELECT balance INTO v_user_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Get asset specs
    SELECT leverage, base_commission INTO v_leverage, v_commission
    FROM public.asset_specs
    WHERE symbol = v_position.symbol;

    -- Calculate close price with slippage
    IF v_position.side = 'buy' THEN
        v_close_price := p_current_price * (1 - p_slippage);
    ELSE
        v_close_price := p_current_price * (1 + p_slippage);
    END IF;

    -- Calculate commission for closing
    v_total_commission := v_commission * p_close_quantity;

    -- Check sufficient balance for commission
    IF v_user_balance < v_total_commission THEN
        RAISE EXCEPTION 'Insufficient balance for closing commission';
    END IF;

    -- Create close order
    INSERT INTO public.orders (
        user_id, symbol, order_type, side, quantity,
        fill_price, status, commission, idempotency_key, filled_at
    ) VALUES (
        p_user_id, v_position.symbol, 'market',
        CASE WHEN v_position.side = 'buy' THEN 'sell'::order_side ELSE 'buy'::order_side END,
        p_close_quantity, v_close_price, 'filled', v_total_commission, p_idempotency_key, now()
    )
    RETURNING id INTO v_order_id;

    -- Create fill record
    INSERT INTO public.fills (
        order_id, user_id, symbol, quantity, price, commission
    ) VALUES (
        v_order_id, p_user_id, v_position.symbol, p_close_quantity, v_close_price, v_total_commission
    )
    RETURNING id INTO v_fill_id;

    -- Process lots using FIFO
    FOR v_lot IN
        SELECT * FROM public.position_lots
        WHERE position_id = p_position_id
          AND remaining_quantity > 0
        ORDER BY created_at ASC
        FOR UPDATE
    LOOP
        EXIT WHEN v_remaining_to_close <= 0;

        -- Determine how much to close from this lot
        v_lot_close_quantity := LEAST(v_lot.remaining_quantity, v_remaining_to_close);

        -- Calculate P&L for this lot
        IF v_position.side = 'buy' THEN
            v_lot_pnl := (v_close_price - v_lot.entry_price) * v_lot_close_quantity * v_contract_size;
        ELSE
            v_lot_pnl := (v_lot.entry_price - v_close_price) * v_lot_close_quantity * v_contract_size;
        END IF;

        -- Calculate margin released for this lot
        v_lot_margin := (v_lot_close_quantity * v_contract_size * v_lot.entry_price) / v_leverage;

        -- Update lot remaining quantity
        UPDATE public.position_lots
        SET remaining_quantity = remaining_quantity - v_lot_close_quantity
        WHERE id = v_lot.id;

        -- Accumulate totals
        v_total_realized_pnl := v_total_realized_pnl + v_lot_pnl;
        v_margin_released := v_margin_released + v_lot_margin;
        v_remaining_to_close := v_remaining_to_close - v_lot_close_quantity;

        -- Track closed lot info
        v_lots_closed := v_lots_closed || json_build_object(
            'lot_id', v_lot.id,
            'quantity_closed', v_lot_close_quantity,
            'entry_price', v_lot.entry_price,
            'exit_price', v_close_price,
            'pnl', v_lot_pnl
        );
    END LOOP;

    -- Update position
    IF p_close_quantity >= v_position.quantity THEN
        -- Full close
        UPDATE public.positions
        SET 
            status = 'closed',
            closed_at = now(),
            realized_pnl = v_total_realized_pnl,
            current_price = v_close_price
        WHERE id = p_position_id;
    ELSE
        -- Partial close
        UPDATE public.positions
        SET 
            quantity = quantity - p_close_quantity,
            realized_pnl = realized_pnl + v_total_realized_pnl,
            margin_used = margin_used - v_margin_released,
            current_price = v_close_price
        WHERE id = p_position_id;
    END IF;

    -- Update user profile: release margin, deduct commission, add P&L
    UPDATE public.profiles
    SET 
        balance = balance + v_total_realized_pnl - v_total_commission,
        margin_used = margin_used - v_margin_released
    WHERE id = p_user_id;

    -- Create ledger entry for realized P&L
    IF v_total_realized_pnl != 0 THEN
        INSERT INTO public.ledger (
            user_id, transaction_type, amount,
            balance_before, balance_after,
            description, reference_id
        ) VALUES (
            p_user_id, 'realized_pnl', v_total_realized_pnl,
            v_user_balance, v_user_balance + v_total_realized_pnl - v_total_commission,
            'Realized P&L from closing ' || v_position.symbol, v_order_id
        );
    END IF;

    -- Create ledger entry for commission
    INSERT INTO public.ledger (
        user_id, transaction_type, amount,
        balance_before, balance_after,
        description, reference_id
    ) VALUES (
        p_user_id, 'commission', -v_total_commission,
        v_user_balance + v_total_realized_pnl, v_user_balance + v_total_realized_pnl - v_total_commission,
        'Close commission for ' || v_position.symbol, v_order_id
    );

    -- Build result
    v_result := json_build_object(
        'order_id', v_order_id,
        'fill_id', v_fill_id,
        'position_id', p_position_id,
        'closed_quantity', p_close_quantity,
        'close_price', v_close_price,
        'realized_pnl', v_total_realized_pnl,
        'commission', v_total_commission,
        'margin_released', v_margin_released,
        'lots_closed', v_lots_closed,
        'position_status', CASE WHEN p_close_quantity >= v_position.quantity THEN 'closed' ELSE 'partial' END
    );

    RETURN v_result;
END;
$$;