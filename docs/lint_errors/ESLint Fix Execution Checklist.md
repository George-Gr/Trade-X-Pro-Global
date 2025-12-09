# ESLint Fix Execution Checklist

## Pre-Flight Checklist

- [x] Create a new branch: `git checkout -b fix/eslint-warnings`
- [x] Ensure all tests pass: `npm run test`
- [x] Create a backup commit: `git commit -am "Backup before ESLint fixes"`
- [x] Document current error count: **4 errors, 201 warnings** (1 fixed!)
  - ✅ ErrorUI.tsx - FIXED
  - ❌ SidebarErrorBoundary.tsx - Line 263
  - ❌ chartUtils.ts - Line 298
  - ❌ errorHandling.ts - Line 21
  - ❌ sidebarErrorHandling.ts - Line 18

---

## Phase 1: Critical Parsing Errors ⚠️ (MUST FIX FIRST)

### File 1: `src/lib/chartUtils.ts` (Line 298)

- [ ] Open file and navigate to line 298
- [ ] Look for incomplete types: `Array<>`, `Promise<>`, `: {}`, `Record<>`
- [ ] Common issues at line 298:
  ```typescript
  // Likely issue - incomplete type definition
  // Check for patterns like:
  export const processData: (data: ChartData[]) => {}  // Missing return type
  export type Config = Record<string,>  // Incomplete Record
  const items: Array<> = []  // Empty generic
  ```
- [ ] **Run to see exact error context:**
  ```bash
  cat -n src/lib/chartUtils.ts | sed -n '295,305p'
  ```
- [ ] Apply fix based on context
- [ ] Run: `npm run lint src/lib/chartUtils.ts`
- [ ] Verify: No parsing errors
- [ ] Commit: `git commit -am "Fix: chartUtils.ts line 298 type definition"`

### File 2: `src/lib/errorHandling.ts` (Line 21)

- [ ] Open file and navigate to line 21
- [ ] **Error: "'>' expected"** means incomplete generic or arrow function
- [ ] **Run to see exact code:**
  ```bash
  cat -n src/lib/errorHandling.ts | sed -n '18,24p'
  ```
- [ ] Look for these specific patterns:
  ```typescript
  // Pattern 1: Unclosed generic
  export const handler: Promise<  // ❌ Missing closing >
  export function handle<T(param: T)  // ❌ Should be <T>(param: T)
  
  // Pattern 2: Malformed arrow function type
  const fn: <T => T  // ❌ Should be: <T>(val: T) => T
  type Handler = <T> => void  // ❌ Should be: <T>() => void
  
  // Pattern 3: Generic constraint error  
  function handle<T extends Error>(err: T): Promise<  // ❌ Unclosed Promise
  ```
- [ ] Most likely fix:
  ```typescript
  // If you see: Promise<
  // Complete it: Promise<ErrorResult> or Promise<void>
  
  // If you see: <T(
  // Fix it: <T>(
  ```
- [ ] Run: `npm run lint src/lib/errorHandling.ts`
- [ ] Verify: No parsing errors
- [ ] Commit: `git commit -am "Fix: errorHandling.ts line 21 generic syntax"`

### File 3: `src/lib/sidebarErrorHandling.ts` (Line 18)

- [ ] Open file and navigate to line 18
- [ ] **Same error pattern as errorHandling.ts**
- [ ] **Run to see exact code:**
  ```bash
  cat -n src/lib/sidebarErrorHandling.ts | sed -n '15,21p'
  ```
- [ ] Apply same fixes as errorHandling.ts above
- [ ] Run: `npm run lint src/lib/sidebarErrorHandling.ts`
- [ ] Verify: No parsing errors
- [ ] Commit: `git commit -am "Fix: sidebarErrorHandling.ts line 18 generic syntax"`

### File 4: `src/components/ui/ErrorUI.tsx` (Line 212)

- [ ] Open file and navigate to line 212
- [ ] Look for:
  - Unclosed JSX tags: `<Button onClick={fn}`
  - Missing return: `if (condition) { <Component /> }`
  - Extra brackets: `}} }`
- [ ] Count opening/closing braces - must match
- [ ] Use IDE's "Go to Matching Bracket" feature
- [ ] Run: `npm run lint src/components/ui/ErrorUI.tsx`
- [ ] Verify: No parsing errors
- [ ] Commit: `git commit -am "Fix: ErrorUI.tsx parsing error"`

### File 4: `src/components/ui/SidebarErrorBoundary.tsx` (Line 263)

- [ ] Open file and navigate to line 263
- [ ] **Run to see exact code:**
  ```bash
  cat -n src/components/ui/SidebarErrorBoundary.tsx | sed -n '260,270p'
  wc -l src/components/ui/SidebarErrorBoundary.tsx  # Check total lines
  ```
- [ ] Line 263 should be near or at the end of the file
- [ ] Common issues at end of file:
  ```typescript
  // Pattern 1: Extra closing brace
  export default SidebarErrorBoundary;
  } // ❌ Extra brace
  
  // Pattern 2: Incomplete export
  export { SidebarErrorBoundary }  // ❌ Missing semicolon or type
  
  // Pattern 3: Dangling code after component
  export default SidebarErrorBoundary;
  
  const unused = {  // ❌ Incomplete object
  ```
- [ ] Check if this is a class component - verify all methods are closed:
  ```typescript
  class SidebarErrorBoundary extends React.Component {
    componentDidCatch() {
      // ...
    }  // Check closing brace
    
    render() {
      // ...
    }  // Check closing brace
  }  // Check closing brace
  ```
- [ ] Count braces: Opening `{` should equal closing `}`
- [ ] Run: `npm run lint src/components/ui/SidebarErrorBoundary.tsx`
- [ ] Verify: No parsing errors
- [ ] Commit: `git commit -am "Fix: SidebarErrorBoundary.tsx line 263 syntax"`

### Phase 1 Verification

- [ ] Run: `npm run lint` - Should show **0 errors, 201 warnings**
- [ ] Run: `npm run build` - Should succeed
- [ ] Run: `npm run test` - Should pass
- [ ] Push checkpoint: `git push origin fix/eslint-warnings`

**Current Status: 1/5 parsing errors fixed ✅**

---

## Phase 2: React Hooks Dependencies 🔧

### Fix 1: PwaUpdateNotification.tsx (Line 86)

```typescript
// Wrap handleUpdate in useCallback
const handleUpdate = useCallback(() => {
  // existing implementation
}, [/* add dependencies */]);

// Then add to useEffect
useEffect(() => {
  if (needsUpdate) {
    handleUpdate();
  }
}, [needsUpdate, handleUpdate]);
```

- [ ] Apply fix
- [ ] Run: `npm run lint src/components/PwaUpdateNotification.tsx`
- [ ] Test component manually or with: `npm run test -- PwaUpdateNotification`
- [ ] Commit: `git commit -am "Fix: PwaUpdateNotification handleUpdate dependency"`

### Fix 2: PwaUpdateNotification.tsx (Line 133)

```typescript
const handleNotification = useCallback(() => {
  toast({
    title: "Update available",
    description: "Click to reload"
  });
}, [toast]); // Add toast
```

- [ ] Apply fix
- [ ] Verify toast function is stable (from context/hook)
- [ ] Test notification appears correctly
- [ ] Commit: `git commit -am "Fix: PwaUpdateNotification toast dependency"`

### Fix 3: TradingViewWatchlist.tsx (Line 181)

```typescript
useEffect(() => {
  const container = containerRef.current; // Capture
  const observer = new IntersectionObserver(callback);
  
  if (container) {
    observer.observe(container);
  }
  
  return () => {
    if (container) { // Use captured value
      observer.unobserve(container);
    }
  };
}, []);
```

- [ ] Apply fix
- [ ] Test watchlist component loads
- [ ] Verify cleanup doesn't cause errors
- [ ] Commit: `git commit -am "Fix: TradingViewWatchlist ref cleanup"`

### Phase 2 Verification

- [ ] Run: `npm run lint` - Hook warnings should be gone
- [ ] Run affected component tests
- [ ] Manual test: PWA updates and watchlist
- [ ] Commit: `git commit -am "Phase 2 complete: All hook dependencies fixed"`

---

## Phase 3: TypeScript `any` Fixes 📝

### Batch 1: Test Files (Safest - Start Here)

**Files**: All files in `__tests__` directories

#### Priority Test Files:
- [ ] `src/__tests__/hooks/useRiskEvents.test.tsx` (40 warnings)
- [ ] `src/hooks/__tests__/*.test.tsx`
- [ ] `src/lib/trading/__tests__/*.test.ts`
- [ ] `supabase/functions/admin/kyc-review/__tests__/*.test.ts`

**Pattern**: Replace with proper mock types

```typescript
// Before
const mockFn = vi.fn() as any;

// After
const mockFn = vi.fn<[string], boolean>();
```

- [ ] Fix test files batch
- [ ] Run: `npm run test` - All should pass
- [ ] Commit: `git commit -am "Fix: Replace any in test files"`

### Batch 2: Hooks (10 files)

- [ ] `src/hooks/useDebouncedChartUpdate.ts` (9 warnings)
- [ ] `src/hooks/useRiskMetrics.tsx` (5 warnings)
- [ ] `src/hooks/usePortfolioMetrics.tsx` (3 warnings)
- [ ] `src/hooks/useProfitLossData.tsx` (4 warnings)
- [ ] `src/hooks/useRealtimePositions.tsx` (2 warnings)
- [ ] `src/hooks/useHapticFeedbackFixed.ts` (2 warnings)
- [ ] `src/hooks/useLoading.ts` (2 warnings)

**Pattern**: Use proper generic types

```typescript
// Before
function debounce(fn: any, delay: number): any { }

// After
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void { }
```

- [ ] Fix hooks batch
- [ ] Test all affected components
- [ ] Commit: `git commit -am "Fix: Replace any in custom hooks"`

### Batch 3: Library Files (15 files)

- [ ] `src/lib/chartPerformance.ts` (25 warnings)
- [ ] `src/lib/alertManager.ts` (4 warnings)
- [ ] `src/lib/apiInterceptor.ts` (4 warnings)
- [ ] `src/lib/pushNotifications.ts` (1 warning)
- [ ] `src/lib/pwa.ts` (1 warning)
- [ ] `src/lib/sentryConfig.ts` (3 warnings)

**Focus on**:
- Event handlers: `(e: any) =>` to `(e: Event) =>`
- API responses: `Promise<any>` to `Promise<ApiResponse>`
- Error handling: `catch (e: any)` to `catch (e: unknown)`

- [ ] Fix lib files batch
- [ ] Run type check: `npm run type-check`
- [ ] Test critical paths manually
- [ ] Commit: `git commit -am "Fix: Replace any in library files"`

### Batch 4: Components (8 files)

- [ ] `src/components/charts/MobileOptimizedChart.tsx` (4 warnings)
- [ ] `src/components/charts/OptimizedCanvasChart.tsx` (4 warnings)
- [ ] `src/components/charts/ChartPerformanceTester.tsx` (2 warnings)
- [ ] `src/components/PwaUpdateNotification.tsx` (1 warning remaining)
- [ ] Other component files

**Pattern**: Event handlers and props

```typescript
// Before
const handleClick = (e: any) => { }

// After
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { }
```

- [ ] Fix components batch
- [ ] Test each component visually
- [ ] Verify no runtime errors
- [ ] Commit: `git commit -am "Fix: Replace any in components"`

### Batch 5: Workers & Edge Functions

#### Workers:
- [ ] `src/workers/chartWorker.ts` (6 warnings)

```typescript
// Before
self.onmessage = (e: any) => { }

// After
interface WorkerMessage {
  type: string;
  payload: ChartData;
}
self.onmessage = (e: MessageEvent<WorkerMessage>) => { }
```

#### Edge Functions (Supabase):
- [ ] `supabase/functions/execute-liquidation/index.ts` (11 warnings)
- [ ] `supabase/functions/execute-order/index.ts` (4 warnings)
- [ ] `supabase/functions/price-stream/index.ts` (6 warnings)
- [ ] Other edge function files

**Pattern**: Database types

```typescript
import { Database } from '../types/database';
type Position = Database['public']['Tables']['positions']['Row'];
```

- [ ] Fix workers and edge functions
- [ ] Test edge function locally if possible
- [ ] Commit: `git commit -am "Fix: Replace any in workers and edge functions"`

### Phase 3 Verification

- [ ] Run: `npm run lint` - Should show 0 warnings
- [ ] Run: `npm run type-check` - Should pass
- [ ] Run: `npm run test` - All tests pass
- [ ] Run: `npm run build` - Build succeeds
- [ ] Manual smoke test of key features

---

## Phase 4: Final Verification & Cleanup 🎯

### Code Quality Checks

- [ ] Run full lint: `npm run lint` → **Target: 0 errors, 0 warnings**
- [ ] Type check: `npm run type-check` → **Must pass**
- [ ] Run tests: `npm run test` → **All pass**
- [ ] Build project: `npm run build` → **Success**

### Manual Testing Checklist

- [ ] Login/Authentication works
- [ ] Dashboard loads correctly
- [ ] Charts render properly
- [ ] Trading functionality works
- [ ] PWA update notifications appear
- [ ] Error boundaries catch errors
- [ ] No console errors in browser

### Performance Verification

- [ ] Check bundle size hasn't increased significantly
- [ ] Verify no memory leaks in dev tools
- [ ] Test on mobile device (if applicable)

### Documentation

- [ ] Update any relevant documentation
- [ ] Add comments where `unknown` is used (explain type guards)
- [ ] Document any intentional `any` usage with eslint-disable

---

## Final Steps

### Clean Up

- [ ] Remove any debug console.logs added during fixing
- [ ] Ensure all files are properly formatted
- [ ] Run: `npm run format` (if available)

### Git Workflow

- [ ] Review all changes: `git diff main`
- [ ] Ensure all changes are committed
- [ ] Write comprehensive PR description
- [ ] Push: `git push origin fix/eslint-warnings`
- [ ] Create Pull Request

### PR Description Template

```markdown
## ESLint Fixes - Complete Cleanup

### Summary
Fixed all ESLint errors and warnings in the project:
- **Before**: 5 errors, 201 warnings
- **After**: 0 errors, 0 warnings

### Changes Made

#### Critical Fixes (Parsing Errors)
- Fixed syntax errors in 5 files that prevented compilation
- Completed incomplete type definitions
- Corrected malformed generics

#### React Hooks
- Fixed 3 hook dependency issues
- Ensured proper cleanup in useEffect
- Wrapped callbacks in useCallback where needed

#### TypeScript Types
- Replaced 195 `any` types with proper types
- Added type guards for unknown data
- Created proper interfaces for API responses
- Updated test mocks with correct types

### Testing
- [x] All unit tests passing
- [x] Build succeeds
- [x] Manual testing completed
- [x] No new console errors

### Risk Assessment
**Low Risk** - Changes are primarily type improvements that don't affect runtime behavior

### Rollback Plan
If issues arise, revert with: `git revert <commit-hash>`
```

---

## Rollback Procedures

### If Something Breaks

**Option 1: Revert Last Commit**
```bash
git revert HEAD
```

**Option 2: Revert Specific Phase**
```bash
git log --oneline  # Find commit hash
git revert <commit-hash>
```

**Option 3: Full Rollback**
```bash
git reset --hard origin/main
```

---

## Success Criteria ✅

- [ ] **Zero ESLint errors**
- [ ] **Zero ESLint warnings**
- [ ] **All tests passing**
- [ ] **Build succeeds**
- [ ] **No runtime errors**
- [ ] **Code review approved**
- [ ] **PR merged**

---

## Time Estimates

- **Phase 1** (Parsing Errors): 2-4 hours
- **Phase 2** (Hooks): 1-2 hours  
- **Phase 3** (any Types): 8-12 hours
  - Batch 1 (Tests): 2 hours
  - Batch 2 (Hooks): 2 hours
  - Batch 3 (Lib): 3 hours
  - Batch 4 (Components): 2 hours
  - Batch 5 (Workers/Edge): 3 hours
- **Phase 4** (Verification): 2-4 hours

**Total**: 13-22 hours (2-3 days)

---

## Notes & Tips

1. **Work in small batches** - Don't try to fix everything at once
2. **Test frequently** - After each batch, run tests
3. **Commit often** - Easy to rollback if needed
4. **Take breaks** - This is tedious work, stay fresh
5. **Use IDE features** - Auto-import, auto-complete help a lot
6. **Don't rush** - Accuracy > Speed
7. **Ask for help** - If stuck, consult the team

## Common Pitfalls to Avoid

❌ Don't just add `// @ts-ignore` or `// eslint-disable`  
❌ Don't replace `any` with `unknown` without type guards  
❌ Don't change runtime behavior while fixing types  
❌ Don't skip testing after each phase  
❌ Don't fix warnings in files you don't understand  

✅ Do understand the code before changing it  
✅ Do add proper types, not just suppress warnings  
✅ Do test thoroughly after each change  
✅ Do ask questions if unsure  
✅ Do document complex type decisions  

---

## Emergency Contacts

- **Build broken?** → Revert last commit
- **Tests failing?** → Check what changed in that batch
- **Type errors?** → Review the type definitions used
- **Runtime errors?** → Check event handlers and hooks
- **Stuck?** → Review the fix examples in other artifacts

---

**Good luck! 🚀**