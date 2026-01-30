# Phase 1 Execution Checklist - Week 1

**Start Date:** January 30, 2026  
**Target Duration:** 7 days  
**Overall Status:** IN PROGRESS  
**Effort Estimate:** 10 developer days

---

## 🎯 Phase 1 Overview

**Focus:** Security & Stability  
**Impact:** 🔴 CRITICAL  
**Deliverables:** Fixed realtime leaks, secured config, standardized policies, consolidated calculations, unified monitoring

---

## Day 1-2: Fix Realtime Subscription Memory Leaks

**Status:** ⏳ IN PROGRESS  
**Effort:** 2 days  
**Priority:** 🔴 CRITICAL

### Tasks

- [ ] **1.1 - Identify all Realtime hooks** (2 hours)
  - [ ] Find all files with `useRealtime` pattern
  - [ ] List: useRealtimePositions, useRealtimeOrders, useRealtimeProfile, usePriceStream, etc.
  - [ ] Document file locations and sizes
  - [ ] Check for any custom subscription patterns

- [ ] **1.2 - Audit against canonical pattern** (3 hours)
  - [ ] Review: src/hooks/useRealtimePositions.tsx (canonical)
  - [ ] Compare each hook against pattern
  - [ ] Check for: `subscription.unsubscribe()` in cleanup
  - [ ] Document findings: Which ones match, which need fixes

- [ ] **1.3 - Create test file for memory leaks** (2 hours)
  - [ ] Create: src/hooks/__tests__/realtimeMemoryLeaks.test.tsx
  - [ ] Add test for: unsubscribe on unmount
  - [ ] Add test for: no duplicate subscriptions on re-render
  - [ ] Add test for: multiple mount/unmount cycles

- [ ] **1.4 - Fix non-compliant hooks** (2 hours)
  - [ ] For each hook missing cleanup:
    - [ ] Add unsubscribe in cleanup
    - [ ] Test changes
    - [ ] Verify no regressions

- [ ] **1.5 - Run memory profiler tests** (1 hour)
  - [ ] Execute: npm run test -- --grep "useRealtime"
  - [ ] Check Chrome DevTools memory profile
  - [ ] Document: Memory usage before/after

- [ ] **1.6 - Create standardized subscription helper** (1 hour)
  - [ ] Create: src/hooks/useRealtimeSubscription.ts
  - [ ] Export: Generic subscription pattern
  - [ ] Document: Usage and examples

- [ ] **1.7 - Document pattern** (1 hour)
  - [ ] Create: docs/developer-guide/REALTIME_PATTERNS.md
  - [ ] Include: Canonical pattern + best practices
  - [ ] Include: Common pitfalls to avoid
  - [ ] Include: Testing approach

### Success Criteria
- [ ] All Realtime hooks follow same cleanup pattern
- [ ] Memory profiler shows 0 leaks after 100+ re-renders
- [ ] All tests passing: npm run test
- [ ] Documentation complete with examples
- [ ] No regressions in functionality

### Files to Review/Modify
- [ ] src/hooks/useRealtimePositions.tsx (canonical - verify only)
- [ ] src/hooks/useRealtimeOrders.ts
- [ ] src/hooks/useRealtimeProfile.ts
- [ ] src/hooks/usePriceStream.ts
- [ ] [Other realtime hooks as found]

---

## Day 2-3: Secure Environment Configuration

**Status:** ⏳ PENDING  
**Effort:** 1.5 days  
**Priority:** 🔴 CRITICAL

### Tasks

- [ ] **2.1 - Create .env.example** (1 hour)
  - [ ] Create file: .env.example
  - [ ] Add all required variables:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_PUBLISHABLE_KEY
    - VITE_PRODUCTION_URL
    - VITE_SENTRY_DSN
    - Feature flags (optional)
  - [ ] Add clear comments for each

- [ ] **2.2 - Verify .gitignore** (30 min)
  - [ ] Check: .env patterns in .gitignore
  - [ ] Verify: .env.local is ignored
  - [ ] Verify: .env.production is ignored
  - [ ] Fix any gaps

- [ ] **2.3 - Scan git history for secrets** (1 hour)
  - [ ] Command: grep git history for sensitive patterns
  - [ ] Check: SENTRY_DSN, SUPABASE_KEY, API_SECRET
  - [ ] Document: Any findings
  - [ ] Action: Rotate if needed

- [ ] **2.4 - Update README** (1 hour)
  - [ ] Add section: "Environment Setup"
  - [ ] Include: Copy .env.example to .env.local
  - [ ] Include: How to get credentials from Supabase dashboard
  - [ ] Include: Link to security checklist

- [ ] **2.5 - Add security checklist** (30 min)
  - [ ] Create: SECURITY_CHECKLIST.md
  - [ ] Include: Pre-deployment checks
  - [ ] Include: Secret rotation reminders
  - [ ] Include: Credential access policies

### Success Criteria
- [ ] .env.example exists with all variables
- [ ] .gitignore properly covers all .env files
- [ ] No secrets in git history
- [ ] README updated with setup instructions
- [ ] Team knows not to commit .env.local

### Files to Create/Modify
- [ ] .env.example (create)
- [ ] .gitignore (verify/update)
- [ ] README.md (add section)
- [ ] SECURITY_CHECKLIST.md (create)

---

## Day 3-4: Review Supabase RLS Policies

**Status:** ⏳ PENDING  
**Effort:** 2 days  
**Priority:** 🔴 CRITICAL

### Tasks

- [ ] **3.1 - Audit all migrations** (2 hours)
  - [ ] Find all SQL migration files: supabase/migrations/
  - [ ] Extract all CREATE POLICY statements
  - [ ] List by table: Which tables have policies, which don't
  - [ ] Document: Policy count per table

- [ ] **3.2 - Verify required policies** (2 hours)
  - For each table, check for policies:
    - [ ] profiles: SELECT (own), UPDATE (own), ADMIN (all)
    - [ ] positions: SELECT (own), UPDATE (own), ADMIN (all)
    - [ ] orders: Similar structure
    - [ ] [Other critical tables]
  - [ ] Document gaps

- [ ] **3.3 - Create missing policies** (2 hours)
  - [ ] For each table with missing policies:
    - [ ] Create migration file
    - [ ] Add CREATE POLICY statements
    - [ ] Include proper filters by user_id or role
    - [ ] Test policies

- [ ] **3.4 - Document RLS patterns** (1 hour)
  - [ ] Create: docs/database/RLS_POLICY_PATTERNS.md
  - [ ] Include: Pattern examples by scenario
  - [ ] Include: Common mistakes to avoid
  - [ ] Include: How to test policies

- [ ] **3.5 - Create migration checklist** (1 hour)
  - [ ] Create: docs/database/MIGRATION_CHECKLIST.md
  - [ ] Include: Required steps for new tables
  - [ ] Include: Policy requirements
  - [ ] Include: Testing procedure

- [ ] **3.6 - Add RLS policy tests** (1 hour)
  - [ ] Create: supabase/migrations/__tests__/rls-policies.test.ts
  - [ ] Test: Each policy enforces correctly
  - [ ] Test: Admin bypasses work as expected
  - [ ] Test: User isolation is maintained

### Success Criteria
- [ ] All tables have proper RLS policies
- [ ] Missing policies identified and created
- [ ] RLS patterns documented
- [ ] Migration checklist prevents future gaps
- [ ] Policy tests passing
- [ ] Silent failures eliminated

### Files to Create/Modify
- [ ] supabase/migrations/[new migrations for missing policies]
- [ ] docs/database/RLS_POLICY_PATTERNS.md (create)
- [ ] docs/database/MIGRATION_CHECKLIST.md (create)
- [ ] supabase/migrations/__tests__/ (create tests)

---

## Day 4-5: Consolidate Trading Calculations

**Status:** ⏳ PENDING  
**Effort:** 3 days  
**Priority:** 🟡 HIGH

### Tasks

- [ ] **4.1 - Identify duplicate files** (1 hour)
  - [ ] List: src/lib/trading/pnlCalculations.ts
  - [ ] List: src/lib/trading/pnlCalculation.ts
  - [ ] Compare: Are they duplicates or different?
  - [ ] Document: Differences and consolidation strategy

- [ ] **4.2 - Extract shared calculations** (2 hours)
  - [ ] Review: positionUtils.ts for shared logic
  - [ ] Review: orderUtils.ts for shared logic
  - [ ] Identify: Which functions should consolidate
  - [ ] Document: Consolidation plan

- [ ] **4.3 - Create consolidated module** (2 hours)
  - [ ] Create: src/lib/trading/calculations.ts
  - [ ] Functions:
    - [ ] calculatePnL() - comprehensive, with edge cases
    - [ ] calculateMarginUsed()
    - [ ] calculateLiquidationPrice()
    - [ ] [Other calculations]
  - [ ] Add: JSDoc comments with examples
  - [ ] Add: TypeScript types
  - [ ] Include: Edge case handling

- [ ] **4.4 - Add comprehensive tests** (2 hours)
  - [ ] Create: src/lib/trading/__tests__/calculations.test.ts
  - [ ] Test each calculation:
    - [ ] Happy path
    - [ ] Edge cases (zero, extreme values)
    - [ ] Long and short positions
    - [ ] Precision/rounding
  - [ ] Target: 95% coverage

- [ ] **4.5 - Update imports project-wide** (2 hours)
  - [ ] Find all imports of old calculation files
  - [ ] Count: ~20-30 files affected
  - [ ] Update: Use new consolidated module
  - [ ] Method: Find/replace with npm run lint --fix

- [ ] **4.6 - Verify build and tests** (1 hour)
  - [ ] Run: npm run type:check
  - [ ] Run: npm run test
  - [ ] Run: npm run build
  - [ ] Verify: No errors or regressions

- [ ] **4.7 - Delete duplicate files** (30 min)
  - [ ] Delete: src/lib/trading/pnlCalculation.ts (old)
  - [ ] Verify: No remaining imports of old files
  - [ ] Commit: Deletion with clear message

### Success Criteria
- [ ] Single source of truth for calculations
- [ ] All imports updated successfully
- [ ] Tests passing with 95%+ coverage
- [ ] No build errors
- [ ] Duplicate files deleted
- [ ] No regressions in functionality

### Files to Create/Modify
- [ ] src/lib/trading/calculations.ts (create - consolidated)
- [ ] src/lib/trading/__tests__/calculations.test.ts (create)
- [ ] src/lib/trading/pnlCalculation.ts (DELETE)
- [ ] [~20-30 files: update imports]

---

## Day 5-6: Merge Performance Monitoring Systems

**Status:** ⏳ PENDING  
**Effort:** 2 days  
**Priority:** 🟡 HIGH

### Tasks

- [ ] **5.1 - Audit current systems** (1 hour)
  - [ ] Review: src/lib/performance/performanceMonitoring.ts
  - [ ] Review: src/lib/performanceUtils.ts
  - [ ] Review: src/hooks/useWebVitalsEnhanced.ts
  - [ ] Review: src/lib/performance/optimizationPresets.ts
  - [ ] Document: What each does, dependencies, overlaps

- [ ] **5.2 - Design unified API** (1 hour)
  - [ ] Define: Single API surface
  - [ ] Methods: recordMetric(), getMetrics(), getReport(), clear()
  - [ ] Export: performanceMonitor singleton
  - [ ] Document: Usage patterns

- [ ] **5.3 - Create unified system** (2 hours)
  - [ ] Create: src/lib/performance/index.ts
  - [ ] Class: PerformanceMonitor (singleton)
  - [ ] Methods:
    - [ ] recordMetric(name, duration, context)
    - [ ] getMetrics()
    - [ ] getReport() with averages
    - [ ] clear()
    - [ ] export()
  - [ ] Features:
    - [ ] Prevent unbounded growth (max 1000 metrics)
    - [ ] Calculate averages
    - [ ] Find slowest 10
    - [ ] Export for analysis

- [ ] **5.4 - Create hook for monitoring** (1 hour)
  - [ ] Create: src/hooks/usePerformanceMonitoring.ts
  - [ ] Hook: Monitor component render time
  - [ ] Integration: Record metrics automatically
  - [ ] Example: Document usage

- [ ] **5.5 - Update Web Vitals reporting** (1 hour)
  - [ ] Update: src/main.tsx
  - [ ] Use: Unified API for reporting
  - [ ] Consolidate: All Web Vitals into single endpoint
  - [ ] Test: Metrics recorded correctly

- [ ] **5.6 - Add tests** (1 hour)
  - [ ] Test: Recording metrics
  - [ ] Test: Getting report with aggregates
  - [ ] Test: Clearing metrics
  - [ ] Test: Memory unbounded growth prevention
  - [ ] Target: 85%+ coverage

- [ ] **5.7 - Update old references** (1 hour)
  - [ ] Find: All imports of old performance files
  - [ ] Replace: With new unified API
  - [ ] Verify: npm run type:check, npm run test
  - [ ] Delete: Old files after replacement

### Success Criteria
- [ ] Single performance monitoring API
- [ ] All systems consolidated
- [ ] Tests passing
- [ ] No duplicate monitoring
- [ ] Performance overhead reduced
- [ ] Easier to debug and extend

### Files to Create/Modify
- [ ] src/lib/performance/index.ts (create - unified)
- [ ] src/hooks/usePerformanceMonitoring.ts (create)
- [ ] src/lib/performance/__tests__/monitoring.test.ts (create)
- [ ] src/main.tsx (update Web Vitals)
- [ ] Delete old performance files after migration

---

## Day 7: Testing & Validation

**Status:** ⏳ PENDING  
**Effort:** 1 day  
**Priority:** 🟡 CRITICAL

### Pre-Deployment Checks

- [ ] **7.1 - Full test suite** (1 hour)
  - [ ] Command: npm run test
  - [ ] Expected: All tests pass
  - [ ] Document: Test results
  - [ ] Fix: Any failures

- [ ] **7.2 - Type checking** (30 min)
  - [ ] Command: npm run type:check
  - [ ] Expected: 0 errors
  - [ ] Document: Any warnings
  - [ ] Fix: Any issues

- [ ] **7.3 - Linting** (30 min)
  - [ ] Command: npm run lint
  - [ ] Expected: 0 errors
  - [ ] Fix: Auto-fixable issues
  - [ ] Review: Manual fixes needed

- [ ] **7.4 - Build verification** (1 hour)
  - [ ] Command: npm run build
  - [ ] Expected: Success with no errors
  - [ ] Check: Bundle size not increased
  - [ ] Verify: All assets generated

- [ ] **7.5 - Memory profile test** (30 min)
  - [ ] Chrome DevTools: Memory tab
  - [ ] Simulate: Realtime hook mount/unmount 100x
  - [ ] Check: No memory growth trend
  - [ ] Document: Results

- [ ] **7.6 - Review changes** (1 hour)
  - [ ] Git status: Review all modified files
  - [ ] Diff: Spot check changes
  - [ ] Commit: Organize into logical commits
  - [ ] Message: Clear, descriptive commit messages

### Phase 1 Completion

- [ ] **7.7 - Create Phase 1 PR** (1 hour)
  - [ ] Title: "Phase 1: Security & Stability"
  - [ ] Description:
    - [ ] Summary of changes
    - [ ] Tests passing: npm run test
    - [ ] Build succeeds: npm run build
    - [ ] No regressions
    - [ ] Memory leaks fixed
  - [ ] Link: Cleanup plan document
  - [ ] Request: Code review

### Success Criteria
- [ ] All tests passing
- [ ] 0 type errors
- [ ] 0 lint errors
- [ ] Build succeeds
- [ ] No memory leaks
- [ ] Changes committed
- [ ] PR ready for review

---

## 📊 Phase 1 Status Board

```
Day 1-2: Fix realtime memory leaks          [████░░░░░░] 0%  ⏳ IN PROGRESS
Day 2-3: Secure environment config          [░░░░░░░░░░] 0%  ⏸️ PENDING
Day 3-4: Review Supabase RLS policies       [░░░░░░░░░░] 0%  ⏸️ PENDING
Day 4-5: Consolidate trading calculations   [░░░░░░░░░░] 0%  ⏸️ PENDING
Day 5-6: Merge performance monitoring       [░░░░░░░░░░] 0%  ⏸️ PENDING
Day 7:   Testing & validation               [░░░░░░░░░░] 0%  ⏸️ PENDING

Overall Phase 1 Progress: [████░░░░░░] 0% - Week 1 Started
```

---

## 📝 Daily Log

### Day 1 (Jan 30)
- [ ] Started: Realtime memory leak audit
- [ ] Next: Complete hook inventory

---

## ✅ Phase 1 Completion Checklist

When all of the following are true, Phase 1 is COMPLETE:

- [ ] All realtime hooks follow same cleanup pattern
- [ ] Memory profiler: 0 leaks after stress testing
- [ ] .env.example exists and is documented
- [ ] .gitignore verified for secret coverage
- [ ] No secrets in git history
- [ ] RLS policies audited and documented
- [ ] Trading calculations in single module (deleted duplicates)
- [ ] Performance monitoring unified
- [ ] All tests passing: npm run test ✓
- [ ] Build succeeds: npm run build ✓
- [ ] Type check passes: npm run type:check ✓
- [ ] Lint passes: npm run lint ✓
- [ ] 0 regressions in functionality
- [ ] Phase 1 PR created and ready for review

---

**Total Phase 1 Effort:** ~10 developer days  
**Expected Completion:** February 6, 2026 (7 calendar days)  
**Next Phase:** Phase 2 - Structural Improvements (February 7 start)
