# 🎯 TradeX Pro - Detailed Task Checklist & Implementation Guide

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Purpose:** Step-by-step implementation tasks with specific code locations, requirements, and testing procedures

---

## 📋 TASK TRACKING SYSTEM

### Task Status Legend
- 🔴 **NOT STARTED** - No code written yet
- 🟡 **IN PROGRESS** - Work begun, incomplete
- 🟢 **COMPLETE** - Fully implemented and tested
- ⚠️ **BLOCKED** - Waiting on dependency
- 🔵 **REVIEW** - Complete but needs code review

---

# 🚀 PHASE 1: CORE TRADING ENGINE (Weeks 1-4, 300+ hours)

## TASK GROUP 1: ORDER EXECUTION SYSTEM

### ✅ TASK 1.1.1: Order Validation Framework
**Status:** ✅ COMPLETE (validators implemented & integrated; unit tests added and passing — 6 tests)  
**Time Est:** 8 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Create comprehensive order validation system that validates all order parameters before execution.

**Location:**
- File: `/src/lib/trading/orderValidation.ts` (NEW)
- File: `/supabase/functions/execute-order/index.ts` (EXISTING - UPDATE)

**Requirements:**
```typescript
// orderValidation.ts should export:
- validateOrderInput() // Zod schema validation
- validateAssetExists() // Check symbol in asset_master
- validateQuantity() // Min/max per asset class
- validateLeverage() // Check against account leverage limit
- validateMarketHours() // Check if trading allowed now
- validateAccountStatus() // Check account not suspended
- validateKYCStatus() // Check kyc_status = 'approved'
```

**Implementation Steps:**
1. [x] Create Zod schema for OrderRequest
2. [x] Define asset-specific validation rules (min quantity, max position size)
3. [x] Implement market hours checking logic
4. [x] Add account status validation
5. [x] Create reusable validation functions
6. [x] Write unit tests for each validation function (unit tests added and passing — 6 tests)
7. [x] Export all validators for use in Edge Function

**Acceptance Criteria:**
- ✅ Invalid symbol → returns 400 error
- ✅ Quantity < minimum → returns 400 error
- ✅ Account suspended → returns 403 error
- ✅ KYC not approved → returns 403 error
- ✅ Market closed → returns 400 error (for limited hours assets)
- ✅ Valid order → passes all validations

**Testing Checklist:**
- [x] Unit test: Invalid symbols rejected
- [x] Unit test: Quantity boundary conditions
- [x] Unit test: Account status checks
- [x] Unit test: Market hours & leverage checks
- [x] Integration test: Valid order passes validation
- [x] Integration test: Each validation fails independently

**Notes:** All 8 tests (6 unit + 2 integration) added at `/src/lib/trading/__tests__/orderValidation.test.ts` and passing. Integration tests verify: (1) complete valid order flow passes all validations, and (2) each validation fails independently when conditions are not met.

### Validator Sync Policy

To avoid divergence between the frontend/dev validators and the Supabase Deno runtime, we keep the frontend copy in `/src/lib/trading/orderValidation.ts` as the canonical development version. When preparing Edge Function deploys (or in CI), run:

```bash
npm run sync-validators
```

This will copy the frontend file into `/supabase/functions/lib/orderValidation.ts` and adapt the import to use the Deno `zod` URL. Keep both files in sync: update `src/lib/trading/orderValidation.ts` first, run the script, then deploy.

---

### 🟢 TASK 1.1.2: Margin Calculation Engine
**Status:** ✅ COMPLETE (all formulas implemented, unit tests added and passing — 27 tests)  
**Time Est:** 10 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Implement accurate margin requirement calculations for all asset classes based on leverage and contract sizes.

**Location:**
- File: `/src/lib/trading/marginCalculations.ts` (NEW - canonical)
- File: `/supabase/functions/lib/marginCalculations.ts` (Deno copy)
- File: `/supabase/functions/lib/marginCalculations.d.ts` (TypeScript declarations)

**Key Formulas Implemented:**
```
Margin Required: M = (P × Price) / Leverage
Free Margin: FM = Equity - MarginUsed
Margin Level: ML = (Equity / MarginUsed) × 100 %
Liquidation Price: LP = Entry Price ± (Entry Price × Leverage × (1 - Maintenance Margin Ratio))
Max Position Size: Pmax = (Available Equity × Leverage) / Current Price
```

**Implementation Steps:**
1. [x] Extract asset-specific leverage limits from PRD and docs
2. [x] Define maintenance margin ratios per asset class (forex:2%, stocks:25%, crypto:15%, etc.)
3. [x] Implement margin calculation with decimal precision (4 decimals)
4. [x] Add protection against division by zero
5. [x] Create helper functions for each calculation
6. [x] Write comprehensive unit tests (27 tests covering all functions)
7. [x] Create Deno copy for Edge Functions
8. [x] Update sync script to include margin calculations

**Acceptance Criteria:**
- ✅ Margin calculated to 4 decimal places
- ✅ Asset-specific maintenance ratios applied correctly
- ✅ No floating point precision errors
- ✅ Margin level status (safe/warning/critical/liquidation) determined correctly
- ✅ Free margin calculated accurately
- ✅ Liquidation price calculated for long and short positions
- ✅ Max position size constrained by leverage and available equity

**Testing Checklist:**
- [x] Unit test: Margin required calculation
- [x] Unit test: Free margin calculation
- [x] Unit test: Margin level percentage
- [x] Unit test: Position value calculation
- [x] Unit test: Unrealized P&L (long/short)
- [x] Unit test: Liquidation price
- [x] Unit test: Max position size
- [x] Unit test: Can open position check
- [x] Unit test: Margin summary (safe/warning/critical/liquidation)
- [x] Unit test: Asset config lookup
- [x] Integration test: Complete margin workflow for BTC position
- [x] Integration test: Liquidation scenario detection

**Notes:** All 27 unit + integration tests passing. Asset class configurations include forex majors/minors/exotics, indices, commodities, stocks, crypto, ETFs, and bonds with appropriate leverage and maintenance margins. Sync policy: canonical at `/src/lib/trading/marginCalculations.ts`; sync to Deno folder via `npm run sync-validators`.

---

### 🟢 TASK 1.1.3: Slippage Simulation Engine
**Status:** 🟢 COMPLETE (all formulas implemented, unit & integration tests passing — 36 tests)  
**Time Est:** 12 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Implement realistic order slippage simulation based on market conditions, asset volatility, and order size.

**Location:**
- File: `/src/lib/trading/slippageCalculation.ts` (NEW - canonical)
- File: `/supabase/functions/lib/slippageCalculation.ts` (Deno copy)

**Key Formulas Implemented:**
```
Base Slippage = Spread (normal market)
Volatility Multiplier = (Current IV / Average IV) × Asset Multiplier
Size Multiplier = (Order Size % / Liquidity Base)^1.5
Total Slippage = Base Slippage × Volatility Multiplier × Size Multiplier × After-Hours Penalty
Execution Price = Market Price ± (Slippage × Price Step)
```

**Asset-Specific Slippage Ranges (Implemented):**
- Forex Majors (EURUSD, USDJPY, etc.): 0–0.6 pips (3x wider in volatility)
- Forex Minors: 0.5–2 pips
- Forex Exotics (USDTRY, etc.): 2–15 pips (4x multiplier in volatility)
- Indices (US500, etc.): 0.5–2 points (2x multiplier)
- Commodities (XAUUSD, WTIUSD, etc.): 0.1–1 points (3x in volatility)
- Stocks (AAPL, TSLA, etc.): $0.03–$0.15/share (2x at earnings)
- Cryptocurrencies (BTCUSD, ETHUSD): 20–50 pips (2.5x in volatility)
- ETFs (SPY, QQQ): $0.03–$0.15/share
- Bonds (US10Y): $0.005–$0.05

**Implementation Steps Completed:**
1. [x] Define slippage calculation formula per asset class
2. [x] Implement volatility detection logic (current vol vs 14-day MA)
3. [x] Implement order size impact calculation
4. [x] Create market condition flags (high volatility, low liquidity, after-hours)
5. [x] Generate deterministic random slippage within bounds
6. [x] Integrate slippage into order execution pricing
7. [x] Write 36 comprehensive unit & integration tests
8. [x] Create Deno copy for Edge Functions (`/supabase/functions/lib/slippageCalculation.ts`)
9. [x] Update sync-validators script to include slippage calculations

**Acceptance Criteria - All Met:**
- ✅ Slippage never exceeds max spread for asset class
- ✅ Larger orders incur more slippage (sizeMultiplier increases)
- ✅ High-volatility periods multiply slippage (volatilityMultiplier)
- ✅ Results are deterministic (same seed → same slippage)
- ✅ Execution price reflects price + slippage
- ✅ Buy orders slip up (higher price), sell orders slip down (lower price)
- ✅ After-hours trading applies penalty multiplier
- ✅ All edge cases handled gracefully

**Testing Results:**
✅ **Unit Tests (12):**
- 5 volatility multiplier tests (ratio calculation, high-vol events, minimums)
- 6 size multiplier tests (order sizing, liquidity levels, penalties)
- 1 base slippage test (range validation, deterministic generation)

✅ **Integration Tests (24):**
- 8 calculateSlippage tests (Forex, volatility, order size, after-hours, sell orders, rejection, determinism)
- 4 slippage in different market conditions (stable/volatile/exotic/liquidation scenarios)
- 12 helper function tests (getExecutionPrice, asset configs, supported assets, edge cases)

**All 36 tests passing ✅**

**Key Exported Functions:**
```typescript
- calculateSlippage(input: SlippageCalculationInput) → SlippageResult
- calculateVolatilityMultiplier(...) → number
- calculateSizeMultiplier(...) → number
- getExecutionPrice(symbol, price, side, quantity) → number
- getAssetSlippageConfig(symbol) → config | undefined
- getSupportedAssets() → string[]
- ASSET_SLIPPAGE_CONFIG: Record<symbol, config>
```

**Sync Policy:**
Canonical file at `/src/lib/trading/slippageCalculation.ts`. Run `npm run sync-validators` to copy to Deno folder with Zod import substitution before deploying Edge Functions.

---

### 🔴 TASK 1.1.4: Order Matching & Execution
**Status:** 🔴 NOT STARTED  
**Time Est:** 15 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Implement core order matching logic that matches buy/sell orders, executes market/limit/stop orders, and updates positions and balances.

**Location:**
- File: `/supabase/functions/execute-order/index.ts` (EXISTING - EXTEND)
- New RPC: `/supabase/migrations/execute_order_atomic.sql` (Stored Procedure)

**Order Types to Support:**
- Market: Immediate execution at market price + slippage
- Limit: Execute only if price reaches specified level
- Stop: Execute when price touches stop level (market on trigger)
- Stop-Limit: Execute when stop triggered, then limit order behavior
- Trailing Stop: Automatically adjust stop based on price movement

**Implementation Steps:**
1. [ ] Extend execute_order_atomic RPC to handle multiple order types
2. [ ] Implement market order execution (immediate fill at market price + slippage)
3. [ ] Implement limit order queue (store order if condition not met; trigger on price)
4. [ ] Implement stop order trigger logic (monitor price; execute on touch)
5. [ ] Implement stop-limit hybrid behavior
6. [ ] Update position/balance atomically in single transaction
7. [ ] Record order execution event with timestamp and execution price
8. [ ] Handle order rejection (insufficient margin, market closed, etc.)
9. [ ] Write integration tests for each order type

**Acceptance Criteria:**
- ✅ Market orders execute at market price + slippage
- ✅ Limit orders do not execute above/below limit
- ✅ Stop orders trigger on price touch
- ✅ Position and balance updated atomically
- ✅ Order status transitions correctly (pending → filled → closed)
- ✅ Rejection handled gracefully with error message

**Testing Checklist:**
- [ ] Integration test: Market order fills immediately
- [ ] Integration test: Limit order queued until price
- [ ] Integration test: Stop order triggers on price
- [ ] Integration test: Partial fill handling
- [ ] Integration test: Order rejection scenarios
- [ ] Load test: 100+ orders/second throughput

---

### 🔴 TASK 1.1.5: Commission Calculation
**Status:** 🔴 NOT STARTED  
**Time Est:** 6 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Calculate per-order commissions based on asset class, order size, and account tier (if applicable).

**Location:**
- File: `/src/lib/trading/commissionCalculation.ts` (NEW)
- File: `/supabase/functions/lib/commissionCalculation.ts` (Deno copy)

**Commission Structure (from PRD):**
```
Forex Majors/Minors: No commission (spread-only)
Forex Exotics: No commission (spread-only)
Indices CFDs: No commission (usually)
Commodities: No commission
Stocks: $0.01–$0.05 per share
Cryptocurrencies: No commission (usually)
ETFs: Similar to stocks
Bonds: No commission
```

**Implementation Steps:**
1. [ ] Create asset class commission mapping
2. [ ] Implement commission calculation based on quantity and asset type
3. [ ] Handle zero-commission assets (pass through)
4. [ ] Add commission to order cost calculation
5. [ ] Deduct commission from account balance on fill
6. [ ] Record commission in order history for transparency
7. [ ] Write unit tests

**Acceptance Criteria:**
- ✅ Stock commissions calculated per share ($0.01–$0.05)
- ✅ Other asset classes show $0 commission
- ✅ Commission deducted from account on fill
- ✅ Commission visible in order details

**Testing Checklist:**
- [ ] Unit test: Stock commission calculated correctly
- [ ] Unit test: Forex commission is zero
- [ ] Unit test: Commission reflected in balance
- [ ] Integration test: Commission shown in order history

---

### 🔴 TASK 1.1.6: Complete Execute-Order Function
**Status:** 🟡 IN PROGRESS  
**Time Est:** 5 hours  
**Owner:** Backend Dev  
**Priority:** P0 - CRITICAL  

**Description:**
Integrate validation, margin calculation, slippage, order matching, and commission into a complete, production-ready execute-order Edge Function.

**Location:**
- File: `/supabase/functions/execute-order/index.ts` (EXISTING - REFINE)

**Integration Checklist:**
1. [x] Validate order input (orderValidation.ts)
2. [x] Check KYC and account status
3. [ ] Calculate margin required (marginCalculations.ts)
4. [ ] Calculate slippage (slippageCalculation.ts)
5. [ ] Calculate execution price (market price ± slippage)
6. [ ] Execute order via order matching logic (1.1.4)
7. [ ] Calculate commission (commissionCalculation.ts)
8. [ ] Update position and balance atomically
9. [ ] Log order execution event
10. [ ] Return execution confirmation to client

**Error Handling:**
- Validation error → 400 Bad Request
- KYC/account error → 403 Forbidden
- Insufficient margin → 400 Bad Request (with margin requirement)
- Market closed → 400 Bad Request (for limited hours assets)
- Database error → 500 Internal Server Error

**Acceptance Criteria:**
- ✅ All validation passes before execution
- ✅ Execution price = market price ± slippage
- ✅ Position and balance updated atomically
- ✅ Commission calculated and deducted
- ✅ Order status transitions correctly
- ✅ All error cases handled gracefully

**Testing Checklist:**
- [x] Unit tests for each component (validation, margin, etc.)
- [ ] End-to-end test: Valid order → execution → position created
- [ ] End-to-end test: Insufficient margin → rejection
- [ ] Load test: 100+ concurrent order executions
- [ ] Stress test: Network failure recovery

**Notes:** This task coordinates outputs from Tasks 1.1.1, 1.1.2, 1.1.3, and 1.1.5. Implementation depends on completion of those tasks.

---

### SUMMARY OF REMAINING TASKS

For brevity in this document, here's the complete task list structure:

**TASK GROUP 1: ORDER EXECUTION (6 tasks - ~57 hours)**
- 1.1.1: Order Validation Framework (8h) 🟢 COMPLETE
- 1.1.2: Margin Calculation Engine (10h) 🟢 COMPLETE
- 1.1.3: Slippage Simulation Engine (12h) 🔴
- 1.1.4: Order Matching & Execution (15h) 🔴
- 1.1.5: Commission Calculation (6h) 🔴
- 1.1.6: Complete Execute-Order Function (5h) 🟡

**TASK GROUP 2: REAL-TIME POSITION MANAGEMENT (4 tasks - ~43 hours)**
- 1.2.1: Position P&L Calculation (12h) 🔴
- 1.2.2: Real-Time Position Update Function (15h) 🔴
- 1.2.3: Realtime Position Subscription (8h) 🟡
- 1.2.4: Margin Level Monitoring & Alerts (8h) 🔴

**TASK GROUP 3: RISK MANAGEMENT (2 tasks - ~22 hours)**
- 1.3.1: Margin Call Detection Engine (12h) 🔴
- 1.3.2: Liquidation Execution Logic (10h) 🔴

**TASK GROUP 4: CORE TRADING UI (4 tasks - ~65 hours)**
- 1.4.1: Trading Panel Order Form (20h) 🟡
- 1.4.2: Positions Table Real-Time (18h) 🔴
- 1.4.3: Orders Table Status Tracking (15h) �
- 1.4.4: Portfolio Dashboard Summary (12h) �🟡

**Phase 1 Total: 16 tasks, ~196 hours, 33% complete**

---

# PHASE 2: ACCOUNT & KYC MANAGEMENT (Weeks 4-6)

---

## 🔴 TASK 1.1.3: Slippage Simulation Engine
**Status:** 🔴 NOT STARTED
**Time Est:** 12 hours
**Owner:** Backend Dev
**Priority:** P0 - CRITICAL

**Description:**
Implement slippage calculation engine that simulates realistic price slippage based on order size, market volatility, and asset liquidity.

**Location:**
- File: `/src/lib/trading/slippageCalculations.ts` (NEW - canonical)
- File: `/supabase/functions/lib/slippageCalculations.ts` (Deno copy)

**Requirements:**
- Volatility-based slippage multiplier (IV%)
- Order size impact on slippage
- Bid-ask spread simulation
- Asset-specific slippage profiles
- Integration with execute-order function

**Acceptance Criteria:**
- Slippage increases with higher volatility
- Slippage increases with larger orders (% of liquidity)
- Slippage varies by asset class
- Execute-order uses calculated slippage in fill price

---

## 🔴 TASK 1.1.4: Order Matching & Execution
**Status:** 🔴 NOT STARTED
**Time Est:** 15 hours
**Owner:** Backend Dev
**Priority:** P0 - CRITICAL

**Description:**
Implement order matching logic and execution against simulated market prices.

---

## 🔴 TASK 1.1.5: Commission Calculation
**Status:** 🔴 NOT STARTED
**Time Est:** 6 hours
**Owner:** Backend Dev
**Priority:** P0 - CRITICAL

**Description:**
Implement commission calculations based on order type, size, and account tier.

---

## 🟡 TASK 1.1.6: Complete Execute-Order Function
**Status:** 🟡 IN PROGRESS
**Time Est:** 5 hours
**Owner:** Backend Dev
**Priority:** P0 - CRITICAL

**Description:**
Integrate all order execution components into the Supabase Edge Function.

---

### SUMMARY OF REMAINING TASKS

For brevity in this document, here's the complete task list structure:

**TASK GROUP 1: ORDER EXECUTION (6 tasks - ~57 hours)**
- 1.1.1: Order Validation Framework (8h) 🟢 COMPLETE
- 1.1.2: Margin Calculation Engine (10h) 🟢 COMPLETE
- 1.1.3: Slippage Simulation Engine (12h) 🔴
- 1.1.4: Order Matching & Execution (15h) 🔴
- 1.1.5: Commission Calculation (6h) 🔴
- 1.1.6: Complete Execute-Order Function (5h) 🟡

**TASK GROUP 2: REAL-TIME POSITION MANAGEMENT (4 tasks - ~43 hours)**
- 1.2.1: Position P&L Calculation (12h) 🔴
- 1.2.2: Real-Time Position Update Function (15h) 🔴
- 1.2.3: Realtime Position Subscription (8h) 🟡
- 1.2.4: Margin Level Monitoring & Alerts (8h) 🔴

**TASK GROUP 3: RISK MANAGEMENT (2 tasks - ~22 hours)**
- 1.3.1: Margin Call Detection Engine (12h) 🔴
- 1.3.2: Liquidation Execution Logic (10h) 🔴

**TASK GROUP 4: CORE TRADING UI (4 tasks - ~65 hours)**
- 1.4.1: Trading Panel Order Form (20h) 🟡
- 1.4.2: Positions Table Real-Time (18h) 🔴
- 1.4.3: Orders Table Status Tracking (15h) 🔴
- 1.4.4: Portfolio Dashboard Summary (12h) 🟡

**Phase 1 Total: 16 tasks, ~196 hours, 33% complete**

---

# PHASE 2: ACCOUNT & KYC MANAGEMENT (Weeks 4-6)

**TASK GROUP 5: KYC & COMPLIANCE (3 tasks - ~55 hours)**
- 2.1.1: Complete KYC Admin Review Workflow (35h)
- 2.1.2: User Account Settings & Preferences (20h)
- 2.1.3: Wallet & Deposit System (30h)

**TASK GROUP 6: ANALYTICS & HISTORY (2 tasks - ~55 hours)**
- 2.2.1: Trading History & Performance Analytics (40h)
- 2.2.2: Risk Management Suite (35h)
- 2.2.3: Price Alerts & Notifications (25h)

---

# PHASE 3: COPY TRADING (Weeks 8-10)

**TASK GROUP 7: COPY TRADING SYSTEM (2 tasks - ~80 hours)**
- 3.1.1: Leaderboard & Leader Discovery (35h)
- 3.1.2: Copy Trading Execution Engine (45h)

---

## 🎯 QUICK REFERENCE: KEY FILE LOCATIONS

### Backend (Deno Edge Functions)
```
/supabase/functions/
├── execute-order/index.ts ................. Core order execution
├── close-position/index.ts ............... Position closing
├── modify-order/index.ts ................. Order modification (TODO)
├── cancel-order/index.ts ................. Order cancellation (TODO)
├── check-risk-levels/index.ts ............ Margin calls (TODO)
├── update-positions/index.ts ............. P&L updates (TODO)
├── check-price-alerts/index.ts ........... Alert checking (TODO)
├── update-trailing-stops/index.ts ........ Stop updates (TODO)
├── send-notification/index.ts ............ Notifications (TODO)
├── create-crypto-payment/index.ts ........ Deposits (PARTIAL)
├── handle-payment-callback/index.ts ...... Webhook (TODO)
└── validate-kyc-upload/index.ts .......... KYC validation (PARTIAL)
```

### Frontend Hooks (React)
```
/src/hooks/
├── useAuth.tsx ........................... Authentication ✅
├── useOrderExecution.tsx ................. Order submission (PARTIAL)
├── useOrderTemplates.tsx ................. Order templates (TODO)
├── usePendingOrders.tsx .................. Pending orders ✅
├── usePortfolioData.tsx .................. Portfolio metrics (TODO)
├── usePositionClose.tsx .................. Close position (TODO)
├── usePriceUpdates.tsx ................... Price subscriptions (PARTIAL)
├── useTradingHistory.tsx ................. History fetching ✅
└── useWatchlists.tsx ..................... Watchlist mgmt (PARTIAL)
```

### Frontend Components
```
/src/components/trading/
├── TradingPanel.tsx ...................... Order entry form (PARTIAL)
├── PositionsTable.tsx .................... Position list (SCAFFOLD)
├── OrdersTable.tsx ....................... Order list (SCAFFOLD)
├── PortfolioDashboard.tsx ................ Summary metrics (PARTIAL)
├── ChartPanel.tsx ........................ Charts (✅ TradingView embed)
├── Watchlist.tsx ......................... Symbol list (PARTIAL)
├── EnhancedWatchlist.tsx ................. Advanced watchlist (TODO)
├── MarketSentiment.tsx ................... Market analysis (MOCK)
├── TechnicalIndicators.tsx ............... TA tools (MOCK)
├── TradingSignals.tsx .................... Signals (MOCK)
├── KYCStatusBanner.tsx ................... KYC warning (✅)
└── [Others]
```

### Database Migrations
```
/supabase/migrations/
├── 001_core_tables.sql ................... Users, orders, positions
├── 002-012_*.sql ......................... Additional tables & RLS
└── [Need: Stored procedures, triggers, cron jobs]
```
