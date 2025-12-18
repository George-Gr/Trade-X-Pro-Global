import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useAuth } from "./useAuth";

export interface RiskLimits {
  margin_call_level: number;
  stop_out_level: number;
  max_position_size: number;
  max_total_exposure: number;
  max_positions: number;
  daily_loss_limit: number;
  daily_trade_limit: number;
  enforce_stop_loss: boolean;
  min_stop_loss_distance: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  violations: string[];
}

export const useRiskLimits = () => {
  const { user } = useAuth();

  const { data: riskSettings, isLoading } = useQuery({
    queryKey: ["risk-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("risk_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as RiskLimits;
    },
    enabled: !!user,
  });

  const { data: currentPositions } = useQuery({
    queryKey: ["positions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: dailyPnL } = useQuery({
    queryKey: ["daily-pnl", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_pnl_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("trading_date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore not found error
      return data;
    },
    enabled: !!user,
  });

  const checkPositionLimit = (quantity: number): RiskCheckResult => {
    const violations: string[] = [];

    if (!riskSettings) {
      return { allowed: false, reason: "Risk settings not loaded", violations };
    }

    // Check max position size
    if (quantity > riskSettings.max_position_size) {
      violations.push(
        `Position size ${quantity} exceeds maximum allowed ${riskSettings.max_position_size} lots`,
      );
    }

    // Check max positions count
    const currentCount = currentPositions?.length || 0;
    if (currentCount >= riskSettings.max_positions) {
      violations.push(
        `Maximum number of open positions (${riskSettings.max_positions}) reached`,
      );
    }

    // Check daily loss limit
    if (dailyPnL && dailyPnL.breached_daily_limit) {
      violations.push(
        `Daily loss limit of $${riskSettings.daily_loss_limit} has been reached`,
      );
    }

    // Check daily trade limit
    if (dailyPnL && dailyPnL.trade_count >= riskSettings.daily_trade_limit) {
      violations.push(
        `Daily trade limit of ${riskSettings.daily_trade_limit} trades has been reached`,
      );
    }

    return {
      allowed: violations.length === 0,
      reason: violations.length > 0 ? violations[0] : undefined,
      violations,
    };
  };

  const checkStopLoss = (
    stopLoss: number | null,
    entryPrice: number,
  ): RiskCheckResult => {
    const violations: string[] = [];

    if (!riskSettings) {
      return { allowed: false, reason: "Risk settings not loaded", violations };
    }

    if (riskSettings.enforce_stop_loss && !stopLoss) {
      violations.push("Stop loss is required for all positions");
    }

    if (stopLoss && riskSettings.min_stop_loss_distance) {
      const distance = Math.abs(entryPrice - stopLoss);
      const minDistance = riskSettings.min_stop_loss_distance * 0.0001; // Convert pips to price

      if (distance < minDistance) {
        violations.push(
          `Stop loss distance ${(distance / 0.0001).toFixed(
            1,
          )} pips is below minimum ${riskSettings.min_stop_loss_distance} pips`,
        );
      }
    }

    return {
      allowed: violations.length === 0,
      reason: violations.length > 0 ? violations[0] : undefined,
      violations,
    };
  };

  const checkOrderRisk = (
    quantity: number,
    stopLoss: number | null,
    entryPrice: number,
  ): RiskCheckResult => {
    const positionCheck = checkPositionLimit(quantity);
    const stopLossCheck = checkStopLoss(stopLoss, entryPrice);

    const allViolations = [
      ...positionCheck.violations,
      ...stopLossCheck.violations,
    ];

    return {
      allowed: allViolations.length === 0,
      reason: allViolations.length > 0 ? allViolations[0] : undefined,
      violations: allViolations,
    };
  };

  return {
    riskSettings,
    currentPositions,
    dailyPnL,
    isLoading,
    checkPositionLimit,
    checkStopLoss,
    checkOrderRisk,
  };
};
