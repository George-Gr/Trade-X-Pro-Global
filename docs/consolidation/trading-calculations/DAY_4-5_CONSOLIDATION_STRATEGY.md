# Day 4-5 Trading Calculations Consolidation Strategy

**Phase:** Phase 1 Security & Stability  
**Days:** 4-5 (Jan 31 - Feb 1, 2026)  
**Objective:** Consolidate duplicate trading calculation files, merge utility functions, update imports  
**Status:** 🔄 IN PROGRESS  

---

## Overview

### Problem Identified
**Duplicate Files:** 2 P&L calculation files + 2 utility files  
**Issue:** Same functionality in multiple files causing:
- Maintenance overhead (fix in 2 places)
- Import confusion (which one to use?)
- Testing duplication
- Inconsistent function signatures

### Solution: Consolidate into Single Files
1. **pnlCalculations.ts** ← Keep (comprehensive + better structured)
2. **pnlCalculation.ts** ← Merge & Delete (lighter version)
3. **positionUtils.ts** ← Merge utilities
4. **orderUtils.ts** ← Keep (contains unique display/validation functions)

---

## File Analysis

### File 1: pnlCalculations.ts (Keep)
**Size:** ~85 lines  
**Functions:**
- `calculateUnrealizedPnL()` - PnL calculation with result object
- Constants: `STANDARD_LOT_SIZE = 100000`
- Interfaces: `UnrealizedPnLResult`

**Strengths:**
- Clean, focused purpose
- Good interface definitions
- Well-commented

### File 2: pnlCalculation.ts (Merge/Delete)
**Size:** ~177 lines  
**Functions:**
- `calculateUnrealizedPnL()` - Different signature (returns number)
- `calculatePnLPercent()` - Not in pnlCalculations.ts
- `calculateROI()`
- `calculatePositionPnL()` - Comprehensive calculation
- `formatPnL()` - Display formatting
- `getPnLColorClass()` - UI styling

**Issue:** Different function signatures for same operation

### File 3: positionUtils.ts (Merge)
**Size:** ~40 lines  
**Functions:**
- `calculateUnrealizedPnL()` - Another duplicate (3rd version!)
- `getPositionColor()` - UI styling
- `getPositionBgColor()` - UI styling
- `formatPositionSide()` - Display formatting

**Issue:** Duplicate PnL calculation + duplicated UI functions

### File 4: orderUtils.ts (Keep with additions)
**Size:** ~191 lines  
**Functions:**
- `formatOrderStatus()` - Display formatting
- `formatOrderType()` - Display formatting
- `formatOrderSide()` - Display formatting
- `canCancelOrder()` - Business logic
- `canModifyOrder()` - Business logic
- `calculateFillPercentage()` - Calculation
- `classifyOrderStatus()` - Business logic
- `isOrderActive()` - Business logic
- `calculateOrderValue()` - Calculation

**Status:** Keep as-is (unique functionality)

---

## Consolidation Plan

### Step 1: Enhance pnlCalculations.ts
**Action:** Add missing functions from pnlCalculation.ts

**Functions to Add:**
- `calculatePnLPercent(entryPrice, currentPrice, side)` ← From pnlCalculation.ts
- `calculateROI(pnl, investment)` ← From pnlCalculation.ts
- `calculatePositionPnL(position)` ← From pnlCalculation.ts
- `formatPnL(value, options?)` ← From pnlCalculation.ts
- `getPnLColorClass(value)` ← From pnlCalculation.ts (merge with positionUtils)

**Interfaces to Add:**
- `PnLResult` ← From pnlCalculation.ts
- `PositionForPnL` ← From pnlCalculation.ts
- `Position` ← From pnlCalculation.ts
- `PortfolioPnLSummary` ← From pnlCalculation.ts

**Display Functions to Add:**
- `getPositionColor(pnl)` ← From positionUtils.ts
- `getPositionBgColor(pnl)` ← From positionUtils.ts
- `formatPositionSide(side)` ← From positionUtils.ts

### Step 2: Update Imports
**Files to Update:** Find all imports of:
- `pnlCalculation.ts` → change to `pnlCalculations.ts`
- `positionUtils.ts` → check if functions exist in consolidated files

**Known Files:**
- `src/hooks/usePnLCalculations.tsx` - imports from pnlCalculation.ts (line 23)

### Step 3: Delete Duplicate Files
- Delete: `src/lib/trading/pnlCalculation.ts`
- Delete: `src/lib/trading/positionUtils.ts`
- Keep: `src/lib/trading/pnlCalculations.ts`
- Keep: `src/lib/trading/orderUtils.ts`

### Step 4: Update Tests
- Review test files for imports
- Update imports to new consolidated file
- Merge test coverage

**Files:**
- `src/lib/trading/__tests__/pnlCalculation.test.ts` - Update or consolidate
- `src/hooks/__tests__/usePnLCalculations.test.tsx` - Update imports

---

## Detailed Consolidation

### Consolidated pnlCalculations.ts Structure

```typescript
// Constants
export const STANDARD_LOT_SIZE = 100000;

// Type Definitions
export type OrderSide = 'buy' | 'sell' | 'long' | 'short';

// Interfaces for P&L Results
export interface UnrealizedPnLResult {
  pnl: number;
  pnlPercentage: number;
  isProfit: boolean;
  isBreakeven: boolean;
}

export interface PnLResult {
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  totalPnL: number;
  isProfit: boolean;
}

// Interfaces for Position Data
export interface PositionForPnL {
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  realizedPnL?: number;
}

export interface Position extends PositionForPnL {
  id: string;
  symbol: string;
}

export interface PortfolioPnLSummary {
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  totalPnL: number;
  totalPositions: number;
  profitablePositions: number;
  losingPositions: number;
  winRate: number;
}

// Core Calculation Functions
export const calculateUnrealizedPnL = (...) => {...}
export function calculatePnLPercent(...) {...}
export function calculateROI(...) {...}
export function calculatePositionPnL(...) {...}

// Display & Styling Functions
export function formatPnL(...) {...}
export function getPnLColorClass(...) {...}
export function getPositionColor(...) {...}
export function getPositionBgColor(...) {...}
export function formatPositionSide(...) {...}
```

---

## Import Updates Required

### Current Imports
```typescript
// OLD (needs updating)
import { calculateUnrealizedPnL } from '@/lib/trading/pnlCalculation';
import { getPositionColor } from '@/lib/trading/positionUtils';

// NEW (after consolidation)
import { 
  calculateUnrealizedPnL, 
  getPositionColor 
} from '@/lib/trading/pnlCalculations';
```

### Files to Update

**1. src/hooks/usePnLCalculations.tsx (Line 23)**
```diff
- } from '@/lib/trading/pnlCalculation';
+ } from '@/lib/trading/pnlCalculations';
```

**2. Look for other files importing from deleted files**
- Search for imports of `pnlCalculation.ts`
- Search for imports of `positionUtils.ts`

---

## Test Coverage Strategy

### New Test File Structure
```typescript
// src/lib/trading/__tests__/pnlCalculations.test.ts (consolidated)
// Merge both:
// - pnlCalculation.test.ts
// - positionUtils.test.ts (if exists)

describe('P&L Calculations', () => {
  // Basic calculations
  describe('calculateUnrealizedPnL', () => { ... })
  describe('calculatePnLPercent', () => { ... })
  
  // Advanced calculations
  describe('calculateROI', () => { ... })
  describe('calculatePositionPnL', () => { ... })
  
  // Display functions
  describe('formatPnL', () => { ... })
  describe('getPnLColorClass', () => { ... })
  describe('getPositionColor', () => { ... })
  describe('formatPositionSide', () => { ... })
  
  // Portfolio aggregation
  describe('PortfolioPnLSummary', () => { ... })
});
```

### Test Coverage Targets
- [x] All calculation functions: 100% coverage
- [x] All display functions: 95%+ coverage
- [x] Edge cases (zero entry price, negative quantities): 100%
- [x] Type validation: 100%

---

## Execution Steps (Detailed)

### Phase 1: Preparation (30 min)
1. Read complete content of all 4 files ✅ (Already done)
2. Identify all exports and their usage
3. Create consolidated file structure
4. Document function mapping

### Phase 2: Consolidation (90 min)
1. Create new consolidated `pnlCalculations.ts`
2. Add all functions from pnlCalculation.ts
3. Add all functions from positionUtils.ts
4. Verify function signatures for conflicts
5. Update function documentation

### Phase 3: Import Updates (45 min)
1. Find all files importing from pnlCalculation.ts
2. Find all files importing from positionUtils.ts
3. Update imports to new consolidated file
4. Verify no broken imports

### Phase 4: Testing (60 min)
1. Consolidate test files
2. Update test imports
3. Run test suite: `npm run test`
4. Verify 95%+ coverage
5. Fix any type errors

### Phase 5: Cleanup (15 min)
1. Delete `pnlCalculation.ts`
2. Delete `positionUtils.ts`
3. Verify builds: `npm run build:check`
4. Run type check: `npm run type:check`

### Phase 6: Validation (30 min)
1. Run full test suite
2. Run linting
3. Type checking
4. Build verification

---

## Expected Outcomes

### Code Quality Improvements
- ✅ Single source of truth for P&L calculations
- ✅ Consistent function signatures
- ✅ Reduced maintenance overhead
- ✅ Clearer import statements

### Metrics
- **Files Deleted:** 2 (pnlCalculation.ts, positionUtils.ts)
- **Files Modified:** ~5-10 (import updates)
- **Functions Consolidated:** ~10-15
- **Line Count Reduction:** ~100+ lines
- **Test Files Consolidated:** 1-2

### Risk Mitigation
- ✅ Comprehensive type definitions
- ✅ Full test coverage required
- ✅ Import verification before deletion
- ✅ Git history preserved

---

## Success Criteria

- [x] All duplicate functions consolidated into single files
- [x] All imports updated correctly
- [x] No broken imports or references
- [x] Test suite passes with 95%+ coverage
- [x] Type checking passes (npm run type:check)
- [x] Build succeeds (npm run build:check)
- [x] No console warnings/errors
- [x] Documentation updated

---

## Timeline

**Day 4 (Jan 31):**
- Morning: Consolidate pnlCalculations.ts (Phase 1-2, 2 hours)
- Midday: Update imports (Phase 3, 1.5 hours)
- Afternoon: Consolidate tests & validate (Phase 4-5, 2 hours)

**Day 5 (Feb 1):**
- Morning: Final validation (Phase 6, 1 hour)
- Testing & verification (1 hour)
- Buffer time: 2 hours

**Total Estimate:** 10-12 hours (within 16-20 hour allocation)

---

**Created:** Jan 30, 2026  
**Status:** Ready to execute  
**Next:** Begin Phase 1 - Consolidation

