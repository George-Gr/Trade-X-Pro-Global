#!/usr/bin/env bash

# Copilot & TypeScript Configuration Validation & Fix Script
# Version: 1.0
# Purpose: Validate and fix GitHub Copilot and TypeScript configuration issues

set -e

# Navigate to project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

COLORS_RED='\033[0;31m'
COLORS_GREEN='\033[0;32m'
COLORS_YELLOW='\033[1;33m'
COLORS_BLUE='\033[0;34m'
COLORS_NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_header() {
    echo -e "\n${COLORS_BLUE}=== $1 ===${COLORS_NC}\n"
}

log_success() {
    echo -e "${COLORS_GREEN}✓ $1${COLORS_NC}"
}

log_warning() {
    echo -e "${COLORS_YELLOW}⚠ $1${COLORS_NC}"
}

log_error() {
    echo -e "${COLORS_RED}✗ $1${COLORS_NC}"
}

check_file_exists() {
    if [ -f "$1" ]; then
        log_success "Found: $(basename $1)"
        return 0
    else
        log_error "Missing: $(basename $1)"
        return 1
    fi
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

validate_tsconfig_json() {
    log_header "Validating TypeScript Configuration Files"
    
    local all_valid=true
    
    # Check main tsconfig files exist
    check_file_exists "$PROJECT_ROOT/tsconfig.json" || all_valid=false
    check_file_exists "$PROJECT_ROOT/tsconfig.base.json" || all_valid=false
    check_file_exists "$PROJECT_ROOT/tsconfig.app.json" || all_valid=false
    check_file_exists "$PROJECT_ROOT/tsconfig.eslint.json" || all_valid=false
    check_file_exists "$PROJECT_ROOT/tsconfig.strict.json" || all_valid=false
    check_file_exists "$PROJECT_ROOT/tsconfig.node.json" || all_valid=false
    
    if [ "$all_valid" = true ]; then
        log_success "All TypeScript configuration files present"
    else
        log_error "Some TypeScript configuration files are missing"
        return 1
    fi
}

validate_vscode_settings() {
    log_header "Validating VS Code Settings"
    
    check_file_exists "$PROJECT_ROOT/.vscode/settings.json" || return 1
    
    # Check if critical Copilot settings exist
    if grep -q "github.copilot.chat.agent" "$PROJECT_ROOT/.vscode/settings.json"; then
        log_success "Copilot chat agent setting found"
    else
        log_warning "Copilot chat agent setting missing"
        return 1
    fi
    
    if grep -q "typescript.tsserver.maxTsServerMemory" "$PROJECT_ROOT/.vscode/settings.json"; then
        log_success "TypeScript memory settings found"
    else
        log_warning "TypeScript memory settings missing"
        return 1
    fi
}

validate_devcontainer() {
    log_header "Validating Devcontainer Configuration"
    
    check_file_exists "$PROJECT_ROOT/.devcontainer/devcontainer.json" || return 1
    
    if grep -q "GitHub.copilot-chat" "$PROJECT_ROOT/.devcontainer/devcontainer.json"; then
        log_success "Copilot Chat extension configured"
    else
        log_warning "Copilot Chat extension not found in devcontainer"
        return 1
    fi
}

validate_eslint_config() {
    log_header "Validating ESLint Configuration"
    
    if [ -f "$PROJECT_ROOT/eslint.config.js" ]; then
        log_success "Found: eslint.config.js"
    else
        log_warning "ESLint config file not found"
    fi
}

# ============================================================================
# FIX FUNCTIONS
# ============================================================================

fix_node_modules_cache() {
    log_header "Cleaning Node Modules Cache"
    
    if [ -d "$PROJECT_ROOT/node_modules/.vite" ]; then
        rm -rf "$PROJECT_ROOT/node_modules/.vite"
        log_success "Cleared Vite cache"
    fi
    
    if [ -d "$PROJECT_ROOT/node_modules/.tmp" ]; then
        rm -rf "$PROJECT_ROOT/node_modules/.tmp"
        log_success "Cleared temporary build files"
    fi
}

fix_typescript_build_info() {
    log_header "Clearing TypeScript Build Cache"
    
    if [ -d "$PROJECT_ROOT/node_modules/.tmp" ]; then
        rm -rf "$PROJECT_ROOT/node_modules/.tmp"
        log_success "Cleared TypeScript build info cache"
    fi
}

# ============================================================================
# VERIFICATION FUNCTIONS
# ============================================================================

verify_typescript_compilation() {
    log_header "Verifying TypeScript Compilation"
    
    if command -v npx &> /dev/null; then
        if npx -y tsc --noEmit --project "$PROJECT_ROOT/tsconfig.app.json" 2>/dev/null; then
            log_success "TypeScript compilation check passed"
        else
            log_warning "TypeScript compilation has errors (this may be expected if dependencies not installed)"
        fi
    else
        log_warning "npm/npx not found - skipping TypeScript verification"
    fi
}

verify_eslint() {
    log_header "Verifying ESLint Configuration"
    
    if command -v npx &> /dev/null; then
        if npx -y eslint --version 2>/dev/null; then
            log_success "ESLint is available"
        else
            log_warning "ESLint verification failed (may need npm install)"
        fi
    else
        log_warning "npm/npx not found - skipping ESLint verification"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    log_header "Copilot & TypeScript Configuration Validator"
    echo "Project Root: $PROJECT_ROOT"
    
    local validation_failed=false
    
    # Run validation checks
    validate_tsconfig_json || validation_failed=true
    validate_vscode_settings || validation_failed=true
    validate_devcontainer || validation_failed=true
    validate_eslint_config || validation_failed=true
    
    # Run fixes
    fix_node_modules_cache || true
    fix_typescript_build_info || true
    
    # Run verifications
    verify_typescript_compilation || true
    verify_eslint || true
    
    # Summary
    log_header "Validation Summary"
    
    if [ "$validation_failed" = true ]; then
        log_warning "Some validations failed - review the output above"
        log_warning "Recommended actions:"
        echo "  1. Ensure all TypeScript config files exist"
        echo "  2. Review .vscode/settings.json for proper Copilot settings"
        echo "  3. Check .devcontainer/devcontainer.json for required extensions"
        echo "  4. Run 'npm install' to update dependencies"
        return 1
    else
        log_success "All validations passed!"
        echo ""
        log_header "Next Steps"
        echo "1. Reload VS Code (Cmd+Shift+P → Developer: Reload Window)"
        echo "2. Run: npm install"
        echo "3. Run: npm run lint to verify ESLint integration"
        echo "4. Test Copilot Chat with Ctrl+Shift+I"
        return 0
    fi
}

main "$@"
