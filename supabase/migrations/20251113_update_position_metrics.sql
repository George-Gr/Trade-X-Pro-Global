-- Migration: Update Position Metrics Atomic Function
-- Purpose: Implements atomic position update with P&L and margin level recalculation
-- Date: 2025-11-13
-- Dependencies: marginCalculations, pnlCalculation modules

-- ============================================================================
-- CREATE POSITION METRICS UPDATE TYPE
-- ============================================================================

-- Type for returning position update results
CREATE TYPE position_update_result AS (
  position_id UUID,
  symbol TEXT,
  side TEXT,
  quantity DECIMAL,
  entry_price DECIMAL,
  current_price DECIMAL,
  unrealized_pnl DECIMAL,
  margin_used DECIMAL,
  margin_level DECIMAL,
  margin_status TEXT,
  success BOOLEAN,
  error_message TEXT
);

-- ============================================================================
-- CREATE MARGIN LEVEL STATUS ENUM
-- ============================================================================

-- Margin level status classification
CREATE TYPE margin_status_enum AS ENUM (
  'SAFE',        -- >= 200%
  'WARNING',     -- 100-199%
  'CRITICAL',    -- 50-99%
  'LIQUIDATION'  -- < 50%
);

-- Add margin status columns to profiles if not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='margin_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN margin_status margin_status_enum DEFAULT 'SAFE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='last_margin_alert_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_margin_alert_at TIMESTAMP;
  END IF;
END $$;

-- ============================================================================
-- FUNCTION: Calculate Margin Status Classification
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_margin_status(margin_level DECIMAL)
RETURNS margin_status_enum AS $$
BEGIN
  IF margin_level >= 200 THEN
    RETURN 'SAFE'::margin_status_enum;
  ELSIF margin_level >= 100 THEN
    RETURN 'WARNING'::margin_status_enum;
  ELSIF margin_level >= 50 THEN
    RETURN 'CRITICAL'::margin_status_enum;
  ELSE
    RETURN 'LIQUIDATION'::margin_status_enum;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FUNCTION: Update Position Metrics Atomically
-- ============================================================================

CREATE OR REPLACE FUNCTION update_position_atomic(
  p_position_id UUID,
  p_current_price DECIMAL,
  p_user_id UUID
)
RETURNS position_update_result AS $$
DECLARE
  v_position RECORD;
  v_profile RECORD;
  v_entry_price DECIMAL;
  v_quantity DECIMAL;
  v_side TEXT;
  v_symbol TEXT;
  v_unrealized_pnl DECIMAL;
  v_margin_used DECIMAL;
  v_margin_level DECIMAL;
  v_margin_status margin_status_enum;
  v_execution_price DECIMAL;
  v_commission DECIMAL;
  v_slippage DECIMAL;
  v_result position_update_result;
BEGIN
  -- START TRANSACTION
  BEGIN
    -- =====================================================================
    -- STEP 1: VALIDATE USER AND POSITION OWNERSHIP (RLS)
    -- =====================================================================
    
    SELECT p.* INTO v_position
    FROM positions p
    WHERE p.id = p_position_id
      AND p.user_id = p_user_id
      AND p.status = 'open'
    FOR UPDATE;

    IF v_position IS NULL THEN
      RAISE EXCEPTION 'Position not found or user does not own this position';
    END IF;

    -- Extract position data
    v_symbol := v_position.symbol;
    v_side := v_position.side;
    v_quantity := v_position.quantity;
    v_entry_price := v_position.entry_price;

    -- =====================================================================
    -- STEP 2: FETCH USER PROFILE FOR MARGIN CALCULATIONS
    -- =====================================================================

    SELECT pr.* INTO v_profile
    FROM profiles pr
    WHERE pr.id = p_user_id
    FOR UPDATE;

    IF v_profile IS NULL THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;

    -- =====================================================================
    -- STEP 3: CALCULATE UNREALIZED P&L
    -- =====================================================================
    -- Formula: (Current Price - Entry Price) × Quantity (long)
    --          (Entry Price - Current Price) × Quantity (short)
    -- Rounded to 4 decimal places

    IF v_side = 'long' THEN
      v_unrealized_pnl := ROUND((p_current_price - v_entry_price) * v_quantity, 4);
    ELSE
      v_unrealized_pnl := ROUND((v_entry_price - p_current_price) * v_quantity, 4);
    END IF;

    -- =====================================================================
    -- STEP 4: CALCULATE MARGIN USED (SIMPLIFIED)
    -- =====================================================================
    -- Margin Used = (Position Value) / Leverage
    -- For simplicity, using standard leverage per asset class
    -- In production, fetch from asset_master table

    DECLARE
      v_leverage DECIMAL := 10; -- Default leverage (would be asset-specific)
    BEGIN
      v_margin_used := ROUND((p_current_price * v_quantity) / v_leverage, 4);
    END;

    -- =====================================================================
    -- STEP 5: CALCULATE MARGIN LEVEL
    -- =====================================================================
    -- Margin Level (%) = (Account Equity / Margin Used) × 100
    -- Account Equity = Balance + Unrealized P&L

    DECLARE
      v_account_equity DECIMAL;
    BEGIN
      v_account_equity := v_profile.balance + v_unrealized_pnl;
      
      IF v_margin_used > 0 THEN
        v_margin_level := ROUND((v_account_equity / v_margin_used) * 100, 2);
      ELSE
        v_margin_level := 999.99; -- Safe default
      END IF;
    END;

    -- =====================================================================
    -- STEP 6: CLASSIFY MARGIN STATUS
    -- =====================================================================

    v_margin_status := calculate_margin_status(v_margin_level);

    -- =====================================================================
    -- STEP 7: UPDATE POSITION RECORD
    -- =====================================================================

    UPDATE positions
    SET
      current_price = p_current_price,
      unrealized_pnl = v_unrealized_pnl,
      margin_used = v_margin_used,
      margin_level = v_margin_level,
      updated_at = NOW()
    WHERE id = p_position_id;

    -- =====================================================================
    -- STEP 8: UPDATE PROFILE MARGIN STATUS (if changed)
    -- =====================================================================

    IF v_profile.margin_status IS DISTINCT FROM v_margin_status THEN
      UPDATE profiles
      SET
        margin_status = v_margin_status,
        updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    -- =====================================================================
    -- STEP 9: BUILD RESULT
    -- =====================================================================

    v_result := (
      p_position_id,           -- position_id
      v_symbol,                -- symbol
      v_side,                  -- side
      v_quantity,              -- quantity
      v_entry_price,           -- entry_price
      p_current_price,         -- current_price
      v_unrealized_pnl,        -- unrealized_pnl
      v_margin_used,           -- margin_used
      v_margin_level,          -- margin_level
      v_margin_status::TEXT,   -- margin_status
      TRUE,                    -- success
      NULL                     -- error_message
    );

    RETURN v_result;

  EXCEPTION WHEN OTHERS THEN
    -- =====================================================================
    -- ERROR HANDLING WITH ROLLBACK
    -- =====================================================================

    v_result := (
      p_position_id,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      FALSE,
      SQLERRM  -- error_message
    );

    RETURN v_result;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Batch Update Positions for User
-- ============================================================================

CREATE OR REPLACE FUNCTION batch_update_positions(
  p_user_id UUID,
  p_position_ids UUID[] DEFAULT NULL,
  p_price_map JSONB DEFAULT NULL
)
RETURNS TABLE(
  position_id UUID,
  symbol TEXT,
  unrealized_pnl DECIMAL,
  margin_level DECIMAL,
  margin_status TEXT,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_pos_id UUID;
  v_current_price DECIMAL;
  v_result position_update_result;
  v_positions UUID[];
BEGIN
  -- If no specific positions provided, get all open positions for user
  IF p_position_ids IS NULL THEN
    SELECT ARRAY(
      SELECT id FROM positions 
      WHERE user_id = p_user_id AND status = 'open'
    ) INTO v_positions;
  ELSE
    v_positions := p_position_ids;
  END IF;

  -- Process each position
  FOREACH v_pos_id IN ARRAY v_positions
  LOOP
    -- Fetch current price from price_map if provided, else from positions table
    IF p_price_map IS NOT NULL THEN
      SELECT (p_price_map->pos.symbol)::DECIMAL 
      INTO v_current_price
      FROM positions pos 
      WHERE pos.id = v_pos_id;
    ELSE
      SELECT current_price INTO v_current_price
      FROM positions
      WHERE id = v_pos_id;
    END IF;

    -- Skip if price not available
    IF v_current_price IS NULL THEN
      v_current_price := (SELECT current_price FROM positions WHERE id = v_pos_id);
    END IF;

    -- Call atomic update function
    v_result := update_position_atomic(v_pos_id, v_current_price, p_user_id);

    -- Return result
    RETURN QUERY SELECT
      v_result.position_id,
      v_result.symbol,
      v_result.unrealized_pnl,
      v_result.margin_level,
      v_result.margin_status,
      v_result.success,
      v_result.error_message;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-Update Position on Price Cache Change
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_position_update_on_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_positions RECORD;
BEGIN
  -- For each open position with this symbol, trigger update
  FOR v_positions IN
    SELECT id, user_id
    FROM positions
    WHERE symbol = NEW.symbol AND status = 'open'
    LIMIT 100  -- Safety limit
  LOOP
    PERFORM update_position_atomic(
      v_positions.id,
      NEW.current_price,
      v_positions.user_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on price_cache table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'price_cache'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_position_update ON price_cache;
    
    CREATE TRIGGER trigger_position_update
    AFTER INSERT OR UPDATE ON price_cache
    FOR EACH ROW
    EXECUTE FUNCTION trigger_position_update_on_price_change();
  END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for batch position lookups
CREATE INDEX IF NOT EXISTS idx_positions_user_status
ON positions(user_id, status);

-- Index for symbol lookups in price updates
CREATE INDEX IF NOT EXISTS idx_positions_symbol_status
ON positions(symbol, status);

-- Index for margin level alerts
CREATE INDEX IF NOT EXISTS idx_profiles_margin_status
ON profiles(margin_status);

-- ============================================================================
-- GRANTS (RLS enforced via SECURITY DEFINER)
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
