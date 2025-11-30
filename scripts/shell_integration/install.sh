#!/usr/bin/env bash
# Install shell integration into user home shell configs (bash/zsh)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INIT_SCRIPT="$REPO_ROOT/scripts/shell_integration/init.sh"
MARKER="# >>> Auto-approve find integration (Trade-X-Pro-Global) >>>"
END_MARKER="# <<< Auto-approve find integration (Trade-X-Pro-Global) <<<"

add_source_line() {
  local rcfile="$1"
  local src_line="[ -f \"$INIT_SCRIPT\" ] && source \"$INIT_SCRIPT\""
  if [[ -f "$rcfile" ]]; then
    if grep -Fq "$MARKER" "$rcfile"; then
      echo "Integration already present in $rcfile"
      return
    fi
  else
    touch "$rcfile"
  fi
  printf "\n%s\n%s\n%s\n" "$MARKER" "$src_line" "$END_MARKER" >> "$rcfile"
  echo "Added integration to $rcfile"
}

# Add to bashrc
add_source_line "$HOME/.bashrc"

# Add to zshrc if installed
if [[ -f "$HOME/.zshrc" || -n "${ZSH_VERSION-}" ]]; then
  add_source_line "$HOME/.zshrc"
fi

echo "Installation complete. To apply changes in the current shell, run: source ~/.bashrc or start a new shell." 

