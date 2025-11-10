import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ModifyOrderSchema = z.object({
  order_id: z.string().uuid('Invalid order ID format'),
  quantity: z.number().positive('Quantity must be positive').max(1000, 'Quantity too large').optional(),
  price: z.number().positive('Price must be positive').max(1000000, 'Price too large').optional(),
  stop_loss: z.number().positive('Stop loss must be positive').max(1000000, 'Stop loss too large').optional(),
  take_profit: z.number().positive('Take profit must be positive').max(1000000, 'Take profit too large').optional()
}).refine(
  (data) => data.quantity !== undefined || data.price !== undefined || 
            data.stop_loss !== undefined || data.take_profit !== undefined,
  { message: 'At least one field must be provided for modification' }
);

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
    const validation = ModifyOrderSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, quantity, price, stop_loss, take_profit } = validation.data;
    console.log('Processing order modification');

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
        JSON.stringify({ error: 'Order not found or cannot be modified' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build update object
    const updates: any = {};
    if (quantity !== undefined) updates.quantity = quantity;
    if (price !== undefined) updates.price = price;
    if (stop_loss !== undefined) updates.stop_loss = stop_loss;
    if (take_profit !== undefined) updates.take_profit = take_profit;

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to modify order');
      return new Response(
        JSON.stringify({ error: 'Failed to modify order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order modified successfully');

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
    console.error('Unexpected error in modify-order');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
