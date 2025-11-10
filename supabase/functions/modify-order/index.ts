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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, quantity, price, stop_loss, take_profit } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Modifying order ${order_id} for user ${user.id}`);

    // Verify order belongs to user and is pending
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !order) {
      console.error('Order fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Order not found or cannot be modified' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build update object
    const updates: any = {};
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'Quantity must be greater than 0' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      updates.quantity = quantity;
    }
    if (price !== undefined) updates.price = price;
    if (stop_loss !== undefined) updates.stop_loss = stop_loss;
    if (take_profit !== undefined) updates.take_profit = take_profit;

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id);

    if (updateError) {
      console.error('Order update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to modify order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Order ${order_id} modified successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Order modified successfully',
        order_id,
        updates 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
