import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

enum ClosureReason {
  TAKE_PROFIT = "take_profit",
  STOP_LOSS = "stop_loss",
  TRAILING_STOP = "trailing_stop",
  TIME_EXPIRY = "time_expiry",
  MANUAL_USER = "manual_user",
  MARGIN_CALL = "margin_call",
  LIQUIDATION = "liquidation",
  ADMIN_FORCED = "admin_forced",
}

const ClosePositionSchema = z.object({
  position_id: z.string()
    .uuid('Invalid position ID format'),
  reason: z.enum([
    'take_profit',
    'stop_loss',
    'trailing_stop',
    'time_expiry',
    'manual_user',
    'margin_call',
    'liquidation',
    'admin_forced'
  ] as const)
    .default('manual_user'),
  quantity: z.number()
    .positive('Quantity must be positive')
    .finite('Quantity must be finite')
    .max(10000, 'Quantity too large')
    .optional(),
  idempotency_key: z.string()
    .min(1, 'Idempotency key required')
    .optional(),
  notes: z.string()
    .optional(),
  force: z.boolean()
    .optional(),
});

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

    // Check rate limit: 5 requests per minute
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'close-position',
      p_max_requests: 5,
      p_window_seconds: 60
    });

    if (!rateLimitOk) {
      console.log('Rate limit exceeded for user');
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait before closing another position.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = ClosePositionSchema.safeParse(body);

    if (!validation.success) {
      console.error('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { position_id, quantity, idempotency_key } = validation.data;

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
      .from('position_closures')
      .select('id, status')
      .eq('position_id', position_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingOrder && idempotency_key) {
      console.log('Idempotent request detected, returning existing closure');
      return new Response(
        JSON.stringify({ 
          data: {
            closure_id: existingOrder.id,
            status: existingOrder.status,
            message: 'Position already being closed or previously closed'
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
    const isPartialClose = closeQuantity < position.quantity;

    console.log('Processing position closure request:', { position_id, closeQuantity, isPartialClose });

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

    console.log('Market price fetched:', currentPrice);

    // Calculate closure price with slippage (worst-case pricing for forced closures)
    const normalSlippage = 0.1; // 0.1%
    let slippagePercent = normalSlippage;
    
    const reason: ClosureReason = (validation.data as any).reason || ClosureReason.MANUAL_USER;
    
    if (reason === ClosureReason.LIQUIDATION || reason === ClosureReason.MARGIN_CALL) {
      slippagePercent = normalSlippage * 1.5; // 1.5x worse
    } else if (reason === ClosureReason.STOP_LOSS) {
      slippagePercent = normalSlippage * 1.2; // 1.2x worse
    }

    const slippageAmount = currentPrice * (slippagePercent / 100);
    const exitPrice = position.side === 'long'
      ? Math.max(0, currentPrice - slippageAmount)
      : currentPrice + slippageAmount;

    console.log('Exit price calculated:', { currentPrice, exitPrice, slippageAmount });

    // Calculate P&L
    const priceDifference = exitPrice - position.entry_price;
    let grossPnL = 0;
    let pnlPercentage = 0;

    if (position.side === 'long') {
      grossPnL = priceDifference * closeQuantity;
      pnlPercentage = (priceDifference / position.entry_price) * 100;
    } else {
      grossPnL = (position.entry_price - exitPrice) * closeQuantity;
      pnlPercentage = ((position.entry_price - exitPrice) / position.entry_price) * 100;
    }

    // Calculate commission
    const notionalValue = closeQuantity * exitPrice;
    const commission = (notionalValue * 0.1) / 100; // 0.1% commission

    const netPnL = grossPnL - commission;

    console.log('P&L calculated:', { grossPnL, pnlPercentage, commission, netPnL });

    // Call the atomic closure stored procedure
    const { data: closeResult, error: closeError } = await supabase
      .rpc('execute_position_closure', {
        p_position_id: position_id,
        p_user_id: user.id,
        p_reason: reason,
        p_entry_price: position.entry_price,
        p_exit_price: exitPrice,
        p_quantity: closeQuantity,
        p_partial_quantity: isPartialClose ? closeQuantity : null,
        p_realized_pnl: netPnL,
        p_pnl_percentage: pnlPercentage,
        p_commission: commission,
        p_slippage: (slippageAmount / closeQuantity),
      });

    if (closeError) {
      console.error('Close position failed:', closeError);
      
      const errorMessage = typeof closeError === 'object' && closeError !== null && 'message' in closeError
        ? (closeError as { message: string }).message
        : 'Failed to close position';

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Position closure executed successfully');

    // Extract closure ID from result
    const closureId = closeResult && Array.isArray(closeResult) && closeResult[0]?.closure_id
      ? closeResult[0].closure_id
      : null;

    // Create notification for successful closure
    if (closureId) {
      const reasonLabel = {
        [ClosureReason.TAKE_PROFIT]: 'Take Profit',
        [ClosureReason.STOP_LOSS]: 'Stop Loss',
        [ClosureReason.TRAILING_STOP]: 'Trailing Stop',
        [ClosureReason.TIME_EXPIRY]: 'Position Expired',
        [ClosureReason.MANUAL_USER]: 'Manual Close',
        [ClosureReason.MARGIN_CALL]: 'Margin Call',
        [ClosureReason.LIQUIDATION]: 'Liquidation',
        [ClosureReason.ADMIN_FORCED]: 'Admin Forced',
      }[reason];

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'position_closure',
        title: `Position ${isPartialClose ? 'Partially' : ''} Closed - ${reasonLabel}`,
        message: `Closed ${closeQuantity} units at $${exitPrice.toFixed(8)}. P&L: $${netPnL.toFixed(2)} (${pnlPercentage.toFixed(2)}%)`,
        metadata: {
          position_id,
          closure_id: closureId,
          realized_pnl: netPnL,
          pnl_percentage: pnlPercentage,
        },
        read: false,
      }).catch(err => console.error('Failed to create notification:', err));
    }

    // Update daily PnL tracking (async, don't await)
    if (netPnL !== 0) {
      supabase.functions.invoke('update-daily-pnl', {
        body: {
          user_id: user.id,
          realized_pnl: netPnL
        }
      }).catch(err => console.error('Failed to update daily PnL:', err));
    }

    return new Response(
      JSON.stringify({ 
        data: {
          closure_id: closureId,
          position_id,
          reason,
          status: isPartialClose ? 'partial' : 'completed',
          entry_price: position.entry_price,
          exit_price: exitPrice,
          quantity_closed: closeQuantity,
          quantity_remaining: isPartialClose ? position.quantity - closeQuantity : 0,
          realized_pnl: netPnL,
          pnl_percentage: pnlPercentage,
          commission,
          slippage: slippageAmount / closeQuantity,
        },
        message: `Successfully closed ${closeQuantity} lots. P&L: $${netPnL.toFixed(2)}`
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