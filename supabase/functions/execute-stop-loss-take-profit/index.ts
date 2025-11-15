import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking stop loss and take profit triggers...');

    // Get all open positions with stop loss or take profit set
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('status', 'open')
      .or('stop_loss.not.is.null,take_profit.not.is.null');

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      throw positionsError;
    }

    if (!positions || positions.length === 0) {
      console.log('No positions with stop loss/take profit found');
      return new Response(
        JSON.stringify({ message: 'No positions to check', triggered: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${positions.length} positions for SL/TP triggers`);

    let triggeredCount = 0;
    const triggerResults = [];

    for (const position of positions) {
      try {
        // Get current price
        const { data: priceData, error: priceError } = await supabase.functions.invoke(
          'get-stock-price',
          { body: { symbol: position.symbol } }
        );

        if (priceError || !priceData) {
          console.error(`Failed to get price for ${position.symbol}:`, priceError);
          continue;
        }

        const currentPrice = priceData.c;
        let shouldClose = false;
        let triggerType = '';

        // Check stop loss
        if (position.stop_loss) {
          if (position.side === 'buy' && currentPrice <= position.stop_loss) {
            shouldClose = true;
            triggerType = 'stop_loss';
          } else if (position.side === 'sell' && currentPrice >= position.stop_loss) {
            shouldClose = true;
            triggerType = 'stop_loss';
          }
        }

        // Check take profit
        if (!shouldClose && position.take_profit) {
          if (position.side === 'buy' && currentPrice >= position.take_profit) {
            shouldClose = true;
            triggerType = 'take_profit';
          } else if (position.side === 'sell' && currentPrice <= position.take_profit) {
            shouldClose = true;
            triggerType = 'take_profit';
          }
        }

        if (shouldClose) {
          console.log(`Triggering ${triggerType} for position ${position.id} at price ${currentPrice}`);

          // Close position using atomic function
          const { data: closeResult, error: closeError } = await supabase.rpc(
            'close_position_atomic',
            {
              p_user_id: position.user_id,
              p_position_id: position.id,
              p_close_quantity: position.quantity,
              p_current_price: currentPrice,
              p_idempotency_key: `${triggerType}_${position.id}_${Date.now()}`,
              p_slippage: 0.0005
            }
          );

          if (closeError) {
            console.error(`Failed to close position ${position.id}:`, closeError);
            triggerResults.push({
              position_id: position.id,
              trigger_type: triggerType,
              status: 'failed',
              error: closeError.message
            });
          } else {
            console.log(`Successfully closed position ${position.id} via ${triggerType}`);
            triggeredCount++;

            // Send notification
            await supabase.from('notifications').insert({
              user_id: position.user_id,
              type: 'position',
              title: triggerType === 'stop_loss' ? 'Stop Loss Triggered' : 'Take Profit Triggered',
              message: `Your position ${position.symbol} was closed at ${currentPrice} due to ${triggerType === 'stop_loss' ? 'stop loss' : 'take profit'} trigger`,
              data: {
                position_id: position.id,
                symbol: position.symbol,
                trigger_type: triggerType,
                close_price: currentPrice,
                result: closeResult
              }
            });

            triggerResults.push({
              position_id: position.id,
              trigger_type: triggerType,
              status: 'success',
              close_price: currentPrice,
              result: closeResult
            });
          }
        }
      } catch (error) {
        console.error(`Error processing position ${position.id}:`, error);
        triggerResults.push({
          position_id: position.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`SL/TP check complete. Triggered ${triggeredCount} positions out of ${positions.length}`);

    return new Response(
      JSON.stringify({
        message: 'Stop loss and take profit check complete',
        total_positions: positions.length,
        triggered: triggeredCount,
        results: triggerResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in execute-stop-loss-take-profit:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
