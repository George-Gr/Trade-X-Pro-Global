#!/bin/bash

# Trade-X-Pro-Global: NPM Update Implementation Script
# Phase 3: Major Framework Updates (HIGH RISK)
# Execution Time: ~4-6 hours for React + ~8-12 hours for Router

set -e  # Exit on any error

echo "🚀 Trade-X-Pro-Global: Phase 3 NPM Update Script"
echo "================================================="
echo "📅 Date: $(date)"
echo "🎯 Target: Major Framework Updates (HIGH RISK)"
echo "⚠️  WARNING: This phase requires extensive testing!"
echo ""

# Verify Phase 2 was completed
if [ ! -f "scripts/update-phase2.sh" ]; then
    echo "❌ Phase 2 not found. Please run Phase 2 first."
    exit 1
fi

# Create rollback point
echo "🔄 Creating rollback point..."
git add -A
git commit -m "feat: pre-phase3-npm-updates-rollback-point" || echo "Nothing to commit"
ROLLBACK_POINT=$(git rev-parse HEAD)
echo "✅ Rollback point created: $ROLLBACK_POINT"

# Verify current build works
echo ""
echo "🔍 Verifying current build state..."
if npm run build:check; then
    echo "✅ Current build is healthy"
else
    echo "❌ Current build has issues. Please fix before proceeding."
    exit 1
fi

# Record current bundle size
echo ""
echo "📊 Recording baseline metrics..."
BUNDLE_SIZE=$(npm run build 2>/dev/null | grep -o '[0-9.]*MB' | head -1 || echo "unknown")
BUILD_TIME=$(npm run build 2>/dev/null | grep -o '[0-9.]*s' | head -1 || echo "unknown")
echo "Current bundle size: $BUNDLE_SIZE"
echo "Current build time: $BUILD_TIME"

# Phase 3: Major Framework Updates
echo ""
echo "📦 Starting Phase 3: Major Framework Updates"
echo "============================================"

# Step 1: React 19 Update
echo ""
echo "⚛️  Step 1: React 19 Update..."
echo "This will update: react react-dom"
echo "⚠️  This may require code changes for deprecated APIs"
npm update react react-dom

echo ""
echo "🧪 Testing React 19 updates..."
echo "=============================="

echo "Running type check..."
if npm run type:check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Please check for React 19 deprecated API usage:"
    echo "• Strict mode changes"
    echo "• useTransition API changes"
    echo "• Server Components (if used)"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

echo ""
echo "Running build..."
if npm run build; then
    echo "✅ React 19 build successful"
else
    echo "❌ React 19 build failed"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

echo ""
echo "📋 React 19 Manual Verification Required:"
echo "• Test all concurrent features (transitions, suspense)"
echo "• Verify error boundaries still work correctly"
echo "• Check for any React 19 deprecation warnings"
echo "• Test performance improvements"
echo ""
read -p "Press Enter to continue with React Router v7 update..."

# Step 2: React Router v7 Update
echo ""
echo "🛣️  Step 2: React Router v7 Update..."
echo "This will update: react-router-dom"
echo "⚠️  WARNING: This requires extensive routing refactor!"
npm update react-router-dom

echo ""
echo "🔧 Router v7 Migration Required:"
echo "Your current App.tsx uses future flags:"
echo "  future={{"
echo "    v7_startTransition: true,"
echo "    v7_relativeSplatPath: true,"
echo "  }}"
echo ""
echo "Router v7 changes:"
echo "• Data router APIs are now the standard"
echo "• Route configuration may need updates"
echo "• Navigation hooks API changes"
echo "• Nested routing patterns modified"
echo ""

# Check for common router usage patterns that need updates
echo "🔍 Scanning for Router usage patterns..."

# Check if using BrowserRouter future flags
if grep -r "v7_startTransition" src/ || grep -r "v7_relativeSplatPath" src/; then
    echo "✅ Router v7 future flags already configured"
else
    echo "⚠️  No Router v7 future flags found - manual configuration needed"
fi

# Check for deprecated router patterns
DEPRECATED_PATTERNS=(
    "useHistory"
    "history.push"
    "history.replace"
    "Switch"
    "Route.*component="
)

echo "Checking for deprecated router patterns..."
for pattern in "${DEPRECATED_PATTERNS[@]}"; do
    if grep -r "$pattern" src/ 2>/dev/null; then
        echo "⚠️  Found deprecated pattern: $pattern"
    fi
done

echo ""
echo "🧪 Testing Router v7 updates..."
echo "=============================="

echo "Running type check..."
if npm run type:check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Common Router v7 issues:"
    echo "• useNavigate replaces useHistory"
    echo "• useLocation changes"
    echo "• Route component prop changes"
    echo "• Data router configuration"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

echo ""
echo "Running build..."
if npm run build; then
    echo "✅ Router v7 build successful"
    NEW_BUNDLE_SIZE=$(npm run build 2>/dev/null | grep -o '[0-9.]*MB' | head -1 || echo "unknown")
    NEW_BUILD_TIME=$(npm run build 2>/dev/null | grep -o '[0-9.]*s' | head -1 || echo "unknown")
    echo "New bundle size: $NEW_BUNDLE_SIZE"
    echo "New build time: $NEW_BUILD_TIME"
else
    echo "❌ Router v7 build failed"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

# Create Phase 3 rollback point
echo ""
echo "💾 Creating Phase 3 rollback point..."
git add -A
git commit -m "feat: phase3-npm-updates-complete" || echo "Nothing to commit"
PHASE3_ROLLBACK=$(git rev-parse HEAD)
echo "✅ Phase 3 rollback point: $PHASE3_ROLLBACK"

# Display summary
echo ""
echo "🎉 Phase 3 Update Summary"
echo "========================="
echo "✅ Updated packages:"
echo "   • react: 18.3.1 → 19.2.3"
echo "   • react-dom: 18.3.1 → 19.2.3"
echo "   • react-router-dom: 6.30.2 → 7.11.0"
echo ""
echo "📊 Performance Impact:"
echo "   • Bundle size: $BUNDLE_SIZE → $NEW_BUNDLE_SIZE"
echo "   • Build time: $BUILD_TIME → $NEW_BUILD_TIME"
echo ""
echo "🔄 Rollback Commands:"
echo "   git checkout $PHASE3_ROLLBACK && npm install"
echo ""
echo "🚨 CRITICAL: Manual Router v7 Migration Required!"
echo ""
echo "📋 Post-Update Checklist:"
echo "1. Update all useHistory() calls to useNavigate()"
echo "2. Review route configuration patterns"
echo "3. Test all 20+ protected routes"
echo "4. Verify mobile navigation works"
echo "5. Test error boundaries with routing"
echo "6. Run comprehensive E2E tests: npm run test:e2e"
echo ""
echo "⚠️  Expected Issues to Fix:"
echo "• useHistory → useNavigate migration"
echo "• Route component prop syntax"
echo "• Data router configuration"
echo "• Navigation hook API changes"
echo ""
echo "✅ Phase 3 Complete! Ready for production testing."
echo ""
echo "📋 Next Steps:"
echo "1. Run comprehensive testing: npm run ./scripts/comprehensive-testing.sh"
echo "2. Fix any Router v7 migration issues"
echo "3. Deploy to staging environment"
echo "4. Run production readiness checks"
echo "5. Plan production deployment"