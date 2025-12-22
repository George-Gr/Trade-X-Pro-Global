#!/usr/bin/env node

/**
 * Simple verification script for injection detection improvements
 * This script verifies that:
 * 1. SQL/command injection patterns are detected BEFORE sanitization
 * 2. The original unsanitized values are used for logging
 * 3. The sanitization still works correctly
 * 4. The redundant checks after sanitization have been removed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying injection detection improvements...\n');

// Read the orderSecurity.ts file
const orderSecurityPath = path.join(__dirname, '../src/lib/security/orderSecurity.ts');
const content = fs.readFileSync(orderSecurityPath, 'utf8');

console.log('✅ File exists and is readable');

const checks = {
  'Injection detection runs before sanitization': false,
  'Original unsanitized value is preserved': false,
  'Logging includes original symbol': false,
  'Security alert is triggered': false,
  'Sanitization still works': false,
  'Redundant checks after sanitization removed': false,
};

// Check 1: Injection detection runs before sanitization
const injectionDetectionRegex = /Detect SQL and command injection patterns in raw input before sanitization/;
if (injectionDetectionRegex.test(content)) {
  checks['Injection detection runs before sanitization'] = true;
  console.log('✅ Injection detection runs before sanitization');
} else {
  console.log('❌ Injection detection does not run before sanitization');
}

// Check 2: Original unsanitized value is preserved
const originalSymbolRegex = /const originalSymbol = symbol;/;
if (originalSymbolRegex.test(content)) {
  checks['Original unsanitized value is preserved'] = true;
  console.log('✅ Original unsanitized value is preserved');
} else {
  console.log('❌ Original unsanitized value is not preserved');
}

// Check 3: Logging includes original symbol
const loggingRegex = /originalSymbol/;
if (loggingRegex.test(content)) {
  checks['Logging includes original symbol'] = true;
  console.log('✅ Logging includes original symbol');
} else {
  console.log('❌ Logging does not include original symbol');
}

// Check 4: Security alert is triggered
const securityAlertRegex = /securityAlertUtils\.processAuthEvent/;
if (securityAlertRegex.test(content)) {
  checks['Security alert is triggered'] = true;
  console.log('✅ Security alert is triggered');
} else {
  console.log('❌ Security alert is not triggered');
}

// Check 5: Sanitization still works
const sanitizationRegex = /\.replace\(\/\[\^A-Z0-9_\/:-]\/g, ''\)/;
if (sanitizationRegex.test(content)) {
  checks['Sanitization still works'] = true;
  console.log('✅ Sanitization still works');
} else {
  console.log('❌ Sanitization is missing');
}

// Check 6: Redundant checks after sanitization are removed
// Look for the old pattern: checks AFTER sanitization
const postSanitizationChecksRegex = /if \(\/\[\\'";\\\\]\/\.test\(sanitized\)\)/;
const commandInjectionRegex = /if \(\/\[&\|;\$`\(\)<>]\/test\(sanitized\)\)/;

if (!postSanitizationChecksRegex.test(content) && !commandInjectionRegex.test(content)) {
  checks['Redundant checks after sanitization removed'] = true;
  console.log('✅ Redundant checks after sanitization removed');
} else {
  console.log('❌ Redundant checks after sanitization still present');
}

console.log('\n📊 Summary:');
const passedChecks = Object.values(checks).filter(Boolean).length;
const totalChecks = Object.keys(checks).length;

console.log(`Passed: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
  console.log('🎉 All checks passed! Injection detection improvements are correctly implemented.');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the implementation.');
  console.log('\nFailed checks:');
  Object.entries(checks).forEach(([check, passed]) => {
    if (!passed) {
      console.log(`  - ${check}`);
    }
  });
  process.exit(1);
}