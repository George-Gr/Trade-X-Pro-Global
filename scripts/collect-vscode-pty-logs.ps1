<# 
Collects VS Code PTY-related logs and packages them into a zip for filing a VS Code issue.
Usage: Run this script from the project root in PowerShell.
Output: vscode-pty-logs.zip
#>

Write-Host "Running diagnostic script to capture log paths..."
$null = npm run diagnose:terminal > diagnose_output.txt

Write-Host "Extracting log file paths from diagnostic output..."
$paths = Get-Content diagnose_output.txt | Select-String -Pattern '^---\s+(.*)$' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Sort-Object -Unique

if (-not $paths) {
    Write-Warning "No log paths found in diagnostic output. Falling back to known paths."
    $paths = @(
        "C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\ptyhost.log",
        "C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\window1\exthost\GitHub.copilot-chat\GitHub Copilot Chat.log",
        "C:\Users\Alpha\AppData\Roaming\Code\logs\20251217T050941\window1\renderer.log"
    )
}

Write-Host "Found paths:"
$paths | ForEach-Object { Write-Host "  $_" }

Write-Host "Compressing logs into vscode-pty-logs.zip..."
Compress-Archive -Path $paths -DestinationPath vscode-pty-logs.zip -Force

Write-Host "Done. Zip created: vscode-pty-logs.zip"