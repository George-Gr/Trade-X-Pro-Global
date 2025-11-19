import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorContextProvider } from "@/components/ErrorContextProvider";
import { logger, initializeSentry } from "@/lib/logger";
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
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthenticatedLayoutProvider } from "@/contexts/AuthenticatedLayoutContext";

// Legal Pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import RiskDisclosure from "./pages/legal/RiskDisclosure";
import CookiePolicy from "./pages/legal/CookiePolicy";
import AMLPolicy from "./pages/legal/AMLPolicy";

// Trading Pages
import TradingInstruments from "./pages/trading/TradingInstruments";
// Trading Pages (Additional)
import TradingPlatforms from "./pages/trading/TradingPlatforms";
import AccountTypes from "./pages/trading/AccountTypes";
import TradingConditions from "./pages/trading/TradingConditions";
import TradingTools from "./pages/trading/TradingTools";

// Markets Pages
import Forex from "./pages/markets/Forex";
import Stocks from "./pages/markets/Stocks";
import Indices from "./pages/markets/Indices";
import Commodities from "./pages/markets/Commodities";
import Cryptocurrencies from "./pages/markets/Cryptocurrencies";

// Education Pages
import Webinar from "./pages/education/Webinar";
import Certifications from "./pages/education/Certifications";
import Tutorials from "./pages/education/Tutorials";
import Mentorship from "./pages/education/Mentorship";
import Glossary from "./pages/education/Glossary";

// Company Pages
import AboutUs from "./pages/company/AboutUs";
import Regulation from "./pages/company/Regulation";
import Security from "./pages/company/Security";
import Partners from "./pages/company/Partners";
import ContactUs from "./pages/company/ContactUs";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Sentry on app load (production only)
  useEffect(() => {
    initializeSentry();
    logger.info("App initialized", { action: "app_startup" });
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
              <BrowserRouter>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
          
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/trade"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Trade />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/history"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/pending-orders"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <PendingOrders />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/wallet"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/kyc"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <KYC />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/admin/risk"
            element={
              <ErrorBoundary>
                <ProtectedRoute adminOnly>
                  <AdminRiskDashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/risk-management"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <RiskManagement />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/notifications"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {import.meta.env.DEV && <Route path="/dev/sentry-test" element={<DevSentryTest />} />}
          <Route path="*" element={<NotFound />} />
              </Routes>
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
