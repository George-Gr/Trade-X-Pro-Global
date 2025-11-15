import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingOrder {
  id: string;
  user_id: string;
  symbol: string;
  order_type: 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  stop_loss: number | null;
  take_profit: number | null;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Executing pending orders check...');

    // Get all pending orders
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('Error fetching pending orders:', ordersError);
      throw ordersError;
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('No pending orders to execute');
      return new Response(
        JSON.stringify({ message: 'No pending orders', executed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingOrders.length} pending orders`);

    let executedCount = 0;
    const executionResults = [];

    // Process each pending order
    for (const order of pendingOrders as PendingOrder[]) {
      try {
        // Get current price for the symbol
        const { data: priceData, error: priceError } = await supabase.functions.invoke(
          'get-stock-price',
          { body: { symbol: order.symbol } }
        );

        if (priceError || !priceData) {
          console.error(`Failed to get price for ${order.symbol}:`, priceError);
          continue;
        }

        const currentPrice = priceData.c;
        let shouldExecute = false;

        // Check if order should be executed based on type and price
        if (order.order_type === 'limit') {
          if (order.side === 'buy' && currentPrice <= order.price) {
            shouldExecute = true;
          } else if (order.side === 'sell' && currentPrice >= order.price) {
            shouldExecute = true;
          }
        } else if (order.order_type === 'stop') {
          if (order.side === 'buy' && currentPrice >= order.price) {
            shouldExecute = true;
          } else if (order.side === 'sell' && currentPrice <= order.price) {
            shouldExecute = true;
          }
        } else if (order.order_type === 'stop_limit') {
          // For stop_limit, trigger becomes a limit order when stop price is hit
          // We'll treat it like a limit order once triggered
          if (order.side === 'buy' && currentPrice >= order.price) {
            shouldExecute = true;
          } else if (order.side === 'sell' && currentPrice <= order.price) {
            shouldExecute = true;
          }
        }

        if (shouldExecute) {
          console.log(`Executing pending order ${order.id} for ${order.symbol} at ${currentPrice}`);

          // Execute the order using the atomic function
          const { data: result, error: execError } = await supabase.rpc(
            'execute_order_atomic',
            {
              p_user_id: order.user_id,
              p_symbol: order.symbol,
              p_order_type: 'market', // Execute as market order
              p_side: order.side,
              p_quantity: order.quantity,
              p_price: order.price,
              p_stop_loss: order.stop_loss || 0,
              p_take_profit: order.take_profit || 0,
              p_idempotency_key: `pending_exec_${order.id}`,
              p_current_price: currentPrice,
              p_slippage: 0.0005
            }
          );

          if (execError) {
            console.error(`Failed to execute order ${order.id}:`, execError);
            // Mark order as rejected
            await supabase
              .from('orders')
              .update({ status: 'rejected' })
              .eq('id', order.id);
            
            executionResults.push({
              order_id: order.id,
              status: 'rejected',
              error: execError.message
            });
          } else {
            console.log(`Successfully executed order ${order.id}`);
            executedCount++;
            
            // Send notification to user
            await supabase.from('notifications').insert({
              user_id: order.user_id,
              type: 'order',
              title: 'Order Executed',
              message: `Your ${order.order_type} ${order.side} order for ${order.symbol} has been executed at ${currentPrice}`,
              data: { order_id: order.id, execution_price: currentPrice }
            });

            executionResults.push({
              order_id: order.id,
              status: 'executed',
              execution_price: currentPrice,
              result
            });
          }
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
        executionResults.push({
          order_id: order.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Executed ${executedCount} orders out of ${pendingOrders.length}`);

    return new Response(
      JSON.stringify({
        message: 'Pending orders check complete',
        total: pendingOrders.length,
        executed: executedCount,
        results: executionResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in execute-pending-orders:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
