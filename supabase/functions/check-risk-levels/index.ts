import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting risk level check...');

    // Get all active users with open positions
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, balance, equity, margin_used, account_status')
      .eq('account_status', 'active')
      .gt('margin_used', 0);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Checking ${users?.length || 0} users with active positions`);

    let marginCallsTriggered = 0;
    let stopOutsExecuted = 0;
    let stopLossesExecuted = 0;

    for (const user of users || []) {
      // Calculate margin level
      const marginLevel = user.margin_used > 0 
        ? (user.equity / user.margin_used) * 100 
        : 0;

      // Get user's risk settings
      const { data: riskSettings } = await supabaseClient
        .from('risk_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!riskSettings) continue;

      // Check for stop-out level (critical)
      if (marginLevel < riskSettings.stop_out_level && marginLevel > 0) {
        console.log(`Stop-out triggered for user ${user.id}. Margin level: ${marginLevel.toFixed(2)}%`);
        
        // Get all open positions
        const { data: positions } = await supabaseClient
          .from('positions')
          .select('id, symbol, quantity')
          .eq('user_id', user.id)
          .eq('status', 'open');

        // Close all positions
        for (const position of positions || []) {
          try {
            // Call close-position function
            const { error: closeError } = await supabaseClient.functions.invoke('close-position', {
              body: {
                position_id: position.id,
                idempotency_key: `stopout_${Date.now()}_${position.id}`
              }
            });

            if (closeError) {
              console.error(`Failed to close position ${position.id}:`, closeError);
            } else {
              stopOutsExecuted++;
            }
          } catch (error) {
            console.error(`Error closing position ${position.id}:`, error);
          }
        }

        // Create risk event
        await supabaseClient.from('risk_events').insert({
          user_id: user.id,
          event_type: 'stop_out',
          severity: 'critical',
          description: `Stop-out executed. Margin level: ${marginLevel.toFixed(2)}%`,
          details: {
            margin_level: marginLevel,
            threshold: riskSettings.stop_out_level,
            positions_closed: positions?.length || 0
          }
        });

      } 
      // Check for margin call (warning)
      else if (marginLevel < riskSettings.margin_call_level && marginLevel > 0) {
        console.log(`Margin call for user ${user.id}. Margin level: ${marginLevel.toFixed(2)}%`);
        
        // Check if we already have an unresolved margin call event
        const { data: existingEvents } = await supabaseClient
          .from('risk_events')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_type', 'margin_call')
          .eq('resolved', false)
          .limit(1);

        if (!existingEvents || existingEvents.length === 0) {
          // Create margin call event
          await supabaseClient.from('risk_events').insert({
            user_id: user.id,
            event_type: 'margin_call',
            severity: 'warning',
            description: `Margin call alert. Margin level: ${marginLevel.toFixed(2)}%`,
            details: {
              margin_level: marginLevel,
              threshold: riskSettings.margin_call_level,
              equity: user.equity,
              margin_used: user.margin_used
            }
          });
          
          marginCallsTriggered++;
        }
      }

      // Check positions for stop-loss enforcement
      if (riskSettings.enforce_stop_loss) {
        const { data: positions } = await supabaseClient
          .from('positions')
          .select('id, symbol, side, quantity, entry_price, current_price, stop_loss')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .not('stop_loss', 'is', null);

        for (const position of positions || []) {
          if (!position.stop_loss || !position.current_price) continue;

          // Check if stop-loss should be triggered
          const shouldTrigger = position.side === 'buy'
            ? position.current_price <= position.stop_loss
            : position.current_price >= position.stop_loss;

          if (shouldTrigger) {
            console.log(`Stop-loss triggered for position ${position.id}`);
            
            try {
              // Close position
              const { error: closeError } = await supabaseClient.functions.invoke('close-position', {
                body: {
                  position_id: position.id,
                  idempotency_key: `stoploss_${Date.now()}_${position.id}`
                }
              });

              if (!closeError) {
                stopLossesExecuted++;
                
                // Create risk event
                await supabaseClient.from('risk_events').insert({
                  user_id: user.id,
                  event_type: 'stop_loss',
                  severity: 'info',
                  description: `Stop-loss executed for ${position.symbol}`,
                  details: {
                    position_id: position.id,
                    symbol: position.symbol,
                    side: position.side,
                    stop_loss: position.stop_loss,
                    close_price: position.current_price
                  }
                });
              }
            } catch (error) {
              console.error(`Error executing stop-loss for position ${position.id}:`, error);
            }
          }
        }
      }
    }

    const summary = {
      checked_users: users?.length || 0,
      margin_calls: marginCallsTriggered,
      stop_outs: stopOutsExecuted,
      stop_losses: stopLossesExecuted,
      timestamp: new Date().toISOString()
    };

    console.log('Risk check complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Risk check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
