#!/bin/bash

# Execute Complete Repository Automation
# Final step to run the systematic solution

cd /Users/usha/Desktop/Krishan/Trade-X-Pro-Global

echo "=== Executing Complete Repository Automation ==="
echo "Date: $(date)"
echo ""

# Make all scripts executable
chmod +x enhanced-cleanup-script.sh
chmod +x verify-repository.sh  
chmod +x complete-automation.sh

echo "Scripts made executable:"
echo "  - enhanced-cleanup-script.sh"
echo "  - verify-repository.sh"
echo "  - complete-automation.sh"
echo ""

# Execute the complete automation
echo "Starting complete automation process..."
./complete-automation.sh