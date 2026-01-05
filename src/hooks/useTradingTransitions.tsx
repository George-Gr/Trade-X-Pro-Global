import { useToast } from '@/hooks/use-toast';
import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import { useDeferredValue, useState, useTransition } from 'react';

/**
 * React 19 useTransition hooks for trading UI responsiveness
 * Optimized for non-blocking updates during high-frequency trading operations
 */

export interface TradingFormState {
  symbol: string;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
}

export interface RiskCalculationState {
  marginRequired: number;
  marginLevel: number;
  availableMargin: number;
  riskAmount: number;
  potentialPnL: number;
  liquidationPrice: number;
  riskPercentage: number;
}

export interface TradingPosition {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  marginUsed: number;
  pnl: number;
  pnlPercentage: number;
  leverage: number;
  timestamp: number;
}

export interface MarginCall {
  timestamp: number;
  level: number;
  type: 'margin_call' | 'warning';
  message?: string;
}

export interface PositionUpdate {
  id: string;
  data: Partial<TradingPosition> & { id?: never };
}

export interface MarginData {
  available: number;
  used: number;
  level: number;
  calls: MarginCall[];
}

export interface TransitionConfig {
  // Timeout for transitions (default: 500ms)
  timeout?: number;
  // Whether to show loading states during transitions
  showLoadingState?: boolean;
  // Priority for concurrent updates
  priority?: 'high' | 'normal' | 'low';
  // Custom error handling
  onError?: (error: Error) => void;
}

/**
 * Hook for managing trading form state with useTransition
 * Provides non-blocking UI updates during order placement
 */
export function useTradingFormTransitions(
  initialState: TradingFormState,
  config: TransitionConfig = {}
) {
  const {
    timeout = 500,
    showLoadingState = true,
    priority = 'normal',
    onError,
  } = config;

  const [formState, setFormState] = useState<TradingFormState>(initialState);
  const [isPending, startFormTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riskState, setRiskState] = useState<RiskCalculationState>({
    marginRequired: 0,
    marginLevel: 0,
    availableMargin: 10000, // Default available margin
    riskAmount: 0,
    potentialPnL: 0,
    liquidationPrice: 0,
    riskPercentage: 0,
  });
  const [isCalculatingRisk, startRiskTransition] = useTransition();
  const { toast } = useToast();

  // Deferred values for non-critical updates
  const deferredFormState = useDeferredValue(formState);
  const deferredRiskState = useDeferredValue(riskState);

  /**
   * Update form state with concurrent rendering
   * Prevents blocking during complex form updates
   */
  const updateFormState = (updates: Partial<TradingFormState>) => {
    const updateStartTime = performance.now();

    startFormTransition(() => {
      try {
        setFormState((prev) => ({ ...prev, ...updates }));

        // Track transition performance
        const updateTime = performance.now() - updateStartTime;
        performanceMonitoring.recordCustomTiming(
          'form-state-update',
          updateStartTime,
          updateTime
        );

        if (updateTime > 16) {
          // Record slow update as performance metric
          import('@/lib/logger').then(({ logger }) => {
            logger.warn('Slow form update detected', {
              component: 'useTradingFormTransitions',
              action: 'update_form_state',
              metadata: { updateTime, threshold: 16 },
            });
          });
        }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to update form state');
        onError?.(err);
      }
    });
  };

  /**
   * Calculate risk metrics with useTransition
   * Non-blocking risk calculations during form updates
   */
  const calculateRiskMetrics = (updates: Partial<TradingFormState>) => {
    const calculationStartTime = performance.now();

    startRiskTransition(() => {
      try {
        const newState = { ...formState, ...updates };

        // Guard against undefined price
        const price = newState.price ?? 0;
        if (price === 0) return;

        const marginRequired =
          (newState.quantity * price * newState.leverage) / 100;
        const availableMargin = 10000; // Would come from user profile
        const marginLevel =
          availableMargin > 0 ? (availableMargin / marginRequired) * 100 : 0;
        const riskAmount = newState.quantity * price * 0.02; // 2% risk example
        const potentialPnL =
          newState.side === 'buy'
            ? (price - price * 0.95) * newState.quantity // 5% potential gain
            : (price * 1.05 - price) * newState.quantity; // 5% potential gain
        const liquidationPrice =
          newState.side === 'buy'
            ? price * (1 - 1 / newState.leverage)
            : price * (1 + 1 / newState.leverage);
        const riskPercentage = (riskAmount / availableMargin) * 100;

        const calculationTime = performance.now() - calculationStartTime;

        setRiskState({
          marginRequired,
          marginLevel,
          availableMargin,
          riskAmount,
          potentialPnL,
          liquidationPrice,
          riskPercentage,
        });

        // Track calculation performance
        performanceMonitoring.recordCustomTiming(
          'risk-calculation',
          calculationStartTime,
          calculationTime
        );

        // Show warning for high-risk trades
        if (riskPercentage > 10) {
          toast({
            title: 'High Risk Trade',
            description: `This trade represents ${riskPercentage.toFixed(
              1
            )}% of your available margin.`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to calculate risk metrics');
        onError?.(err);
      }
    });
  };

  /**
   * Optimized form submission with concurrent state management
   */
  const submitOrder = () => {
    const submissionStartTime = performance.now();

    // Validate form state
    if (!formState.symbol || !formState.quantity || !formState.price) {
      const err = new Error('Missing required form fields');
      onError?.(err);
      toast({
        title: 'Order Failed',
        description: err.message,
        variant: 'destructive',
      });
      return;
    }

    if (showLoadingState) {
      toast({
        title: 'Processing Order',
        description: 'Please wait while we process your order...',
      });
    }

    // TODO: Implement transition for order submission if synchronous state updates are needed

    // Handle async submission outside of transition
    const executeSubmission = async () => {
      try {
        // Simulate order submission process
        await new Promise((resolve) => setTimeout(resolve, 100));

        const submissionTime = performance.now() - submissionStartTime;
        performanceMonitoring.recordCustomTiming(
          'order-submission',
          submissionStartTime,
          submissionTime
        );

        toast({
          title: 'Order Submitted',
          description: `${formState.side.toUpperCase()} ${formState.quantity} ${
            formState.symbol
          }`,
        });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Order submission failed');
        onError?.(err);

        toast({
          title: 'Order Failed',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    setIsSubmitting(true);
    executeSubmission();
  };

  /**
   * Auto-calculate risk metrics when form state changes
   */
  const handleFormChange = (updates: Partial<TradingFormState>) => {
    updateFormState(updates);

    // Trigger risk calculation with deferred update
    setTimeout(() => {
      calculateRiskMetrics(updates);
    }, 0);
  };

  return {
    // Form state with concurrent updates
    formState: deferredFormState,
    isFormPending: isPending,

    // Risk calculation state with transitions
    riskState: deferredRiskState,
    isCalculatingRisk,

    // Submission state
    isSubmitting,

    // Actions
    updateFormState: handleFormChange,
    calculateRiskMetrics,
    submitOrder,

    // Utility functions
    resetForm: () => {
      startFormTransition(() => {
        setFormState(initialState);
        setRiskState({
          marginRequired: 0,
          marginLevel: 0,
          availableMargin: 10000,
          riskAmount: 0,
          potentialPnL: 0,
          liquidationPrice: 0,
          riskPercentage: 0,
        });
      });
    },
  };
}

/**
 * Hook for managing real-time position updates with useTransition
 * Optimized for high-frequency position updates
 */
export function usePositionTransitions() {
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [isUpdating, startPositionTransition] = useTransition();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isSelecting, startSelectionTransition] = useTransition();

  /**
   * Update positions with concurrent rendering
   * Prevents UI blocking during high-frequency updates
   */
  const updatePositions = (newPositions: TradingPosition[]) => {
    startPositionTransition(() => {
      const updateStart = performance.now();
      setPositions(newPositions);

      // Track update performance
      const updateEnd = performance.now();
      performanceMonitoring.recordCustomTiming(
        'position-update-concurrent',
        updateStart,
        updateEnd - updateStart
      );
    });
  };

  /**
   * Select position with smooth transition
   */
  const selectPosition = (positionId: string | null) => {
    startSelectionTransition(() => {
      const selectionStart = performance.now();
      setSelectedPosition(positionId);

      // Track selection performance
      const selectionEnd = performance.now();
      performanceMonitoring.recordCustomTiming(
        'position-selection',
        selectionStart,
        selectionEnd - selectionStart
      );
    });
  };

  /**
   * Bulk update multiple positions efficiently
   */
  const bulkUpdatePositions = (updates: PositionUpdate[]) => {
    startPositionTransition(() => {
      setPositions((prev) => {
        const updated = [...prev];
        updates.forEach(({ id, data }) => {
          const index = updated.findIndex((p) => p.id === id);
          if (index >= 0 && data && updated[index]) {
            updated[index] = {
              ...updated[index]!,
              ...data,
              id,
              symbol: updated[index]!.symbol,
            } as TradingPosition;
          }
        });
        return updated;
      });
    });
  };

  return {
    positions,
    isUpdating,
    selectedPosition,
    isSelecting,
    updatePositions,
    selectPosition,
    bulkUpdatePositions,
  };
}

/**
 * Hook for managing margin monitoring with concurrent updates
 */
export function useMarginMonitoring() {
  const [marginData, setMarginData] = useState<MarginData>({
    available: 10000,
    used: 0,
    level: 0,
    calls: [],
  });
  const [isUpdating, startMarginTransition] = useTransition();

  /**
   * Update margin data with concurrent rendering
   */
  const updateMarginData = (updates: Partial<MarginData>) => {
    startMarginTransition(() => {
      const marginStart = performance.now();
      setMarginData((prev) => ({ ...prev, ...updates }));

      // Track margin update performance
      const marginEnd = performance.now();
      performanceMonitoring.recordCustomTiming(
        'margin-update-concurrent',
        marginStart,
        marginEnd - marginStart
      );
    });
  };

  /**
   * Check for margin calls with non-blocking updates
   */
  const checkMarginCall = (currentLevel: number) => {
    startMarginTransition(() => {
      if (currentLevel < 100) {
        // Margin call - update immediately with high priority
        setMarginData((prev) => ({
          ...prev,
          calls: [
            ...prev.calls,
            {
              timestamp: Date.now(),
              level: currentLevel,
              type: 'margin_call',
            },
          ],
        }));
      }
    });
  };

  return {
    marginData,
    isUpdating,
    updateMarginData,
    checkMarginCall,
  };
}
