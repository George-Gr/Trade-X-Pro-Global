# Shell Integration for `find` Auto-Approval

This integration improves detection and auto-approval behavior for the `find` command in interactive shells by providing:

- A robust wrapper at `scripts/bin/find` (placed earlier in PATH) that forwards to `/usr/bin/find` and avoids recursion.
- A central wrapper `scripts/auto_approve_find.sh` that logs usage and executes /usr/bin/find with the same parameters.
- A shell `init.sh` that is meant to be sourced by `~/.bashrc` and `~/.zshrc` to enable the wrapper and optional debugging for direct invocations of `/usr/bin/find`.
- `install.sh` and `uninstall.sh` under `scripts/shell_integration` to add/remove the source lines from the user's home shell configuration files.

Why this approach?
- Using a PATH-based wrapper and a shell function gives a strong level of interception while avoiding modification of system binaries or global `sudo` behavior.
- The integration is implemented safely (no root edits) and is idempotent (installation will not duplicate markers).

How to install:

```bash
# From the repository root
chmod +x scripts/shell_integration/install.sh
./scripts/shell_integration/install.sh
source ~/.bashrc  # Or open a new shell
```

How to verify:

```bash
which find  # should point to /workspaces/Trade-X-Pro-Global/scripts/bin/find
find --version  # still displays 'find' version
find /workspaces/Trade-X-Pro-Global/src -type f -name "*.ts" -exec wc -l {} + | awk '$1 > 1276 {print $1, $2}' | sort -nr
```

Notes & limitations:
- Commands that explicitly call `/usr/bin/find` will bypass the PATH wrapper. We add a lightweight `DEBUG`/`preexec` logger to detect those calls and log to stderr, but we do not prevent them from running.
- We intentionally do not modify `sudo` behavior or override system-level commands for safety.

If you need a stricter/intrusive approach (e.g. intercept full path invocations), we can discuss the trade-offs and either install a FUSE-based interception or modify specific environment and restricted shells.
