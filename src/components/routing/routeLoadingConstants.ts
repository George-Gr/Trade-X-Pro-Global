import {
  AdminPageLoading,
  DashboardPageLoading,
  DefaultRouteLoading,
  KYCPageLoading,
  PortfolioPageLoading,
  TradingPageLoading,
} from './RouteLoadingComponents';

// Route-specific loading fallback constants
export const routeLoadingFallbacks = {
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

export type RouteLoadingFallbacks = typeof routeLoadingFallbacks;
