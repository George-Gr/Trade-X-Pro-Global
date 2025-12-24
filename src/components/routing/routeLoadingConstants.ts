import {
  AdminPageLoading,
  DashboardPageLoading,
  DefaultRouteLoading,
  KYCPageLoading,
  PortfolioPageLoading,
  TradingPageLoading,
} from './RouteLoadingComponents';

/**
 * Route-specific loading fallback constants
 * Maps route paths to their corresponding loading components for progressive loading
 */
export const ROUTE_LOADING_FALLBACKS = {
  '/dashboard': DashboardPageLoading,
  '/trade': TradingPageLoading,
  '/portfolio': PortfolioPageLoading,
  '/kyc': KYCPageLoading,
  '/admin': AdminPageLoading,
  '/admin/risk': AdminPageLoading,
  '/admin/performance': AdminPageLoading,
  '/risk-management': PortfolioPageLoading,
  default: DefaultRouteLoading,
} as const;

/**
 * Type definition for route loading fallbacks
 * Represents the shape of the ROUTE_LOADING_FALLBACKS constant
 */
export type RouteLoadingFallbacks = typeof ROUTE_LOADING_FALLBACKS;
