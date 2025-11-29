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
    // 0. Fetch margin call duration to validate time-in-critical (30+ minutes)
    const { data: marginCall, error: callError } = await supabaseClient
      .from('margin_call_events')
      .select('triggered_at')
      .eq('id', marginCallEvent.id)
      .single();

    if (callError || !marginCall) {
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
        message: `Failed to fetch margin call event: ${callError?.message || 'Unknown'}`,
      };
    }

    const timeInCriticalMinutes = Math.floor(
      (Date.now() - new Date((marginCall as any).triggered_at).getTime()) / (1000 * 60)
    );

    // 1. Validate preconditions (including time-in-critical check)
    const preconditionCheck = validateLiquidationPreConditions(
      marginCallEvent.marginLevel,
      timeInCriticalMinutes,
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

    // 5. Prepare positions data for atomic execution via stored procedure
    const positionsToClose = [];

    for (const position of selectedPositions) {
      try {
        // Get current market price and calculate execution price
        const { data: priceData, error: priceError } = await supabaseClient
          .from('market_data')
          .select('bid, ask')
          .eq('symbol', position.symbol)
          .single();

        if (priceError) throw new Error(`Market data unavailable for ${position.symbol}`);

        const bid = (priceData as any).bid || position.currentPrice;
        const ask = (priceData as any).ask || position.currentPrice;
        
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

        positionsToClose.push({
          position_id: position.id,
          symbol: position.symbol,
          side: position.side,
          quantity: position.quantity,
          entry_price: position.entryPrice,
          liquidation_price: executionPrice,
          slippage: slippagePercent,
          realized_pnl: pnl.amount,
        });
      } catch (error) {
        console.warn(`Failed to prepare position ${position.id} for liquidation: ${error}`);
      }
    }

    if (positionsToClose.length === 0) {
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
        message: 'No positions could be prepared for liquidation',
      };
    }

    // 6. Call atomic stored procedure to execute liquidation in single transaction
    const { data: atomicResult, error: atomicError } = await (supabaseClient as any).rpc(
      'execute_liquidation_atomic',
      {
        p_user_id: marginCallEvent.userId,
        p_margin_call_event_id: marginCallEvent.id,
        p_positions_to_liquidate: positionsToClose,
      }
    );

    if (atomicError) {
      console.error('Atomic liquidation failed:', atomicError);
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: 0,
        totalPositionsFailed: selectedPositions.length,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: marginCallEvent.marginLevel,
        totalLossRealized: 0,
        totalSlippageApplied: 0,
        averageLiquidationPrice: 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: [],
        failedPositions: selectedPositions.map(p => ({ positionId: p.id, error: atomicError.message })),
        message: `Atomic liquidation execution failed: ${atomicError.message}`,
      };
    }

    if (!atomicResult || !atomicResult.success) {
      return {
        success: false,
        liquidationEventId,
        totalPositionsClosed: atomicResult?.total_positions_closed || 0,
        totalPositionsFailed: atomicResult?.total_positions_failed || 0,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: atomicResult?.final_margin_level || marginCallEvent.marginLevel,
        totalLossRealized: atomicResult?.total_loss || 0,
        totalSlippageApplied: atomicResult?.total_slippage || 0,
        averageLiquidationPrice: positionsToClose.length > 0
          ? positionsToClose.reduce((sum, p) => sum + p.liquidation_price, 0) / positionsToClose.length
          : 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: positionsToClose.map(p => ({
          positionId: p.position_id,
          symbol: p.symbol,
          closedAt: Date.now(),
          executionPrice: p.liquidation_price,
          realizedPnL: p.realized_pnl,
          slippage: p.slippage,
        })),
        failedPositions: [],
        message: `Liquidation partially failed: ${atomicResult?.message || 'Unknown error'}`,
      };
    }

    // 7. Send notifications
    const notification = generateLiquidationNotification(
      {
        id: atomicResult.liquidation_event_id,
        userId: marginCallEvent.userId,
        marginCallEventId: marginCallEvent.id,
        reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
        status: LiquidationStatus.COMPLETED,
        initiatedAt: new Date(),
        completedAt: new Date(),
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: atomicResult.final_margin_level,
        initialEquity: marginCallEvent.accountEquity,
        finalEquity: marginCallEvent.accountEquity + atomicResult.total_loss,
        positionsLiquidated: atomicResult.total_positions_closed,
        total_realized_pnl: atomicResult.total_loss,
        totalSlippageApplied: atomicResult.total_slippage,
        details: {
          closedPositions: positionsToClose as any,
          failedPositions: [],
        },
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        success: true,
        liquidationEventId: atomicResult.liquidation_event_id,
        totalPositionsClosed: atomicResult.total_positions_closed,
        totalPositionsFailed: atomicResult.total_positions_failed,
        initialMarginLevel: marginCallEvent.marginLevel,
        finalMarginLevel: atomicResult.final_margin_level,
        totalLossRealized: atomicResult.total_loss,
        totalSlippageApplied: atomicResult.total_slippage,
        averageLiquidationPrice: positionsToClose.length > 0
          ? positionsToClose.reduce((sum, p) => sum + p.liquidation_price, 0) / positionsToClose.length
          : 0,
        executionTimeMs: performance.now() - startTime,
        closedPositions: positionsToClose.map(p => ({
          positionId: p.position_id,
          symbol: p.symbol,
          closedAt: Date.now(),
          executionPrice: p.liquidation_price,
          realizedPnL: p.realized_pnl,
          slippage: p.slippage,
        })),
        failedPositions: [],
        message: `Liquidation executed: ${atomicResult.total_positions_closed} positions closed`,
      }
    );

    // Send via Supabase Realtime
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: marginCallEvent.userId,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.metadata as any,
        read: false,
        created_at: new Date().toISOString(),
      } as any);
    
    if (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    return {
      success: true,
      liquidationEventId: atomicResult.liquidation_event_id,
      totalPositionsClosed: atomicResult.total_positions_closed,
      totalPositionsFailed: atomicResult.total_positions_failed,
      initialMarginLevel: marginCallEvent.marginLevel,
      finalMarginLevel: atomicResult.final_margin_level,
      totalLossRealized: atomicResult.total_loss,
      totalSlippageApplied: atomicResult.total_slippage,
      averageLiquidationPrice: positionsToClose.length > 0
        ? positionsToClose.reduce((sum, p) => sum + p.liquidation_price, 0) / positionsToClose.length
        : 0,
      executionTimeMs: performance.now() - startTime,
      closedPositions: positionsToClose.map(p => ({
        positionId: p.position_id,
        symbol: p.symbol,
        closedAt: Date.now(),
        executionPrice: p.liquidation_price,
        realizedPnL: p.realized_pnl,
        slippage: p.slippage,
      })),
      failedPositions: [],
      message: `Liquidation completed: ${atomicResult.total_positions_closed} positions closed`,
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
  // ALWAYS validate CRON secret - no bypass allowed
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('X-Cron-Secret');

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error('Unauthorized access attempt to execute-liquidation');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    // 1. If POST request, process single event
    if (req.method === 'POST') {
      const marginCallEvent = await req.json() as MarginCallEvent;
      const result = await executeLiquidationForEvent(supabaseClient as any, marginCallEvent);
      
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
      pendingEvents.map((event: any) => executeLiquidationForEvent(supabaseClient as any, event as MarginCallEvent))
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
