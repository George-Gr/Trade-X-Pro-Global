#!/bin/bash
# VSCode Optimization - Quick Reference Commands
# Useful commands for monitoring and managing VSCode after optimization

## MONITORING COMMANDS

# Watch VSCode logs in real-time
alias vscode-logs='tail -f ~/Library/Application\ Support/Code/logs/*/window*/window.log'

# Check VSCode CPU usage
alias vscode-cpu='ps aux | grep -i "[C]ode" | awk "{print \$2, \$3, \$4}" | column -t'

# Monitor VSCode processes
alias vscode-ps='ps aux | grep -i "[C]ode"'

# Get VSCode version
alias vscode-version='code --version'

## MAINTENANCE COMMANDS

# Run weekly maintenance
# Use SCRIPT_DIR relative to this file, or set VSCODE_MAINTENANCE_SCRIPT env var
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
alias vscode-clean='${VSCODE_MAINTENANCE_SCRIPT:-$SCRIPT_DIR/../../scripts/vscode-maintenance.sh}'

# Aggressive cleanup (resets extensions)
alias vscode-clean-aggressive='${VSCODE_MAINTENANCE_SCRIPT:-$SCRIPT_DIR/../../scripts/vscode-maintenance.sh} --aggressive'

# View current settings
alias vscode-settings='cat ~/Library/Application\ Support/Code/User/settings.json | jq'

# Validate settings JSON
alias vscode-validate='node -e "JSON.parse(require(\"fs\").readFileSync(process.env.HOME + \"/Library/Application Support/Code/User/settings.json\", \"utf8\")); console.log(\"✓ Valid JSON\")"'

## RECOVERY COMMANDS

# Backup current settings
backup_vscode_settings() {
  cp ~/Library/Application\ Support/Code/User/settings.json \
     ~/Library/Application\ Support/Code/User/settings.json.backup.$(date +%s)
  echo "✓ Settings backed up"
}
restore_vscode_settings() {
  local backup_file=~/Library/Application\ Support/Code/User/settings.json.pre-fix
  if [[ ! -f "$backup_file" ]]; then
    echo "✗ No pre-fix backup found at: $backup_file"
    return 1
  fi
  cp ~/Library/Application\ Support/Code/User/settings.json.pre-fix \
     ~/Library/Application\ Support/Code/User/settings.json
  echo "✓ Settings restored from pre-fix backup"
}
  echo "✓ Settings restored from pre-fix backup"
}

# Clear extension data/state (extensions remain installed)
clear_extension_data() {
  read -p "This will clear extension data/state (extensions stay installed). Continue? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    killall "Code" 2>/dev/null || true
    sleep 2
    rm -rf ~/Library/Application\ Support/Code/User/globalStorage
    mkdir -p ~/Library/Application\ Support/Code/User/globalStorage
    echo "✓ Extension data cleared. Restart VSCode."
  fi
}

# View extension performance
vscode_extensions_perf() {
  echo "To view extension performance:"
  echo "1. Press Cmd+Shift+P in VSCode"
  echo "2. Type 'Developer: Show Running Extensions'"
  echo "3. Sort by activation time or memory usage"
}

## DIAGNOSTIC COMMANDS

# Full health check
vscode_health_check() {
  echo "VSCode Health Check"
  echo "===================="
  echo ""
  echo "Settings Validation:"
  vscode-validate
  echo ""
  echo "Storage Usage:"
  du -sh ~/Library/Application\ Support/Code/User/globalStorage/
  du -sh ~/Library/Application\ Support/Code/User/workspaceStorage/
  echo ""
  echo "CPU Usage (top 3):"
  ps aux | grep -i "[C]ode" | head -3 | awk '{print $2, $3"%", $11}'
  echo ""
  echo "Chat Databases:"
  find ~/Library/Application\ Support/Code -name "*chat*.sqlite*" | wc -l
  echo "should be 0"
}

# Check for configuration errors
check_config_errors() {
  tail -100 ~/Library/Application\ Support/Code/logs/*/window*/window.log | \
    grep -i "configuration\|error\|failed" | head -10
}

## OPTIMIZATION SETUP

# Add these aliases to your .zshrc or .bash_profile
setup_vscode_aliases() {
  cat >> ~/.zshrc << 'EOF'

# VSCode Optimization Aliases
alias vscode-logs='tail -f ~/Library/Application\ Support/Code/logs/*/window*/window.log'
alias vscode-cpu='ps aux | grep -i "[C]ode" | awk "{print \$2, \$3, \$4}"'
alias vscode-clean='~/Desktop/Krishan/Trade-X-Pro-Global/scripts/vscode-maintenance.sh'
alias vscode-validate='node -e "JSON.parse(require(\"fs\").readFileSync(process.env.HOME + \"/Library/Application Support/Code/User/settings.json\", \"utf8\")); console.log(\"✓ Valid JSON\")"'
EOF
  echo "✓ Aliases added to ~/.zshrc (run 'source ~/.zshrc' to activate)"
}

## TROUBLESHOOTING

# If VSCode is frozen/unresponsive
kill_vscode() {
  killall -9 "Code" 2>/dev/null
  killall -9 "Code Helper" 2>/dev/null
  killall -9 "Code Helper (Plugin)" 2>/dev/null
  echo "✓ VSCode processes terminated"
}

# Reset to post-optimization state
reset_to_optimization() {
  read -p "This will reset to optimized state. Continue? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill_vscode
    rm -rf ~/Library/Application\ Support/Code/User/globalStorage/*
    rm -rf ~/Library/Application\ Support/Code/User/workspaceStorage/*
    find ~/Library/Application\ Support/Code -name "*chat*.sqlite*" -delete
    echo "✓ Reset complete. Restart VSCode."
  fi
}

## USEFUL REFERENCES

# Check VSCode version and commit
vscode_info() {
  code --version
  echo ""
  echo "VSCode Data Directory:"
  echo "~/Library/Application Support/Code"
  echo ""
  echo "Settings File:"
  echo "~/Library/Application Support/Code/User/settings.json"
  echo ""
  echo "Log Directory:"
  echo "~/Library/Application Support/Code/logs"
}

echo "VSCode Quick Reference loaded!"
echo "Run 'vscode_health_check' for full diagnosis"
echo "Run 'vscode-clean' for maintenance"
