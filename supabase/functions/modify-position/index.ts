import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModifyPositionRequest {
  position_id: string;
  stop_loss?: number;
  take_profit?: number;
  trailing_stop_enabled?: boolean;
  trailing_stop_distance?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      position_id,
      stop_loss,
      take_profit,
      trailing_stop_enabled,
      trailing_stop_distance
    }: ModifyPositionRequest = await req.json();

    console.log('Modifying position:', position_id);

    // Verify position belongs to user
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', position_id)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .single();

    if (positionError || !position) {
      return new Response(
        JSON.stringify({ error: 'Position not found or not accessible' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    
    if (stop_loss !== undefined) {
      // Validate stop loss
      if (stop_loss > 0) {
        if (position.side === 'buy' && stop_loss >= position.entry_price) {
          return new Response(
            JSON.stringify({ error: 'Stop loss must be below entry price for buy positions' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (position.side === 'sell' && stop_loss <= position.entry_price) {
          return new Response(
            JSON.stringify({ error: 'Stop loss must be above entry price for sell positions' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      updates.stop_loss = stop_loss;
    }

    if (take_profit !== undefined) {
      // Validate take profit
      if (take_profit > 0) {
        if (position.side === 'buy' && take_profit <= position.entry_price) {
          return new Response(
            JSON.stringify({ error: 'Take profit must be above entry price for buy positions' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (position.side === 'sell' && take_profit >= position.entry_price) {
          return new Response(
            JSON.stringify({ error: 'Take profit must be below entry price for sell positions' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      updates.take_profit = take_profit;
    }

    if (trailing_stop_enabled !== undefined) {
      updates.trailing_stop_enabled = trailing_stop_enabled;
      
      // If enabling trailing stop, set initial trailing stop price
      if (trailing_stop_enabled && trailing_stop_distance) {
        const currentPrice = position.current_price || position.entry_price;
        if (position.side === 'buy') {
          updates.trailing_stop_price = currentPrice - trailing_stop_distance;
        } else {
          updates.trailing_stop_price = currentPrice + trailing_stop_distance;
        }
      }
    }

    if (trailing_stop_distance !== undefined) {
      if (trailing_stop_distance < 0) {
        return new Response(
          JSON.stringify({ error: 'Trailing stop distance must be positive' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      updates.trailing_stop_distance = trailing_stop_distance;
    }

    // Update position
    const { data: updatedPosition, error: updateError } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', position_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating position:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update position', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create audit log
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'position',
      title: 'Position Modified',
      message: `Position ${position.symbol} has been modified`,
      data: { position_id, updates }
    });

    console.log('Position modified successfully:', position_id);

    return new Response(
      JSON.stringify({
        success: true,
        position: updatedPosition
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in modify-position:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
