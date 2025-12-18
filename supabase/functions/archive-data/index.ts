/**
 * Archive Data Edge Function
 *
 * Archives data older than 1 year to archive tables.
 * Should be called monthly via cron job.
 *
 * @requires CRON_SECRET for authentication
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface ArchiveResult {
  success: boolean;
  archived: {
    orders: number;
    fills: number;
    ledger: number;
    positions: number;
  };
  error?: string;
  executionTime: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify cron secret for authentication
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");

    if (!cronSecret || cronSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the archive function
    const { data, error } = await supabase.rpc("archive_old_data");

    if (error) {
      console.error("Archive error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          executionTime: Date.now() - startTime,
        } as ArchiveResult),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get counts of archived data for reporting
    const [ordersCount, fillsCount, ledgerCount, positionsCount] =
      await Promise.all([
        supabase
          .from("orders_archive")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("fills_archive")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("ledger_archive")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("positions_archive")
          .select("id", { count: "exact", head: true }),
      ]);

    const result: ArchiveResult = {
      success: true,
      archived: {
        orders: ordersCount.count || 0,
        fills: fillsCount.count || 0,
        ledger: ledgerCount.count || 0,
        positions: positionsCount.count || 0,
      },
      executionTime: Date.now() - startTime,
    };

    console.log("Archive completed:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: Date.now() - startTime,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
