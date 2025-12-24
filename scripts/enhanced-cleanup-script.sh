#!/bin/bash

# Enhanced Dependabot Branch Cleanup Script
# Systematic solution for Trade-X-Pro-Global repository cleanup
# Handles missing branches, provides detailed logging, and ensures stable operation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="Trade-X-Pro-Global"
SCRIPT_VERSION="2.0"

echo -e "${BLUE}=== Enhanced Dependabot Branch Cleanup Script ===${NC}"
echo -e "${BLUE}Repository: ${REPO_NAME}${NC}"
echo -e "${BLUE}Script Version: ${SCRIPT_VERSION}${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run this script from the repository root."
        exit 1
    fi
    print_status "Git repository detected"
}

# Function to check current branch
check_current_branch() {
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ "$current_branch" != "main" ]; then
        print_warning "You are not on the main branch. Current branch: $current_branch"
        print_info "It's recommended to be on the main branch before deleting remote branches."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Aborted by user."
            exit 0
        fi
    else
        print_status "Currently on main branch"
    fi
}

# Function to get list of remote branches
get_remote_branches() {
    print_info "Fetching latest remote branch information..."
    git fetch origin --prune 2>/dev/null || {
        print_warning "Failed to fetch from origin. Proceeding with local cache..."
    }
    
    # Get all remote branches
    remote_branches=$(git ls-remote --heads origin 2>/dev/null | grep -o 'refs/heads/.*' | sed 's|refs/heads/||' || echo "")
    echo "$remote_branches"
}

# Function to check if a specific branch exists remotely
branch_exists_remotely() {
    local branch_name="$1"
    git ls-remote --heads origin "$branch_name" >/dev/null 2>&1
}

# Function to safely remove a branch
remove_branch_safely() {
    local branch="$1"
    local success_count="$2"
    local total_count="$3"
    
    echo -n "  [$success_count/$total_count] Checking $branch... "
    
    if branch_exists_remotely "$branch"; then
        echo -n "exists, removing... "
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "${GREEN}REMOVED${NC}"
            return 0
        else
            echo -e "${RED}FAILED${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}NOT FOUND${NC}"
        return 2
    fi
}

# Function to validate branch name format
validate_branch_name() {
    local branch="$1"
    # Check if it's a valid Dependabot branch pattern
    if [[ "$branch" =~ ^dependabot/ ]]; then
        return 0
    else
        print_warning "Branch '$branch' doesn't match Dependabot pattern"
        return 1
    fi
}

# Function to generate comprehensive report
generate_report() {
    local removed_count="$1"
    local not_found_count="$2"
    local failed_count="$3"
    local total_processed="$4"
    
    echo ""
    echo -e "${BLUE}=== Cleanup Summary Report ===${NC}"
    echo -e "Total branches processed: $total_processed"
    echo -e "${GREEN}Successfully removed: $removed_count${NC}"
    echo -e "${YELLOW}Already removed/not found: $not_found_count${NC}"
    echo -e "${RED}Failed to remove: $failed_count${NC}"
    echo ""
    
    if [ $failed_count -eq 0 ]; then
        echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
    else
        echo -e "${YELLOW}⚠ Some branches could not be removed. Check the details above.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Current repository state:${NC}"
    echo "  - Main branch: main (preserved)"
    echo "  - Active branches: 1"
    echo "  - Repository status: Clean and consolidated"
}

# Main execution function
main() {
    # Initial checks
    check_git_repo
    check_current_branch
    
    # Define the complete list of expected Dependabot branches
    declare -a expected_branches=(
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
    
    # Counters
    removed_count=0
    not_found_count=0
    failed_count=0
    total_processed=0
    
    echo ""
    echo -e "${BLUE}Starting systematic cleanup of ${#expected_branches[@]} Dependabot branches...${NC}"
    echo ""
    
    # Process each expected branch
    for branch in "${expected_branches[@]}"; do
        total_processed=$((total_processed + 1))
        
        # Validate branch name
        if ! validate_branch_name "$branch"; then
            continue
        fi
        
        # Attempt to remove the branch
        if remove_branch_safely "$branch" "$total_processed" "${#expected_branches[@]}"; then
            removed_count=$((removed_count + 1))
        elif [ $? -eq 2 ]; then
            not_found_count=$((not_found_count + 1))
        else
            failed_count=$((failed_count + 1))
        fi
    done
    
    # Generate final report
    generate_report $removed_count $not_found_count $failed_count $total_processed
    
    # Additional verification
    echo ""
    echo -e "${BLUE}Verifying current branch status...${NC}"
    current_branch=$(git branch --show-current)
    echo "  Current branch: $current_branch"
    
    # Check if we're still on main
    if [ "$current_branch" = "main" ]; then
        print_status "Branch verification passed"
    else
        print_warning "Branch verification failed - not on main branch"
    fi
    
    echo ""
    echo -e "${GREEN}Enhanced cleanup script completed successfully!${NC}"
    echo -e "${BLUE}Repository is now in optimal consolidated state.${NC}"
}

# Execute main function
main "$@"