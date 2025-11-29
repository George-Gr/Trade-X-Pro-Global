import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

declare const Deno: any;

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

// Type definition for order request
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

interface PriceData {
  c?: number;
  pc?: number;
}

interface AssetSpec {
  symbol: string;
  asset_class: string;
  min_quantity: number;
  max_quantity: number;
  is_tradable: boolean;
  trading_hours?: { open: string; close: string };
  leverage?: number;
  base_commission?: number;
  commission_type?: string;
  pip_size?: number;
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Rate limit already handled via RPC in existing code; standardized to 100/min

    // Restore proper rate limit check (100/min)
    const { data: rateLimitOk } = await (supabase as any).rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'execute-order',
      p_max_requests: 100,
      p_window_seconds: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Rate limit exceeded (100/min).' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Parse and validate request body using shared validators
    const body = await req.json();
    let orderRequest: OrderRequest;
    try {
      orderRequest = await validateOrderInput(body);
    } catch (err) {
      if (err instanceof ValidationError) {
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
      // Fetch asset directly from asset_specs
      const { data: asset, error: assetError } = await supabase
        .from('asset_specs')
        .select('*')
        .eq('symbol', orderRequest.symbol)
        .eq('is_tradable', true)
        .maybeSingle();
      
      if (assetError || !asset) {
        throw new Error('Invalid or untradable symbol');
      }
      
      assetSpec = asset as AssetSpec;
      validateQuantity(orderRequest, assetSpec);
      // Check market hours and leverage if assetSpec provides data
      validateMarketHours(assetSpec);
      // validateLeverage(profile, assetSpec); // optional - uncomment if profile provides leverage caps
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
      const { count: openPositionsCount } = await (supabase as any)
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
      
      const priceResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubApiKey}`
      );

      if (!priceResponse.ok) {
        throw new Error('Failed to fetch market price');
      }

  const priceData: PriceData = await priceResponse.json();

  // Use current price (c) or fallback to previous close (pc)
  currentPrice = priceData.c || priceData.pc || 0;
      
      if (!currentPrice || currentPrice === 0) {
        throw new Error('Invalid price data received');
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ error: 'Market data unavailable', details: errorMessage }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 6: Calculate margin requirement using margin calculation module
    // =========================================
    
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
    
    let slippageResult: SlippageResult;
    try {
      slippageResult = calculateSlippage({
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        marketPrice: currentPrice,
        orderQuantity: orderRequest.quantity,
        conditions: {
          currentVolatility: 20, // Default 20% volatility
          averageVolatility: 20,
          dailyVolume: 1000000,
          isHighVolatility: false,
          isLowLiquidity: false,
          orderSizePercentage: 0.1,
          isAfterHours: false, // TODO: Implement market hours check
        },
      });

    } catch (err) {
      if (err instanceof SlippageCalculationError) {
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

    // =========================================
    // STEP 9: Calculate commission using commission calculation module
    // =========================================
    
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

    } catch (err) {
      if (err instanceof CommissionCalculationError) {
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
    // STEP 10.5: Handle pending orders (limit, stop, stop_limit)
    // =========================================
    if (orderRequest.order_type !== 'market') {
      
      const { data: pendingOrder, error: pendingError } = await (supabase as any)
        .from('orders')
        .insert({
          user_id: user.id,
          symbol: orderRequest.symbol,
          order_type: orderRequest.order_type,
          side: orderRequest.side,
          quantity: orderRequest.quantity,
          price: orderRequest.price || currentPrice,
          stop_loss: orderRequest.stop_loss || null,
          take_profit: orderRequest.take_profit || null,
          status: 'pending',
          idempotency_key: orderRequest.idempotency_key,
          commission: commissionResult.totalCommission
        })
        .select()
        .single();

      if (pendingError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create pending order', details: pendingError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'order',
        title: 'Order Placed',
        message: `Your ${orderRequest.order_type} ${orderRequest.side} order for ${orderRequest.symbol} has been placed and is pending execution at ${orderRequest.price || currentPrice}`,
        data: { 
          order_id: pendingOrder.id, 
          order_type: orderRequest.order_type, 
          symbol: orderRequest.symbol, 
          quantity: orderRequest.quantity, 
          price: orderRequest.price || currentPrice 
        }
      });


      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pending order created',
          order: pendingOrder,
          execution_details: {
            estimated_execution_price: orderRequest.price || currentPrice,
            estimated_commission: commissionResult.totalCommission.toFixed(2)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================
    // STEP 11: Execute order atomically via stored procedure (market orders only)
    // =========================================
    
    const { data: result, error: execError } = await (supabase as any).rpc('execute_order_atomic', {
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
      return new Response(
        JSON.stringify({ error: execError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


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
