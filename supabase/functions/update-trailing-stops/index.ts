import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for security
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("X-Cron-Secret");

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error("Unauthorized access attempt to update-trailing-stops");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Updating trailing stop losses...");

    // Get all open positions with trailing stops enabled
    const { data: positions, error: positionsError } = await supabase
      .from("positions")
      .select("*")
      .eq("status", "open")
      .eq("trailing_stop_enabled", true);

    if (positionsError) throw positionsError;

    if (!positions || positions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No positions with trailing stops" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let updatedCount = 0;
    let triggeredCount = 0;

    for (const position of positions) {
      const {
        id,
        symbol,
        side,
        current_price,
        trailing_stop_distance,
        highest_price,
        lowest_price,
        trailing_stop_price,
        user_id,
      } = position;

      if (!current_price || !trailing_stop_distance) continue;

      let shouldUpdate = false;
      let newHighestPrice = highest_price;
      let newLowestPrice = lowest_price;
      let newTrailingStopPrice = trailing_stop_price;
      let shouldClose = false;

      if (side === "buy") {
        // For long positions, track highest price
        if (!newHighestPrice || current_price > newHighestPrice) {
          newHighestPrice = current_price;
          newTrailingStopPrice = current_price - trailing_stop_distance;
          shouldUpdate = true;
        }

        // Check if current price hit the trailing stop
        if (trailing_stop_price && current_price <= trailing_stop_price) {
          shouldClose = true;
        }
      } else {
        // For short positions, track lowest price
        if (!newLowestPrice || current_price < newLowestPrice) {
          newLowestPrice = current_price;
          newTrailingStopPrice = current_price + trailing_stop_distance;
          shouldUpdate = true;
        }

        // Check if current price hit the trailing stop
        if (trailing_stop_price && current_price >= trailing_stop_price) {
          shouldClose = true;
        }
      }

      if (shouldClose) {
        // Close position via close-position function
        console.log(`Trailing stop triggered for position ${id}, closing...`);
        
        const { error: closeError } = await supabase.functions.invoke("close-position", {
          body: {
            position_id: id,
            close_quantity: position.quantity,
            idempotency_key: `trailing_stop_${id}_${Date.now()}`,
          },
        });

        if (closeError) {
          console.error(`Error closing position ${id}:`, closeError);
        } else {
          triggeredCount++;
          
          // Send notification
          await supabase.functions.invoke("send-notification", {
            body: {
              user_id,
              type: "position_closed",
              title: `Trailing Stop Triggered: ${symbol}`,
              message: `Your ${side} position on ${symbol} was closed by trailing stop at ${current_price.toFixed(5)}.`,
              data: {
                symbol,
                side,
                close_price: current_price,
                reason: "trailing_stop",
              },
            },
          });
        }
      } else if (shouldUpdate) {
        // Update trailing stop levels
        const { error: updateError } = await supabase
          .from("positions")
          .update({
            highest_price: newHighestPrice,
            lowest_price: newLowestPrice,
            trailing_stop_price: newTrailingStopPrice,
          })
          .eq("id", id);

        if (updateError) {
          console.error(`Error updating trailing stop for ${id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated trailing stop for ${symbol}: ${newTrailingStopPrice.toFixed(5)}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Trailing stops updated",
        positions_checked: positions.length,
        stops_updated: updatedCount,
        positions_closed: triggeredCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in update-trailing-stops function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
