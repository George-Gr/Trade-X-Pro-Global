import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Swap rates by asset class (annualized percentage)
const SWAP_RATES: Record<string, { long: number; short: number }> = {
  forex: { long: -2.5, short: -2.5 },
  stock: { long: -3.0, short: 3.0 },
  index: { long: -2.0, short: -2.0 },
  commodity: { long: -4.0, short: -4.0 },
  crypto: { long: -15.0, short: -15.0 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET to prevent unauthorized access
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("X-Cron-Secret");

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      console.error("Unauthorized access attempt to calculate-swap-fees");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Calculating swap fees for overnight positions...");

    // Get all open positions
    const { data: positions, error: positionsError } = await supabase
      .from("positions")
      .select(
        `
        *,
        asset_specs:symbol (asset_class)
      `,
      )
      .eq("status", "open");

    if (positionsError) {
      console.error("Error fetching positions:", positionsError);
      throw positionsError;
    }

    if (!positions || positions.length === 0) {
      console.log("No open positions found");
      return new Response(
        JSON.stringify({
          message: "No positions to charge swap fees",
          total: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Processing swap fees for ${positions.length} positions`);

    let totalSwapFees = 0;
    const swapResults = [];

    for (const position of positions) {
      try {
        const assetClass =
          (position.asset_specs as unknown as Record<string, unknown>)
            ?.asset_class || "forex";
        const swapRate = SWAP_RATES[assetClass as string] || SWAP_RATES.forex;

        // Calculate daily swap rate (annualized rate / 365)
        const dailyRate =
          position.side === "buy"
            ? swapRate.long / 365 / 100
            : swapRate.short / 365 / 100;

        // Calculate swap fee based on position value
        const positionValue =
          position.quantity *
          100000 *
          (position.current_price || position.entry_price);
        const swapFee = positionValue * dailyRate;

        // Get user balance
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", position.user_id)
          .single();

        if (profileError) {
          console.error(
            `Error fetching profile for user ${position.user_id}:`,
            profileError,
          );
          continue;
        }

        // Deduct swap fee from balance
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ balance: profile.balance - swapFee })
          .eq("id", position.user_id);

        if (updateError) {
          console.error(
            `Error updating balance for user ${position.user_id}:`,
            updateError,
          );
          continue;
        }

        // Create ledger entry
        await supabase.from("ledger").insert({
          user_id: position.user_id,
          transaction_type: "swap",
          amount: -swapFee,
          balance_before: profile.balance,
          balance_after: profile.balance - swapFee,
          description: `Overnight swap fee for ${position.symbol}`,
          reference_id: position.id,
        });

        totalSwapFees += swapFee;
        swapResults.push({
          position_id: position.id,
          user_id: position.user_id,
          symbol: position.symbol,
          swap_fee: swapFee,
        });

        console.log(
          `Charged ${swapFee.toFixed(2)} swap fee for position ${position.id}`,
        );
      } catch (error) {
        console.error(
          `Error processing swap for position ${position.id}:`,
          error,
        );
        swapResults.push({
          position_id: position.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `Swap fees calculation complete. Total fees: ${totalSwapFees.toFixed(2)}`,
    );

    return new Response(
      JSON.stringify({
        message: "Swap fees calculated successfully",
        total_positions: positions.length,
        total_swap_fees: totalSwapFees,
        results: swapResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in calculate-swap-fees:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
