import { useState, useEffect, useCallback, useRef } from "react";
import { useSlTpExecution, TriggerType } from "./useSlTpExecution";
import { usePositionUpdate, PositionMetrics } from "./usePositionUpdate";
import { usePriceStream, PriceData } from "./usePriceStream";
import type { Position } from "@/types/position";

/**
 * Tracks a position that has been triggered by SL/TP
 */
interface TriggeredPosition {
  positionId: string;
  triggerType: TriggerType;
  timestamp: number;
}

/**
 * State for SL/TP monitoring
 */
interface SLTPMonitoringState {
  isMonitoring: boolean;
  monitoredPositions: string[];
  triggeredPositions: Map<string, TriggeredPosition>;
  lastCheckTime: number | null;
}

/**
 * Hook for real-time stop loss and take profit monitoring
 *
 * Monitors open positions with SL/TP set and automatically executes
 * closures when price crosses thresholds. Works in conjunction with
 * useSlTpExecution for the actual closure execution.
 *
 * @returns Object with monitoring state and utilities
 *
 * @example
 * ```tsx
 * const { isMonitoring, triggeredPositions } = useSLTPMonitoring();
 *
 * if (isMonitoring) {
 *   return <div>Monitoring {triggeredPositions.size} positions</div>;
 * }
 * ```
 */
export const useSLTPMonitoring = () => {
  const [state, setState] = useState<SLTPMonitoringState>({
    isMonitoring: false,
    monitoredPositions: [],
    triggeredPositions: new Map(),
    lastCheckTime: null,
  });

  // Get positions and execution hook
  const { positions } = usePositionUpdate({ enabled: true });
  const { executeStopLossOrTakeProfit, isExecuting } = useSlTpExecution();

  // Track symbols that need price monitoring
  const monitorsRef = useRef<Set<string>>(new Set());

  /**
   * Extract unique symbols from positions that have SL/TP set
   */
  const getSymbolsToMonitor = useCallback((): string[] => {
    const positionsWithSlTp = positions.filter(
      (p) =>
        (p.stop_loss !== undefined || p.take_profit !== undefined) &&
        p.margin_status !== "LIQUIDATION",
    );
    return [...new Set(positionsWithSlTp.map((p) => p.symbol))];
  }, [positions]);

  // Subscribe to prices for monitored symbols
  const symbolsToMonitor = getSymbolsToMonitor();
  const { prices, isConnected: pricesConnected } = usePriceStream({
    symbols: symbolsToMonitor,
    enabled: symbolsToMonitor.length > 0,
  });

  /**
   * Check if stop loss should be triggered for a position
   *
   * Buy positions: trigger when price <= stop_loss
   * Sell positions: trigger when price >= stop_loss
   */
  const shouldTriggerStopLoss = useCallback(
    (position: PositionMetrics, currentPrice: number): boolean => {
      if (!position.stop_loss || position.margin_status === "LIQUIDATION") {
        return false;
      }

      if (position.side === "long") {
        // Buy position: trigger if price drops to or below SL
        return currentPrice <= position.stop_loss;
      } else if (position.side === "short") {
        // Sell position: trigger if price rises to or above SL
        return currentPrice >= position.stop_loss;
      }

      return false;
    },
    [],
  );

  /**
   * Check if take profit should be triggered for a position
   *
   * Buy positions: trigger when price >= take_profit
   * Sell positions: trigger when price <= take_profit
   */
  const shouldTriggerTakeProfit = useCallback(
    (position: PositionMetrics, currentPrice: number): boolean => {
      if (!position.take_profit || position.margin_status === "LIQUIDATION") {
        return false;
      }

      if (position.side === "long") {
        // Buy position: trigger if price rises to or above TP
        return currentPrice >= position.take_profit;
      } else if (position.side === "short") {
        // Sell position: trigger if price drops to or below TP
        return currentPrice <= position.take_profit;
      }

      return false;
    },
    [],
  );

  /**
   * Main monitoring effect: check prices and trigger closures
   */
  useEffect(() => {
    if (!positions.length || !pricesConnected || prices.size === 0) {
      setState((prev) => ({ ...prev, isMonitoring: false }));
      return;
    }

    // Get positions that have SL/TP set
    const positionsWithSlTp = positions.filter(
      (p) =>
        (p.stop_loss !== undefined || p.take_profit !== undefined) &&
        p.margin_status !== "LIQUIDATION",
    );

    if (positionsWithSlTp.length === 0) {
      setState((prev) => ({
        ...prev,
        isMonitoring: false,
        monitoredPositions: [],
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isMonitoring: true,
      monitoredPositions: positionsWithSlTp.map((p) => p.position_id),
      lastCheckTime: Date.now(),
    }));

    // Check each position for triggers
    positionsWithSlTp.forEach((position) => {
      const priceData = prices.get(position.symbol);
      if (!priceData) {
        return; // Price not available yet
      }

      const currentPrice = priceData.currentPrice;
      let triggerType: TriggerType | null = null;

      // Check stop loss first (higher priority)
      if (shouldTriggerStopLoss(position, currentPrice)) {
        triggerType = "stop_loss";
      }
      // Then check take profit
      else if (shouldTriggerTakeProfit(position, currentPrice)) {
        triggerType = "take_profit";
      }

      // Execute if trigger detected
      if (triggerType) {
        executeStopLossOrTakeProfit({
          positionId: position.position_id,
          triggerType,
          currentPrice,
        })
          .then(() => {
            // Mark as triggered
            setState((prev) => {
              const newTriggered = new Map(prev.triggeredPositions);
              newTriggered.set(position.position_id, {
                positionId: position.position_id,
                triggerType,
                timestamp: Date.now(),
              });
              return {
                ...prev,
                triggeredPositions: newTriggered,
              };
            });
          })
          .catch((error) => {
            // Silently log error; don't break monitoring
            console.error(
              `Failed to execute ${triggerType} for position ${position.position_id}:`,
              error,
            );
            // Keep monitoring despite error
          });
      }
    });
  }, [
    positions,
    prices,
    pricesConnected,
    shouldTriggerStopLoss,
    shouldTriggerTakeProfit,
    executeStopLossOrTakeProfit,
  ]);

  /**
   * Clear triggered positions older than 1 hour
   */
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        setState((prev) => {
          const now = Date.now();
          const oneHourMs = 60 * 60 * 1000;
          const cleaned = new Map(prev.triggeredPositions);

          cleaned.forEach((triggered, positionId) => {
            if (now - triggered.timestamp > oneHourMs) {
              cleaned.delete(positionId);
            }
          });

          if (cleaned.size !== prev.triggeredPositions.size) {
            return { ...prev, triggeredPositions: cleaned };
          }
          return prev;
        });
      },
      5 * 60 * 1000,
    ); // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  /**
   * Return utilities for consumers
   */
  return {
    isMonitoring: state.isMonitoring,
    monitoredPositions: state.monitoredPositions,
    monitoredCount: state.monitoredPositions.length,
    triggeredPositions: state.triggeredPositions,
    triggeredCount: state.triggeredPositions.size,
    lastCheckTime: state.lastCheckTime,
    isExecuting,
    pricesConnected,
    symbolsMonitored: symbolsToMonitor.length,
  };
};
