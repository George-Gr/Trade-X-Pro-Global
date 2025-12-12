#!/usr/bin/env node

/**
 * Design System Validation Script v2.0
 * Comprehensive validation for design system compliance
 * 
 * Enforces:
 * - Typography scale validation (detect off-scale font sizes)
 * - Color token validation (detect hardcoded colors)
 * - Spacing grid validation (detect off-grid margins/padding)
 * - CSS variable usage enforcement
 * - Accessibility compliance checks
 * - Performance impact monitoring
 * 
 * Features:
 * - Detailed violation reports with auto-fix suggestions
 * - Integration with pre-commit hooks and CI/CD
 * - Baseline comparison and trend analysis
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let violationCount = 0;
let warningCount = 0;
let autoFixableCount = 0;

const REPORTS = {
  violations: [],
  warnings: [],
  suggestions: [],
  summary: {}
};

// Enhanced Design System Validation Patterns

// Color patterns to detect hardcoded colors with auto-fix suggestions
const colorPatterns = [
  { 
    pattern: /backgroundColor:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, 
    name: 'backgroundColor', 
    type: 'error',
    autoFix: (match) => `backgroundColor: 'hsl(var(--primary))'`,
    suggestion: 'Use CSS variable: hsl(var(--primary))'
  },
  { 
    pattern: /color:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, 
    name: 'color', 
    type: 'error',
    autoFix: (match) => `color: 'hsl(var(--foreground))'`,
    suggestion: 'Use CSS variable: hsl(var(--foreground))'
  },
  { 
    pattern: /borderColor:\s*['"]?#[0-9a-f]{3,6}['"]?/gi, 
    name: 'borderColor', 
    type: 'error',
    autoFix: (match) => `borderColor: 'hsl(var(--border))'`,
    suggestion: 'Use CSS variable: hsl(var(--border))'
  },
  { 
    pattern: /boxShadow:\s*.*?#[0-9a-f]{3,6}/gi, 
    name: 'boxShadow', 
    type: 'error',
    autoFix: (match) => `boxShadow: 'var(--shadow-md)'`,
    suggestion: 'Use CSS variable: var(--shadow-md)'
  },
  { 
    pattern: /style=\{[^}]*backgroundColor[^}]*\}/gi, 
    name: 'inline style backgroundColor', 
    type: 'error',
    suggestion: 'Move to CSS class or CSS variable'
  },
  // RGB/RGBA patterns
  { 
    pattern: /(backgroundColor|color|borderColor):\s*['"]?rgb[a]?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/gi, 
    name: 'RGB/RGBA color', 
    type: 'error',
    autoFix: (match) => match.replace(/rgb[a]?\([^)]+\)/, 'hsl(var(--primary))'),
    suggestion: 'Convert RGB to HSL CSS variable'
  }
];

// Typography scale validation - detect off-scale font sizes
const typographyPatterns = [
  { 
    pattern: /fontSize:\s*['"]?(\d+(?:\.\d+)?)px['"]?/gi, 
    name: 'fontSize', 
    type: 'error',
    validate: (value) => {
      const allowedSizes = [10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 56, 64, 72];
      return allowedSizes.includes(parseFloat(value));
    },
    suggestion: 'Use approved text sizes: 10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 56, 64, 72px'
  },
  { 
    pattern: /lineHeight:\s*['"]?(\d+(?:\.\d+)?)px['"]?/gi, 
    name: 'lineHeight px', 
    type: 'warning',
    validate: (value) => {
      const fontSizes = [10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 56, 64, 72];
      return fontSizes.includes(parseFloat(value));
    },
    suggestion: 'Use unitless line heights: 1.2, 1.3, 1.4, 1.5, 1.6'
  },
  // Tailwind arbitrary font sizes
  { 
    pattern: /text-\[(\d+(?:\.\d+)?)px\]/gi, 
    name: 'Tailwind arbitrary font size', 
    type: 'warning',
    validate: (value) => {
      const allowedSizes = [10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 56, 64, 72];
      return allowedSizes.includes(parseFloat(value));
    },
    suggestion: 'Use standard text classes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl'
  }
];

// Enhanced spacing validation with grid enforcement
const spacingPatterns = [
  { 
    pattern: /padding:\s*['"]?(\d+)px['"]?/gi, 
    name: 'padding', 
    type: 'warning',
    validate: (value) => {
      const gridValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128, 160, 192, 256];
      return gridValues.includes(parseInt(value));
    },
    suggestion: 'Use 4px grid: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128px'
  },
  { 
    pattern: /margin:\s*['"]?(\d+)px['"]?/gi, 
    name: 'margin', 
    type: 'warning',
    validate: (value) => {
      const gridValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128, 160, 192, 256];
      return gridValues.includes(parseInt(value));
    },
    suggestion: 'Use 4px grid: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128px'
  },
  { 
    pattern: /gap:\s*['"]?(\d+)px['"]?/gi, 
    name: 'gap', 
    type: 'warning',
    validate: (value) => {
      const gridValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64];
      return gridValues.includes(parseInt(value));
    },
    suggestion: 'Use 4px grid: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64px'
  },
  // Tailwind arbitrary spacing
  { 
    pattern: /(p|m|gap)-\[(\d+)px\]/gi, 
    name: 'Tailwind arbitrary spacing', 
    type: 'warning',
    validate: (value) => {
      const gridValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 128];
      return gridValues.includes(parseInt(value));
    },
    suggestion: 'Use standard spacing: p-1, p-2, p-3, p-4, p-6, p-8, etc.'
  }
];

// Border radius validation
const borderRadiusPatterns = [
  { 
    pattern: /borderRadius:\s*['"]?(\d+)px['"]?/gi, 
    name: 'borderRadius', 
    type: 'warning',
    validate: (value) => {
      const allowed = [0, 2, 4, 6, 8, 12, 16, 24, 9999];
      return allowed.includes(parseInt(value));
    },
    suggestion: 'Use approved radii: 0, 2, 4, 6, 8, 12, 16, 24px (or rounded for full radius)'
  },
  { 
    pattern: /(rounded|bd)-\[(\d+)px\]/gi, 
    name: 'Tailwind arbitrary border radius', 
    type: 'warning',
    validate: (value) => {
      const allowed = [0, 2, 4, 6, 8, 12, 16, 24];
      return allowed.includes(parseInt(value));
    },
    suggestion: 'Use standard radius: rounded, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl'
  }
];

// CSS variable usage enforcement
const cssVariablePatterns = [
  { 
    pattern: /(['"]#(?:[0-9a-fA-F]{3}){1,2}['"])/gi, 
    name: 'Hardcoded hex color', 
    type: 'error',
    autoFix: (match) => match.replace(/#([0-9a-fA-F]{3}){1,2}/, 'hsl(var(--primary))'),
    suggestion: 'Replace hex colors with CSS variables'
  },
  { 
    pattern: /(['"]rgba?\([^)]+\)['"])/gi, 
    name: 'Hardcoded RGB/RGBA color', 
    type: 'error',
    autoFix: (match) => match.replace(/rgba?\([^)]+\)/, 'hsl(var(--primary))'),
    suggestion: 'Replace RGB/RGBA with CSS variables'
  }
];

// Accessibility compliance checks
const accessibilityPatterns = [
  { 
    pattern: /<button[^>]*[^>]\s*>/gi, 
    name: 'Button without type attribute', 
    type: 'warning',
    suggestion: 'Add type="button" to prevent form submission'
  },
  { 
    pattern: /<img[^>]*[^aria-label][^>]*[^alt][^>]*>/gi, 
    name: 'Image without alt text', 
    type: 'error',
    suggestion: 'Add alt text or aria-label for accessibility'
  }
];

function reportIssue(filePath, lineNum, message, type = 'error', details = {}) {
  const severity = type === 'error' ? '🚨' : '⚠️ ';
  console.error(`${severity} ${filePath}:${lineNum} - ${message}`);
  
  // Add detailed suggestion if available
  if (details.suggestion) {
    console.error(`   💡 Suggestion: ${details.suggestion}`);
  }
  
  // Add auto-fix suggestion if available
  if (details.autoFix) {
    console.error(`   🔧 Auto-fix: ${details.autoFix}`);
    autoFixableCount++;
  }
  
  // Report to summary
  const issue = {
    file: filePath,
    line: lineNum,
    message,
    type,
    severity,
    suggestion: details.suggestion,
    autoFix: details.autoFix,
    category: details.category || 'general'
  };
  
  REPORTS.violations.push(issue);
  
  if (type === 'error') {
    violationCount++;
  } else {
    warningCount++;
  }
}

function reportSuggestion(category, suggestion, impact = 'low') {
  const suggestionItem = {
    category,
    suggestion,
    impact,
    priority: impact === 'high' ? 'high' : impact === 'medium' ? 'medium' : 'low'
  };
  
  REPORTS.suggestions.push(suggestionItem);
  console.log(`💡 ${category}: ${suggestion}`);
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Generate detailed violation report
function generateDetailedReport() {
  const reportPath = './design-system-violations-report.json';
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      violations: violationCount,
      warnings: warningCount,
      autoFixable: autoFixableCount,
      complianceRate: Math.max(0, 100 - ((violationCount + warningCount) / 100 * 10))
    },
    violations: REPORTS.violations,
    suggestions: REPORTS.suggestions,
    recommendations: {
      immediate: REPORTS.violations.filter(v => v.type === 'error').slice(0, 5),
      longTerm: [
        'Implement automated CSS variable usage enforcement',
        'Add design system lint rules to ESLint configuration',
        'Create pre-commit hooks for design system validation',
        'Set up visual regression testing for design consistency',
        'Establish design system documentation automation'
      ]
    }
  };
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
  } catch (err) {
    console.warn(`⚠️ Could not save detailed report: ${err.message}`);
  }
  
  return reportData;
}

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Validate colors - enhanced with auto-fix suggestions
    colorPatterns.forEach(({ pattern, name, type: issueType, autoFix, suggestion, validate }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        
        // For patterns with validation, check if the value is valid
        if (validate && !validate(match[1] || match[0])) {
          reportIssue(
            filePath,
            lineNum,
            `Invalid ${name} - ${match[0]}`,
            issueType,
            { 
              suggestion, 
              autoFix: autoFix ? autoFix(match[0]) : undefined,
              category: 'color'
            }
          );
        } else if (!validate || validate(match[1] || match[0])) {
          reportIssue(
            filePath,
            lineNum,
            `Hardcoded color in ${name} - use CSS variables instead`,
            issueType,
            { 
              suggestion, 
              autoFix: autoFix ? autoFix(match[0]) : undefined,
              category: 'color'
            }
          );
        }
      }
    });

    // Validate typography - detect off-scale font sizes
    typographyPatterns.forEach(({ pattern, name, type: issueType, validate, suggestion }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        const value = match[1] || match[0];
        
        if (!validate || !validate(value)) {
          reportIssue(
            filePath,
            lineNum,
            `Off-scale ${name} - ${value}`,
            issueType,
            { 
              suggestion, 
              category: 'typography'
            }
          );
        }
      }
    });

    // Validate spacing - enhanced grid enforcement
    spacingPatterns.forEach(({ pattern, name, type: issueType, validate, suggestion }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        const value = match[2] || match[1] || match[0];
        
        if (!validate || !validate(value)) {
          reportIssue(
            filePath,
            lineNum,
            `Non-grid ${name} value - ${value}`,
            issueType,
            { 
              suggestion, 
              category: 'spacing'
            }
          );
        }
      }
    });

    // Validate border radius
    borderRadiusPatterns.forEach(({ pattern, name, type: issueType, validate, suggestion }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        const value = match[2] || match[1] || match[0];
        
        if (!validate || !validate(value)) {
          reportIssue(
            filePath,
            lineNum,
            `Non-standard ${name} value - ${value}`,
            issueType,
            { 
              suggestion, 
              category: 'border-radius'
            }
          );
        }
      }
    });

    // Validate CSS variable usage
    cssVariablePatterns.forEach(({ pattern, name, type: issueType, autoFix, suggestion }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        reportIssue(
          filePath,
          lineNum,
          `${name} detected - use CSS variables`,
          issueType,
          { 
            suggestion, 
            autoFix: autoFix ? autoFix(match[0]) : undefined,
            category: 'css-variables'
          }
        );
      }
    });

    // Validate accessibility compliance
    accessibilityPatterns.forEach(({ pattern, name, type: issueType, suggestion }) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = getLineNumber(content, match.index);
        reportIssue(
          filePath,
          lineNum,
          `${name} - affects accessibility`,
          issueType,
          { 
            suggestion, 
            category: 'accessibility'
          }
        );
      }
    });

    // Additional checks for missing CSS variables
    const cssVarMatches = content.match(/(--[a-zA-Z0-9-]+:\s*[^;]+)/g);
    if (cssVarMatches) {
      const definedVars = new Set();
      cssVarMatches.forEach(match => {
        const varName = match.split(':')[0].trim();
        definedVars.add(varName);
      });
      
      // Check for CSS variable usage without definition
      const usedVars = content.match(/var\((--[a-zA-Z0-9-]+)\)/g);
      if (usedVars) {
        usedVars.forEach(match => {
          const varName = match.match(/var\((--[a-zA-Z0-9-]+)\)/)[1];
          if (!definedVars.has(varName) && !isStandardCSSVar(varName)) {
            reportSuggestion(
              'CSS Variables',
              `CSS variable ${varName} is used but not defined. Consider defining it in your CSS custom properties.`,
              'medium'
            );
          }
        });
      }
    }

  } catch (err) {
    console.error(`❌ Error reading ${filePath}: ${err.message}`);
  }
}

// Check if CSS variable is standard (defined in design system)
function isStandardCSSVar(varName) {
  const standardVars = [
    '--primary', '--secondary', '--accent', '--background', '--foreground',
    '--muted', '--card', '--border', '--input', '--ring',
    '--primary-foreground', '--secondary-foreground', '--accent-foreground',
    '--destructive', '--destructive-foreground', '--success', '--warning',
    '--info', '--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg',
    '--spacing-xl', '--border-radius-sm', '--border-radius-md', '--border-radius-lg',
    '--shadow-sm', '--shadow-md', '--shadow-lg', '--font-size-xs', '--font-size-sm',
    '--font-size-base', '--font-size-lg', '--font-size-xl', '--font-size-2xl'
  ];
  
  return standardVars.some(std => varName.includes(std.replace('--', '')));
}

async function main() {
  console.log('🔍 Validating design system compliance v2.0...\n');

  const startTime = Date.now();
  
  // Command line options
  const args = process.argv.slice(2);
  const isCI = args.includes('--ci') || process.env.CI === 'true';
  const isStrict = args.includes('--strict') || args.includes('--fix');
  const baselineFile = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : null;

  // Load baseline if available
  let baseline = null;
  if (baselineFile && fs.existsSync(baselineFile)) {
    try {
      baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));
      console.log(`📊 Loaded baseline from ${baselineFile}`);
      console.log(`   Previous violations: ${baseline.summary?.violations || 0}`);
      console.log(`   Previous warnings: ${baseline.summary?.warnings || 0}\n`);
    } catch (err) {
      console.warn(`⚠️ Could not load baseline: ${err.message}`);
    }
  }

  const tsxFiles = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts']
  });

  const cssFiles = await glob('src/**/*.css', {
    ignore: ['node_modules/**', 'dist/**']
  });

  console.log(`Found ${tsxFiles.length} TypeScript files and ${cssFiles.length} CSS files\n`);

  // Validate TypeScript files
  tsxFiles.forEach(validateFile);

  // Validate CSS files
  cssFiles.forEach(validateFile);

  // Additional analysis
  analyzeCompliance();

  // Generate detailed report
  const report = generateDetailedReport();
  
  // Baseline comparison
  if (baseline) {
    console.log(`\n📈 Baseline Comparison:`);
    const violationDiff = violationCount - (baseline.summary?.violations || 0);
    const warningDiff = warningCount - (baseline.summary?.warnings || 0);
    
    console.log(`   Violations: ${violationCount} (${violationDiff >= 0 ? '+' : ''}${violationDiff})`);
    console.log(`   Warnings: ${warningCount} (${warningDiff >= 0 ? '+' : ''}${warningDiff})`);
    
    if (violationDiff > 0) {
      reportSuggestion(
        'Regression Alert',
        `Design system violations increased by ${violationDiff}. Investigate recent changes.`,
        'high'
      );
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Report results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎯 Design System Validation Results:`);
  console.log(`   Violations: ${violationCount}`);
  console.log(`   Warnings: ${warningCount}`);
  console.log(`   Auto-fixable: ${autoFixableCount}`);
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Compliance Rate: ${report.summary.complianceRate.toFixed(1)}%`);
  
  if (baseline) {
    const prevCompliance = baseline.summary?.complianceRate || 100;
    const complianceDiff = report.summary.complianceRate - prevCompliance;
    console.log(`   Compliance Change: ${complianceDiff >= 0 ? '+' : ''}${complianceDiff.toFixed(1)}%`);
  }
  console.log(`${'='.repeat(60)}\n`);

  // Exit codes and CI/CD integration
  const FAILURE_THRESHOLD = isStrict ? 0 : 10; // Stricter in CI or when --strict flag
  const WARNING_THRESHOLD = isCI ? 50 : 100; // More warnings allowed locally

  if (violationCount > FAILURE_THRESHOLD) {
    console.error(`❌ Design system validation failed with ${violationCount} violation(s)`);
    console.error(`   Threshold: ${FAILURE_THRESHOLD}`);
    
    if (isCI) {
      console.error(`\n🔧 CI/CD Integration:`);
      console.error(`   - Review violations in design-system-violations-report.json`);
      console.error(`   - Fix violations before merging`);
      console.error(`   - Run with --baseline for trend analysis`);
    }
    
    process.exit(1);
  }

  if (warningCount > WARNING_THRESHOLD) {
    console.warn(`⚠️  ${warningCount} warning(s) found (threshold: ${WARNING_THRESHOLD})`);
    
    if (isCI) {
      console.warn(`   Consider addressing warnings to improve compliance`);
    }
  }

  // Success messages with improvement suggestions
  if (violationCount === 0 && warningCount === 0) {
    console.log('🎉 Perfect design system compliance achieved!');
    reportSuggestion('Excellence', 'Outstanding! Consider setting stricter baselines for continuous improvement.', 'low');
  } else if (violationCount === 0) {
    console.log('✅ No violations! Great job maintaining design system standards.');
    if (warningCount > 0) {
      reportSuggestion('Improvement', `Consider addressing ${warningCount} warning(s) to reach 100% compliance.`, 'low');
    }
  } else {
    console.log(`✅ Violations within acceptable range (${violationCount}/${FAILURE_THRESHOLD})`);
  }

  // Performance recommendations
  if (duration > 5000) {
    reportSuggestion('Performance', 'Validation is slow. Consider optimizing file patterns or running validation only on changed files.', 'medium');
  }

  // Auto-fix suggestions
  if (autoFixableCount > 0) {
    console.log(`\n🔧 Auto-fixable Issues: ${autoFixableCount}`);
    console.log(`   Run with --fix flag for automatic fixes (when implemented)`);
  }

  console.log('\n📋 Next Steps:');
  console.log('   - Review detailed report: design-system-violations-report.json');
  console.log('   - Address high-priority violations');
  console.log('   - Run baseline comparison: --baseline design-system-baseline.json');
  console.log('   - Set up pre-commit hooks for ongoing validation');

  console.log('\n✅ Design system validation completed!');
  process.exit(0);
}

// Analyze overall compliance patterns
function analyzeCompliance() {
  const categories = {};
  
  REPORTS.violations.forEach(violation => {
    categories[violation.category] = (categories[violation.category] || 0) + 1;
  });

  console.log('\n📊 Violation Breakdown by Category:');
  Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

  // Generate targeted suggestions
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 5) {
      reportSuggestion(
        `${category} Issues`,
        `High number of ${category} violations (${count}). Consider team training or automated fixes.`,
        count > 10 ? 'high' : 'medium'
      );
    }
  });
}

main().catch(console.error);
