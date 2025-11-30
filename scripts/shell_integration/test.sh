#!/usr/bin/env bash
set -euo pipefail

echo "=== Test: shell integration for 'find' ==="
which find || true

# Show wrapper logs
if [ -f /tmp/auto_approve_find_logs/find.log ]; then
  echo "=== Last 10 logs ==="
  tail -n 10 /tmp/auto_approve_find_logs/find.log
fi

# Check find version via wrapper
echo "=== find --version (via wrapper) ==="
find --version | head -n1

# Run example command
echo "=== Running example find command ==="
find /workspaces/Trade-X-Pro-Global/src -type f -name "*.ts" -exec wc -l {} + | awk '$1 > 1276 {print $1, $2}' | sort -nr || true

echo "=== Done ==="
