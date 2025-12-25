import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorContextProvider } from '@/components/ErrorContextProvider';
import { GlobalLoadingIndicator } from '@/components/common/GlobalLoadingIndicator';
import { ShimmerEffect } from '@/components/ui/LoadingSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { initializeSentry, logger } from '@/lib/logger';
import { AppRoutes } from '@/routes/routesConfig';
import { accessibilityStyles } from '@/styles/accessibilityStyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

// Layout Components
const MobileBottomNavigation = lazy(() =>
  import('./components/layout/MobileBottomNavigation').then((module) => ({
    default: module.MobileBottomNavigation,
  }))
);

const App = () => {
  // Initialize Sentry and monitoring on app load (production only)
  useEffect(() => {
    initializeSentry();
    logger.info('Application initialized', { action: 'app_startup' });

    // Initialize breadcrumb tracking
    logger.info('Breadcrumb tracking initialized', {
      action: 'breadcrumb_tracker_init',
    });
  }, []);

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
                  componentName="App"
                  onError={(error: Error, errorInfo: React.ErrorInfo) => {
                    // Log to logger with context
                    logger.error('Root app error boundary caught', error, {
                      action: 'app_error_boundary',
                      component: 'App',
                      metadata: {
                        componentStack: errorInfo?.componentStack,
                      },
                    });
                    // Sentry integration would be handled by logger in production
                  }}
                >
                  <AccessibilityProvider>
                    <style>{accessibilityStyles}</style>
                    <BrowserRouter>
                      <Suspense
                        fallback={
                          <div className="min-h-screen flex items-center justify-center bg-background">
                            <div className="text-center space-y-4">
                              <div className="relative">
                                <div className="h-12 w-12 mx-auto bg-primary/20 rounded-full animate-pulse-slow">
                                  <ShimmerEffect className="absolute inset-0 rounded-full" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-lg font-semibold text-primary-contrast">
                                  <Skeleton
                                    variant="text"
                                    className="h-6 w-32 mx-auto"
                                  />
                                </div>
                                <div className="text-sm text-secondary-contrast">
                                  <Skeleton
                                    variant="text"
                                    className="h-4 w-24 mx-auto"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <main>
                          <AppRoutes />
                        </main>
                      </Suspense>
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
