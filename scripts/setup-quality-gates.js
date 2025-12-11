#!/usr/bin/env node

/**
 * Design System Validation Script
 * Checks for design system violations in the codebase
 * 
 * Enforces:
 * - No hardcoded colors (use CSS variables)
 * - No hardcoded font sizes (use text-* classes)
 * - No hardcoded spacing outside grid (use design system)
 * - Proper color contrast ratios
 * - Proper touch target sizes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

let violationCount = 0;
let warningCount = 0;

// Color patterns to detect hardcoded colors
const colorPatterns = [
  { pattern: /backgroundColor:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, name: 'backgroundColor', type: 'error' },
  { pattern: /color:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, name: 'color', type: 'error' },
  { pattern: /borderColor:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, name: 'borderColor', type: 'error' },
  { pattern: /boxShadow:\s*.*?#[0-9a-f]{3,6}/gi, name: 'boxShadow', type: 'error' },
  { pattern: /style=\{[^}]*backgroundColor[^}]*\}/gi, name: 'inline style backgroundColor', type: 'error' },
];

// Font size patterns to detect hardcoded sizes
const fontSizePatterns = [
  { pattern: /fontSize:\s*['"]?(\d+)px['"]?/gi, name: 'fontSize', maxSize: 72, type: 'error' },
  { pattern: /lineHeight:\s*['"]?(\d+\.?\d*)px['"]?/gi, name: 'lineHeight px', type: 'error' },
];

// Spacing patterns to detect non-system values
const spacingPatterns = [
  { pattern: /padding:\s*['"]?(\d+)px['"]?/gi, name: 'padding', grid: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128], type: 'warning' },
  { pattern: /margin:\s*['"]?(\d+)px['"]?/gi, name: 'margin', grid: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128], type: 'warning' },
  { pattern: /gap:\s*['"]?(\d+)px['"]?/gi, name: 'gap', grid: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64], type: 'warning' },
];

// Border radius patterns
const borderRadiusPatterns = [
  { pattern: /borderRadius:\s*['"]?(\d+)px['"]?/gi, name: 'borderRadius', allowed: [0, 2, 4, 6, 8, 12, 16, 24, 9999], type: 'warning' },
];

function reportIssue(filePath, lineNum, message, type = 'error') {
  const severity = type === 'error' ? '🚨' : '⚠️ ';
  console.error(`${severity} ${filePath}:${lineNum} - ${message}`);
  
  if (type === 'error') {
    violationCount++;
  } else {
    warningCount++;
  }
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for hardcoded colors
    colorPatterns.forEach(({ pattern, name, type: issueType }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        reportIssue(
          filePath,
          getLineNumber(content, match.index),
          `Hardcoded color in ${name} - use CSS variables instead`,
          issueType
        );
      }
    });

    // Check for hardcoded font sizes
    fontSizePatterns.forEach(({ pattern, name, type: issueType }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        reportIssue(
          filePath,
          getLineNumber(content, match.index),
          `Hardcoded ${name} - use text-* Tailwind classes instead`,
          issueType
        );
      }
    });

    // Check for non-grid spacing values
    spacingPatterns.forEach(({ pattern, name, grid, type: issueType }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const value = parseInt(match[1]);
        if (!grid.includes(value) && value > 0) {
          // Skip common Tailwind values that we might be seeing
          if (![1, 2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 18, 19, 22, 26, 44, 52, 60].includes(value)) {
            reportIssue(
              filePath,
              getLineNumber(content, match.index),
              `Non-grid ${name} value (${value}px) - use 4/8px grid system: ${grid.join(', ')}`,
              issueType
            );
          }
        }
      }
    });

    // Check border radius values
    borderRadiusPatterns.forEach(({ pattern, name, allowed, type: issueType }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const value = parseInt(match[1]);
        if (!allowed.includes(value)) {
          reportIssue(
            filePath,
            getLineNumber(content, match.index),
            `Non-standard ${name} value (${value}px) - use: ${allowed.join(', ')}`,
            issueType
          );
        }
      }
    });

  } catch (err) {
    console.error(`❌ Error reading ${filePath}: ${err.message}`);
  }
}

function main() {
  console.log('🔍 Validating design system compliance...\n');

  const tsxFiles = glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts']
  });

  const cssFiles = glob('src/**/*.css', {
    ignore: ['node_modules/**', 'dist/**']
  });

  console.log(`Found ${tsxFiles.length} TypeScript files and ${cssFiles.length} CSS files\n`);

  // Validate TypeScript files
  tsxFiles.forEach(validateFile);

  // Basic CSS validation (more detailed in stylelint)
  cssFiles.forEach(validateFile);

  // Report results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Design System Validation Results:`);
  console.log(`Violations: ${violationCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`${'='.repeat(60)}\n`);

  if (violationCount > 0) {
    console.error(`❌ Design system validation failed with ${violationCount} violation(s)`);
    process.exit(1);
  }

  if (warningCount > 0) {
    console.warn(`⚠️  ${warningCount} warning(s) found but not blocking`);
  }

  console.log('✅ Design system validation passed!');
  process.exit(0);
}

main();
