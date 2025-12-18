#!/usr/bin/env node

/**
 * Design System Validation Script
 *
 * Runs automated checks on design system compliance across the codebase.
 * Used for pre-commit validation and CI/CD pipeline integration.
 *
 * Usage:
 *   node scripts/validate-design-system.js
 *   npm run validate:design-system
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 Design System Compliance Check\n");

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: [],
};

/**
 * Helper function to add check results
 */
const addCheck = (name, status, details = "") => {
  results.checks.push({ name, status, details });

  if (status === "✅ PASS") {
    results.passed++;
    console.log(`✅ ${name}`);
  } else if (status === "⚠️ WARNING") {
    results.warnings++;
    console.log(`⚠️ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  }
};

/**
 * Check 1: Legacy spacing values in tailwind.config.ts
 */
try {
  const tailwindConfig = fs.readFileSync("tailwind.config.ts", "utf-8");
  const legacySpacingRegex = /['"](?:4\.5|13|15|18|22|26|30)['"]/g;
  const legacyMatches = tailwindConfig.match(legacySpacingRegex) || [];

  if (legacyMatches.length === 0) {
    addCheck("Legacy spacing values", "✅ PASS");
  } else {
    addCheck(
      "Legacy spacing values",
      "❌ FAIL",
      `Found ${legacyMatches.length} non-grid-aligned spacing values: ${legacyMatches.join(", ")}`,
    );
  }
} catch (error) {
  addCheck(
    "Legacy spacing values",
    "❌ FAIL",
    "Could not read tailwind.config.ts",
  );
}

/**
 * Check 2: Hardcoded colors in CSS files
 */
try {
  const cssFiles = [
    "src/index.css",
    "src/styles/typography.css",
    "src/styles/spacing.css",
    "src/styles/micro-interactions.css",
    "src/styles/accessibility.css",
    "src/styles/cards.css",
    "src/styles/states.css",
  ];

  let hardcodedColorCount = 0;
  const problematicFiles = [];

  cssFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      // Look for hex colors that aren't in comments or strings
      const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
      const matches = content.match(hexColorRegex) || [];

      // Filter out colors in comments
      const lines = content.split("\n");
      const validColors = lines.filter((line, index) => {
        // Skip comment lines
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          return false;
        }

        // Check if hex color exists in this line
        const lineMatches = line.match(hexColorRegex);
        return lineMatches && lineMatches.length > 0;
      });

      if (validColors.length > 0) {
        hardcodedColorCount += validColors.length;
        problematicFiles.push(`${file} (${validColors.length})`);
      }
    }
  });

  if (hardcodedColorCount === 0) {
    addCheck("Hardcoded CSS colors", "✅ PASS");
  } else {
    addCheck(
      "Hardcoded CSS colors",
      "❌ FAIL",
      `Found ${hardcodedColorCount} hardcoded hex values in: ${problematicFiles.join(", ")}`,
    );
  }
} catch (error) {
  addCheck("Hardcoded CSS colors", "❌ FAIL", "Error checking CSS files");
}

/**
 * Check 3: Undefined CSS variables in accessibility utilities
 */
try {
  const accessibilityCss = fs.readFileSync(
    "src/styles/accessibility.css",
    "utf-8",
  );
  const indexCss = fs.readFileSync("src/index.css", "utf-8");

  const undefinedVars = [
    "--primary-contrast-bg",
    "--primary-contrast-fg",
    "--secondary-contrast-bg",
    "--secondary-contrast-fg",
    "--success-contrast-bg",
    "--success-contrast-fg",
    "--warning-contrast-bg",
    "--warning-contrast-fg",
    "--danger-contrast-bg",
    "--danger-contrast-fg",
  ];

  let undefinedCount = 0;
  const missingVars = [];

  undefinedVars.forEach((varName) => {
    if (!indexCss.includes(varName)) {
      undefinedCount++;
      missingVars.push(varName);
    }
  });

  if (undefinedCount === 0) {
    addCheck("Undefined CSS variables", "✅ PASS");
  } else {
    addCheck(
      "Undefined CSS variables",
      "❌ FAIL",
      `${undefinedCount} variables referenced but not defined: ${missingVars.join(", ")}`,
    );
  }
} catch (error) {
  addCheck("Undefined CSS variables", "❌ FAIL", "Could not read CSS files");
}

/**
 * Check 4: Hardcoded easing functions in animations
 */
try {
  const microInteractions = fs.readFileSync(
    "src/styles/micro-interactions.css",
    "utf-8",
  );

  // Look for hardcoded easing functions that should use CSS variables
  const hardcodedEasingRegex =
    /animation:\s*[^;]*\s+(ease-in|ease-out|ease-in-out)(?!\s*var\()/g;
  const matches = microInteractions.match(hardcodedEasingRegex) || [];

  if (matches.length === 0) {
    addCheck("Hardcoded easing functions", "✅ PASS");
  } else {
    addCheck(
      "Hardcoded easing functions",
      "❌ FAIL",
      `Found ${matches.length} hardcoded easing functions: ${matches.join(", ")}`,
    );
  }
} catch (error) {
  addCheck(
    "Hardcoded easing functions",
    "❌ FAIL",
    "Could not read micro-interactions.css",
  );
}

/**
 * Check 5: Spacing grid compliance
 */
try {
  // Check if spacing values follow 4/8px grid
  const spacingCss = fs.readFileSync("src/styles/spacing.css", "utf-8");

  // Extract spacing values
  const spacingRegex = /--space-\d+:\s*(\d+)px;/g;
  const matches = spacingCss.matchAll(spacingRegex);

  let nonGridValues = [];
  for (const match of matches) {
    const value = parseInt(match[1]);
    if (value % 4 !== 0) {
      nonGridValues.push(value);
    }
  }

  if (nonGridValues.length === 0) {
    addCheck("Spacing grid compliance", "✅ PASS");
  } else {
    addCheck(
      "Spacing grid compliance",
      "❌ FAIL",
      `Found non-grid values: ${nonGridValues.join("px, ")}px`,
    );
  }
} catch (error) {
  addCheck("Spacing grid compliance", "❌ FAIL", "Could not read spacing.css");
}

/**
 * Check 6: TypeScript strict mode
 */
try {
  const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf-8"));
  const strictMode = tsconfig.compilerOptions?.strict;

  if (strictMode === true) {
    addCheck("TypeScript strict mode", "✅ PASS");
  } else {
    addCheck(
      "TypeScript strict mode",
      "⚠️ WARNING",
      "Strict mode is not enabled",
    );
  }
} catch (error) {
  addCheck("TypeScript strict mode", "❌ FAIL", "Could not read tsconfig.json");
}

/**
 * Check 7: ESLint configuration
 */
try {
  const eslintConfig = fs.readFileSync("eslint.config.js", "utf-8");

  // Check for important rules
  const requiredRules = [
    "no-console",
    "no-debugger",
    "no-unused-vars",
    "react-hooks/exhaustive-deps",
  ];

  const missingRules = requiredRules.filter(
    (rule) => !eslintConfig.includes(rule),
  );

  if (missingRules.length === 0) {
    addCheck("ESLint configuration", "✅ PASS");
  } else {
    addCheck(
      "ESLint configuration",
      "⚠️ WARNING",
      `Missing rules: ${missingRules.join(", ")}`,
    );
  }
} catch (error) {
  addCheck(
    "ESLint configuration",
    "❌ FAIL",
    "Could not read eslint.config.js",
  );
}

/**
 * Check 8: Package.json scripts
 */
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const scripts = packageJson.scripts || {};

  const requiredScripts = ["lint", "type:strict", "build"];
  const missingScripts = requiredScripts.filter((script) => !scripts[script]);

  if (missingScripts.length === 0) {
    addCheck("Package.json scripts", "✅ PASS");
  } else {
    addCheck(
      "Package.json scripts",
      "⚠️ WARNING",
      `Missing scripts: ${missingScripts.join(", ")}`,
    );
  }
} catch (error) {
  addCheck("Package.json scripts", "❌ FAIL", "Could not read package.json");
}

/**
 * Check 9: Documentation completeness
 */
try {
  const docs = [
    "project_resources/design_system_and_typography/DESIGN_SYSTEM.md",
    "project_resources/design_system_and_typography/QUALITY_GATES.md",
    "project_resources/design_system_and_typography/COMPONENT_API.md",
  ];

  const missingDocs = docs.filter((doc) => !fs.existsSync(doc));

  if (missingDocs.length === 0) {
    addCheck("Documentation completeness", "✅ PASS");
  } else {
    addCheck(
      "Documentation completeness",
      "⚠️ WARNING",
      `Missing docs: ${missingDocs.join(", ")}`,
    );
  }
} catch (error) {
  addCheck(
    "Documentation completeness",
    "❌ FAIL",
    "Error checking documentation",
  );
}

/**
 * Check 10: Component exports
 */
try {
  const uiIndex = fs.readFileSync("src/components/ui/index.ts", "utf-8");

  // Check for common component exports
  const expectedExports = ["Button", "Card", "Dialog", "Alert", "Badge"];

  const missingExports = expectedExports.filter(
    (exportName) => !uiIndex.includes(exportName),
  );

  if (missingExports.length === 0) {
    addCheck("Component exports", "✅ PASS");
  } else {
    addCheck(
      "Component exports",
      "⚠️ WARNING",
      `Missing exports: ${missingExports.join(", ")}`,
    );
  }
} catch (error) {
  addCheck("Component exports", "❌ FAIL", "Could not read ui index file");
}

// Print summary
console.log("\n" + "=".repeat(50));
console.log("COMPLIANCE SUMMARY");
console.log("=".repeat(50));

const totalChecks = results.passed + results.failed + results.warnings;
const compliance = Math.round((results.passed / totalChecks) * 100);

console.log(`\nOverall: ${compliance}% (${results.passed}/${totalChecks})`);

if (results.failed > 0) {
  console.log(`\n❌ ${results.failed} CRITICAL ISSUES`);
  console.log("These must be fixed before deployment.");
} else {
  console.log("\n✅ All critical issues resolved!");
}

if (results.warnings > 0) {
  console.log(`\n⚠️ ${results.warnings} WARNINGS`);
  console.log("Consider addressing these for optimal compliance.");
}

console.log("\nDetailed Results:");
results.checks.forEach((check) => {
  const statusIcon =
    check.status === "✅ PASS"
      ? "✅"
      : check.status === "⚠️ WARNING"
        ? "⚠️"
        : "❌";
  console.log(`  ${statusIcon} ${check.name}`);
  if (check.details && check.status !== "✅ PASS") {
    console.log(`     └─ ${check.details}`);
  }
});

console.log("\n" + "=".repeat(50));

// Exit with appropriate code
const exitCode = results.failed > 0 ? 1 : 0;
process.exit(exitCode);
