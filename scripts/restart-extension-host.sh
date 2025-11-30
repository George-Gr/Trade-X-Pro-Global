#!/bin/bash

###############################################################################
# VS Code Extension Host Restart Script
# 
# Forces a clean restart of the extension host with proper cleanup
# 
# Usage: bash scripts/restart-extension-host.sh
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Extension Host Restart & Recovery                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}[1/5]${NC} Killing extension processes..."
pkill -9 -f "extensionHostProcess" 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Killed extensionHostProcess"

echo -e "${YELLOW}[2/5]${NC} Clearing workspace locks..."
find "${HOME}/.vscode-remote/data/User/workspaceStorage" -name "vscode.lock" -delete 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Locks cleared"

echo -e "${YELLOW}[3/5]${NC} Clearing extension state..."
rm -rf "${HOME}/.vscode-remote/data/User/extensions/.cache" 2>/dev/null || true
mkdir -p "${HOME}/.vscode-remote/data/User/extensions/.cache"
echo -e "  ${GREEN}✓${NC} Extension state cleared"

echo -e "${YELLOW}[4/5]${NC} Waiting for process cleanup..."
sleep 2
echo -e "  ${GREEN}✓${NC} Ready for restart"

echo -e "${YELLOW}[5/5]${NC} Requesting VS Code restart..."
if command -v code-server &> /dev/null; then
  # Codespaces
  pkill -HUP code-server 2>/dev/null || true
  echo -e "  ${GREEN}✓${NC} Signaled code-server restart"
else
  # Local VS Code (rarely needed)
  echo -e "  ${YELLOW}ℹ${NC} Local VS Code restart requested manually"
  echo -e "     Go to: View → Output → Extension Host"
fi

sleep 1

echo ""
echo -e "${GREEN}✓ Extension Host restart initiated${NC}"
echo ""
echo -e "${YELLOW}Monitoring:${NC}"
echo "  View → Toggle Output → Extension Host"
echo ""
echo -e "${YELLOW}Expected behavior:${NC}"
echo "  • Extensions reload (5-15 seconds)"
echo "  • No errors or warnings"
echo "  • Chat becomes available"
echo ""
