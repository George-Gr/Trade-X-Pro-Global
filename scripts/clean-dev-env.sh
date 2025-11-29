#!/bin/bash
# Development Environment Cleanup Script
# This script clears caches and restarts the development environment

set -e

echo "🧹 Cleaning up TypeScript server and caches..."

# Kill any running TypeScript servers
pkill -f "tsserver" || true
sleep 1

# Clear VS Code TypeScript cache
rm -rf ~/.vscode-server/data/User/workspaceStorage/*/state.vscdb* 2>/dev/null || true

# Clear Node modules cache
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# Clear TypeScript cache
rm -rf dist 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

echo "✅ Cleanup complete"
echo ""
echo "📦 Reinstalling dependencies..."
npm ci || npm install

echo "✅ Dependencies installed"
echo ""
echo "🚀 Ready to start development:"
echo "   npm run dev      - Start dev server"
echo "   npm run test:ui  - Start test UI"
echo "   npm run lint     - Run ESLint"
