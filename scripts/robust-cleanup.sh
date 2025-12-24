#!/bin/bash

# Robust Dependabot Branch Cleanup Script
# Handles missing branches gracefully and provides comprehensive reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
LOG_FILE="$REPO_ROOT/cleanup-log-$(date +%Y%m%d-%H%M%S).log"

# Initialize counters
SUCCESS_COUNT=0
FAILED_COUNT=0
ALREADY_REMOVED_COUNT=0
TOTAL_ATTEMPTS=0

echo "=== Trade-X-Pro-Global Repository Cleanup ===" | tee "$LOG_FILE"
echo "Date: $(date)" | tee -a "$LOG_FILE"
echo "Script: $0" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to log messages
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to log with color
log_color() {
    local color=$1
    local message=$2
    echo -e "${color}$message${NC}" | tee -a "$LOG_FILE"
}

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        log_color "$RED" "❌ Error: Not in a git repository. Please run this script from the repository root."
        exit 1
    fi
}

# Function to check current branch
check_branch() {
    local current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        log_color "$YELLOW" "⚠️  Warning: You are not on the main/master branch. Current branch: $current_branch"
        log_color "$YELLOW" "   It's recommended to be on the main branch before deleting remote branches."
        read -p "   Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_color "$BLUE" "ℹ️  Aborted by user."
            exit 0
        fi
    fi
    log_color "$GREEN" "✅ Current branch: $current_branch"
}

# Function to check remote connectivity
check_remote() {
    log "📡 Checking remote connectivity..."
    if ! git ls-remote origin >/dev/null 2>&1; then
        log_color "$RED" "❌ Error: Cannot connect to remote repository"
        exit 1
    fi
    log_color "$GREEN" "✅ Remote repository accessible"
}

# Function to get list of existing remote branches
get_existing_branches() {
    log "🔍 Fetching remote branch list..."
    git fetch --all --prune 2>/dev/null || true
    
    # Get all remote branches
    REMOTE_BRANCHES=$(git ls-remote --heads origin 2>/dev/null | grep -E "refs/heads/dependabot/npm_and_yarn/" | sed 's|refs/heads/||' | sort)
    
    log "📋 Found $(echo "$REMOTE_BRANCHES" | wc -l) Dependabot branches on remote"
}

# Function to remove a single branch with error handling
remove_branch() {
    local branch=$1
    local branch_name=$(basename "$branch")
    
    TOTAL_ATTEMPTS=$((TOTAL_ATTEMPTS + 1))
    
    log "🗑️  Processing: $branch"
    
    # Check if branch exists on remote
    if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
        log_color "$YELLOW" "   ⏭️  Already removed or doesn't exist: $branch_name"
        ALREADY_REMOVED_COUNT=$((ALREADY_REMOVED_COUNT + 1))
        return 0
    fi
    
    # Attempt to remove the branch
    if git push origin --delete "$branch" 2>/dev/null; then
        log_color "$GREEN" "   ✅ Successfully removed: $branch_name"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        return 0
    else
        log_color "$RED" "   ❌ Failed to remove: $branch_name"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        return 1
    fi
}

# Function to display final summary
display_summary() {
    echo "" | tee -a "$LOG_FILE"
    log_color "$BLUE" "=== CLEANUP SUMMARY ===" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    log "📊 Statistics:"
    log "   Total attempts: $TOTAL_ATTEMPTS"
    log "   ✅ Successfully removed: $SUCCESS_COUNT"
    log "   ⏭️  Already removed/skipped: $ALREADY_REMOVED_COUNT"
    log "   ❌ Failed to remove: $FAILED_COUNT"
    echo "" | tee -a "$LOG_FILE"
    
    # Calculate percentages
    if [ $TOTAL_ATTEMPTS -gt 0 ]; then
        SUCCESS_RATE=$(( (SUCCESS_COUNT * 100) / TOTAL_ATTEMPTS ))
        log "   Success rate: $SUCCESS_RATE%"
    fi
    
    echo "" | tee -a "$LOG_FILE"
    
    if [ $FAILED_COUNT -eq 0 ]; then
        log_color "$GREEN" "🎉 All possible branches cleaned up successfully!"
    else
        log_color "$YELLOW" "⚠️  Some branches could not be removed. Check log for details."
    fi
    
    echo "" | tee -a "$LOG_FILE"
    log_color "$BLUE" "📋 Repository Status:"
    log "   Main branch: $(git branch --show-current)"
    log "   Remote branches remaining: $(git ls-remote --heads origin | wc -l)"
    log "   Dependabot branches remaining: $(git ls-remote --heads origin | grep -c dependabot || echo 0)"
    echo "" | tee -a "$LOG_FILE"
    
    log "📄 Full log saved to: $LOG_FILE"
}

# Main execution
main() {
    cd "$REPO_ROOT"
    
    # Pre-flight checks
    check_git_repo
    check_branch
    check_remote
    
    # Get current branch list
    get_existing_branches
    
    echo "" | tee -a "$LOG_FILE"
    log_color "$BLUE" "🚀 Starting cleanup process..."
    echo "" | tee -a "$LOG_FILE"
    
    # Process each branch
    if [ -n "$REMOTE_BRANCHES" ]; then
        echo "$REMOTE_BRANCHES" | while IFS= read -r branch; do
            if [ -n "$branch" ]; then
                remove_branch "$branch"
            fi
        done
    else
        log_color "$YELLOW" "ℹ️  No Dependabot branches found on remote"
    fi
    
    # Display final summary
    display_summary
}

# Execute main function
main "$@"