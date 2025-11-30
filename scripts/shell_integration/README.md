Shell integration for auto-approving find commands

This directory contains scripts to intercept and auto-approve 'find' commands in your interactive shell.

Files:
- init.sh: initialization script to be sourced by shells (Bash/Zsh). Adds wrapper to PATH, defines 'find' function, and sets light DEBUG/preexec logging.
- install.sh: installs the 'init.sh' into your home shell configs (~/.bashrc, ~/.zshrc) by appending source lines.
- uninstall.sh: (optional) removes the integration if needed.

Usage:

1. Install the shell integration (this edits ~/.bashrc and ~/.zshrc):

```bash
chmod +x scripts/shell_integration/install.sh
./scripts/shell_integration/install.sh
```

2. Source your shell config (or open a new shell):

```bash
source ~/.bashrc  # or source ~/.zshrc
```

3. Verify the find command is intercepted:

```bash
which find
find --version  # should point to scripts/bin/find
find . -type f | head -n 2
```

Notes:
- The wrapper will call the real /usr/bin/find to avoid recursion.
- Direct calls to /usr/bin/find will bypass the wrapper; the init script adds lightweight DEBUG/preexec logging of such invocations.
- Overriding sudo or /usr/bin/find is intentionally avoided for safety.

If you want to uninstall, open an issue or run an uninstall removal script (not implemented yet).