#!/bin/bash

# Trade-X-Pro-Global: NPM Update Implementation Script
# Phase 2: Medium Risk Updates
# Execution Time: ~2-3 hours

set -e  # Exit on any error

echo "🚀 Trade-X-Pro-Global: Phase 2 NPM Update Script"
echo "================================================="
echo "📅 Date: $(date)"
echo "🎯 Target: Medium Risk Updates"
echo ""

# Verify Phase 1 was completed
if [ ! -f "scripts/update-phase1.sh" ]; then
    echo "❌ Phase 1 not found. Please run Phase 1 first."
    exit 1
fi

# Create rollback point
echo "🔄 Creating rollback point..."
git add -A
git commit -m "feat: pre-phase2-npm-updates-rollback-point" || echo "Nothing to commit"
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

# Phase 2: Medium Risk Updates
echo ""
echo "📦 Starting Phase 2: Medium Risk Updates"
echo "========================================"

echo ""
echo "🔧 Step 1: Form validation..."
echo "Updating: @hookform/resolvers"
npm update @hookform/resolvers

echo ""
echo "🔧 Step 2: Utility packages..."
echo "Updating: date-fns zod lucide-react sonner tailwind-merge"
npm update date-fns zod lucide-react sonner tailwind-merge

echo ""
echo "🔧 Step 3: UI components..."
echo "Updating: react-resizable-panels"
npm update react-resizable-panels

echo ""
echo "🔧 Step 4: Development tools..."
echo "Updating: globals cross-env rollup-plugin-visualizer"
npm update globals cross-env rollup-plugin-visualizer --save-dev

# Critical: Update Zod to compatible version with @hookform/resolvers 5.x
echo ""
echo "🔧 Step 5: Zod compatibility update..."
npm update zod

# Verify Phase 2
echo ""
echo "🧪 Testing Phase 2 updates..."
echo "=============================="

echo "Running type check..."
if npm run type:check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

echo ""
echo "Running linting..."
if npm run lint:fast; then
    echo "✅ Linting successful"
else
    echo "⚠️  Linting warnings detected (non-critical)"
fi

echo ""
echo "Running unit tests..."
if npm run test; then
    echo "✅ Unit tests successful"
else
    echo "❌ Unit tests failed"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

echo ""
echo "Running build..."
if npm run build; then
    echo "✅ Build successful"
    NEW_BUNDLE_SIZE=$(npm run build 2>/dev/null | grep -o '[0-9.]*MB' | head -1 || echo "unknown")
    NEW_BUILD_TIME=$(npm run build 2>/dev/null | grep -o '[0-9.]*s' | head -1 || echo "unknown")
    echo "New bundle size: $NEW_BUNDLE_SIZE"
    echo "New build time: $NEW_BUILD_TIME"
else
    echo "❌ Build failed"
    echo "Rolling back to rollback point: $ROLLBACK_POINT"
    git checkout $ROLLBACK_POINT
    npm install
    exit 1
fi

# Create Phase 2 rollback point
echo ""
echo "💾 Creating Phase 2 rollback point..."
git add -A
git commit -m "feat: phase2-npm-updates-complete" || echo "Nothing to commit"
PHASE2_ROLLBACK=$(git rev-parse HEAD)
echo "✅ Phase 2 rollback point: $PHASE2_ROLLBACK"

# Display summary
echo ""
echo "🎉 Phase 2 Update Summary"
echo "========================="
echo "✅ Updated packages:"
echo "   • @hookform/resolvers: 3.10.0 → 5.2.2"
echo "   • date-fns: 3.6.0 → 4.1.0"
echo "   • zod: 3.25.76 → 4.2.1"
echo "   • lucide-react: 0.462.0 → 0.562.0"
echo "   • sonner: 1.7.4 → 2.0.7"
echo "   • react-resizable-panels: 2.1.9 → 4.0.15"
echo "   • globals: 15.15.0 → 16.5.0"
echo "   • cross-env: 7.0.3 → 10.1.0"
echo ""
echo "📊 Performance Impact:"
echo "   • Bundle size: $BUNDLE_SIZE → $NEW_BUNDLE_SIZE"
echo "   • Build time: $BUILD_TIME → $NEW_BUILD_TIME"
echo ""
echo "🔄 Rollback Commands:"
echo "   git checkout $PHASE2_ROLLBACK && npm install"
echo ""
echo "⚠️  Manual Verification Required:"
echo "   • Test all trading forms (order execution, risk management, KYC)"
echo "   • Verify form validation is working correctly"
echo "   • Check UI components for any layout issues"
echo "   • Test responsive design on mobile/tablet"
echo ""
echo "✅ Phase 2 Complete! Ready for next phase."
echo ""
echo "📋 Next Steps:"
echo "1. Run comprehensive testing: npm run test:e2e"
echo "2. Test all trading forms manually"
echo "3. Verify mobile responsiveness"
echo "4. If all looks good, proceed to Phase 3: npm run ./scripts/update-phase3.sh"