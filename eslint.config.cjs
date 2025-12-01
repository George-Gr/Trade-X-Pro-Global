const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
    js.configs.recommended,
    {
        ignores: [
            'dist',
            'node_modules',
            'e2e',
            'docs',
            'playwright.config.ts',
            'public/sw.js',
            'src/**/*.d.ts',
            'supabase/functions/**/__tests__/**',
            'src/**/__tests__/**',
            'src/**/*.test.{ts,tsx}',
            '*.config.js',
            'scripts/**/*.js',
        ],
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                // Use workspace tsconfig(s) that include different parts of the repo
                project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.json'],
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // Turn off no-undef for TypeScript files because TypeScript handles this
            'no-undef': 'off',
            // Turn off unused-vars as project intentionally has loose types
            'no-unused-vars': 'off',
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',

            // Prevent listener leaks
            'no-restricted-globals': [
                'error',
                {
                    name: 'addEventListener',
                    message: "Use React's useEffect hook with proper cleanup instead of direct addEventListener",
                },
                {
                    name: 'removeEventListener',
                    message: "Use React's useEffect cleanup instead of direct removeEventListener",
                },
            ],

            // Enforce proper cleanup
            'react-hooks/exhaustive-deps': 'warn',
            // Defer stylistic formatting to the TypeScript language service (tsserver)
            'indent': 'off',
            'quotes': 'off',
            'semi': 'off',
            'comma-dangle': 'off',
            'max-len': 'off',
        },
    },
    {
        files: ['**/__tests__/**', "**/*.test.*"],
        languageOptions: {
            globals: {
                ...globals.browser,
                vi: 'readonly',
                assert: 'readonly',
                expect: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
];
