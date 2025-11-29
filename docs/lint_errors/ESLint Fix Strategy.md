# Comprehensive ESLint Fix Strategy

## Phase 1: Fix Critical Parsing Errors (PRIORITY)

These errors prevent compilation and must be fixed first.

### 1. ErrorUI.tsx (Line 212)
**Issue**: Likely a syntax error - missing closing bracket, semicolon, or malformed JSX

**Investigation needed**: Check around line 212 for:
- Unclosed JSX tags
- Missing semicolons
- Incomplete type definitions
- Dangling commas

### 2. SidebarErrorBoundary.tsx (Line 263)
**Issue**: Similar parsing error

**Check for**:
- Unclosed component tags
- Missing return statements
- Incomplete conditionals

### 3. chartUtils.ts (Line 298)
**Error**: "Type expected"

**Likely causes**:
- Incomplete generic type definition: `Array<>` instead of `Array<Type>`
- Missing type in function signature
- Incomplete interface/type declaration

### 4. errorHandling.ts (Line 21)
**Error**: "'>' expected"

**Likely causes**:
- Malformed generic: `Promise<` without closing `>`
- Incomplete arrow function: `() =>`
- Unclosed type parameter

### 5. sidebarErrorHandling.ts (Line 18)
**Error**: "'>' expected" (same as above)

---

## Phase 2: Fix React Hooks Dependencies

### Files with Hook Issues:
1. **PwaUpdateNotification.tsx**
   - Line 86: Missing `handleUpdate` dependency
   - Line 133: Missing `toast` dependency

2. **TradingViewWatchlist.tsx**
   - Line 181: `containerRef.current` issue in cleanup

**Solution Pattern**:
```typescript
// Option 1: Include dependency
useEffect(() => {
  // code
}, [dependency, otherDep]);

// Option 2: Use callback ref pattern
useEffect(() => {
  const container = containerRef.current;
  return () => {
    if (container) {
      // cleanup with stable ref
    }
  };
}, []);

// Option 3: Wrap in useCallback
const handleUpdate = useCallback(() => {
  // implementation
}, [/* deps */]);
```

---

## Phase 3: Replace `any` Types (201 warnings)

### Strategy: Replace by Category

#### Category A: Test Files (Lower Risk)
Files in `__tests__` directories can use type assertions more liberally.

**Pattern**:
```typescript
// Before
const mockFn = vi.fn() as any;

// After
const mockFn = vi.fn() as jest.Mock<ReturnType, Parameters>;
// or
const mockFn = vi.fn<Parameters, ReturnType>();
```

#### Category B: Event Handlers
**Pattern**:
```typescript
// Before
const handleClick = (e: any) => {}

// After
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
```

#### Category C: API/External Data
**Pattern**:
```typescript
// Before
const data: any = await fetch();

// After
interface ApiResponse {
  id: string;
  value: number;
  // ... other fields
}
const data: ApiResponse = await fetch();

// Or for truly unknown data
const data: unknown = await fetch();
// Then type guard
if (isValidResponse(data)) {
  // use data with proper type
}
```

#### Category D: Generic Utilities
**Pattern**:
```typescript
// Before
function debounce(fn: any, delay: number): any {}

// After
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {}
```

#### Category E: Worker Messages
**Pattern**:
```typescript
// Before
self.onmessage = (e: any) => {}

// After
interface WorkerMessage {
  type: 'calculate' | 'update';
  payload: ChartData;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {}
```

---

## Phase 4: Implementation Plan

### Step 1: Fix Parsing Errors (Day 1)
```bash
# Check each file individually
npm run lint src/components/ui/ErrorUI.tsx
npm run lint src/components/ui/SidebarErrorBoundary.tsx
npm run lint src/lib/chartUtils.ts
npm run lint src/lib/errorHandling.ts
npm run lint src/lib/sidebarErrorHandling.ts
```

### Step 2: Fix Hook Dependencies (Day 1)
- Update useEffect/useCallback hooks
- Test affected components

### Step 3: Fix `any` Types in Batches (Days 2-3)

**Batch 1: Test Files** (Lowest risk)
```bash
src/__tests__/**/*.test.tsx
src/**/__tests__/*.test.ts
```

**Batch 2: Utility Functions**
```bash
src/hooks/*.ts
src/lib/*.ts
```

**Batch 3: Components**
```bash
src/components/**/*.tsx
```

**Batch 4: Worker & Edge Functions**
```bash
src/workers/*.ts
supabase/functions/**/*.ts
```

### Step 4: Verification
After each batch:
```bash
npm run lint
npm run type-check
npm run test
```

---

## Common Type Replacements Reference

### React Event Types
```typescript
React.MouseEvent<HTMLElement>
React.ChangeEvent<HTMLInputElement>
React.FormEvent<HTMLFormElement>
React.KeyboardEvent<HTMLInputElement>
React.FocusEvent<HTMLInputElement>
```

### Common Patterns
```typescript
// Generic function
<T extends object>(param: T): T => {}

// API response
interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
}

// Component props with children
interface Props {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}

// Ref types
const ref = useRef<HTMLDivElement>(null);
const ref = useRef<ReturnType<typeof setInterval>>();

// Record types
Record<string, number>
Record<string, unknown>
```

---

## Special Cases

### 1. When `unknown` is Better Than `any`
```typescript
// External API data
const response: unknown = await fetch();

// Type guard
function isValidData(data: unknown): data is MyType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiredField' in data
  );
}
```

### 2. When to Use Type Assertions
```typescript
// After validation
const validated = data as ValidatedType;

// Testing mocks
const mockFn = vi.fn() as jest.MockedFunction<typeof realFn>;
```

### 3. Supabase Types
```typescript
import { Database } from '@/types/supabase';

type Position = Database['public']['Tables']['positions']['Row'];
type PositionInsert = Database['public']['Tables']['positions']['Insert'];
```

---

## Automated Fixes (Where Safe)

Some patterns can be automated with find-replace:

```bash
# Example regex patterns (use with caution)
# Replace in test files only:
(e: any) => → (e: MessageEvent) =>
: any\[\] → : unknown[]

# But manually verify each change!
```

---

## Testing Strategy

After each phase:

1. **Type Check**: `npm run type-check`
2. **Lint**: `npm run lint`
3. **Unit Tests**: `npm run test`
4. **Build**: `npm run build`
5. **Manual Testing**: Test affected features

---

## Rollback Plan

Before starting:
```bash
git checkout -b fix/eslint-warnings
git commit -am "Checkpoint before fixes"
```

After each phase:
```bash
git add .
git commit -m "Phase X: [description]"
```

If issues arise:
```bash
git revert HEAD
# or
git reset --hard <previous-commit>
```

---

## Expected Timeline

- **Phase 1** (Parsing Errors): 2-4 hours
- **Phase 2** (Hook Dependencies): 1-2 hours
- **Phase 3** (any Types): 8-12 hours
- **Phase 4** (Testing & Verification): 4-6 hours

**Total**: 2-3 days with testing

---

## Priority Order

1. ✅ **Critical**: Parsing errors (breaks build)
2. ⚠️ **High**: Hook dependency issues (runtime bugs)
3. 📋 **Medium**: `any` in production code (type safety)
4. 📝 **Low**: `any` in test files (less critical)

---

## Notes

- Don't fix everything at once - work in batches
- Test after each batch
- Commit frequently
- Some `any` types might be intentional (document with comments)
- Use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` sparingly with justification