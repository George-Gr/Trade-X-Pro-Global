#!/usr/bin/env bash
# Update GitHub repository secrets from a .env.rotate file or environment variables.
# Preferred method: use GitHub CLI (`gh`). Fallbacks: manual instructions.
# Usage: ./scripts/update-github-secrets.sh [.env.rotate]
set -euo pipefail

FILE=${1:-.env.rotate}

if [ ! -f "$FILE" ]; then
  echo "Error: ${FILE} not found. Create a file with the keys to rotate in KEY=VALUE format, or set environment variables before running."
  echo "Example .env.rotate contents:" 
  echo "  SUPABASE_URL=https://your-project.supabase.co"
  echo "  VITE_SUPABASE_PUBLISHABLE_KEY=..."
  echo "  SUPABASE_SERVICE_ROLE_KEY=..."
  echo "  VITE_SENTRY_DSN=..."
  echo "  CLIENT_IP_ENCRYPTION_KEY=..."
  exit 1
fi

# Load variables (ignore comments / blank lines)
set -o allexport
# shellcheck disable=SC1090
source <(grep -v '^\s*#' "$FILE" | sed '/^\s*$/d')
set +o allexport

# Required: repository identification
REPO=${GITHUB_REPOSITORY:-}
if [ -z "$REPO" ]; then
  # Try to infer from git remote
  ORIGIN_URL=$(git config --get remote.origin.url || true)
  if [ -n "$ORIGIN_URL" ]; then
    REPO=$(echo "$ORIGIN_URL" | sed -n 's#.*/\([^/]*\/[^/]*\)\.git#\1#p')
  fi
fi

if [ -z "$REPO" ]; then
  echo "Error: could not determine repository. Set GITHUB_REPOSITORY env or run from a git clone with origin configured."
  exit 1
fi

# List of secrets to set (extend as-needed)
SECRETS=(
  SUPABASE_URL
  VITE_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_SERVICE_ROLE_KEY
  VITE_SENTRY_DSN
  CLIENT_IP_ENCRYPTION_KEY
  VITE_API_URL
  VITE_WS_URL
)

if command -v gh >/dev/null 2>&1; then
  echo "Using gh CLI to set secrets on ${REPO}"
  for s in "${SECRETS[@]}"; do
    val=${!s:-}
    if [ -n "$val" ]; then
      echo "Setting secret: $s"
      # `gh secret set` reads value from stdin
      printf "%s" "$val" | gh secret set "$s" --repo "$REPO" --visibility all
    else
      echo "Skipping $s (no value provided)"
    fi
  done
  echo "Secrets updated via gh CLI. Verify in GitHub Settings → Secrets for ${REPO}."
  exit 0
fi

# If `gh` is not available, provide instructions for manual or API-based update
cat <<'INSTRUCTIONS'

`gh` CLI not found. Two options remain:

1) Install GitHub CLI and re-run this script:
   - macOS (Homebrew): `brew install gh`
   - Authenticate: `gh auth login` (use an account with repo admin permissions)
   - Then re-run: `./scripts/update-github-secrets.sh .env.rotate`

2) Use GitHub REST API to set secrets (requires obtaining the repository public key and encrypting values with libsodium). We recommend using `gh` to avoid manual encryption complexity.

Optional automation considerations:
- Run this script inside a secure runner (CI or secure workstation) where `.env.rotate` is present only temporarily.
- After success, wipe `.env.rotate` from disk: `shred -u .env.rotate` or `rm -f .env.rotate` and remove it from shell history.

INSTRUCTIONS

exit 1
