╔════════════════════════════════════════════════════════════════╗
║  VS Code Extension Host Diagnostic Report                    ║
╚════════════════════════════════════════════════════════════════╝

Generated: Sun 30 Nov 2025 02:51:49 PM UTC
Hostname: codespaces-899227
User: node

SECTION 1: System Information
========================================================================

OS Information:
Linux codespaces-899227 6.8.0-1030-azure #35~22.04.1-Ubuntu SMP Mon May 26 18:08:30 UTC 2025 x86_64 GNU/Linux

Node.js Version:
v20.19.2

NPM Version:
10.8.2

Memory Available:
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       3.0Gi       160Mi        65Mi       4.6Gi       4.4Gi
Swap:             0B          0B          0B

Disk Usage (home directory):
610M	/home/node

SECTION 2: VS Code Remote Configuration
========================================================================

devcontainer.json (excerpt):
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye",
  "features": {

.vscode/settings.json exists: YES

SECTION 3: Extension Host Status
========================================================================

Running processes (extensionHost):
node         273  3.1 12.4 77930864 1010772 ?    Sl   11:39   6:07 /vscode/bin/linux-x64/bf9252a2fb45be6893dd8870c0bf37e2e1766d61/node --dns-result-order=ipv4first /vscode/bin/linux-x64/bf9252a2fb45be6893dd8870c0bf37e2e1766d61/out/bootstrap-fork --type=extensionHost --transformURIs --useHostProxy=false

Running processes (code-server):
node         242  0.0  0.0   2480  1536 ?        Ss   11:39   0:00 sh /home/node/.vscode-remote/bin/bf9252a2fb45be6893dd8870c0bf37e2e1766d61/bin/code-server --log trace --force-disable-user-env --server-data-dir /home/node/.vscode-remote --accept-server-license-terms --host 127.0.0.1 --port 0 --connection-token-file /home/node/.vscode-remote/data/Machine/.connection-token-bf9252a2fb45be6893dd8870c0bf37e2e1766d61 --extensions-download-dir /home/node/.vscode-remote/extensionsCache --start-server  --enable-remote-auto-shutdown --skip-requirements-check

SECTION 4: Lock File Analysis
========================================================================

Lock files found: 4

Lock file details:
  1179649      4 -rw-r--r--   1 node     node           29 Nov 30 11:30 /home/node/.vscode-remote/data/User/workspaceStorage/33244c5f/vscode.lock
  1453948      4 -rw-r--r--   1 node     node           29 Nov 30 14:51 /home/node/.vscode-remote/data/User/workspaceStorage/33244c5f-1/vscode.lock
  1448782      4 -rw-r--r--   1 node     node           31 Nov 30 07:27 /home/node/.vscode-remote/data/User/workspaceStorage/33244c5f-3/vscode.lock
  1448646      4 -rw-r--r--   1 node     node           30 Nov 30 09:40 /home/node/.vscode-remote/data/User/workspaceStorage/33244c5f-2/vscode.lock

SECTION 5: Extension State
========================================================================

Extensions directory size:
158M	/home/node/.vscode-remote/extensions

Number of installed extensions:
6

Recent extension installations:
github.copilot-chat-0.33.3
github.copilot-1.388.0
github.codespaces-1.18.3
github.vscode-pull-request-github-0.122.1
github.github-vscode-theme-6.3.5

SECTION 6: Network Connectivity
========================================================================

GitHub API (api.github.com):
HTTP/2 200 
date: Sun, 30 Nov 2025 14:51:37 GMT
cache-control: public, max-age=60, s-maxage=60
Status: ✓ Reachable

MCP API (api.mcp.github.com):
HTTP/2 200 
access-control-allow-headers: Content-Type, Authorization, X-Requested-With
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
Status: ✓ Reachable

DNS Resolution:
(Unable to resolve)

SECTION 7: Extension Host Logs (Recent)
========================================================================

Log directory not found: /home/node/.vscode-remote/data/User/logs

SECTION 8: Error Pattern Analysis
========================================================================

