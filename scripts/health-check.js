#!/usr/bin/env node

/**
 * Comprehensive workspace health check script
 * Run with: node scripts/health-check.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

console.log("🏥 Workspace Health Check Script");
console.log("================================");

const issues = [];
const warnings = [];
const fixes = [];

// 1. Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

if (nodeVersion.startsWith("v18")) {
  warnings.push(
    "Using Node.js 18, consider upgrading to v20+ for better performance",
  );
} else if (nodeVersion.startsWith("v20") || nodeVersion.startsWith("v21")) {
  console.log("✅ Using modern Node.js version");
} else {
  warnings.push(`Node.js version ${nodeVersion} may have compatibility issues`);
}

// 2. Check package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, "..", "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  console.log(`📦 Project: ${packageJson.name} v${packageJson.version}`);

  // Check for common issues
  if (!packageJson.scripts?.lint) {
    warnings.push("Missing lint script in package.json");
  }
  if (!packageJson.scripts?.test) {
    warnings.push("Missing test script in package.json");
  }
} else {
  issues.push("package.json not found");
}

// 3. Check VS Code settings
const vscodeSettingsPath = path.join(
  __dirname,
  "..",
  ".vscode",
  "settings.json",
);
if (fs.existsSync(vscodeSettingsPath)) {
  try {
    const settingsContent = fs.readFileSync(vscodeSettingsPath, "utf8");
    // Remove comments for JSON parsing
    const cleanedContent = settingsContent
      .replace(/\/\/.*$/gm, "")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    const settings = JSON.parse(cleanedContent);
    console.log("✅ VS Code settings found");

    // Check for performance optimizations
    if (
      settings["extensions.autoUpdate"] === undefined ||
      settings["extensions.autoUpdate"] === true
    ) {
      fixes.push(
        'Add "extensions.autoUpdate": false to reduce extension host load',
      );
    }
    if (
      settings["search.followSymlinks"] === undefined ||
      settings["search.followSymlinks"] === true
    ) {
      fixes.push('Add "search.followSymlinks": false for better performance');
    }
  } catch (error) {
    warnings.push(`Could not parse VS Code settings: ${error.message}`);
  }
} else {
  warnings.push("VS Code settings not found");
}

// 4. Check for common directories
const commonDirs = ["src", "public", "scripts", ".vscode"];
commonDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, "..", dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directory ${dir} exists`);
  } else {
    warnings.push(`Directory ${dir} not found`);
  }
});

// 5. Check for lock files
const lockFiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
const foundLockFiles = lockFiles.filter((lockFile) =>
  fs.existsSync(path.join(__dirname, "..", lockFile)),
);

if (foundLockFiles.length > 0) {
  console.log(`✅ Lock file found: ${foundLockFiles[0]}`);
} else {
  warnings.push(
    "No lock file found (package-lock.json, yarn.lock, or pnpm-lock.yaml)",
  );
}

// 6. Check for .git directory
const gitPath = path.join(__dirname, "..", ".git");
if (fs.existsSync(gitPath)) {
  console.log("✅ Git repository found");
} else {
  warnings.push("Not a git repository");
}

// 7. Check for environment files
const envFiles = [".env", ".env.local", ".env.development"];
const foundEnvFiles = envFiles.filter((envFile) =>
  fs.existsSync(path.join(__dirname, "..", envFile)),
);

if (foundEnvFiles.length > 0) {
  console.log(`✅ Environment file found: ${foundEnvFiles[0]}`);
} else {
  warnings.push(
    "No environment file found (.env, .env.local, or .env.development)",
  );
}

// 8. Check for common config files
const configFiles = [
  "tsconfig.json",
  "vite.config.ts",
  "eslint.config.js",
  "tailwind.config.ts",
];

configFiles.forEach((configFile) => {
  const configPath = path.join(__dirname, "..", configFile);
  if (fs.existsSync(configPath)) {
    console.log(`✅ Config file ${configFile} found`);
  } else {
    warnings.push(`Config file ${configFile} not found`);
  }
});

// 9. Check disk space (basic check)
try {
  const freeSpace = execSync("df -h .", { encoding: "utf8" });
  console.log("✅ Disk space check completed");
} catch (error) {
  warnings.push("Could not check disk space");
}

// 10. Summary
console.log("\n📊 Health Check Summary");
console.log("========================");

if (issues.length > 0) {
  console.log("\n❌ Issues found:");
  issues.forEach((issue) => console.log(`   - ${issue}`));
}

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  warnings.forEach((warning) => console.log(`   - ${warning}`));
}

if (fixes.length > 0) {
  console.log("\n🔧 Recommended fixes:");
  fixes.forEach((fix) => console.log(`   - ${fix}`));
}

if (issues.length === 0 && warnings.length === 0) {
  console.log("\n🎉 Workspace looks healthy!");
}

console.log("\n💡 Run individual scripts for specific fixes:");
console.log("   npm run network:config  - Fix network issues");
console.log("   npm run node:compat     - Check Node.js compatibility");
console.log("   npm run copilot:config  - Configure GitHub Copilot");

console.log("\n✅ Health check complete!");
