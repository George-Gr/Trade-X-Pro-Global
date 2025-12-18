#!/usr/bin/env node

/**
 * Network configuration script to help resolve connectivity issues
 * Run with: node scripts/network-config.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🔧 Network Configuration Script");
console.log("================================");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if .npmrc exists and create if needed
const npmrcPath = path.join(__dirname, "..", ".npmrc");

if (!fs.existsSync(npmrcPath)) {
  console.log("📝 Creating .npmrc file...");
  const npmrcContent = `# Network configuration for better reliability
registry=https://registry.npmjs.org/
fetch-retries=5
fetch-retry-factor=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
network-timeout=120000
timeout=120000
strict-ssl=true
`;
  try {
    fs.writeFileSync(npmrcPath, npmrcContent);
    console.log("✅ Created .npmrc with network optimizations");
  } catch (error) {
    console.error(`❌ Error writing .npmrc: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log("✅ .npmrc already exists");
}

// Check if .yarnrc exists and create if needed
const yarnrcPath = path.join(__dirname, "..", ".yarnrc");

if (!fs.existsSync(yarnrcPath)) {
  console.log("📝 Creating .yarnrc file...");
  const yarnrcContent = `# Network configuration for Yarn
network-timeout: 120000
strict-ssl: true
`;
  try {
    fs.writeFileSync(yarnrcPath, yarnrcContent);
    console.log("✅ Created .yarnrc with network optimizations");
  } catch (error) {
    console.error(`❌ Error writing .yarnrc: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log("✅ .yarnrc already exists");
}

console.log("\n💡 Additional network troubleshooting tips:");
console.log("- Check your internet connection");
console.log(
  "- Try running: npm config set registry https://registry.npmjs.org/",
);
console.log("- If behind a proxy, configure npm proxy settings");
console.log("- Clear npm cache: npm cache clean --force");
console.log("- Check firewall settings for Node.js and VS Code");

console.log("\n✅ Network configuration complete!");
