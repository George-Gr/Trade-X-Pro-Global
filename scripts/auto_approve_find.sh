#!/usr/bin/env bash

# Auto-approve wrapper for find commands
# Usage:
# - Called directly as 'find' (via bin wrapper or function)
# - Called as 'auto_approve_find.sh find ...' (earlier alias style)

set -euo pipefail

script_name=$(basename "$0")

args=()
if [[ "$script_name" == "find" ]]; then
  # Called via wrapper located in PATH as `find`
  args=("$@")
elif [[ ${1:-} == "find" ]]; then
  # Called explicitly as: auto_approve_find.sh find ...
  shift
  args=("$@")
else
  # Assume whatever arguments were passed are intended for find
  args=("$@")
fi

# Logging for debugging / auditing (optional)
LOG_DIR="/tmp/auto_approve_find_logs"
mkdir -p "$LOG_DIR"
echo "$(date --iso-8601=seconds) [PID $$] Running find with args: ${args[*]}" >> "$LOG_DIR/find.log"

# Execute the real find binary (use absolute path to avoid recursion)
exec /usr/bin/find "${args[@]}"
