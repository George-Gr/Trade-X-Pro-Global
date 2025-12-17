## Ready-to-Post GitHub Issue: Integrated terminal 'Could not find pty' warnings

Title: Integrated terminal: 'Could not find pty' warnings and persistent session reconnection failures

Body:

```
Environment: Windows

Description:
During normal use we observed repeated messages in VS Code logs reporting "Could not find pty X on pty host" and persistent session reconnection expirations (the reconnection grace time expired and backing PIDs were shut down). Terminals may be slow, stall, or fail to restore.

Steps to reproduce:
1. Use integrated terminal normally (no special config required).
2. Reload window or restore session; observe that terminals sometimes do not restore and logs show PTY errors.

Observed logs (examples):
- 2025-12-17 05:13:49.551 — "Couldn't get layout info... Could not find pty 1 on pty host"
- 2025-12-17 08:29:48.699 — "Persistent process \"8\": The reconnection grace time of 1m has expired, shutting down pid \"2552\""

Attachments:
- vscode-pty-logs.zip (contains ptyhost.log, extension host log for GitHub Copilot Chat, renderer.log)

What I tried:
- Set workspace settings to use the DOM renderer and disable terminal GPU acceleration.
- Disabled workspace persistent sessions.

Relevant files (from diagnostic):
- C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\ptyhost.log
- C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\window1\exthost\GitHub.copilot-chat\GitHub Copilot Chat.log
- C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\window1\renderer.log

Request:
- Please advise whether this indicates a bug in the PTY host or if additional environment info / logs are needed. Guidance on safe remediation steps is appreciated.
```

Suggested labels: `area-terminal`, `bug`, `needs-more-info`

Notes for reporter: run `scripts/collect-vscode-pty-logs.ps1` to create `vscode-pty-logs.zip` for attachment.
