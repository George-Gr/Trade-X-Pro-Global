#!/usr/bin/env node

/**
 * Order Execution Testing Suite Runner
 * 
 * Comprehensive test runner for the Order Execution System testing suite
 * Includes unit tests, integration tests, and E2E validation
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(80));
}

function runCommand(command, description) {
  try {
    log(`\n🧪 Running ${description}...`, colors.yellow);
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, colors.green);
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed:`, colors.red);
    log(error.message, colors.red);
    if (error.stdout) {
      log('Output:', colors.yellow);
      log(error.stdout, colors.yellow);
    }
    return { success: false, error: error.message };
  }
}

function main() {
  logSection('🚀 Order Execution Testing Suite');
  log('Comprehensive validation of the Order Execution System', colors.cyan);
  
  const startTime = Date.now();
  const results = {
    unit: null,
    integration: null,
    e2e: null,
    linting: null,
    typeCheck: null,
  };

  try {
    // 1. Type checking
    logSection('🔍 Type Checking');
    results.typeCheck = runCommand('npm run type:check', 'TypeScript type validation');
    
    // 2. Linting
    logSection('📋 Code Linting');
    results.linting = runCommand('npm run lint:fast', 'ESLint code quality checks');
    
    // 3. Unit Tests
    logSection('🧪 Unit Tests');
    results.unit = runCommand(
      'npm run test -- --run src/__tests__/order-execution/unit/orderExecutionFlow.test.ts',
      'Unit tests for order execution flow'
    );
    
    // 4. Integration Tests
    logSection('🔗 Integration Tests');
    results.integration = runCommand(
      'npm run test -- --run src/__tests__/order-execution/integration/edgeFunctionIntegration.test.ts',
      'Integration tests for Edge Function'
    );
    
    // 5. E2E Tests (if Playwright is configured)
    logSection('🎭 End-to-End Tests');
    results.e2e = runCommand(
      'npm run test:e2e -- src/__tests__/order-execution/e2e/completeTradingWorkflow.test.ts',
      'End-to-end tests for complete trading workflow'
    );
    
    // 6. Test Coverage Report
    logSection('📊 Test Coverage');
    results.coverage = runCommand(
      'npm run test -- --coverage',
      'Test coverage analysis'
    );
    
  } catch (error) {
    log(`❌ Test suite execution failed: ${error.message}`, colors.red);
    process.exit(1);
  }
  
  const endTime = Date.now();
  const totalTime = Math.round((endTime - startTime) / 1000);
  
  // Summary Report
  logSection('📋 Test Results Summary');
  
  const testSuites = [
    { name: 'Type Checking', result: results.typeCheck },
    { name: 'Code Linting', result: results.linting },
    { name: 'Unit Tests', result: results.unit },
    { name: 'Integration Tests', result: results.integration },
    { name: 'E2E Tests', result: results.e2e },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testSuites.forEach(({ name, result }) => {
    if (result?.success) {
      log(`✅ ${name}: PASSED`, colors.green);
      passed++;
    } else {
      log(`❌ ${name}: FAILED`, colors.red);
      failed++;
    }
  });
  
  logSection('🎯 Final Results');
  log(`Total execution time: ${totalTime} seconds`, colors.cyan);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, colors.red);
  
  if (failed === 0) {
    log('\n🎉 All tests passed! The Order Execution System is ready for production.', colors.bright + colors.green);
    process.exit(0);
  } else {
    log(`\n⚠️  ${failed} test suite(s) failed. Please review the errors above.`, colors.bright + colors.red);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

module.exports = { main, runCommand };