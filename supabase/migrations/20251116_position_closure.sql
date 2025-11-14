-- ============================================================================
-- Position Closure Automation Schema
-- ============================================================================
-- Supports automated position closure via multiple triggers:
-- - Take-Profit, Stop-Loss, Trailing Stop, Time-Based Expiry
-- - Manual user closure with partial close support
-- - Force closure (margin calls, liquidation, admin)
-- All closures are atomic via stored procedure for consistency
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE closure_reason AS ENUM (
  'take_profit',
  'stop_loss',
  'trailing_stop',
  'time_expiry',
  'manual_user',
  'margin_call',
  'liquidation',
  'admin_forced'
);

CREATE TYPE closure_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'partial',
  'failed',
  'cancelled'
);

-- ============================================================================
-- POSITION CLOSURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS position_closures (
  -- Identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Closure Details
  reason closure_reason NOT NULL,
  status closure_status NOT NULL DEFAULT 'pending',

  -- Pricing
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8) NOT NULL,
  quantity NUMERIC NOT NULL,
  partial_quantity NUMERIC,

  -- P&L Calculations
  realized_pnl DECIMAL(20, 8) NOT NULL,
  pnl_percentage DECIMAL(10, 4) NOT NULL,

  -- Costs
  commission DECIMAL(20, 8) NOT NULL DEFAULT 0,
  slippage DECIMAL(20, 8) NOT NULL DEFAULT 0,

  -- Timing
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  hold_duration_seconds INTEGER,

  -- Metadata
  notes TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_entry_price CHECK (entry_price > 0),
  CONSTRAINT valid_exit_price CHECK (exit_price > 0),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_commission CHECK (commission >= 0),
  CONSTRAINT valid_slippage CHECK (slippage >= 0),
  CONSTRAINT valid_partial_quantity CHECK (partial_quantity IS NULL OR partial_quantity > 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User's closures (daily review, history)
CREATE INDEX idx_position_closures_user_id_created
  ON position_closures(user_id, created_at DESC);

-- Position's closures (position detail view)
CREATE INDEX idx_position_closures_position_id
  ON position_closures(position_id);

-- Closure status (pending processing, monitoring)
CREATE INDEX idx_position_closures_status
  ON position_closures(status)
  WHERE status IN ('pending', 'in_progress');

-- Closure reason (analytics: trigger distribution)
CREATE INDEX idx_position_closures_reason
  ON position_closures(reason, created_at DESC);

-- Recent completed closures (performance tracking)
CREATE INDEX idx_position_closures_completed
  ON position_closures(completed_at DESC)
  WHERE status = 'completed';

-- P&L analysis (profitability, performance metrics)
CREATE INDEX idx_position_closures_pnl
  ON position_closures(realized_pnl, pnl_percentage)
  WHERE status = 'completed';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE position_closures ENABLE ROW LEVEL SECURITY;

-- Users can only view their own closures
CREATE POLICY position_closures_select_policy
  ON position_closures
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert closures for their positions
CREATE POLICY position_closures_insert_policy
  ON position_closures
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only Edge Functions (via service role) can update status
-- Regular users cannot modify closures after creation
CREATE POLICY position_closures_update_service_role
  ON position_closures
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Users cannot delete their closures (audit trail preservation)
CREATE POLICY position_closures_delete_none
  ON position_closures
  FOR DELETE
  USING (FALSE);

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

-- Update updated_at on row modification
CREATE OR REPLACE FUNCTION update_position_closures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER position_closures_update_timestamp
  BEFORE UPDATE ON position_closures
  FOR EACH ROW
  EXECUTE FUNCTION update_position_closures_updated_at();

-- ============================================================================
-- STORED PROCEDURES FOR ATOMIC OPERATIONS
-- ============================================================================

/**
 * Execute position closure atomically
 * Validates preconditions, creates closure record, updates position status
 * All operations in single transaction - either all succeed or all rollback
 */
CREATE OR REPLACE FUNCTION execute_position_closure(
  p_position_id UUID,
  p_user_id UUID,
  p_reason closure_reason,
  p_entry_price DECIMAL,
  p_exit_price DECIMAL,
  p_quantity NUMERIC,
  p_partial_quantity NUMERIC DEFAULT NULL,
  p_realized_pnl DECIMAL DEFAULT 0,
  p_pnl_percentage DECIMAL DEFAULT 0,
  p_commission DECIMAL DEFAULT 0,
  p_slippage DECIMAL DEFAULT 0
)
RETURNS TABLE (
  success BOOLEAN,
  closure_id UUID,
  message TEXT,
  error TEXT
) AS $$
DECLARE
  v_closure_id UUID;
  v_position_quantity NUMERIC;
  v_position_status TEXT;
  v_remaining_quantity NUMERIC;
BEGIN
  -- Validate position exists and belongs to user
  SELECT quantity, status INTO v_position_quantity, v_position_status
  FROM positions
  WHERE id = p_position_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Position not found';
    RETURN;
  END IF;

  IF v_position_status != 'open' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Position is not open';
    RETURN;
  END IF;

  -- Validate closure quantity
  IF p_quantity <= 0 OR p_quantity > v_position_quantity THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Invalid closure quantity';
    RETURN;
  END IF;

  -- Begin atomic transaction
  BEGIN
    -- Create closure record
    INSERT INTO position_closures (
      position_id,
      user_id,
      reason,
      status,
      entry_price,
      exit_price,
      quantity,
      partial_quantity,
      realized_pnl,
      pnl_percentage,
      commission,
      slippage,
      hold_duration_seconds
    ) VALUES (
      p_position_id,
      p_user_id,
      p_reason,
      CASE
        WHEN p_partial_quantity IS NOT NULL AND p_partial_quantity < v_position_quantity
        THEN 'partial'::closure_status
        ELSE 'completed'::closure_status
      END,
      p_entry_price,
      p_exit_price,
      p_quantity,
      p_partial_quantity,
      p_realized_pnl,
      p_pnl_percentage,
      p_commission,
      p_slippage,
      EXTRACT(EPOCH FROM (NOW() - (
        SELECT created_at FROM positions WHERE id = p_position_id
      )))::INTEGER
    ) RETURNING id INTO v_closure_id;

    -- Update position status and quantity
    v_remaining_quantity := v_position_quantity - p_quantity;

    IF v_remaining_quantity <= 0 THEN
      -- Full closure: mark position as closed
      UPDATE positions
      SET status = 'closed', quantity = 0, updated_at = NOW()
      WHERE id = p_position_id;
    ELSE
      -- Partial closure: update remaining quantity
      UPDATE positions
      SET quantity = v_remaining_quantity, updated_at = NOW()
      WHERE id = p_position_id;
    END IF;

    RETURN QUERY SELECT
      true,
      v_closure_id,
      'Position closure executed successfully',
      NULL::TEXT;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      NULL::TEXT,
      SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

/**
 * Get position closure history with aggregated metrics
 */
CREATE OR REPLACE FUNCTION get_position_closure_history(
  p_user_id UUID,
  p_position_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  closure_id UUID,
  position_id UUID,
  reason closure_reason,
  status closure_status,
  entry_price DECIMAL,
  exit_price DECIMAL,
  quantity NUMERIC,
  realized_pnl DECIMAL,
  pnl_percentage DECIMAL,
  commission DECIMAL,
  slippage DECIMAL,
  hold_duration_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.position_id,
    pc.reason,
    pc.status,
    pc.entry_price,
    pc.exit_price,
    pc.quantity,
    pc.realized_pnl,
    pc.pnl_percentage,
    pc.commission,
    pc.slippage,
    pc.hold_duration_seconds,
    pc.completed_at,
    pc.created_at
  FROM position_closures pc
  WHERE
    pc.user_id = p_user_id
    AND (p_position_id IS NULL OR pc.position_id = p_position_id)
  ORDER BY pc.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

/**
 * Calculate closure statistics for user
 */
CREATE OR REPLACE FUNCTION get_closure_statistics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_closures BIGINT,
  total_realized_pnl DECIMAL,
  total_commissions DECIMAL,
  total_slippage DECIMAL,
  win_count BIGINT,
  loss_count BIGINT,
  win_rate DECIMAL,
  avg_hold_duration_seconds NUMERIC,
  avg_pnl_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    SUM(COALESCE(realized_pnl, 0))::DECIMAL,
    SUM(COALESCE(commission, 0))::DECIMAL,
    SUM(COALESCE(slippage, 0))::DECIMAL,
    COUNT(*) FILTER (WHERE realized_pnl > 0)::BIGINT,
    COUNT(*) FILTER (WHERE realized_pnl < 0)::BIGINT,
    CASE
      WHEN COUNT(*) > 0
      THEN (COUNT(*) FILTER (WHERE realized_pnl > 0)::DECIMAL / COUNT(*)) * 100
      ELSE 0
    END::DECIMAL,
    AVG(COALESCE(hold_duration_seconds, 0))::NUMERIC,
    AVG(COALESCE(pnl_percentage, 0))::DECIMAL
  FROM position_closures
  WHERE
    user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Edge Functions can execute stored procedures
GRANT EXECUTE ON FUNCTION execute_position_closure(UUID, UUID, closure_reason, DECIMAL, DECIMAL, NUMERIC, NUMERIC, DECIMAL, DECIMAL, DECIMAL, DECIMAL)
  TO service_role;

GRANT EXECUTE ON FUNCTION get_position_closure_history(UUID, UUID, INTEGER)
  TO authenticated;

GRANT EXECUTE ON FUNCTION get_closure_statistics(UUID, INTEGER)
  TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE position_closures IS
  'Records of all position closure events. Supports automated triggers (take-profit, stop-loss, trailing stop, time expiry) and manual closures. Each record is immutable for audit trail.';

COMMENT ON COLUMN position_closures.reason IS
  'Why position was closed: take_profit, stop_loss, trailing_stop, time_expiry, manual_user, margin_call, liquidation, admin_forced';

COMMENT ON COLUMN position_closures.status IS
  'Current status: pending (awaiting execution), in_progress, completed (full close), partial, failed, cancelled';

COMMENT ON COLUMN position_closures.realized_pnl IS
  'Net profit/loss after closure, including commissions: (price_diff * quantity) - commission';

COMMENT ON COLUMN position_closures.hold_duration_seconds IS
  'Time position was held before closure (created_at to completed_at)';

COMMENT ON FUNCTION execute_position_closure IS
  'Atomically execute position closure: validate preconditions, create closure record, update position status. All-or-nothing transaction.';
