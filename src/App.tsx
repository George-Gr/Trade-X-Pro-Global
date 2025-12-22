import { GlobalLoadingIndicator } from '@/components/common/GlobalLoadingIndicator';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorContextProvider } from '@/components/ErrorContextProvider';
import { ShimmerEffect } from '@/components/ui/LoadingSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthenticatedLayoutProvider } from '@/contexts/AuthenticatedLayoutProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { initializeSentry, logger } from '@/lib/logger';
import { accessibilityStyles } from '@/styles/accessibilityStyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
const Index = lazy(() => import('./pages/Index'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trade = lazy(() => import('./pages/Trade'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const History = lazy(() => import('./pages/History'));
const PendingOrders = lazy(() => import('./pages/PendingOrders'));
const Settings = lazy(() => import('./pages/Settings'));
const KYC = lazy(() => import('./pages/KYC'));
const Admin = lazy(() => import('./pages/Admin'));
const RiskManagement = lazy(() => import('./pages/RiskManagement'));
const AdminRiskDashboard = lazy(() => import('./pages/AdminRiskDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Wallet = lazy(() => import('./pages/Wallet'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DevSentryTest = lazy(() => import('./pages/DevSentryTest'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Legal Pages
import AMLPolicy from './pages/legal/AMLPolicy';
import CookiePolicy from './pages/legal/CookiePolicy';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RiskDisclosure from './pages/legal/RiskDisclosure';
import Terms from './pages/legal/Terms';

// Accessibility Components
import { AccessibilityTestingSuite } from './components/accessibility/AccessibilityTestingSuite';
import { AdvancedAccessibilityDashboard } from './components/accessibility/AdvancedAccessibilityDashboard';

// Trading Pages
import TradingInstruments from './pages/trading/TradingInstruments';
// Trading Pages (Additional)
import AccountTypes from './pages/trading/AccountTypes';
import TradingConditions from './pages/trading/TradingConditions';
import TradingPlatforms from './pages/trading/TradingPlatforms';
import TradingTools from './pages/trading/TradingTools';

// Markets Pages
import Commodities from './pages/markets/Commodities';
import Cryptocurrencies from './pages/markets/Cryptocurrencies';
import Forex from './pages/markets/Forex';
import Indices from './pages/markets/Indices';
import Stocks from './pages/markets/Stocks';

// Education Pages
import Certifications from './pages/education/Certifications';
import Glossary from './pages/education/Glossary';
import Mentorship from './pages/education/Mentorship';
import Tutorials from './pages/education/Tutorials';
import Webinar from './pages/education/Webinar';

// Company Pages
import AboutUs from './pages/company/AboutUs';
import ContactUs from './pages/company/ContactUs';
import Partners from './pages/company/Partners';
import Regulation from './pages/company/Regulation';
import Security from './pages/company/Security';

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
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
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
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />

                            {/* Legal Pages */}
                            <Route
                              path="/legal/privacy-policy"
                              element={<PrivacyPolicy />}
                            />
                            <Route path="/legal/terms" element={<Terms />} />
                            <Route
                              path="/legal/risk-disclosure"
                              element={<RiskDisclosure />}
                            />
                            <Route
                              path="/legal/cookie-policy"
                              element={<CookiePolicy />}
                            />
                            <Route
                              path="/legal/aml-policy"
                              element={<AMLPolicy />}
                            />

                            {/* Public Trading Pages */}
                            <Route
                              path="/trading/instruments"
                              element={<TradingInstruments />}
                            />
                            <Route
                              path="/trading/platforms"
                              element={<TradingPlatforms />}
                            />
                            <Route
                              path="/trading/account-types"
                              element={<AccountTypes />}
                            />
                            <Route
                              path="/trading/conditions"
                              element={<TradingConditions />}
                            />
                            <Route
                              path="/trading/tools"
                              element={<TradingTools />}
                            />

                            {/* Markets Pages */}
                            <Route path="/markets/forex" element={<Forex />} />
                            <Route
                              path="/markets/stocks"
                              element={<Stocks />}
                            />
                            <Route
                              path="/markets/indices"
                              element={<Indices />}
                            />
                            <Route
                              path="/markets/commodities"
                              element={<Commodities />}
                            />
                            <Route
                              path="/markets/cryptocurrencies"
                              element={<Cryptocurrencies />}
                            />

                            {/* Education Pages */}
                            <Route
                              path="/education/webinar"
                              element={<Webinar />}
                            />
                            <Route
                              path="/education/certifications"
                              element={<Certifications />}
                            />
                            <Route
                              path="/education/tutorials"
                              element={<Tutorials />}
                            />
                            <Route
                              path="/education/mentorship"
                              element={<Mentorship />}
                            />
                            <Route
                              path="/education/glossary"
                              element={<Glossary />}
                            />

                            {/* Company Pages */}
                            <Route
                              path="/company/about"
                              element={<AboutUs />}
                            />
                            <Route
                              path="/company/regulation"
                              element={<Regulation />}
                            />
                            <Route
                              path="/company/security"
                              element={<Security />}
                            />
                            <Route
                              path="/company/partners"
                              element={<Partners />}
                            />
                            <Route
                              path="/company/contact"
                              element={<ContactUs />}
                            />

                            {/* Protected Routes with Mobile-Optimized Layout */}
                            <Route
                              path="/dashboard"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Dashboard />
                                      {/* Mobile bottom navigation for dashboard */}
                                      <MobileBottomNavigation />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/trade"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Trade />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/portfolio"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Portfolio />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/history"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <History />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/pending-orders"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <PendingOrders />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/wallet"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Wallet />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/settings"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Settings />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/kyc"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <KYC />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/admin"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute adminOnly>
                                    <AuthenticatedLayoutProvider>
                                      <Admin />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/admin/risk"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute adminOnly>
                                    <AuthenticatedLayoutProvider>
                                      <AdminRiskDashboard />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/risk-management"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <RiskManagement />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/notifications"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <Notifications />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/accessibility"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <AccessibilityTestingSuite />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            <Route
                              path="/accessibility/dashboard"
                              element={
                                <ErrorBoundary>
                                  <ProtectedRoute>
                                    <AuthenticatedLayoutProvider>
                                      <AdvancedAccessibilityDashboard />
                                    </AuthenticatedLayoutProvider>
                                  </ProtectedRoute>
                                </ErrorBoundary>
                              }
                            />
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            {import.meta.env.DEV && (
                              <Route
                                path="/dev/sentry-test"
                                element={<DevSentryTest />}
                              />
                            )}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
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
