# Dependency Upgrade - Implementation Commands

**Quick Reference for executing each upgrade phase**

---

## Prerequisites Check

Before starting ANY phase:

```bash
# Ensure clean working directory
git status

# Verify current state
npm list | head -30

# Create feature branch
git checkout -b feat/dependency-upgrades-phase-1

# Backup current state
npm list > dependencies-before.txt
cp package-lock.json package-lock.json.backup
```

---

## PHASE 1: Safe Patch Updates (Execute Now)

**⏱️ Time Required:** 15 minutes execution + 15 minutes testing = 30 minutes total

### Step 1: Update Packages

```bash
npm update @sentry/react @tanstack/react-query @tailwindcss/postcss \
  framer-motion lovable-tagger tailwindcss vite @vitest/ui
```

**Expected Output:**
```
npm notice: up to date, audited X packages in Xs
```

### Step 2: Verify Installation

```bash
npm list @sentry/react @tanstack/react-query tailwindcss vite
```

**Expected:**
- @sentry/react: 10.30.0
- @tanstack/react-query: 5.90.12
- tailwindcss: 4.1.18
- vite: 7.2.7

### Step 3: Build Test

```bash
npm run build:production
```

**Expected:**
- ✅ Completes without errors
- ✅ Bundle size < 450 MB gzip (current: 112 MB)
- ✅ No warnings except Sentry auth token (acceptable)

### Step 4: Lint Check

```bash
npm run lint
```

**Expected:** No new errors

### Step 5: Commit

```bash
git add package.json package-lock.json
git commit -m "chore: update patch dependencies phase 1

- @sentry/react: 10.27.0 → 10.30.0
- @tanstack/react-query: 5.90.11 → 5.90.12
- @tailwindcss/postcss: 4.1.17 → 4.1.18
- framer-motion: 12.23.24 → 12.23.26
- lovable-tagger: 1.1.11 → 1.1.13
- tailwindcss: 4.1.17 → 4.1.18
- vite: 7.2.4 → 7.2.7
- @vitest/ui: 4.0.14 → 4.0.15

See: docs/assessments_and_reports/DEPENDENCY_UPGRADE_PLAN.md"
```

### Step 6: If Phase 1 Passes ✅

**Proceed to Phase 2**

### Step 6: If Phase 1 Fails ❌

**Rollback:**
```bash
git reset --hard HEAD~1
npm install

# Verify rollback
npm run build:production
```

---

## PHASE 2: Minor Version Updates (Execute After Phase 1 Success)

**⏱️ Time Required:** 20 minutes execution + 30 minutes testing = 50 minutes total

### Prerequisites

- [ ] Phase 1 completed successfully
- [ ] All Phase 1 tests passed
- [ ] Deployed to testing environment (optional)

### Step 1: Create Branch

```bash
git checkout -b feat/dependency-upgrades-phase-2
```

### Step 2: Update Packages

```bash
npm update react-hook-form @types/node
```

**Expected:**
- react-hook-form: 7.68.0
- @types/node: 24.10.3

### Step 3: Build Test

```bash
npm run build:production
```

**Expected:** ✅ Success with no new errors

### Step 4: Type Check

```bash
npm run build
```

**Expected:** ✅ No TypeScript errors

### Step 5: Form Testing (Manual)

Test the following forms in development mode (`npm run dev`):

**Login Form:**
```
1. Navigate to /login
2. Try submitting with empty fields
3. Verify validation errors show
4. Enter valid credentials
5. Verify form submits without errors
```

**Trading Order Form (if logged in):**
```
1. Navigate to /trading
2. Open order form
3. Try entering invalid amount (negative, too large)
4. Verify validation errors display
5. Enter valid order parameters
6. Verify form structure unchanged
```

**Any Dynamic Forms:**
```
1. Test useFieldArray if used (dynamic field arrays)
2. Test conditional fields
3. Test async validation if present
```

### Step 6: Lint Check

```bash
npm run lint
```

**Expected:** No new errors

### Step 7: Test Suite

```bash
npm run test -- --run 2>&1 | tail -30
```

**Expected:** All tests pass (or same pass rate as before)

### Step 8: Commit

```bash
git add package.json package-lock.json
git commit -m "chore: update minor dependencies phase 2

- react-hook-form: 7.66.1 → 7.68.0
- @types/node: 24.10.1 → 24.10.3

See: docs/assessments_and_reports/DEPENDENCY_UPGRADE_PLAN.md"
```

### If Phase 2 Fails

```bash
git reset --hard HEAD~1
npm install
npm run build:production
```

---

## PHASE 3: Supabase Update (Execute After Phase 2 Success)

**⏱️ Time Required:** 30 minutes execution + 60 minutes testing = 90 minutes total

### Prerequisites

- [ ] Phase 1 AND Phase 2 completed successfully
- [ ] All tests passing
- [ ] Supabase credentials in .env.local
- [ ] Can access Supabase dashboard

### ⚠️ CRITICAL: Database Integration Test Required

This phase affects database operations. Full integration testing needed.

### Step 1: Create Branch

```bash
git checkout -b feat/dependency-upgrades-phase-3-supabase
```

### Step 2: Update Package

```bash
npm update @supabase/supabase-js
```

**Expected:**
- @supabase/supabase-js: 2.87.1

### Step 3: Regenerate Type Definitions

```bash
npm run supabase:pull
```

**Expected Output:**
```
Generating TypeScript definitions from Supabase schema...
✓ Generated types in src/integrations/supabase/types.ts
```

**What this does:**
- Re-reads your Supabase database schema
- Regenerates auto-generated type definitions
- Ensures types match current database state

### Step 4: Build Test

```bash
npm run build:production
```

**Expected:** ✅ Success

### Step 5: Type Check

```bash
npm run build
```

**Expected:** No TypeScript errors (types from supabase:pull should be valid)

### Step 6: Comprehensive Database Testing

**Start dev server:**
```bash
npm run dev
```

**Test Sequence:**

#### A) Authentication Flow
```
1. Clear browser cookies/local storage
2. Navigate to /login
3. Log in with test account
4. Verify auth token stored
5. Navigate to different page
6. Verify still logged in (token persisted)
7. Logout
8. Verify redirected to login
9. Verify auth cleared
```

#### B) User Profile Operations
```
1. Log in
2. Navigate to Profile/Settings
3. Verify user data loads from database
4. Verify profile information displays correctly
5. Try updating profile (if functionality exists)
6. Verify changes persist on refresh
```

#### C) Trading-Critical Operations
```
1. Navigate to Trading page
2. Verify positions load from database
3. Verify prices update in real-time (websocket/realtime)
4. Create a new order (paper trading)
5. Verify order appears in position list within 1-2 seconds
6. Verify order position values are correct
```

#### D) Realtime Subscriptions
```
1. Open dev console (F12)
2. Navigate to trading page
3. Look for any websocket connection warnings
4. Open two browser tabs at same URL
5. Change something in first tab
6. Verify second tab updates within 2 seconds
7. Check console for realtime errors
```

#### E) Wallet/Balance Operations (if present)
```
1. Check wallet balance displays
2. Verify deposit/withdrawal history loads
3. Verify transaction amounts are accurate
```

#### F) KYC Status (if present)
```
1. Check KYC status displays correctly
2. Verify KYC form loads properly
3. Verify KYC submission works (or shows appropriate status)
```

### Step 7: Console Error Check

Open browser dev tools (F12) and check:
```
✅ No RLS policy errors (will show as 403)
✅ No "null" return errors
✅ No CORS errors
✅ No auth token errors
✅ Websocket should show "open" or similar
```

**Common Issues to Watch For:**

| Error | Cause | Solution |
|-------|-------|----------|
| `ERROR: new row violates row level security policy` | RLS policy broken | Check Supabase migrations |
| `Error: null` when fetching | Query failed silently | Check RLS, then check console |
| Realtime not updating | Subscription issue | Check realtime subscription code |
| Auth fails after logout | Token not cleared | Clear localStorage manually |

### Step 8: Run Test Suite

```bash
npm run test -- --run 2>&1 | grep -E "PASS|FAIL|tests"
```

**Expected:** Tests pass (if any exist for database operations)

### Step 9: Lint Check

```bash
npm run lint
```

**Expected:** No new errors

### Step 10: Performance Check

**Using Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check:
   - First meaningful paint < 3 seconds
   - Database queries < 500ms each
   - Realtime updates < 1 second

### Step 11: Commit

```bash
git add package.json package-lock.json src/integrations/supabase/types.ts
git commit -m "chore: update Supabase client phase 3

- @supabase/supabase-js: 2.84.0 → 2.87.1
- Regenerated type definitions via 'npm run supabase:pull'
- All database operations verified working
- Realtime subscriptions confirmed functional

See: docs/assessments_and_reports/DEPENDENCY_UPGRADE_PLAN.md"
```

### Step 12: Merge to Main

```bash
git checkout main
git pull origin main
git merge feat/dependency-upgrades-phase-3-supabase
git push origin main
```

### If Phase 3 Fails

**Quick Rollback:**
```bash
# Revert just Supabase
npm install @supabase/supabase-js@2.84.0

# Restore types from git
git checkout HEAD -- src/integrations/supabase/types.ts

# Verify build
npm run build:production
```

**Full Rollback:**
```bash
git reset --hard HEAD~1
npm install
npm run build:production
```

---

## Post-Upgrade Verification Checklist

After completing all applicable phases:

### Build Quality
- [ ] `npm run build:production` succeeds in < 5 minutes
- [ ] Bundle size gzip: 110-120 kB (within 10% of current)
- [ ] No error logs
- [ ] Sentry warning about auth token is expected (ignore)

### Code Quality
- [ ] `npm run lint` shows 0 errors
- [ ] `npm run test -- --run` shows all passing
- [ ] `npm run build` (type check) shows 0 errors

### Application Functionality
- [ ] Can log in
- [ ] Can navigate all pages
- [ ] Trading forms work
- [ ] Realtime updates function
- [ ] No console errors

### Performance
- [ ] Initial page load < 4 seconds
- [ ] Form interactions < 100ms latency
- [ ] Realtime updates < 2 seconds

### Database (Phase 3 only)
- [ ] User sessions persist
- [ ] Position data loads correctly
- [ ] Realtime position updates work
- [ ] No RLS errors in console

---

## Rollback Commands Quick Reference

### Undo Last Commit
```bash
git reset --hard HEAD~1
npm install
```

### Undo Specific Package Update
```bash
npm install package-name@previous-version
```

### Full Environment Reset
```bash
rm -rf node_modules/
rm package-lock.json
npm install
npm run build:production
```

### Restore from Backup
```bash
cp package-lock.json.backup package-lock.json
npm install
```

---

## After All Upgrades Complete

### Create Summary Report

```bash
npm list > dependencies-after.txt
diff dependencies-before.txt dependencies-after.txt > upgrade-diff.txt
cat upgrade-diff.txt
```

### Document Success

```bash
git tag -a v-deps-upgraded-2025-12 -m "Dependency upgrades: Phase 1, 2, 3 completed successfully"
git push origin v-deps-upgraded-2025-12
```

### Schedule Future Work

- **Q1 2025:** Evaluate React 19 migration
- **Q2 2025:** Consider React Router v7 if needed
- **Ongoing:** Monitor security updates for major dependencies

---

## Support & Troubleshooting

### Issue: Build fails with "Cannot find module"

```bash
# Solution 1: Reinstall everything
rm -rf node_modules/
npm install

# Solution 2: Clear npm cache
npm cache clean --force
npm install
```

### Issue: TypeScript errors after Supabase update

```bash
# Regenerate types
npm run supabase:pull

# Then build
npm run build
```

### Issue: Tests failing after upgrade

```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Or just re-run with diagnostics
npm run test -- --run --reporter=default
```

### Issue: Realtime subscriptions not working

```bash
# Check WebSocket connection in DevTools:
# 1. Open DevTools (F12)
# 2. Go to Network tab
# 3. Filter for "ws:" (WebSocket)
# 4. Refresh page
# 5. Should see connection to your Supabase URL

# If missing, check:
# - Supabase URL in .env.local
# - VITE_SUPABASE_PUBLISHABLE_KEY correct
# - RLS policies allow read on realtime channels
```

---

## Questions or Issues?

Refer to:
1. [DEPENDENCY_UPGRADE_PLAN.md](DEPENDENCY_UPGRADE_PLAN.md) - Full strategic plan
2. [BREAKING_CHANGES_ANALYSIS.md](BREAKING_CHANGES_ANALYSIS.md) - Detailed breaking changes
3. [DEPENDENCY_UPGRADE_QUICK_REFERENCE.md](DEPENDENCY_UPGRADE_QUICK_REFERENCE.md) - Quick summary

---

**Happy upgrading! 🚀**
