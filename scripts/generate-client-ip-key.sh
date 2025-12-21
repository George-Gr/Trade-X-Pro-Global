#!/usr/bin/env bash
# Generate a secure base64-encoded key suitable for CLIENT_IP_ENCRYPTION_KEY
# Usage: ./scripts/generate-client-ip-key.sh
set -euo pipefail

if ! command -v openssl >/dev/null 2>&1; then
  echo "Error: openssl is required but not found in PATH"
  exit 1
fi

KEY=$(openssl rand -base64 32)
printf "%s\n" "$KEY"
