import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  validateOrderInput,
  validateAssetExists,
  validateQuantity,
  validateAccountStatus,
  validateKYCStatus,
  validateMarketHours,
  ValidationError,
} from "../lib/orderValidation.ts";
import {
  calculateMarginRequired,
  calculateFreeMargin,
  calculateMarginLevel,
  MarginCalculationError,
} from "../lib/marginCalculations.ts";
import {
  calculateSlippage,
  getExecutionPrice,
  SlippageCalculationError,
  SlippageResult,
} from "../lib/slippageCalculation.ts";
import {
  calculateCommission,
  CommissionCalculationError,
  CommissionResult,
  AssetClass,
  AccountTier,
} from "../lib/commissionCalculation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OrderRequestSchema = z.object({
  symbol: z.string()
    .trim()
    .min(1, 'Symbol required')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9_]+$/, 'Invalid symbol format'),
  order_type: z.enum(['market', 'limit', 'stop', 'stop_limit'], {
    errorMap: () => ({ message: 'Invalid order type' })
  }),
  side: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: 'Invalid side' })
  }),
  quantity: z.number()
    .positive('Quantity must be positive')
    .finite('Quantity must be finite')
    .max(10000, 'Quantity too large'),
  price: z.number()
    .positive('Price must be positive')
    .finite('Price must be finite')
    .optional(),
  stop_loss: z.number()
    .positive('Stop loss must be positive')
    .finite('Stop loss must be finite')
    .optional(),
  take_profit: z.number()
    .positive('Take profit must be positive')
    .finite('Take profit must be finite')
    .optional(),
  idempotency_key: z.string()
    .min(1, 'Idempotency key required')
});

// Type extraction from schema
type OrderRequest = z.infer<typeof OrderRequestSchema>;

interface PriceData {
  c?: number;
  pc?: number;
}

interface AssetSpec {
  symbol: string;
  min_quantity: number;
  max_quantity: number;
  is_tradable: boolean;
  trading_hours?: { open: string; close: string };
  leverage?: number;
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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

    console.log('User authenticated');

    // Check rate limit: 10 requests per minute
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'execute-order',
      p_max_requests: 10,
      p_window_seconds: 60
    });

    if (!rateLimitOk) {
      console.log('Rate limit exceeded for user');
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait before placing another order.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Parse and validate request body using shared validators
    const body = await req.json();
    let orderRequest: OrderRequest;
    try {
      orderRequest = await validateOrderInput(body);
      console.log('Order request validated:', orderRequest.order_type, orderRequest.side);
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error('Order input validation failed:', err.details || err.message);
        return new Response(
          JSON.stringify({ error: err.message, details: err.details }),
          { status: err.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    // =========================================
    // VALIDATION STEP 1: Check user profile and KYC status
    // =========================================
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kyc_status, account_status, balance, equity, margin_used')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate profile (KYC and account status) via shared validators
    try {
      validateKYCStatus(profile);
      validateAccountStatus(profile);
      console.log('User profile validated');
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        const ve = err as ValidationError;
        return new Response(
          JSON.stringify({ error: ve.message, details: ve.details }),
          { status: ve.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Re-throw non-validation errors to outer handler
      throw err;
    }

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
      console.log('Duplicate order detected');
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
    // VALIDATION STEP 3: Validate asset and quantity using shared validators
    // =========================================
    let assetSpec: AssetSpec;
    try {
      assetSpec = await validateAssetExists(supabase, orderRequest.symbol);
      validateQuantity(orderRequest, assetSpec);
      // Check market hours and leverage if assetSpec provides data
      validateMarketHours(assetSpec);
      // validateLeverage(profile, assetSpec); // optional - uncomment if profile provides leverage caps
      console.log('Asset & quantity validated');
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        const ve = err as ValidationError;
        return new Response(
          JSON.stringify({ error: ve.message, details: ve.details }),
          { status: ve.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    // =========================================
    // VALIDATION STEP 5: Check Risk Limits
    // =========================================
    const { data: riskSettings } = await supabase
      .from('risk_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (riskSettings) {
      // Check position size limit
      if (orderRequest.quantity > riskSettings.max_position_size) {
        return new Response(
          JSON.stringify({ 
            error: 'Position size exceeds risk limit',
            max_allowed: riskSettings.max_position_size,
            requested: orderRequest.quantity
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check max open positions
      const { count: openPositionsCount } = await supabase
        .from('positions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'open');

      if (openPositionsCount !== null && openPositionsCount >= riskSettings.max_positions) {
        return new Response(
          JSON.stringify({ 
            error: 'Maximum number of open positions reached',
            max_positions: riskSettings.max_positions,
            current: openPositionsCount
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check daily trade limit
      const { data: dailyPnl } = await supabase
        .from('daily_pnl_tracking')
        .select('trade_count, breached_daily_limit')
        .eq('user_id', user.id)
        .eq('trading_date', new Date().toISOString().split('T')[0])
        .single();

      if (dailyPnl?.breached_daily_limit) {
        return new Response(
          JSON.stringify({ error: 'Daily loss limit breached. Trading suspended for today.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (dailyPnl && dailyPnl.trade_count >= riskSettings.daily_trade_limit) {
        return new Response(
          JSON.stringify({ 
            error: 'Daily trade limit reached',
            max_trades: riskSettings.daily_trade_limit
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Risk limits validated');

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
      
      console.log('Fetching market price');
      
      const priceResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubApiKey}`
      );

      if (!priceResponse.ok) {
        throw new Error('Failed to fetch market price');
      }

  const priceData: PriceData = await priceResponse.json();

  // Use current price (c) or fallback to previous close (pc)
  currentPrice = priceData.c || priceData.pc;
      
      if (!currentPrice || currentPrice === 0) {
        throw new Error('Invalid price data received');
      }

      console.log('Market price fetched successfully');
    } catch (error: unknown) {
      console.error('Market data unavailable');
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ error: 'Market data unavailable', details: errorMessage }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 6: Calculate margin requirement using margin calculation module
    // =========================================
    console.log('Calculating margin requirements');
    
    try {
      const marginRequired = calculateMarginRequired(
        orderRequest.quantity,
        currentPrice,
        assetSpec.leverage || 1
      );
      
      const freeMargin = calculateFreeMargin(
        profile.equity,
        profile.margin_used
      );
      
      const marginLevel = calculateMarginLevel(
        profile.equity,
        profile.margin_used
      );

      console.log(`Margin: required=${marginRequired}, free=${freeMargin}, level=${marginLevel}%`);

      if (freeMargin < marginRequired) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient margin',
            required: marginRequired.toFixed(2),
            available: freeMargin.toFixed(2),
            margin_level: marginLevel.toFixed(2)
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (err) {
      if (err instanceof MarginCalculationError) {
        console.error('Margin calculation error:', err.details);
        return new Response(
          JSON.stringify({ error: 'Margin calculation failed', details: err.details }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    // =========================================
    // STEP 7: Calculate slippage using slippage calculation module
    // =========================================
    console.log('Calculating order slippage');
    
    let slippageResult: SlippageResult;
    try {
      slippageResult = calculateSlippage({
        symbol: orderRequest.symbol,
        assetClass: assetSpec.asset_class.toLowerCase(),
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        currentPrice: currentPrice,
        currentVolatility: assetSpec.volatility || 20, // Default 20% volatility
        averageVolatility: assetSpec.avg_volatility || 20,
        liquidity: assetSpec.liquidity_base || 1000000,
        isAfterHours: false, // TODO: Implement market hours check
      });

      console.log(`Slippage calculated: ${slippageResult.totalSlippage.toFixed(6)} (base: ${slippageResult.baseSlippage.toFixed(6)})`);
    } catch (err) {
      if (err instanceof SlippageCalculationError) {
        console.error('Slippage calculation error:', err.details);
        return new Response(
          JSON.stringify({ error: 'Slippage calculation failed', details: err.details }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    // =========================================
    // STEP 8: Calculate execution price with slippage
    // =========================================
    const executionPrice = orderRequest.side === 'buy'
      ? currentPrice * (1 + slippageResult.totalSlippage)
      : currentPrice * (1 - slippageResult.totalSlippage);
    console.log(`Execution price: ${executionPrice.toFixed(4)} (market: ${currentPrice.toFixed(4)})`);

    // =========================================
    // STEP 9: Calculate commission using commission calculation module
    // =========================================
    console.log('Calculating order commission');
    
    let commissionResult: CommissionResult;
    try {
      // Map asset class string to enum
      const assetClassMap: Record<string, AssetClass> = {
        'forex': AssetClass.Forex,
        'stock': AssetClass.Stock,
        'index': AssetClass.Index,
        'commodity': AssetClass.Commodity,
        'crypto': AssetClass.Crypto,
        'etf': AssetClass.ETF,
        'bond': AssetClass.Bond,
      };

      const commissionAssetClass = assetClassMap[assetSpec.asset_class.toLowerCase()] || AssetClass.Forex;
      
      commissionResult = calculateCommission({
        symbol: orderRequest.symbol,
        assetClass: commissionAssetClass,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        executionPrice: executionPrice,
        accountTier: AccountTier.Standard, // TODO: Get from user profile tier
      });

      console.log(`Commission calculated: $${commissionResult.totalCommission.toFixed(2)}`);
    } catch (err) {
      if (err instanceof CommissionCalculationError) {
        console.error('Commission calculation error:', err.details);
        return new Response(
          JSON.stringify({ error: 'Commission calculation failed', details: err.details }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw err;
    }

    // =========================================
    // STEP 10: Calculate total order cost including commission
    // =========================================
    const orderValue = orderRequest.quantity * executionPrice;
    const totalOrderCost = orderRequest.side === 'buy' 
      ? orderValue + commissionResult.totalCommission
      : orderValue - commissionResult.totalCommission;
    
    console.log(`Total order cost: $${totalOrderCost.toFixed(2)} (value: $${orderValue.toFixed(2)}, commission: $${commissionResult.totalCommission.toFixed(2)})`);

    // Verify sufficient balance for buy orders
    if (orderRequest.side === 'buy' && profile.balance < totalOrderCost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance',
          required: totalOrderCost.toFixed(2),
          available: profile.balance.toFixed(2)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 11: Execute order atomically via stored procedure
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
      p_execution_price: executionPrice,
      p_slippage: slippageResult.totalSlippage,
      p_commission: commissionResult.totalCommission,
    });

    if (execError) {
      console.error('Order execution failed');
      return new Response(
        JSON.stringify({ error: execError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order executed successfully');

    // =========================================
    // STEP 12: Return success response
    // =========================================
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        execution_details: {
          execution_price: executionPrice.toFixed(4),
          slippage: slippageResult.totalSlippage.toFixed(6),
          commission: commissionResult.totalCommission.toFixed(2),
          total_cost: totalOrderCost.toFixed(2),
        }
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
