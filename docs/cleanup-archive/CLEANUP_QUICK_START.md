# TradePro v10 - Cleanup Implementation Quick Start

**Purpose:** Step-by-step execution guide for the Strategic Cleanup Plan  
**Target Audience:** Development team  
**Estimated Time to Read:** 10 minutes

---

## 📋 Quick Checklist by Priority

### 🔴 CRITICAL (Start This Week)
- [ ] Fix realtime subscription memory leaks (2 days)
- [ ] Secure environment configuration (1 day)
- [ ] Review Supabase RLS policies (2 days)

### 🟡 HIGH (Weeks 2-3)
- [ ] Consolidate duplicate trading calculations (3 days)
- [ ] Merge performance monitoring systems (2 days)
- [ ] Reorganize src/lib/ directory (3 days)

### 🟢 MEDIUM (Weeks 4+)
- [ ] Document architecture patterns (2 days)
- [ ] Close test coverage gaps (4 days)
- [ ] Optimize bundle size (2 days)

---

## 🚀 Getting Started: Phase 1 (Week 1)

### Day 1-2: Fix Realtime Subscription Memory Leaks

**Why:** Potential memory leaks on re-renders could cause app instability

**Steps:**

```bash
# 1. Check canonical pattern
git log --oneline src/hooks/useRealtimePositions.tsx | head -3

# 2. Review the pattern
code src/hooks/useRealtimePositions.tsx

# 3. Identify all Realtime hooks
find src/hooks -name "useRealtime*.tsx" -o -name "useRealtime*.ts"

# 4. Compare each against canonical pattern
# Look for: subscription.unsubscribe() in cleanup

# 5. Create test file
touch src/hooks/__tests__/realtimeMemoryLeaks.test.tsx

# 6. Add memory leak tests
# Test template:
#   - Subscribe to hook
#   - Trigger re-render 100x
#   - Unsubscribe
#   - Check memory profile
```

**Verification:**
```bash
npm run test -- --grep "useRealtime"
npm run test:ui  # Visual verification
```

**Files to Audit:**
- `src/hooks/useRealtimePositions.tsx` ✓ (canonical)
- `src/hooks/useRealtimeOrders.ts`
- `src/hooks/useRealtimeProfile.ts`
- `src/hooks/usePriceStream.ts`
- Any others following same pattern

---

### Day 2-3: Secure Environment Configuration

**Why:** Prevent accidental secret commits to git

**Steps:**

```bash
# 1. Create .env.example
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Production URLs
VITE_PRODUCTION_URL=https://yourdomain.com

# Monitoring
VITE_SENTRY_DSN=https://xxxxx@xxxxx.sentry.io/999999

# Feature Flags (optional)
VITE_DEBUG_MODE=false
EOF

# 2. Verify .gitignore covers secrets
grep -E "\.env\.|secrets" .gitignore

# 3. Add to README
code README.md
# Add section: "## Environment Setup"
# Include: Copy from .env.example, get credentials from Supabase dashboard

# 4. Scan for exposed secrets
npm audit
git log --all -p --grep="SENTRY_DSN\|SUPABASE_KEY" | head -20

# 5. If secrets leaked: Rotate credentials immediately
# Message: "Rotate Supabase keys after cleanup"
```

**Verification:**
```bash
# Verify .env.local not in git
git ls-files | grep ".env" | grep -v ".env.example"
# Should return: NOTHING

# Verify it's in .gitignore
cat .gitignore | grep ".env"
```

---

### Day 3-4: Review Supabase RLS Policies

**Why:** Silent failures if RLS policies missing - critical for security

**Steps:**

```bash
# 1. Find all migrations
find supabase/migrations -name "*.sql" | sort

# 2. Extract all CREATE POLICY statements
grep -r "CREATE POLICY" supabase/migrations/ | tee policy-audit.txt

# 3. Create RLS policy document
cat > docs/database/RLS_POLICIES_AUDIT.md << 'EOF'
# RLS Policy Audit

## Required Policies by Table

### profiles table
- [ ] SELECT: Users see own profile
- [ ] UPDATE: Users update own profile
- [ ] ADMIN: Admins see all profiles

### positions table
- [ ] SELECT: Users see own positions
- [ ] UPDATE: Users update own positions
- [ ] ADMIN: Admins see all positions

### orders table
- [ ] Similar structure

...
EOF

# 4. Verify each table has policies
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename, 
       COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
EOF

# 5. Document gaps
# Message: "Add policies for: [list of tables without policies]"
```

**Verification:**
```bash
# All tables should have > 0 policies
# If 0: Create migration to add policies
```

---

### Day 4-5: Consolidate Trading Calculations

**Why:** Eliminate duplication, single source of truth for math

**Steps:**

```bash
# 1. Identify duplicate files
ls -la src/lib/trading/pnl*.ts

# 2. Compare the two files
diff src/lib/trading/pnlCalculations.ts src/lib/trading/pnlCalculation.ts

# 3. Create consolidated version
# File: src/lib/trading/calculations.ts
cat > src/lib/trading/calculations.ts << 'EOF'
/**
 * Trading Calculations Module
 * Single source of truth for all trading math
 */

export function calculatePnL(
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  isLong: boolean
): number {
  // Implement consolidated logic
  const pnl = isLong 
    ? (currentPrice - entryPrice) * quantity
    : (entryPrice - currentPrice) * quantity;
  return pnl;
}

// ... other calculations
EOF

# 4. Find all imports of old files
grep -r "pnlCalculations\|pnlCalculation" src --include="*.tsx" --include="*.ts" | head -20

# 5. Update imports (automated)
# Use VS Code Find & Replace or sed
sed -i 's|from.*pnlCalculations|from "@/lib/trading/calculations"|g' src/**/*.tsx
sed -i 's|from.*pnlCalculation|from "@/lib/trading/calculations"|g' src/**/*.tsx

# 6. Test
npm run build:check
npm run test
```

**Verification:**
```bash
# Confirm old files no longer imported
grep -r "pnlCalculation" src --include="*.tsx" --include="*.ts"
# Should return: NOTHING

# Confirm build works
npm run build 2>&1 | grep -i error
# Should return: NOTHING
```

---

### Day 5-6: Merge Performance Monitoring Systems

**Why:** Eliminate competing implementations, single monitoring source

**Steps:**

```bash
# 1. List all performance files
ls -la src/lib/performance*
ls -la src/lib/performance/*.ts
ls -la src/hooks/useWebVitals*

# 2. Understand each system
code src/lib/performance/performanceMonitoring.ts
code src/lib/performanceUtils.ts
code src/hooks/useWebVitalsEnhanced.ts

# 3. Create unified API
cat > src/lib/performance/index.ts << 'EOF'
/**
 * Unified Performance Monitoring System
 * Single API for all performance tracking
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

export function recordMetric(name: string, duration: number): void {
  metrics.push({ name, duration, timestamp: Date.now() });
}

export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

export function clearMetrics(): void {
  metrics.length = 0;
}
EOF

# 4. Update hook to use new system
cat > src/hooks/usePerformanceMonitoring.ts << 'EOF'
import { useEffect } from 'react';
import { recordMetric, getMetrics } from '@/lib/performance';

export function usePerformanceMonitoring(name: string) {
  useEffect(() => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      recordMetric(name, duration);
    };
  }, [name]);
}
EOF

# 5. Update all performance monitoring calls
# Before: performanceMonitoring.trackMetric()
# After: recordMetric()
grep -r "trackMetric\|recordMetric\|reportWebVitals" src --include="*.ts" --include="*.tsx" | wc -l

# 6. Test
npm run test:performance
npm run build:check
```

**Verification:**
```bash
# Verify no duplicate monitoring systems
grep -r "performanceMonitoring\|useWebVitalsEnhanced" src --include="*.tsx" --include="*.ts" | grep -v "index.ts"
# Should be minimal/targeted usage only
```

---

### Day 7: Testing & Validation

**Steps:**

```bash
# 1. Full test suite
npm run test

# 2. Type check
npm run type:check

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Review changes
git status

# 6. Create PR
# Message:
# Phase 1: Security & Stability
#
# - Fixed realtime subscription memory leaks
# - Secured environment configuration
# - Reviewed Supabase RLS policies
# - Consolidated trading calculations
# - Merged performance monitoring systems
#
# All tests passing, no regressions.
```

---

## 📊 Tracking Progress

### Template for Daily Update

```markdown
## Phase 1 Progress - Week of Jan 30

### Day 1-2: Realtime Memory Leaks
- [x] Identified all realtime hooks (4 found)
- [x] Reviewed canonical pattern in useRealtimePositions
- [x] Added memory leak tests
- [x] All tests passing ✓
- Time: 2 days | Status: Complete

### Day 2-3: Environment Security
- [x] Created .env.example
- [x] Verified .gitignore coverage
- [x] Updated README with setup guide
- [x] No secrets exposed ✓
- Time: 1 day | Status: Complete

### Day 3-4: RLS Policies
- [x] Audited all migrations
- [x] Found [X] policies, [Y] tables need policies
- [ ] Add missing policies (next phase)
- Time: 1 day | Status: Audit Complete

### Overall
- Total Time Used: 5/7 days
- Regressions: 0
- Test Coverage: Maintained
- Ready for Phase 2: YES
```

---

## 🛠️ Useful Commands Reference

```bash
# Testing
npm run test                           # Run all tests
npm run test:performance               # Performance tests only
npm run test:ui                        # Visual test UI
npm run test:coverage                  # Coverage report

# Type Checking
npm run type:check                     # Standard check
npm run type:strict                    # Strict mode check (eventual goal)

# Linting
npm run lint                           # Check for issues
npm run lint:fix                       # Auto-fix issues
npm run lint:fast                      # Fast check (dev mode)

# Building
npm run build                          # Standard build
npm run build:check                    # Full build check (type + lint + test)
npm run build:analyze                  # Analyze bundle size

# Supabase
npm run supabase:pull                  # Regenerate types after schema changes
npm run supabase:push                  # Deploy migrations
npm run supabase:status                # Check status

# Development
npm run dev                            # Start dev server
npm run dev:clean                      # Clean rebuild
npm run dev:fresh                      # Fresh install + dev

# Diagnostics
npm run health:check                   # Check environment health
npm run copilot:config                 # Check VS Code Copilot setup
npm run diagnose:terminal              # Troubleshoot terminal issues
```

---

## 🎯 Success Indicators

### Phase 1 Complete When:

```
✓ All realtime subscription hooks follow same cleanup pattern
✓ Memory profiler shows 0 leaks after 100+ re-renders
✓ .env.example exists and is documented
✓ No secrets in git history or .gitignore coverage verified
✓ RLS policies audited and documented
✓ Trading calculations consolidated into single module
✓ Performance monitoring unified under single API
✓ All tests passing (npm run test)
✓ Build succeeds without errors (npm run build)
✓ No regressions in functionality
```

---

## ⚠️ Common Issues & Solutions

### Issue: Tests fail after moving files

**Solution:**
```bash
# Clear cache and reinstall
npm run dev:fresh
npm run test
```

### Issue: Import errors after consolidation

**Solution:**
```bash
# Find all old imports
grep -r "src/lib/oldpath" src --include="*.tsx" --include="*.ts"

# Replace with new path
sed -i 's|@/lib/oldpath|@/lib/newpath|g' src/**/*.{tsx,ts}

# Verify
npm run type:check
```

### Issue: Memory leak tests failing

**Solution:**
```bash
# Check if unsubscribe is called in cleanup
code src/hooks/useRealtimeXxx.tsx

# Should have:
return () => {
  subscription?.unsubscribe?.();
};

# If missing, add it
```

### Issue: Build size increased

**Solution:**
```bash
# Analyze
npm run build:analyze

# Check if old files not deleted
git status | grep deleted

# Check for duplicate imports
grep -r "import.*from.*oldpath" src
```

---

## 📞 Need Help?

- **Architecture questions:** See [STRATEGIC_CLEANUP_PLAN.md](STRATEGIC_CLEANUP_PLAN.md) §2 (Detailed Action Items)
- **Code patterns:** Check [copilot-instructions.md](.github/copilot-instructions.md)
- **Implementation details:** Review [project_resources/rules_and_guidelines/AGENT.md](project_resources/rules_and_guidelines/AGENT.md)
- **Merge conflicts:** Use VS Code's merge conflict resolver

---

## ✅ Next Phase

Once Phase 1 complete:
1. Review this document and plan with team
2. Create next week's calendar block for Phase 2
3. Identify dependencies and blockers
4. Begin structural improvements (lib/ organization, consolidation)

**Estimated Date for Phase 1 Completion:** Feb 6, 2026 (1 week)  
**Phase 2 Start Date:** Feb 7, 2026
