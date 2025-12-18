#!/bin/bash
#
# VSCode Maintenance & Cleanup Script
# Purpose: Clear stale VSCode caches and logs to maintain optimal performance
# Usage: ./vscode-maintenance.sh [--aggressive]
#
# This script implements the preventive maintenance recommendations from the
# VSCode Error Analysis documentation. Run weekly or when experiencing slowdowns.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Configuration
if [[ "$OSTYPE" == "darwin"* ]]; then
  VSCode_SUPPORT_DIR="$HOME/Library/Application Support/Code"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  VSCode_SUPPORT_DIR="$HOME/.config/Code"
else
  log_error "Unsupported OS: $OSTYPE"
  exit 1
fi
BACKUP_DIR="$HOME/VSCode-Backups"
MAX_LOG_DAYS=7
AGGRESSIVE_MODE=${1:-""}

# Check if VSCode is running
if pgrep -x "Electron" > /dev/null && pgrep -f "Visual Studio Code" > /dev/null; then
  log_warn "VSCode is running. Attempting to close it..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'quit app "Visual Studio Code"' 2>/dev/null || true
  else
    pkill -f 'code|Visual Studio Code' 2>/dev/null || killall -q code 2>/dev/null || true
  fi
  sleep 2
  if pgrep -x "Electron" > /dev/null && pgrep -f "Visual Studio Code" > /dev/null; then
    log_error "Failed to close VSCode. Please close it manually and re-run the script."
    exit 1
  fi
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# 1. Clear old log files (keep last 7 days)
log_info "Clearing old log files (older than $MAX_LOG_DAYS days)..."
find "$VSCode_SUPPORT_DIR/logs" -type f -mtime +$MAX_LOG_DAYS -delete 2>/dev/null || true

# 2. Clear extension storage (optional - aggressive mode)
if [[ "$AGGRESSIVE_MODE" == "--aggressive" ]]; then
  log_warn "AGGRESSIVE MODE: About to clear VSCode extension storage (globalStorage)"
  log_warn "This will permanently delete user data including extension settings and cached data"

  # Prompt for confirmation
  echo ""
  echo "⚠️  This action is irreversible and will delete VSCode globalStorage data."
  echo "   Directory to be deleted: $VSCode_SUPPORT_DIR/User/globalStorage"
  echo ""
  read -p "Type 'yes' to confirm deletion or 'no' to skip: " CONFIRM

  if [[ "$CONFIRM" == "yes" ]]; then
    log_info "Creating timestamped backup before deletion..."

    # Create timestamped backup
    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/globalStorage_backup_$BACKUP_TIMESTAMP"

    if cp -r "$VSCode_SUPPORT_DIR/User/globalStorage" "$BACKUP_PATH" 2>/dev/null; then
      log_info "Backup created at: $BACKUP_PATH"
    else
      log_warn "Backup creation failed, but continuing with deletion..."
    fi

    # Proceed with deletion
    log_info "Clearing extension storage..."
    rm -rf "$VSCode_SUPPORT_DIR/User/globalStorage"
    mkdir -p "$VSCode_SUPPORT_DIR/User/globalStorage"
    log_info "Extension storage cleared"
  else
    log_info "Extension storage deletion skipped (user cancelled)"
  fi
else
  log_info "Skipping extension storage (use --aggressive to clear)"
fi

# 3. Clear workspace storage
log_info "Clearing workspace storage..."
find "$VSCode_SUPPORT_DIR/User/workspaceStorage" -type f -mtime +$MAX_LOG_DAYS -delete 2>/dev/null || true

# 4. Clear chat session databases
log_info "Checking chat session databases for corruption and backing up..."

# Find all chat-related sqlite files
find "$VSCode_SUPPORT_DIR" -name "*chat*.sqlite*" | while read -r chat_file; do
  log_info "Processing: $chat_file"

  # Create timestamped backup
  BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_PATH="$BACKUP_DIR/$(basename "$chat_file").backup_$BACKUP_TIMESTAMP"

  # Attempt to backup the file with preserved permissions
  if cp -p "$chat_file" "$BACKUP_PATH" 2>/dev/null; then
    log_info "Backup created: $BACKUP_PATH"

    # Check if sqlite3 command is available for integrity check
    if command -v sqlite3 >/dev/null 2>&1; then
      # Run integrity check
      if sqlite3 "$chat_file" "PRAGMA integrity_check;" 2>/dev/null | grep -q "ok"; then
        log_info "File integrity OK, keeping original: $chat_file"
      else
        log_warn "File corruption detected, removing: $chat_file"
        if rm "$chat_file" 2>/dev/null; then
          log_info "Corrupted file removed successfully"
        else
          log_error "Failed to remove corrupted file: $chat_file"
        fi
      fi
    else
      log_warn "sqlite3 not available, cannot check integrity. Keeping file: $chat_file"
    fi
  else
    log_error "Failed to backup file: $chat_file"
    log_warn "Skipping deletion to preserve original data"
  fi
done

# 5. Clear cache directories
log_info "Clearing cache directories..."
rm -rf "$VSCode_SUPPORT_DIR/Cache"/*
rm -rf "$VSCode_SUPPORT_DIR/CachedData"/*

# 6. Clear code-search cache
log_info "Clearing code-search cache..."
find "$VSCode_SUPPORT_DIR" -name "*.code-search" -delete 2>/dev/null || true

# 7. Validate settings.json
log_info "Validating settings.json..."

# Check if settings.json exists
if [[ ! -f "$VSCode_SUPPORT_DIR/User/settings.json" ]]; then
  log_info "settings.json not found, skipping validation"
else
  # Check if Node.js is available
  if ! test -x "$(command -v node)"; then
    log_warn "Node.js not found in PATH, skipping JSON validation"
    log_warn "Install Node.js to enable settings.json validation"
  else
    # Both file exists and Node.js is available - attempt validation
    if ! node -e "JSON.parse(require('fs').readFileSync(\"$VSCode_SUPPORT_DIR/User/settings.json\", 'utf8'))" 2>/dev/null; then
      log_warn "settings.json appears corrupted, backing up..."
      cp "$VSCode_SUPPORT_DIR/User/settings.json" \
         "$BACKUP_DIR/settings.json.corrupted.$(date +%s)"
    fi
  fi
fi

# 8. Summary
echo ""
echo "=========================================="
echo "VSCode Maintenance Complete"
echo "=========================================="
log_info "Log files cleaned"
log_info "Cache cleared"
log_info "Chat databases cleared"
echo ""
log_warn "Note: Restart VSCode to apply optimizations"
echo ""
echo "Backups stored in: $BACKUP_DIR"
echo ""
