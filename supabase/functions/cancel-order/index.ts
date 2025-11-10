import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CancelOrderSchema = z.object({
  order_id: z.string().uuid('Invalid order ID format')
});

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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = CancelOrderSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id } = validation.data;
    console.log('Processing order cancellation');

    // Verify order belongs to user and is pending
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or cannot be cancelled' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to cancel order');
      return new Response(
        JSON.stringify({ error: 'Failed to cancel order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order cancelled successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Order cancelled successfully',
        order_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in cancel-order');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
