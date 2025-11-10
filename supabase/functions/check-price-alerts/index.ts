import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceUpdate {
  symbol: string;
  current_price: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { symbol, current_price }: PriceUpdate = await req.json();

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
  } catch (error: any) {
    console.error("Error in check-price-alerts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});