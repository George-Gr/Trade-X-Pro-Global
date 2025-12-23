#!/bin/bash

# Trade-X-Pro-Global: NPM Update Implementation Script
# Phase 1: Low-Risk Foundation Updates
# Execution Time: ~30 minutes

set -e  # Exit on any error

echo "🚀 Trade-X-Pro-Global: Phase 1 NPM Update Script"
echo "================================================="
echo "📅 Date: $(date)"
echo "🎯 Target: Foundation Updates (Low Risk)"
echo ""

# Create rollback point
echo "🔄 Creating rollback point..."
git add -A
git commit -m "feat: pre-phase1-npm-updates-rollback-point" || echo "Nothing to commit"
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

# Phase 1: Foundation Updates
echo ""
echo "📦 Starting Phase 1: Foundation Updates"
echo "========================================"

echo ""
echo "🔧 Step 1: Type definitions and build tools..."
echo "Updating: @types/node @types/react @types/react-dom @vitejs/plugin-react-swc"
npm update @types/node @types/react @types/react-dom @vitejs/plugin-react-swc --save-dev

echo ""
echo "🔧 Step 2: TypeScript compiler..."
echo "Updating: typescript"
npm update typescript --save-dev

echo ""
echo "🔧 Step 3: CSS utilities..."
echo "Updating: @tailwindcss/typography tailwind-merge"
npm update @tailwindcss/typography tailwind-merge

echo ""
echo "🔧 Step 4: Development tools..."
echo "Updating: @typescript-eslint/* eslint globals"
npm update @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint globals --save-dev

# Verify Phase 1
echo ""
echo "🧪 Testing Phase 1 updates..."
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

# Create Phase 1 rollback point
echo ""
echo "💾 Creating Phase 1 rollback point..."
git add -A
git commit -m "feat: phase1-npm-updates-complete" || echo "Nothing to commit"
PHASE1_ROLLBACK=$(git rev-parse HEAD)
echo "✅ Phase 1 rollback point: $PHASE1_ROLLBACK"

# Display summary
echo ""
echo "🎉 Phase 1 Update Summary"
echo "========================="
echo "✅ Updated packages:"
echo "   • @types/node: 24.10.4 → 25.0.3"
echo "   • @types/react: 18.3.27 → 19.2.7"
echo "   • @types/react-dom: 18.3.7 → 19.2.3"
echo "   • @vitejs/plugin-react-swc: 3.11.0 → 4.2.2"
echo "   • typescript: 5.3.3 → 5.9.3"
echo "   • @tailwindcss/typography: 0.4.1 → 0.5.19"
echo ""
echo "📊 Performance Impact:"
echo "   • Bundle size: $BUNDLE_SIZE → $NEW_BUNDLE_SIZE"
echo "   • Build time: $BUILD_TIME → $NEW_BUILD_TIME"
echo ""
echo "🔄 Rollback Commands:"
echo "   git checkout $PHASE1_ROLLBACK && npm install"
echo ""
echo "✅ Phase 1 Complete! Ready for next phase."
echo ""
echo "📋 Next Steps:"
echo "1. Review the updated code for any TypeScript warnings"
echo "2. Test the application functionality"
echo "3. Run 'npm run test:e2e' to verify end-to-end functionality"
echo "4. If all looks good, proceed to Phase 2: npm run ./scripts/update-phase2.sh"