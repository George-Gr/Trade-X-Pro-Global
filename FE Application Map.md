# Trade-X-Pro-Global Frontend Application Map
## Complete Application Structure & Component Hierarchy

**Version:** 1.0  
**Last Updated:** November 2025  
**Application:** Trade-X-Pro-Global v10 - CFD Trading Simulation Platform  
**Stack:** React 18 + TypeScript 5.8 + Vite 7.2 + Tailwind CSS 4.1 + Supabase

---

## 📋 Quick Navigation

1. [Application Overview](#application-overview)
2. [43 Pages & Routes](#routes-total-43)
3. [184 Components](#components-total-184)
4. [41 Custom Hooks](#hooks-total-41)
5. [Service Layer](#service-layer)
6. [State Management](#state-management)

---

## Application Overview

**Frontend Stack:**
- React 18.3.1 + TypeScript 5.8.3
- Vite 7.2.2 (build tool)
- Tailwind CSS 4.1.17 + shadcn-ui (Radix UI)
- React Router v6 (lazy-loaded pages)
- React Hook Form + Zod (forms & validation)
- TanStack React Query (server state)
- Supabase (auth, database, realtime)
- TradingView Lightweight Charts
- Sentry (error tracking)

---

## Routes (Total: 43)

### Authentication (3 routes)
- `/` - Landing Page (Index.tsx)
- `/login` - Login Page (Login.tsx)
- `/register` - Registration Page (Register.tsx)

### Legal & Compliance (5 routes)
- `/legal/privacy-policy` - Privacy Policy
- `/legal/terms` - Terms of Service
- `/legal/risk-disclosure` - Risk Disclosure
- `/legal/cookie-policy` - Cookie Policy
- `/legal/aml-policy` - AML Policy

### Trading Information (5 routes)
- `/trading/instruments` - Trading Instruments Catalog
- `/trading/platforms` - Platform Comparison
- `/trading/account-types` - Account Types
- `/trading/conditions` - Trading Conditions
- `/trading/tools` - Trading Tools & Calculators

### Markets (5 routes)
- `/markets/forex` - Forex Market
- `/markets/stocks` - Stock Market
- `/markets/indices` - Indices Market
- `/markets/commodities` - Commodities Market
- `/markets/cryptocurrencies` - Crypto Market

### Education (5 routes)
- `/education/webinar` - Webinars
- `/education/certifications` - Certifications
- `/education/tutorials` - Tutorials
- `/education/mentorship` - Mentorship
- `/education/glossary` - Trading Glossary

### Company (5 routes)
- `/company/about` - About Us
- `/company/regulation` - Regulation
- `/company/security` - Security
- `/company/partners` - Partners
- `/company/contact` - Contact Us

### Protected Routes - Trading (10 routes)
- `/dashboard` - Main Dashboard
- `/trade` - Trading Platform
- `/portfolio` - Portfolio Overview
- `/history` - Trading History
- `/pending-orders` - Active Orders
- `/wallet` - Wallet & Funds
- `/settings` - User Settings
- `/kyc` - KYC Verification
- `/notifications` - Notification Center
- `/risk-management` - Risk Dashboard

### Admin Routes (2 routes)
- `/admin` - Admin Dashboard
- `/admin/risk` - Admin Risk Dashboard

### Development (2 routes)
- `/dev/theme-testing` - Theme Tester
- `/dev/sentry-test` - Error Testing

---

## Components (Total: 184)

### UI Component Library (33+)
Shadcn-ui components: button, card, table, form, dialog, drawer, sheet, dropdown, tabs, input, select, checkbox, radio, switch, badge, alert, skeleton, toast, tooltip, and more.

### Layout Components (8)
- AuthenticatedLayout - Protected pages wrapper
- AuthenticatedLayoutInner - With sidebar
- PublicLayout - Public pages wrapper
- AppSidebar - Navigation sidebar
- PublicHeader - Public page header
- PublicFooter - Public page footer
- MobileBottomNavigation - Mobile nav
- ProtectedRoute - Auth guard

### Dashboard Components (12)
- Dashboard (main page)
- AccountSummary - Balance cards
- EquityChart - Equity history
- AssetAllocation - Pie chart
- ProfitLossCard - P&L widget
- MarginLevelCard - Margin indicator
- RiskAlertsCard - Risk alerts
- PerformanceMetrics - KPIs
- RecentPnLChart - P&L trend
- ExportToolbar - Export options
- DashboardLoading - Skeleton

### Trading Components (58) - LARGEST
**Order Management (15):**
- TradingPanel - Order entry
- OrderForm - Form component
- OrderPreview - Preview dialog
- OrderFilter - Filter controls
- DesktopOrderTable - Table view
- OrdersTable - Responsive table
- OrdersTableMobile - Mobile layout
- MobileOrderCards - Card view
- OrderRow - Individual row
- OrderStatusBadge - Status indicator
- OrderTypeSelector - Type switcher
- ModifyOrderDialog - Modify order
- OrderDetailDialog - Order details
- CancelOrderConfirmation - Cancel confirm
- OrderHistory - Historical orders

**Position Management (15):**
- EnhancedPositionsTable - Positions table
- PositionsTableVirtualized - Virtual scroll
- PositionRow - Individual position
- PositionsGrid - Grid view
- PositionsMetrics - Stats
- PositionsHeader - Header controls
- PositionDetailDialog - Details modal
- PositionCloseDialog - Close dialog
- EnhancedPortfolioDashboard - Compact view
- MarginCallWarningModal - Margin warning
- LiquidationAlert - Liquidation warning
- KYCStatusBanner - KYC indicator
- TrailingStopDialog - Trailing stop setup
- PriceAlertsManager - Alert management
- PriceAlertDialog - Create alert

**Charts & Analysis (13):**
- ChartPanel - Chart wrapper
- TradingViewChart - Candlestick chart
- TradingViewAdvancedChart - Advanced features
- TradingViewMarketsWidget - Market widget
- TechnicalIndicators - TA indicators
- MarketSentiment - Sentiment analysis
- TradingSignals - Trade signals
- EconomicCalendar - Economic events
- MarketWatch - Market watch panel
- RecentPnLChart - P&L chart

**Watchlist Management (15):**
- EnhancedWatchlist - Main watchlist
- AssetTree - Asset selector
- WatchlistTabs - Tab switcher
- Watchlist - Watchlist component
- WatchlistHeader - Header controls
- WatchlistItems - Item list
- WatchlistRow - Individual item
- TradingViewWatchlist - TradingView integration
- CreateWatchlistDialog - New watchlist
- DeleteWatchlistDialog - Delete confirm
- AddSymbolDialog - Add symbol
- CompareSymbolsDialog - Symbol comparison
- TradingViewWatchlist - TradingView watch

**Trade Support:**
- TradingPanelConfirmationDialog - Confirm dialog
- OrderTemplatesDialog - Saved templates
- TradeLoading - Loading skeleton

### Portfolio Components (1)
- PortfolioLoading - Loading skeleton

### Risk Management Components (9)
- UserRiskDashboard - Risk overview
- RiskAlerts - Alert list
- RiskAlertsPanel - Alert panel
- RiskMetricsPanel - Metrics display
- RiskChartsPanel - Risk charts
- RiskSettingsForm - Settings form
- MarginLevelIndicator - Margin display
- MarginLevelAlert - Margin warning
- RiskManagementLoading - Loading skeleton

### KYC Components (6)
- KYCSubmission - Main form
- KycUploader - Document uploader
- DocumentViewer - Document viewer
- KycRequired - Requirement gate
- TradingPageGate - Trading gate
- KycAdminDashboard - Admin dashboard

### Wallet Components (4)
- WalletBalanceCard - Balance display
- TransactionHistory - Transactions
- DepositWithdraw - Deposit/withdraw
- WalletLoading - Loading skeleton

### Other Components (7)
- ErrorBoundary - Global error boundary
- ErrorContextProvider - Error context
- TradingErrorBoundary - Trading errors
- TradingViewErrorBoundary - Chart errors
- APIErrorBoundary - API errors
- ThemeToggle - Dark/light toggle
- Loading, Error, NotFound - Common

---

## Custom Hooks (Total: 41)

### Authentication & Context (2)
- `useAuth()` - User state, sign in/out
- `useErrorContext()` - Error management

### Data Fetching (5)
- `usePortfolioData()` - Portfolio info
- `usePriceUpdates()` - Real-time prices
- `usePriceStream()` - Price WebSocket
- `usePendingOrders()` - Active orders
- `useAssetSpecs()` - Asset details

### Position & Order (6)
- `usePositionClose()` - Close position
- `usePositionUpdate()` - Position updates
- `usePositionAnalysis()` - Analytics
- `useOrderExecution()` - Place order
- `useOrdersTable()` - Table state
- `useOrderTemplates()` - Saved templates

### Risk Management (5)
- `useRiskMetrics()` - Risk metrics
- `useRiskEvents()` - Risk alerts
- `useMarginMonitoring()` - Margin tracking
- `useMarginCallMonitoring()` - Margin calls
- `useLiquidationExecution()` - Liquidation

### P&L & Portfolio (3)
- `usePnLCalculations()` - P&L math
- `useProfitLossData()` - Historical P&L
- `usePortfolioMetrics()` - Portfolio stats

### KYC & Compliance (3)
- `useKyc()` - KYC status
- `useKycTrading()` - KYC restrictions
- `useKycNotifications()` - KYC alerts

### UI & Performance (12)
- `useLoading()` - Loading state
- `use-mobile()` - Mobile detection
- `use-toast()` - Toast notifications
- `useHapticFeedbackFixed()` - Haptic feedback
- `useChartWorker()` - Web Worker for charts
- `useDebouncedChartUpdate()` - Debounced updates
- `usePerformanceMonitoring()` - Performance metrics
- `usePullToRefresh()` - Pull-to-refresh
- And 4 more UI-related hooks

---

## Service Layer (Located in src/lib/)

### Core Services
- `logger.ts` - Error logging + Sentry
- `errorMessageService.ts` - User-friendly errors
- `errorHandling.tsx` - Error patterns

### Business Logic
- `export/` - Portfolio export (CSV, PDF)
- `risk/` - Risk calculations
  - marginCalculations.ts
  - liquidationEngine.ts
  - riskMonitoring.ts
- `kyc/` - KYC verification
  - kycValidation.ts
  - documentVerification.ts
- `trading/` - Trading engine
  - orderMatching.ts
  - slippageCalculation.ts
  - commissionCalculation.ts

### Utilities
- `accessibility.tsx` - A11y helpers
- `format.ts` - Data formatting
- `navigationConfig.ts` - Routes config
- `imageOptimization.ts` - Image utils
- `breadcrumbTracker.ts` - Navigation tracking
- `cacheConfig.ts` - Caching strategy

### Supabase Integration
- `src/integrations/supabase/client.ts` - Client
- `src/integrations/supabase/types.ts` - DB types (auto-generated)

---

## State Management Architecture

```
Component Local State (useState)
    ↓
Custom Hooks (40+ hooks for logic reuse)
    ↓
React Query (server state caching)
    ↓
Global Context (Auth, Notifications, Error)
    ↓
Supabase (source of truth)
    ↓
Real-time Subscriptions (live updates)
```

### Global Contexts
1. **ErrorContext** - Error handling
2. **NotificationContext** - Toast notifications
3. **AuthenticatedLayoutContext** - Layout state
4. **ThemeContext** - Dark/light mode

---

## Data Flow Examples

### Order Placement Flow
```
User Input (OrderForm)
    ↓
Zod Validation
    ↓
useOrderExecution Hook
    ↓
Trading Engine (orderMatching.ts)
    ↓
Supabase Insert
    ↓
Realtime Subscription
    ↓
UI Update (EnhancedPositionsTable)
```

### Real-time Position Updates
```
Realtime Subscription
    ↓
usePositionUpdate Hook
    ↓
usePnLCalculations Hook
    ↓
Memoized PositionRow Component
    ↓
UI Re-render (only changed row)
```

---

## Responsive Design

### Breakpoints (Tailwind CSS)
- xs (default) - Mobile < 640px
- sm - 640px+
- md - 768px+
- lg - 1024px+
- xl - 1280px+
- 2xl - 1536px+

### Mobile-First Layouts
- **Dashboard:** Vertical → 2col → 3col
- **Trade:** Drawers → Sidebar → Full layout
- **Portfolio:** Cards → Simplified table → Full table
- **Orders:** Cards → Compact table → Full table

### Touch Optimization
- 44×44px minimum buttons
- 8px touch target spacing
- Bottom navigation for mobile
- Drawer-based navigation

---

## Performance Optimizations

1. **Code Splitting**
   - All 43 pages lazy-loaded
   - Heavy components (charts) lazy

2. **Memoization**
   - Position rows memoized
   - Order rows memoized

3. **Virtual Scrolling**
   - PositionsTableVirtualized

4. **Image Optimization**
   - WebP/AVIF formats
   - Lazy loading

---

## File Statistics

| Category | Count |
|----------|-------|
| Pages | 43 |
| Components | 184 |
| Hooks | 41 |
| UI Components | 33+ |
| Services | 15+ |
| **Total** | **300+** |

---

## Security Features

- Protected routes with role guards
- Row-level security (Supabase RLS)
- Environment variables for secrets
- CORS configuration
- Session management
- API validation

---

## Accessibility

- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- Focus indicators (3px outline)
- ARIA labels on all forms
- Semantic HTML5
- Color contrast tested

---

## Error Handling

### Multiple Layers
1. App-level Error Boundary
2. Route-level boundaries
3. Component-level handling
4. API error catching
5. Sentry logging

---

## For Questions

This map covers:
- All 43 public + protected + admin routes
- 184 reusable components
- 41 custom hooks for logic
- Complete service layer
- State management strategy
- Mobile/responsive patterns
- Performance optimizations
- Security & accessibility

**Document Version:** 1.0  
**Last Updated:** November 2025
