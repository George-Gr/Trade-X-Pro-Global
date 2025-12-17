## Terminal / PTY host problems (slow terminal or "Could not find pty") ✅

Symptoms seen:
- "Could not find pty X on pty host" in VS Code logs
- "The reconnection grace time of 1m has expired" and terminal PID shutdowns
- Terminal UI becomes slow, stalls, or terminals fail to restore after window reload

Root cause summary
- These messages come from VS Code's integrated terminal/pty host. The underlying causes are usually:
  - The pty host process crashed or lost PTY mappings (commonly seen with Remote-SSH, WSL or on some Windows setups)
  - The workspace/session attempted to restore a persistent terminal but the backing PTY was gone and reconnection grace expired
  - GPU-accelerated rendering + driver issues can make terminal rendering slow and exacerbate the experience

What we changed in this repo (recommended mitigation)
- Added workspace settings to prefer the more reliable DOM renderer and disable terminal GPU acceleration to avoid slow/erratic rendering:

  .vscode/settings.json

  ```json
  {
    "terminal.integrated.rendererType": "dom",
    "terminal.integrated.gpuAcceleration": "off",
    "terminal.integrated.scrollback": 5000
  }
  ```

Recommended user actions (if you still see issues)
1. If you rely on remote connections (Remote-SSH / Remote Tunnels / WSL) and see the reconnection logs frequently, consider disabling persistent terminal sessions temporarily:
   - Open Command Palette → `Preferences: Open Workspace Settings (JSON)` and set
     `"terminal.integrated.enablePersistentSessions": false` (or toggle via settings UI if present)
   - Alternatively, increase the reconnection grace time in user settings if your environment requires longer reconnection (search for `persistentSessionReconnectionGraceTime` in VS Code's settings; this may appear in newer VS Code versions and accepts a duration).

2. Use the diagnostic script we added to quickly find PTY-related log lines in your local VS Code logs (see below).

3. If problems appear only on your machine, try disabling GPU acceleration for the terminal and/or setting `"terminal.integrated.rendererType": "dom"` (this repo now includes those recommended settings).

Diagnostic helper (included)
- There's a small Node script `scripts/find-vscode-pty-errors.js` that will try to locate and summarize occurrences of PTY related errors in the local VS Code log folders. Run `npm run diagnose:terminal`.

When to open a VS Code issue
- If you see many reproducible "Could not find pty X on pty host" traces that are not caused by a remote connection drop or a deliberate terminal kill, please gather logs (use the diagnostic script) and consider opening an issue on https://github.com/microsoft/vscode with logs attached.

Further reading
- Known VS Code issues: search GitHub for "Could not find pty" or "terminal reconnection" to find active issues and workarounds.
