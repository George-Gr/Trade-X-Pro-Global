#!/usr/bin/env node

/**
 * Node.js compatibility script to address deprecated modules
 * Run with: node scripts/node-compatibility.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🔧 Node.js Compatibility Script");
console.log("================================");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

// Check if we're using deprecated modules

const packageJsonPath = path.join(__dirname, "..", "package.json");

let packageJson;
try {
  const fileContent = fs.readFileSync(packageJsonPath, "utf8");
  packageJson = JSON.parse(fileContent);
} catch (error) {
  const errorMessage =
    error instanceof SyntaxError
      ? `Invalid JSON in ${packageJsonPath}: ${error.message}`
      : `Failed to read ${packageJsonPath}: ${error.message}`;
  console.error(`❌ Error: ${errorMessage}`);
  process.exit(1);
}

// Check for deprecated modules that might cause warnings
const deprecatedModules = ["punycode", "domain", "constants", "sys"];

// Collect all dependency sections to check
const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
};

const foundDeprecated = [];
Object.keys(allDependencies || {}).forEach((dep) => {
  if (deprecatedModules.includes(dep)) {
    foundDeprecated.push(dep);
  }
});

if (foundDeprecated.length > 0) {
  console.log("⚠️  Found deprecated modules in dependencies:");
  foundDeprecated.forEach((dep) => console.log(`   - ${dep}`));
  console.log("\n💡 Consider updating these dependencies or using polyfills");
} else {
  console.log("✅ No deprecated modules found in direct dependencies");
}

// Check for experimental features
if (nodeVersion.startsWith("v20") || nodeVersion.startsWith("v21")) {
  console.log(
    "⚠️  Using Node.js experimental features (SQLite warning expected)",
  );
  console.log(
    "💡 This is normal for newer Node.js versions with experimental features",
  );
}

console.log("\n💡 To suppress deprecation warnings, you can:");
console.log("- Set environment variable: export NODE_NO_WARNINGS=1");
console.log("- Or use: node --no-warnings your-script.js");
console.log("- Or add to your script: process.noDeprecation = true");

console.log("\n✅ Node.js compatibility check complete!");
