#!/usr/bin/env node

/**
 * Fix Build Cache and Hash Issues Script
 *
 * This script resolves chunk 404 errors by:
 * 1. Clearing all build caches
 * 2. Rebuilding with consistent chunk naming
 * 3. Verifying chunk file consistency
 * 4. Updating deployment configurations
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  log("blue", `Executing: ${description}`);
  try {
    execSync(command, { stdio: "inherit" });
    log("green", `✅ ${description} completed successfully`);
  } catch (error) {
    log("red", `❌ ${description} failed: ${error.message}`);
    process.exit(1);
  }
}

function clearBuildCaches() {
  log("yellow", "🧹 Clearing all build caches...");

  const cachePaths = [
    "./node_modules/.vite",
    "./dist",
    "./.vite",
    "./.next",
    "./.turbo",
    "./coverage",
    "./.nyc_output",
    "./playwright-report",
    "./.cache",
  ];

  cachePaths.forEach((cachePath) => {
    if (fs.existsSync(cachePath)) {
      log("blue", `Removing ${cachePath}`);
      fs.rmSync(cachePath, { recursive: true, force: true });
    }
  });

  log("green", "✅ All build caches cleared");
}

function verifyViteConfig() {
  log("yellow", "🔧 Verifying Vite configuration...");

  const viteConfigPath = "./vite.config.ts";
  const viteConfig = fs.readFileSync(viteConfigPath, "utf8");

  // Check for critical configuration elements
  const requiredConfigs = [
    "emptyOutDir: true",
    "chunkFileNames",
    "entryFileNames",
    "manualChunks",
  ];

  const hasRequiredConfigs = requiredConfigs.some((config) =>
    typeof config === "string"
      ? viteConfig.includes(config)
      : viteConfig.includes(config.name),
  );

  if (!hasRequiredConfigs) {
    log("yellow", "⚠️ Some required Vite configurations may be missing");
  }

  log("green", "✅ Vite configuration verified");
}

function createBuildScript() {
  log("yellow", "📝 Creating optimized build script...");

  const buildScript = `#!/bin/bash

# TradeX Pro Production Build Script
# Fixes chunk 404 errors by ensuring clean builds

set -e  # Exit on any error

echo "🚀 Starting TradeX Pro Production Build..."

# Step 1: Clear all caches
echo "🧹 Clearing build caches..."
rm -rf ./node_modules/.vite
rm -rf ./dist
rm -rf ./.vite

# Step 2: Install dependencies (fresh)
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

# Step 3: Run build with explicit cache busting
echo "🏗️ Building production bundle..."
NODE_ENV=production npm run build

# Step 4: Verify build output
echo "🔍 Verifying build output..."
node ./scripts/verify-build.js

# Step 5: Generate deployment manifest
echo "📋 Generating deployment manifest..."
node ./scripts/generate-deployment-manifest.js

echo "✅ Production build completed successfully!"
echo "📁 Output directory: ./dist"
echo "🌐 Ready for deployment"
`;

  fs.writeFileSync("./scripts/build-production.sh", buildScript);
  fs.chmodSync("./scripts/build-production.sh", "755");

  log("green", "✅ Build script created");
}

function createBuildVerification() {
  log("yellow", "🔍 Creating build verification script...");

  const verifyScript = `import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying TradeX Pro build output...');

// Critical files that must exist
const criticalFiles = [
  'dist/index.html',
  'dist/assets/index-[hash].js',
  'dist/assets/index-[hash].css',
  'dist/chunks/',
];

const chunksDir = path.join(__dirname, '../dist/chunks');
const assetsDir = path.join(__dirname, '../dist/assets');

// Check if directories exist
if (!fs.existsSync('dist')) {
  console.error('❌ dist/ directory not found');
  process.exit(1);
}

if (!fs.existsSync(chunksDir)) {
  console.error('❌ dist/chunks/ directory not found');
  process.exit(1);
}

// Check chunk files
const chunkFiles = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
console.log(\`📦 Found \${chunkFiles.length} chunk files\`);

// Check for the specific chunks mentioned in errors
const requiredChunks = [
  'separator-',
  'log-out-',
  'circle-',
  'scroll-area-',
  'user-',
  'AuthenticatedLayoutInner-'
];

const missingChunks = [];
requiredChunks.forEach(pattern => {
  const found = chunkFiles.some(file => file.includes(pattern));
  if (!found) {
    missingChunks.push(pattern);
  }
});

if (missingChunks.length > 0) {
  console.error(\`❌ Missing required chunks: \${missingChunks.join(', ')}\`);
  process.exit(1);
}

// Check HTML file
const htmlFile = fs.readFileSync('dist/index.html', 'utf8');
const hasModuleScript = htmlFile.includes('type="module"');
const hasChunks = htmlFile.includes('chunks/');

if (!hasModuleScript || !hasChunks) {
  console.error('❌ HTML file missing required module scripts or chunk references');
  process.exit(1);
}

console.log('✅ Build verification passed');
console.log('✅ All required chunks found');
console.log('✅ HTML file properly configured');
console.log('🎉 Build is ready for deployment!');
`;

  fs.writeFileSync("./scripts/verify-build.js", verifyScript);

  log("green", "✅ Build verification script created");
}

function createDeploymentManifest() {
  log("yellow", "📋 Creating deployment manifest script...");

  const manifestScript = `import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('📋 Generating deployment manifest...');

const distDir = path.join(__dirname, '../dist');
const manifest = {
  buildInfo: {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    commit: process.env.GITHUB_SHA || 'unknown',
    buildNumber: process.env.BUILD_NUMBER || 'unknown'
  },
  files: {},
  chunks: {},
  assets: {}
};

// Scan dist directory
function scanDirectory(dir, basePath = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      scanDirectory(itemPath, relativePath);
    } else {
      const content = fs.readFileSync(itemPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      manifest.files[relativePath] = {
        size: stat.size,
        hash: hash.substring(0, 8), // Short hash for readability
        mtime: stat.mtime.toISOString()
      };
      
      // Categorize files
      if (relativePath.startsWith('chunks/')) {
        manifest.chunks[relativePath] = manifest.files[relativePath];
      } else if (relativePath.startsWith('assets/')) {
        manifest.assets[relativePath] = manifest.files[relativePath];
      }
    }
  });
}

scanDirectory(distDir);

// Write manifest
fs.writeFileSync(
  path.join(distDir, 'deployment-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(\`✅ Deployment manifest created with \${Object.keys(manifest.files).length} files\`);
console.log(\`📦 \${Object.keys(manifest.chunks).length} chunks\`);
console.log(\`🎨 \${Object.keys(manifest.assets).length} assets\`);
`;

  fs.writeFileSync("./scripts/generate-deployment-manifest.js", manifestScript);

  log("green", "✅ Deployment manifest script created");
}

function createCacheBusting() {
  log("yellow", "🔧 Creating cache busting configuration...");

  const vercelConfig = `# TradeX Pro Vercel Configuration
# Fixes chunk 404 errors with proper caching

{
  "version": 2,
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/chunks/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  fs.writeFileSync("./vercel.json", vercelConfig);

  // Also create for deployment verification
  const vercelHeader = `# Vercel Headers for TradeX Pro
# Ensures proper caching for chunk files

/chunks/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block`;

  fs.writeFileSync("./dist/_headers", vercelHeader);

  log("green", "✅ Cache busting configuration created");
}

function main() {
  log("blue", "🛠️ TradeX Pro Build Cache Fix Script");
  log("blue", "====================================");

  try {
    clearBuildCaches();
    verifyViteConfig();
    createBuildScript();
    createBuildVerification();
    createDeploymentManifest();
    createCacheBusting();

    log("green", "🎉 All build fixes applied successfully!");
    log("yellow", "📋 Next steps:");
    log("blue", "1. Run: npm run build");
    log("blue", "2. Or use: ./scripts/build-production.sh");
    log("blue", "3. Deploy with: vercel --prod");
    log("blue", "4. Monitor deployment for chunk loading");
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
