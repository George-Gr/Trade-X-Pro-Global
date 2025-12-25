import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Enhanced routing infrastructure
import { useOptimizedRouting, useRouteErrorHandler } from '@/hooks/useOptimizedRouting';
import { RoutePerformanceTracker } from '@/lib/routing/routeConfig';

// Context providers
import { ErrorContextProvider } from '@/components/ErrorContextProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';

// Core components
import ErrorBoundary from '@/components/ErrorBoundary';
import { GlobalLoadingIndicator } from '@/components/common/GlobalLoadingIndicator';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { initializeSentry, logger } from '@/lib/logger';
import { accessibilityStyles } from '@/styles/accessibilityStyles';

// Routes configuration
import { AppRoutes } from '@/routes/routesConfig';

// Query client configuration optimized for trading platform
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});




// Main App component with enhanced routing
const AppContent = () => {
  const { currentRoute, routeState } = useOptimizedRouting();
  const { error } = useRouteErrorHandler();

  // Initialize performance tracking
  useEffect(() => {
    initializeSentry();
    logger.info('Enhanced Application initialized', {
      action: 'app_startup_enhanced',
      metadata: { route: currentRoute.path },
    });

    // Track initial route load
    RoutePerformanceTracker.markRouteStart(currentRoute.routeId);

    return () => {
      RoutePerformanceTracker.markRouteComplete(currentRoute.routeId);
    };
  }, [currentRoute.path, currentRoute.routeId]);

  // Handle route errors
  useEffect(() => {
    if (error) {
      logger.error('Route error detected', {
        action: 'route_error',
        metadata: {
          route: currentRoute.path,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }, [error, currentRoute.path]);

  return (
    <div className="min-h-screen bg-background">
      {/* Global loading indicator */}
      {routeState.isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-primary/20">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${routeState.progress}%` }}
            />
          </div>
        </div>
      )}

      <main>
        <AppRoutes />
      </main>
    </div>
  );
};

// Root App component with all providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorContextProvider>
        <TooltipProvider>
          <NotificationProvider>
            <ViewModeProvider>
              <LoadingProvider>
                <Toaster />
                <Sonner />
                <GlobalLoadingIndicator />

                <ErrorBoundary
                  componentName="EnhancedApp"
                  onError={(error: Error, errorInfo: React.ErrorInfo) => {
                    logger.error('Enhanced app error boundary caught', error, {
                      action: 'app_error_boundary_enhanced',
                      component: 'EnhancedApp',
                      metadata: {
                        componentStack: errorInfo?.componentStack,
                      },
                    });
                  }}
                >
                  <AccessibilityProvider>
                    <style>{accessibilityStyles}</style>

                    <BrowserRouter>
                      <AppContent />
                    </BrowserRouter>
                  </AccessibilityProvider>
                </ErrorBoundary>
              </LoadingProvider>
            </ViewModeProvider>
          </NotificationProvider>
        </TooltipProvider>
      </ErrorContextProvider>
    </QueryClientProvider>
  );
};

export default App;
