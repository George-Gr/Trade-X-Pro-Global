import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClosePositionRequest {
  position_id: string;
  quantity?: number; // Optional - if not provided, closes entire position
  idempotency_key: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing position closure');

    // Get request body
    const { position_id, quantity, idempotency_key }: ClosePositionRequest = await req.json();

    if (!position_id || !idempotency_key) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: position_id, idempotency_key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's KYC and account status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kyc_status, account_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.kyc_status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'KYC verification required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.account_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Account is not active' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for idempotency - prevent duplicate closes
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status, fill_price')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle();

    if (existingOrder) {
      console.log('Idempotent request detected, returning existing order');
      return new Response(
        JSON.stringify({ 
          data: {
            order_id: existingOrder.id,
            status: existingOrder.status,
            message: 'Position already closed with this idempotency key'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get position details
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', position_id)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();

    if (positionError || !position) {
      return new Response(
        JSON.stringify({ error: 'Position not found or already closed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine close quantity (full or partial)
    const closeQuantity = quantity && quantity > 0 ? Math.min(quantity, position.quantity) : position.quantity;

    console.log('Processing position closure request');

    // Get current market price from Finnhub
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      return new Response(
        JSON.stringify({ error: 'Market data service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map symbol format for Finnhub (e.g., EURUSD -> OANDA:EUR_USD)
    let finnhubSymbol = position.symbol;
    if (position.symbol.length === 6 && !position.symbol.includes(':')) {
      // Forex pair
      const base = position.symbol.substring(0, 3);
      const quote = position.symbol.substring(3, 6);
      finnhubSymbol = `OANDA:${base}_${quote}`;
    }

    const priceResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubApiKey}`
    );

    if (!priceResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Market data unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceData = await priceResponse.json();
    const currentPrice = priceData.c; // Current price

    if (!currentPrice || currentPrice <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid market price' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Market price fetched successfully');

    // Call the atomic close function
    const { data: closeResult, error: closeError } = await supabase
      .rpc('close_position_atomic', {
        p_user_id: user.id,
        p_position_id: position_id,
        p_close_quantity: closeQuantity,
        p_current_price: currentPrice,
        p_idempotency_key: idempotency_key,
        p_slippage: 0.0005, // 0.05% slippage
      });

    if (closeError) {
      console.error('Close position failed');
      
      // Handle specific error messages
      const errorMessage = typeof closeError === 'object' && closeError !== null && 'message' in closeError
        ? (closeError as { message: string }).message
        : 'Failed to close position';

      if (errorMessage.includes('Insufficient margin') || errorMessage.includes('Insufficient balance')) {
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Position closed successfully');

    return new Response(
      JSON.stringify({ 
        data: closeResult,
        message: `Successfully closed ${closeQuantity} lots`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in close-position');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});