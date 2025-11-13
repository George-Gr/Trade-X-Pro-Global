/**
 * Execute Liquidation - Edge Function
 * 
 * TASK 1.3.2: Liquidation Execution Logic
 * Scheduled or event-triggered function that executes position liquidations
 * when margin call escalation reaches the liquidation threshold
 * 
 * Responsibilities:
 * - Process liquidation events from margin call detection
 * - Select and execute position closures atomically
 * - Update liquidation event status and results
 * - Send notifications to users
 * - Handle failures with recovery logic
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Import types and functions from Deno lib
import { 
  calculateLiquidationNeeded,
  selectPositionsForLiquidation,
  calculateLiquidationPrice,
  calculateRealizedPnL,
  validateLiquidationPreConditions,
  generateLiquidationNotification,
  calculateLiquidationMetrics,
  LiquidationReason,
  LiquidationStatus,
} from '../lib/liquidationEngine.ts';

/**
 * Type definitions for liquidation execution
 */
interface MarginCallEvent {
  id: string;
  userId: string;
  accountEquity: number;
  marginUsed: number;
  marginLevel: number;
  severity: 'WARNING' | 'CRITICAL' | 'LIQUIDATION_TRIGGER';
  triggeredAt: string;
}

interface UserPosition {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  marginRequired: number;
  notionalValue: number;
  leverage: number;
}

interface LiquidationResult {
  success: boolean;
  liquidationEventId: string;
  totalPositionsClosed: number;
  totalPositionsFailed: number;
  initialMarginLevel: number;
  finalMarginLevel: number;
  totalLossRealized: number;
  totalSlippageApplied: number;
  averageLiquidationPrice: number;
  executionTimeMs: number;
  closedPositions: Array<{
    positionId: string;
    symbol: string;
    closedAt: number;
    executionPrice: number;
    realizedPnL: number;
    slippage: number;
  }>;
  failedPositions: Array<{
    positionId: string;
    error: string;
  }>;
  message: string;
}

/**
 * Main handler - execute liquidation for a single user event
 */
async function executeLiquidationForEvent(
  supabaseClient: ReturnType<typeof createClient>,
  marginCallEvent: MarginCallEvent,
): Promise<LiquidationResult> {
  const startTime = performance.now();
  const liquidationEventId = crypto.randomUUID();

  try {
    // 1. Validate preconditions
    const preconditionCheck = validateLiquidationPreConditions(
      marginCallEvent.marginLevel,
      0, // Will check after fetching positions
      marginCallEvent.accountEquity,
    );

    if (!preconditionCheck.valid) {
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: 0,
        totalPositionsFailed: 0,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: marginCallEvent.marginLevel,
        totalLossRealized: 0,
        totalSlippageApplied: 0,
        averageLiquidationPrice: 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: [],
        failedPositions: [],
        message: `Precondition validation failed: ${preconditionCheck.issues.join(', ')}`,
      };
    }

    // 2. Fetch user's open positions
    const { data: positions, error: posError } = await supabaseClient
      .from('positions')
      .select('*')
      .eq('user_id', marginCallEvent.userId)
      .eq('status', 'open');

    if (posError) throw new Error(`Failed to fetch positions: ${posError.message}`);
    if (!positions || positions.length === 0) {
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: 0,
        totalPositionsFailed: 0,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: marginCallEvent.marginLevel,
        totalLossRealized: 0,
        totalSlippageApplied: 0,
        averageLiquidationPrice: 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: [],
        failedPositions: [],
        message: 'No open positions to liquidate',
      };
    }

    // 3. Calculate how much margin needs to be freed
    const liquidationNeeded = calculateLiquidationNeeded(
      marginCallEvent.accountEquity,
      marginCallEvent.marginUsed,
    );

    if (!liquidationNeeded.isNeeded) {
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: 0,
        totalPositionsFailed: 0,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: marginCallEvent.marginLevel,
        totalLossRealized: 0,
        totalSlippageApplied: 0,
        averageLiquidationPrice: 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: [],
        failedPositions: [],
        message: `Liquidation not needed: margin level ${liquidationNeeded.marginLevel.toFixed(2)}% >= 50%`,
      };
    }

    // 4. Select positions for liquidation (highest priority first)
    const selectedPositions = selectPositionsForLiquidation(
      positions as UserPosition[],
      liquidationNeeded.marginToFree,
    );

    if (selectedPositions.length === 0) {
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: 0,
        totalPositionsFailed: 0,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: marginCallEvent.marginLevel,
        totalLossRealized: 0,
        totalSlippageApplied: 0,
        averageLiquidationPrice: 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: [],
        failedPositions: [],
        message: 'Could not select positions for liquidation',
      };
    }

    // 5. Execute liquidation for each position
    const closedPositions = [];
    const failedPositions = [];
    let totalLoss = 0;
    let totalSlippage = 0;
    let currentMarginUsed = marginCallEvent.marginUsed;

    for (const position of selectedPositions) {
      try {
        // Get current market price and calculate execution price
        const { data: priceData, error: priceError } = await supabaseClient
          .from('market_data')
          .select('bid, ask')
          .eq('symbol', position.symbol)
          .single();

        if (priceError) throw new Error(`Market data unavailable for ${position.symbol}`);

        const bid = priceData.bid || position.currentPrice;
        const ask = priceData.ask || position.currentPrice;
        
        // Calculate slippage based on spread
        const spread = ask - bid;
        const midPrice = (bid + ask) / 2;
        const slippagePercent = (spread / midPrice) * 100 * 1.5; // 1.5x multiplier
        
        // Calculate execution price with slippage
        const executionPrice = calculateLiquidationPrice(
          position.currentPrice,
          position.side,
          slippagePercent,
        );

        // Calculate realized P&L
        const pnl = calculateRealizedPnL(
          position.side,
          position.quantity,
          position.entryPrice,
          executionPrice,
        );

        // Create closed position record
        const { error: closeError } = await supabaseClient
          .from('positions')
          .update({
            status: 'closed',
            closedAt: new Date().toISOString(),
            closedPrice: executionPrice,
            realizedPnL: pnl.amount,
          })
          .eq('id', position.id);

        if (closeError) throw new Error(`Failed to close position: ${closeError.message}`);

        // Record liquidation details
        closedPositions.push({
          positionId: position.id,
          symbol: position.symbol,
          closedAt: Date.now(),
          executionPrice,
          realizedPnL: pnl.amount,
          slippage: slippagePercent,
        });

        totalLoss += pnl.amount;
        totalSlippage += slippagePercent;
        currentMarginUsed -= position.marginRequired;

      } catch (error) {
        failedPositions.push({
          positionId: position.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Check if we've freed enough margin
      if (currentMarginUsed <= liquidationNeeded.targetMarginLevel) {
        break;
      }
    }

    // 6. Calculate final margin level
    const finalEquity = marginCallEvent.accountEquity + totalLoss;
    const finalMarginLevel = currentMarginUsed > 0 
      ? (finalEquity / currentMarginUsed) * 100 
      : Infinity;

    // 7. Create liquidation event record
    const { error: eventError } = await supabaseClient
      .from('liquidation_events')
      .insert({
        id: liquidationEventId,
        user_id: marginCallEvent.userId,
        margin_call_event_id: marginCallEvent.id,
        reason: 'margin_call_timeout',
        status: closedPositions.length > 0 ? 'completed' : 'failed',
        initiated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        initial_margin_level: marginCallEvent.marginLevel,
        final_margin_level: finalMarginLevel,
        initial_equity: marginCallEvent.accountEquity,
        final_equity: finalEquity,
        positions_liquidated: closedPositions.length,
        total_realized_pnl: totalLoss,
        total_slippage_applied: totalSlippage,
      });

    if (eventError && eventError.code !== 'PGRST116') { // Ignore duplicate errors
      throw new Error(`Failed to create liquidation event: ${eventError.message}`);
    }

    // 8. Record closed positions
    if (closedPositions.length > 0) {
      const { error: recordError } = await supabaseClient
        .from('liquidation_closed_positions')
        .insert(
          closedPositions.map(cp => ({
            liquidation_event_id: liquidationEventId,
            position_id: cp.positionId,
            symbol: cp.symbol,
            execution_price: cp.executionPrice,
            realized_pnl: cp.realizedPnL,
            slippage_percent: cp.slippage,
            closed_at: new Date(cp.closedAt).toISOString(),
          }))
        );

      if (recordError) {
        console.warn(`Failed to record closed positions: ${recordError.message}`);
      }
    }

    // 9. Record failed positions
    if (failedPositions.length > 0) {
      const { error: failError } = await supabaseClient
        .from('liquidation_failed_attempts')
        .insert(
          failedPositions.map(fp => ({
            liquidation_event_id: liquidationEventId,
            position_id: fp.positionId,
            error_message: fp.error,
            attempted_at: new Date().toISOString(),
          }))
        );

      if (failError) {
        console.warn(`Failed to record failed positions: ${failError.message}`);
      }
    }

    // 10. Send notifications
    const notification = generateLiquidationNotification(
      {
        id: liquidationEventId,
        userId: marginCallEvent.userId,
        marginCallEventId: marginCallEvent.id,
        reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
        status: LiquidationStatus.COMPLETED,
        initiatedAt: new Date(),
        completedAt: new Date(),
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel,
        initialEquity: marginCallEvent.accountEquity,
        finalEquity,
        positionsLiquidated: closedPositions.length,
        total_realized_pnl: totalLoss,
        totalSlippageApplied: totalSlippage,
        details: {
          closedPositions: closedPositions as any,
          failedPositions: failedPositions.map(fp => ({
            positionId: fp.positionId,
            error: fp.error,
          })),
        },
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        success: closedPositions.length > 0,
        liquidationEventId,
        totalPositionsClosed: closedPositions.length,
        totalPositionsFailed: failedPositions.length,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel,
        totalLossRealized: totalLoss,
        totalSlippageApplied: totalSlippage,
        averageLiquidationPrice: closedPositions.length > 0
          ? closedPositions.reduce((sum, cp) => sum + cp.executionPrice, 0) / closedPositions.length
          : 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions,
        failedPositions,
        message: `Liquidation executed: ${closedPositions.length} positions closed`,
      }
    );

    // Send via Supabase Realtime
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: marginCallEvent.userId,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.metadata,
        read: false,
        created_at: new Date().toISOString(),
      });

    return {
      success: closedPositions.length > 0,
      liquidationEventId,
      totalPositionsClosed: closedPositions.length,
      totalPositionsFailed: failedPositions.length,
      initialMarginLevel: marginCallEvent.marginLevel,
      finalMarginLevel,
      totalLossRealized: totalLoss,
      totalSlippageApplied: totalSlippage,
      averageLiquidationPrice: closedPositions.length > 0
        ? closedPositions.reduce((sum, cp) => sum + cp.executionPrice, 0) / closedPositions.length
        : 0,
      executionTimeMs: performance.now() - startTime,
      closedPositions,
      failedPositions,
      message: `Liquidation completed: ${closedPositions.length}/${selectedPositions.length} positions closed`,
    };

  } catch (error) {
    console.error('Liquidation execution error:', error);
    return {
      success: false,
      liquidationEventId,
      totalPositionsClosed: 0,
      totalPositionsFailed: 0,
      initialMarginLevel: marginCallEvent.marginLevel,
      finalMarginLevel: marginCallEvent.marginLevel,
      totalLossRealized: 0,
      totalSlippageApplied: 0,
      averageLiquidationPrice: 0,
      executionTimeMs: performance.now() - startTime,
      closedPositions: [],
      failedPositions: [],
      message: `Liquidation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Main Edge Function handler
 * Can be triggered by:
 * 1. HTTP request with margin call event
 * 2. Scheduled CRON job to process pending liquidations
 */
serve(async (req: Request): Promise<Response> => {
  // Validate CRON secret if this is a scheduled invocation
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const expectedSecret = Deno.env.get('LIQUIDATION_CRON_SECRET');
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization format' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.substring(7);
    if (token !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid CRON secret' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    // 1. If POST request, process single event
    if (req.method === 'POST') {
      const marginCallEvent = await req.json() as MarginCallEvent;
      const result = await executeLiquidationForEvent(supabaseClient, marginCallEvent);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // 2. If GET/CRON, process all pending liquidations
    const { data: pendingEvents, error: fetchError } = await supabaseClient
      .from('margin_call_events')
      .select('*')
      .eq('status', 'liquidation_triggered')
      .order('triggered_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch pending events: ${fetchError.message}`);
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending liquidations',
          processedCount: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Process all pending events
    const results = await Promise.all(
      pendingEvents.map((event: any) => executeLiquidationForEvent(supabaseClient, event as MarginCallEvent))
    );

    const successCount = results.filter(r => r.success).length;
    const totalClosed = results.reduce((sum, r) => sum + r.totalPositionsClosed, 0);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        processedCount: pendingEvents.length,
        successCount,
        totalPositionsClosed: totalClosed,
        results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Execute-liquidation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
