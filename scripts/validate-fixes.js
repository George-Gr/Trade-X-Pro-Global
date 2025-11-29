#!/usr/bin/env node

/**
 * Validation script to test all Windows Output Log fixes
 * Run with: npm run dev:validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility: parse JSONC (strip comments) for files that may contain JSON with comments.
function parseJsonc(content) {
  // Remove single-line comments
  const noSingle = content.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  const noMulti = noSingle.replace(/\/\*[\s\S]*?\*\//g, '');
  return JSON.parse(noMulti);
}

console.log('🔍 Validating Windows Output Log Fixes...\n');

const checks = [];

// Check 1: Navigator polyfill exists
checks.push({
  name: 'Navigator Polyfill',
  test: () => {
    const polyfillsPath = path.join(__dirname, '../src/polyfills.ts');
    if (!fs.existsSync(polyfillsPath)) return false;
    
    const content = fs.readFileSync(polyfillsPath, 'utf8');
    return content.includes('navigator') && content.includes('userAgent');
  },
  message: '✅ Navigator polyfill found in src/polyfills.ts'
});

// Check 2: Vite configuration has navigator fixes
checks.push({
  name: 'Vite Navigator Configuration',
  test: () => {
    const viteConfigPath = path.join(__dirname, '../vite.config.ts');
    if (!fs.existsSync(viteConfigPath)) return false;
    
    const content = fs.readFileSync(viteConfigPath, 'utf8');
          return (content.includes("navigator: 'undefined'") || content.includes("'navigator': 'undefined'")) &&
            content.includes("'typeof navigator'");
  },
  message: '✅ Vite configuration has navigator and deprecation fixes'
});

// Check 3: Package.json has chat participants
checks.push({
  name: 'Chat Participants Declaration',
  test: () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.chatParticipants && packageJson.chatParticipants.includes('claude-code');
  },
  message: '✅ Chat participants properly declared in package.json'
});

// Check 4: Setup script exists
checks.push({
  name: 'Node.js Setup Script',
  test: () => {
    const setupScriptPath = path.join(__dirname, '../scripts/setup-node-env.js');
    if (!fs.existsSync(setupScriptPath)) return false;
    
    const content = fs.readFileSync(setupScriptPath, 'utf8');
    return content.includes('navigator') && content.includes('punycode');
  },
  message: '✅ Node.js setup script found with polyfills (navigator polyfill is opt-in)'
});

// Check 11: Setup script doesn't suppress all deprecation warnings globally
checks.push({
  name: 'No global deprecation suppression in setup script',
  test: () => {
    const setupScriptPath = path.join(__dirname, '../scripts/setup-node-env.js');
    const content = fs.readFileSync(setupScriptPath, 'utf8');
    return !content.includes('NODE_DISABLE_DEPRECATION_WARNINGS') && !content.includes('NODE_SUPPRESS_DEPRECATION');
  },
  message: '✅ Setup script does not globally suppress deprecation warnings'
});

// Check 5: Performance monitoring hooks exist
checks.push({
  name: 'Performance Monitoring Hooks',
  test: () => {
    const perfHookPath = path.join(__dirname, '../src/hooks/usePerformanceMonitoring.ts');
    if (!fs.existsSync(perfHookPath)) return false;
    
    const content = fs.readFileSync(perfHookPath, 'utf8');
    return content.includes('usePerformanceMonitoring') && content.includes('trackListener');
  },
  message: '✅ Performance monitoring hooks found'
});

// Check 6: ESLint rules for listener leaks
checks.push({
  name: 'ESLint Listener Leak Prevention',
  test: () => {
    const eslintConfigPath = path.join(__dirname, '../eslint.config.js');
    if (!fs.existsSync(eslintConfigPath)) return false;
    
    const content = fs.readFileSync(eslintConfigPath, 'utf8');
    return content.includes('no-restricted-globals') && content.includes('addEventListener');
  },
  message: '✅ ESLint rules for listener leak prevention found'
});

// Check 7: TypeScript configuration has DOM support
checks.push({
  name: 'TypeScript DOM Support',
  test: () => {
    const tsconfigAppPath = path.join(__dirname, '../tsconfig.app.json');
    if (!fs.existsSync(tsconfigAppPath)) return false;
    
    const content = fs.readFileSync(tsconfigAppPath, 'utf8');
    // Check for lib array containing DOM (JSONC format)
    return content.includes('"lib":') && content.includes('"DOM"');
  },
  message: '✅ TypeScript configuration includes DOM library support'
});

// Check 8: Main entry point imports polyfills
checks.push({
  name: 'Polyfills Import in Main',
  test: () => {
    const mainPath = path.join(__dirname, '../src/main.tsx');
    if (!fs.existsSync(mainPath)) return false;
    
    const content = fs.readFileSync(mainPath, 'utf8');
    return content.includes('import \'./polyfills\'');
  },
  message: '✅ Main entry point imports polyfills'
});

// Check 9: Validation script in package.json
checks.push({
  name: 'Validation Script',
  test: () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.scripts && packageJson.scripts['dev:validate'];
  },
  message: '✅ Validation script found in package.json'
});

// Check 10: Dev script includes FORCE_NODE_POLYFILL_NAVIGATOR flag
checks.push({
  name: 'Dev Script Navigator Polyfill Flag',
  test: () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.scripts && packageJson.scripts.dev && packageJson.scripts.dev.includes('FORCE_NODE_POLYFILL_NAVIGATOR=1');
  },
  message: '✅ Dev script includes FORCE_NODE_POLYFILL_NAVIGATOR flag'
});

// Check 11: Workspace settings include Raptor mini Copilot settings
checks.push({
  name: 'Workspace Copilot Raptor Mini Settings',
  test: () => {
    const settingsFile = path.join(__dirname, '../.vscode/settings.json');
    if (!fs.existsSync(settingsFile)) return false;
    const settings = parseJsonc(fs.readFileSync(settingsFile, 'utf8'));
    return settings['github.copilot.experimental.raptorMiniEnabled'] === true &&
           settings['github.copilot.experimental.raptorMiniForAllClients'] === true;
  },
  message: '✅ Workspace Copilot Raptor mini settings added to .vscode/settings.json'
});

// Check 12: Devcontainer has Copilot settings applied for Codespaces
checks.push({
  name: 'Devcontainer Copilot Settings',
  test: () => {
    const devcontainerFile = path.join(__dirname, '../.devcontainer/devcontainer.json');
    if (!fs.existsSync(devcontainerFile)) return false;
    const content = parseJsonc(fs.readFileSync(devcontainerFile, 'utf8'));
    const settings = content.customizations?.vscode?.settings || {};
    return settings['github.copilot.experimental.raptorMiniEnabled'] === true &&
           settings['github.copilot.experimental.raptorMiniForAllClients'] === true;
  },
  message: '✅ Devcontainer Copilot Raptor settings added for Codespaces'
});

// Run all checks
let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    if (check.test()) {
      console.log(check.message);
      passed++;
    } else {
      console.log(`❌ ${check.name}: FAILED`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name}: ERROR - ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Validation Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 All Windows Output Log fixes are properly implemented!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev:clean');
  console.log('2. Run: npm run dev');
  console.log('3. Check browser console for any remaining errors');
  console.log('4. Run: npm run dev:validate (this script) to verify fixes');
} else {
  console.log('\n⚠️  Some fixes are missing or incomplete. Please review the failed checks above.');
  process.exit(1);
}

// Additional runtime checks
console.log('\n🔧 Runtime Environment Checks:');

// Check if we're in Node.js environment
console.log(`✅ Node.js version: ${process.version}`);

// Check environment variables
const envChecks = [
  'NODE_DISABLE_DEPRECATION_WARNINGS',
  'NODE_SUPPRESS_DEPRECATION',
  'TSC_NONPOLLING_WATCHER',
  'TSC_WATCHER_POLLING_INTERVAL'
];

envChecks.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚠️  ${envVar}: not set`);
  }
});

console.log('\n✨ Validation complete!');