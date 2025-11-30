#!/bin/bash

###############################################################################
# Extension Host Cleanup & Recovery Script
# 
# Removes stale lock files, clears caches, and prepares for extension restart
# 
# Usage: bash scripts/fix-extension-host.sh
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VSCODE_DATA_DIR="${HOME}/.vscode-remote/data/User"
LOCK_FILE_MAX_AGE_MINUTES=30
EXTENSION_CACHE_DIR="${VSCODE_DATA_DIR}/extensions/.cache"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VS Code Extension Host Recovery & Stabilization Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Kill Orphaned Processes
###############################################################################
echo -e "${YELLOW}[1/7]${NC} Terminating orphaned VS Code processes..."

if pgrep -f "extensionHostProcess" > /dev/null; then
  pkill -9 -f "extensionHostProcess" 2>/dev/null || true
  echo -e "  ${GREEN}✓${NC} Killed extensionHostProcess"
fi

if pgrep -f "code-server" > /dev/null; then
  pkill -9 -f "code-server" 2>/dev/null || true
  echo -e "  ${GREEN}✓${NC} Killed code-server"
fi

sleep 1

###############################################################################
# Step 2: Analyze and Remove Stale Lock Files
###############################################################################
echo -e "${YELLOW}[2/7]${NC} Analyzing workspace lock files..."

LOCK_COUNT=$(find "${VSCODE_DATA_DIR}/workspaceStorage" -name "vscode.lock" 2>/dev/null | wc -l)
echo -e "  Found ${LOCK_COUNT} lock files"

if [ $LOCK_COUNT -gt 0 ]; then
  echo -e "  ${YELLOW}Listing lock files:${NC}"
  find "${VSCODE_DATA_DIR}/workspaceStorage" -name "vscode.lock" -ls 2>/dev/null | while read -r line; do
    echo "    $line"
  done

  # Remove locks older than 30 minutes
  DELETED=$(find "${VSCODE_DATA_DIR}/workspaceStorage" -name "vscode.lock" -mmin +${LOCK_FILE_MAX_AGE_MINUTES} -delete 2>/dev/null && echo "yes" || echo "no")
  
  if [ "$DELETED" = "yes" ]; then
    echo -e "  ${GREEN}✓${NC} Removed stale lock files (>30 minutes old)"
  fi

  # Force remove any remaining locks if they're blocking
  find "${VSCODE_DATA_DIR}/workspaceStorage" -name "vscode.lock" -exec rm -f {} \; 2>/dev/null || true
  echo -e "  ${GREEN}✓${NC} Cleared all workspace locks"
fi

###############################################################################
# Step 3: Clear Extension Cache
###############################################################################
echo -e "${YELLOW}[3/7]${NC} Clearing extension cache..."

if [ -d "${EXTENSION_CACHE_DIR}" ]; then
  CACHE_SIZE=$(du -sh "${EXTENSION_CACHE_DIR}" 2>/dev/null | cut -f1)
  echo -e "  Cache size before: ${CACHE_SIZE}"
  rm -rf "${EXTENSION_CACHE_DIR}"
  mkdir -p "${EXTENSION_CACHE_DIR}"
  echo -e "  ${GREEN}✓${NC} Extension cache cleared"
else
  echo -e "  ${GREEN}ℹ${NC} No extension cache to clear"
fi

###############################################################################
# Step 4: Clear VS Code State & Settings
###############################################################################
echo -e "${YELLOW}[4/7]${NC} Clearing corrupt state files..."

STATE_FILES=(
  "${VSCODE_DATA_DIR}/globalStorage/state.vscdb"
  "${VSCODE_DATA_DIR}/globalStorage/state.vscdb.backup"
  "${VSCODE_DATA_DIR}/workspaceStorage/.cache"
)

for file in "${STATE_FILES[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    echo -e "  ${GREEN}✓${NC} Removed: $(basename $file)"
  fi
done

###############################################################################
# Step 5: Clear NPM Cache (optional, for network issues)
###############################################################################
echo -e "${YELLOW}[5/7]${NC} Clearing npm cache..."

npm cache clean --force 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} NPM cache cleared"

###############################################################################
# Step 6: Verify Configuration Files
###############################################################################
echo -e "${YELLOW}[6/7]${NC} Verifying configuration files..."

if [ -f ".devcontainer/devcontainer.json" ]; then
  echo -e "  ${GREEN}✓${NC} devcontainer.json found"
else
  echo -e "  ${RED}✗${NC} devcontainer.json not found"
fi

if [ -f ".vscode/settings.json" ]; then
  echo -e "  ${GREEN}✓${NC} .vscode/settings.json found"
else
  echo -e "  ${YELLOW}ℹ${NC} .vscode/settings.json not found (will be created)"
fi

if [ -f ".vscode/mcp.json" ]; then
  echo -e "  ${GREEN}✓${NC} .vscode/mcp.json found"
fi

###############################################################################
# Step 7: Network Connectivity Check
###############################################################################
echo -e "${YELLOW}[7/7]${NC} Checking network connectivity..."

NETWORK_OK=true

# Check GitHub API
if timeout 5 curl -s -I https://api.github.com > /dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} api.github.com: reachable"
else
  echo -e "  ${YELLOW}⚠${NC} api.github.com: unreachable (extension features may be limited)"
  NETWORK_OK=false
fi

# Check MCP endpoint
if timeout 5 curl -s -I https://api.mcp.github.com > /dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} api.mcp.github.com: reachable"
else
  echo -e "  ${YELLOW}⚠${NC} api.mcp.github.com: unreachable (MCP may not work)"
  NETWORK_OK=false
fi

###############################################################################
# Summary & Next Steps
###############################################################################
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Recovery Complete                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Rebuild the container:${NC}"
echo "   ${GREEN}Remote-Containers: Rebuild Container${NC}"
echo ""
echo "2. ${YELLOW}Monitor the Extension Host:${NC}"
echo "   View → Toggle Output → Extension Host"
echo ""
echo "3. ${YELLOW}Watch for these indicators of success:${NC}"
echo "   ✓ No 'navigator' or lock file errors in output"
echo "   ✓ No 'socket timeout' or 'unresponsive' messages"
echo "   ✓ No 'Unknown agent' errors"
echo ""

if [ "$NETWORK_OK" = true ]; then
  echo -e "${GREEN}✓ Network connectivity: OK${NC}"
else
  echo -e "${YELLOW}⚠ Network issues detected - check your internet connection${NC}"
fi

echo ""
echo -e "${BLUE}For monitoring, run:${NC}"
echo "  bash scripts/restart-extension-host.sh        # Force restart"
echo "  bash scripts/diagnostic-report.sh             # Generate diagnostics"
echo ""
