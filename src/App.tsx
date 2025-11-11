import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Portfolio from "./pages/Portfolio";
import History from "./pages/History";
import PendingOrders from "./pages/PendingOrders";
import Settings from "./pages/Settings";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import RiskManagement from "./pages/RiskManagement";
import Notifications from "./pages/Notifications";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trade"
            element={
              <ProtectedRoute>
                <Trade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-orders"
            element={
              <ProtectedRoute>
                <PendingOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kyc"
            element={
              <ProtectedRoute>
                <KYC />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-management"
            element={
              <ProtectedRoute>
                <RiskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
