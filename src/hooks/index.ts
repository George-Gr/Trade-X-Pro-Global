/**
 * Hooks Index
 *
 * Centralized exports for all hooks
 * Organized by category for easy discovery
 */

// === CORE DATA HOOKS ===
// Primary consolidated hook for trading data
export { useTradingData } from "./useTradingData";

// Authentication
export { useAuth } from "./useAuth";

// Portfolio & Positions (legacy - use useTradingData for new code)
export { usePortfolioData } from "./usePortfolioData";
export { useRealtimePositions } from "./useRealtimePositions";

// === TRADING OPERATIONS ===
export { useOrderExecution } from "./useOrderExecution";
export { usePositionClose } from "./usePositionClose";
export { usePositionUpdate } from "./usePositionUpdate";
export { usePendingOrders } from "./usePendingOrders";
export { useOrderTemplates } from "./useOrderTemplates";

// === PRICE DATA ===
export { usePriceUpdates } from "./usePriceUpdates";
export { usePriceUpdatesOptimized } from "./usePriceUpdatesOptimized";
export { usePriceStream } from "./usePriceStream";

// === RISK MANAGEMENT ===
export { useRiskMetrics } from "./useRiskMetrics";
export { useRiskLimits } from "./useRiskLimits";
export { useRiskEvents } from "./useRiskEvents";
export { useMarginMonitoring } from "./useMarginMonitoring";
export { useMarginCallMonitoring } from "./useMarginCallMonitoring";
export { useLiquidationExecution } from "./useLiquidationExecution";
export { useSLTPMonitoring } from "./useSLTPMonitoring";
export { useSlTpExecution } from "./useSlTpExecution";

// === ANALYTICS & METRICS ===
// Legacy hooks - consider using useTradingData instead
export {
  usePortfolioMetrics,
  useDrawdownAnalysis,
} from "./usePortfolioMetrics";
export { useProfitLossData } from "./useProfitLossData";
export { usePnLCalculations } from "./usePnLCalculations";
export { usePositionAnalysis } from "./usePositionAnalysis";

// === DATA TABLES ===
export { useOrdersTable } from "./useOrdersTable";
export { useTradingHistory } from "./useTradingHistory";
export { useWatchlists } from "./useWatchlists";

// === UTILITIES ===
export { useAssetSpecs } from "./useAssetSpecs";
export { useKyc } from "./useKyc";
export { useKycNotifications } from "./useKycNotifications";
export { useKycTrading } from "./useKycTrading";

// === PERFORMANCE & UI ===
export {
  useDebouncedValue,
  useThrottledValue,
  useDebouncedCallback,
  useThrottledCallback,
  useRAFCallback,
} from "./useDebouncedValue";
export { usePagination, useInfiniteScroll } from "./usePagination";
export { useSubscription } from "./useSubscription";
export { useRateLimitStatus } from "./useRateLimitStatus";
export { useRoleGuard } from "./useRoleGuard";

// === MOBILE & UI ===
export { useIsMobile } from "./use-mobile";
export { useToast, toast } from "./use-toast";
export { useSwipe } from "./useSwipe";
export { usePullToRefresh } from "./usePullToRefresh";
export { useReducedMotion } from "./useReducedMotion";
export { useHapticFeedback } from "./useHapticFeedbackFixed";

// === DEVELOPMENT ===
export { usePerformanceMonitoring } from "./usePerformanceMonitoring";
export { useLoading } from "./useLoading";
export { useErrorContext } from "./useErrorContext";
export { useChartWorker } from "./useChartWorker";
export { useDebouncedChartUpdate } from "./useDebouncedChartUpdate";
