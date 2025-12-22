-- Update orders table schema to support atomic execution with rollback mechanisms
-- This migration adds missing columns and constraints required by the stored procedures

-- ============================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transaction_id UUID,
ADD COLUMN IF NOT EXISTS rolled_back_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.positions(id),
ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 2. ADD CONSTRAINTS AND CHECKS
-- ============================================

-- Add unique constraint on idempotency_key per user
-- This prevents duplicate orders with the same idempotency key
ALTER TABLE public.orders 
ADD CONSTRAINT IF NOT EXISTS unique_user_idempotency_key 
UNIQUE (user_id, idempotency_key);

-- Add check constraint for valid statuses
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'executing', 'executed', 'failed', 'cancelled', 'filled'));

-- ============================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Index on transaction_id for rollback operations
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);

-- Index on idempotency_key for duplicate detection
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);

-- Index on position_id for joins
CREATE INDEX IF NOT EXISTS idx_orders_position_id ON public.orders(position_id);

-- Index on rolled_back_at for audit queries
CREATE INDEX IF NOT EXISTS idx_orders_rolled_back_at ON public.orders(rolled_back_at);

-- ============================================
-- 4. UPDATE POSITIONS TABLE SCHEMA
-- ============================================

ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS transaction_id UUID,
ADD COLUMN IF NOT EXISTS commission_paid DECIMAL(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS take_profit DECIMAL(20,8);

-- Add indexes for positions
CREATE INDEX IF NOT EXISTS idx_positions_transaction_id ON public.positions(transaction_id);

-- ============================================
-- 5. ADD SAMPLE DATA FOR TESTING
-- ============================================

-- Add a test idempotency key constraint to prevent duplicates
-- This will be used to test the atomic execution integrity

-- Create a function to validate order data consistency
CREATE OR REPLACE FUNCTION public.validate_order_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that executed orders have execution_price
    IF NEW.status IN ('executed', 'filled') AND NEW.execution_price IS NULL THEN
        RAISE EXCEPTION 'Executed orders must have execution_price';
    END IF;

    -- Validate that failed orders have failure_reason
    IF NEW.status = 'failed' AND NEW.failure_reason IS NULL THEN
        NEW.failure_reason := 'No reason specified';
    END IF;

    -- Validate idempotency_key is present only on INSERT operations
    -- This allows existing rows with NULL idempotency_key to remain untouched
    -- while enforcing the constraint for new orders going forward
    IF TG_OP = 'INSERT' AND (NEW.idempotency_key IS NULL OR NEW.idempotency_key = '') THEN
        RAISE EXCEPTION 'Orders must have a non-empty idempotency_key';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order consistency
DROP TRIGGER IF EXISTS trigger_validate_order_consistency ON public.orders;
CREATE TRIGGER trigger_validate_order_consistency
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_consistency();

-- ============================================
-- 6. CREATE HELPER FUNCTIONS FOR TESTING
-- ============================================
CREATE OR REPLACE FUNCTION public.simulate_order_failure(
    p_order_id UUID,
    p_failure_reason TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS jsonb AS $
DECLARE
    v_result jsonb;
    v_order_user_id UUID;
BEGIN
    -- Verify the caller owns this order
    SELECT user_id INTO v_order_user_id FROM public.orders WHERE id = p_order_id;
    
    IF v_order_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;
    
    IF v_order_user_id != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Mark order as failed
    UPDATE public.orders SET
        status = 'failed',
        failure_reason = p_failure_reason,
        updated_at = now()
    WHERE id = p_order_id;

CREATE OR REPLACE FUNCTION public.get_order_execution_stats(
    p_user_id UUID DEFAULT auth.uid(),
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS jsonb AS $
DECLARE
    v_result jsonb;
    v_total_orders INTEGER;
    v_successful_orders INTEGER;
    v_failed_orders INTEGER;
    v_pending_orders INTEGER;
    v_total_commission DECIMAL;
    v_total_volume DECIMAL;
BEGIN
    -- Require a user_id to prevent querying all users' data
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'user_id is required'
        );
    END IF;

    -- Build dynamic query based on filters
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('executed', 'filled') THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status IN ('pending', 'executing') THEN 1 END) as pending,
        COALESCE(SUM(CASE WHEN status IN ('executed', 'filled') THEN commission ELSE 0 END), 0) as total_commission,
        COALESCE(SUM(CASE WHEN status IN ('executed', 'filled') THEN quantity * execution_price ELSE 0 END), 0) as total_volume
    INTO v_total_orders, v_successful_orders, v_failed_orders, v_pending_orders, v_total_commission, v_total_volume
    FROM public.orders
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_date_from IS NULL OR created_at::DATE >= p_date_from)
    AND (p_date_to IS NULL OR created_at::DATE <= p_date_to);
BEGIN
    -- Build dynamic query based on filters
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('executed', 'filled') THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status IN ('pending', 'executing') THEN 1 END) as pending,
        COALESCE(SUM(CASE WHEN status IN ('executed', 'filled') THEN commission ELSE 0 END), 0) as total_commission,
        COALESCE(SUM(CASE WHEN status IN ('executed', 'filled') THEN quantity * execution_price ELSE 0 END), 0) as total_volume
    INTO v_total_orders, v_successful_orders, v_failed_orders, v_pending_orders, v_total_commission, v_total_volume
    FROM public.orders
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_date_from IS NULL OR created_at::DATE >= p_date_from)
    AND (p_date_to IS NULL OR created_at::DATE <= p_date_to);

    v_result := jsonb_build_object(
        'total_orders', v_total_orders,
        'successful_orders', v_successful_orders,
        'failed_orders', v_failed_orders,
        'pending_orders', v_pending_orders,
        'success_rate', CASE 
            WHEN v_total_orders > 0 THEN 
                ROUND((v_successful_orders::DECIMAL / v_total_orders::DECIMAL) * 100, 2)
            ELSE 0 
        END,
        'total_commission', v_total_commission,
        'total_volume', v_total_volume,
        'average_order_size', CASE 
            WHEN v_successful_orders > 0 THEN 
                ROUND(v_total_volume / v_successful_orders, 2)
            ELSE 0 
        END,
        'filters', jsonb_build_object(
            'user_id', p_user_id,
            'date_from', p_date_from,
            'date_to', p_date_to
        ),
        'timestamp', now()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.positions TO authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_order_failure(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON function public.get_order_execution_stats(UUID, DATE, DATE) TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.positions TO service_role;
GRANT EXECUTE ON FUNCTION public.simulate_order_failure(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_order_execution_stats(UUID, DATE, DATE) TO service_role;