# Practical Implementation Guide: TypeScript Error Resolution

## Quick Start Commands

### 1. Check Current Error Counts

```bash
# Regular TypeScript errors
npx tsc --noEmit | grep -E "error TS[0-9]+:" | wc -l

# Strict mode errors
npm run type:strict 2>&1 | grep -E "error TS[0-9]+:" | wc -l

# ESLint warnings
npm run lint 2>&1 | grep -E "warning.*:" | wc -l
```

### 2. Fix ESLint Issues (Immediate Wins)

```bash
# Auto-fix all fixable ESLint issues
npm run lint:fix

# Check remaining issues
npm run lint
```

### 3. Address Strict Mode Errors

#### Step 1: Identify exactOptionalPropertyTypes Errors

```bash
# Get specific error messages
npm run type:strict 2>&1 | grep -E "error TS[0-9]+:" | head -20
```

#### Step 2: Common Fix Patterns

**Pattern 1: Optional Properties**

```typescript
// Before (causes strict mode errors)
interface User {
  name?: string;
  email?: string;
}

// After (explicit null handling)
interface User {
  name?: string | null;
  email?: string | null;
}
```

**Pattern 2: Object Spread Operations**

```typescript
// Before
const base = { name: 'John' };
const extended = { ...base, age: 25 };

// After
const extended: { name: string; age?: number | null } = { ...base, age: 25 };
```

**Pattern 3: Union Type Consistency**

```typescript
// Before
type A = { data?: string };
type B = { data: string };

// After
type A = { data?: string | null };
type B = { data: string | null };
```

### 4. Fix React Hooks Dependencies

**Example Fix:**

```typescript
// Before (missing dependency)
const bestVariant = useMemo(() => {
  return experimentManager.getBestVariant(variant);
}, [variant]); // Missing experimentManager

// After (complete dependencies)
const bestVariant = useMemo(() => {
  return experimentManager.getBestVariant(variant);
}, [variant, experimentManager]);
```

### 5. Replace 'any' Types

**AssetAllocation.tsx Fix:**

```typescript
// Before
formatter={(value: any) => `$${Number(value).toLocaleString()}`}

// After
formatter={(value: number) => `$${value.toLocaleString()}`}
```

**EquityChart.tsx Fix:**

```typescript
// Before
(sum: number, pos: any) => {

// After
(sum: number, pos: { amount: number }) => {
```

### 6. Batch Processing Strategy

**Use grep to find patterns:**

```bash
# Find all optional properties
grep -r "?: " src/ --include="*.ts" --include="*.tsx" | head -20

# Find all 'any' types
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# Find React hooks
grep -r "useMemo\|useEffect\|useCallback" src/ --include="*.ts" --include="*.tsx" | head -10
```

### 7. Validation Commands

After making changes:

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check strict mode errors
npm run type:strict

# Run linting
npm run lint

# Run tests
npm test
```

### 8. CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: TypeScript Check
  run: npx tsc --noEmit

- name: Strict Mode Check
  run: npm run type:strict

- name: ESLint Check
  run: npm run lint
```

### 9. Monitoring Script

Create `scripts/check-quality.sh`:

```bash
#!/bin/bash
echo "=== TypeScript Error Count ==="
tsc_errors=$(npx tsc --noEmit 2>&1 | grep -E "error TS[0-9]+:" | wc -l)
echo "Regular mode: $tsc_errors"

strict_errors=$(npm run type:strict 2>&1 | grep -E "error TS[0-9]+:" | wc -l)
echo "Strict mode: $strict_errors"

eslint_warnings=$(npm run lint 2>&1 | grep -E "warning.*:" | wc -l)
echo "ESLint warnings: $eslint_warnings"

if [ $tsc_errors -gt 0 ] || [ $strict_errors -gt 0 ] || [ $eslint_warnings -gt 0 ]; then
  echo "❌ Quality gates failed"
  exit 1
else
  echo "✅ All quality gates passed"
fi
```

### 10. Emergency Rollback

If strict mode causes too many issues:

```bash
# Temporarily disable strict mode in CI
# Edit package.json scripts
"type:strict": "echo 'Skipping strict mode check'"

# Or adjust tsconfig.strict.json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": false
  }
}
```

## Priority Order

1. **High Priority (Week 1):**

   - Fix ESLint warnings (7 items)
   - Address React hooks dependencies (3 items)
   - Replace explicit 'any' types (4 items)

2. **Medium Priority (Week 2-3):**

   - Update optional property types for strict mode
   - Fix object spread patterns
   - Standardize union types

3. **Low Priority (Week 4+):**
   - Add comprehensive type definitions
   - Improve type safety in test files
   - Optimize build performance

## Quick Reference

| Issue Type          | Command to Find                  | Fix Pattern                |
| ------------------- | -------------------------------- | -------------------------- |
| Optional properties | `grep "?: " src/`                | Add `` `\| null` ``        |
| Any types           | `grep ": any" src/`              | Replace with specific type |
| React hooks         | `grep "useMemo\|useEffect" src/` | Add missing dependencies   |
| Object spread       | `grep "\.\.\." src/`             | Add explicit types         |

## Success Criteria

- ✅ TypeScript errors: 0 (regular mode)
- ✅ TypeScript errors: 0 (strict mode)
- ✅ ESLint warnings: 0
- ✅ All tests passing
- ✅ Build time < 2 minutes
- ✅ CI/CD pipeline green

---

**Note:** This guide provides immediate actionable steps. For detailed analysis, see `TYPE_CHECKING_ANALYSIS_REPORT.md`.
