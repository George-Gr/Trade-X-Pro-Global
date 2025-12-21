#!/bin/bash
# Deployment Verification Script
# Run this before and after production deployment to verify application health

set -e

echo "🔍 Trade-X-Pro Deployment Verification Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    return 0
  else
    echo -e "${RED}✗${NC} $2"
    return 1
  fi
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

echo "📋 PRE-DEPLOYMENT CHECKS"
echo ""

# 1. Check Git Status
echo "1. Checking Git status..."
if git status | grep -q "nothing to commit"; then
  check 0 "Git working directory clean"
else
  check 1 "Git working directory has uncommitted changes"
fi

# 2. Check Branch
echo ""
echo "2. Checking current branch..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  check 0 "On main branch"
else
  check 1 "Not on main branch (on: $BRANCH)"
fi

# 3. Check Recent Commits
echo ""
echo "3. Checking recent commits..."
git log --oneline | head -3
echo ""

# 4. Check Package Installation
echo "4. Checking npm packages..."
if [ -d "node_modules" ]; then
  check 0 "node_modules directory exists"
else
  check 1 "node_modules directory missing"
  warn "Run: npm ci --production"
fi

# 5. Check Build Artifacts
echo ""
echo "5. Checking build artifacts..."
if [ -d "dist" ]; then
  SIZE=$(du -sh dist | cut -f1)
  check 0 "dist directory exists (size: $SIZE)"
  
  if [ -f "dist/index.html" ]; then
    check 0 "dist/index.html exists"
  else
    check 1 "dist/index.html missing"
  fi
else
  check 1 "dist directory missing"
  warn "Run: npm run build:production"
fi

# 6. Check Package Versions
echo ""
echo "6. Checking updated package versions..."
echo ""

check_version() {
  local PACKAGE=$1
  local EXPECTED=$2
  local ACTUAL=$(npm list $PACKAGE 2>/dev/null | grep $PACKAGE | head -1 | awk '{print $NF}' | tr -d '()')
  
  if [[ "$ACTUAL" == "$EXPECTED"* ]]; then
    check 0 "$PACKAGE: $ACTUAL"
    return 0
  else
    check 1 "$PACKAGE: Expected $EXPECTED, got $ACTUAL"
    return 1
  fi
}

check_version "@sentry/react" "10.30"
check_version "tailwindcss" "4.1.18"
check_version "react-hook-form" "7.68"
check_version "@supabase/supabase-js" "2.87"

# 7. TypeScript Check
echo ""
echo "7. Checking TypeScript compilation..."
if npm run build 2>&1 | grep -q "error"; then
  check 1 "TypeScript errors found"
else
  check 0 "No TypeScript errors"
fi

# 8. Lint Check
echo ""
echo "8. Checking linting..."
LINT_RESULT=$(npm run lint 2>&1 | tail -1)
if echo "$LINT_RESULT" | grep -q "0 errors"; then
  check 0 "No linting errors"
elif echo "$LINT_RESULT" | grep -q "error"; then
  check 1 "Linting errors found"
else
  warn "Could not determine lint status"
fi

# 9. Bundle Size
echo ""
echo "9. Checking bundle size..."
if [ -f "dist/assets/index-*.js" ]; then
  # Find the main bundle
  BUNDLE=$(find dist/assets -name "index-*.js" | head -1)
  if [ -n "$BUNDLE" ]; then
    SIZE=$(ls -lh "$BUNDLE" | awk '{print $5}')
    GZIP_SIZE=$(gzip -c "$BUNDLE" | wc -c | awk '{print int($1/1024) "K"}')
    check 0 "Main bundle: $SIZE (gzip: ~$GZIP_SIZE)"
  fi
else
  warn "Could not locate main bundle for size check"
fi

# 10. Environment Variables
echo ""
echo "10. Checking environment variables..."
if [ -f ".env.local" ]; then
  if grep -q "VITE_SUPABASE_URL" .env.local; then
    check 0 ".env.local contains VITE_SUPABASE_URL"
  else
    check 1 ".env.local missing VITE_SUPABASE_URL"
  fi
  
  if grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" .env.local; then
    check 0 ".env.local contains VITE_SUPABASE_PUBLISHABLE_KEY"
  else
    check 1 ".env.local missing VITE_SUPABASE_PUBLISHABLE_KEY"
  fi
else
  warn ".env.local not found (may be configured via CI/CD)"
fi

echo ""
echo "=============================================="
echo "✅ PRE-DEPLOYMENT VERIFICATION COMPLETE"
echo ""
echo "📝 Deployment Checklist:"
echo "   [ ] All checks above show ✓"
echo "   [ ] Build completes without errors"
echo "   [ ] Bundle size is ~112 kB (gzip)"
echo "   [ ] Environment variables configured"
echo "   [ ] Team approval received"
echo "   [ ] Rollback plan documented"
echo ""
echo "🚀 Ready to deploy!"
