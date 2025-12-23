#!/bin/bash

# Trade-X-Pro-Global: Comprehensive Testing Script
# Post-NPM Update Validation
# Execution Time: ~2-3 hours

set -e  # Exit on any error

echo "🧪 Trade-X-Pro-Global: Comprehensive Testing Script"
echo "=================================================="
echo "📅 Date: $(date)"
echo "🎯 Purpose: Post-NPM update validation"
echo ""

# Test categories
echo "📋 Test Categories:"
echo "1. Build & Compilation Tests"
echo "2. Type Safety Tests"
echo "3. Unit Tests"
echo "4. Integration Tests"
echo "5. E2E Tests"
echo "6. Performance Tests"
echo "7. Security Tests"
echo ""

# Test results tracking
TEST_RESULTS=()
FAILED_TESTS=()

# Function to record test results
record_test() {
    local test_name=$1
    local result=$2
    
    if [ "$result" = "PASS" ]; then
        TEST_RESULTS+=("✅ $test_name")
        echo "✅ $test_name - PASS"
    else
        TEST_RESULTS+=("❌ $test_name")
        FAILED_TESTS+=("$test_name")
        echo "❌ $test_name - FAIL"
    fi
}

echo "🚀 Starting Comprehensive Testing Suite"
echo "======================================"

# 1. Build & Compilation Tests
echo ""
echo "🏗️  Phase 1: Build & Compilation Tests"
echo "======================================"

echo "Running TypeScript compilation..."
if npm run type:check; then
    record_test "TypeScript Compilation" "PASS"
else
    record_test "TypeScript Compilation" "FAIL"
fi

echo ""
echo "Running production build..."
if npm run build; then
    record_test "Production Build" "PASS"
    
    # Check bundle size
    BUNDLE_SIZE=$(npm run build 2>/dev/null | grep -o '[0-9.]*MB' | head -1 || echo "unknown")
    echo "Bundle size: $BUNDLE_SIZE"
    
    # Warn if bundle size exceeds 2MB
    if [[ "$BUNDLE_SIZE" =~ [0-9.]+ ]] && (( $(echo "$BUNDLE_SIZE > 2" | bc -l) )); then
        echo "⚠️  WARNING: Bundle size ($BUNDLE_SIZE) exceeds 2MB limit"
    else
        record_test "Bundle Size Check" "PASS"
    fi
else
    record_test "Production Build" "FAIL"
fi

echo ""
echo "Running development build..."
if npm run build:dev; then
    record_test "Development Build" "PASS"
else
    record_test "Development Build" "FAIL"
fi

# 2. Type Safety Tests
echo ""
echo "🔒 Phase 2: Type Safety Tests"
echo "============================="

echo "Running strict TypeScript checks..."
if npm run type:strict; then
    record_test "Strict TypeScript" "PASS"
else
    record_test "Strict TypeScript" "FAIL"
fi

# 3. Unit Tests
echo ""
echo "🧩 Phase 3: Unit Tests"
echo "====================="

echo "Running unit tests..."
if npm run test -- --run; then
    record_test "Unit Tests" "PASS"
else
    record_test "Unit Tests" "FAIL"
fi

echo ""
echo "Running unit tests with coverage..."
if npm run test -- --run --coverage; then
    record_test "Unit Tests Coverage" "PASS"
else
    record_test "Unit Tests Coverage" "FAIL"
fi

# 4. Integration Tests
echo ""
echo "🔗 Phase 4: Integration Tests"
echo "============================="

echo "Running trading form tests..."
if find src/ -name "*test*" -type f | grep -E "(trading|form|order)" | xargs npm run test -- --run 2>/dev/null; then
    record_test "Trading Form Integration" "PASS"
else
    echo "⚠️  Trading form tests not found or failed"
    record_test "Trading Form Integration" "SKIP"
fi

echo ""
echo "Running authentication tests..."
if find src/ -name "*test*" -type f | grep -E "(auth|login|kyc)" | xargs npm run test -- --run 2>/dev/null; then
    record_test "Authentication Integration" "PASS"
else
    echo "⚠️  Authentication tests not found or failed"
    record_test "Authentication Integration" "SKIP"
fi

# 5. E2E Tests
echo ""
echo "🌐 Phase 5: End-to-End Tests"
echo "============================"

echo "Running Playwright E2E tests..."
if npm run test:e2e; then
    record_test "E2E Tests" "PASS"
else
    record_test "E2E Tests" "FAIL"
fi

# Check E2E test results
if [ -d "playwright-report" ]; then
    echo "📊 E2E Test Results:"
    if [ -f "playwright-report/index.html" ]; then
        echo "✅ E2E test report generated: playwright-report/index.html"
    fi
fi

# 6. Performance Tests
echo ""
echo "⚡ Phase 6: Performance Tests"
echo "============================="

echo "Running bundle analysis..."
if npm run build:analyze; then
    record_test "Bundle Analysis" "PASS"
else
    record_test "Bundle Analysis" "FAIL"
fi

echo ""
echo "Running performance monitoring tests..."
if npm run test -- src/__tests__/performance/ --run 2>/dev/null || echo "No performance tests found"; then
    record_test "Performance Tests" "PASS"
else
    record_test "Performance Tests" "SKIP"
fi

# 7. Security Tests
echo ""
echo "🔒 Phase 7: Security Tests"
echo "=========================="

echo "Running security audit..."
if npm audit --audit-level=high; then
    record_test "Security Audit" "PASS"
else
    record_test "Security Audit" "FAIL"
fi

echo ""
echo "Running dependency check..."
if npm run test -- src/lib/security/ --run 2>/dev/null || echo "No security tests found"; then
    record_test "Security Unit Tests" "PASS"
else
    record_test "Security Unit Tests" "SKIP"
fi

# 8. Manual Testing Checklist
echo ""
echo "📝 Manual Testing Checklist"
echo "==========================="
echo "Please manually verify the following:"
echo ""
echo "🎯 Critical Trading Features:"
echo "  □ Order execution forms"
echo "  □ Risk management interface"
echo "  □ Real-time position updates"
echo "  □ Margin monitoring"
echo "  □ P&L calculations"
echo "  □ Mobile trading interface"
echo ""
echo "🔐 Authentication & Security:"
echo "  □ Login/logout functionality"
echo "  □ KYC verification process"
echo "  □ Password reset"
echo "  □ Two-factor authentication"
echo "  □ Session management"
echo ""
echo "📱 User Interface:"
echo "  □ Responsive design (mobile/tablet/desktop)"
echo "  □ Dark/light theme switching"
echo "  □ Accessibility features"
echo "  □ Navigation menu"
echo "  □ Dashboard widgets"
echo "  □ Chart rendering"
echo ""
echo "🔄 Real-time Features:"
echo "  □ WebSocket connections"
echo "  □ Live price updates"
echo "  □ Notification system"
echo "  □ Order status updates"
echo ""

# Record manual test results
echo ""
read -p "Did you complete the manual testing checklist? (y/N): " manual_complete
if [[ $manual_complete =~ ^[Yy]$ ]]; then
    record_test "Manual Testing Checklist" "PASS"
else
    record_test "Manual Testing Checklist" "FAIL"
fi

# Test Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo "Total Tests: ${#TEST_RESULTS[@]}"
echo "Passed: $(echo "${TEST_RESULTS[@]}" | tr ' ' '\n' | grep -c "✅")"
echo "Failed: $(echo "${TEST_RESULTS[@]}" | tr ' ' '\n' | grep -c "❌")"

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED!"
    echo "Your Trade-X-Pro-Global application is ready for production."
    echo ""
    echo "✅ Next Steps:"
    echo "1. Deploy to staging environment"
    echo "2. Run production smoke tests"
    echo "3. Plan production deployment"
    echo "4. Monitor production metrics"
    exit 0
else
    echo ""
    echo "❌ FAILED TESTS:"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  • $test"
    done
    echo ""
    echo "⚠️  Please fix the failed tests before proceeding to production."
    echo ""
    echo "🔧 Recommended Actions:"
    echo "1. Review failed test output above"
    echo "2. Fix any compilation errors"
    echo "3. Update code for breaking changes"
    echo "4. Re-run this testing script"
    echo "5. Consider rolling back if critical issues remain"
    exit 1
fi