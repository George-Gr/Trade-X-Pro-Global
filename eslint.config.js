import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// ESM-compatible __dirname replacement
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  {
    ignores: [
      "dist",
      "node_modules",
      "e2e",
      "docs",
      "playwright.config.ts",
      "public/sw.js",
      "src/**/*.d.ts",
      "supabase/functions",
      "src/__tests__/**/*.{ts,tsx}",
      "src/**/__tests__/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
      "*.config.js",
      "scripts",
      "src/lib/imageOptimization.tsx",
      "src/hooks/useAccessibilityPreferences.tsx",
    ],
  },
  // Primary linting configuration for source files
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/__tests__/**/*.{ts,tsx}",
      "src/**/__tests__/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        // Type-aware linting with project reference for better type checking
        // Uses dedicated tsconfig.eslint.json that only includes src files
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Turn off no-undef for TypeScript files because TypeScript handles this
      "no-undef": "off",
      // Turn off unused-vars as project intentionally has loose types
      "no-unused-vars": "off",
      ...reactHooks.configs.recommended.rules,
      // Enforce React Fast Refresh rules with allowConstantExport for utility modules
      // This ensures components are exported for proper hot reloading in development
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",

      // TASK-024: Naming convention enforcement
      // '@typescript-eslint/naming-convention': [ ... ], // Disabled due to parserServices error with ESLint 9+ and flat config

      // Prevent listener leaks
      "no-restricted-globals": [
        "error",
        {
          name: "addEventListener",
          message:
            "Use React's useEffect hook with proper cleanup instead of direct addEventListener",
        },
        {
          name: "removeEventListener",
          message:
            "Use React's useEffect cleanup instead of direct removeEventListener",
        },
      ],

      // Enforce proper cleanup
      "react-hooks/exhaustive-deps": "warn",

      // Prevent direct console usage - use logger instead
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"], // Allow warn/error for critical issues during development
        },
      ],
    },
  },
  // Test files - no type-aware linting (uses basic parsing only)
  {
    files: [
      "src/__tests__/**/*.{ts,tsx}",
      "src/**/__tests__/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        vi: "readonly",
        assert: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-refresh/only-export-components": "off",
      "react-hooks/exhaustive-deps": "warn",
      "no-console": "off",
      "no-restricted-globals": "off",
    },
  },
  // Disable react-refresh rule for utility/library files that export non-component code
  {
    files: [
      "src/lib/**/*.{ts,tsx}",
      "src/contexts/**/*.tsx",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
