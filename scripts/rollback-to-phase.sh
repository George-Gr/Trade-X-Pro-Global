#!/bin/bash

# rollback-to-phase.sh
# Rollback to previous phase rollback points using git tags or manifest file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage
if [ $# -eq 0 ]; then
    echo -e "${RED}Usage: $0 <phase-number> [method]${NC}"
    echo ""
    echo "Arguments:"
    echo "  phase-number  - 'phase1', 'phase2', or 'phase3'"
    echo "  method        - 'tag' (default) or 'manifest'"
    echo ""
    echo "Examples:"
    echo "  $0 phase1                    # Rollback using git tag"
    echo "  $0 phase1 tag                # Rollback using git tag"
    echo "  $0 phase1 manifest           # Rollback using manifest file"
    echo "  $0 phase2                    # Rollback using git tag"
    exit 1
fi

PHASE=$1
METHOD=${2:-tag}

# Validate phase argument
if [[ ! "$PHASE" =~ ^(phase1|phase2|phase3)$ ]]; then
    echo -e "${RED}Error: Phase must be 'phase1', 'phase2', or 'phase3'${NC}"
    exit 1
fi

# Validate method
if [[ ! "$METHOD" =~ ^(tag|manifest)$ ]]; then
    echo -e "${RED}Error: Method must be 'tag' or 'manifest'${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

CURRENT_SHA=$(git rev-parse HEAD)
TAG_NAME="rollback-before-$PHASE"
MANIFEST_FILE="rollback-manifest.txt"

echo -e "${YELLOW}🔄 Rolling back to $PHASE rollback point...${NC}"
echo -e "${BLUE}📍 Current SHA: $CURRENT_SHA${NC}"

# Function to rollback using git tag
rollback_with_tag() {
    echo -e "${YELLOW}🏷️  Using git tag method...${NC}"
    
    # Check if tag exists
    if git show-ref --verify --quiet refs/tags/"$TAG_NAME"; then
        ROLLBACK_SHA=$(git rev-parse "$TAG_NAME")
        echo -e "${GREEN}✅ Found rollback tag: $TAG_NAME${NC}"
        echo -e "${BLUE}📍 Rollback SHA: $ROLLBACK_SHA${NC}"
    else
        echo -e "${RED}❌ Rollback tag '$TAG_NAME' not found${NC}"
        echo -e "${YELLOW}💡 Did you run 'save-rollback-point.sh $PHASE' before the update?${NC}"
        exit 1
    fi
}

# Function to rollback using manifest file
rollback_with_manifest() {
    echo -e "${YELLOW}📋 Using manifest file method...${NC}"
    
    if [ ! -f "$MANIFEST_FILE" ]; then
        echo -e "${RED}❌ Rollback manifest file '$MANIFEST_FILE' not found${NC}"
        echo -e "${YELLOW}💡 Did you run 'save-rollback-point.sh $PHASE' before the update?${NC}"
        exit 1
    fi
    
    # Extract rollback SHA from manifest (use the most recent entry)
    ROLLBACK_SHA=$(grep "rollback-before-$PHASE:" "$MANIFEST_FILE" | tail -1 | cut -d':' -f2)
    
    if [ -z "$ROLLBACK_SHA" ]; then
        echo -e "${RED}❌ No rollback entry found for $PHASE in $MANIFEST_FILE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Found rollback entry in manifest${NC}"
    echo -e "${BLUE}📍 Rollback SHA: $ROLLBACK_SHA${NC}"
}

# Perform rollback based on method
case "$METHOD" in
    tag)
        rollback_with_tag
        ;;
    manifest)
        rollback_with_manifest
        ;;
esac

# Verify the rollback SHA is valid
if ! git rev-parse --verify "$ROLLBACK_SHA" > /dev/null 2>&1; then
    echo -e "${RED}❌ Invalid rollback SHA: $ROLLBACK_SHA${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Performing rollback...${NC}"

# Checkout the rollback point
git checkout "$ROLLBACK_SHA" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully checked out rollback point${NC}"
    echo -e "${BLUE}📍 Now at SHA: $(git rev-parse HEAD)${NC}"
    
    echo ""
    echo -e "${YELLOW}📦 Running npm install...${NC}"
    npm install
    
    echo ""
    echo -e "${GREEN}🎉 Rollback completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo "   npm run build           # Verify build works"
    echo "   npm run test            # Run tests to verify functionality"
    echo ""
    echo -e "${YELLOW}📋 Rollback Summary:${NC}"
    echo "   From: $CURRENT_SHA"
    echo "   To:   $(git rev-parse HEAD)"
    echo "   Phase: $PHASE"
    echo "   Method: $METHOD"
    
else
    echo -e "${RED}❌ Failed to checkout rollback point${NC}"
    exit 1
fi