/**
 * Hook: usePnLCalculations
 *
 * Real-time P&L calculations with memoization to prevent excessive recalculations.
 * Integrates position data, current prices, and P&L formulas for fast updates.
 *
 * Features:
 * - Memoized P&L calculations for individual positions
 * - Portfolio-level P&L aggregation with caching
 * - Real-time updates from price stream
 * - Efficient state management to prevent re-renders
 * - Precision to 4 decimal places (trading standard)
 */

import { useMemo, useCallback } from "react";
import {
  calculateUnrealizedPnL,
  calculatePnLPercentage,
  calculateROI,
  type Position,
  type PositionPnLDetails,
  type PortfolioPnLSummary,
} from "@/lib/trading/pnlCalculation";

interface PnLPosition extends Position {
  unrealized_pnl?: number;
  margin_required?: number;
  entry_price?: number; // Legacy property mapping
}

interface UsePnLCalculationsOptions {
  enabled?: boolean;
  precision?: number; // Decimal places, default 4
}

interface UsePnLCalculationsReturn {
  // Position-level P&L
  getPositionPnL: (position: PnLPosition) => PositionPnLDetails | null;
  positionPnLMap: Map<string, PositionPnLDetails>;

  // Portfolio-level P&L
  portfolioPnL: PortfolioPnLSummary;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  totalPnL: number;

  // Convenience methods
  formatPnL: (value: number) => string;
  getPnLStatus: (pnl: number) => "profit" | "loss" | "breakeven";
  getPnLColor: (pnl: number) => "text-buy" | "text-sell" | "text-muted-foreground";
}

export const usePnLCalculations = (
  positions: PnLPosition[],
  prices: Map<string, number>,
  profileData?: { realized_pnl?: number; margin_used?: number },
  options: UsePnLCalculationsOptions = {}
): UsePnLCalculationsReturn => {
  const { enabled = true, precision = 4 } = options;

  // Memoized position-level P&L calculations
  const positionPnLMap = useMemo(() => {
    if (!enabled || !positions.length) return new Map();

    const map = new Map<string, PositionPnLDetails>();

    for (const position of positions) {
      const currentPrice = prices.get(position.symbol) || position.currentPrice;
      const entryPrice = position.entry_price ?? 0;
      if (!currentPrice || entryPrice === 0) continue;

      const pnlResult = calculateUnrealizedPnL(
        entryPrice,
        currentPrice,
        position.quantity,
        (position.side || 'long') as "long" | "short"
      );

      const positionValue = Math.round(currentPrice * position.quantity * 10000) / 10000;
      const marginRequired = position.margin_required || 0;

      // Calculate margin level
      const marginLevel =
        marginRequired > 0
          ? Math.round((positionValue / marginRequired) * 10000) / 10000
          : 0;

      // Simplified liquidation price (50% of entry for long, 150% for short)
      const liquidationPrice =
        position.side === "long"
          ? entryPrice * 0.5
          : entryPrice * 1.5;

      // Calculate ROI
      const roi =
        marginRequired > 0
          ? calculateROI(pnlResult.pnl, marginRequired)
          : 0;

      map.set(position.id, {
        positionId: position.id,
        symbol: position.symbol,
        side: position.side as "long" | "short",
        quantity: position.quantity,
        entryPrice,
        currentPrice,
        unrealizedPnL: pnlResult.pnl,
        unrealizedPnLPercentage: pnlResult.pnlPercentage,
        positionValue,
        marginRequired,
        marginLevel,
        liquidationPrice: Math.round(liquidationPrice * 10000) / 10000,
        roi,
        status: pnlResult.isProfit ? "profit" : pnlResult.isBreakeven ? "breakeven" : "loss",
      });
    }

    return map;
  }, [positions, prices, enabled]);

  // Memoized portfolio-level P&L aggregation
  const portfolioPnL = useMemo(() => {
    if (!enabled || !positions.length) {
      return {
        totalUnrealizedPnL: 0,
        totalRealizedPnL: 0,
        grossPnL: 0,
        netPnL: 0,
        pnlPercentage: 0,
        roi: 0,
        positionCount: 0,
        profitablePositions: 0,
        losingPositions: 0,
        breakevenPositions: 0,
        winRate: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    let totalUnrealizedPnL = 0;
    let profitableCount = 0;
    let losingCount = 0;
    let breakevenCount = 0;
    let largestWin = 0;
    let largestLoss = 0;

    // Aggregate position P&L
    for (const positionPnL of positionPnLMap.values()) {
      totalUnrealizedPnL += positionPnL.unrealizedPnL;

      if (positionPnL.status === "profit") {
        profitableCount++;
        if (positionPnL.unrealizedPnL > largestWin) {
          largestWin = positionPnL.unrealizedPnL;
        }
      } else if (positionPnL.status === "loss") {
        losingCount++;
        if (positionPnL.unrealizedPnL < largestLoss) {
          largestLoss = positionPnL.unrealizedPnL;
        }
      } else {
        breakevenCount++;
      }
    }

    const totalRealizedPnL = profileData?.realized_pnl || 0;
    const grossPnL = totalUnrealizedPnL + totalRealizedPnL;
    const netPnL = grossPnL;

    // Calculate portfolio metrics
    const totalCost = positions.reduce((sum, p) => sum + (p.entry_price ?? 0) * p.quantity, 0);
    const pnlPercentage = totalCost > 0 ? (netPnL / totalCost) * 100 : 0;

    // Calculate profit factor
    const profitSum = Array.from(positionPnLMap.values())
      .filter((p) => p.unrealizedPnL > 0)
      .reduce((sum, p) => sum + p.unrealizedPnL, 0);

    const lossSum = Array.from(positionPnLMap.values())
      .filter((p) => p.unrealizedPnL < 0)
      .reduce((sum, p) => sum + Math.abs(p.unrealizedPnL), 0);

    const profitFactor = lossSum > 0 ? profitSum / lossSum : 0;

    return {
      totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 10000) / 10000,
      totalRealizedPnL: Math.round(totalRealizedPnL * 10000) / 10000,
      grossPnL: Math.round(grossPnL * 10000) / 10000,
      netPnL: Math.round(netPnL * 10000) / 10000,
      pnlPercentage: Math.round(pnlPercentage * 10000) / 10000,
      roi: 0, // Would be calculated from margin
      positionCount: positions.length,
      profitablePositions: profitableCount,
      losingPositions: losingCount,
      breakevenPositions: breakevenCount,
      winRate:
        positions.length > 0
          ? Math.round((profitableCount / positions.length) * 100 * 10000) / 10000
          : 0,
      profitFactor: Math.round(profitFactor * 10000) / 10000,
      largestWin: Math.round(largestWin * 10000) / 10000,
      largestLoss: Math.round(largestLoss * 10000) / 10000,
    };
  }, [positionPnLMap, positions, profileData?.realized_pnl, enabled]);

  // Memoized totals
  const totalUnrealizedPnL = useMemo(
    () => portfolioPnL.totalUnrealizedPnL,
    [portfolioPnL]
  );

  const totalRealizedPnL = useMemo(
    () => portfolioPnL.totalRealizedPnL,
    [portfolioPnL]
  );

  const totalPnL = useMemo(() => portfolioPnL.netPnL, [portfolioPnL]);

  // Formatting utilities (memoized to prevent recreations)
  const formatPnL = useCallback(
    (value: number) => {
      const sign = value > 0 ? "+" : "";
      return `${sign}$${value.toFixed(2)}`;
    },
    []
  );

  const getPnLStatus = useCallback(
    (pnl: number): "profit" | "loss" | "breakeven" => {
      if (pnl > 0) return "profit";
      if (pnl < 0) return "loss";
      return "breakeven";
    },
    []
  );

  const getPnLColor = useCallback(
    (pnl: number): "text-buy" | "text-sell" | "text-muted-foreground" => {
      if (pnl > 0) return "text-buy";
      if (pnl < 0) return "text-sell";
      return "text-muted-foreground";
    },
    []
  );

  // Callback to get P&L for a specific position
  const getPositionPnL = useCallback(
    (position: PnLPosition) => {
      return positionPnLMap.get(position.id) || null;
    },
    [positionPnLMap]
  );

  return {
    getPositionPnL,
    positionPnLMap,
    portfolioPnL,
    totalUnrealizedPnL,
    totalRealizedPnL,
    totalPnL,
    formatPnL,
    getPnLStatus,
    getPnLColor,
  };
};
