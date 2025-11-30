#!/bin/bash

###############################################################################
# VS Code Extension Host Diagnostic Report Generator
# 
# Collects system, network, process, and log information for troubleshooting
# 
# Usage: bash scripts/diagnostic-report.sh
# Output: diagnostic-report.txt
###############################################################################

set -euo pipefail

REPORT_FILE="diagnostic-report-$(date +%Y%m%d-%H%M%S).txt"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Generating diagnostic report...${NC}"
echo ""

{
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║  VS Code Extension Host Diagnostic Report                    ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Generated: $(date)"
  echo "Hostname: $(hostname)"
  echo "User: $(whoami)"
  echo ""

  # ========================================================================
  echo "SECTION 1: System Information"
  echo "========================================================================"
  echo ""
  echo "OS Information:"
  uname -a
  echo ""

  echo "Node.js Version:"
  node --version 2>/dev/null || echo "(Not installed)"
  echo ""

  echo "NPM Version:"
  npm --version 2>/dev/null || echo "(Not installed)"
  echo ""

  echo "Memory Available:"
  free -h
  echo ""

  echo "Disk Usage (home directory):"
  du -sh "${HOME}" 2>/dev/null || echo "(Unable to calculate)"
  echo ""

  # ========================================================================
  echo "SECTION 2: VS Code Remote Configuration"
  echo "========================================================================"
  echo ""

  if [ -f ".devcontainer/devcontainer.json" ]; then
    echo "devcontainer.json (excerpt):"
    grep -E '"image"|"node|"features' .devcontainer/devcontainer.json | head -10
    echo ""
  fi

  if [ -f ".vscode/settings.json" ]; then
    echo ".vscode/settings.json exists: YES"
  else
    echo ".vscode/settings.json exists: NO"
  fi
  echo ""

  # ========================================================================
  echo "SECTION 3: Extension Host Status"
  echo "========================================================================"
  echo ""

  echo "Running processes (extensionHost):"
  ps aux | grep -i "extensionHost" | grep -v grep || echo "(None running)"
  echo ""

  echo "Running processes (code-server):"
  ps aux | grep -i "code-server" | grep -v grep || echo "(None running)"
  echo ""

  # ========================================================================
  echo "SECTION 4: Lock File Analysis"
  echo "========================================================================"
  echo ""

  LOCK_COUNT=$(find "${HOME}/.vscode-remote/data/User/workspaceStorage" -name "vscode.lock" 2>/dev/null | wc -l)
  echo "Lock files found: $LOCK_COUNT"
  echo ""

  if [ $LOCK_COUNT -gt 0 ]; then
    echo "Lock file details:"
    find "${HOME}/.vscode-remote/data/User/workspaceStorage" -name "vscode.lock" -ls 2>/dev/null || echo "(Unable to list)"
    echo ""
  fi

  # ========================================================================
  echo "SECTION 5: Extension State"
  echo "========================================================================"
  echo ""

  echo "Extensions directory size:"
  du -sh "${HOME}/.vscode-remote/extensions" 2>/dev/null || echo "(Not available)"
  echo ""

  echo "Number of installed extensions:"
  find "${HOME}/.vscode-remote/extensions" -maxdepth 1 -type d 2>/dev/null | wc -l
  echo ""

  echo "Recent extension installations:"
  ls -dt "${HOME}/.vscode-remote/extensions"/*/ 2>/dev/null | head -10 | xargs -I {} basename {} || echo "(None)"
  echo ""

  # ========================================================================
  echo "SECTION 6: Network Connectivity"
  echo "========================================================================"
  echo ""

  echo "GitHub API (api.github.com):"
  if timeout 5 curl -s -I https://api.github.com 2>&1 | head -3; then
    echo "Status: ✓ Reachable"
  else
    echo "Status: ✗ Unreachable"
  fi
  echo ""

  echo "MCP API (api.mcp.github.com):"
  if timeout 5 curl -s -I https://api.mcp.github.com 2>&1 | head -3; then
    echo "Status: ✓ Reachable"
  else
    echo "Status: ✗ Unreachable"
  fi
  echo ""

  echo "DNS Resolution:"
  nslookup github.com 2>/dev/null | grep -E "Name:|Address:" || echo "(Unable to resolve)"
  echo ""

  # ========================================================================
  echo "SECTION 7: Extension Host Logs (Recent)"
  echo "========================================================================"
  echo ""

  LOG_DIR="${HOME}/.vscode-remote/data/User/logs"
  if [ -d "$LOG_DIR" ]; then
    echo "Recent log files:"
    ls -lart "$LOG_DIR" 2>/dev/null | tail -10 || echo "(Unable to list)"
    echo ""

    EXTHOST_LOG=$(find "$LOG_DIR" -name "*exthost*" -type f 2>/dev/null | head -1)
    if [ -n "$EXTHOST_LOG" ]; then
      echo "Extension Host Log (last 50 lines):"
      echo "File: $EXTHOST_LOG"
      echo ""
      tail -50 "$EXTHOST_LOG" 2>/dev/null || echo "(Unable to read)"
      echo ""
    fi
  else
    echo "Log directory not found: $LOG_DIR"
    echo ""
  fi

  # ========================================================================
  echo "SECTION 8: Error Pattern Analysis"
  echo "========================================================================"
  echo ""

  if [ -n "$EXTHOST_LOG" ] && [ -f "$EXTHOST_LOG" ]; then
    echo "Critical Errors Found:"
    grep -i "error" "$EXTHOST_LOG" 2>/dev/null | wc -l
    echo " total errors"
    echo ""

    echo "Navigator Errors:"
    grep -i "navigator.*global" "$EXTHOST_LOG" 2>/dev/null | wc -l
    echo " occurrences"
    echo ""

    echo "Lock File Errors:"
    grep -i "lock" "$EXTHOST_LOG" 2>/dev/null | wc -l
    echo " occurrences"
    echo ""

    echo "Socket/Network Errors:"
    grep -i "socket\|timeout\|Failed to fetch" "$EXTHOST_LOG" 2>/dev/null | wc -l
    echo " occurrences"
    echo ""
  fi

  # ========================================================================
  echo "SECTION 9: Recommendations"
  echo "========================================================================"
  echo ""

  if grep -q "navigator.*global" "${EXTHOST_LOG:-/dev/null}" 2>/dev/null; then
    echo "⚠ Navigator polyfill issue detected"
    echo "  → Update Node.js version in devcontainer.json"
    echo "  → Run: npm run build && npm install"
    echo ""
  fi

  if [ $LOCK_COUNT -gt 0 ]; then
    echo "⚠ Workspace locks detected"
    echo "  → Run: bash scripts/fix-extension-host.sh"
    echo ""
  fi

  if ! timeout 5 curl -s -I https://api.github.com > /dev/null 2>&1; then
    echo "⚠ Network connectivity issues"
    echo "  → Check internet connection"
    echo "  → Check firewall/VPN settings"
    echo ""
  fi

  echo "Generated: $(date)"

} | tee "$REPORT_FILE"

echo ""
echo -e "${GREEN}✓ Diagnostic report saved to: ${REPORT_FILE}${NC}"
echo ""
echo -e "${YELLOW}To view the report:${NC}"
echo "  cat $REPORT_FILE"
echo ""
