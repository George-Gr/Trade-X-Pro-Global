# JSON Output Format Guidelines

## Overview

This document defines the proper JSON output format for npm update scripts to avoid misleading error messages.

## Problem

Previously, scripts used this misleading format when no outdated packages were found:

```json
{
  "error": "No outdated packages"
}
```

This incorrectly suggests an error occurred when actually the operation was successful.

## Solution

Use this proper success format:

```json
{
  "status": "success",
  "message": "No outdated packages"
}
```

## Alternative Format

For boolean-based logic, you can also use:

```json
{
  "outdated": false,
  "message": "No outdated packages"
}
```

## Implementation

When generating JSON output for npm outdated results:

1. **Success case** (no outdated packages):
   ```bash
   npm outdated --json > output.json 2>/dev/null || echo '{"status": "success", "message": "No outdated packages"}' > output.json
   ```

2. **Error case** (actual errors):
   ```bash
   npm outdated --json > output.json 2>&1 || echo '{"status": "error", "message": "Failed to check for outdated packages"}' > output.json
   ```

## Affected Files

- `scripts/update-phase3-force.sh` - Fixed ✅
- `npm-outdated-phase3.json` - Updated ✅

## Best Practices

1. Always use `status` field to indicate success/error state
2. Use `message` field for human-readable descriptions
3. Avoid using `error` as a key name for success states
4. Maintain consistent JSON structure across all scripts
5. Document the expected JSON schema for consumers

## Validation

To validate JSON format:

```bash
# Check if JSON is valid
cat output.json | jq empty

# Check status field
cat output.json | jq '.status'

# Check message field
cat output.json | jq '.message'
```