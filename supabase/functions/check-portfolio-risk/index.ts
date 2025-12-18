import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

// Type declarations for Deno runtime globals
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

interface RiskMetrics {
  totalEquity: number;
  totalMarginUsed: number;
  freeMargin: number;
  marginLevel: number;
  dailyPnL: number;
  openPositionCount: number;
  totalExposure: number;
  riskStatus: "safe" | "warning" | "critical" | "monitor";
  violatedThresholds: string[];
}

interface Position {
  id: string;
  user_id: string;
  quantity: number;
  current_price: number;
  entry_price: number;
  side: "long" | "short";
  margin_used?: number;
  status: string;
}

interface Profile {
  id: string;
  balance: number;
  margin_status?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const checkAllUsers = req.method === "GET";
    let userId: string | null = null;

    if (checkAllUsers) {
      // For scheduled GET requests, require CRON_SECRET
      const CRON_SECRET = Deno.env.get("CRON_SECRET");
      const providedSecret = req.headers.get("X-Cron-Secret");

      if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
        console.error("Unauthorized access attempt to check-portfolio-risk");
        return new Response("Unauthorized", { status: 401 });
      }
    } else {
      // For POST requests, require auth header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401 });
      }

      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response("Unauthorized", { status: 401 });
      }

      userId = user.id;
    }

    let usersToCheck: string[] = [];

    if (userId) {
      usersToCheck = [userId];
    } else {
      // Check all active users with open positions
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("account_status", "active")
        .limit(1000);

      if (error) {
        console.error("Error fetching users:", error);
        return new Response("Internal server error", { status: 500 });
      }

      usersToCheck = (users || []).map((u: { id: string }) => u.id);
    }

    const results: unknown[] = [];
    let alertsCreated = 0;
    let statusChanges = 0;

    for (const uid of usersToCheck) {
      try {
        // Get user's current positions
        const { data: positions, error: posError } = await supabase
          .from("positions")
          .select("*")
          .eq("user_id", uid)
          .eq("status", "open");

        if (posError) {
          console.error(`Error fetching positions for ${uid}:`, posError);
          continue;
        }

        // Get user profile for equity
        const { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("balance, margin_status")
          .eq("id", uid)
          .single();

        if (profError) {
          console.error(`Error fetching profile for ${uid}:`, profError);
          continue;
        }

        // Calculate metrics
        const totalExposure = (positions || []).reduce(
          (sum: number, pos: Position) => {
            return sum + Math.abs(pos.quantity * pos.current_price);
          },
          0,
        );

        const totalMarginUsed = (positions || []).reduce(
          (sum: number, pos: Position) => {
            return sum + (pos.margin_used || 0);
          },
          0,
        );

        const equity =
          (profile?.balance || 0) +
          (positions || []).reduce((sum: number, pos: Position) => {
            const pnl =
              pos.side === "long"
                ? (pos.current_price - pos.entry_price) * pos.quantity
                : (pos.entry_price - pos.current_price) * pos.quantity;
            return sum + pnl;
          }, 0);

        const marginLevel =
          totalMarginUsed > 0 ? (equity / totalMarginUsed) * 100 : 0;

        // Determine risk status
        let riskStatus = "safe";
        const violations: string[] = [];

        if (marginLevel < 50) {
          riskStatus = "critical";
          violations.push("liquidation_risk");
        } else if (marginLevel < 100) {
          riskStatus = "critical";
          violations.push("margin_call");
        } else if (marginLevel < 150) {
          riskStatus = "warning";
          violations.push("margin_warning");
        }

        // Check if status changed
        const previousStatus = profile?.margin_status || "safe";
        if (previousStatus !== riskStatus) {
          statusChanges++;

          // Update profile with new status
          await supabase
            .from("profiles")
            .update({ margin_status: riskStatus })
            .eq("id", uid);

          // Create alert if critical or warning
          if (riskStatus !== "safe") {
            const { error: alertError } = await supabase
              .from("portfolio_risk_alerts")
              .insert({
                user_id: uid,
                threshold_type: violations[0] || "margin_warning",
                current_value: marginLevel,
                threshold_value: riskStatus === "critical" ? 100 : 150,
                exceedance_percentage: Math.max(
                  0,
                  ((150 - marginLevel) / 150) * 100,
                ),
                alert_status: riskStatus,
              });

            if (!alertError) {
              alertsCreated++;
            }
          }
        }

        // Store metrics snapshot
        await supabase.from("risk_metrics_snapshots").insert({
          user_id: uid,
          total_equity: Math.max(0, equity),
          total_margin_used: totalMarginUsed,
          total_margin_required: totalMarginUsed,
          free_margin: Math.max(0, equity - totalMarginUsed),
          margin_level: marginLevel,
          daily_pnl: 0, // Simplified - would need order history
          daily_pnl_percentage: 0,
          max_drawdown_today: 0,
          total_exposure: totalExposure,
          max_concentration:
            totalExposure > 0
              ? Math.max(
                  ...(positions || []).map(
                    (p: Position) =>
                      (Math.abs(p.quantity * p.current_price) / totalExposure) *
                      100,
                  ),
                  0,
                )
              : 0,
          portfolio_correlation: 50, // Simplified
          var_estimate:
            ((totalExposure * 0.15 * 1.645) / Math.max(equity, 1)) * 100,
          risk_status: riskStatus,
          open_position_count: positions?.length || 0,
        });

        results.push({
          userId: uid,
          riskStatus,
          marginLevel: marginLevel.toFixed(2),
          violations,
        });
      } catch (error) {
        console.error(`Error processing user ${uid}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkedUsers: usersToCheck.length,
        alertsCreated,
        statusChanges,
        results,
        processingTimeMs: Date.now(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in check-portfolio-risk:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
