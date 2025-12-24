#!/bin/bash

# Complete Repository Automation Script
# Systematic solution for Trade-X-Pro-Global repository maintenance
# Ensures stable and permanent solution with comprehensive error handling

set -e

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Script configuration
SCRIPT_NAME="Trade-X-Pro-Global Repository Automation"
SCRIPT_VERSION="3.0"
REPO_NAME="Trade-X-Pro-Global"

# Counters for tracking
total_operations=0
successful_operations=0
failed_operations=0

# Function to increment counters
increment_counter() {
    total_operations=$((total_operations + 1))
    if [ "$1" = "success" ]; then
        successful_operations=$((successful_operations + 1))
    elif [ "$1" = "failed" ]; then
        failed_operations=$((failed_operations + 1))
    fi
}

# Function to display header
show_header() {
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}  $SCRIPT_NAME${NC}"
    echo -e "${BOLD}${BLUE}  Version: $SCRIPT_VERSION${NC}"
    echo -e "${BOLD}${BLUE}  Repository: $REPO_NAME${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo ""
    log "Starting automated repository maintenance"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        error "Not in a Git repository"
        exit 1
    fi
    success "Git repository detected"
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        error "Git command not found"
        exit 1
    fi
    success "Git command available"
    
    # Check if we have remote origin
    if ! git remote get-url origin &> /dev/null; then
        error "No remote origin configured"
        exit 1
    fi
    success "Remote origin configured"
    
    increment_counter "success"
}

# Function to backup current state
backup_state() {
    log "Creating backup of current repository state..."
    
    # Create backup directory
    backup_dir="repository-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup important files
    cp -r .git "$backup_dir/" 2>/dev/null || warning "Could not backup .git directory"
    cp package.json "$backup_dir/" 2>/dev/null || warning "Could not backup package.json"
    cp README.md "$backup_dir/" 2>/dev/null || warning "Could not backup README.md"
    
    success "Backup created in $backup_dir"
    increment_counter "success"
}

# Function to perform repository verification
perform_verification() {
    log "Performing comprehensive repository verification..."
    
    # Run verification script
    if [ -f "verify-repository.sh" ]; then
        chmod +x verify-repository.sh
        if ./verify-repository.sh; then
            success "Repository verification completed"
            increment_counter "success"
        else
            warning "Repository verification had issues"
            increment_counter "failed"
        fi
    else
        warning "Verification script not found, performing basic checks"
        basic_verification
        increment_counter "success"
    fi
}

# Function for basic verification
basic_verification() {
    log "Performing basic repository checks..."
    
    # Check current branch
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    info "Current branch: $current_branch"
    
    # Check remote branches
    remote_branches=$(git ls-remote --heads origin 2>/dev/null | wc -l || echo "0")
    info "Remote branches found: $remote_branches"
    
    # Check for Dependabot branches
    dependabot_count=$(git ls-remote --heads origin 2>/dev/null | grep -c "dependabot/" || echo "0")
    info "Dependabot branches found: $dependabot_count"
    
    success "Basic verification completed"
}

# Function to perform enhanced cleanup
perform_enhanced_cleanup() {
    log "Performing enhanced Dependabot branch cleanup..."
    
    # Run enhanced cleanup script
    if [ -f "enhanced-cleanup-script.sh" ]; then
        chmod +x enhanced-cleanup-script.sh
        if ./enhanced-cleanup-script.sh; then
            success "Enhanced cleanup completed"
            increment_counter "success"
        else
            warning "Enhanced cleanup had issues"
            increment_counter "failed"
        fi
    else
        warning "Enhanced cleanup script not found, using basic cleanup"
        basic_cleanup
        increment_counter "success"
    fi
}

# Function for basic cleanup
basic_cleanup() {
    log "Performing basic Dependabot branch cleanup..."
    
    # Define expected branches
    branches=(
        "dependabot/npm_and_yarn/caniuse-lite-1.0.30001761"
        "dependabot/npm_and_yarn/cross-env-10.1.0"
        "dependabot/npm_and_yarn/globals-16.5.0"
        "dependabot/npm_and_yarn/react-hook-form-7.69.0"
        "dependabot/npm_and_yarn/react-router-dom-7.11.0"
        "dependabot/npm_and_yarn/recharts-3.6.0"
        "dependabot/npm_and_yarn/sentry/react-10.32.1"
        "dependabot/npm_and_yarn/supabase/supabase-js-2.89.0"
        "dependabot/npm_and_yarn/types/node-25.0.3"
        "dependabot/npm_and_yarn/sharp-0.34.5"
    )
    
    removed_count=0
    not_found_count=0
    
    for branch in "${branches[@]}"; do
        if git ls-remote --heads origin "$branch" >/dev/null 2>&1; then
            if git push origin --delete "$branch" 2>/dev/null; then
                success "Removed: $branch"
                removed_count=$((removed_count + 1))
            else
                warning "Failed to remove: $branch"
            fi
        else
            not_found_count=$((not_found_count + 1))
        fi
    done
    
    info "Basic cleanup summary: $removed_count removed, $not_found_count not found"
}

# Function to validate final state
validate_final_state() {
    log "Validating final repository state..."
    
    # Check current branch
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ "$current_branch" = "main" ]; then
        success "Currently on main branch"
    else
        warning "Not on main branch: $current_branch"
    fi
    
    # Check for remaining Dependabot branches
    dependabot_count=$(git ls-remote --heads origin 2>/dev/null | grep -c "dependabot/" || echo "0")
    if [ "$dependabot_count" -eq 0 ]; then
        success "No Dependabot branches found"
    else
        warning "$dependabot_count Dependabot branches still exist"
    fi
    
    # Check repository cleanliness
    if git diff-index --quiet HEAD --; then
        success "Working directory is clean"
    else
        warning "Working directory has untracked changes"
    fi
    
    increment_counter "success"
}

# Function to generate comprehensive report
generate_comprehensive_report() {
    log "Generating comprehensive automation report..."
    
    echo ""
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}  AUTOMATION COMPLETION REPORT${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo ""
    
    # Summary statistics
    echo -e "${BOLD}Summary Statistics:${NC}"
    echo "  Total Operations: $total_operations"
    echo "  Successful: $successful_operations"
    echo "  Failed: $failed_operations"
    echo ""
    
    # Calculate success rate
    if [ $total_operations -gt 0 ]; then
        success_rate=$(( (successful_operations * 100) / total_operations ))
        echo "  Success Rate: $success_rate%"
    fi
    
    echo ""
    
    # Current repository state
    echo -e "${BOLD}Current Repository State:${NC}"
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    dependabot_count=$(git ls-remote --heads origin 2>/dev/null | grep -c "dependabot/" || echo "0")
    commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    
    echo "  Current Branch: $current_branch"
    echo "  Dependabot Branches: $dependabot_count"
    echo "  Total Commits: $commit_count"
    
    # Overall assessment
    echo ""
    echo -e "${BOLD}Overall Assessment:${NC}"
    if [ "$current_branch" = "main" ] && [ "$dependabot_count" -eq 0 ] && [ "$successful_operations" -eq "$total_operations" ]; then
        echo -e "${GREEN}🎉 Repository automation completed successfully!${NC}"
        echo -e "${GREEN}✓ All operations successful${NC}"
        echo -e "${GREEN}✓ Repository in optimal state${NC}"
        echo -e "${GREEN}✓ Ready for continued development${NC}"
    else
        echo -e "${YELLOW}⚠ Repository automation completed with issues${NC}"
        echo -e "${YELLOW}⚠ Some operations may need manual attention${NC}"
        
        if [ "$current_branch" != "main" ]; then
            echo -e "${YELLOW}⚠ Not on main branch${NC}"
        fi
        if [ "$dependabot_count" -gt 0 ]; then
            echo -e "${YELLOW}⚠ Dependabot branches remain${NC}"
        fi
        if [ "$failed_operations" -gt 0 ]; then
            echo -e "${YELLOW}⚠ $failed_operations operations failed${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BOLD}Next Steps:${NC}"
    if [ "$dependabot_count" -gt 0 ]; then
        echo "  1. Run enhanced cleanup script again: ./enhanced-cleanup-script.sh"
    fi
    if [ "$current_branch" != "main" ]; then
        echo "  2. Switch to main branch: git checkout main"
    fi
    echo "  3. Verify repository state: ./verify-repository.sh"
    echo "  4. Continue with normal development workflow"
    
    echo ""
    echo -e "${BLUE}Automation completed at $(date)${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to cleanup temporary files
cleanup_temp_files() {
    log "Cleaning up temporary files..."
    
    # Remove temporary files if they exist
    rm -f cleanup-dependabot-branches.sh
    rm -f execute-cleanup.sh
    
    success "Temporary files cleaned up"
}

# Main execution function
main() {
    # Show header
    show_header
    
    # Execute all operations
    check_prerequisites
    backup_state
    perform_verification
    perform_enhanced_cleanup
    validate_final_state
    cleanup_temp_files
    
    # Generate final report
    generate_comprehensive_report
    
    # Exit with appropriate code
    if [ "$failed_operations" -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Execute main function
main "$@"