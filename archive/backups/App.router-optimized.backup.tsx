import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

// Enhanced routing infrastructure
import { ProgressiveLoadingIndicator } from '@/components/routing/RouteLoadingComponents';
import {
  useOptimizedRouting,
  useRouteErrorHandler,
} from '@/hooks/useOptimizedRouting';
import { RoutePerformanceTracker } from '@/lib/routing/routeConfig';

// Context providers
import { ErrorContextProvider } from '@/components/ErrorContextProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthenticatedLayoutProvider } from '@/contexts/AuthenticatedLayoutProvider';
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

// Lazy-loaded page components with optimized chunking
const Index = React.lazy(() => import('./pages/Index'));
const Register = React.lazy(() => import('./pages/Register'));
const Login = React.lazy(() => import('./pages/Login'));

// Trading pages with route-based code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Trade = React.lazy(() => import('./pages/Trade'));
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const History = React.lazy(() => import('./pages/History'));
const PendingOrders = React.lazy(() => import('./pages/PendingOrders'));

// Workflow pages with progressive loading
const Settings = React.lazy(() => import('./pages/Settings'));
const KYC = React.lazy(() => import('./pages/KYC'));
const Wallet = React.lazy(() => import('./pages/Wallet'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

// Admin pages with role-based loading
const Admin = React.lazy(() => import('./pages/Admin'));
const AdminRiskDashboard = React.lazy(
  () => import('./pages/AdminRiskDashboard')
);
const RiskManagement = React.lazy(() => import('./pages/RiskManagement'));

// Static pages with lower priority loading
const NotFound = React.lazy(() => import('./pages/NotFound'));
const DevSentryTest = React.lazy(() => import('./pages/DevSentryTest'));
const ProtectedRoute = React.lazy(
  () => import('./components/auth/ProtectedRoute')
);

// Legal and company pages (static content)
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const Terms = React.lazy(() => import('./pages/legal/Terms'));
const RiskDisclosure = React.lazy(() => import('./pages/legal/RiskDisclosure'));
const CookiePolicy = React.lazy(() => import('./pages/legal/CookiePolicy'));
const AMLPolicy = React.lazy(() => import('./pages/legal/AMLPolicy'));

// Trading information pages
const TradingInstruments = React.lazy(
  () => import('./pages/trading/TradingInstruments')
);
const TradingPlatforms = React.lazy(
  () => import('./pages/trading/TradingPlatforms')
);
const AccountTypes = React.lazy(() => import('./pages/trading/AccountTypes'));
const TradingConditions = React.lazy(
  () => import('./pages/trading/TradingConditions')
);
const TradingTools = React.lazy(() => import('./pages/trading/TradingTools'));

// Markets pages
const Commodities = React.lazy(() => import('./pages/markets/Commodities'));
const Cryptocurrencies = React.lazy(
  () => import('./pages/markets/Cryptocurrencies')
);
const Forex = React.lazy(() => import('./pages/markets/Forex'));
const Indices = React.lazy(() => import('./pages/markets/Indices'));
const Stocks = React.lazy(() => import('./pages/markets/Stocks'));

// Education pages
const Certifications = React.lazy(
  () => import('./pages/education/Certifications')
);
const Glossary = React.lazy(() => import('./pages/education/Glossary'));
const Mentorship = React.lazy(() => import('./pages/education/Mentorship'));
const Tutorials = React.lazy(() => import('./pages/education/Tutorials'));
const Webinar = React.lazy(() => import('./pages/education/Webinar'));

// Company pages
const AboutUs = React.lazy(() => import('./pages/company/AboutUs'));
const ContactUs = React.lazy(() => import('./pages/company/ContactUs'));
const Partners = React.lazy(() => import('./pages/company/Partners'));
const Regulation = React.lazy(() => import('./pages/company/Regulation'));
const Security = React.lazy(() => import('./pages/company/Security'));

// Mobile navigation with lazy loading
const MobileBottomNavigation = React.lazy(() =>
  import('./components/layout/MobileBottomNavigation').then((module) => ({
    default: module.MobileBottomNavigation,
  }))
);

// Performance monitoring
// Performance monitoring - lazy loaded
const PerformanceMonitorDashboard = React.lazy(() =>
  import('./components/dashboard/PerformanceMonitorDashboard').then(
    (module) => ({
      default: module.PerformanceMonitorDashboard,
    })
  )
);

// Query client configuration optimized for trading platform
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced route wrapper with error boundaries and performance tracking
const EnhancedRouteWrapper: React.FC<{
  children: React.ReactNode;
  path: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
  requireKYC?: boolean;
}> = ({
  children,
  path,
  requireAuth = false,
  adminOnly = false,
  requireKYC = false,
}) => {
  const location = useLocation();
  const { getRouteErrorBoundary, getRouteLoadingComponent } =
    useOptimizedRouting();

  // Get route-specific error boundary and loading component
  const ErrorBoundary = getRouteErrorBoundary(path);
  const LoadingComponent = getRouteLoadingComponent(path);

  return (
    <ErrorBoundary routeName={path} fallback={<LoadingComponent />}>
      <Suspense fallback={<LoadingComponent />}>
        {requireAuth ? (
          <ProtectedRoute adminOnly={adminOnly}>
            <AuthenticatedLayoutProvider>
              {children}
              {/* Mobile navigation for authenticated routes */}
              <Suspense fallback={null}>
                <MobileBottomNavigation />
              </Suspense>
            </AuthenticatedLayoutProvider>
          </ProtectedRoute>
        ) : (
          children
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

// Progressive loading wrapper for complex trading workflows
const ProgressiveLoadingWrapper: React.FC<{
  children: React.ReactNode;
  stages: string[];
  route: string;
}> = ({ children, stages, route }) => {
  const [currentStage, setCurrentStage] = React.useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const loadStage = (stageIndex: number) => {
      if (!isMounted || stageIndex >= stages.length) {
        return;
      }

      setCurrentStage(stageIndex);
      timeoutId = setTimeout(() => {
        if (isMounted) {
          loadStage(stageIndex + 1);
        }
      }, 200);
    };

    loadStage(0);

    // Cleanup function to clear timeout and prevent memory leaks
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [stages.length]);

  if (currentStage < stages.length) {
    return (
      <ProgressiveLoadingIndicator
        stage={stages[currentStage] || 'loading'}
        currentStage={currentStage + 1}
        totalStages={stages.length}
      />
    );
  }

  return <>{children}</>;
};

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
        route: currentRoute.path,
        error: error instanceof Error ? error.message : String(error),
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
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <EnhancedRouteWrapper path="/">
                <Index />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/register"
            element={
              <ProgressiveLoadingWrapper
                stages={['security', 'data', 'portfolio']}
                route="/register"
              >
                <EnhancedRouteWrapper path="/register">
                  <Register />
                </EnhancedRouteWrapper>
              </ProgressiveLoadingWrapper>
            }
          />

          <Route
            path="/login"
            element={
              <EnhancedRouteWrapper path="/login">
                <Login />
              </EnhancedRouteWrapper>
            }
          />

          {/* Legal Pages - Static content with lazy loading */}
          <Route
            path="/legal/privacy-policy"
            element={
              <EnhancedRouteWrapper path="/legal/privacy-policy">
                <PrivacyPolicy />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/legal/terms"
            element={
              <EnhancedRouteWrapper path="/legal/terms">
                <Terms />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/legal/risk-disclosure"
            element={
              <EnhancedRouteWrapper path="/legal/risk-disclosure">
                <RiskDisclosure />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/legal/cookie-policy"
            element={
              <EnhancedRouteWrapper path="/legal/cookie-policy">
                <CookiePolicy />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/legal/aml-policy"
            element={
              <EnhancedRouteWrapper path="/legal/aml-policy">
                <AMLPolicy />
              </EnhancedRouteWrapper>
            }
          />

          {/* Public Trading Pages */}
          <Route
            path="/trading/instruments"
            element={
              <EnhancedRouteWrapper path="/trading/instruments">
                <TradingInstruments />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/trading/platforms"
            element={
              <EnhancedRouteWrapper path="/trading/platforms">
                <TradingPlatforms />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/trading/account-types"
            element={
              <EnhancedRouteWrapper path="/trading/account-types">
                <AccountTypes />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/trading/conditions"
            element={
              <EnhancedRouteWrapper path="/trading/conditions">
                <TradingConditions />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/trading/tools"
            element={
              <EnhancedRouteWrapper path="/trading/tools">
                <TradingTools />
              </EnhancedRouteWrapper>
            }
          />

          {/* Markets Pages */}
          <Route
            path="/markets/forex"
            element={
              <EnhancedRouteWrapper path="/markets/forex">
                <Forex />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/markets/stocks"
            element={
              <EnhancedRouteWrapper path="/markets/stocks">
                <Stocks />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/markets/indices"
            element={
              <EnhancedRouteWrapper path="/markets/indices">
                <Indices />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/markets/commodities"
            element={
              <EnhancedRouteWrapper path="/markets/commodities">
                <Commodities />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/markets/cryptocurrencies"
            element={
              <EnhancedRouteWrapper path="/markets/cryptocurrencies">
                <Cryptocurrencies />
              </EnhancedRouteWrapper>
            }
          />

          {/* Education Pages */}
          <Route
            path="/education/webinar"
            element={
              <EnhancedRouteWrapper path="/education/webinar">
                <Webinar />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/education/certifications"
            element={
              <EnhancedRouteWrapper path="/education/certifications">
                <Certifications />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/education/tutorials"
            element={
              <EnhancedRouteWrapper path="/education/tutorials">
                <Tutorials />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/education/mentorship"
            element={
              <EnhancedRouteWrapper path="/education/mentorship">
                <Mentorship />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/education/glossary"
            element={
              <EnhancedRouteWrapper path="/education/glossary">
                <Glossary />
              </EnhancedRouteWrapper>
            }
          />

          {/* Company Pages */}
          <Route
            path="/company/about"
            element={
              <EnhancedRouteWrapper path="/company/about">
                <AboutUs />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/company/regulation"
            element={
              <EnhancedRouteWrapper path="/company/regulation">
                <Regulation />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/company/security"
            element={
              <EnhancedRouteWrapper path="/company/security">
                <Security />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/company/partners"
            element={
              <EnhancedRouteWrapper path="/company/partners">
                <Partners />
              </EnhancedRouteWrapper>
            }
          />
          <Route
            path="/company/contact"
            element={
              <EnhancedRouteWrapper path="/company/contact">
                <ContactUs />
              </EnhancedRouteWrapper>
            }
          />

          {/* Protected Trading Routes - Critical priority */}
          <Route
            path="/dashboard"
            element={
              <EnhancedRouteWrapper path="/dashboard" requireAuth>
                <Dashboard />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/trade"
            element={
              <ProgressiveLoadingWrapper
                stages={['trading', 'data', 'portfolio']}
                route="/trade"
              >
                <EnhancedRouteWrapper path="/trade" requireAuth requireKYC>
                  <Trade />
                </EnhancedRouteWrapper>
              </ProgressiveLoadingWrapper>
            }
          />

          <Route
            path="/portfolio"
            element={
              <EnhancedRouteWrapper path="/portfolio" requireAuth requireKYC>
                <Portfolio />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/history"
            element={
              <EnhancedRouteWrapper path="/history" requireAuth>
                <History />
              </EnhancedRouteWrapper>
            }
          />

          {/* Protected Workflow Routes - Progressive loading */}
          <Route
            path="/pending-orders"
            element={
              <EnhancedRouteWrapper path="/pending-orders" requireAuth>
                <PendingOrders />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/wallet"
            element={
              <EnhancedRouteWrapper path="/wallet" requireAuth requireKYC>
                <Wallet />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/settings"
            element={
              <EnhancedRouteWrapper path="/settings" requireAuth>
                <Settings />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/kyc"
            element={
              <ProgressiveLoadingWrapper
                stages={['security', 'data', 'portfolio']}
                route="/kyc"
              >
                <EnhancedRouteWrapper path="/kyc" requireAuth>
                  <KYC />
                </EnhancedRouteWrapper>
              </ProgressiveLoadingWrapper>
            }
          />

          <Route
            path="/notifications"
            element={
              <EnhancedRouteWrapper path="/notifications" requireAuth>
                <Notifications />
              </EnhancedRouteWrapper>
            }
          />

          {/* Admin Routes - Role-based loading */}
          <Route
            path="/admin"
            element={
              <EnhancedRouteWrapper path="/admin" requireAuth adminOnly>
                <Admin />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/admin/risk"
            element={
              <EnhancedRouteWrapper path="/admin/risk" requireAuth adminOnly>
                <AdminRiskDashboard />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/admin/performance"
            element={
              <EnhancedRouteWrapper
                path="/admin/performance"
                requireAuth
                adminOnly
              >
                <PerformanceMonitorDashboard />
              </EnhancedRouteWrapper>
            }
          />

          <Route
            path="/risk-management"
            element={
              <EnhancedRouteWrapper
                path="/risk-management"
                requireAuth
                requireKYC
              >
                <RiskManagement />
              </EnhancedRouteWrapper>
            }
          />

          {/* Development routes */}
          {import.meta.env.DEV && (
            <Route
              path="/dev/sentry-test"
              element={
                <EnhancedRouteWrapper path="/dev/sentry-test">
                  <DevSentryTest />
                </EnhancedRouteWrapper>
              }
            />
          )}

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <EnhancedRouteWrapper path="/404">
                <NotFound />
              </EnhancedRouteWrapper>
            }
          />
        </Routes>
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
