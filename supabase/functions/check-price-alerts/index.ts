import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema for defense-in-depth
const PriceUpdateSchema = z.object({
  symbol: z.string().trim().min(1, 'Symbol required').max(20, 'Symbol too long').regex(/^[A-Z0-9_]+$/, 'Invalid symbol format'),
  current_price: z.number().positive('Price must be positive').finite('Price must be finite'),
});

interface PriceUpdate {
  symbol: string;
  current_price: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for security
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("X-Cron-Secret");

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error("Unauthorized access attempt to check-price-alerts");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    // Validate input with Zod
    const validation = PriceUpdateSchema.safeParse(body);
    if (!validation.success) {
      console.error('Invalid input:', validation.error.format());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input parameters',
          details: validation.error.issues.map((i: { path: (string | number)[]; message: string }) => `${i.path.join('.')}: ${i.message}`)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { symbol, current_price } = validation.data;

    console.log("Checking price alerts for:", symbol, "at price:", current_price);

    // Get all active price alerts for this symbol
    const { data: alerts, error: alertsError } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("symbol", symbol)
      .eq("triggered", false);

    if (alertsError) {
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No alerts to check" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const triggeredAlerts = [];

    for (const alert of alerts) {
      let shouldTrigger = false;

      if (alert.condition === "above" && current_price >= alert.target_price) {
        shouldTrigger = true;
      } else if (alert.condition === "below" && current_price <= alert.target_price) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        // Mark alert as triggered
        await supabase
          .from("price_alerts")
          .update({ triggered: true, triggered_at: new Date().toISOString() })
          .eq("id", alert.id);

        triggeredAlerts.push(alert);

        // Send notification
        await supabase.functions.invoke("send-notification", {
          body: {
            user_id: alert.user_id,
            type: "price_alert",
            title: `Price Alert: ${symbol}`,
            message: `${symbol} has reached your target price of ${alert.target_price}. Current price: ${current_price}`,
            data: {
              symbol,
              target_price: alert.target_price,
              current_price,
              condition: alert.condition,
            },
          },
        });

        console.log("Price alert triggered:", alert.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Price alerts checked",
        triggered_count: triggeredAlerts.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in check-price-alerts function:", err);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});