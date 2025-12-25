#!/bin/bash

# Repository Verification Script
# Comprehensive verification of Trade-X-Pro-Global repository state
# Ensures stable and permanent solution

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

echo -e "${BLUE}=== Trade-X-Pro-Global Repository Verification ===${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo ""

# Function to verify git repository
verify_git_repo() {
    print_info "Verifying Git repository integrity..."
    
    if [ ! -d ".git" ]; then
        print_error "Not in a Git repository"
        exit 1
    fi
    
    # Check if repository is clean
    if git diff-index --quiet HEAD --; then
        print_status "Working directory is clean"
    else
        print_warning "Working directory has untracked changes"
        git status --porcelain
    fi
    
    # Check if index is clean
    if git diff-files --quiet; then
        print_status "Index is clean"
    else
        print_warning "Index has uncommitted changes"
    fi
}

# Function to verify branch status
verify_branch_status() {
    print_info "Verifying branch status..."
    
    # Get current branch
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    print_status "Current branch: $current_branch"
    
    # Check if main branch exists
    if git rev-parse --verify main >/dev/null 2>&1; then
        print_status "Main branch exists locally"
    else
        print_error "Main branch does not exist locally"
    fi
    
    # Check remote tracking
    if git rev-parse --verify origin/main >/dev/null 2>&1; then
        print_status "Main branch tracks remote origin/main"
    else
        print_warning "Main branch may not be tracking remote properly"
    fi
}

# Function to verify remote branches
verify_remote_branches() {
    print_info "Verifying remote branches..."
    
    # Fetch latest remote info
    print_info "Fetching latest remote information..."
    git fetch origin --prune 2>/dev/null || print_warning "Failed to fetch from origin"
    
    # List all remote branches
    remote_branches=$(git ls-remote --heads origin 2>/dev/null | grep -o 'refs/heads/.*' | sed 's|refs/heads/||' || echo "")
    
    if [ -z "$remote_branches" ]; then
        print_warning "No remote branches found"
    else
        print_status "Remote branches found:"
        echo "$remote_branches" | while read branch; do
            if [ -n "$branch" ]; then
                echo "  - $branch"
            fi
        done
    fi
    
    # Check for Dependabot branches
    dependabot_count=$(echo "$remote_branches" | grep -c "^dependabot/" || true)
    dependabot_count=$(echo "$dependabot_count" | tr -d '[:space:]')
    if [ -z "$dependabot_count" ]; then dependabot_count=0; fi
    print_info "Found $dependabot_count Dependabot branches"
    
    if [ "$dependabot_count" -eq 0 ]; then
        print_status "No Dependabot branches found (cleanup successful)"
    else
        print_warning "Dependabot branches still exist:"
        echo "$remote_branches" | grep "^dependabot/" | while read branch; do
            echo "  - $branch"
        done
    fi
}

# Function to verify commit history
verify_commit_history() {
    print_info "Verifying commit history..."
    
    # Get latest commit
    latest_commit=$(git rev-parse HEAD 2>/dev/null)
    latest_message=$(git log -1 --oneline 2>/dev/null)
    
    print_status "Latest commit: $latest_commit"
    print_status "Latest message: $latest_message"
    
    # Check if repository has commits
    commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    print_status "Total commits: $commit_count"
    
    if [ "$commit_count" -gt 0 ]; then
        print_status "Repository has commit history"
    else
        print_error "Repository appears to be empty"
    fi
}

# Function to verify remote connection
verify_remote_connection() {
    print_info "Verifying remote connection..."
    
    # Check remote URL
    remote_url=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$remote_url" ]; then
        print_status "Remote URL: $remote_url"
    else
        print_error "No remote origin configured"
    fi
    
    # Test connection to remote
    if git ls-remote origin HEAD >/dev/null 2>&1; then
        print_status "Remote connection successful"
    else
        print_error "Cannot connect to remote repository"
    fi
}

# Function to generate final report
generate_final_report() {
    print_info "Generating final verification report..."
    
    echo ""
    echo -e "${BLUE}=== Final Verification Report ===${NC}"
    echo ""
    
    # Repository status summary
    current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
    remote_branches=$(git ls-remote --heads origin 2>/dev/null | grep -o 'refs/heads/.*' | sed 's|refs/heads/||' || echo "")
    remote_branch_count=$(echo "$remote_branches" | grep -c . || echo "0")
    dependabot_count=$(echo "$remote_branches" | grep -c "^dependabot/" || true)
    dependabot_count=$(echo "$dependabot_count" | tr -d '[:space:]')
    if [ -z "$dependabot_count" ]; then dependabot_count=0; fi
    commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    
    echo -e "${BLUE}Repository Status:${NC}"
    echo "  Current Branch: $current_branch"
    echo "  Total Commits: $commit_count"
    echo "  Remote Branches: $remote_branch_count"
    echo "  Dependabot Branches: $dependabot_count"
    echo ""
    
    echo -e "${BLUE}Branch Analysis:${NC}"
    if [ "$current_branch" = "main" ]; then
        echo -e "  ${GREEN}✓${NC} On main branch"
    else
        echo -e "  ${YELLOW}⚠${NC} Not on main branch: $current_branch"
    fi
    
    if [ "$dependabot_count" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} No Dependabot branches (cleanup successful)"
    else
        echo -e "  ${YELLOW}⚠${NC} $dependabot_count Dependabot branches remain"
    fi
    
    if [ "$commit_count" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} Repository has commit history"
    else
        echo -e "  ${RED}✗${NC} Repository appears empty"
    fi
    
    # Overall status
    echo ""
    echo -e "${BLUE}Overall Status:${NC}"
    if [ "$current_branch" = "main" ] && [ "$dependabot_count" -eq 0 ] && [ "$commit_count" -gt 0 ]; then
        echo -e "${GREEN}🎉 Repository is in optimal consolidated state!${NC}"
        echo -e "${GREEN}✓ All verification checks passed${NC}"
    else
        echo -e "${YELLOW}⚠ Repository requires attention${NC}"
        echo -e "${YELLOW}⚠ Some verification checks failed${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    if [ "$dependabot_count" -gt 0 ]; then
        echo "  - Run enhanced cleanup script to remove remaining Dependabot branches"
        echo "  - Command: ./enhanced-cleanup-script.sh"
    fi
    if [ "$current_branch" != "main" ]; then
        echo "  - Switch to main branch: git checkout main"
    fi
    echo "  - Continue with normal development workflow"
}

# Main verification function
main_verification() {
    echo "Starting comprehensive repository verification..."
    echo ""
    
    verify_git_repo
    echo ""
    
    verify_branch_status
    echo ""
    
    verify_remote_branches
    echo ""
    
    verify_commit_history
    echo ""
    
    verify_remote_connection
    echo ""
    
    generate_final_report
}

# Execute verification
main_verification "$@"