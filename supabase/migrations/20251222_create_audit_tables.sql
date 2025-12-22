-- Create supporting audit tables for order execution integrity
-- This migration creates the essential audit tables that the stored procedures depend on

-- ============================================
-- 1. BALANCE_AUDIT_LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.balance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    action_type transaction_type NOT NULL,
    old_balance DECIMAL(20,2),
    new_balance DECIMAL(20,2),
    old_margin_used DECIMAL(20,2),
    new_margin_used DECIMAL(20,2),
    old_equity DECIMAL(20,2),
    new_equity DECIMAL(20,2),
    transaction_amount DECIMAL(20,2),
    margin_change DECIMAL(20,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT balance_audit_log_balance_check CHECK (
        old_balance IS NULL OR new_balance IS NULL OR 
        (old_balance >= 0 AND new_balance >= 0)
    ),
    CONSTRAINT balance_audit_log_margin_check CHECK (
        old_margin_used IS NULL OR new_margin_used IS NULL OR 
        (old_margin_used >= 0 AND new_margin_used >= 0)
    ),
    CONSTRAINT balance_audit_log_equity_check CHECK (
        old_equity IS NULL OR new_equity IS NULL OR 
        (old_equity >= 0 AND new_equity >= 0)
    )
);

-- ============================================
-- 2. ERROR_LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.error_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    context TEXT,
    user_id UUID REFERENCES public.profiles(id),
    order_id UUID REFERENCES public.orders(id),
    severity TEXT DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Balance audit log indexes
CREATE INDEX IF NOT EXISTS idx_balance_audit_log_user_id ON public.balance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_audit_log_order_id ON public.balance_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_balance_audit_log_created_at ON public.balance_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_balance_audit_log_action_type ON public.balance_audit_log(action_type);

-- Error log indexes
CREATE INDEX IF NOT EXISTS idx_error_log_error_type ON public.error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_user_id ON public.error_log(user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_order_id ON public.error_log(order_id);
CREATE INDEX IF NOT EXISTS idx_error_log_severity ON public.error_log(severity);
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON public.error_log(created_at);
CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON public.error_log(resolved);

-- ============================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on audit tables
ALTER TABLE public.balance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Balance audit log policies
CREATE POLICY "Users can view their own balance audit logs" ON public.balance_audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage balance audit logs" ON public.balance_audit_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Error log policies
CREATE POLICY "Users can view their own error logs" ON public.error_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage error logs" ON public.error_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 5. TRIGGERS FOR AUTOMATIC AUDIT
-- ============================================

-- Function to log balance changes automatically
CREATE OR REPLACE FUNCTION public.log_balance_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log balance changes when profiles table is updated
    IF OLD.balance IS DISTINCT FROM NEW.balance OR 
       OLD.margin_used IS DISTINCT FROM NEW.margin_used OR 
       OLD.equity IS DISTINCT FROM NEW.equity THEN
        
        INSERT INTO public.balance_audit_log (
            user_id,
            action_type,
            old_balance,
            new_balance,
            old_margin_used,
            new_margin_used,
            old_equity,
            new_equity,
            transaction_amount,
            margin_change,
            created_by
        ) VALUES (
            NEW.id,
            'adjustment',
            OLD.balance,
            NEW.balance,
            OLD.margin_used,
            NEW.margin_used,
            OLD.equity,
            NEW.equity,
            NEW.balance - OLD.balance,
            NEW.margin_used - OLD.margin_used,
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic balance audit logging
DROP TRIGGER IF EXISTS trigger_log_balance_changes ON public.profiles;
CREATE TRIGGER trigger_log_balance_changes
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_balance_changes();

-- ============================================
-- 6. VIEWS FOR REPORTING AND MONITORING
-- ============================================

-- View for transaction summary
CREATE OR REPLACE VIEW public.transaction_summary AS
SELECT 
    o.id as order_id,
    o.user_id,
    o.symbol,
    o.side,
    o.quantity,
    o.status,
    o.execution_price,
    o.commission,
    o.total_cost,
    o.transaction_id,
    o.created_at,
    p.id as position_id,
    bal.old_balance,
    bal.new_balance,
    bal.transaction_amount as balance_change
FROM public.orders o
LEFT JOIN public.positions p ON o.id = p.order_id
LEFT JOIN public.balance_audit_log bal ON o.id = bal.order_id 
    AND bal.action_type = 'order_execution'
WHERE bal.created_at = (
    SELECT MAX(created_at) 
    FROM public.balance_audit_log 
    WHERE order_id = o.id
);

-- View for error monitoring
CREATE OR REPLACE VIEW public.error_monitoring AS
SELECT 
    error_type,
    severity,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurrence,
    COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_count
FROM public.error_log
GROUP BY error_type, severity
ORDER BY error_count DESC;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.balance_audit_log TO authenticated;
GRANT SELECT ON public.error_log TO authenticated;
GRANT SELECT ON public.transaction_summary TO authenticated;
GRANT SELECT ON public.error_monitoring TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.balance_audit_log TO service_role;
GRANT ALL ON public.error_log TO service_role;
GRANT SELECT ON public.transaction_summary TO service_role;
GRANT SELECT ON public.error_monitoring TO service_role;