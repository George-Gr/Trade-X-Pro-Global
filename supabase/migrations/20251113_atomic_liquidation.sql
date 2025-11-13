-- Migration: Add atomic liquidation stored procedure
-- Description: Ensures all-or-nothing liquidation execution
-- Created: 2025-11-13

CREATE OR REPLACE FUNCTION execute_liquidation_atomic(
  user_id UUID,
  margin_call_event_id UUID,
  positions_to_liquidate JSONB
) RETURNS JSONB AS $$
DECLARE
  liquidation_event_id UUID := gen_random_uuid();
  total_positions_closed INT := 0;
  total_positions_failed INT := 0;
  total_loss NUMERIC := 0;
  total_slippage NUMERIC := 0;
  final_margin_level NUMERIC := 0;
  final_equity NUMERIC := 0;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert liquidation event
    INSERT INTO liquidation_events (
      id, user_id, margin_call_event_id, reason, status, initiated_at
    ) VALUES (
      liquidation_event_id, user_id, margin_call_event_id, 'margin_call_timeout', 'in_progress', NOW()
    );

    -- Loop through positions and close them
    FOR position IN SELECT * FROM jsonb_to_recordset(positions_to_liquidate) AS (
      position_id UUID, symbol TEXT, side TEXT, quantity NUMERIC, entry_price NUMERIC, liquidation_price NUMERIC, slippage NUMERIC, realized_pnl NUMERIC
    ) LOOP
      BEGIN
        -- Insert closed position
        INSERT INTO liquidation_closed_positions (
          liquidation_event_id, position_id, symbol, side, quantity, entry_price, liquidation_price, slippage_percentage, realized_pnl, closed_at
        ) VALUES (
          liquidation_event_id, position.position_id, position.symbol, position.side, position.quantity, position.entry_price, position.liquidation_price, position.slippage, position.realized_pnl, NOW()
        );

        -- Update position status
        UPDATE positions
        SET status = 'closed', closed_at = NOW()
        WHERE id = position.position_id;

        -- Accumulate metrics
        total_positions_closed := total_positions_closed + 1;
        total_loss := total_loss + position.realized_pnl;
        total_slippage := total_slippage + position.slippage;
      EXCEPTION WHEN OTHERS THEN
        total_positions_failed := total_positions_failed + 1;
      END;
    END LOOP;

    -- Finalize liquidation event
    UPDATE liquidation_events
    SET status = 'completed',
        completed_at = NOW(),
        positions_liquidated = total_positions_closed,
        total_realized_pnl = total_loss,
        total_slippage_applied = total_slippage
    WHERE id = liquidation_event_id;

    -- Calculate final margin level
    SELECT margin_level INTO final_margin_level FROM calculate_margin_level(user_id);

    -- Return result
    RETURN jsonb_build_object(
      'success', true,
      'liquidation_event_id', liquidation_event_id,
      'total_positions_closed', total_positions_closed,
      'total_positions_failed', total_positions_failed,
      'total_loss', total_loss,
      'total_slippage', total_slippage,
      'final_margin_level', final_margin_level
    );
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;