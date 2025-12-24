import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * React 19 Automatic Batching for Risk Calculations
 * Optimized for high-frequency risk management updates with automatic batching
 */

export interface RiskCalculationInput {
  position: {
    symbol: string;
    side: 'long' | 'short';
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    leverage: number;
  };
  account: {
    balance: number;
    equity: number;
    marginUsed: number;
    marginLevel: number;
    freeMargin: number;
  };
  market: {
    volatility: number;
    spread: number;
    overnightRate: number;
  };
}

export interface RiskMetrics {
  // Core risk metrics
  marginRequired: number;
  marginLevel: number;
  riskAmount: number;
  riskPercentage: number;
  potentialPnL: number;

  // Advanced risk metrics
  valueAtRisk: number; // VaR at 95% confidence
  expectedShortfall: number; // Conditional VaR
  maxDrawdown: number;
  sharpeRatio: number;

  // Liquidation and stop-loss metrics
  liquidationPrice: number;
  stopLossLevel: number;
  takeProfitLevel: number;

  // Position sizing recommendations
  recommendedSize: number;
  maxSize: number;
  optimalSize: number;
}

export interface RiskAlert {
  type: 'warning' | 'critical' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export interface BatchedRiskState {
  calculations: Map<string, RiskMetrics>;
  alerts: RiskAlert[];
  lastUpdate: number;
  isCalculating: boolean;
  batchSize: number;
  pendingUpdates: number;
}

/**
 * Hook for automatic batching of risk calculations
 * Leverages React 19's automatic batching for optimal performance
 */
export function useRiskCalculationsBatched(
  maxBatchSize = 50,
  batchTimeout = 16 // ~60fps batching
) {
  const [state, setState] = useState<BatchedRiskState>({
    calculations: new Map(),
    alerts: [],
    lastUpdate: Date.now(),
    isCalculating: false,
    batchSize: 0,
    pendingUpdates: 0,
  });

  const pendingUpdatesRef = useRef(new Map<string, RiskCalculationInput>());
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Complex risk calculation function
   * Simulates sophisticated risk analysis that would be expensive
   */
  const calculateRiskMetrics = useCallback(
    (input: RiskCalculationInput): RiskMetrics => {
      const { position, account, market } = input;
      const { symbol, side, quantity, entryPrice, currentPrice, leverage } =
        position;

      // Core calculations
      const notionalValue = quantity * currentPrice;
      const marginRequired = notionalValue / leverage;
      const marginLevel =
        account.equity > 0 ? (account.equity / marginRequired) * 100 : 0;
      const riskAmount = Math.abs(currentPrice - entryPrice) * quantity;
      const riskPercentage =
        account.balance > 0 ? (riskAmount / account.balance) * 100 : 0;

      // P&L calculations
      const priceDifference =
        side === 'long' ? currentPrice - entryPrice : entryPrice - currentPrice;
      const potentialPnL = priceDifference * quantity;

      // Advanced risk metrics (simplified for demo)
      const volatilityAdjustment = market.volatility || 0.02;
      const valueAtRisk = notionalValue * volatilityAdjustment * 1.645; // 95% confidence
      const expectedShortfall = valueAtRisk * 1.5; // Simplified
      const maxDrawdown = riskAmount * 2; // Simplified
      const sharpeRatio = potentialPnL > 0 ? potentialPnL / valueAtRisk : 0;

      // Liquidation and stop-loss calculations
      const liquidationDistance = 1 / leverage;
      const liquidationPrice =
        side === 'long'
          ? currentPrice * (1 - liquidationDistance)
          : currentPrice * (1 + liquidationDistance);

      const stopLossDistance = Math.max(
        riskAmount / quantity,
        currentPrice * 0.01
      );
      const stopLossLevel =
        side === 'long'
          ? currentPrice - stopLossDistance
          : currentPrice + stopLossDistance;

      const takeProfitDistance = stopLossDistance * 2; // 2:1 risk-reward
      const takeProfitLevel =
        side === 'long'
          ? currentPrice + takeProfitDistance
          : currentPrice - takeProfitDistance;

      // Position sizing recommendations
      const maxRiskPerTrade = account.balance * 0.02; // 2% risk per trade
      const riskPerUnit = Math.abs(currentPrice - stopLossLevel);
      const maxSizeBasedOnRisk = maxRiskPerTrade / riskPerUnit;
      const maxSizeBasedOnMargin =
        account.freeMargin / (currentPrice / leverage);
      const maxSize = Math.min(maxSizeBasedOnRisk, maxSizeBasedOnMargin);

      const optimalSize = maxSize * 0.8; // Conservative 80% of max
      const recommendedSize = Math.min(optimalSize, quantity); // Don't recommend larger than current

      return {
        marginRequired,
        marginLevel,
        riskAmount,
        riskPercentage,
        potentialPnL,
        valueAtRisk,
        expectedShortfall,
        maxDrawdown,
        sharpeRatio,
        liquidationPrice,
        stopLossLevel,
        takeProfitLevel,
        recommendedSize,
        maxSize,
        optimalSize,
      };
    },
    []
  );

  /**
   * Process batched risk calculations
   * Automatically triggered when batch is full or timeout expires
   */
  const processBatch = useCallback(async () => {
    if (pendingUpdatesRef.current.size === 0) return;

    const calculationStart = performance.now();
    setState((prev) => ({
      ...prev,
      isCalculating: true,
      batchSize: pendingUpdatesRef.current.size,
    }));

    try {
      // Process all pending updates in a single batch
      const newCalculations = new Map(state.calculations);
      const newAlerts: RiskAlert[] = [...state.alerts];
      const batchResults: Array<{ symbol: string; metrics: RiskMetrics }> = [];

      // Process each calculation
      pendingUpdatesRef.current.forEach((input, symbol) => {
        const metrics = calculateRiskMetrics(input);
        newCalculations.set(symbol, metrics);
        batchResults.push({ symbol, metrics });

        // Generate alerts based on calculated metrics
        const alerts = generateRiskAlerts(metrics, symbol);
        newAlerts.push(...alerts);
      });

      // Clear pending updates
      pendingUpdatesRef.current.clear();

      const calculationTime = performance.now() - calculationStart;

      // Track performance
      performanceMonitoring.recordCustomTiming(
        'risk-calculation-batch',
        calculationStart,
        calculationTime
      );

      // Update state with automatic batching
      setState((prev) => ({
        ...prev,
        calculations: newCalculations,
        alerts: newAlerts.slice(-50), // Keep last 50 alerts
        lastUpdate: Date.now(),
        isCalculating: false,
        batchSize: 0,
        pendingUpdates: 0,
      }));

      // Log performance warnings for slow calculations
      if (calculationTime > 100) {
        console.warn(
          `Slow risk calculation batch: ${calculationTime.toFixed(2)}ms for ${
            batchResults.length
          } positions`
        );
      }
    } catch (error) {
      console.error('Error in batched risk calculations:', error);
      setState((prev) => ({ ...prev, isCalculating: false }));
    }
  }, [state.calculations, state.alerts, calculateRiskMetrics]);

  /**
   * Queue risk calculation for batching
   * Automatically batches multiple updates for optimal performance
   */
  const queueRiskCalculation = useCallback(
    (symbol: string, input: RiskCalculationInput) => {
      // Add to pending updates
      pendingUpdatesRef.current.set(symbol, input);

      setState((prev) => ({
        ...prev,
        pendingUpdates: prev.pendingUpdates + 1,
      }));

      // Clear existing timer
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }

      // Set up new batch timer
      batchTimerRef.current = setTimeout(() => {
        processBatch();
      }, batchTimeout);

      // Process immediately if batch is full
      if (pendingUpdatesRef.current.size >= maxBatchSize) {
        processBatch();
      }
    },
    [maxBatchSize, batchTimeout, processBatch]
  );

  /**
   * Generate risk alerts based on calculated metrics
   */
  const generateRiskAlerts = (
    metrics: RiskMetrics,
    symbol: string
  ): RiskAlert[] => {
    const alerts: RiskAlert[] = [];
    const now = Date.now();

    // Margin level alerts
    if (metrics.marginLevel < 100) {
      alerts.push({
        type: 'critical',
        metric: 'margin_level',
        value: metrics.marginLevel,
        threshold: 100,
        message: `Margin call risk for ${symbol}: ${metrics.marginLevel.toFixed(
          1
        )}%`,
        timestamp: now,
      });
    } else if (metrics.marginLevel < 200) {
      alerts.push({
        type: 'warning',
        metric: 'margin_level',
        value: metrics.marginLevel,
        threshold: 200,
        message: `Low margin level for ${symbol}: ${metrics.marginLevel.toFixed(
          1
        )}%`,
        timestamp: now,
      });
    }

    // Risk percentage alerts
    if (metrics.riskPercentage > 5) {
      alerts.push({
        type: 'warning',
        metric: 'risk_percentage',
        value: metrics.riskPercentage,
        threshold: 5,
        message: `High risk trade for ${symbol}: ${metrics.riskPercentage.toFixed(
          1
        )}%`,
        timestamp: now,
      });
    }

    // VaR alerts
    if (metrics.valueAtRisk > 1000) {
      alerts.push({
        type: 'info',
        metric: 'value_at_risk',
        value: metrics.valueAtRisk,
        threshold: 1000,
        message: `High VaR for ${symbol}: $${metrics.valueAtRisk.toFixed(2)}`,
        timestamp: now,
      });
    }

    return alerts;
  };

  /**
   * Get risk metrics for a specific symbol
   */
  const getRiskMetrics = useCallback(
    (symbol: string): RiskMetrics | null => {
      return state.calculations.get(symbol) || null;
    },
    [state.calculations]
  );

  /**
   * Get all current risk alerts
   */
  const getRiskAlerts = useCallback((): RiskAlert[] => {
    return state.alerts.filter(
      (alert) => Date.now() - alert.timestamp < 300000 // Keep alerts for 5 minutes
    );
  }, [state.alerts]);

  /**
   * Clear old alerts
   */
  const clearOldAlerts = useCallback(() => {
    const fiveMinutesAgo = Date.now() - 300000;
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((alert) => alert.timestamp > fiveMinutesAgo),
    }));
  }, []);

  /**
   * Force process pending calculations immediately
   */
  const forceProcessBatch = useCallback(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    processBatch();
  }, [processBatch]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, []);

  // Auto-clear old alerts every minute
  useEffect(() => {
    const interval = setInterval(clearOldAlerts, 60000);
    return () => clearInterval(interval);
  }, [clearOldAlerts]);

  return {
    // State
    calculations: state.calculations,
    alerts: getRiskAlerts(),
    isCalculating: state.isCalculating,
    lastUpdate: state.lastUpdate,

    // Actions
    queueRiskCalculation,
    getRiskMetrics,
    forceProcessBatch,
    clearOldAlerts,

    // Utilities
    getBatchStatus: () => ({
      pending: pendingUpdatesRef.current.size,
      maxSize: maxBatchSize,
      timeout: batchTimeout,
    }),
  };
}

/**
 * Hook for monitoring margin calls with automatic batching
 */
export function useMarginCallMonitoring() {
  const [marginCalls, setMarginCalls] = useState<
    Array<{
      symbol: string;
      marginLevel: number;
      timestamp: number;
      severity: 'low' | 'medium' | 'high';
    }>
  >([]);

  /**
   * Check for margin calls and add to batched updates
   */
  const checkMarginCall = useCallback((symbol: string, marginLevel: number) => {
    const now = Date.now();
    let severity: 'low' | 'medium' | 'high' = 'low';

    if (marginLevel < 50) {
      severity = 'high';
    } else if (marginLevel < 100) {
      severity = 'medium';
    }

    // Only add if it's a new margin call or severity increased
    setMarginCalls((prev) => {
      const existing = prev.find((call) => call.symbol === symbol);
      if (
        !existing ||
        getSeverityLevel(existing.severity) < getSeverityLevel(severity)
      ) {
        return [
          ...prev.filter((call) => call.symbol !== symbol),
          { symbol, marginLevel, timestamp: now, severity },
        ];
      }
      return prev;
    });
  }, []);

  const getSeverityLevel = (severity: 'low' | 'medium' | 'high'): number => {
    switch (severity) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      default:
        return 0;
    }
  };

  /**
   * Clear resolved margin calls
   */
  const clearResolvedCalls = useCallback(() => {
    setMarginCalls((prev) => prev.filter((call) => call.marginLevel < 150));
  }, []);

  return {
    marginCalls,
    checkMarginCall,
    clearResolvedCalls,
    hasActiveCalls: marginCalls.length > 0,
  };
}
