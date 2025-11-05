import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  symbol: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  idempotency_key: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Execute Order Function: Starting request processing');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const orderRequest: OrderRequest = await req.json();
    console.log('Order request:', orderRequest);

    // =========================================
    // VALIDATION STEP 1: Check user profile and KYC status
    // =========================================
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kyc_status, account_status, balance, equity, margin_used')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check KYC status
    if (profile.kyc_status !== 'approved') {
      console.error('KYC not approved:', profile.kyc_status);
      return new Response(
        JSON.stringify({ error: 'KYC verification required', kyc_status: profile.kyc_status }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check account status
    if (profile.account_status !== 'active') {
      console.error('Account not active:', profile.account_status);
      return new Response(
        JSON.stringify({ error: 'Account suspended or closed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User profile validated');

    // =========================================
    // VALIDATION STEP 2: Check idempotency
    // =========================================
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('idempotency_key', orderRequest.idempotency_key)
      .maybeSingle();

    if (existingOrder) {
      console.log('Duplicate order detected:', existingOrder.id);
      return new Response(
        JSON.stringify({ 
          error: 'Duplicate order', 
          order_id: existingOrder.id,
          status: existingOrder.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // VALIDATION STEP 3: Validate asset
    // =========================================
    const { data: assetSpec, error: assetError } = await supabase
      .from('asset_specs')
      .select('*')
      .eq('symbol', orderRequest.symbol)
      .eq('is_tradable', true)
      .maybeSingle();

    if (assetError || !assetSpec) {
      console.error('Asset validation error:', assetError);
      return new Response(
        JSON.stringify({ error: 'Invalid or untradable symbol' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Asset validated:', assetSpec.symbol);

    // =========================================
    // VALIDATION STEP 4: Validate quantity
    // =========================================
    if (orderRequest.quantity < assetSpec.min_quantity || 
        orderRequest.quantity > assetSpec.max_quantity) {
      console.error('Invalid quantity:', orderRequest.quantity);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid quantity',
          min_quantity: assetSpec.min_quantity,
          max_quantity: assetSpec.max_quantity
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 5: Fetch current market price from Finnhub
    // =========================================
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    let currentPrice: number;

    try {
      // Map symbol to Finnhub format
      let finnhubSymbol = orderRequest.symbol;
      
      // For forex, use Finnhub forex format (e.g., OANDA:EUR_USD)
      if (assetSpec.asset_class === 'forex') {
        const base = orderRequest.symbol.substring(0, 3);
        const quote = orderRequest.symbol.substring(3, 6);
        finnhubSymbol = `OANDA:${base}_${quote}`;
      }
      
      console.log('Fetching price for:', finnhubSymbol);
      
      const priceResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubApiKey}`
      );

      if (!priceResponse.ok) {
        throw new Error('Failed to fetch market price');
      }

      const priceData = await priceResponse.json();
      
      // Use current price (c) or fallback to previous close (pc)
      currentPrice = priceData.c || priceData.pc;
      
      if (!currentPrice || currentPrice === 0) {
        throw new Error('Invalid price data received');
      }

      console.log('Current price fetched:', currentPrice);
    } catch (error) {
      console.error('Market data error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: 'Market data unavailable', details: errorMessage }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 6: Calculate margin requirement (pre-check)
    // =========================================
    const contractSize = 100000; // Standard lot size
    const leverage = assetSpec.leverage;
    const marginRequired = (orderRequest.quantity * contractSize * currentPrice) / leverage;
    const freeMargin = profile.equity - profile.margin_used;

    console.log('Margin calculation:', {
      marginRequired,
      freeMargin,
      leverage
    });

    if (freeMargin < marginRequired) {
      console.error('Insufficient margin');
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient margin',
          required: marginRequired.toFixed(2),
          available: freeMargin.toFixed(2)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 7: Execute order atomically via stored procedure
    // =========================================
    console.log('Calling execute_order_atomic stored procedure');
    
    const { data: result, error: execError } = await supabase.rpc('execute_order_atomic', {
      p_user_id: user.id,
      p_symbol: orderRequest.symbol,
      p_order_type: orderRequest.order_type,
      p_side: orderRequest.side,
      p_quantity: orderRequest.quantity,
      p_price: orderRequest.price || null,
      p_stop_loss: orderRequest.stop_loss || null,
      p_take_profit: orderRequest.take_profit || null,
      p_idempotency_key: orderRequest.idempotency_key,
      p_current_price: currentPrice,
      p_slippage: 0.0005 // 0.05% default slippage for market orders
    });

    if (execError) {
      console.error('Order execution error:', execError);
      return new Response(
        JSON.stringify({ error: execError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order executed successfully:', result);

    // =========================================
    // STEP 8: Return success response
    // =========================================
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in execute-order function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
