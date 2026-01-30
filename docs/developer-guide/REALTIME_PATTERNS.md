# Realtime Subscription Patterns Guide

**Version:** 1.0  
**Status:** Active (Phase 1)  
**Last Updated:** January 30, 2026

---

## 📖 Overview

This guide documents the canonical patterns for Supabase Realtime subscriptions in TradePro v10. All new realtime hooks MUST follow these patterns to prevent memory leaks and ensure proper cleanup.

---

## ✅ Canonical Pattern: useRealtimePositions

**File:** `src/hooks/useRealtimePositions.tsx`  
**Status:** Reference implementation  
**Use Case:** Complex subscriptions with connection lifecycle management

### Pattern Characteristics
- Uses WebSocketConnectionManager for advanced lifecycle
- Registers connections in manager
- Proper cleanup and error handling
- Production-ready

### Key Code Section
```typescript
useEffect(() => {
  if (!userId) {
    setLoading(false);
    return;
  }

  // Initialize subscription
  const subscription = supabase
    .channel(`positions:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'positions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Handle position updates
        // Update state based on payload
      }
    )
    .subscribe();

  setLoading(false);

  // ✅ CRITICAL: Cleanup function
  return () => {
    subscription.unsubscribe();
    // Also remove from manager if using one
  };
}, [userId]);
```

### When to Use
- Complex business logic
- Multiple related subscriptions
- Connection lifecycle tracking
- Production trading features

---

## ✅ Standard Pattern: useRealtimeOrders & useRealtimeProfile

**Files:**
- `src/hooks/useRealtimeOrders.ts`
- `src/hooks/useRealtimeProfile.ts`

**Status:** Standard implementation  
**Use Case:** Simple, callback-based subscriptions

### Pattern Characteristics
- Simple callback-based updates
- Proper dual cleanup (unsubscribe + removeChannel)
- Lightweight and focused
- Recommended for most use cases

### Key Code Section
```typescript
const ExampleHook = (
  userId: string | undefined,
  onDataChange: () => void
) => {
  const callbackRef = useRef(onDataChange);

  // Sync callback ref
  useEffect(() => {
    callbackRef.current = onDataChange;
  });

  useEffect(() => {
    if (!userId) return;

    // Create subscription
    const channel = supabase
      .channel(`channel-name-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_name',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    // ✅ CRITICAL: Dual cleanup
    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [userId]);
};
```

### When to Use
- Simple subscriptions for refetching data
- Callback-only updates (no complex state)
- Most API hooks
- Lightweight features

---

## ✅ Reference Pattern: useRealtimeLeads

**File:** `src/hooks/useRealtimeLeads.ts`  
**Status:** Reference-based implementation  
**Use Case:** Subscriptions with callback refs

### Pattern Characteristics
- Uses useRef for channel storage
- Proper reference nullification
- Handles debug flags
- Flexible dependency array

### Key Code Section
```typescript
export const useRealtimeLeads = (
  callback: () => void,
  deps: unknown[] = []
) => {
  // Store channel in ref for proper cleanup
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Store callback in ref to prevent subscription recreation
  const callbackRef = useRef<() => void>(callback);

  // Update callback ref (sync effect)
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    callbackRef.current();

    // Subscribe and store in ref
    channelRef.current = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (DEBUG_REALTIME) {
            logger.debug('Lead change', { metadata: payload });
          }
          callbackRef.current();
        }
      )
      .subscribe();

    // ✅ CRITICAL: Cleanup with ref check and nullification
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [...deps]);
};
```

### When to Use
- Variable dependency arrays
- Multiple triggers for re-subscription
- Flexible subscription management
- Debug logging needs

---

## 🚫 Anti-Patterns to Avoid

### ❌ Missing Cleanup
```typescript
// WRONG: No cleanup function!
useEffect(() => {
  const subscription = supabase.channel(...).subscribe();
  // Missing return statement = Memory leak!
}, [userId]);
```

**Fix:**
```typescript
// ✅ Correct: Cleanup in return
return () => {
  subscription.unsubscribe();
  supabase.removeChannel(subscription);
};
```

---

### ❌ Immediate Unsubscribe
```typescript
// WRONG: Unsubscribe immediately, defeats purpose
useEffect(() => {
  const subscription = supabase.channel(...).subscribe();
  subscription.unsubscribe(); // Runs immediately!
}, [userId]);
```

**Fix:**
```typescript
// ✅ Correct: Unsubscribe in cleanup
return () => {
  subscription.unsubscribe();
};
```

---

### ❌ Lost Reference
```typescript
// WRONG: Can't unsubscribe, variable out of scope
useEffect(() => {
  supabase.channel(...).subscribe();
  // subscription variable not stored!
}, [userId]);

return () => {
  subscription.unsubscribe(); // Error: undefined!
};
```

**Fix:**
```typescript
// ✅ Correct: Store in state or ref
const channelRef = useRef(null);
useEffect(() => {
  channelRef.current = supabase.channel(...).subscribe();
  return () => {
    channelRef.current?.unsubscribe();
  };
}, [userId]);
```

---

### ❌ Stale Callback
```typescript
// WRONG: Callback never updates
const ExampleHook = (callback: () => void) => {
  useEffect(() => {
    supabase.channel(...).on('postgres_changes', callback);
    // callback is stale! Always calls original
  }, []);
};
```

**Fix:**
```typescript
// ✅ Correct: Use ref to sync callback
const callbackRef = useRef(callback);
useEffect(() => {
  callbackRef.current = callback;
});

useEffect(() => {
  supabase.channel(...).on('postgres_changes', () => {
    callbackRef.current();
  });
}, []);
```

---

## 📋 Checklist for New Realtime Hooks

When creating a new realtime hook, ensure:

- [ ] **Storage**: Channel stored in ref or closure
- [ ] **Subscription**: Called with proper filter
- [ ] **Handler**: Callback synced via ref if needed
- [ ] **Cleanup**: Return function with unsubscribe()
- [ ] **Removal**: Call supabase.removeChannel()
- [ ] **Nullification**: Set ref to null in cleanup (if using ref)
- [ ] **Dependencies**: Dependency array prevents infinite loops
- [ ] **Nullcheck**: Handle undefined userId/props
- [ ] **Types**: Proper TypeScript types for channel
- [ ] **Testing**: Add memory leak tests
- [ ] **Documentation**: JSDoc with example
- [ ] **Debug**: Optional DEBUG flag (development only)

---

## 🧪 Testing Your Realtime Hook

### Memory Leak Test Template
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

it('should cleanup subscription on unmount', async () => {
  const { unmount } = renderHook(() => useMyRealtime('user-123'));

  await act(() => {
    unmount();
  });

  await waitFor(() => {
    // Verify cleanup was called
    expect(mockRemoveChannel).toHaveBeenCalled();
  });
});

it('should handle userId change without memory leak', async () => {
  const { rerender } = renderHook(
    ({ userId }) => useMyRealtime(userId),
    { initialProps: { userId: 'user1' } }
  );

  rerender({ userId: 'user2' });

  await waitFor(() => {
    // Verify old subscription was cleaned up
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
```

### Chrome DevTools Memory Profiling
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot (baseline)
3. Mount component 100 times
4. Take another snapshot
5. Compare: Should show no growth trend

---

## 📝 Documentation Template

Add to your hook file:

```typescript
/**
 * Hook: useMyRealtime[Feature]
 * 
 * [Brief description of what it subscribes to]
 * 
 * @example
 * const { data, loading, error } = useMyRealtime(userId);
 * 
 * @param userId - User ID for filtering
 * @returns {{ 
 *   data: DataType[]; 
 *   loading: boolean; 
 *   error: Error | null 
 * }}
 * 
 * @see useRealtimePositions (canonical pattern)
 * @see docs/developer-guide/REALTIME_PATTERNS.md (full guide)
 */
```

---

## 🔗 Related Documentation

- **Canonical Example:** `src/hooks/useRealtimePositions.tsx`
- **Standard Examples:** `src/hooks/useRealtime{Orders,Profile}.ts`
- **Reference Example:** `src/hooks/useRealtimeLeads.ts`
- **Test Suite:** `src/hooks/__tests__/realtimeMemoryLeaks.test.ts`
- **Main Guide:** `PHASE_1_EXECUTION_CHECKLIST.md`

---

## ✅ Common Questions

**Q: Should I always call both unsubscribe() and removeChannel()?**  
A: Yes. unsubscribe() stops listening, removeChannel() removes from Supabase manager.

**Q: Why use ref for callback?**  
A: Prevents subscription recreation when callback changes. Syncs callback without re-subscribing.

**Q: Can I use this pattern with multiple tables?**  
A: Yes, create multiple channels (one per table) and cleanup each in the return.

**Q: How do I test for memory leaks?**  
A: Use memory profiler in Chrome DevTools or add automated tests. See test template above.

**Q: Should I use dependencies array?**  
A: Yes. Include userId and any values that trigger re-subscription to prevent infinite loops.

---

## 📞 Support

Issues with realtime subscriptions?
1. Check this guide for correct pattern
2. Compare against canonical examples
3. Run memory profiler tests
4. Check browser console for WebSocket errors
5. Review DEBUG_REALTIME logs in development

---

**Last Updated:** January 30, 2026  
**Status:** Active  
**Version:** 1.0  
**Next Review:** After Phase 1 Complete
