#!/bin/bash
# Quick debugging commands for the 4 remaining parsing errors

echo "=== PARSING ERROR DEBUGGING GUIDE ==="
echo ""

# ============================================
# 1. SidebarErrorBoundary.tsx - Line 263
# ============================================
echo "1. SidebarErrorBoundary.tsx (Line 263)"
echo "   Error: Declaration or statement expected"
echo ""
echo "   View the error area:"
cat -n src/components/ui/SidebarErrorBoundary.tsx | sed -n '260,265p'
echo ""
echo "   Check file length:"
echo "  wc -l src/components/ui/SidebarErrorBoundary.tsx"
echo ""
echo "   Check for extra braces (count should match):"
echo "   Opening braces: $(grep -o '{' src/components/ui/SidebarErrorBoundary.tsx | wc -l)"
echo "   Closing braces: $(grep -o '}' src/components/ui/SidebarErrorBoundary.tsx | wc -l)"
echo ""
echo "   COMMON FIXES:"
echo "   - Remove extra closing brace: }"
echo "   - Complete incomplete statement"
echo "   - Add missing semicolon"
echo "   - Remove dangling code after export"
echo ""
echo "---"
echo ""

# ============================================
# 2. chartUtils.ts - Line 298
# ============================================
echo "2. chartUtils.ts (Line 298)"
echo "   Error: Type expected"
echo ""
echo "   View the error area:"
cat -n src/lib/chartUtils.ts | sed -n '295,305p'
echo ""
echo "   COMMON PATTERNS TO LOOK FOR:"
echo "   - Array<> (missing type)"
echo "   - Record<string,> (incomplete)"
echo "   - Promise<> (missing type)"
echo "   - : {} (missing type after colon)"
echo "   - <> (empty generic)"
echo ""
echo "   FIXES:"
echo "   - Array<> → Array<ChartDataPoint>"
echo "   - Record<string,> → Record<string, unknown>"
echo "   - Promise<> → Promise<void>"
echo "   - : {} → : ChartOptions"
echo ""
echo "---"
echo ""

# ============================================
# 3. errorHandling.ts - Line 21
# ============================================
echo "3. errorHandling.ts (Line 21)"
echo "   Error: '>' expected"
echo ""
echo "   View the error area:"
cat -n src/lib/errorHandling.ts | sed -n '18,24p'
echo ""
echo "   COMMON PATTERNS:"
echo "   - Promise< (missing closing >)"
echo "   - <T( (should be <T>()"
echo "   - <T => T (should be <T>(val: T) => T)"
echo "   - function<T extends Error>(  (unclosed generic)"
echo ""
echo "   FIXES:"
echo "   - Promise< → Promise<ErrorResult>"
echo "   - <T( → <T>("
echo "   - <T => T → <T>(val: T) => T"
echo "   - Add missing >"
echo ""
echo "---"
echo ""

# ============================================
# 4. sidebarErrorHandling.ts - Line 18
# ============================================
echo "4. sidebarErrorHandling.ts (Line 18)"
echo "   Error: '>' expected"
echo ""
echo "   View the error area:"
cat -n src/lib/sidebarErrorHandling.ts | sed -n '15,21p'
echo ""
echo "   Same patterns as errorHandling.ts above"
echo ""
echo "---"
echo ""

# ============================================
# VALIDATION COMMANDS
# ============================================
echo "=== VALIDATION COMMANDS ==="
echo ""
echo "After fixing each file, run:"
echo "  npm run lint src/path/to/file.ts"
echo ""
echo "Check all errors:"
echo "  npm run lint 2>&1 | grep 'error'"
echo ""
echo "Count remaining errors:"
echo "  npm run lint 2>&1 | grep -c 'error'"
echo ""

# ============================================
# SYNTAX CHECKER
# ============================================
echo "=== SYNTAX VALIDATION ==="
echo ""
echo "Check TypeScript syntax (without ESLint rules):"
echo "  npx tsc --noEmit src/components/ui/SidebarErrorBoundary.tsx"
echo "  npx tsc --noEmit src/lib/chartUtils.ts"
echo "  npx tsc --noEmit src/lib/errorHandling.ts"
echo "  npx tsc --noEmit src/lib/sidebarErrorHandling.ts"
echo ""

# ============================================
# SPECIFIC LINE EXTRACTORS
# ============================================
echo "=== EXTRACT SPECIFIC LINES ==="
echo ""
echo "To view specific line with context:"
echo "  sed -n '298p' src/lib/chartUtils.ts  # Exact line"
echo "  sed -n '295,305p' src/lib/chartUtils.ts  # With context"
echo ""
echo "To search for incomplete patterns:"
echo "  grep -n 'Array<>' src/lib/chartUtils.ts"
echo "  grep -n 'Promise<$' src/lib/errorHandling.ts"
echo "  grep -n 'Record<.*,\\s*>' src/lib/chartUtils.ts"
echo ""

# ============================================
# BRACE MATCHER
# ============================================
echo "=== BRACE MATCHING ==="
echo ""
echo "Check brace balance in each file:"
for file in \
  "src/components/ui/SidebarErrorBoundary.tsx" \
  "src/lib/chartUtils.ts" \
  "src/lib/errorHandling.ts" \
  "src/lib/sidebarErrorHandling.ts"
do
  if [ -f "$file" ]; then
    open=$(grep -o '{' "$file" | wc -l)
    close=$(grep -o '}' "$file" | wc -l)
    echo "  $file"
    echo "    Opening: $open | Closing: $close | Diff: $((open - close))"
  fi
done
echo ""

# ============================================
# QUICK FIX PATTERNS
# ============================================
echo "=== QUICK FIX REFERENCE ==="
echo ""
echo "Error: 'Type expected' (Line 298 in chartUtils.ts)"
echo "  Look for: Array<>, Promise<>, Record<,>, : {}"
echo "  Fix: Complete the type parameter"
echo ""
echo "Error: '>' expected' (Lines 21, 18 in errorHandling files)"
echo "  Look for: Promise<, <T(, function<T extends Error>("
echo "  Fix: Add closing > or fix generic syntax"
echo ""
echo "Error: 'Declaration or statement expected' (Line 263 in SidebarErrorBoundary)"
echo "  Look for: Extra }, incomplete code, missing semicolon"
echo "  Fix: Remove/complete the problematic code"
echo ""

# ============================================
# AUTOMATED PATTERN DETECTION
# ============================================
echo "=== AUTOMATED PATTERN DETECTION ==="
echo ""

# Check for incomplete Array/Promise/Record types
echo "Checking for incomplete generic types..."
grep -n 'Array<\s*>' src/lib/chartUtils.ts 2>/dev/null && echo "  Found incomplete Array<>"
grep -n 'Promise<\s*$' src/lib/errorHandling.ts 2>/dev/null && echo "  Found incomplete Promise<"
echo "  grep -n 'Record<[^>]*,\\\\s*>' src/lib/chartUtils.ts 2>/dev/null && echo \"  Found incomplete Record<>\""

# Check for malformed generics
echo ""
echo "Checking for malformed generics..."
grep -n '<[A-Z](' src/lib/errorHandling.ts 2>/dev/null && echo "  Found <T( pattern"
grep -n '<[A-Z](' src/lib/sidebarErrorHandling.ts 2>/dev/null && echo "  Found <T( pattern"

echo ""
echo "=== NEXT STEPS ==="
echo "1. Review each error location with the commands above"
echo "2. Apply the appropriate fix"
echo "3. Run: npm run lint <file> to verify"
echo "4. Commit: git commit -am 'Fix: <file> parsing error'"
echo "5. Repeat for next file"
echo ""
echo "=== EMERGENCY ROLLBACK ==="
echo "If you break something:"
echo "  git diff  # Review changes"
echo "  git checkout -- <file>  # Revert single file"
echo "  git reset --hard HEAD  # Revert all changes"