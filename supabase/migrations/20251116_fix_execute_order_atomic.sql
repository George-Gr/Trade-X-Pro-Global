-- Update execute_order_atomic stored procedure to accept pre-calculated commission
-- This ensures the commission calculated on the Edge Function side matches the database

DROP FUNCTION IF EXISTS public.execute_order_atomic(
    UUID, TEXT, order_type, order_side, DECIMAL, DECIMAL, DECIMAL, DECIMAL, TEXT, DECIMAL, DECIMAL
);

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
    p_slippage DECIMAL,
    p_commission DECIMAL
)
RETURNS jsonb AS $$
DECLARE
    v_order_id UUID;
    v_execution_price DECIMAL;
    v_total_cost DECIMAL;
    v_profile profiles%ROWTYPE;
    v_position positions%ROWTYPE;
    v_asset_spec asset_master%ROWTYPE;
    v_order orders%ROWTYPE;
    v_result jsonb;
    v_margin_required DECIMAL;
    v_free_margin DECIMAL;
BEGIN
    -- Start transaction
    BEGIN
        -- 1. Fetch user profile with current financials (lock for update)
        SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'User profile not found',
                'status', 404
            );
        END IF;

        -- 2. Fetch asset specification (lock for update)
        SELECT * INTO v_asset_spec FROM public.asset_master WHERE symbol = p_symbol FOR UPDATE;
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Asset not found',
                'status', 400
            );
        END IF;

        -- 3. Calculate execution price with slippage
        v_execution_price := p_current_price;
        IF p_slippage IS NOT NULL AND p_slippage > 0 THEN
            IF p_side = 'buy' THEN
                v_execution_price := p_current_price + p_slippage;
            ELSE
                v_execution_price := p_current_price - p_slippage;
            END IF;
        END IF;

        -- 4. Calculate total cost/proceeds
        IF p_side = 'buy' THEN
            v_total_cost := (p_quantity * v_execution_price) + p_commission;
            -- Check if user has sufficient balance
            IF v_total_cost > v_profile.balance THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', 'Insufficient balance',
                    'required', v_total_cost,
                    'available', v_profile.balance,
                    'status', 400
                );
            END IF;
        ELSE
            -- Sell: add proceeds, subtract commission
            v_total_cost := (p_quantity * v_execution_price) - p_commission;
        END IF;

        -- 5. Check margin requirements
        v_margin_required := calculate_margin_required(
            p_quantity,
            v_execution_price,
            COALESCE(v_asset_spec.leverage, 1)
        );
        v_free_margin := v_profile.equity - v_profile.margin_used;

        IF v_margin_required > v_free_margin THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient margin',
                'required', v_margin_required,
                'available', v_free_margin,
                'status', 400
            );
        END IF;

        -- 6. Create order record
        INSERT INTO public.orders (
            user_id,
            symbol,
            order_type,
            side,
            quantity,
            price,
            stop_loss,
            take_profit,
            fill_price,
            status,
            commission,
            idempotency_key,
            filled_at
        ) VALUES (
            p_user_id,
            p_symbol,
            p_order_type,
            p_side,
            p_quantity,
            p_price,
            p_stop_loss,
            p_take_profit,
            v_execution_price,
            'filled',
            p_commission,
            p_idempotency_key,
            now()
        )
        RETURNING * INTO v_order;
        v_order_id := v_order.id;

        -- 7. Create fill record
        INSERT INTO public.fills (
            order_id,
            user_id,
            symbol,
            quantity,
            price,
            commission,
            executed_at
        ) VALUES (
            v_order_id,
            p_user_id,
            p_symbol,
            p_quantity,
            v_execution_price,
            p_commission,
            now()
        );

        -- 8. Update or create position
        SELECT * INTO v_position FROM public.positions
        WHERE user_id = p_user_id
            AND symbol = p_symbol
            AND side = p_side
            AND status = 'open'
        FOR UPDATE;

        IF FOUND THEN
            -- Position exists - update it
            UPDATE public.positions SET
                quantity = quantity + p_quantity,
                entry_price = (
                    (entry_price * quantity + v_execution_price * p_quantity) / 
                    (quantity + p_quantity)
                ),
                current_price = v_execution_price,
                margin_used = margin_used + v_margin_required,
                updated_at = now()
            WHERE id = v_position.id;
        ELSE
            -- Create new position
            INSERT INTO public.positions (
                user_id,
                symbol,
                side,
                quantity,
                entry_price,
                current_price,
                margin_used,
                status
            ) VALUES (
                p_user_id,
                p_symbol,
                p_side,
                p_quantity,
                v_execution_price,
                v_execution_price,
                v_margin_required,
                'open'
            );
        END IF;

        -- 9. Update profile balance and margin
        UPDATE public.profiles SET
            balance = CASE
                WHEN p_side = 'buy' THEN balance - v_total_cost
                ELSE balance + v_total_cost
            END,
            margin_used = margin_used + v_margin_required,
            equity = CASE
                WHEN p_side = 'buy' THEN equity - v_total_cost
                ELSE equity + v_total_cost
            END,
            updated_at = now()
        WHERE id = p_user_id;

        -- 10. Record ledger entry
        INSERT INTO public.ledger (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            description,
            reference_id,
            created_at
        ) VALUES (
            p_user_id,
            CASE 
                WHEN p_side = 'buy' THEN 'adjustment'::transaction_type 
                WHEN p_side = 'sell' THEN 'profit'::transaction_type
                ELSE 'adjustment'::transaction_type 
            END,
            p_quantity * v_execution_price,
            v_profile.balance,
            CASE
                WHEN p_side = 'buy' THEN v_profile.balance - v_total_cost
                ELSE v_profile.balance + v_total_cost
            END,
            format('Order %s: %s %s %s @ %s (commission: %s)', 
                v_order_id, p_side, p_quantity, p_symbol, v_execution_price, p_commission),
            v_order_id,
            now()
        );

        -- 11. Build success response
        v_result := jsonb_build_object(
            'success', true,
            'order_id', v_order_id,
            'symbol', p_symbol,
            'side', p_side,
            'quantity', p_quantity,
            'execution_price', v_execution_price,
            'fill_price', v_execution_price,
            'commission', p_commission,
            'total_cost', CASE WHEN p_side = 'buy' THEN v_total_cost ELSE NULL END,
            'total_proceeds', CASE WHEN p_side = 'sell' THEN v_total_cost ELSE NULL END,
            'margin_required', v_margin_required,
            'status', 'filled',
            'filled_at', to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
            'new_balance', CASE
                WHEN p_side = 'buy' THEN v_profile.balance - v_total_cost
                ELSE v_profile.balance + v_total_cost
            END,
            'new_margin_level', ((v_profile.equity - CASE
                WHEN p_side = 'buy' THEN v_total_cost
                ELSE -v_total_cost
            END) / (v_profile.margin_used + v_margin_required)) * 100
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'status', 500
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_order_atomic(
    UUID, TEXT, order_type, order_side, DECIMAL, DECIMAL, DECIMAL, DECIMAL, TEXT, DECIMAL, DECIMAL, DECIMAL
) TO authenticated;
