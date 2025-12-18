# Infinite Loop & Maximum Update Depth Error - Fix Guide

**Date:** December 13, 2025  
**Severity:** Critical  
**Affected Files:**

- `src/contexts/AccessibilityContext.tsx`
- `src/contexts/NotificationContext.tsx`

---

## Root Cause Analysis

### The Problem: "Maximum Update Depth Exceeded" Error

The app was experiencing an infinite re-render loop with this error:

```
App.tsx:39 Uncaught SyntaxError: Maximum update depth exceeded.
This can happen when a component calls setState inside a useEffect,
but the useEffect either doesn't have a dependency array, or one of the
dependencies keeps changing.
```

### Why It Happened

**AccessibilityContext Issue:**

1. Custom hooks (`useVisualAccessibilityPreferences`, `useColorBlindMode`, etc.) were called during render
2. These hooks return object references that change on every render
3. useEffect dependencies pointed to these objects
4. Since objects are compared by reference, they always "changed"
5. Effects ran → state updated → component re-rendered → new object references → effects ran again
6. **Result:** Infinite loop

**NotificationContext Issue:**

1. Functions like `markAsRead` and `markAllAsRead` were defined outside the component
2. They referenced `user` and `setUnreadCount` which weren't in scope
3. The context value object was recreated on every render
4. This caused all consumers to re-render unnecessarily
5. **Result:** Memory leaks and potential infinite loops in consumers

---

## Solutions Implemented

### 1. AccessibilityContext Fix

**Key Changes:**

- Added `useMemo` to memoize the context value
- Changed effect dependencies from objects to specific primitive values
- Used `useCallback` for toggle functions to prevent recreations
- Properly stabilized all dependencies

**Before:**

```typescript
// ❌ BAD: Depends on entire objects that change every render
useEffect(() => {
  if (visualPreferences.preferences.highContrast) {
    root.style.filter = "contrast(1.5) brightness(1.1)";
  }
}, [visualPreferences.preferences]); // Object reference changes!
```

**After:**

```typescript
// ✅ GOOD: Depends on specific values, not objects
useEffect(() => {
  if (visualPreferences.preferences.highContrast) {
    root.style.filter = "contrast(1.5) brightness(1.1)";
  }
}, [
  visualPreferences.preferences.highContrast, // Primitive boolean
  visualPreferences.preferences.reduceMotion, // Primitive boolean
  visualPreferences.preferences.largerText, // Primitive boolean
]);
```

**Value Memoization:**

```typescript
const value: AccessibilityContextType = useMemo(
  () => ({
    visualPreferences,
    colorBlindMode,
    // ... other fields
  }),
  [
    visualPreferences,
    colorBlindMode,
    // ... all dependencies
  ],
);
```

### 2. NotificationContext Fix

**Key Changes:**

- Moved `markAsRead` and `markAllAsRead` inside the component
- Wrapped them with `useCallback` for stability
- Added `useMemo` for the context value
- Proper scope management for all functions

**Before:**

```typescript
// ❌ BAD: Functions defined outside component, can't access scope
const markAsRead = async (id: string) => {
  if (!user) return; // user is undefined here!
  // ...
};
```

**After:**

```typescript
// ✅ GOOD: Functions defined inside component with useCallback
const markAsRead = useCallback(
  async (id: string) => {
    if (!user) return; // user is properly captured
    // ...
  },
  [user],
);
```

---

## Prevention Guidelines

### General Rules for Context Providers

#### 1. Memoize Object Dependencies

```typescript
// ✅ GOOD
const value = useMemo(
  () => ({
    state1,
    state2,
    method1,
    method2,
  }),
  [state1, state2, method1, method2],
);

// ❌ BAD - Creates new object every render
const value = {
  state1,
  state2,
  method1,
  method2,
};
```

#### 2. Use Primitive Values in Dependencies

```typescript
// ✅ GOOD - Depend on primitive values
useEffect(() => {
  applyHighContrast();
}, [preferences.highContrast]); // boolean, not object

// ❌ BAD - Depend on objects
useEffect(() => {
  applyHighContrast();
}, [preferences]); // object reference always new
```

#### 3. Memoize Callbacks

```typescript
// ✅ GOOD - Callbacks are stable
const handleClick = useCallback(() => {
  setState(value);
}, [value]);

// ❌ BAD - New function created every render
const handleClick = () => {
  setState(value);
};
```

#### 4. Proper Hook Scope

```typescript
// ✅ GOOD - Functions inside component, access scope
export function Provider({ children }) {
  const [state, setState] = useState();

  const handleAction = useCallback(() => {
    setState(newValue);
  }, []);

  return <Context.Provider value={{ state, handleAction }} />;
}

// ❌ BAD - Functions outside component, can't access scope
const handleAction = () => {
  setState(newValue);  // setState is undefined
};

export function Provider({ children }) {
  const [state, setState] = useState();
  return <Context.Provider value={{ state, handleAction }} />;
}
```

### Debugging Checklist

When you see "Maximum update depth exceeded":

1. **Check useEffect dependencies:**
   - Are you depending on objects that change every render?
   - Should you depend on primitive values instead?

2. **Check context value:**
   - Is the context value object recreated every render?
   - Should you use `useMemo`?

3. **Check callbacks:**
   - Are callbacks recreated every render?
   - Should you use `useCallback`?

4. **Check custom hooks:**
   - Do they return stable references?
   - Should you memoize their outputs?

5. **Check function scope:**
   - Are functions defined inside or outside the component?
   - Do they have access to the variables they need?

---

## Testing the Fix

### Manual Testing Steps

1. **Clear browser cache:**

   ```bash
   # Clear all browser caches
   Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   ```

2. **Start dev server:**

   ```bash
   npm run dev
   ```

3. **Check console:**
   - Should see no "Maximum update depth exceeded" errors
   - Should see clean startup logs

4. **Test accessibility features:**
   - Toggle high contrast (Ctrl+H)
   - Toggle reduce motion (Ctrl+M)
   - Toggle screen reader (Ctrl+S)
   - No warnings in console

5. **Test notifications:**
   - Trigger a notification event
   - Check if notification appears
   - Check if unread count updates

### Automated Testing

Add tests in your test suite:

```typescript
describe('AccessibilityProvider', () => {
  it('should not cause infinite re-renders', async () => {
    const renderCount = jest.fn();

    const TestComponent = () => {
      renderCount();
      return <div>Test</div>;
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Should render only once after mounting
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should not recreate context value on every render', () => {
    const contextValues = [];

    const Consumer = () => {
      const context = useAccessibility();
      contextValues.push(context);
      return null;
    };

    const { rerender } = render(
      <AccessibilityProvider>
        <Consumer />
      </AccessibilityProvider>
    );

    const firstValue = contextValues[0];

    // Trigger a re-render (e.g., via state change in parent)
    rerender(
      <AccessibilityProvider>
        <Consumer />
      </AccessibilityProvider>
    );

    const secondValue = contextValues[1];

    // Context value should be the same reference (memoized)
    expect(firstValue).toBe(secondValue);
  });
});
```

---

## Best Practices Moving Forward

### 1. Context Provider Template

```typescript
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ContextType {
  // Your state and methods here
}

const Context = createContext<ContextType | undefined>(undefined);

export function Provider({ children }) {
  // 1. State
  const [state, setState] = useState();

  // 2. Callbacks (memoized)
  const handleAction = useCallback(() => {
    setState(newValue);
  }, []);

  // 3. Effects (with proper dependencies)
  useEffect(() => {
    // Side effects
  }, [state]); // Depend on state, not derived values

  // 4. Memoize context value
  const value = useMemo(() => ({
    state,
    handleAction,
  }), [state, handleAction]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useMyContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useMyContext must be used within Provider');
  }
  return context;
}
```

### 2. Custom Hook Best Practices

```typescript
// When creating custom hooks that return objects
export function useMyHook() {
  const [state, setState] = useState();

  const callback = useCallback(() => {
    setState(newValue);
  }, []);

  // Return memoized object if the hook is used in effects
  return useMemo(
    () => ({
      state,
      callback,
    }),
    [state, callback],
  );
}
```

### 3. Code Review Checklist

- [ ] Does the component use `useMemo` for context values?
- [ ] Are all callbacks wrapped with `useCallback`?
- [ ] Do effects depend on primitive values, not objects?
- [ ] Are all functions defined inside the component?
- [ ] Are all dependencies in the dependency array?
- [ ] Is there no console warnings about missing dependencies?

---

## Files Modified

1. **src/contexts/AccessibilityContext.tsx**
   - Added `useMemo`, `useCallback` imports
   - Refactored all `useEffect` hooks to depend on primitives
   - Memoized context value
   - Memoized all callbacks

2. **src/contexts/NotificationContext.tsx**
   - Moved functions inside component
   - Wrapped functions with `useCallback`
   - Memoized context value
   - Fixed scope issues

---

## Performance Impact

- **Positive:** Eliminates infinite re-render loops, reduces memory usage
- **No Negative Impact:** `useMemo` and `useCallback` overhead is negligible and worth the stability gains
- **Result:** Smoother app performance, cleaner developer experience

---

## References

- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: useCallback](https://react.dev/reference/react/useCallback)
- [React Docs: Context](https://react.dev/reference/react/useContext)

---

## Questions & Support

If you encounter similar issues:

1. Check the debugging checklist above
2. Search for "Maximum update depth exceeded" in the codebase
3. Apply the same memoization patterns shown in this guide
4. Run the test suite to verify stability
