/// <reference lib="deno.ns" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

// Deno built-in types used via reference directive

import {
  AccountTier,
  AssetClass,
  CommissionCalculationError,
  CommissionResult,
  calculateCommission,
} from '../lib/commissionCalculation.ts';
import {
  MarginCalculationError,
  calculateFreeMargin,
  calculateMarginLevel,
  calculateMarginRequired,
} from '../lib/marginCalculations.ts';
import {
  ValidationError,
  validateAccountStatus,
  validateKYCStatus,
  validateMarketHours,
  validateOrderInput,
  validateQuantity,
} from '../lib/orderValidation.ts';
import {
  SlippageCalculationError,
  SlippageResult,
  calculateSlippage,
} from '../lib/slippageCalculation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

// Type definition for market conditions
interface MarketConditions {
  volatility: number;
  averageVolatility: number;
  dailyVolume: number;
  isHighVolatility: boolean;
  isLowLiquidity: boolean;
  orderSizePercentage: number;
  isAfterHours: boolean;
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

// Enhanced error types for comprehensive error handling
enum OrderExecutionErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INSUFFICIENT_MARGIN = 'INSUFFICIENT_MARGIN',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MARKET_DATA_UNAVAILABLE = 'MARKET_DATA_UNAVAILABLE',
  DUPLICATE_ORDER = 'DUPLICATE_ORDER',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RISK_LIMIT_VIOLATION = 'RISK_LIMIT_VIOLATION',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

interface OrderExecutionError {
  code: OrderExecutionErrorCode;
  message: string;
  details?: unknown;
  status: number;
  context?: Record<string, unknown>;
}

// Response structure validation
interface OrderExecutionResult {
  order_id: string;
  position_id?: string;
  status: 'executed' | 'pending';
  execution_details: {
    execution_price: string;
    slippage: string;
    commission: string;
    total_cost: string;
    timestamp: string;
    transaction_id: string;
  };
}

// Atomic transaction step tracking
interface TransactionStep {
  step_name: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// TODO: Replace with proper market data service integration
// This function should fetch real-time market conditions from a dedicated market data service
// or cache. Currently uses fallback values and should include proper error handling
// for when the market data service is unavailable.
async function fetchMarketConditions(
  symbol: string
): Promise<MarketConditions> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Call market data service function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-market-conditions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ symbol }),
      }
    );

    if (!response.ok) {
      throw new Error(`Market data fetch failed: ${response.status}`);
    }

    const marketData = await response.json();

    return {
      volatility: marketData.volatility ?? 20,
      averageVolatility: marketData.averageVolatility ?? 20,
      dailyVolume: marketData.dailyVolume ?? 1000000,
      isHighVolatility: marketData.isHighVolatility ?? false,
      isLowLiquidity: marketData.isLowLiquidity ?? false,
      orderSizePercentage: marketData.orderSizePercentage ?? 0.1,
      isAfterHours: marketData.isAfterHours ?? false,
    };
  } catch (error) {
    // Log error but don't throw - we'll use fallback values
    console.warn(`Failed to fetch market conditions for ${symbol}:`, error);
    throw error;
  }
}

Deno.serve((req: Request) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const transactionSteps: TransactionStep[] = [];

  // Add transaction step
  const addStep = (stepName: string, success: boolean, error?: string) => {
    transactionSteps.push({
      step_name: stepName,
      success,
      error,
      timestamp: new Date(),
    });
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: Object.fromEntries(
        Object.entries(corsHeaders).map(([key, value]) => [key, String(value)])
      ),
    });
  }

  // Return the async function directly to match serve's expected signature
  return (async () => {
    try {
      console.log(`[${requestId}] Starting order execution request`);

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get user from JWT
      const authHeader = (req as Request).headers.get('Authorization');
      if (!authHeader) {
        addStep('authentication', false, 'Missing authorization header');
        return createErrorResponse(
          OrderExecutionErrorCode.VALIDATION_FAILED,
          'Unauthorized',
          'Missing authorization header',
          401,
          { requestId }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const authResult = await supabase.auth.getUser(token);

      if (!authResult || !authResult.data || !authResult.data.user) {
        addStep('authentication', false, 'No user found');
        return createErrorResponse(
          OrderExecutionErrorCode.VALIDATION_FAILED,
          'Unauthorized',
          'Invalid or expired token',
          401,
          { requestId }
        );
      }

      const user = authResult.data.user;

      addStep('authentication', true);
      console.log(`[${requestId}] User authenticated: ${user.id}`);

      // Rate limit check
      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
        'check_rate_limit',
        {
          p_user_id: user.id,
          p_endpoint: 'execute-order',
          p_max_requests: 100,
          p_window_seconds: 60,
        }
      );

      if (rateLimitError) {
        addStep('rate_limit_check', false, rateLimitError.message);
        return createErrorResponse(
          OrderExecutionErrorCode.INTERNAL_ERROR,
          'Rate limit check failed',
          rateLimitError.message,
          500,
          { requestId }
        );
      }

      if (!rateLimitOk) {
        addStep('rate_limit_check', false, 'Rate limit exceeded');
        return createErrorResponse(
          OrderExecutionErrorCode.RATE_LIMIT_EXCEEDED,
          'Too many requests',
          'Rate limit exceeded (100/min)',
          429,
          { requestId, retryAfter: 60 }
        );
      }

      addStep('rate_limit_check', true);

      // Parse and validate request body using shared validators
      const body = await (req as Request).json();
      let orderRequest: OrderRequest;
      try {
        orderRequest = await validateOrderInput(body);
      } catch (err) {
        addStep('request_validation', false, (err as Error).message);
        if (err instanceof ValidationError) {
          return createErrorResponse(
            OrderExecutionErrorCode.VALIDATION_FAILED,
            err.message,
            err.details,
            err.status,
            { requestId }
          );
        }
        throw err;
      }

      addStep('request_validation', true);
      console.log(
        `[${requestId}] Request validated: ${orderRequest.symbol} ${orderRequest.side} ${orderRequest.quantity}`
      );

      // =========================================
      // VALIDATION STEP 1: Check user profile and KYC status
      // =========================================
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('kyc_status, account_status, balance, equity, margin_used')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        addStep(
          'profile_validation',
          false,
          profileError?.message || 'Profile not found'
        );
        return createErrorResponse(
          OrderExecutionErrorCode.VALIDATION_FAILED,
          'User profile not found',
          profileError?.message,
          404,
          { requestId }
        );
      }

      // Validate profile (KYC and account status) via shared validators
      try {
        validateKYCStatus(profile);
        validateAccountStatus(profile);
      } catch (err: unknown) {
        addStep('profile_validation', false, (err as Error).message);
        if (err instanceof ValidationError) {
          const ve = err as ValidationError;
          return createErrorResponse(
            OrderExecutionErrorCode.VALIDATION_FAILED,
            ve.message,
            ve.details,
            ve.status,
            { requestId }
          );
        }
        throw err;
      }

      addStep('profile_validation', true);

      // =========================================
      // VALIDATION STEP 2: Enhanced idempotency check with database constraint
      // =========================================
      const { data: existingOrder, error: idempotencyError } = await supabase
        .from('orders')
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .eq('idempotency_key', orderRequest.idempotency_key)
        .maybeSingle();

      if (idempotencyError) {
        addStep('idempotency_check', false, idempotencyError.message);
        return createErrorResponse(
          OrderExecutionErrorCode.INTERNAL_ERROR,
          'Idempotency check failed',
          idempotencyError.message,
          500,
          { requestId }
        );
      }

      if (existingOrder) {
        addStep(
          'idempotency_check',
          false,
          `Duplicate order found: ${existingOrder.id}`
        );
        return createErrorResponse(
          OrderExecutionErrorCode.DUPLICATE_ORDER,
          'Duplicate order',
          {
            order_id: existingOrder.id,
            status: existingOrder.status,
            created_at: existingOrder.created_at,
          },
          409,
          { requestId, existing_order_id: existingOrder.id }
        );
      }

      addStep('idempotency_check', true);

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
        validateMarketHours(assetSpec);
      } catch (err: unknown) {
        addStep('asset_validation', false, (err as Error).message);
        if (err instanceof ValidationError) {
          const ve = err as ValidationError;
          return createErrorResponse(
            OrderExecutionErrorCode.VALIDATION_FAILED,
            ve.message,
            ve.details,
            ve.status,
            { requestId }
          );
        }
        throw err;
      }

      addStep('asset_validation', true);

      // =========================================
      // VALIDATION STEP 4: Check Risk Limits
      // =========================================
      const { data: riskSettings } = await supabase
        .from('risk_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (riskSettings) {
        // Check position size limit
        if (orderRequest.quantity > riskSettings.max_position_size) {
          addStep('risk_validation', false, 'Position size exceeds limit');
          return createErrorResponse(
            OrderExecutionErrorCode.RISK_LIMIT_VIOLATION,
            'Position size exceeds risk limit',
            {
              max_allowed: riskSettings.max_position_size,
              requested: orderRequest.quantity,
            },
            400,
            { requestId }
          );
        }

        // Check max open positions
        const { count: openPositionsCount, error: positionsError } =
          await supabase
            .from('positions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'open');

        const openPositions = openPositionsCount ?? 0;

        if (positionsError) {
          addStep('risk_validation', false, positionsError.message);
          return createErrorResponse(
            OrderExecutionErrorCode.INTERNAL_ERROR,
            'Failed to check open positions',
            positionsError.message,
            500,
            { requestId }
          );
        }

        if (openPositions >= riskSettings.max_positions) {
          addStep('risk_validation', false, 'Max positions reached');
          return createErrorResponse(
            OrderExecutionErrorCode.RISK_LIMIT_VIOLATION,
            'Maximum number of open positions reached',
            {
              max_positions: riskSettings.max_positions,
              current: openPositions,
            },
            400,
            { requestId }
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
          addStep('risk_validation', false, 'Daily loss limit breached');
          return createErrorResponse(
            OrderExecutionErrorCode.RISK_LIMIT_VIOLATION,
            'Daily loss limit breached',
            'Trading suspended for today',
            403,
            { requestId }
          );
        }

        if (
          dailyPnl &&
          dailyPnl.trade_count >= riskSettings.daily_trade_limit
        ) {
          addStep('risk_validation', false, 'Daily trade limit reached');
          return createErrorResponse(
            OrderExecutionErrorCode.RISK_LIMIT_VIOLATION,
            'Daily trade limit reached',
            {
              max_trades: riskSettings.daily_trade_limit,
              current_trades: dailyPnl.trade_count,
            },
            400,
            { requestId }
          );
        }
      }

      addStep('risk_validation', true);

      // =========================================
      // STEP 5: Fetch current market price via get-stock-price function
      // =========================================
      let currentPrice: number;

      try {
        // Map symbol to price API format
        let priceSymbol = orderRequest.symbol;

        // For forex/commodities/crypto, use OANDA format
        if (
          assetSpec.asset_class === 'forex' ||
          assetSpec.asset_class === 'commodity' ||
          assetSpec.asset_class === 'crypto'
        ) {
          if (
            orderRequest.symbol.length === 6 &&
            !orderRequest.symbol.includes(':')
          ) {
            const base = orderRequest.symbol.substring(0, 3);
            const quote = orderRequest.symbol.substring(3, 6);
            priceSymbol = `OANDA:${base}_${quote}`;
          }
        }

        // Call our get-stock-price edge function
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

        const priceResponse = await fetch(
          `${supabaseUrl}/functions/v1/get-stock-price`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ symbol: priceSymbol }),
          }
        );

        if (!priceResponse.ok) {
          const errorBody = await priceResponse.text();
          throw new Error(
            `Price fetch failed: ${priceResponse.status} - ${errorBody}`
          );
        }

        const priceData: PriceData = await priceResponse.json();

        // Use current price (c) or fallback to previous close (pc)
        currentPrice = priceData.c || priceData.pc || 0;

        if (!currentPrice || currentPrice === 0) {
          throw new Error('Invalid price data received');
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addStep('market_data_fetch', false, errorMessage);
        return createErrorResponse(
          OrderExecutionErrorCode.MARKET_DATA_UNAVAILABLE,
          'Market data unavailable',
          errorMessage,
          503,
          { requestId }
        );
      }

      addStep('market_data_fetch', true);
      console.log(`[${requestId}] Market price fetched: ${currentPrice}`);

      // =========================================
      // STEP 6: Calculate margin requirement using margin calculation module
      // =========================================

      let marginRequired: number;
      let freeMargin: number;
      let marginLevel: number;

      try {
        marginRequired = calculateMarginRequired(
          orderRequest.quantity,
          currentPrice,
          assetSpec.leverage || 1
        );

        freeMargin = calculateFreeMargin(profile.equity, profile.margin_used);

        marginLevel = calculateMarginLevel(profile.equity, profile.margin_used);

        if (freeMargin < marginRequired) {
          addStep('margin_calculation', false, 'Insufficient margin');
          return createErrorResponse(
            OrderExecutionErrorCode.INSUFFICIENT_MARGIN,
            'Insufficient margin',
            {
              required: marginRequired.toFixed(2),
              available: freeMargin.toFixed(2),
              margin_level: marginLevel.toFixed(2),
            },
            400,
            { requestId }
          );
        }
      } catch (err) {
        addStep('margin_calculation', false, (err as Error).message);
        if (err instanceof MarginCalculationError) {
          return createErrorResponse(
            OrderExecutionErrorCode.INTERNAL_ERROR,
            'Margin calculation failed',
            (err as MarginCalculationError).details,
            400,
            { requestId }
          );
        }
        throw err;
      }

      addStep('margin_calculation', true);

      // =========================================
      // STEP 7: Calculate slippage using slippage calculation module
      // =========================================

      // Fetch market data for slippage calculation
      let marketData: MarketConditions | null = null;
      try {
        marketData = await fetchMarketConditions(orderRequest.symbol);
        addStep('market_conditions_fetch', true);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addStep('market_conditions_fetch', false, errorMessage);
        // Continue with execution using fallback values
      }

      let slippageResult: SlippageResult;
      try {
        slippageResult = calculateSlippage({
          symbol: orderRequest.symbol,
          side: orderRequest.side,
          marketPrice: currentPrice,
          orderQuantity: orderRequest.quantity,
          conditions: {
            currentVolatility: marketData?.volatility ?? 20,
            averageVolatility: marketData?.averageVolatility ?? 20,
            dailyVolume: marketData?.dailyVolume ?? 1000000,
            isHighVolatility: marketData?.isHighVolatility ?? false,
            isLowLiquidity: marketData?.isLowLiquidity ?? false,
            orderSizePercentage: marketData?.orderSizePercentage ?? 0.1,
            isAfterHours: marketData?.isAfterHours ?? false,
          },
        });
      } catch (err) {
        addStep('slippage_calculation', false, (err as Error).message);
        if (err instanceof SlippageCalculationError) {
          return createErrorResponse(
            OrderExecutionErrorCode.INTERNAL_ERROR,
            'Slippage calculation failed',
            (err as SlippageCalculationError).details,
            400,
            { requestId }
          );
        }
        throw err;
      }

      addStep('slippage_calculation', true);

      // =========================================
      // STEP 8: Calculate execution price with slippage
      // =========================================
      const executionPrice =
        orderRequest.side === 'buy'
          ? currentPrice * (1 + slippageResult.totalSlippage)
          : currentPrice * (1 - slippageResult.totalSlippage);

      // =========================================
      // STEP 9: Calculate commission using commission calculation module
      // =========================================

      let commissionResult: CommissionResult;
      try {
        // Map asset class string to enum
        const assetClassMap: Record<string, AssetClass> = {
          forex: AssetClass.Forex,
          stock: AssetClass.Stock,
          index: AssetClass.Index,
          commodity: AssetClass.Commodity,
          crypto: AssetClass.Crypto,
          etf: AssetClass.ETF,
          bond: AssetClass.Bond,
        };

        const commissionAssetClass =
          assetClassMap[assetSpec.asset_class.toLowerCase()] ||
          AssetClass.Forex;

        commissionResult = calculateCommission({
          symbol: orderRequest.symbol,
          assetClass: commissionAssetClass,
          side: orderRequest.side,
          quantity: orderRequest.quantity,
          executionPrice: executionPrice,
          accountTier: AccountTier.Standard,
        });
      } catch (err) {
        addStep('commission_calculation', false, (err as Error).message);
        if (err instanceof CommissionCalculationError) {
          return createErrorResponse(
            OrderExecutionErrorCode.INTERNAL_ERROR,
            'Commission calculation failed',
            (err as CommissionCalculationError).details,
            400,
            { requestId }
          );
        }
        throw err;
      }

      addStep('commission_calculation', true);

      // =========================================
      // STEP 10: Calculate total order cost including commission
      // =========================================
      const orderValue = orderRequest.quantity * executionPrice;
      const totalOrderCost =
        orderRequest.side === 'buy'
          ? orderValue + commissionResult.totalCommission
          : orderValue - commissionResult.totalCommission;

      // Verify sufficient balance for buy orders
      if (orderRequest.side === 'buy' && profile.balance < totalOrderCost) {
        addStep('balance_check', false, 'Insufficient balance');
        return createErrorResponse(
          OrderExecutionErrorCode.INSUFFICIENT_BALANCE,
          'Insufficient balance',
          {
            required: totalOrderCost.toFixed(2),
            available: profile.balance.toFixed(2),
          },
          400,
          { requestId }
        );
      }

      addStep('balance_check', true);

      // =========================================
      // STEP 10.5: Handle pending orders (limit, stop, stop_limit)
      // =========================================
      if (orderRequest.order_type !== 'market') {
        const { data: pendingOrder, error: pendingError } = await supabase
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
            commission: commissionResult.totalCommission,
            execution_price: executionPrice,
            total_cost: totalOrderCost,
          })
          .select()
          .single();

        if (pendingError) {
          addStep('pending_order_creation', false, pendingError.message);
          return createErrorResponse(
            OrderExecutionErrorCode.TRANSACTION_FAILED,
            'Failed to create pending order',
            pendingError.message,
            500,
            { requestId }
          );
        }

        // Create notification
        const { data: notificationData, error: notificationError } =
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'order',
            title: 'Order Placed',
            message: `Your ${orderRequest.order_type} ${
              orderRequest.side
            } order for ${
              orderRequest.symbol
            } has been placed and is pending execution at ${
              orderRequest.price || currentPrice
            }`,
            data: {
              order_id: pendingOrder.id,
              order_type: orderRequest.order_type,
              symbol: orderRequest.symbol,
              quantity: orderRequest.quantity,
              price: orderRequest.price || currentPrice,
            },
          });

        if (notificationError) {
          // Log the notification failure for investigation but don't break the order flow
          console.error(
            `[${requestId}] Notification insert failed for order ${pendingOrder.id}:`,
            {
              error: notificationError.message,
              code: notificationError.code,
              details: notificationError.details,
              order_id: pendingOrder.id,
              user_id: user.id,
              notification_payload: {
                user_id: user.id,
                type: 'order',
                title: 'Order Placed',
                message: `Your ${orderRequest.order_type} ${
                  orderRequest.side
                } order for ${
                  orderRequest.symbol
                } has been placed and is pending execution at ${
                  orderRequest.price || currentPrice
                }`,
                data: {
                  order_id: pendingOrder.id,
                  order_type: orderRequest.order_type,
                  symbol: orderRequest.symbol,
                  quantity: orderRequest.quantity,
                  price: orderRequest.price || currentPrice,
                },
              },
            }
          );

          // Optional: Send to monitoring/alerting system
          // In a real implementation, you might want to send this to your monitoring service
          // e.g., await sendToMonitoringService(notificationError, { orderId, requestId, userId });

          // Optional: Implement retry mechanism for critical notification failures
          // For now, we'll just log and continue - notification failure shouldn't block order execution
        } else {
          console.log(
            `[${requestId}] Notification created successfully for order ${pendingOrder.id}`
          );
        }

        addStep('pending_order_creation', true);

        return createSuccessResponse(
          {
            order_id: pendingOrder.id,
            status: 'pending',
            execution_details: {
              execution_price: (orderRequest.price || currentPrice).toFixed(4),
              slippage: '0.000000', // No slippage for pending orders
              commission: commissionResult.totalCommission.toFixed(2),
              total_cost: totalOrderCost.toFixed(2),
              timestamp: new Date().toISOString(),
              transaction_id: requestId,
            },
          },
          { requestId, executionTime: Date.now() - startTime }
        );
      }

      // =========================================
      // STEP 11: Execute order via multi-step atomic transaction
      // =========================================

      const transactionId = crypto.randomUUID();
      let executionResult: OrderExecutionResult;

      try {
        // Start atomic transaction by attempting to insert the order with idempotency constraint
        const { data: newOrder, error: orderInsertError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            symbol: orderRequest.symbol,
            order_type: orderRequest.order_type,
            side: orderRequest.side,
            quantity: orderRequest.quantity,
            price: null, // Market orders don't have a fixed price
            stop_loss: orderRequest.stop_loss || null,
            take_profit: orderRequest.take_profit || null,
            status: 'executing',
            idempotency_key: orderRequest.idempotency_key,
            commission: commissionResult.totalCommission,
            execution_price: executionPrice,
            total_cost: totalOrderCost,
            transaction_id: transactionId,
          })
          .select()
          .single();

        if (orderInsertError) {
          // Check if it's a unique constraint violation on idempotency_key
          if (orderInsertError.code === '23505') {
            addStep(
              'order_creation',
              false,
              'Duplicate order detected by database constraint'
            );
            return createErrorResponse(
              OrderExecutionErrorCode.DUPLICATE_ORDER,
              'Duplicate order',
              'Order with this idempotency key already exists',
              409,
              { requestId, transactionId }
            );
          }
          throw orderInsertError;
        }

        addStep('order_creation', true);
        console.log(`[${requestId}] Order created: ${newOrder.id}`);

        // Step 2: Update user balance and margin
        const { error: balanceUpdateError } = await supabase.rpc(
          'update_user_balance_and_margin',
          {
            p_user_id: user.id,
            p_order_id: newOrder.id,
            p_side: orderRequest.side,
            p_quantity: orderRequest.quantity,
            p_execution_price: executionPrice,
            p_commission: commissionResult.totalCommission,
            p_total_cost: totalOrderCost,
          }
        );

        if (balanceUpdateError) {
          // Rollback the order if balance update fails
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              failure_reason: 'Balance update failed',
            })
            .eq('id', newOrder.id);

          addStep('balance_update', false, balanceUpdateError.message);
          throw new Error(
            `Balance update failed: ${balanceUpdateError.message}`
          );
        }

        addStep('balance_update', true);
        console.log(`[${requestId}] Balance and margin updated`);

        // Step 3: Create position record
        const { data: position, error: positionError } = await supabase
          .from('positions')
          .insert({
            user_id: user.id,
            order_id: newOrder.id,
            symbol: orderRequest.symbol,
            side: orderRequest.side,
            quantity: orderRequest.quantity,
            entry_price: executionPrice,
            current_price: executionPrice,
            margin_used: marginRequired,
            status: 'open',
            stop_loss: orderRequest.stop_loss || null,
            take_profit: orderRequest.take_profit || null,
            commission_paid: commissionResult.totalCommission,
            transaction_id: transactionId,
          })
          .select()
          .single();

        if (positionError) {
          // Rollback order and balance updates
          await supabase.rpc('rollback_order_execution', {
            p_order_id: newOrder.id,
            p_user_id: user.id,
            p_rollback_reason: 'Position creation failed',
          });

          addStep('position_creation', false, positionError.message);
          throw new Error(`Position creation failed: ${positionError.message}`);
        }

        addStep('position_creation', true);
        console.log(`[${requestId}] Position created: ${position.id}`);

        // Step 4: Mark order as executed
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'executed',
            position_id: position.id,
            executed_at: new Date().toISOString(),
          })
          .eq('id', newOrder.id)
          .select()
          .single();

        if (orderUpdateError) {
          // Rollback everything
          await supabase.rpc('rollback_order_execution', {
            p_order_id: newOrder.id,
            p_user_id: user.id,
            p_rollback_reason: 'Order update failed',
          });

          addStep('order_update', false, orderUpdateError.message);
          throw new Error(`Order update failed: ${orderUpdateError.message}`);
        }

        addStep('order_update', true);

        // Step 5: Create audit log with error handling
        const { data: auditData, error: auditError } = await supabase
          .from('order_audit_log')
          .insert({
            order_id: newOrder.id,
            user_id: user.id,
            action: 'order_executed',
            details: {
              execution_price: executionPrice,
              slippage: slippageResult.totalSlippage,
              commission: commissionResult.totalCommission,
              total_cost: totalOrderCost,
              transaction_steps: transactionSteps,
              request_id: requestId,
              transaction_id: transactionId,
            },
            created_at: new Date().toISOString(),
          });

        if (auditError) {
          // Log the audit failure for investigation but don't break the order flow
          console.error(
            `[${requestId}] Audit log insert failed for order ${newOrder.id} (transaction: ${transactionId}):`,
            {
              error: auditError.message,
              code: auditError.code,
              details: auditError.details,
              order_id: newOrder.id,
              request_id: requestId,
              transaction_id: transactionId,
              user_id: user.id,
            }
          );

          // Optional: Send to monitoring/alerting system
          // In a real implementation, you might want to send this to your monitoring service
          // e.g., await sendToMonitoringService(auditError, { orderId, requestId, transactionId });

          // Optional: Implement retry mechanism for critical audit failures
          // For now, we'll just log and continue - audit failure shouldn't block order execution
        } else {
          console.log(
            `[${requestId}] Audit log created successfully for order ${newOrder.id}`
          );
        }

        executionResult = {
          order_id: newOrder.id,
          position_id: position.id,
          status: 'executed',
          execution_details: {
            execution_price: executionPrice.toFixed(4),
            slippage: slippageResult.totalSlippage.toFixed(6),
            commission: commissionResult.totalCommission.toFixed(2),
            total_cost: totalOrderCost.toFixed(2),
            timestamp: new Date().toISOString(),
            transaction_id: transactionId,
          },
        };

        console.log(
          `[${requestId}] Order executed successfully: ${newOrder.id}`
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        addStep('atomic_execution', false, errorMessage);

        console.error(`[${requestId}] Atomic execution failed:`, errorMessage);

        return createErrorResponse(
          OrderExecutionErrorCode.TRANSACTION_FAILED,
          'Order execution failed',
          {
            error: errorMessage,
            transaction_steps: transactionSteps,
            transaction_id: transactionId,
          },
          500,
          { requestId, transactionId }
        );
      }

      // =========================================
      // STEP 12: Return success response with validation
      // =========================================

      // Validate response structure
      if (!validateExecutionResult(executionResult)) {
        addStep(
          'response_validation',
          false,
          'Invalid execution result structure'
        );
        return createErrorResponse(
          OrderExecutionErrorCode.INTERNAL_ERROR,
          'Invalid execution result',
          'Response structure validation failed',
          500,
          { requestId, transactionId }
        );
      }

      addStep('response_validation', true);

      const executionTime = Date.now() - startTime;
      console.log(
        `[${requestId}] Order execution completed in ${executionTime}ms`
      );

      return createSuccessResponse(executionResult, {
        requestId,
        transactionId,
        executionTime,
        transactionSteps: transactionSteps.filter((s) => !s.success),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${requestId}] Unexpected error:`, errorMessage);

      return createErrorResponse(
        OrderExecutionErrorCode.INTERNAL_ERROR,
        'Internal server error',
        {
          error: errorMessage,
          transaction_steps: transactionSteps,
        },
        500,
        { requestId }
      );
    }
  })();
});

// Helper function to create standardized error responses
function createErrorResponse(
  code: OrderExecutionErrorCode,
  message: string,
  details: unknown,
  status: number,
  context?: Record<string, unknown>
): Response {
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
    ...(context && { context }),
  };

  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-Request-ID': context?.requestId?.toString() || 'unknown',
  };

  // Add retry-after header for rate limit errors
  if (code === OrderExecutionErrorCode.RATE_LIMIT_EXCEEDED) {
    headers['Retry-After'] = '60';
  }

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, String(value)])
    ),
  });
}

// Helper function to create standardized success responses
function createSuccessResponse(
  data: OrderExecutionResult,
  context?: Record<string, unknown>
): Response {
  const successResponse = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
  };

  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-Request-ID': context?.requestId?.toString() || 'unknown',
  };

  return new Response(JSON.stringify(successResponse), {
    status: 200,
    headers: Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, String(value)])
    ),
  });
}

// Helper function to validate execution result structure
function validateExecutionResult(result: OrderExecutionResult): boolean {
  // Check required fields
  if (!result.order_id || !result.status || !result.execution_details) {
    return false;
  }

  // Check execution details structure
  const details = result.execution_details;
  if (
    !details.execution_price ||
    !details.slippage ||
    !details.commission ||
    !details.total_cost ||
    !details.timestamp ||
    !details.transaction_id
  ) {
    return false;
  }

  // Validate status values
  if (!['executed', 'pending'].includes(result.status)) {
    return false;
  }

  return true;
}
