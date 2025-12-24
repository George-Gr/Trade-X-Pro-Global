#!/bin/bash

# save-rollback-point.sh
# Save rollback points for NPM update phases using git tags and manifest file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage
if [ $# -eq 0 ]; then
    echo -e "${RED}Usage: $0 <phase-number>${NC}"
    echo "Example: $0 phase1"
    echo "         $0 phase2"
    echo "         $0 phase3"
    exit 1
fi

PHASE=$1
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
CURRENT_SHA=$(git rev-parse HEAD)

# Validate phase argument
if [[ ! "$PHASE" =~ ^(phase1|phase2|phase3)$ ]]; then
    echo -e "${RED}Error: Phase must be 'phase1', 'phase2', or 'phase3'${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Creating rollback point for $PHASE...${NC}"

# Create git tag
TAG_NAME="rollback-before-$PHASE"
echo "Creating git tag: $TAG_NAME"
git tag -f "$TAG_NAME" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git tag created: $TAG_NAME${NC}"
else
    echo -e "${RED}❌ Failed to create git tag${NC}"
    exit 1
fi

# Update manifest file
MANIFEST_FILE="rollback-manifest.txt"
echo "Updating rollback manifest: $MANIFEST_FILE"

# Create manifest file if it doesn't exist
if [ ! -f "$MANIFEST_FILE" ]; then
    echo "# Rollback Manifest for NPM Updates" > "$MANIFEST_FILE"
    echo "# Format: phase:SHA:timestamp" >> "$MANIFEST_FILE"
    echo "# Generated: $(date)" >> "$MANIFEST_FILE"
    echo "" >> "$MANIFEST_FILE"
fi

# Add rollback point to manifest
echo "rollback-before-$PHASE:$CURRENT_SHA:$TIMESTAMP" >> "$MANIFEST_FILE"

echo -e "${GREEN}✅ Rollback point saved for $PHASE${NC}"
echo ""
echo -e "${YELLOW}📋 Rollback Information:${NC}"
echo "   Tag: $TAG_NAME"
echo "   SHA: $CURRENT_SHA"
echo "   Time: $TIMESTAMP"
echo ""
echo -e "${YELLOW}💡 To rollback to this point:${NC}"
echo "   git checkout $TAG_NAME"
echo "   npm install"
echo ""
echo -e "${YELLOW}💡 Or use the manifest file:${NC}"
echo "   ROLLBACK_SHA=\$(grep \"rollback-before-$PHASE:\" $MANIFEST_FILE | tail -1 | cut -d':' -f2)"
echo "   git checkout \$ROLLBACK_SHA"
echo "   npm install"