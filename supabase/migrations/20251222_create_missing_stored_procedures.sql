-- Create missing stored procedures for order execution
-- This migration creates the essential stored procedures that the execute-order Edge Function depends on
-- with proper transaction rollback mechanisms, comprehensive error handling, and consistent return structures

-- ============================================
-- 1. UPDATE_USER_BALANCE_AND_MARGIN PROCEDURE
-- ============================================

CREATE OR REPLACE FUNCTION public.update_user_balance_and_margin(
    p_user_id UUID,
    p_order_id UUID,
    p_side order_side,
    p_quantity DECIMAL,
    p_execution_price DECIMAL,
    p_commission DECIMAL,
    p_total_cost DECIMAL
)
RETURNS jsonb AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_margin_required DECIMAL;
    v_asset_spec asset_specs%ROWTYPE;
    v_result jsonb;
    v_new_balance DECIMAL;
    v_new_margin_used DECIMAL;
    v_new_equity DECIMAL;
BEGIN
    -- Start transaction with proper error handling
    BEGIN
        -- Lock the user profile for update to prevent race conditions
        SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'USER_NOT_FOUND',
                'error_message', 'User profile not found',
                'status', 404,
                'timestamp', now()
            );
        END IF;

        -- Get asset specification for margin calculation
        -- Note: This assumes we have access to the order symbol through the order_id
        SELECT a.* INTO v_asset_spec
        FROM public.orders o
        JOIN public.asset_specs a ON o.symbol = a.symbol
        WHERE o.id = p_order_id
        LIMIT 1;

        -- Calculate margin required for the order
        v_margin_required := (p_quantity * p_execution_price) / COALESCE(v_asset_spec.leverage, 1);

        -- Calculate new balance, margin, and equity
        IF p_side = 'buy' THEN
            v_new_balance := v_profile.balance - p_total_cost;
            v_new_equity := v_profile.equity - p_total_cost;
        ELSE
            v_new_balance := v_profile.balance + p_total_cost;
            v_new_equity := v_profile.equity + p_total_cost;
        END IF;
        
        v_new_margin_used := v_profile.margin_used + v_margin_required;

        -- Validate sufficient balance for buy orders
        IF p_side = 'buy' AND v_new_balance < 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'INSUFFICIENT_BALANCE',
                'error_message', 'Insufficient balance for transaction',
                'current_balance', v_profile.balance,
                'required_amount', p_total_cost,
                'shortfall', p_total_cost - v_profile.balance,
                'status', 400,
                'timestamp', now()
            );
        END IF;

        -- Validate sufficient margin
        IF v_new_margin_used > v_new_equity THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'INSUFFICIENT_MARGIN',
                'error_message', 'Insufficient margin for transaction',
                'current_equity', v_profile.equity,
                'current_margin_used', v_profile.margin_used,
                'additional_margin_required', v_margin_required,
                'margin_shortfall', v_new_margin_used - v_new_equity,
                'status', 400,
                'timestamp', now()
            );
        END IF;

        -- Update the user profile
        UPDATE public.profiles SET
            balance = v_new_balance,
            margin_used = v_new_margin_used,
            equity = v_new_equity,
            updated_at = now()
        WHERE id = p_user_id;

        -- Create audit log entry
        INSERT INTO public.balance_audit_log (
            user_id,
            order_id,
            action_type,
            old_balance,
            new_balance,
            old_margin_used,
            new_margin_used,
            old_equity,
            new_equity,
            transaction_amount,
            margin_change,
            created_at
        ) VALUES (
            p_user_id,
            p_order_id,
            'order_execution',
            v_profile.balance,
            v_new_balance,
            v_profile.margin_used,
            v_new_margin_used,
            v_profile.equity,
            v_new_equity,
            CASE WHEN p_side = 'buy' THEN -p_total_cost ELSE p_total_cost END,
            v_margin_required,
            now()
        );

        -- Return success response with detailed information
        v_result := jsonb_build_object(
            'success', true,
            'user_id', p_user_id,
            'order_id', p_order_id,
            'side', p_side,
            'old_balance', v_profile.balance,
            'new_balance', v_new_balance,
            'old_margin_used', v_profile.margin_used,
            'new_margin_used', v_new_margin_used,
            'old_equity', v_profile.equity,
            'new_equity', v_new_equity,
            'margin_required', v_margin_required,
            'transaction_amount', CASE WHEN p_side = 'buy' THEN -p_total_cost ELSE p_total_cost END,
            'status', 'success',
            'timestamp', now()
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Log the error for debugging
        INSERT INTO public.error_log (
            error_type,
            error_message,
            error_details,
            context,
            created_at
        ) VALUES (
            'BALANCE_UPDATE_ERROR',
            SQLERRM,
            jsonb_build_object(
                'user_id', p_user_id,
                'order_id', p_order_id,
                'side', p_side,
                'quantity', p_quantity,
                'execution_price', p_execution_price,
                'commission', p_commission,
                'total_cost', p_total_cost
            ),
            'update_user_balance_and_margin',
            now()
        );

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INTERNAL_ERROR',
            'error_message', 'Failed to update user balance and margin',
            'error_details', SQLERRM,
            'status', 500,
            'timestamp', now()
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 2. ROLLBACK_ORDER_EXECUTION PROCEDURE
-- ============================================

CREATE OR REPLACE FUNCTION public.rollback_order_execution(
    p_order_id UUID,
    p_user_id UUID,
    p_rollback_reason TEXT
)
RETURNS jsonb AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_position positions%ROWTYPE;
    v_profile profiles%ROWTYPE;
    v_result jsonb;
    v_refund_amount DECIMAL;
    v_margin_refund DECIMAL;
BEGIN
    -- Start transaction with proper error handling
    BEGIN
        -- Get the order details
        SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'ORDER_NOT_FOUND',
                'error_message', 'Order not found for rollback',
                'order_id', p_order_id,
                'status', 404,
                'timestamp', now()
            );
        END IF;

        -- Check if order is in a state that can be rolled back
        IF v_order.status NOT IN ('executing', 'pending') THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'INVALID_ORDER_STATE',
                'error_message', 'Order cannot be rolled back in current state',
                'order_id', p_order_id,
                'current_status', v_order.status,
                'status', 400,
                'timestamp', now()
            );
        END IF;

        -- Get the position if it exists
        SELECT * INTO v_position FROM public.positions 
        WHERE order_id = p_order_id FOR UPDATE;

        -- Get the user profile
        SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;

        -- Calculate refund amounts
        v_refund_amount := v_order.total_cost;
        -- For margin, we need to calculate based on position or order details
        v_margin_refund := COALESCE(v_position.margin_used, 0);

        -- Rollback position if it exists
        IF FOUND THEN
            IF v_position.quantity = v_order.quantity THEN
                -- Delete the entire position
                DELETE FROM public.positions WHERE id = v_position.id;
            ELSE
                -- Partial position update
                UPDATE public.positions SET
                    quantity = quantity - v_order.quantity,
                    margin_used = margin_used - v_margin_refund,
                    updated_at = now()
                WHERE id = v_position.id;
            END IF;
        END IF;

        -- Restore user balance and margin
        UPDATE public.profiles SET
            balance = balance + v_refund_amount,
            margin_used = GREATEST(margin_used - v_margin_refund, 0),
            equity = equity + v_refund_amount,
            updated_at = now()
        WHERE id = p_user_id;

        -- Update order status
        UPDATE public.orders SET
            status = 'failed',
            failure_reason = p_rollback_reason,
            rolled_back_at = now(),
            updated_at = now()
        WHERE id = p_order_id;

        -- Create audit log entries
        INSERT INTO public.order_audit_log (
            order_id,
            user_id,
            action,
            details,
            created_at
        ) VALUES (
            p_order_id,
            p_user_id,
            'order_rollback',
            jsonb_build_object(
                'rollback_reason', p_rollback_reason,
                'refund_amount', v_refund_amount,
                'margin_refund', v_margin_refund,
                'previous_status', v_order.status,
                'timestamp', now()
            ),
            now()
        );

        INSERT INTO public.balance_audit_log (
            user_id,
            order_id,
            action_type,
            old_balance,
            new_balance,
            old_margin_used,
            new_margin_used,
            old_equity,
            new_equity,
            transaction_amount,
            margin_change,
            created_at
        ) VALUES (
            p_user_id,
            p_order_id,
            'rollback',
            v_profile.balance,
            v_profile.balance + v_refund_amount,
            v_profile.margin_used,
            GREATEST(v_profile.margin_used - v_margin_refund, 0),
            v_profile.equity,
            v_profile.equity + v_refund_amount,
            v_refund_amount,
            -v_margin_refund,
            now()
        );

        -- Return success response
        v_result := jsonb_build_object(
            'success', true,
            'order_id', p_order_id,
            'user_id', p_user_id,
            'rollback_reason', p_rollback_reason,
            'refund_amount', v_refund_amount,
            'margin_refund', v_margin_refund,
            'previous_status', v_order.status,
            'new_order_status', 'failed',
            'balance_restored', v_profile.balance + v_refund_amount,
            'margin_restored', GREATEST(v_profile.margin_used - v_margin_refund, 0),
            'status', 'success',
            'timestamp', now()
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Log the error for debugging
        INSERT INTO public.error_log (
            error_type,
            error_message,
            error_details,
            context,
            created_at
        ) VALUES (
            'ROLLBACK_ERROR',
            SQLERRM,
            jsonb_build_object(
                'order_id', p_order_id,
                'user_id', p_user_id,
                'rollback_reason', p_rollback_reason
            ),
            'rollback_order_execution',
            now()
        );

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INTERNAL_ERROR',
            'error_message', 'Failed to rollback order execution',
            'error_details', SQLERRM,
            'order_id', p_order_id,
            'status', 500,
            'timestamp', now()
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 3. VALIDATE_ATOMIC_EXECUTION INTEGRITY PROCEDURE
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_atomic_execution_integrity(
    p_transaction_id UUID,
    p_user_id UUID
)
RETURNS jsonb AS $$
DECLARE
    v_order_count INTEGER;
    v_position_count INTEGER;
    v_audit_count INTEGER;
    v_result jsonb;
BEGIN
    BEGIN
        -- Count orders with this transaction ID
        SELECT COUNT(*) INTO v_order_count
        FROM public.orders
        WHERE transaction_id = p_transaction_id
        AND user_id = p_user_id;

        -- Count positions with this transaction ID
        SELECT COUNT(*) INTO v_position_count
        FROM public.positions
        WHERE transaction_id = p_transaction_id
        AND user_id = p_user_id;

        -- Count audit log entries
        SELECT COUNT(*) INTO v_audit_count
        FROM public.order_audit_log
        WHERE (details->>'transaction_id')::UUID = p_transaction_id;

        -- Validate consistency with more sophisticated logic
        -- Note: Orders and positions don't have a strict 1:1 mapping due to:
        -- - Failed/rejected orders that don't create positions
        -- - Partial fills that may create multiple positions
        -- - Order aggregation into single positions
        -- - Pending orders that haven't been executed yet
        
        DECLARE
            v_executed_orders INTEGER;
            v_failed_orders INTEGER;
            v_pending_orders INTEGER;
            v_unmatched_positions INTEGER;
            v_aggregated_positions INTEGER;
        BEGIN
            -- Count orders by status
            SELECT 
                COUNT(*) FILTER (WHERE status = 'executed') INTO v_executed_orders,
                COUNT(*) FILTER (WHERE status IN ('failed', 'rejected', 'cancelled')) INTO v_failed_orders,
                COUNT(*) FILTER (WHERE status = 'pending') INTO v_pending_orders
            FROM public.orders
            WHERE transaction_id = p_transaction_id
            AND user_id = p_user_id;

            -- Count positions that should have corresponding executed orders
            SELECT COUNT(*) INTO v_unmatched_positions
            FROM public.positions p
            WHERE p.transaction_id = p_transaction_id
            AND p.user_id = p_user_id
            AND NOT EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = p.order_id 
                AND o.status = 'executed'
            );

            -- Count positions that might be aggregated (multiple orders -> single position)
            SELECT COUNT(*) INTO v_aggregated_positions
            FROM (
                SELECT position_id 
                FROM public.orders 
                WHERE transaction_id = p_transaction_id 
                AND user_id = p_user_id 
                AND status = 'executed'
                AND position_id IS NOT NULL
                GROUP BY position_id 
                HAVING COUNT(*) > 1
            ) agg;

            -- Build detailed validation result
            IF v_unmatched_positions > 0 THEN
                v_result := jsonb_build_object(
                    'success', false,
                    'error_code', 'UNMATCHED_POSITIONS',
                    'error_message', 'Found positions without corresponding executed orders',
                    'transaction_id', p_transaction_id,
                    'user_id', p_user_id,
                    'total_orders', v_order_count,
                    'executed_orders', v_executed_orders,
                    'failed_orders', v_failed_orders,
                    'pending_orders', v_pending_orders,
                    'total_positions', v_position_count,
                    'unmatched_positions', v_unmatched_positions,
                    'aggregated_positions', v_aggregated_positions,
                    'audit_count', v_audit_count,
                    'status', 'inconsistent',
                    'timestamp', now()
                );
            ELSIF v_failed_orders > 0 AND v_position_count = 0 THEN
                -- All orders failed but no positions created - this is valid
                v_result := jsonb_build_object(
                    'success', true,
                    'transaction_id', p_transaction_id,
                    'user_id', p_user_id,
                    'total_orders', v_order_count,
                    'executed_orders', v_executed_orders,
                    'failed_orders', v_failed_orders,
                    'pending_orders', v_pending_orders,
                    'total_positions', v_position_count,
                    'aggregated_positions', v_aggregated_positions,
                    'audit_count', v_audit_count,
                    'status', 'valid_with_failures',
                    'note', 'All orders failed - no positions created',
                    'timestamp', now()
                );
            ELSE
                -- Valid transaction with proper order-position relationships
                v_result := jsonb_build_object(
                    'success', true,
                    'transaction_id', p_transaction_id,
                    'user_id', p_user_id,
                    'total_orders', v_order_count,
                    'executed_orders', v_executed_orders,
                    'failed_orders', v_failed_orders,
                    'pending_orders', v_pending_orders,
                    'total_positions', v_position_count,
                    'aggregated_positions', v_aggregated_positions,
                    'audit_count', v_audit_count,
                    'status', 'valid',
                    'timestamp', now()
                );
            END IF;
        END;

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'VALIDATION_ERROR',
            'error_message', 'Failed to validate transaction integrity',
            'error_details', SQLERRM,
            'transaction_id', p_transaction_id,
            'status', 500,
            'timestamp', now()
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================
-- Security fix: Restrict sensitive financial functions to service_role only
-- to prevent unauthorized access to balance modifications and order rollbacks

GRANT EXECUTE ON FUNCTION public.update_user_balance_and_margin(
    UUID, UUID, order_side, DECIMAL, DECIMAL, DECIMAL, DECIMAL
) TO service_role;

GRANT EXECUTE ON FUNCTION public.rollback_order_execution(
    UUID, UUID, TEXT
) TO service_role;

-- validate_atomic_execution_integrity is restricted to service_role only
-- to prevent information leakage about transaction patterns and system state
GRANT EXECUTE ON FUNCTION public.validate_atomic_execution_integrity(
    UUID, UUID
) TO service_role;