# Task 1.1: Stop Loss & Take Profit Execution — Deep Analysis & Implementation Plan

**Date:** November 16, 2025  
**Status:** 🟡 50% Complete (Analysis Phase)  
**Priority:** 🔴 High (MVP Blocking)  
**Estimated Effort:** 15-20 hours  
**Target Completion:** November 18-19, 2025

---

## Executive Summary

**Current State:** 90% of backend infrastructure exists; manual execution works. **Missing:** Automatic trigger detection and real-time monitoring on the frontend.

**What Needs to Be Built:**

1. ✅ `useSlTpExecution.tsx` — Execute closure via edge function (3-4h)
2. ✅ `useSLTPMonitoring.tsx` — Monitor positions and auto-trigger (2-3h)
3. ✅ UI integration and notifications (2h)
4. ✅ Error handling & retry logic (1-2h)
5. ✅ Comprehensive tests (4-5h)

**Estimated Total:** 13-17 hours (within 15-20h budget)

---

## Current Implementation Analysis

### ✅ What Already Works

#### Backend (90% Complete)

**1. Execute-Stop-Loss-Take-Profit Edge Function**

- Location: `supabase/functions/execute-stop-loss-take-profit/index.ts`
- Size: ~180 lines
- Capabilities:
  - Fetches all open positions with SL/TP set
  - Gets current price from Finnhub API
  - Compares price to SL/TP thresholds
  - Calls `close_position_atomic` RPC for atomic closure
  - Creates notifications
- **Status:** Works but requires manual invocation (via scheduled function or webhook)

**2. Close-Position Edge Function**

- Location: `supabase/functions/close-position/index.ts`
- Size: ~350 lines
- Capabilities:
  - Validates user KYC and account status
  - Fetches current market price (Finnhub API)
  - Calculates slippage (0.1% normal, 0.15% for forced closures)
  - Computes P&L with commission (0.1% rate)
  - Calls `execute_position_closure` RPC (supports partial closes)
  - Creates detailed notifications with P&L
  - Records ledger entry for audit trail
- **Status:** Works for manual closure; ready for automated calls

**3. Database Layer**

- `positions` table: Has `stop_loss`, `take_profit`, `status` columns
- Stored procedures:
  - `execute_position_closure` — Atomic closure with all side effects
  - `close_position_atomic` — Alternative closure function
- RLS policies: Enforce user isolation on all tables

#### Frontend (70% Complete)

**1. Order Execution Hook**

- Location: `src/hooks/useOrderExecution.tsx`
- Accepts parameters: `stop_loss?: number`, `take_profit?: number`
- Stores SL/TP in position record on execution

**2. SL/TP Validation**

- Location: `src/hooks/useRiskLimits.tsx`
- Validates minimum distance (e.g., 50 pips for forex)
- Enforces required SL for risk-sensitive accounts
- Returns violations array

**3. Order Form**

- Location: `src/components/trading/OrderForm.tsx`
- Collects SL/TP from user
- Calls validation
- Passes to order execution hook

**4. Price Stream**

- Location: `src/hooks/usePriceStream.tsx`
- Subscribes to Finnhub price updates
- Returns: `Map<symbol, price>`
- Already in use by multiple components

**5. Position Updates**

- Location: `src/hooks/usePositionUpdate.tsx`
- Fetches and subscribes to position changes via Realtime
- Returns: `Position[]` with auto-refresh

---

### ❌ What's Missing

| Component              | Purpose                           | Effort     | Risk   |
| ---------------------- | --------------------------------- | ---------- | ------ |
| `useSlTpExecution`     | Execute closure via edge function | 3-4h       | Low    |
| `useSLTPMonitoring`    | Monitor & auto-trigger            | 2-3h       | Medium |
| Realtime trigger logic | Compare prices to SL/TP           | 2-3h       | Medium |
| Error handling         | Retry & fallback                  | 1-2h       | Low    |
| Notifications          | User feedback                     | 1h         | Low    |
| Tests                  | Unit & integration                | 4-5h       | Low    |
| **Total**              |                                   | **13-17h** |        |

---

## Detailed Component Design

### 1. `useSlTpExecution.tsx` Hook (3-4 hours)

**Purpose:** Execute SL/TP closure via edge function with retry logic

**Type Definitions:**

```typescript
interface SLTPExecutionOptions {
  positionId: string;
  triggerType: "stop_loss" | "take_profit";
  currentPrice: number;
  idempotencyKey?: string; // Auto-generated if not provided
}

interface ClosureResponse {
  closure_id: string;
  position_id: string;
  reason: "stop_loss" | "take_profit";
  status: "partial" | "completed";
  entry_price: number;
  exit_price: number;
  quantity_closed: number;
  quantity_remaining: number;
  realized_pnl: number;
  pnl_percentage: number;
  commission: number;
  slippage: number;
}

interface SLTPExecutionState {
  isExecuting: boolean;
  error: string | null;
  lastResult: ClosureResponse | null;
}
```

**Core Function:**

```typescript
const executeStopLossOrTakeProfit = async (
  options: SLTPExecutionOptions,
): Promise<ClosureResponse> => {
  const idempotencyKey =
    options.idempotencyKey ||
    `${options.triggerType}_${options.positionId}_${Date.now()}`;

  // Call close-position edge function
  const { data, error } = await supabase.functions.invoke("close-position", {
    body: {
      position_id: options.positionId,
      reason: options.triggerType,
      idempotency_key: idempotencyKey,
      quantity: undefined, // Full close
    },
  });

  if (error) throw error;
  return data.data; // Extract closure data
};
```

**Retry Logic:**

```typescript
const executeWithRetry = async (
  options: SLTPExecutionOptions,
  maxRetries = 3,
): Promise<ClosureResponse> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeStopLossOrTakeProfit(options);
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts: ${error.message}`,
        );
      }

      // Exponential backoff: 200ms, 400ms, 800ms
      const backoffMs = Math.pow(2, attempt) * 100;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
};
```

**Hook Return:**

```typescript
export const useSlTpExecution = () => {
  const [state, setState] = useState<SLTPExecutionState>({
    isExecuting: false,
    error: null,
    lastResult: null,
  });

  const executeStopLossOrTakeProfit = useCallback(
    async (options: SLTPExecutionOptions): Promise<ClosureResponse> => {
      setState((prev) => ({ ...prev, isExecuting: true, error: null }));
      try {
        const result = await executeWithRetry(options);
        setState((prev) => ({ ...prev, lastResult: result }));
        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({ ...prev, error: errorMsg }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isExecuting: false }));
      }
    },
    [],
  );

  return {
    executeStopLossOrTakeProfit,
    isExecuting: state.isExecuting,
    error: state.error,
    lastResult: state.lastResult,
  };
};
```

**Testing Strategy:**

- Mock Supabase functions.invoke
- Test: Successful closure returns expected data
- Test: Network error triggers retry
- Test: All retries exhausted → throws error
- Test: Idempotency prevents duplicates
- Test: State updates correctly during execution

**Acceptance Criteria:**

- [ ] 3-4 hour implementation
- [ ] Full type safety
- [ ] Retry logic with exponential backoff
- [ ] Idempotency support
- [ ] 8+ unit tests, all passing
- [ ] No console logs in production
- [ ] ESLint clean

---

### 2. `useSLTPMonitoring.tsx` Hook (2-3 hours)

**Purpose:** Monitor positions for SL/TP triggers and execute closures automatically

**Core Logic:**

```typescript
function shouldTriggerStopLoss(
  position: Position,
  currentPrice: number,
): boolean {
  if (!position.stop_loss || position.status !== "open") return false;

  if (position.side === "buy") {
    return currentPrice <= position.stop_loss;
  } else if (position.side === "sell") {
    return currentPrice >= position.stop_loss;
  }
  return false;
}

function shouldTriggerTakeProfit(
  position: Position,
  currentPrice: number,
): boolean {
  if (!position.take_profit || position.status !== "open") return false;

  if (position.side === "buy") {
    return currentPrice >= position.take_profit;
  } else if (position.side === "sell") {
    return currentPrice <= position.take_profit;
  }
  return false;
}
```

**Hook Implementation:**

```typescript
export const useSLTPMonitoring = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [triggeredPositions, setTriggeredPositions] = useState<
    Map<string, { triggerType: "stop_loss" | "take_profit"; timestamp: number }>
  >(new Map());

  const { positions } = usePositionUpdate(); // Fetch positions
  const prices = usePriceStream(extractSymbols(positions)); // Subscribe to prices
  const { executeStopLossOrTakeProfit } = useSlTpExecution(); // Use execution hook

  useEffect(() => {
    if (!positions.length || !prices) return;

    setMonitoring(true);
    const symbolsWithSlTp = positions.filter(
      (p) => p.stop_loss || p.take_profit,
    );

    symbolsWithSlTp.forEach((position) => {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) return;

      let triggerType: "stop_loss" | "take_profit" | null = null;

      if (shouldTriggerStopLoss(position, currentPrice)) {
        triggerType = "stop_loss";
      } else if (shouldTriggerTakeProfit(position, currentPrice)) {
        triggerType = "take_profit";
      }

      if (triggerType) {
        // Execute closure
        executeStopLossOrTakeProfit({
          positionId: position.id,
          triggerType,
          currentPrice,
        }).catch((error) => {
          // Log error, but don't break monitoring
          console.error(`Failed to execute ${triggerType}:`, error);
        });

        // Track triggered position
        setTriggeredPositions((prev) => {
          const map = new Map(prev);
          map.set(position.id, { triggerType, timestamp: Date.now() });
          return map;
        });
      }
    });

    return () => {
      // Cleanup: unsubscribe from prices
      // (usePriceStream handles cleanup internally)
    };
  }, [positions, prices, executeStopLossOrTakeProfit]);

  return {
    monitoring,
    triggeredPositions,
    monitoringStatus: monitoring ? "active" : "inactive",
  };
};
```

**Integration Point:**

```typescript
// In src/pages/Trade.tsx or src/components/trading/TradingPanel.tsx
export const TradingPanel = () => {
  const { monitoring, triggeredPositions } = useSLTPMonitoring();

  return (
    <div>
      {/* Existing trading panel UI */}
      {monitoring && (
        <div className="px-3 py-2 text-sm bg-blue-50 border-b border-blue-200">
          <span className="text-blue-700">
            ✓ Monitoring SL/TP for {triggeredPositions.size} positions
          </span>
        </div>
      )}
    </div>
  );
};
```

**Testing Strategy:**

- Test: Positions with SL/TP fetched
- Test: Price stream subscribed for correct symbols
- Test: Long buy position SL triggered correctly
- Test: Short sell position TP triggered correctly
- Test: No trigger when price between SL/TP
- Test: Cleanup on unmount
- Test: Rapid price updates handled

**Acceptance Criteria:**

- [ ] 2-3 hour implementation
- [ ] Monitors all positions with SL/TP
- [ ] Correctly identifies triggers
- [ ] Calls execution hook when triggered
- [ ] Tracks triggered positions
- [ ] Clean memory management
- [ ] 9+ unit tests, all passing
- [ ] No memory leaks detected

---

### 3. Realtime Price Monitoring (2-3 hours)

**Current State:**

- ✅ `usePriceStream.tsx` exists and works
- ✅ Subscribes to Finnhub price updates
- ✅ Returns `Map<symbol, price>`

**What's Missing:**

- Connection between price updates and SL/TP comparison
- **Solution:** Implemented in `useSLTPMonitoring.tsx` (already handles this)

**Key Pattern:**

```typescript
const prices = usePriceStream(symbolsToMonitor);

useEffect(() => {
  // Re-run comparison on price change
  positions.forEach((position) => {
    const currentPrice = prices[position.symbol];
    // Check SL/TP triggers...
  });
}, [prices, positions]); // Both in dependency array
```

---

### 4. Error Handling & Retry Logic (1-2 hours)

**Error Scenarios:**

| Scenario                          | Handling                            | Retry    |
| --------------------------------- | ----------------------------------- | -------- |
| Network error (connection failed) | Retry with exponential backoff      | Yes (3x) |
| API rate limit (429)              | Respect Retry-After header          | Yes      |
| Validation error (invalid input)  | Show error, don't retry             | No       |
| Insufficient margin for closure   | Let edge function handle            | Yes (1x) |
| Price unavailable                 | Skip trigger (wait for next update) | No       |

**Implementation:**

```typescript
// In useSlTpExecution.tsx
const executeWithRetry = async (
  options: SLTPExecutionOptions,
  maxRetries = 3,
): Promise<ClosureResponse> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeStopLossOrTakeProfit(options);
    } catch (error) {
      const isTransient =
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("timeout") ||
        error.status === 429 ||
        error.status === 503;

      if (!isTransient || attempt === maxRetries) {
        throw error;
      }

      const backoffMs = Math.pow(2, attempt) * 100;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
};

// In useSLTPMonitoring.tsx
executeStopLossOrTakeProfit(options).catch((error) => {
  // Silently log error; don't break monitoring
  console.error(`SL/TP execution failed: ${error.message}`);

  // Notify user if critical
  if (error.status === 403) {
    toast({ title: "Error", description: "KYC verification required" });
  }
});
```

**Acceptance Criteria:**

- [ ] Network errors retried with backoff
- [ ] Validation errors not retried
- [ ] User notified on critical errors
- [ ] Monitoring continues despite errors
- [ ] 4+ error handling tests

---

### 5. Notification Integration (1 hour)

**Current State:**

- ✅ Edge function creates notifications in database
- ✅ NotificationContext has Realtime subscription

**What's Missing:**

- Listener for position_closure notifications
- Toast notification on trigger
- Position list refresh

**Implementation:**

```typescript
// In src/contexts/NotificationContext.tsx
useEffect(() => {
  // Add listener for position_closure notifications
  const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `type=eq.position_closure`, // New closure notification
      },
      (payload) => {
        const notification = payload.new;

        // Show toast
        toast({
          title: notification.title,
          description: notification.message,
          variant: "default",
        });

        // Refresh positions (will trigger position update and remove closed position)
        queryClient.invalidateQueries({ queryKey: ["positions"] });

        // Play notification sound (optional)
        playNotificationSound();
      },
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}, [queryClient, toast]);
```

**User Experience:**

1. Price crosses SL/TP threshold
2. Edge function closes position
3. Notification inserted in database
4. Realtime triggers listener
5. Toast shows "Position Closed - Stop Loss triggered at $1.0850"
6. Positions list updates (closes position removed)

**Acceptance Criteria:**

- [ ] Notifications displayed on closure
- [ ] Position list updates automatically
- [ ] User feedback is clear and timely
- [ ] No duplicate notifications

---

## Implementation Timeline

### **Day 1: Core Hooks (5 hours)**

**09:00-12:00 (3h): `useSlTpExecution.tsx`**

- Set up hook skeleton with TypeScript types
- Implement edge function call logic
- Add retry logic with exponential backoff
- Add state management

**12:00-13:00: Lunch**

**13:00-15:30 (2.5h): `useSLTPMonitoring.tsx`**

- Implement comparison logic functions
- Set up monitoring hook with dependencies
- Wire price stream and position updates
- Add triggered position tracking

**15:30-17:00 (1.5h): Code review and fixes**

### **Day 2: Integration & Testing (5 hours)**

**09:00-11:00 (2h): Integration**

- Wire monitoring into TradingPanel
- Update NotificationContext for closures
- Test end-to-end flow

**11:00-12:00 (1h): Error Handling**

- Implement retry logic
- Add error UI feedback
- Test error scenarios

**12:00-13:00: Lunch**

**13:00-17:00 (4h): Test Suite**

- `useSlTpExecution.test.tsx` — 8 tests
- `useSLTPMonitoring.test.tsx` — 9 tests
- Integration tests — 6 tests
- All tests passing

### **Day 3: Polish & Cleanup (3-4 hours)**

**09:00-12:00 (3h): Final Tests**

- Edge case testing
- Performance profiling
- Memory leak checks

**12:00-13:00: Lunch**

**13:00-15:00 (2h): Documentation & Cleanup**

- JSDoc comments
- Inline code documentation
- Code review cleanup

**15:00-16:00 (1h): Final QA**

- Verify all success criteria
- ESLint check
- TypeScript strict mode check

---

## Success Criteria (100% Definition)

### Functional Requirements ✅

- [ ] Users can set SL/TP when placing orders (already works)
- [ ] SL/TP automatically triggers when price crosses threshold
- [ ] Position closes with correct P&L calculation
- [ ] User receives notification of automatic closure
- [ ] Closure reason recorded in ledger as 'stop_loss' or 'take_profit'
- [ ] Dashboard updates to reflect closed position

### Code Quality ✅

- [ ] No console.log statements in production code
- [ ] TypeScript strict mode (tsconfig.json)
- [ ] ESLint: 0 errors (warnings pre-existing OK)
- [ ] Test coverage > 85%
- [ ] No memory leaks (Chrome DevTools heap snapshots)
- [ ] No unsubscribed Realtime listeners

### Performance ✅

- [ ] Price monitoring updates within 100ms of price change
- [ ] SL/TP comparison completes within 200ms
- [ ] No excessive re-renders (React Profiler < 5 per price update)
- [ ] Memory usage stable over 30-minute session

### User Experience ✅

- [ ] Clear notification when SL/TP triggered
- [ ] Position immediately removed from open positions list
- [ ] Monitoring status visible in UI
- [ ] Error messages helpful and actionable
- [ ] No visual glitches during execution

### Test Coverage ✅

- [ ] Unit tests: 23/23 passing
- [ ] Integration tests: 6/6 passing
- [ ] Coverage report: > 85%
- [ ] No skipped or pending tests

---

## Blockers & Risk Mitigation

### **Potential Blockers**

| Blocker                        | Mitigation                                | Effort |
| ------------------------------ | ----------------------------------------- | ------ |
| Finnhub API rate limiting      | Implement local price cache with TTL      | 30 min |
| Realtime price latency > 500ms | Use WebSocket fallback for priority pairs | 2h     |
| Edge function timeout          | Reduce comparison loop, pagination        | 1h     |
| Position list not updating     | Invalidate React Query cache              | 15 min |

### **Risk Assessment**

| Risk                                          | Probability | Impact | Mitigation                         |
| --------------------------------------------- | ----------- | ------ | ---------------------------------- |
| Race condition (price changes during closure) | Low         | High   | Idempotency key + atomic RPC       |
| Duplicate closures                            | Low         | High   | Idempotency check in edge function |
| Missing notifications                         | Medium      | Low    | Fallback: console log + toast      |
| Memory leak                                   | Low         | High   | useEffect cleanup + unsubscribe    |

---

## Rollback Plan

If implementation causes issues:

1. **Feature Flag:** Wrap monitoring in feature flag

   ```typescript
   if (featureFlags.slTpMonitoring) {
     useSLTPMonitoring();
   }
   ```

2. **Disable Hook:** Temporarily remove from TradingPanel

   ```typescript
   // const { monitoring } = useSLTPMonitoring(); // Commented out
   ```

3. **Manual Closure:** Users can still close manually via close-position

4. **Revert:** `git revert` last 3 commits if needed

---

## Deliverables Checklist

### Code Files

- [ ] `src/hooks/useSlTpExecution.tsx` (120 LOC)
- [ ] `src/hooks/useSLTPMonitoring.tsx` (180 LOC)
- [ ] `src/components/trading/TradingPanel.tsx` (updated)
- [ ] `src/contexts/NotificationContext.tsx` (updated)

### Test Files

- [ ] `src/hooks/__tests__/useSlTpExecution.test.tsx` (250 LOC, 8 tests)
- [ ] `src/hooks/__tests__/useSLTPMonitoring.test.tsx` (300 LOC, 9 tests)
- [ ] `src/lib/trading/__tests__/slTpLogic.test.ts` (180 LOC, 6 tests)

### Documentation

- [ ] JSDoc comments in both hooks
- [ ] Inline code comments explaining logic
- [ ] Test coverage report (target > 85%)
- [ ] Update ROADMAP_AUDIT_ACTIONABLE.md with results

---

## Next Steps

### Immediate (Today)

1. ✅ Complete this deep analysis
2. ✅ Update ROADMAP_AUDIT_ACTIONABLE.md with detailed task breakdown
3. Create feature branch: `git checkout -b feature/task-1-1-sltp-execution`

### Tomorrow (Day 1)

1. Implement `useSlTpExecution.tsx`
2. Implement `useSLTPMonitoring.tsx`
3. Code review and fixes

### Day 2

1. Wire monitoring into TradingPanel
2. Update NotificationContext
3. Comprehensive test suite

### Day 3

1. Polish and final QA
2. Documentation
3. Merge to main

---

## Questions for Clarification

**None at this time** — all requirements are clear and well-defined in the PRD.

---

## References

- **PRD Section:** 6.0.5 (Stop Loss & Take Profit Logic)
- **Close-Position Function:** `supabase/functions/close-position/index.ts`
- **Execute-SL-TP Function:** `supabase/functions/execute-stop-loss-take-profit/index.ts`
- **Risk Limits Hook:** `src/hooks/useRiskLimits.tsx`
- **Price Stream Hook:** `src/hooks/usePriceStream.tsx`
- **Position Updates Hook:** `src/hooks/usePositionUpdate.tsx`

---

**Document prepared:** November 16, 2025  
**Ready for implementation:** Yes ✅
