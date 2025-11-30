#!/usr/bin/env bash
# Uninstall the shell integration (remove previously added markers from rc files)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MARKER="# >>> Auto-approve find integration (Trade-X-Pro-Global) >>>"
END_MARKER="# <<< Auto-approve find integration (Trade-X-Pro-Global) <<<"

remove_marker() {
  local rcfile="$1"
  if [[ -f "$rcfile" ]]; then
    if grep -Fq "$MARKER" "$rcfile"; then
      # Remove the block between markers
      awk "BEGIN{del=0} $0==\"$MARKER\"{del=1;next} $0==\"$END_MARKER\"{del=0;next} {if (!del) print}" "$rcfile" > "$rcfile.tmp" && mv "$rcfile.tmp" "$rcfile"
      echo "Removed integration from $rcfile"
    else
      echo "No integration found in $rcfile"
    fi
  fi
}

remove_marker "$HOME/.bashrc"
remove_marker "$HOME/.zshrc"

echo "Uninstallation complete. Restart your shell or source your rc file to apply changes." 
