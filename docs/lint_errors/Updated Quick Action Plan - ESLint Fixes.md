# Quick Action Plan - ESLint Fixes

**Current Status:** ✅ 1/5 errors fixed (ErrorUI.tsx done!)  
**Remaining:** 4 errors, 201 warnings

---

## Phase 1: Fix 4 Remaining Parsing Errors (URGENT - 2-3 hours)

### Quick Fix Order (Easiest → Hardest)

#### 1️⃣ sidebarErrorHandling.ts (Line 18) - 15 min
```bash
# Debug
cat -n src/lib/sidebarErrorHandling.ts | sed -n '15,21p'

# Look for: Promise<, <T(, <T => T
# Fix: Add closing > or fix syntax
# Example: Promise< → Promise<void>
#         <T( → <T>(

# Verify
npm run lint src/lib/sidebarErrorHandling.ts
git commit -am "Fix: sidebarErrorHandling.ts line 18"
```

#### 2️⃣ errorHandling.ts (Line 21) - 15 min
```bash
# Debug
cat -n src/lib/errorHandling.ts | sed -n '18,24p'

# Same pattern as above
# Fix generic syntax or close Promise type

# Verify
npm run lint src/lib/errorHandling.ts
git commit -am "Fix: errorHandling.ts line 21"
```

#### 3️⃣ chartUtils.ts (Line 298) - 30 min
```bash
# Debug
cat -n src/lib/chartUtils.ts | sed -n '295,305p'

# Look for: Array<>, Record<,>, Promise<>, : {}
# Fix: Complete the type parameter
# Example: Array<> → Array<ChartDataPoint>
#         Record<string,> → Record<string, unknown>

# Verify
npm run lint src/lib/chartUtils.ts
git commit -am "Fix: chartUtils.ts line 298"
```

#### 4️⃣ SidebarErrorBoundary.tsx (Line 263) - 30 min
```bash
# Debug
cat -n src/components/ui/SidebarErrorBoundary.tsx | sed -n '260,265p'
wc -l src/components/ui/SidebarErrorBoundary.tsx

# Check brace balance
grep -o '{' src/components/ui/SidebarErrorBoundary.tsx | wc -l
grep -o '}' src/components/ui/SidebarErrorBoundary.tsx | wc -l

# Look for: Extra }, incomplete code, dangling code after export
# Fix: Remove or complete

# Verify
npm run lint src/components/ui/SidebarErrorBoundary.tsx
git commit -am "Fix: SidebarErrorBoundary.tsx line 263"
```

### ✅ Phase 1 Complete When:
```bash
npm run lint | grep "error"  # Should show: 0 errors
```

---

## Phase 2: Fix React Hooks (1 hour)

### 1. PwaUpdateNotification.tsx (Lines 86, 133)
```typescript
// Line 86: Add handleUpdate to dependencies
const handleUpdate = useCallback(() => {
  // existing code
}, [/* add dependencies */]);

useEffect(() => {
  if (needsUpdate) {
    handleUpdate();
  }
}, [needsUpdate, handleUpdate]);

// Line 133: Add toast to dependencies
const handleNotification = useCallback(() => {
  toast({ title: "Update", description: "..." });
}, [toast]);
```

### 2. TradingViewWatchlist.tsx (Line 181)
```typescript
// Capture ref value
useEffect(() => {
  const container = containerRef.current;
  const observer = new IntersectionObserver(callback);
  
  if (container) {
    observer.observe(container);
  }
  
  return () => {
    if (container) {
      observer.unobserve(container);
    }
  };
}, []);
```

```bash
# Verify
npm run lint | grep "react-hooks"  # Should be empty
git commit -am "Fix: React hooks dependencies"
```

---

## Phase 3: Fix `any` Types (6-8 hours)

### Batch Strategy - Work in Order

#### Batch 1: Test Files (2 hours - SAFEST)
**Target:** 60 warnings in test files

```bash
# Files to fix:
src/__tests__/hooks/useRiskEvents.test.tsx          # 40 warnings
src/hooks/__tests__/useOrderExecution.test.tsx      # 2 warnings
src/hooks/__tests__/usePnLCalculations.test.tsx     # 1 warning
src/hooks/__tests__/useSlTpExecution.test.tsx       # 4 warnings
# ... more test files
```

**Pattern:**
```typescript
// Before: const mock = vi.fn() as any;
// After: const mock = vi.fn<[string], boolean>();
```

#### Batch 2: Hooks (2 hours)
**Target:** 30 warnings in hooks

```bash
# Priority files:
src/hooks/useDebouncedChartUpdate.ts     # 9 warnings
src/hooks/useRiskMetrics.tsx             # 5 warnings
src/hooks/usePortfolioMetrics.tsx        # 3 warnings
src/hooks/useProfitLossData.tsx          # 4 warnings
```

**Pattern:**
```typescript
// Generic functions
function debounce<T extends (...args: any[]) => any>(
  fn: T, delay: number
): (...args: Parameters<T>) => void { }
```

#### Batch 3: Library Files (2 hours)
**Target:** 50 warnings in lib files

```bash
# Priority:
src/lib/chartPerformance.ts    # 25 warnings
src/lib/alertManager.ts         # 4 warnings
src/lib/apiInterceptor.ts       # 4 warnings
```

**Patterns:**
```typescript
// Error handling: catch (e: unknown)
// API responses: Promise<ApiResponse>
// Events: (e: Event) => void
```

#### Batch 4: Components (1 hour)
**Target:** 15 warnings

```bash
src/components/charts/MobileOptimizedChart.tsx      # 4 warnings
src/components/charts/OptimizedCanvasChart.tsx      # 4 warnings
src/components/charts/ChartPerformanceTester.tsx    # 2 warnings
```

**Pattern:**
```typescript
// React events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
```

#### Batch 5: Workers & Edge Functions (2 hours)
**Target:** 46 warnings

```bash
src/workers/chartWorker.ts                      # 6 warnings
supabase/functions/execute-liquidation/*.ts     # 11 warnings
supabase/functions/price-stream/*.ts            # 6 warnings
```

**Pattern:**
```typescript
// Worker messages
interface WorkerMessage {
  type: string;
  payload: ChartData;
}
self.onmessage = (e: MessageEvent<WorkerMessage>) => { };
```

---

## Testing Checkpoints

After each batch:
```bash
# 1. Lint check
npm run lint | grep "warning" | wc -l

# 2. Type check
npm run type-check

# 3. Build
npm run build

# 4. Tests
npm run test

# 5. Commit
git commit -am "Fix: Replace any types in [batch name]"
```

---

## Success Criteria

### Phase 1 Complete: ✅
```bash
npm run lint 2>&1 | grep "error"
# Output: (empty or "0 errors")
```

### Phase 2 Complete: ✅
```bash
npm run lint 2>&1 | grep "react-hooks"
# Output: (empty)
```

### Phase 3 Complete: ✅
```bash
npm run lint 2>&1 | grep "no-explicit-any"
# Output: (empty)
```

### Final Success: ✅
```bash
npm run lint
# Output: ✖ 0 problems (0 errors, 0 warnings)
```

---

## Time Estimates (Updated)

- ✅ **Phase 1 Done**: ErrorUI.tsx fixed
- ⏳ **Phase 1 Remaining**: 1-2 hours (4 files)
- ⏳ **Phase 2**: 1 hour (hooks)
- ⏳ **Phase 3**: 6-8 hours (201 warnings)
- ⏳ **Testing**: 1-2 hours

**Total Remaining:** 9-13 hours (1.5-2 days)

---

## Rollback Commands

If something breaks:
```bash
# See changes
git diff

# Revert one file
git checkout -- src/path/to/file.ts

# Revert last commit
git revert HEAD

# Revert everything
git reset --hard HEAD
```

---

## Quick Reference

**Most Common Fixes:**
1. `Promise<` → `Promise<void>` or `Promise<ResultType>`
2. `<T(` → `<T>(`
3. `Array<>` → `Array<ItemType>`
4. `Record<string,>` → `Record<string, unknown>`
5. `any` → `unknown` (with type guard)
6. `(e: any)` → `(e: React.MouseEvent)` or `(e: Event)`
7. Extra `}` → Remove it
8. Missing dependency → Add to array or use useCallback

**Debug Commands:**
```bash
# View specific lines
cat -n <file> | sed -n '<start>,<end>p'

# Count errors
npm run lint 2>&1 | grep -c "error"

# Count warnings
npm run lint 2>&1 | grep -c "warning"

# Check specific file
npm run lint <file>
```

---

## Next Steps

1. **Start with Phase 1** - Fix the 4 parsing errors
2. **Commit after each fix** - Easy to rollback
3. **Test frequently** - Don't wait until the end
4. **Take breaks** - This is tedious work
5. **Ask for help** - If stuck for >15 minutes

**Let's go! Start with sidebarErrorHandling.ts (easiest) 🚀**