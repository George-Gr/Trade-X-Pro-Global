# Comprehensive Dependency Upgrade Plan - Trade-X-Pro v10

**Document Version:** 1.0  
**Date:** December 12, 2025  
**Status:** Strategic Planning Phase  
**Risk Assessment:** HIGH (Multiple major version bumps identified)

---

## Executive Summary

Analysis of the current dependency stack reveals **35+ outdated packages**, ranging from safe patch updates to critical major version changes. The application currently builds successfully, indicating no immediate breaking issues. This plan takes a **conservative, phased approach** to minimize disruption to a production-grade CFD trading platform.

**Key Recommendation:** Do NOT attempt all upgrades simultaneously. Implement a controlled rollout with testing between each phase.

---

## Current State Analysis

### Build Status

- ✅ Production build completes successfully (3 minutes)
- ✅ Gzip size: ~112 kB (within reasonable limits for this complexity)
- ✅ Bundle chunks: Proper code-splitting in place
- ✅ No critical vulnerabilities reported

### Outdated Packages Breakdown

```
Total packages: 728
Outdated packages: 35+
Safe patch updates: 8
Minor version updates: 3
Major version updates: 24
```

---

## Categorized Dependency Analysis

### TIER 1: Safe Patch Updates (100% Safe)

Low-risk updates that should be applied immediately.

| Package               | Current  | Target   | Type  | Risk   | Notes                                   |
| --------------------- | -------- | -------- | ----- | ------ | --------------------------------------- |
| @sentry/react         | 10.27.0  | 10.30.0  | Patch | ✅ Low | Error tracking - no breaking changes    |
| @tanstack/react-query | 5.90.11  | 5.90.12  | Patch | ✅ Low | Server state - stable API               |
| @tailwindcss/postcss  | 4.1.17   | 4.1.18   | Patch | ✅ Low | CSS processing - no breaking changes    |
| framer-motion         | 12.23.24 | 12.23.26 | Patch | ✅ Low | Animation library - backward compatible |
| lovable-tagger        | 1.1.11   | 1.1.13   | Patch | ✅ Low | Tagging utility - minor fixes           |
| tailwindcss           | 4.1.17   | 4.1.18   | Patch | ✅ Low | CSS framework - stable                  |
| vite                  | 7.2.4    | 7.2.7    | Patch | ✅ Low | Build tool - performance improvements   |
| @vitest/ui            | 4.0.14   | 4.0.15   | Patch | ✅ Low | Testing UI - no API changes             |

**Action:** Upgrade all TIER 1 packages together.

---

### TIER 2: Minor Version Updates (Low Risk)

Small updates with potential for improved stability.

| Package               | Current | Target  | Type  | Risk   | Breaking Changes | Notes                                   |
| --------------------- | ------- | ------- | ----- | ------ | ---------------- | --------------------------------------- |
| react-hook-form       | 7.66.1  | 7.68.0  | Minor | ✅ Low | None documented  | Form library - patch-level improvements |
| @tanstack/react-query | 5.90.11 | 5.90.12 | Minor | ✅ Low | None documented  | Server state management - stable        |
| @types/node           | 24.10.1 | 24.10.3 | Patch | ✅ Low | None             | Type definitions only                   |

**Action:** Upgrade TIER 2 after TIER 1 completes successfully. Test form functionality.

---

### TIER 3: Supabase Minor Update (Medium Risk)

Database layer update requiring careful testing.

| Package               | Current | Target | Type  | Risk      | Breaking Changes | Notes                                 |
| --------------------- | ------- | ------ | ----- | --------- | ---------------- | ------------------------------------- |
| @supabase/supabase-js | 2.84.0  | 2.87.1 | Minor | ⚠️ Medium | Check changelog  | Database client - verify RLS policies |

**Breaking Changes to Watch:**

- Realtime subscriptions may have subtle timing changes
- Auth token handling could differ
- Type generation might need re-running: `npm run supabase:pull`

**Action:** Run full test suite after upgrading. Test trading functionality and realtime updates.

---

### TIER 4: Strategic Major Updates (High Risk - Choose Carefully)

Major version updates that require architectural evaluation.

#### Option A: Tailwind Typography Enhancement

| Package                 | Current | Target | Type  | Risk      |
| ----------------------- | ------- | ------ | ----- | --------- |
| @tailwindcss/typography | 0.4.1   | 0.5.19 | Major | ⚠️ Medium |

**Assessment:** Only upgrade if new typography features are explicitly needed. The application is not heavily typography-focused. **Recommendation: SKIP for now.**

---

#### Option B: Form Validation Stack (Ecosystem Decision)

**⚠️ CRITICAL DECISION POINT:** The form validation stack involves interdependencies.

##### Current Stack:

- react-hook-form: 7.66.1
- @hookform/resolvers: 3.10.0
- zod: 3.25.76

##### Available Upgrades:

- react-hook-form: 7.68.0 (minor - SAFE, already in TIER 2)
- @hookform/resolvers: 5.2.2 (MAJOR - from v3)
- zod: 4.1.13 (MAJOR - from v3)

**Documentation Findings:**

- @hookform/resolvers v5.2.2 officially supports **BOTH** Zod v3 and v4
- Zod v4 released with subpath strategy: `"zod/v4"` and `"zod/v3"` both available forever
- No breaking changes to zod v3; v4 brings error customization improvements

**Recommendation: DEFER MAJOR UPGRADES**

- Keep react-hook-form at 7.68.0 (minor patch)
- Keep @hookform/resolvers at 3.10.0 (stable, proven in production)
- Keep zod at 3.25.76 (mature, no critical gaps)
- **Rationale:** These work perfectly together. Major upgrades add risk without immediate benefit.

**If you MUST upgrade form validation:**

1. Keep react-hook-form at 7.68.0
2. Upgrade @hookform/resolvers to 5.2.2 (bridge to both zod v3 and v4)
3. Keep zod at 3.25.76 for now (or upgrade to 3.25.x latest first)
4. Run extensive validation tests
5. Test trading order forms specifically

---

#### Option C: React Router Decision

| Package          | Current | Target | Type  | Risk    |
| ---------------- | ------- | ------ | ----- | ------- |
| react-router-dom | 6.30.2  | 7.10.1 | Major | 🔴 HIGH |

**Breaking Changes (React Router v7):**

- Route definition syntax has changed
- Loader/action patterns different
- useNavigate hook behavior changes
- Route parameters API changes

**Assessment:** v6.30.2 is a stable, mature version. v7 is fundamentally different.

**Recommendation: SKIP v7 upgrade**

- Stay on React Router v6 unless deploying a brand new app
- The current v6 implementation is solid and proven
- Upgrade cost: ~40-60 hours of refactoring for a full migration

---

#### Option D: React Ecosystem Major Version (19)

| Package          | Current | Target | Type  | Risk        |
| ---------------- | ------- | ------ | ----- | ----------- |
| react            | 18.3.1  | 19.2.3 | MAJOR | 🔴 CRITICAL |
| react-dom        | 18.3.1  | 19.2.3 | MAJOR | 🔴 CRITICAL |
| @types/react     | 18.3.27 | 19.2.7 | MAJOR | 🔴 CRITICAL |
| @types/react-dom | 18.3.7  | 19.2.3 | MAJOR | 🔴 CRITICAL |

**Breaking Changes (React 19):**

- Removes `ReactDOM.render()` and `ReactDOM.hydrate()`
- Removes string refs
- Removes legacy context API
- Removes propTypes and defaultProps (except classes)
- New hooks: useActionState, useOptimistic, useEffectEvent
- Stricter mutation rules in closures

**Compatibility Concerns:**

- Some third-party libraries may not be fully React 19 compatible yet
- Need to verify: @supabase/supabase-js, react-router-dom, recharts, date-fns
- Form submission patterns may need refactoring

**Recommendation: DEFER REACT 19 UPGRADE**

- React 18.3.1 is stable and production-ready
- React 19 brings benefits but requires ecosystem-wide compatibility
- Upgrade should be done in a dedicated sprint with full QA
- Timeline: Plan for Q1 2025 if needed

**If you MUST upgrade to React 19:**

1. Create a feature branch specifically for React 19
2. Audit all deprecated API usage (form refs, context patterns)
3. Test every trading feature thoroughly
4. Verify Supabase Realtime subscriptions work correctly
5. Run performance tests (React 19 has compiler optimizations)
6. Estimated effort: 80-120 hours

---

#### Option E: Other Major Updates Assessment

| Package      | Current | Target | Assessment                      | Recommendation                 |
| ------------ | ------- | ------ | ------------------------------- | ------------------------------ |
| sonner       | 1.7.4   | 2.0.7  | Toast notifications, major bump | DEFER - current version stable |
| react-window | 1.8.11  | 2.2.3  | Virtual scrolling, major bump   | DEFER - not critical path      |
| recharts     | 2.15.4  | 3.5.1  | Charts library, major bump      | DEFER - use current stable     |
| date-fns     | 3.6.0   | 4.1.0  | Date utilities, major bump      | DEFER - v3 is mature           |
| vaul         | 0.9.9   | 1.1.2  | Drawer component, minor/major   | DEFER - working well           |

---

## Recommended Upgrade Phases

### 🟢 PHASE 1: Safe Patch Upgrades (Execute Now)

**Duration:** 15 minutes  
**Risk Level:** ✅ MINIMAL  
**Testing Required:** npm run build

```bash
npm update @sentry/react @tanstack/react-query @tailwindcss/postcss \
  framer-motion lovable-tagger tailwindcss vite @vitest/ui
```

**Validation Checklist:**

- [ ] `npm run build:production` succeeds
- [ ] Bundle size doesn't increase by >5%
- [ ] No console errors in dev mode

---

### 🟡 PHASE 2: Minor Version Improvements (Execute After Phase 1 Success)

**Duration:** 30 minutes  
**Risk Level:** ⚠️ LOW  
**Testing Required:** Full test suite + manual testing

```bash
npm update react-hook-form @types/node
```

**Form Testing Checklist:**

- [ ] Order form submits correctly
- [ ] Validation errors display properly
- [ ] Dynamic form fields work (if using useFieldArray)
- [ ] Multi-step forms complete successfully

**Validation Checklist:**

- [ ] `npm run build:production` succeeds
- [ ] `npm run test` passes
- [ ] Manual trading form test

---

### 🟠 PHASE 3: Supabase Update (Execute After Phase 2 Success)

**Duration:** 1-2 hours  
**Risk Level:** ⚠️ MEDIUM  
**Testing Required:** Database integration tests + realtime tests

```bash
npm update @supabase/supabase-js
npm run supabase:pull  # Regenerate types after update
```

**Database Testing Checklist:**

- [ ] User login/registration works
- [ ] Can fetch user positions
- [ ] Realtime position updates trigger correctly
- [ ] Order placement creates database records
- [ ] No silent RLS policy failures
- [ ] Auth token refresh works

**Validation Checklist:**

- [ ] `npm run build:production` succeeds
- [ ] `npm run test` passes
- [ ] Trade live-data (paper trading if available)
- [ ] Monitor for console errors

---

### ❌ DO NOT UPGRADE (Current Phase)

**These should be deferred to future planning:**

- React to v19 (wait for ecosystem stability)
- react-router-dom to v7 (requires significant refactoring)
- @tailwindcss/typography to v0.5.x (not essential)
- zod, @hookform/resolvers major versions (working well as-is)
- sonner, react-window, recharts major versions (stable in current versions)

---

## Pre-Upgrade Checklist

Before executing ANY upgrade phase:

### Code Quality

- [ ] All tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] TypeScript strict check passes: `npm run build`
- [ ] Current build reproducible: `npm run build:production`

### Version Control

- [ ] Create feature branch: `git checkout -b feat/dependency-upgrades`
- [ ] Current state committed: `git status` is clean
- [ ] Latest from main pulled: `git pull origin main`

### Documentation

- [ ] Backup current package-lock.json
- [ ] Document current versions: `npm list > dependencies-before.txt`
- [ ] Keep this plan accessible during upgrades

---

## Testing Strategy

### Automated Testing

```bash
# Run complete test suite
npm run test

# Check for lint errors
npm run lint

# Build for production
npm run build:production

# Check bundle analysis
ANALYZE=true npm run build:production
```

### Manual Testing Checklist

1. **Authentication Flow**
   - [ ] Login page loads
   - [ ] Registration works
   - [ ] KYC verification flow accessible
   - [ ] Logout clears auth state

2. **Trading Functionality**
   - [ ] Asset tree loads
   - [ ] Can open/modify orders
   - [ ] Order form validates correctly
   - [ ] Real-time price updates
   - [ ] Position updates in real-time

3. **Data Integrity**
   - [ ] User profile loads
   - [ ] Wallet balances display
   - [ ] History shows transactions
   - [ ] Settings persist across sessions

4. **Performance**
   - [ ] Initial page load < 5 seconds
   - [ ] Form interactions responsive
   - [ ] No memory leaks during session
   - [ ] Charts render smoothly

5. **Browser Compatibility**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Mobile browsers (if applicable)

---

## Rollback Plan

If issues occur after an upgrade:

### For PHASE 1-2 (Patch/Minor Updates)

```bash
# Restore from git
git reset --hard HEAD~1
npm install  # Reinstall from lock file

# Or restore from backup
cp package-lock.json.backup package-lock.json
npm install
```

### For PHASE 3 (Supabase)

```bash
# Revert just Supabase
npm install @supabase/supabase-js@2.84.0

# Restore old types
git checkout HEAD -- src/integrations/supabase/types.ts
```

### Quick Health Check

```bash
npm run build:production 2>&1 | grep -i error
npm run test -- --run 2>&1 | tail -20
```

---

## Migration Notes by Breaking Change Category

### If You Later Upgrade React to v19

**Required Changes:**

1. Convert all `ref={ref}` string refs to callback refs
2. Update context API if using legacy context
3. Verify all form submissions work with new Action pattern
4. Check all `useEffect` dependencies (stricter rules)
5. Remove any `propTypes` or `defaultProps` usage

**Search patterns to find issues:**

```javascript
// Find string refs
ref="someRef"

// Find old ReactDOM patterns
ReactDOM.render(
ReactDOM.hydrate(

// Find legacy context
React.createContext()
```

### If You Later Upgrade React Router to v7

**Required Changes:**

1. Update all route definitions (new syntax)
2. Refactor loader/action patterns
3. Update useNavigate usage
4. Verify route parameters still work
5. Test all navigation patterns

**Estimated Effort:** 40-60 development hours

### If You Later Upgrade Zod to v4

**No code changes required** if using subpath imports:

```javascript
import { z } from "zod/v4"; // Explicitly v4
import { z } from "zod/v3"; // Explicitly v3
```

But error customization APIs are different:

- Replace `message` with `error`
- Replace `invalid_type_error` with `error` (function)
- Replace `errorMap` with `error` (function)

---

## Timeline and Effort Estimates

| Phase                    | Effort    | Testing | Risk   | Timeline |
| ------------------------ | --------- | ------- | ------ | -------- |
| Phase 1 (Patches)        | 15 min    | 15 min  | Low    | Day 1    |
| Phase 2 (Minor)          | 20 min    | 30 min  | Low    | Day 2    |
| Phase 3 (Supabase)       | 30 min    | 60 min  | Medium | Day 3-4  |
| React 19 (Future)        | 40-60 hrs | 20 hrs  | High   | Q1 2025  |
| React Router v7 (Future) | 40-60 hrs | 15 hrs  | High   | Q2 2025  |

---

## Success Criteria

### Phase 1 Complete

- ✅ All patch updates applied
- ✅ Production build completes
- ✅ Bundle size stable (±5%)
- ✅ No new console errors

### Phase 2 Complete

- ✅ All minor updates applied
- ✅ All form tests passing
- ✅ Type checking passes
- ✅ No regression in functionality

### Phase 3 Complete

- ✅ Supabase client updated
- ✅ Type definitions regenerated
- ✅ Realtime subscriptions working
- ✅ Database operations verified
- ✅ No RLS policy issues
- ✅ Full integration test suite passing

---

## Key Takeaways

1. **Do NOT upgrade everything at once.** The outdated packages span multiple risk tiers.

2. **React 18 is stable.** There's no immediate need to upgrade to React 19. Plan for Q1 2025.

3. **Your form validation stack is solid.** Keep react-hook-form, zod, and @hookform/resolvers as-is for now.

4. **Prioritize Phase 1 and Phase 2.** These are safe, low-risk improvements that help with maintenance.

5. **Phase 3 (Supabase) is the only medium-risk item worth doing now.** Test thoroughly.

6. **Document everything.** Keep this plan and take notes during execution for future reference.

---

## Commands Reference

```bash
# View all outdated packages
npm outdated

# Update specific package
npm update package-name

# Install specific version
npm install package-name@version

# Regenerate Supabase types after schema changes
npm run supabase:pull

# Run full test suite
npm run test

# Build for production
npm run build:production

# Check bundle size
ANALYZE=true npm run build:production

# Lint check
npm run lint

# Create upgrade branch
git checkout -b feat/dependency-upgrades-phase-X
```

---

**Document Status:** Ready for Implementation  
**Next Step:** Begin PHASE 1 when development schedule allows  
**Review Frequency:** Re-evaluate after each phase completion
