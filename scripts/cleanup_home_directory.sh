#!/bin/bash

# Cleanup Script for /Users/usha/ Directory
# This script removes specified files and directories from your home directory
# 
# WARNING: This will permanently delete files from your home directory.
# Please review the list below and ensure these are files you want to remove.
# 
# Files to be removed:
# .codieum, .codemate, .config, .continue, .cursor, .deno, .docker, .gemini,
# .idlerc, .kilocode, .kiro, .kombai, .kube, .lingma, .lmstudio, .marscode,
# .mcp-auth, .nvm, .ollama, .qoder, .qodo, .redhat, .rest-client, .ssh,
# .Trash, .windsurf, .babel.json, .bash_history, .CFUserTextEncoding,
# .claude.json, .claude.json.backup, .lesshst, .lmstudio-home-pointer,
# .viminfo, .zcompdump, .zprofile, .zprofile.pysave, .zsh_history, .zshrc

echo "=== Cleanup Script for /Users/usha/ ==="
echo "This will remove the following files and directories:"
echo ""

# List of files to remove
files_to_remove=(
    ".codieum"
    ".codemate"
    ".config"
    ".continue"
    ".cursor"
    ".deno"
    ".docker"
    ".gemini"
    ".idlerc"
    ".kilocode"
    ".kiro"
    ".kombai"
    ".kube"
    ".lingma"
    ".lmstudio"
    ".marscode"
    ".mcp-auth"
    ".nvm"
    ".ollama"
    ".qoder"
    ".qodo"
    ".redhat"
    ".rest-client"
    ".ssh"
    ".Trash"
    ".windsurf"
    ".babel.json"
    ".bash_history"
    ".CFUserTextEncoding"
    ".claude.json"
    ".claude.json.backup"
    ".lesshst"
    ".lmstudio-home-pointer"
    ".viminfo"
    ".zcompdump"
    ".zprofile"
    ".zprofile.pysave"
    ".zsh_history"
    ".zshrc"
)

# Display files to be removed
for file in "${files_to_remove[@]}"; do
    echo "  - $file"
done

echo ""
echo "Files will be removed from: /Users/usha/"
echo ""

# Ask for confirmation
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

# Backup current directory
current_dir=$(pwd)

# Change to home directory
cd /Users/usha/

echo "Starting cleanup..."
removed_count=0
failed_count=0

# Remove each file/directory
for file in "${files_to_remove[@]}"; do
    if [ -e "$file" ]; then
        if rm -rf "$file" 2>/dev/null; then
            echo "✓ Removed: $file"
            ((removed_count++))
        else
            echo "✗ Failed to remove: $file"
            ((failed_count++))
        fi
    else
        echo "- Not found: $file"
    fi
done

echo ""
echo "=== Cleanup Complete ==="
echo "Files removed: $removed_count"
echo "Files failed: $failed_count"

# Return to original directory
cd "$current_dir"

echo ""
echo "Script completed. Please verify the results."