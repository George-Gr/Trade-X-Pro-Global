import { routeErrorBoundaries } from '@/components/routing/RouteErrorBoundaries';
import { routeLoadingFallbacks } from '@/components/routing/routeLoadingConstants';
import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import {
  RoutePerformanceTracker,
  RoutePreloader,
  preloadStrategies,
} from '@/lib/routing/routeConfig';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useRouteError } from 'react-router-dom';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

// Route loading state interface
interface RouteLoadingState {
  isLoading: boolean;
  loadingStage: string;
  currentStage: number;
  totalStages: number;
  progress: number;
}

// Navigation optimization options
interface NavigationOptions {
  preloadNext?: boolean;
  preloadDelay?: number;
  trackPerformance?: boolean;
  stageProgress?: {
    stage: string;
    total: number;
    current: number;
  };
}

// Enhanced route configuration with trading-specific optimizations
interface OptimizedRouteConfig {
  path: string;
  component: () => Promise<React.ComponentType>;
  errorBoundary?: string;
  loadingComponent?: string;
  preloadStrategy?: 'critical' | 'prefetch' | 'progressive' | 'on-demand';
  priority?: 'critical' | 'high' | 'normal' | 'low';
  tradingContext?: {
    requiresKYC?: boolean;
    orderFlow?: string[];
    marketData?: boolean;
    realTimeUpdates?: boolean;
  };
  performance?: {
    timeout?: number;
    retryAttempts?: number;
    chunkName?: string;
  };
}

// Main optimized routing hook
export const useOptimizedRouting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [routeState, setRouteState] = useState<RouteLoadingState>({
    isLoading: false,
    loadingStage: '',
    currentStage: 0,
    totalStages: 0,
    progress: 0,
  });

  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(
    new Set()
  );

  // Performance tracking for current route
  const currentRoute = useMemo(() => {
    const path = location.pathname;
    return {
      path,
      routeId: path.replace('/', '') || 'home',
      routeGroup: getRouteGroup(path),
      isProtected: isProtectedRoute(path),
      isAdminRoute: isAdminRoute(path),
      requiresKYC: requiresKYC(path),
    };
  }, [location.pathname]);

  // Initialize route performance tracking
  useEffect(() => {
    RoutePerformanceTracker.markRouteStart(currentRoute.routeId);

    return () => {
      RoutePerformanceTracker.markRouteComplete(currentRoute.routeId);
    };
  }, [currentRoute.routeId]);

  // Preload critical routes based on user context
  useEffect(() => {
    if (user && preloadedRoutes.size === 0) {
      // Preload user-specific critical routes
      const userRouteImports = getUserRouteImports();
      RoutePreloader.preloadCriticalRoutes(userRouteImports);
      setPreloadedRoutes((prev) => new Set(prev).add('critical'));
    }
  }, [user, preloadedRoutes]);

  // Navigate to route with optimizations
  const navigateToRoute = useCallback(
    async (path: string, options: NavigationOptions = {}) => {
      const startTime = performance.now();

      try {
        setRouteState((prev) => ({
          ...prev,
          isLoading: true,
          loadingStage: 'initializing',
          currentStage: 1,
          totalStages: 3,
        }));

        // Track navigation start
        performanceMonitoring.markUserAction(`nav-start-${path}`);

        // Preload next routes if enabled
        if (options.preloadNext !== false) {
          setTimeout(() => {
            const routeImports = getUserRouteImports();
            RoutePreloader.prefetchNextRoutes(path, routeImports);
          }, options.preloadDelay || 100);
        }

        // Update loading state
        setRouteState((prev) => ({
          ...prev,
          loadingStage: 'navigating',
          progress: 33,
        }));

        // Perform navigation
        navigate(path);

        // Update final state
        setRouteState((prev) => ({
          ...prev,
          loadingStage: 'complete',
          progress: 100,
          isLoading: false,
        }));

        // Track navigation performance
        const duration = performance.now() - startTime;
        performanceMonitoring.recordCustomTiming(
          `nav-${path}`,
          startTime,
          duration
        );
      } catch (error) {
        console.error('Navigation error:', error);
        setRouteState((prev) => ({ ...prev, isLoading: false }));

        // Track navigation error
        RoutePerformanceTracker.markRouteError(
          currentRoute.routeId,
          error as Error
        );

        toast({
          title: 'Navigation Error',
          description: 'Unable to navigate to the requested page.',
          variant: 'destructive',
        });
      }
    },
    [navigate, toast, currentRoute.routeId]
  );

  // Preload route on demand
  const preloadRoute = useCallback(
    async (path: string) => {
      const routeId = path.replace('/', '') || 'home';
      const routeImports = getUserRouteImports();
      const importFn = routeImports[routeId];

      if (importFn && !preloadedRoutes.has(routeId)) {
        try {
          await RoutePreloader.preload(routeId, importFn);
          setPreloadedRoutes((prev) => new Set(prev).add(routeId));
          performanceMonitoring.markUserAction(`route-preloaded-${routeId}`);
        } catch (error) {
          console.error(`Failed to preload route ${path}:`, error);
        }
      }
    },
    [preloadedRoutes]
  );

  // Get route-specific loading component
  const getRouteLoadingComponent = useCallback((path: string) => {
    return (
      routeLoadingFallbacks[path as keyof typeof routeLoadingFallbacks] ||
      routeLoadingFallbacks.default
    );
  }, []);

  // Get route-specific error boundary
  const getRouteErrorBoundary = useCallback((path: string) => {
    const ErrorBoundary =
      routeErrorBoundaries[path as keyof typeof routeErrorBoundaries];
    return ErrorBoundary || React.Component;
  }, []);

  // Progressive loading for complex routes
  const startProgressiveLoading = useCallback(
    (path: string, stages: string[]) => {
      let currentStage = 0;

      const loadNextStage = () => {
        if (currentStage < stages.length) {
          setRouteState((prev) => ({
            ...prev,
            loadingStage: stages[currentStage] || '',
            currentStage: currentStage + 1,
            totalStages: stages.length,
            progress: ((currentStage + 1) / stages.length) * 100,
          }));

          currentStage++;
          setTimeout(loadNextStage, 200); // Stagger stage loading
        } else {
          setRouteState((prev) => ({ ...prev, isLoading: false }));
        }
      };

      loadNextStage();
    },
    []
  );

  return {
    // Current route information
    currentRoute,
    routeState,

    // Navigation functions
    navigateToRoute,
    preloadRoute,

    // Component getters
    getRouteLoadingComponent,
    getRouteErrorBoundary,

    // Progressive loading
    startProgressiveLoading,

    // Utility functions
    isRoutePreloaded: (path: string) =>
      preloadedRoutes.has(path.replace('/', '') || 'home'),
    getRouteGroup: (path: string) => getRouteGroup(path),
    requiresKYC: (path: string) => requiresKYC(path),
  };
};

// Trading-specific route optimization hook
export const useTradingRouteOptimization = () => {
  const { navigateToRoute, currentRoute } = useOptimizedRouting();
  const { user } = useAuth();

  // Optimize order execution flow navigation
  const navigateToOrderFlow = useCallback(
    async (flowType: 'buy' | 'sell', symbol: string) => {
      const flowPath = `/trade?symbol=${symbol}&action=${flowType}`;

      await navigateToRoute(flowPath, {
        preloadNext: true,
        preloadDelay: 50,
        trackPerformance: true,
      });

      performanceMonitoring.markUserAction('order-flow-navigation');
    },
    [navigateToRoute]
  );

  // Navigate to portfolio from trading
  const navigateToPortfolioFromTrade = useCallback(async () => {
    await navigateToRoute('/portfolio', {
      preloadNext: true,
      trackPerformance: true,
    });
  }, [navigateToRoute]);

  // Navigate to risk management
  const navigateToRiskManagement = useCallback(async () => {
    if (user) {
      await navigateToRoute('/risk-management', {
        preloadNext: true,
        trackPerformance: true,
      });
    }
  }, [navigateToRoute, user]);

  return {
    navigateToOrderFlow,
    navigateToPortfolioFromTrade,
    navigateToRiskManagement,
    currentRoute,
  };
};

// KYC workflow optimization hook
export const useKYCWorkflowOptimization = () => {
  const { navigateToRoute, startProgressiveLoading } = useOptimizedRouting();
  const { user } = useAuth();

  // Progressive KYC loading with step-by-step validation
  const startKYCWorkflow = useCallback(async () => {
    const kycStages = ['security', 'data', 'portfolio'];

    startProgressiveLoading('/kyc', kycStages);

    await navigateToRoute('/kyc', {
      preloadNext: true,
      trackPerformance: true,
    });

    performanceMonitoring.markUserAction('kyc-workflow-start');
  }, [navigateToRoute, startProgressiveLoading]);

  // Navigate to dashboard after KYC completion
  const navigateToDashboardAfterKYC = useCallback(async () => {
    await navigateToRoute('/dashboard', {
      preloadNext: true,
      trackPerformance: true,
    });
  }, [navigateToRoute]);

  return {
    startKYCWorkflow,
    navigateToDashboardAfterKYC,
  };
};

// Helper functions
function getRouteGroup(path: string): string {
  if (preloadStrategies.critical.includes(path)) return 'critical';
  if (path.startsWith('/admin')) return 'admin';
  if (path.includes('kyc') || path.includes('register')) return 'workflows';
  if (path.startsWith('/markets') || path.startsWith('/education'))
    return 'markets';
  if (path.startsWith('/company') || path.startsWith('/legal')) return 'static';
  if (path.startsWith('/dev')) return 'dev';
  return 'normal';
}

function isProtectedRoute(path: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/trade',
    '/portfolio',
    '/history',
    '/settings',
    '/kyc',
    '/admin',
    '/risk-management',
    '/notifications',
  ];
  return protectedRoutes.some((route) => path.startsWith(route));
}

function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin');
}

function requiresKYC(path: string): boolean {
  const kycRequiredRoutes = [
    '/trade',
    '/portfolio',
    '/wallet',
    '/risk-management',
  ];
  return kycRequiredRoutes.some((route) => path.startsWith(route));
}

function getUserRouteImports(): Record<
  string,
  () => Promise<React.ComponentType>
> {
  return {
    dashboard: () =>
      import('../pages/Dashboard').then((module) => module.default),
    trade: () => import('../pages/Trade').then((module) => module.default),
    portfolio: () =>
      import('../pages/Portfolio').then((module) => module.default),
    history: () => import('../pages/History').then((module) => module.default),
    settings: () =>
      import('../pages/Settings').then((module) => module.default),
    kyc: () => import('../pages/KYC').then((module) => module.default),
    admin: () => import('../pages/Admin').then((module) => module.default),
    adminrisk: () =>
      import('../pages/AdminRiskDashboard').then((module) => module.default),
    riskmanagement: () =>
      import('../pages/RiskManagement').then((module) => module.default),
    notifications: () =>
      import('../pages/Notifications').then((module) => module.default),
    wallet: () => import('../pages/Wallet').then((module) => module.default),
    pendingorders: () =>
      import('../pages/PendingOrders').then((module) => module.default),
  };
}

// Route error handler hook
export const useRouteErrorHandler = () => {
  const error = useRouteError();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error('Route error:', error);

      performanceMonitoring.markUserAction('route-error');

      toast({
        title: 'Page Error',
        description: 'An error occurred while loading this page.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return { error };
};
