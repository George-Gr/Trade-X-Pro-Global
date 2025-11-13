/**
 * Edge Function: Update Positions
 * 
 * Real-time position P&L, margin level, and risk metrics updates.
 * Called on every price tick to recalculate position values and margin levels.
 * 
 * Integrates:
 * - pnlCalculation.ts for P&L calculations
 * - marginCalculations.ts for margin requirements
 * - update_position_atomic() stored procedure for atomic updates
 * - Realtime subscriptions for UI broadcast
 */

// @ts-ignore - Deno import, TypeScript cannot resolve ESM URL imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Deno global declaration for TypeScript support
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => Promise<void>;
  env: {
    get(key: string): string | undefined;
  };
};

// ============================================================================
// TYPES
// ============================================================================

interface PositionMetrics {
  position_id: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  margin_level: number;
  margin_status: string;
}

interface UpdateError {
  position_id: string;
  symbol: string;
  error: string;
}

interface UpdatePositionsRequest {
  user_id: string;
  positions?: string[]; // Optional array of position IDs to update (default: all open)
  prices?: Record<string, number>; // Optional price override map
}

interface UpdatePositionsResponse {
  updated: PositionMetrics[];
  errors: UpdateError[];
  timestamp: string;
  processingTimeMs: number;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  // =========================================================================
  // CORS & METHOD CHECK
  // =========================================================================

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();

  try {
    // =====================================================================
    // PARSE REQUEST
    // =====================================================================

    const requestBody = (await req.json()) as UpdatePositionsRequest;
    const { user_id, positions: position_ids, prices: price_overrides } =
      requestBody;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // =====================================================================
    // AUTHENTICATE USER
    // =====================================================================

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // =====================================================================
    // INITIALIZE SUPABASE CLIENT
    // =====================================================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== user_id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // =====================================================================
    // FETCH OPEN POSITIONS
    // =====================================================================

    let positions;

    if (position_ids && position_ids.length > 0) {
      // Fetch specific positions
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .in("id", position_ids)
        .eq("user_id", user_id)
        .eq("status", "open");

      if (error) throw error;
      positions = data || [];
    } else {
      // Fetch all open positions
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "open");

      if (error) throw error;
      positions = data || [];
    }

    if (positions.length === 0) {
      return new Response(
        JSON.stringify({
          updated: [],
          errors: [],
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        } as UpdatePositionsResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // =====================================================================
    // FETCH CURRENT PRICES
    // =====================================================================

    const priceMap: Record<string, number> = price_overrides || {};
    const symbolsToFetch: string[] = [];

    for (const pos of positions) {
      if (!priceMap[pos.symbol]) {
        symbolsToFetch.push(pos.symbol);
      }
    }

    if (symbolsToFetch.length > 0) {
      // Try to fetch from price_cache table
      const { data: cachedPrices, error: cacheError } = await supabase
        .from("price_cache")
        .select("symbol, current_price")
        .in("symbol", symbolsToFetch)
        .order("updated_at", { ascending: false });

      if (!cacheError && cachedPrices) {
        for (const price of cachedPrices) {
          if (!priceMap[price.symbol]) {
            priceMap[price.symbol] = price.current_price;
          }
        }
      }

      // Fall back to current_price from positions if not in cache
      for (const pos of positions) {
        if (!priceMap[pos.symbol]) {
          priceMap[pos.symbol] = pos.current_price;
        }
      }
    }

    // =====================================================================
    // UPDATE POSITIONS ATOMICALLY
    // =====================================================================

    const updated: PositionMetrics[] = [];
    const errors: UpdateError[] = [];

    for (const position of positions) {
      try {
        const currentPrice = priceMap[position.symbol] || position.current_price;

        // Call stored procedure
        const { data, error } = await supabase.rpc(
          "update_position_atomic",
          {
            p_position_id: position.id,
            p_current_price: currentPrice,
            p_user_id: user_id,
          }
        );

        if (error) {
          errors.push({
            position_id: position.id,
            symbol: position.symbol,
            error: error.message,
          });
          continue;
        }

        if (data && data.success) {
          updated.push({
            position_id: data.position_id,
            symbol: data.symbol,
            side: data.side,
            quantity: data.quantity,
            entry_price: data.entry_price,
            current_price: data.current_price,
            unrealized_pnl: data.unrealized_pnl,
            margin_used: data.margin_used,
            margin_level: data.margin_level,
            margin_status: data.margin_status,
          });
        } else {
          errors.push({
            position_id: position.id,
            symbol: position.symbol,
            error: data?.error_message || "Unknown error",
          });
        }
      } catch (err) {
        errors.push({
          position_id: position.id,
          symbol: position.symbol,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // =====================================================================
    // BROADCAST REALTIME UPDATES
    // =====================================================================

    for (const metric of updated) {
      // Broadcast to Realtime subscribers
      await supabase
        .channel(`positions:${user_id}`)
        .send("broadcast", {
          event: "position:updated",
          payload: {
            id: metric.position_id,
            symbol: metric.symbol,
            current_price: metric.current_price,
            unrealized_pnl: metric.unrealized_pnl,
            margin_level: metric.margin_level,
            margin_status: metric.margin_status,
            updated_at: new Date().toISOString(),
          },
        });
    }

    // =====================================================================
    // RETURN RESPONSE
    // =====================================================================

    const response: UpdatePositionsResponse = {
      updated,
      errors,
      timestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error updating positions:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * USAGE EXAMPLES:
 *
 * 1. Update all open positions for a user:
 *    POST /functions/v1/update-positions
 *    {
 *      "user_id": "uuid-here"
 *    }
 *
 * 2. Update specific positions:
 *    POST /functions/v1/update-positions
 *    {
 *      "user_id": "uuid-here",
 *      "positions": ["pos-id-1", "pos-id-2"]
 *    }
 *
 * 3. Update with price overrides (for backtesting/simulation):
 *    POST /functions/v1/update-positions
 *    {
 *      "user_id": "uuid-here",
 *      "prices": {
 *        "BTC/USD": 42000,
 *        "EURUSD": 1.0950
 *      }
 *    }
 *
 * RESPONSE:
 * {
 *   "updated": [
 *     {
 *       "position_id": "pos-id",
 *       "symbol": "BTC/USD",
 *       "unrealized_pnl": 1500.50,
 *       "margin_level": 250.00,
 *       "margin_status": "SAFE"
 *     }
 *   ],
 *   "errors": [],
 *   "timestamp": "2025-11-13T14:30:00Z",
 *   "processingTimeMs": 245
 * }
 */
