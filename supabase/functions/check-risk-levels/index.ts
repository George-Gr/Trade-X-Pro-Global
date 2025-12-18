import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import {
  detectMarginCall,
  classifyMarginCallSeverity,
  shouldEscalateToLiquidation,
  MarginCallStatus,
} from "../lib/marginCallDetection.ts";
import { calculateMarginLevel } from "../lib/marginCalculations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Risk check result for a single user
 */
interface UserRiskCheckResult {
  userId: string;
  marginLevel: number;
  hasMarginCall: boolean;
  severity: string | null;
  marginCallCreated: boolean;
  escalatedToLiquidation: boolean;
  error?: string;
}

/**
 * Overall function result
 */
interface RiskCheckResult {
  success: boolean;
  timestamp: string;
  usersChecked: number;
  newMarginCalls: number;
  escalations: number;
  errors: number;
  results: UserRiskCheckResult[];
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for security
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("X-Cron-Secret");

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error("Unauthorized access attempt to check-risk-levels");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("Starting margin call detection check...");

    // Get all active users with open positions
    const { data: accounts, error: accountsError } = await supabaseClient
      .from("accounts")
      .select("id, user_id, equity, margin_used, account_status")
      .eq("account_status", "active")
      .gt("margin_used", 0);

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      throw accountsError;
    }

    console.log(
      `Checking ${accounts?.length || 0} users with active positions`,
    );

    const results: UserRiskCheckResult[] = [];
    let newMarginCalls = 0;
    let escalations = 0;

    // Process each account
    for (const account of accounts || []) {
      try {
        const { user_id, equity, margin_used } = account;

        // Calculate margin level
        const marginLevel = calculateMarginLevel(equity, margin_used);

        // Detect if margin call is triggered
        const detection = detectMarginCall(equity, margin_used);

        // Check if user already has an active margin call
        const { data: existingCalls } = await supabaseClient
          .from("margin_call_events")
          .select("id, status, triggered_at")
          .eq("user_id", user_id)
          .in("status", ["pending", "notified", "escalated"])
          .order("triggered_at", { ascending: false })
          .limit(1);

        const activeCall = existingCalls?.[0];

        let marginCallCreated = false;
        let shouldEscalate = false;

        // If not triggered, check for resolving existing call
        if (!detection.isTriggered) {
          if (activeCall && activeCall.status !== MarginCallStatus.RESOLVED) {
            await supabaseClient
              .from("margin_call_events")
              .update({
                status: MarginCallStatus.RESOLVED,
                resolved_at: new Date().toISOString(),
                resolution_type: "manual_deposit",
                updated_at: new Date().toISOString(),
              })
              .eq("id", activeCall.id);
          }
        } else {
          // Margin call IS triggered
          if (!activeCall) {
            // Create new margin call event
            const severity = classifyMarginCallSeverity(marginLevel);

            const { error: insertError } = await supabaseClient
              .from("margin_call_events")
              .insert({
                user_id,
                triggered_at: new Date().toISOString(),
                margin_level_at_trigger: marginLevel,
                status: MarginCallStatus.NOTIFIED,
                severity,
                positions_at_risk: 0,
                recommended_actions: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (!insertError) {
              marginCallCreated = true;
              newMarginCalls++;

              // Send notification via insert
              await supabaseClient.from("notifications").insert({
                user_id,
                type: "MARGIN_CALL",
                title: "Margin Call Alert",
                message: `Your account margin level is ${marginLevel.toFixed(2)}%. Add funds or close positions immediately.`,
                data: {
                  marginLevel,
                  severity,
                  priority: severity === "critical" ? "CRITICAL" : "HIGH",
                },
                read: false,
              });
            }
          }

          // Check if should escalate to liquidation
          if (detection.shouldEscalate && activeCall) {
            const timeSinceCreation = Math.floor(
              (Date.now() - new Date(activeCall.triggered_at).getTime()) /
                (1000 * 60),
            );

            if (shouldEscalateToLiquidation(marginLevel, timeSinceCreation)) {
              // Mark as escalated
              await supabaseClient
                .from("margin_call_events")
                .update({
                  status: MarginCallStatus.ESCALATED,
                  escalated_to_liquidation_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", activeCall.id);

              shouldEscalate = true;
              escalations++;

              // Send escalation notification
              await supabaseClient.from("notifications").insert({
                user_id,
                type: "LIQUIDATION_WARNING",
                title: "Critical Liquidation Warning",
                message: `CRITICAL: Account margin level at ${marginLevel.toFixed(2)}%. Liquidation will begin immediately.`,
                data: { marginLevel, priority: "CRITICAL" },
                read: false,
              });
            }
          }
        }

        results.push({
          userId: user_id,
          marginLevel,
          hasMarginCall: detection.isTriggered,
          severity: detection.isTriggered
            ? classifyMarginCallSeverity(marginLevel)
            : null,
          marginCallCreated,
          escalatedToLiquidation: shouldEscalate,
        });
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error);
        results.push({
          userId: account.user_id,
          marginLevel: 0,
          hasMarginCall: false,
          severity: null,
          marginCallCreated: false,
          escalatedToLiquidation: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const duration = Date.now() - startTime;

    const summary: RiskCheckResult = {
      success: true,
      timestamp: new Date().toISOString(),
      usersChecked: results.length,
      newMarginCalls,
      escalations,
      errors: results.filter((r) => !!r.error).length,
      results,
      message: `Risk check completed in ${duration}ms. Checked ${results.length} users, created ${newMarginCalls} new margin calls, escalated ${escalations} to liquidation.`,
    };

    console.log("Risk check complete:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Risk check error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
