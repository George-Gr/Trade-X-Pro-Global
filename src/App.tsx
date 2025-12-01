import React, { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorContextProvider } from "@/components/ErrorContextProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthenticatedLayoutProvider } from "@/contexts/AuthenticatedLayoutProvider";
import { logger, initializeSentry } from "@/lib/logger";
import { breadcrumbTracker } from "@/lib/breadcrumbTracker";
import { ShimmerEffect } from "@/components/ui/LoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
const Index = lazy(() => import("./pages/Index"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trade = lazy(() => import("./pages/Trade"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const History = lazy(() => import("./pages/History"));
const PendingOrders = lazy(() => import("./pages/PendingOrders"));
const Settings = lazy(() => import("./pages/Settings"));
const KYC = lazy(() => import("./pages/KYC"));
const Admin = lazy(() => import("./pages/Admin"));
const RiskManagement = lazy(() => import("./pages/RiskManagement"));
const AdminRiskDashboard = lazy(() => import("./pages/AdminRiskDashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Wallet = lazy(() => import("./pages/Wallet"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DevSentryTest = lazy(() => import("./pages/DevSentryTest"));
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));

// Legal Pages (lazy-loaded)
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const RiskDisclosure = lazy(() => import("./pages/legal/RiskDisclosure"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const AMLPolicy = lazy(() => import("./pages/legal/AMLPolicy"));

// Trading Pages (lazy-loaded)
const TradingInstruments = lazy(() => import("./pages/trading/TradingInstruments"));
const TradingPlatforms = lazy(() => import("./pages/trading/TradingPlatforms"));
const AccountTypes = lazy(() => import("./pages/trading/AccountTypes"));
const TradingConditions = lazy(() => import("./pages/trading/TradingConditions"));
const TradingTools = lazy(() => import("./pages/trading/TradingTools"));

// Markets Pages (lazy-loaded)
const Forex = lazy(() => import("./pages/markets/Forex"));
const Stocks = lazy(() => import("./pages/markets/Stocks"));
const Indices = lazy(() => import("./pages/markets/Indices"));
const Commodities = lazy(() => import("./pages/markets/Commodities"));
const Cryptocurrencies = lazy(() => import("./pages/markets/Cryptocurrencies"));

// Education Pages (lazy-loaded)
const Webinar = lazy(() => import("./pages/education/Webinar"));
const Certifications = lazy(() => import("./pages/education/Certifications"));
const Tutorials = lazy(() => import("./pages/education/Tutorials"));
const Mentorship = lazy(() => import("./pages/education/Mentorship"));
const Glossary = lazy(() => import("./pages/education/Glossary"));

// Company Pages (lazy-loaded)
const AboutUs = lazy(() => import("./pages/company/AboutUs"));
const Regulation = lazy(() => import("./pages/company/Regulation"));
const Security = lazy(() => import("./pages/company/Security"));
const Partners = lazy(() => import("./pages/company/Partners"));
const ContactUs = lazy(() => import("./pages/company/ContactUs"));

// Theme Testing (Development Only)
const ThemeTesting = lazy(() => import("./pages/ThemeTesting"));

const queryClient = new QueryClient();

// Layout Components
const MobileBottomNavigation = lazy(() =>
  import("./components/layout/MobileBottomNavigation").then(module => ({
    default: module.MobileBottomNavigation
  }))
);

const App = () => {
  // Initialize Sentry and monitoring on app load (production only)
  useEffect(() => {
    initializeSentry();
    logger.info("App initialized", { action: "app_startup" });

    // Initialize breadcrumb tracking
    logger.info("Breadcrumb tracker initialized", {
      action: "breadcrumb_tracker_init"
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorContextProvider>
        <TooltipProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary
              componentName="App"
              onError={(error, errorInfo) => {
                // Log to logger with context
                logger.error("Root app error boundary caught", error, {
                  action: "app_error_boundary",
                  component: "App",
                  metadata: {
                    componentStack: errorInfo?.componentStack,
                  },
                });
                // Sentry integration would be handled by logger in production
              }}
            >
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                            <Skeleton variant="text" className="h-6 w-32 mx-auto" />
                          </div>
                          <div className="text-sm text-secondary-contrast">
                            <Skeleton variant="text" className="h-4 w-24 mx-auto" />
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
                      <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/legal/terms" element={<Terms />} />
                      <Route path="/legal/risk-disclosure" element={<RiskDisclosure />} />
                      <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
                      <Route path="/legal/aml-policy" element={<AMLPolicy />} />

                      {/* Public Trading Pages */}
                      <Route path="/trading/instruments" element={<TradingInstruments />} />
                      <Route path="/trading/platforms" element={<TradingPlatforms />} />
                      <Route path="/trading/account-types" element={<AccountTypes />} />
                      <Route path="/trading/conditions" element={<TradingConditions />} />
                      <Route path="/trading/tools" element={<TradingTools />} />

                      {/* Markets Pages */}
                      <Route path="/markets/forex" element={<Forex />} />
                      <Route path="/markets/stocks" element={<Stocks />} />
                      <Route path="/markets/indices" element={<Indices />} />
                      <Route path="/markets/commodities" element={<Commodities />} />
                      <Route path="/markets/cryptocurrencies" element={<Cryptocurrencies />} />

                      {/* Education Pages */}
                      <Route path="/education/webinar" element={<Webinar />} />
                      <Route path="/education/certifications" element={<Certifications />} />
                      <Route path="/education/tutorials" element={<Tutorials />} />
                      <Route path="/education/mentorship" element={<Mentorship />} />
                      <Route path="/education/glossary" element={<Glossary />} />

                      {/* Company Pages */}
                      <Route path="/company/about" element={<AboutUs />} />
                      <Route path="/company/regulation" element={<Regulation />} />
                      <Route path="/company/security" element={<Security />} />
                      <Route path="/company/partners" element={<Partners />} />
                      <Route path="/company/contact" element={<ContactUs />} />

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
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      {import.meta.env.DEV && <Route path="/dev/theme-testing" element={<ThemeTesting />} />}
                      {import.meta.env.DEV && <Route path="/dev/sentry-test" element={<DevSentryTest />} />}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </NotificationProvider>
        </TooltipProvider>
      </ErrorContextProvider>
    </QueryClientProvider>
  );
};

export default App;
