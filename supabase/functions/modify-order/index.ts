import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const ModifyOrderSchemaBase = z.object({
  order_id: z.string().uuid('Invalid order ID format'),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(1000, 'Quantity too large')
    .optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(1000000, 'Price too large')
    .optional(),
  stop_loss: z
    .number()
    .positive('Stop loss must be positive')
    .max(1000000, 'Stop loss too large')
    .optional(),
  take_profit: z
    .number()
    .positive('Take profit must be positive')
    .max(1000000, 'Take profit too large')
    .optional(),
});

// Zod schema for order modification requests
const ModifyOrderSchema = ModifyOrderSchemaBase.refine(
  (data: unknown) => {
    const d = data as {
      quantity?: unknown;
      price?: unknown;
      stop_loss?: unknown;
      take_profit?: unknown;
    };
    return (
      d.quantity !== undefined ||
      d.price !== undefined ||
      d.stop_loss !== undefined ||
      d.take_profit !== undefined
    );
  },
  { message: 'At least one field must be provided for modification' }
);

// z.infer is a type helper from Zod. The editor may not have full zod types available here,
// so use a permissive unknown to keep type-safety at runtime via safeParse.
type ModifyOrderInput = unknown;

serve(async (req: Request) => {
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit: 10 requests per minute
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'modify-order',
      p_max_requests: 10,
      p_window_seconds: 60,
    });

    if (!rateLimitOk) {
      console.log('Rate limit exceeded for user');
      return new Response(
        JSON.stringify({
          error:
            'Too many requests. Please wait before modifying another order.',
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    const body: unknown = await req.json();
    const validation = ModifyOrderSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, quantity, price, stop_loss, take_profit } =
      validation.data;
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
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build update object
    const updates: {
      quantity?: number;
      price?: number;
      stop_loss?: number | null;
      take_profit?: number | null;
    } = {};
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
      return new Response(JSON.stringify({ error: 'Failed to modify order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order modified successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order modified successfully',
        order_id,
        updates,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in modify-order');
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
