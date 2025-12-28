#!/usr/bin/env node

/**
 * Script to update Supabase environment variables
 * Usage: node scripts/update-supabase-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Supabase Environment Setup');
console.log('============================');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ Found existing .env.local file');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasKey = envContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY=');
  console.log(`\nConfigured: URL=${hasUrl ? '✓' : '✗'}, Key=${hasKey ? '✓' : '✗'}`);
} else {
  console.log('📝 Creating new .env.local file');
}

console.log('\n📋 Instructions:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → API');
console.log('4. Copy the Project URL and anon public key');
console.log('5. Run this script with your credentials:');

console.log('\nExample usage:');
console.log('node scripts/update-supabase-env.js "https://your-project.supabase.co" "your-anon-key"');

console.log('\nOr manually edit .env.local with:');
console.log('VITE_SUPABASE_URL=your-project-url');
console.log('VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key');

// If credentials provided as arguments
if (process.argv.length >= 4) {
  const supabaseUrl = process.argv[2];
  const publishableKey = process.argv[3];
  
  const envContent = `# Local environment variables — DO NOT COMMIT
# Credentials configured via update-supabase-env.js script
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}

# Optional: Sentry (replace if used)
# VITE_SENTRY_DSN=

# Notes:
# - This file is ignored via .gitignore
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Updated .env.local with provided credentials');
  console.log('🔄 Restart your development server to apply changes');
} else {
  console.log('\n💡 Tip: You can also manually edit .env.local or use:');
  console.log('   node scripts/update-supabase-env.js "your-url" "your-key"');
}