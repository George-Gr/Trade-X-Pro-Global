#!/usr/bin/env bash
# Shell integration init script
# Adds our scripts/bin to PATH and defines a robust find wrapper/function
# This script is intended to be sourced from ~/.bashrc or ~/.zshrc

set -e -o pipefail

REPO_ROOT="/workspaces/Trade-X-Pro-Global"
BIN_DIR="$REPO_ROOT/scripts/bin"
WRAPPER_SCRIPT="$REPO_ROOT/scripts/auto_approve_find.sh"

# Make sure our bin directory is on PATH early
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  export PATH="$BIN_DIR:$PATH"
fi

# Ensure the wrapper script is executable
if [[ -f "$WRAPPER_SCRIPT" && ! -x "$WRAPPER_SCRIPT" ]]; then
  chmod +x "$WRAPPER_SCRIPT" || true
fi

# Provide a shell function for find in bash to improve detection and to allow callers to use `find` normally.
# Function ensures we bypass our wrapper for explicit calls to /usr/bin/find and avoid recursion.
if [[ -n "${BASH_VERSION-}" ]]; then
  find() {
    # If user explicitly qualifies find with /usr/bin, call it directly
    if [[ "${1:-}" == "/usr/bin/find" ]]; then
      shift
      /usr/bin/find "$@"
      return
    fi

    # If the caller used builtin 'command' to bypass function, they can use \find
    # Directly execute wrapper for auto-approval
    exec "$WRAPPER_SCRIPT" "$@"
  }

fi

# For zsh users, define a function as well
if [[ -n "${ZSH_VERSION-}" ]]; then
  find() {
    if [[ "${1:-}" == "/usr/bin/find" ]]; then
      shift
      /usr/bin/find "$@"
      return
    fi
    exec "$WRAPPER_SCRIPT" "$@"
  }
  # No additional autoload required for functions
fi

# Improve detection for commands that explicitly use /usr/bin/find by adding a DEBUG trap
# WARNING: traps run before each command and should be lightweight
# We'll only log usage for now (no command substitution / interruption) to avoid impacting shell behavior
if [[ -n "${BASH_VERSION-}" ]]; then
  __auto_approve_find_debug() {
    # Access the command being executed
    local cmd="$BASH_COMMAND"
    # if command contains /usr/bin/find, log it and (optionally) do something
    if [[ "$cmd" == *"/usr/bin/find"* ]]; then
      echo "[auto_approve_find] Detected direct /usr/bin/find invocation: $cmd" >&2
      # Optional: we could replace the command by exporting an environment variable to be used
      # or display a message - but we avoid suppressing or modifying commands here
    fi
  }
  # Add trap only once
  if [[ $(trap -p DEBUG 2>/dev/null || true) != *"__auto_approve_find_debug"* ]]; then
    trap '__auto_approve_find_debug' DEBUG
  fi
fi

# zsh improvement: use preexec function if available
if [[ -n "${ZSH_VERSION-}" && -n "${preexec_functions+set}" ]]; then
  __auto_approve_find_preexec() {
    local cmd="$1"
    if [[ "$cmd" == *"/usr/bin/find"* ]]; then
      echo "[auto_approve_find] Detected direct /usr/bin/find invocation: $cmd" >&2
    fi
  }
  # register preexec function
  preexec_functions+=(__auto_approve_find_preexec)
fi
