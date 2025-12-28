# 🚀 Step-by-Step Execution Plan

## Pre-Execution Setup

### 1. Backup Current State

```bash
# Create backup branch
git checkout -b cleanup-backup-$(date +%Y%m%d)

# Create Git tags for rollback points
git tag -a "pre-cleanup-$(date +%Y%m%d)" -m "State before cleanup began"

# Document current metrics
echo "## Pre-Cleanup Metrics" > cleanup-metrics.md
echo "- Date: $(date)" >> cleanup-metrics.md
npm run build 2>&1 | grep -E "dist/|built|Bundle" >> cleanup-metrics.md
echo "- Bundle analysis saved" >> cleanup-metrics.md
```

### 2. Verify Baseline Functionality

```bash
# Run full test suite
npm run test
npm run test:e2e

# Type checking
npm run type:check

# Linting
npm run lint

# Build test
npm run build

echo "✅ Baseline functionality verified"
```

---

## Phase 1: Foundation Cleanup (Week 1)

### Day 1-2: Dead Code Removal

#### Step 1.1: Remove Deprecated Components

```bash
# Check for references to DarkModeTest
grep -r "DarkModeTest" src/ --include="*.tsx" --include="*.ts"

# If no references found, delete
rm -f src/components/ui/DarkModeTest.tsx
echo "🗑️  Removed DarkModeTest.tsx"
```

#### Step 1.2: Clean Up Stub Components

```bash
# Identify stub patterns
grep -r "Minimal stub\|stub\|TODO" src/components/trading/PositionsGrid.tsx

# Review and clean up stubs
# (Manual review required - check if stubs are needed for testing)
```

#### Step 1.3: Remove Unused Imports

```bash
# Find unused imports (requires eslint-plugin-import)
npm run lint -- --fix 2>/dev/null || echo "Manual cleanup needed for unused imports"

# Manual cleanup examples:
# - Remove unused React imports
# - Remove commented-out code
# - Clean up dead variable declarations
```

**Validation:**

```bash
npm run build
npm run test
echo "✅ Phase 1.1-1.3 completed successfully"
```

### Day 3-4: Entry Point Consolidation

#### Step 1.4: Analyze App Components

```bash
# Check which App is being used
grep -r "from.*App\." src/main.tsx src/App.* --include="*.tsx" --include="*.ts"

# Compare functionality between App files
echo "=== App.tsx Lines ==="
wc -l src/App.tsx
echo "=== App.enhanced.tsx Lines ==="
wc -l src/App.enhanced.tsx
echo "=== App.router-optimized.tsx Lines ==="
wc -l src/App.router-optimized.tsx

# Analyze differences
diff -u src/App.tsx src/App.enhanced.tsx || true
```

#### Step 1.5: Consolidate App Structure

```bash
# Create consolidated App component
# (This requires manual merging of features)

# Backup original files
cp src/App.tsx src/App.backup.tsx
cp src/App.enhanced.tsx src/App.enhanced.backup.tsx
cp src/App.router-optimized.tsx src/App.router-optimized.backup.tsx

# Create consolidated version with:
# - Best features from all three files
# - Consistent error handling
# - Unified routing approach
# - Optimized performance

# Update main.tsx if needed (should remain: import App from './App')
```

#### Step 1.6: Test Consolidated App

```bash
# Verify app starts
npm run dev &
sleep 5
curl -f http://localhost:8080/ > /dev/null && echo "✅ App accessible" || echo "❌ App failed to start"

# Kill dev server
pkill -f "vite"
```

**Validation:**

```bash
npm run build
npm run test
echo "✅ Phase 1.4-1.6 completed successfully"
```

### Day 5: Route Configuration Unification

#### Step 1.7: Extract Routes to Configuration

```bash
# Backup current App.tsx
cp src/App.tsx src/App.pre-route-cleanup.tsx

# Move all routes to routesConfig.tsx
# (Manual extraction required)

# Verify all routes are covered
echo "=== Route Coverage Check ==="
grep -c "<Route" src/routes/routesConfig.tsx
grep -c "<Route" src/App.tsx  # Should be minimal now
```

#### Step 1.8: Update App.tsx

```typescript
// Update src/App.tsx to use consolidated routes
import { AppRoutes } from './routes/routesConfig';

// Replace all inline routes with:
<AppRoutes />;
```

**Validation:**

```bash
npm run build
npm run dev
# Test navigation to all major routes:
# /, /login, /register, /dashboard, /trade, /portfolio, /history
echo "✅ Phase 1.7-1.8 completed successfully"
```

---

## Phase 2: Dependency Optimization (Week 2-3)

### Week 2: Dependency Audit and Removal

#### Step 2.1: Analyze Current Dependencies

```bash
# Generate dependency tree
npm ls --depth=0 > current-dependencies.txt

# Check for unused dependencies
npx depcheck > unused-dependencies.txt

# Analyze bundle composition
npm run build:analyze
```

#### Step 2.2: Remove Redundant Validation Library (yup)

```bash
# Find yup usage
grep -r "yup\|from.*yup" src/ --include="*.tsx" --include="*.ts" > yup-usage.txt

# Convert yup schemas to zod (manual process)
# Update imports from 'yup' to 'zod'
# Update validation logic

# Remove yup from package.json
npm uninstall yup

# Update package.json manually:
# Remove "yup": "^1.7.1" line
```

#### Step 2.3: Chart Library Consolidation

```bash
# Analyze chart usage
grep -r "recharts\|from.*recharts" src/ --include="*.tsx" --include="*.ts" > recharts-usage.txt
grep -r "lightweight-charts\|from.*lightweight-charts" src/ --include="*.tsx" --include="*.ts" > lightweight-usage.txt

# Decide on consolidation strategy:
# - Keep lightweight-charts for trading charts
# - Replace recharts if possible
# - Remove unused chart components

# Update components accordingly
```

**Validation:**

```bash
npm run build
npm run test
# Verify all forms and charts work correctly
echo "✅ Week 2 completed successfully"
```

### Week 3: Import Optimization and Build Configuration

#### Step 2.4: Optimize Imports

```bash
# Find broad imports to optimize
grep -r "import React" src/ --include="*.tsx" --include="*.ts" | head -10

# Batch update common patterns:
# React → Specific React imports
# Lodash → Specific lodash functions
# Radix → Specific component imports

# Example batch updates:
find src/ -name "*.tsx" -exec sed -i '' 's/import React, {/import {/g' {} \;
find src/ -name "*.tsx" -exec sed -i '' 's/} from "react";//g' {} \;
find src/ -name "*.tsx" -exec sed -i '' 's/import React from "react";//g' {} \;
```

#### Step 2.5: Simplify Vite Configuration

```bash
# Backup current config
cp vite.config.ts vite.config.backup.ts

# Simplify configuration:
# - Remove over-engineered bundle monitoring
# - Simplify plugin configurations
# - Reduce chunk splitting complexity

# Target: Reduce from 620 lines to <200 lines
echo "Original: $(wc -l < vite.config.ts) lines"
# After simplification: should be ~150-180 lines
```

**Validation:**

```bash
npm run build
# Measure build time improvement
time npm run build 2>&1 | grep -E "built|completed|✓"
echo "✅ Week 3 completed successfully"
```

---

## Phase 3: Architecture Refinement (Week 4)

### Day 1-2: Context Provider Optimization

#### Step 3.1: Analyze Context Dependencies

```bash
# Find all context usage
grep -r "createContext\|useContext" src/ --include="*.tsx" --include="*.ts" > context-usage.txt

# Map context interdependencies
grep -r "useContext.*Context" src/ --include="*.tsx" --include="*.ts" | cut -d: -f2 | sort | uniq
```

#### Step 3.2: Consolidate Contexts

```bash
# Create consolidated contexts:
# - Merge AccessibilityContext + ViewModeContext
# - Keep LoadingContext and NotificationContext separate
# - Extract business logic to hooks

# Backup original contexts
cp -r src/contexts src/contexts.backup

# Implement consolidation (manual process)
```

#### Step 3.3: Update Context Providers

```typescript
// Update App.tsx to use consolidated providers
// Reduce provider nesting from 6+ to 3-4 essential providers
```

**Validation:**

```bash
npm run build
npm run test
# Verify no context dependency cycles
echo "✅ Day 1-2 completed successfully"
```

### Day 3-4: Hook Organization

#### Step 3.4: Create Hook Categories

```bash
# Create organized structure
mkdir -p src/hooks/{core,trading,ui,data,utils}

# Move hooks to appropriate directories:
mv src/hooks/useAuth.tsx src/hooks/core/
mv src/hooks/useTradingData.ts src/hooks/core/
mv src/hooks/useOrderExecution.tsx src/hooks/trading/
# ... continue for all hooks
```

#### Step 3.5: Update Hook Index

```typescript
// Update src/hooks/index.ts to export from new structure
export { useAuth } from './core/useAuth';
export { useTradingData } from './core/useTradingData';
// ... update all exports
```

#### Step 3.6: Update All Imports

```bash
# Find and update all hook imports
grep -r "from.*hooks/" src/ --include="*.tsx" --include="*.ts" > hook-imports.txt

# Update imports to new structure:
# Before: import { useAuth } from '@/hooks/useAuth';
# After:  import { useAuth } from '@/hooks/core/useAuth';
```

**Validation:**

```bash
npm run build
npm run lint
# Verify no broken hook imports
echo "✅ Day 3-4 completed successfully"
```

### Day 5: Component Structure Improvement

#### Step 3.7: Identify Large Components

```bash
# Find components that need splitting
find src/components -name "*.tsx" -exec wc -l {} \; | sort -nr | head -10
```

#### Step 3.8: Extract Business Logic

```bash
# Move business logic from components to custom hooks
# Split large components (>200 lines) into smaller, focused components
# Improve separation of concerns

# Examples:
# - Extract trading logic from trading components
# - Separate data fetching from presentation
# - Create reusable UI components
```

**Validation:**

```bash
npm run build
npm run test
# Verify all functionality preserved
echo "✅ Week 4 completed successfully"
```

---

## Final Validation and Metrics

### Step 4.1: Comprehensive Testing

```bash
# Run full test suite
npm run test
npm run test:e2e

# Type safety check
npm run type:check

# Linting check
npm run lint

# Build test
npm run build

# Performance comparison
time npm run build > post-cleanup-build.txt 2>&1
```

### Step 4.2: Measure Improvements

```bash
# Compare metrics
echo "## Post-Cleanup Metrics" >> cleanup-metrics.md
echo "- Date: $(date)" >> cleanup-metrics.md
npm run build 2>&1 | grep -E "dist/|built|Bundle" >> cleanup-metrics.md

# File count comparison
echo "## File Count Changes" >> cleanup-metrics.md
find src -name "*.tsx" -o -name "*.ts" | wc -l >> cleanup-metrics.md

# Bundle size comparison
ls -lah dist/assets/*.js | awk '{sum+=$5} END {print "Total JS size:", sum/1024/1024 "MB"}' >> cleanup-metrics.md
```

### Step 4.3: Final Tag and Documentation

```bash
# Tag completion
git tag -a "cleanup-complete-$(date +%Y%m%d)" -m "Repository cleanup completed successfully"

# Generate final report
echo "# Cleanup Results" > CLEANUP_RESULTS.md
echo "- Started: $(head -2 cleanup-metrics.md | tail -1)" >> CLEANUP_RESULTS.md
echo "- Completed: $(date)" >> CLEANUP_RESULTS.md
echo "- Files changed: $(git diff --name-only | wc -l)" >> CLEANUP_RESULTS.md
echo "- Bundle size: Check dist/ directory" >> CLEANUP_RESULTS.md

cat CLEANUP_RESULTS.md
```

---

## Rollback Procedures

### Emergency Rollback Commands

```bash
# If something goes wrong, rollback to specific tag
git reset --hard pre-cleanup-YYYYMMDD
git reset --hard cleanup-phase-1
git reset --hard cleanup-phase-2
git reset --hard cleanup-complete-YYYYMMDD

# Or rollback specific file
git checkout HEAD~1 -- src/App.tsx
git checkout HEAD~1 -- package.json
git checkout HEAD~1 -- vite.config.ts
```

### Gradual Rollback

```bash
# If only part of a phase failed
git stash  # Save current changes
git checkout cleanup-phase-1  # Go back to last good state
# Fix the issue, then continue
```

---

## Success Checklist

### ✅ Phase 1 Completion

- [ ] Dead code removed
- [ ] App components consolidated
- [ ] Routes unified
- [ ] All tests passing
- [ ] No import errors

### ✅ Phase 2 Completion

- [ ] Redundant dependencies removed
- [ ] Imports optimized
- [ ] Build configuration simplified
- [ ] Bundle size reduced by 15-25%
- [ ] Build time improved by 20-30%

### ✅ Phase 3 Completion

- [ ] Context providers consolidated
- [ ] Hooks organized
- [ ] Components improved
- [ ] No functional regressions
- [ ] Code organization improved

### ✅ Final Validation

- [ ] All core functionality preserved
- [ ] Performance benchmarks met
- [ ] Developer experience improved
- [ ] Technical debt reduced
- [ ] Documentation updated

---

## Communication Plan

### Team Updates

```bash
# Daily progress updates
echo "## Daily Cleanup Progress" > daily-progress.md
date >> daily-progress.md
# Add accomplishments, issues, next steps
```

### Stakeholder Notification

- **Start**: Notify team of cleanup beginning
- **Mid-point**: Report progress and any issues
- **Completion**: Present results and benefits

### Documentation Updates

- Update README.md with new structure
- Update contributing guidelines
- Document new development workflow
- Create cleanup success metrics report

---

This execution plan provides concrete, actionable steps for transforming the Trade X Pro Global codebase from its current complex state to a leaner, more maintainable system while preserving all functionality and improving developer experience.
