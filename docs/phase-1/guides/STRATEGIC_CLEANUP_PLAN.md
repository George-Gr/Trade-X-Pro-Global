# TradePro v10 - Comprehensive Cleanup & Optimization Strategy

**Assessment Date:** January 30, 2026  
**Repository:** Trade-X-Pro-Global  
**Tech Stack:** React 18 + TypeScript + Vite + Supabase + shadcn-ui + Tailwind CSS v4

---

## Executive Summary

Trade-X-Pro-Global is a mature, well-structured CFD trading platform with solid architectural foundations and comprehensive feature coverage. The codebase demonstrates strong patterns around state management, Realtime subscriptions, and security considerations. However, the project has accumulated significant technical debt through:

1. **Code duplication and scattered utilities** - 84+ files in `src/lib/` with overlapping concerns (7+ performance utilities, 3+ trading calculation modules, multiple auth/security approaches)
2. **Hook proliferation** - 75+ custom hooks with insufficient documentation and redundant Realtime subscription patterns
3. **Documentation gaps** - Architecture decisions exist but implementation patterns lack inline guidance for developers
4. **Testing inconsistencies** - Coverage targets set (70%) but gaps remain in critical trading logic and edge cases
5. **Performance optimization opportunities** - Multiple uncoordinated performance monitoring systems, unnecessary re-renders in trading components, and bundle optimization potential

**Overall Health:** ✅ **Production-Ready with Technical Debt** | No critical security issues identified | Architecture sound but needs systematic cleanup and documentation

---

## Priority Matrix

### 🔴 HIGH PRIORITY (Effort: 3-8 days | Impact: Critical)

| Task | Effort | Impact | Risk | Dependencies |
|------|--------|--------|------|--------------|
| **Consolidate duplicate trading calculation modules** | 3 days | High | Low | None |
| **Merge performance monitoring systems** | 2 days | High | Medium | Tests must pass after |
| **Document critical architectural patterns** | 2 days | High | None | None |
| **Fix hook subscription memory leaks** | 2 days | High | Medium | Test suite |
| **Standardize error handling across trading** | 2 days | High | Medium | API validation |

### 🟡 MEDIUM PRIORITY (Effort: 2-5 days | Impact: Important)

| Task | Effort | Impact | Risk | Dependencies |
|------|--------|--------|------|--------------|
| **Organize lib/ directory** | 3 days | Medium | Low | Refactor imports |
| **Add missing test coverage** | 4 days | Medium | Low | Test infrastructure |
| **Consolidate utility functions** | 2 days | Medium | Low | Import updates |
| **Implement async dependency injection** | 2 days | Medium | Medium | Testing |
| **Update component documentation** | 2 days | Medium | None | None |

### 🟢 LOW PRIORITY (Effort: 1-3 days | Impact: Nice-to-Have)

| Task | Effort | Impact | Risk | Dependencies |
|------|--------|--------|------|--------------|
| **Remove duplicate configuration files** | 1 day | Low | None | Git cleanup |
| **Optimize bundle size** | 2 days | Low | Low | Build analysis |
| **Standardize naming conventions** | 2 days | Low | None | Linting |
| **Add component storybook** | 3 days | Low | None | Documentation |

---

## Detailed Action Items by Category

---

## 1. IMMEDIATE FIXES (Security & Critical Bugs)

### 1.1 Fix Hook Subscription Memory Leaks ⏱ 2 days | Risk: ⚠️ Medium

**Current State:**
- `useRealtimePositions`, `useRealtimeOrders`, `useRealtimeProfile` patterns established
- Risk: Inconsistent cleanup in realtime subscriptions across 40+ hooks
- Impact: Memory leaks, duplicate subscriptions on re-renders

**Action Items:**
```
□ Audit all realtime subscription hooks for proper cleanup
  Location: src/hooks/useRealtime*.tsx
  
□ Create standardized subscription pattern helper
  Create: src/hooks/useRealtimeSubscription.ts
  Pattern: https://github.com/Trade-X-Pro-Global/.github/copilot-instructions.md#1-realtime-subscriptions
  
□ Test for duplicate subscriptions using memory profiler
  Command: npm run test:performance src/hooks/__tests__
  
□ Document common pitfall: unsubscribe in cleanup
  File: docs/developer-guide/REALTIME_PATTERNS.md
```

**Files to Review:**
- `src/hooks/useRealtimePositions.tsx` (canonical pattern - verify)
- `src/hooks/useRealtimeOrders.ts`
- `src/hooks/useRealtimeProfile.ts`
- `src/hooks/usePriceStream.ts`

**Success Criteria:** All Realtime hooks follow same cleanup pattern, 0 memory leaks in Chrome DevTools profiler

---

### 1.2 Identify & Secure Exposed Configuration ⏱ 1 day | Risk: 🔴 High

**Current State:**
- `.env.local` required but no `.env.example` found in root
- Vite config exposes `VITE_SUPABASE_URL` and `VITE_PRODUCTION_URL` (public keys, OK)
- Risk: Developers may accidentally commit `.env.local`

**Action Items:**
```
□ Create .env.example template
  Location: .env.example
  Contents:
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
    VITE_PRODUCTION_URL=https://yourdomain.com
    SENTRY_DSN=https://...@sentry.io/...

□ Verify .env.local is in .gitignore
  
□ Add security checklist to README
  Section: "Environment & Secrets"
  
□ Audit docker/deployment secrets
  Check: supabase/config.toml, vite.config.ts
```

**Success Criteria:** `.env.example` exists with clear documentation, 0 potential secrets in version control

---

### 1.3 Review & Standardize Supabase RLS Policies ⏱ 2 days | Risk: 🔴 High

**Current State:**
- Migrations exist in `supabase/migrations/`
- RLS policies critical but not centrally documented
- Risk: Silent failures if policies missing

**Action Items:**
```
□ Audit all migration files for RLS policies
  Command: grep -r "CREATE POLICY" supabase/migrations/
  
□ Document RLS patterns
  Create: docs/database/RLS_POLICY_PATTERNS.md
  Pattern: Trading operations, KYC access, Admin roles
  
□ Create migration checklist
  File: project_resources/database/MIGRATION_CHECKLIST.md
  Include: Required policies, test procedures
  
□ Add RLS policy tests
  Location: supabase/migrations/__tests__/
```

**Success Criteria:** All tables have documented RLS policies, checklist prevents future silent failures

---

## 2. STRUCTURAL IMPROVEMENTS (Architecture & Organization)

### 2.1 Consolidate Duplicate Trading Calculation Modules ⏱ 3 days | Risk: 📊 Low

**Current State:**
- `src/lib/trading/pnlCalculations.ts` (85 lines)
- `src/lib/trading/pnlCalculation.ts` (different file, duplicate?)
- `src/lib/trading/positionUtils.ts`
- `src/lib/trading/orderUtils.ts`
- Risk: Developer confusion, inconsistent calculations, maintenance burden

**Action Items:**
```
□ Audit both PnL files
  Compare: src/lib/trading/pnlCalculations.ts vs pnlCalculation.ts
  Document: Which one is used, differences
  
□ Consolidate into single module: src/lib/trading/calculations.ts
  Export: calculatePnL(), calculateMargin(), calculateRisk()
  Include: TypeScript types, JSDoc examples
  
□ Update imports across codebase
  Files affected: ~20 components + 8 hooks
  Command: npm run lint -- --fix (after consolidation)
  
□ Add calculation tests
  File: src/lib/trading/__tests__/calculations.test.ts
  Coverage: Edge cases (zero positions, extreme leverage)
  
□ Delete duplicate file & verify build
  Delete: src/lib/trading/pnlCalculation.ts
  Command: npm run build:check
```

**Files to Merge:**
- `pnlCalculations.ts` (keep - more comprehensive)
- `pnlCalculation.ts` (DELETE after migration)
- Extract shared logic from `positionUtils.ts` + `orderUtils.ts`

**Success Criteria:** Single source of truth for calculations, all imports updated, tests passing

---

### 2.2 Merge Performance Monitoring Systems ⏱ 2 days | Risk: 📊 Medium

**Current State:**
- `src/lib/performance/performanceMonitoring.ts`
- `src/lib/performanceUtils.ts`
- `src/hooks/useWebVitalsEnhanced.ts`
- `src/lib/performance/optimizationPresets.ts`
- Risk: Conflicting implementations, unmaintainable overhead

**Action Items:**
```
□ Audit current performance implementations
  Files:
    - src/lib/performance/performanceMonitoring.ts
    - src/lib/performanceUtils.ts
    - src/hooks/useWebVitalsEnhanced.ts
  Document: What each does, dependencies
  
□ Create unified system: src/lib/performance/index.ts
  Exports:
    - initializeMonitoring()
    - recordMetric(name, duration)
    - reportWebVitals(metric)
    - getPerformanceReport()
  
□ Consolidate Web Vitals reporting
  Location: src/main.tsx
  Integration: Single reporting endpoint
  
□ Update hook to use new system
  File: src/hooks/usePerformanceMonitoring.ts (new)
  
□ Create performance best practices guide
  File: docs/developer-guide/PERFORMANCE_PATTERNS.md
```

**Impact on:**
- Bundle size: ~8KB reduction
- Memory: Fewer duplicate listeners
- Monitoring: Centralized, easier to debug

**Success Criteria:** Single performance API, all monitoring consolidated, test coverage > 80%

---

### 2.3 Reorganize `src/lib/` Directory ⏱ 3 days | Risk: 📊 Low

**Current State:**
- 84 files scattered across `src/lib/`
- Naming inconsistent: `supabase*.ts` (3 files), `error*.ts` (4 files), duplicate utility files
- No clear organization for developers

**Proposed Structure:**
```
src/lib/
├── auth/                      # NEW
│   ├── authAuditLogger.ts
│   ├── authMigration.ts
│   ├── authPkce.ts
│   └── __tests__/
├── trading/                   # EXPAND
│   ├── calculations.ts        # Consolidated
│   ├── orderValidation.ts
│   ├── marginMonitoring.ts
│   ├── liquidationEngine.ts
│   ├── positionUtils.ts       # Refactored
│   └── __tests__/
├── risk/                      # EXISTS
│   ├── riskMetrics.ts
│   ├── positionAnalysis.ts
│   └── __tests__/
├── security/                  # EXPAND
│   ├── orderSecurity.ts
│   ├── secure-deletion.ts
│   └── __tests__/
├── api/                       # NEW
│   ├── validation.ts          # Renamed from apiValidation.ts
│   ├── errorHandling.ts       # Renamed from errorHandling.tsx
│   └── errorMessageService.ts
├── data/                      # NEW
│   ├── supabase.ts            # Consolidate all supabase*.ts
│   ├── subscriptions.ts       # Renamed from subscriptionManager.ts
│   └── realtime.ts
├── performance/               # CONSOLIDATE
│   ├── monitoring.ts
│   └── __tests__/
├── utils/                     # COMMON
│   ├── format.ts
│   ├── validation.ts
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── accessibility/             # NEW
│   ├── wcag-enhancer.ts
│   ├── completeAriaLabeling.tsx
│   └── colorContrastVerification.tsx
├── ab-testing/                # EXISTS
├── analytics/                 # EXISTS
├── export/                    # EXISTS
├── kyc/                       # EXISTS
├── routing/                   # EXISTS
├── seo/                       # EXISTS
└── index.ts                   # Main export file
```

**Action Items:**
```
□ Rename & move files (use git mv)
  Example: git mv src/lib/apiValidation.ts src/lib/api/validation.ts
  
□ Update all imports (1 day of automated fixes)
  Pattern: import { ... } from '@/lib/apiValidation'
  To: import { ... } from '@/lib/api/validation'
  Command: Custom script or IDE find-replace + test
  
□ Create src/lib/index.ts barrel export
  Organize by category for clearer discovery
  
□ Delete duplicate files
  - supabaseBrowserClient.ts (if redundant)
  - performanceUtils.ts (if merged)
  
□ Update ESLint ignores
  File: eslint.config.js (adjust path patterns)
  
□ Verify build
  Command: npm run build:check
  
□ Update documentation
  File: docs/developer-guide/DIRECTORY_STRUCTURE.md
```

**Migration Checklist:**
```
Before moving:
  □ 1 day: Identify which files go where
  □ Ensure no circular dependencies
  □ Review each category

During migration:
  □ Use `git mv` for clean history
  □ Update imports incrementally (1 category/day)
  □ Run tests after each category

After migration:
  □ Verify build passes
  □ Run full test suite
  □ Check bundle size didn't increase
```

**Success Criteria:** Logical organization, improved discoverability, no build regressions

---

### 2.4 Fix Hook Organization & Documentation ⏱ 2 days | Risk: 📊 Low

**Current State:**
- 75+ hooks with inconsistent naming and organization
- `index.ts` exports are well-organized but inline documentation sparse
- Developers struggle to find right hook for use case

**Action Items:**
```
□ Categorize hooks by domain (already done in index.ts)
  Verify categories:
    - Core data hooks
    - Trading operations
    - Price data
    - Risk management
    - Analytics & metrics
    - UI/UX
    - Accessibility
  
□ Add JSDoc comments to each hook
  Template:
    /**
     * [Brief description]
     * 
     * @example
     * const { data, loading } = useHookName();
     * 
     * @returns {{
     *   data: Type;
     *   loading: boolean;
     *   error: Error | null;
     * }}
     */
  
□ Mark deprecated hooks
  Pattern: @deprecated Use useNewHook instead. Removing in v11.
  Update: index.ts with deprecation notices
  
□ Document hook selection guide
  File: docs/developer-guide/HOOKS_GUIDE.md
  Content: Decision tree for choosing right hook
  
□ Audit for memory leaks
  Command: npm run test -- --grep "cleanup|unsubscribe"
  
□ Add hook performance monitoring
  Pattern: Add DEBUG_HOOK_PERFORMANCE env flag
```

**Hook Audit Findings:**
- Realtime hooks: Follow pattern ✓
- Trading hooks: Vary in state management strategy
- Performance: Some need memoization review

**Success Criteria:** All hooks documented, deprecated hooks marked, selection guide published

---

## 3. CODE QUALITY ENHANCEMENTS (Refactoring & Standards)

### 3.1 Consolidate Utility Functions ⏱ 2 days | Risk: 📊 Low

**Current State:**
- `utils.ts` (207 lines) has mix of classname utils + keyboard nav
- `spacingUtils.ts`, `typographyUtils.ts`, `colors.ts` scattered
- Risk: Duplication, unclear what goes where

**Action Items:**
```
□ Consolidate UI utilities
  File: src/lib/utils/index.ts
  Exports:
    export { cn } from './classnames'
    export { formatNumber, formatCurrency } from './format'
    export { getRiskLevelColors } from './colors'
  
□ Move keyboard navigation to dedicated module
  Create: src/lib/accessibility/keyboard.ts
  Export: focusNextMenuItem, focusPrevMenuItem, etc.
  
□ Create style utilities barrel
  File: src/lib/utils/styles.ts
  Exports: spacing, typography, spacing utils
  
□ Update imports project-wide
  Files affected: ~40 components
  Approach: Update incrementally, test after each
  
□ Add JSDoc examples
  Pattern: Show before/after for each utility
```

**Success Criteria:** All utilities organized, imports clear, 0 duplication

---

### 3.2 Standardize Error Handling Across Trading ⏱ 2 days | Risk: 📊 Medium

**Current State:**
- Multiple error handling strategies: try-catch, error contexts, custom error boundaries
- Trading-specific errors lack consistent format
- User-facing messages vary in quality

**Action Items:**
```
□ Create unified error system
  File: src/lib/api/errors.ts
  Classes:
    - TradingError (extends Error)
    - ValidationError
    - InsufficientMarginError
    - LiquidationError
    - OrderExecutionError
  
□ Define error codes & messages
  File: src/lib/api/errorCodes.ts
  Format:
    TRADING_001: "Insufficient margin for order"
    TRADING_002: "Order validation failed"
    
□ Update error handlers
  Files:
    - src/components/TradingErrorBoundary.tsx
    - src/lib/errorHandling.tsx
    - src/contexts/ErrorContext.ts
  
□ Add error recovery strategies
  Pattern: Suggest corrective actions
  Example: InsufficientMarginError → "Deposit funds" link
  
□ Document in error handling guide
  File: docs/developer-guide/ERROR_HANDLING.md
```

**Success Criteria:** Consistent error format, user-friendly messages, recovery options clear

---

### 3.3 Improve TypeScript Strictness ⏱ 2 days | Risk: ⚠️ Medium

**Current State:**
- `tsconfig.json` has `strict: true` but allows loose types
- ESLint skips many TypeScript rules (`no-unused-vars: off`)
- `any` type usage not tracked

**Action Items:**
```
□ Run strict type check
  Command: npm run type:strict
  Document: Current failures count
  
□ Create incremental strictness plan
  Phase 1 (1 week):
    - Fix obvious any types
    - Add missing type annotations
    - Review lib/ directory first
  
  Phase 2 (1 week):
    - Components type safety
    - Fix hook return types
    
  Phase 3 (2 weeks):
    - API validation types
    - Test file types
  
□ Add pre-commit hook
  Command: npm run type:check
  Tool: husky (already installed)
  
□ Document type patterns
  File: project_resources/rules_and_guidelines/STYLE_GUIDE.md
  Add: Recommended patterns for React + Supabase
  
□ Enable strict linting for new files
  File: eslint.config.js
  Config: Separate strict config for new code
```

**Impact:**
- Reduce runtime bugs: ~15-20%
- Better IDE support: Improved autocomplete
- Maintenance: Easier refactoring

**Success Criteria:** Type coverage > 95%, 0 unused-vars, gradual strictness improvements

---

### 3.4 Refactor Component Structure ⏱ 3 days | Risk: 📊 Low

**Current State:**
- Trading components folder has 50+ components
- Some components > 400 lines (complexity risk)
- No clear separation of concerns

**Action Items:**
```
□ Audit component sizes
  Command: find src/components -name "*.tsx" -exec wc -l {} \;
  Identify: Components > 300 lines for splitting
  
□ Extract smaller components
  Examples:
    - PositionsTable.tsx (400+ lines)
      Split: PositionsTableHeader, PositionRow, PositionsMetrics
    - OrderForm.tsx (350+ lines)
      Split: OrderFormBasic, OrderFormAdvanced, OrderPreview
  
□ Create component organization guide
  File: src/components/README.md
  Content: Folder structure, naming conventions, co-location rules
  
□ Improve prop drilling
  Strategy: Use context for trading state where needed
  Components affected: OrderForm, PositionForm, OrdersTable
  
□ Document component API
  Tool: Storybook (optional, low priority)
  Or: JSDoc in component files
```

**Success Criteria:** All components < 300 lines, improved readability, docs updated

---

## 4. DOCUMENTATION UPDATES (Knowledge & Guidance)

### 4.1 Create Architecture Decision Records (ADRs) ⏱ 2 days | Risk: None

**Current State:**
- 9 architectural decisions documented in `ARCHITECTURE_DECISIONS.md` ✓
- But implementation patterns scattered across code
- New developers lack guidance on following patterns

**Action Items:**
```
□ Create ADR index
  File: docs/architecture/README.md
  Format: Decision tree linking to specific ADRs
  
□ Create ADR templates
  File: docs/architecture/ADR_TEMPLATE.md
  Format: Status, Context, Decision, Consequences
  
□ Document critical patterns as ADRs
  - State Management Strategy (3 layers: local/hooks/context/React Query)
  - Realtime Subscription Pattern (with cleanup)
  - Error Handling Approach
  - Performance Monitoring Strategy
  - Security Best Practices
  
□ Link ADRs to code examples
  Pattern: ADR → Link to actual implementation file + line number
  
□ Create architecture diagrams
  Tools: Mermaid in markdown
  Diagrams:
    - Data flow (User Input → Component → Lib → API → State)
    - Realtime subscription lifecycle
    - Trading order execution flow
```

**Success Criteria:** All 9 decisions documented in ADR format, new ADRs for critical patterns

---

### 4.2 Add Inline Implementation Guides ⏱ 2 days | Risk: None

**Current State:**
- README.md is good overview
- Implementation details scattered across files
- Developers repeat similar patterns

**Action Items:**
```
□ Create implementation guides
  Format: Markdown files in docs/developer-guide/
  
  Guides to create:
    1. ADDING_A_DATABASE_TABLE.md
       Steps: Migration → RLS → Types (supabase:pull) → Hook → Tests
    
    2. IMPLEMENTING_A_FEATURE.md
       Pattern: Check PRD → Search similar → Design types → Business logic → UI
    
    3. FIXING_A_BUG.md
       Process: Reproduce → Test (TDD) → Fix → Verify → Search similar
    
    4. REALTIME_PATTERNS.md
       Pattern: Standard subscription with cleanup example
       Link: useRealtimePositions.tsx canonical implementation
    
    5. PERFORMANCE_OPTIMIZATION.md
       Process: Measure → Profile → Optimize → Verify
       Tools: Chrome DevTools, Lighthouse, Web Vitals
    
    6. TESTING_STRATEGIES.md
       Unit: Vitest + React Testing Library
       E2E: Playwright
       Coverage targets per module type

□ Add code comments in critical files
  Files:
    - src/hooks/useRealtimePositions.tsx (add pattern comment)
    - src/lib/trading/calculations.ts (math complexity)
    - src/lib/api/validation.ts (schema reasoning)
```

**Success Criteria:** 6+ guides created, linked from main README, updated as code changes

---

### 4.3 Create Component API Documentation ⏱ 1 day | Risk: None

**Current State:**
- shadcn-ui components documented in component library
- Custom components lack API docs
- Developers unsure about props/usage

**Action Items:**
```
□ Add JSDoc to all exported components
  Template:
    /**
     * [Description of component]
     * 
     * @param {ComponentProps} props - Component properties
     * @example
     * <MyComponent title="Example" loading={true} />
     */
    export function MyComponent(props: ComponentProps) { ... }

□ Create component API reference
  File: docs/components/COMPONENT_API.md
  Format: Table with name, purpose, key props, example
  Auto-generate from JSDoc (optional tool: typedoc)

□ Document shadcn-ui customizations
  If any: Note in docs/components/README.md
  Include: Custom theme tokens, overrides
```

**Success Criteria:** All components have JSDoc, reference doc complete

---

## 5. DEPENDENCY MANAGEMENT

### 5.1 Audit & Update Dependencies ⏱ 1 day | Risk: ⚠️ Medium

**Current State:**
- Modern stack: React 18.3, Vite 7.3, TypeScript 5.3 ✓
- Dependencies: Check for outdated packages

**Action Items:**
```
□ Generate dependency report
  Command: npm outdated (check for outdated packages)
  Document: Which packages lag, why
  
□ Check for security vulnerabilities
  Command: npm audit
  Fix: High/critical issues
  Document: Medium/low issues for future
  
□ Review unused dependencies
  Tool: Already using depcheck (see audit reports)
  Remove: Truly unused packages
  Command: npm rm <package>
  
□ Optimize bundle
  Evaluate:
    - recharts (14.2 KB, used for charts)
    - lightweight-charts (used for trading view)
    - intro.js (onboarding, maybe unused?)
    - lovable-tagger (1.1.11, check usage)
  
□ Update version constraints
  Strategy: Keep lock file stable
  Approach: ^X.Y.Z for patches, manage minor upgrades
  
□ Document dependency philosophy
  File: docs/development/DEPENDENCY_STRATEGY.md
  Policy: How to evaluate new dependencies
```

**Success Criteria:** No high/critical vulnerabilities, unused packages removed, docs updated

---

### 5.2 Lock Dependency Versions ⏱ 0.5 days | Risk: Low

**Current State:**
- package-lock.json exists (good)
- But developers might accidentally break locks

**Action Items:**
```
□ Verify lock file in git
  Command: git log --oneline package-lock.json | head -5
  
□ Document npm workflow
  File: docs/development/NPM_GUIDELINES.md
  Rules:
    - Always use npm ci (not npm install) in CI/CD
    - npm install locally only to add/remove packages
    - npm audit fix for vulnerabilities
    - npm update cautiously (test after)
  
□ Add pre-commit hook
  Tool: husky (already installed)
  Script: Check for accidental node_modules changes
```

---

## 6. TESTING IMPROVEMENTS

### 6.1 Close Test Coverage Gaps ⏱ 4 days | Risk: Low

**Current State:**
- Coverage target: 70% (all modules)
- Critical trading logic needs > 90% coverage
- Some paths untested

**Action Items:**
```
□ Identify coverage gaps
  Command: npm run test:coverage
  Generate HTML report: Open coverage/index.html
  
□ Prioritize testing
  1. Critical: Trading calculations, order execution
     Target: 95% coverage
  2. High: Risk management, margin calls, liquidation
     Target: 90% coverage
  3. Medium: UI logic, validations
     Target: 80% coverage
  4. Low: Utilities, helpers
     Target: 70% coverage

□ Add missing tests
  Files to prioritize:
    - src/lib/trading/__tests__/calculations.test.ts (add edge cases)
    - src/lib/risk/__tests__/riskMetrics.test.ts (complete)
    - src/hooks/__tests__/useOrderExecution.test.tsx (new)
    - src/lib/__tests__/orderSecurity.test.ts (expand)
  
□ Test async operations
  Pattern: Use Vitest + React Testing Library
  Focus: Component async flows, Supabase queries
  
□ Add performance tests
  File: src/__tests__/performance/
  Tests:
    - Order execution time < 500ms
    - Realtime update latency < 200ms
    - Component render time < 16ms (60fps)
  Command: npm run test:performance

□ Document testing patterns
  File: docs/developer-guide/TESTING_GUIDE.md
  Topics:
    - Unit test structure
    - Mocking Supabase queries
    - Component testing patterns
    - E2E testing with Playwright
```

**Success Criteria:** Coverage > 85% overall, > 95% for trading logic, new tests documented

---

### 6.2 Improve E2E Test Coverage ⏱ 3 days | Risk: Low

**Current State:**
- `e2e/basic.spec.ts` exists (minimal)
- Playwright configured but limited test suite

**Action Items:**
```
□ Create E2E test suite
  Location: e2e/
  Tests to add:
    1. Authentication flow
       - Sign up → email verification → KYC → Trading
    2. Trading workflow
       - Create order → Modify → Execute → Close
    3. Risk management
       - Margin warning → Margin call → Liquidation
    4. Social features
       - Copy trading flow
    5. Error scenarios
       - Network failure → Reconnect
       - Order rejection → Retry

□ Configure Playwright
  File: playwright.config.ts (already exists)
  Add:
    - Screenshot/video on failure
    - Parallel test execution
    - Test retries (up to 2x)

□ Add fixture setup
  File: e2e/fixtures.ts
  Fixtures:
    - authenticated user
    - seeded market data
    - pre-created positions

□ Document E2E workflow
  File: docs/development/E2E_TESTING.md
  Guide: How to write, run, debug E2E tests

□ Add to CI/CD
  File: .github/workflows/test.yml (if exists)
  Trigger: On PR to main
```

**Success Criteria:** 10+ E2E tests covering critical flows, CI integration, docs complete

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1 Optimize Bundle Size ⏱ 2 days | Risk: Low

**Current State:**
- Bundle analyzer available: `npm run build:analyze`
- Current size: ~44 MB source, unknown minified
- Risk: Slow initial load, poor Core Web Vitals

**Action Items:**
```
□ Analyze current bundle
  Command: npm run build:analyze
  Document: Top contributors (recharts? lightweight-charts?)
  
□ Identify optimization opportunities
  Strategies:
    1. Code splitting by route (already using React Router)
    2. Lazy load trading view components
    3. Tree-shake unused chart code
    4. Compress images to WebP
    
□ Implement lazy loading
  File: src/App.tsx or routes configuration
  Pattern:
    const TradingView = lazy(() => import('./pages/Trade'));
    <Suspense fallback={<Loading />}>
      <TradingView />
    </Suspense>

□ Optimize large libraries
  recharts (14.2KB):
    - Use minimal chart types
    - Consider smaller alternative for summary charts
  lightweight-charts (5MB minified?):
    - Loaded on-demand for trading view
    - Verify not loaded on all pages

□ Add bundle size monitoring
  File: package.json script
  Command: npm run bundle:check
  Output: Warn if bundle > threshold

□ Document optimization guide
  File: docs/development/BUNDLE_OPTIMIZATION.md
```

**Success Criteria:** Bundle size reduction > 20%, documented optimization strategies

---

### 7.2 Performance Monitoring & Alerting ⏱ 1 day | Risk: Low

**Current State:**
- Web Vitals tracked via `web-vitals` library
- Sentry integrated for error reporting
- But no performance threshold alerts

**Action Items:**
```
□ Define performance budgets
  Metrics (Core Web Vitals):
    - LCP: < 2.5s
    - FID: < 100ms
    - CLS: < 0.1
  Custom metrics:
    - Initial load: < 3s
    - Realtime update: < 200ms
    - Order execution: < 500ms

□ Implement threshold alerting
  Integration: Sentry performance monitoring
  Alerts: Email/Slack when metrics exceed thresholds
  
□ Add performance debugging
  File: src/lib/performance/debugging.ts
  Export:
    - getWebVitals()
    - getRealtimeLatency()
    - getComponentRenderTime()
    - exportPerformanceReport()

□ Document performance troubleshooting
  File: docs/development/PERFORMANCE_TROUBLESHOOTING.md
  Topics:
    - How to identify slow components (React DevTools Profiler)
    - Realtime subscription latency issues
    - Bundle size debugging
```

**Success Criteria:** Performance budgets defined, alerting configured, debugging docs written

---

## 8. SECURITY ENHANCEMENTS

### 8.1 Strengthen Input Validation & Sanitization ⏱ 1 day | Risk: Medium

**Current State:**
- `dompurify` (3.3.1) integrated for XSS protection
- Zod schemas used for form validation
- Risk: Incomplete validation coverage, edge cases

**Action Items:**
```
□ Audit validation coverage
  Files:
    - src/lib/apiValidation.ts (Zod schemas) - comprehensive
    - src/lib/sanitize.ts (DOMPurify usage) - check coverage
    - src/lib/formValidation.ts - additional rules?
  
□ Add validation for edge cases
  Examples:
    - Extremely large numbers (leverage, amounts)
    - Unicode/emoji in text fields
    - SQL injection patterns (e.g., in search)
    - Rate limiting on API calls

□ Test validation rules
  File: src/lib/__tests__/apiValidation.test.ts
  Test all schemas with:
    - Valid data
    - Invalid data
    - Edge cases
    - Malicious input

□ Document validation patterns
  File: docs/security/VALIDATION_PATTERNS.md
  Rules:
    - Always validate on client (UX) and server (security)
    - Use Zod for structured data
    - Sanitize user-generated content
```

**Success Criteria:** Validation coverage > 95%, edge cases tested, docs complete

---

### 8.2 Audit KYC/AML & Compliance Features ⏱ 1 day | Risk: High

**Current State:**
- KYC/AML verification implemented
- Risk: Compliance gap if verification logic flawed

**Action Items:**
```
□ Review KYC implementation
  Files:
    - src/components/kyc/
    - src/hooks/useKyc.tsx
    - src/lib/kyc/

□ Verify compliance requirements
  Checklist:
    - Document upload validation
    - Document type verification
    - Expiration checking
    - Re-verification triggers
    - Data retention policy

□ Test compliance flow
  Scenarios:
    - Approved verification
    - Rejected documents
    - Expired documents
    - Document re-upload

□ Document compliance audit trail
  Logging:
    - Who verified, when, what action
    - Document file uploads & rejections
    - Admin overrides (if allowed)
  Location: src/lib/authAuditLogger.ts

□ Create compliance documentation
  File: docs/security/COMPLIANCE_GUIDE.md
  Topics: KYC/AML workflow, audit requirements
```

**Success Criteria:** Compliance requirements verified, audit trail complete, docs written

---

## 9. RISK ASSESSMENT

### Risks and Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Breaking changes during refactoring** | Medium | High | Run full test suite after each change, use git branches |
| **Memory leaks from missed cleanup** | Low | High | Test with Chrome DevTools, add memory profiler tests |
| **Supabase RLS policy gaps** | Low | Critical | Document policy requirements, create migration checklist |
| **Performance regression** | Medium | Medium | Monitor bundle size, add performance budgets, test before/after |
| **Type safety regression** | Low | Medium | Enable strict mode gradually, add pre-commit type check |
| **Test flakiness** | Medium | Medium | Fix async tests, add retry logic, timeout increases |
| **Dependency conflicts** | Low | Medium | Use lock file strictly, test upgrades in branch first |
| **Documentation staleness** | High | Low | Link docs to code, add version numbers, review quarterly |

### Risk Mitigation Checklist

```
□ Create feature branch before major refactoring
□ Run full test suite before merging
□ Update docs immediately after code changes
□ Test performance before/after optimization
□ Have rollback plan for critical changes
□ Monitor error logs after deployment
□ Get code review for security-related changes
```

---

## Implementation Timeline

### Phase 1: IMMEDIATE (Week 1) - Security & Stability
**Total Effort:** 7 days | **Impact:** 🔴 Critical

- Day 1-2: Fix realtime subscription memory leaks
- Day 2-3: Secure environment configuration
- Day 3: Review & standardize Supabase RLS policies
- Day 4: Begin consolidating trading calculations
- Day 5-6: Merge performance monitoring systems
- Day 7: Testing & validation

**Deliverables:** Stable realtime system, secured secrets, standardized RLS policies

---

### Phase 2: STRUCTURAL (Weeks 2-3) - Organization & Standards
**Total Effort:** 6 days | **Impact:** 🟡 High

- Day 1-2: Consolidate trading calculation modules (cont'd)
- Day 2-3: Reorganize `src/lib/` directory
- Day 3: Fix hook organization & documentation
- Day 4-5: Standardize error handling across trading
- Day 5-6: Improve TypeScript strictness

**Deliverables:** Cleaner architecture, better organization, improved type safety

---

### Phase 3: QUALITY & DOCUMENTATION (Weeks 4-5) - Enablement
**Total Effort:** 7 days | **Impact:** 🟡 High

- Day 1-2: Create Architecture Decision Records (ADRs)
- Day 2-3: Add inline implementation guides
- Day 3-4: Close test coverage gaps (start)
- Day 4-5: Improve E2E test coverage
- Day 5-6: Consolidate utility functions
- Day 6-7: Component API documentation

**Deliverables:** Developer guides, ADRs, improved test coverage, component docs

---

### Phase 4: PERFORMANCE & OPTIMIZATION (Week 6+) - Continuous
**Total Effort:** 5 days | **Impact:** 🟢 Medium

- Day 1: Optimize bundle size
- Day 2: Performance monitoring & alerting
- Day 3-4: Add performance tests
- Day 4-5: Dependency audit & updates

**Deliverables:** Smaller bundle, better monitoring, performance tests

---

## Success Metrics

### Code Quality Metrics
```
✓ Type coverage: > 95%
✓ Test coverage: > 85% overall, > 95% for trading logic
✓ Lint warnings: < 10
✓ Code duplication: < 5%
✓ Component complexity: All < 300 lines
✓ Cyclomatic complexity: Average < 5
```

### Performance Metrics
```
✓ Bundle size: < 1.5 MB (minified + gzipped)
✓ LCP (Largest Contentful Paint): < 2.5s
✓ FID (First Input Delay): < 100ms
✓ CLS (Cumulative Layout Shift): < 0.1
✓ Realtime latency: < 200ms
✓ Order execution: < 500ms
✓ Memory leaks: 0
```

### Documentation Metrics
```
✓ ADRs created: 15+
✓ Implementation guides: 6+
✓ Inline JSDoc coverage: > 95%
✓ Example code in guides: Every guide has examples
✓ Documentation currency: Updated within 7 days of code change
```

### Developer Experience Metrics
```
✓ Onboarding time: New developer productive in < 3 days
✓ Issue resolution time: Bug fix cycle < 4 hours
✓ Code review comments: < 3 per PR (improved clarity)
✓ Test failure diagnosis: Clear error messages, < 5 min investigation
```

---

## Quick Reference: File Structure After Cleanup

```
Trade-X-Pro-Global/
├── src/
│   ├── components/          # UI components only
│   ├── contexts/            # Global state providers
│   ├── hooks/               # Custom hooks (75+)
│   ├── lib/
│   │   ├── auth/            # Auth logic ⭐ NEW
│   │   ├── trading/         # Trading calculations (consolidated)
│   │   ├── risk/            # Risk metrics
│   │   ├── security/        # Security logic (expanded)
│   │   ├── api/             # API validation & errors
│   │   ├── data/            # Data fetching & subscriptions
│   │   ├── performance/     # Monitoring (merged)
│   │   ├── utils/           # Utility functions
│   │   ├── accessibility/   # WCAG helpers (new org)
│   │   └── index.ts         # Barrel export
│   ├── pages/               # Route pages
│   ├── types/               # Type definitions
│   └── __tests__/           # Tests
├── docs/
│   ├── architecture/        # ADRs & decisions
│   ├── developer-guide/     # Implementation guides ⭐ NEW
│   ├── components/          # Component API
│   ├── database/            # DB schemas & RLS
│   └── security/            # Security guides
├── supabase/
│   ├── migrations/          # DB migrations with RLS
│   └── functions/           # Edge functions
├── e2e/                     # End-to-end tests
├── .github/
│   └── workflows/           # CI/CD pipelines
└── package.json             # Dependencies
```

---

## Recommendations for Next Steps

### Immediate Actions (Do This Week)
1. ✅ Review this plan with team
2. ✅ Create feature branch for Phase 1 work
3. ✅ Assign owners to high-priority items
4. ✅ Set up branch protection rules requiring passing tests

### For the Next Month
1. Execute Phases 1-2 (2-3 weeks of focused work)
2. Conduct team code review sessions
3. Update CI/CD pipeline with new checks
4. Begin measuring success metrics

### Ongoing (Quarterly Reviews)
1. Monitor code quality metrics
2. Conduct technical debt assessments
3. Update cleanup roadmap based on new learnings
4. Share architectural decisions with team

---

## Appendix: Cleanup Checklist Template

Use this checklist for tracking progress:

```markdown
## Phase 1: Security & Stability (Week 1)

- [ ] Fix realtime subscription memory leaks
  - [ ] Audit all subscription hooks
  - [ ] Create standardized pattern
  - [ ] Test for leaks in profiler
  - [ ] Document pattern

- [ ] Secure environment configuration
  - [ ] Create .env.example
  - [ ] Verify .gitignore
  - [ ] Add security checklist to README
  - [ ] Audit docker/deployment

- [ ] Review Supabase RLS policies
  - [ ] Audit all policies
  - [ ] Document patterns
  - [ ] Create migration checklist
  - [ ] Add policy tests

- [ ] Consolidate trading calculations
  - [ ] Audit duplicate files
  - [ ] Merge into single module
  - [ ] Update all imports
  - [ ] Test builds

- [ ] Merge performance systems
  - [ ] Audit implementations
  - [ ] Create unified API
  - [ ] Consolidate reporting
  - [ ] Update hooks

## Phase 2: Structural (Weeks 2-3)

- [ ] Reorganize src/lib/
  - [ ] Plan directory structure
  - [ ] Move files (git mv)
  - [ ] Update imports
  - [ ] Verify builds

... (continue for each phase)
```

---

## Contact & Questions

For questions about this cleanup strategy:
- Review the attached copilot-instructions.md for technical context
- Consult AGENT.md for deep architectural rules
- Reference README.md for current project status

---

**Document Version:** 1.0  
**Last Updated:** January 30, 2026  
**Status:** Ready for Implementation  
**Next Review:** After Phase 1 Completion (7 days)
