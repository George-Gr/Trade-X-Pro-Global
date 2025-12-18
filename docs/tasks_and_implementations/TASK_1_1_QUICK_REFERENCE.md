# Task 1.1 Quick Reference Guide

**Task:** Implement Stop Loss & Take Profit Execution  
**Status:** Analysis Complete ✅  
**Effort:** 13-17 hours  
**Timeline:** 3 days (Nov 17-19)

---

## TL;DR

**Problem:** SL/TP logic exists but doesn't auto-execute. Positions stay open even when price hits trigger.

**Solution:** Build 2 frontend hooks:

1. `useSlTpExecution` — Calls edge function to close position
2. `useSLTPMonitoring` — Watches prices and triggers closure

**Effort:** 13-17 hours (within budget)  
**Risk:** Low (90% backend exists)  
**Start:** Ready now

---

## What Already Works ✅

| Component              | Status | Details                                                         |
| ---------------------- | ------ | --------------------------------------------------------------- |
| Order SL/TP parameters | ✅     | Users can set SL/TP when placing orders                         |
| Edge function          | ✅     | `close-position` works for manual closure                       |
| Price stream           | ✅     | Real-time prices available from Finnhub                         |
| Position updates       | ✅     | Real-time position changes from database                        |
| Database schema        | ✅     | `positions.stop_loss` and `positions.take_profit` columns exist |

---

## What's Missing ❌

| Component                | Impact | Effort |
| ------------------------ | ------ | ------ |
| `useSlTpExecution` hook  | High   | 3-4h   |
| `useSLTPMonitoring` hook | High   | 2-3h   |
| UI integration           | Medium | 2h     |
| Tests                    | Medium | 4-5h   |
| Error handling           | Low    | 1-2h   |

---

## 3-Day Implementation Plan

### Day 1: Build Hooks (5h)

```
09:00-12:00: useSlTpExecution (call edge function + retry)
13:00-15:30: useSLTPMonitoring (watch prices + trigger)
15:30-17:00: Code review
```

### Day 2: Integration & Tests (5h)

```
09:00-11:00: Wire into TradingPanel UI
11:00-12:00: Error handling & retry logic
13:00-17:00: Write 23 unit tests
```

### Day 3: Polish (3-4h)

```
09:00-12:00: Edge case testing
13:00-15:00: Documentation
15:00-17:00: Final QA
```

---

## Hook Signatures

### `useSlTpExecution`

```typescript
const { executeStopLossOrTakeProfit, isExecuting, error } = useSlTpExecution();

await executeStopLossOrTakeProfit({
  positionId: "uuid",
  triggerType: "stop_loss" | "take_profit",
  currentPrice: 1.085,
  idempotencyKey: "optional-key", // Auto-generated if not provided
});
```

### `useSLTPMonitoring`

```typescript
const { monitoring, triggeredPositions, monitoringStatus } =
  useSLTPMonitoring();

// Returns:
// monitoring: boolean (active or inactive)
// triggeredPositions: Map<positionId, { triggerType, timestamp }>
// monitoringStatus: 'active' | 'inactive'
```

---

## Integration Points

### TradingPanel Component

```typescript
const { monitoring } = useSLTPMonitoring();

// Show status badge in UI
{monitoring && <Badge>Monitoring SL/TP</Badge>}
```

### NotificationContext

```typescript
// Listen for position_closure notifications
// Show toast on trigger
// Refresh position list automatically
```

---

## Testing Checklist

**useSlTpExecution tests (8):**

- [ ] Successful closure
- [ ] Network error retry
- [ ] Max retries exhausted
- [ ] Idempotency handling
- [ ] Different trigger types
- [ ] Error state management
- [ ] Loading state
- [ ] Result extraction

**useSLTPMonitoring tests (9):**

- [ ] Fetch positions with SL/TP
- [ ] Subscribe to prices
- [ ] Detect long buy SL trigger
- [ ] Detect long buy TP trigger
- [ ] Detect short sell SL trigger
- [ ] Detect short sell TP trigger
- [ ] No trigger between SL/TP
- [ ] Cleanup on unmount
- [ ] Track triggered positions

**Logic tests (6):**

- [ ] shouldTriggerStopLoss (4 scenarios)
- [ ] shouldTriggerTakeProfit (4 scenarios)
- [ ] extractSymbols helper
- [ ] idempotency key generation

---

## Success Criteria (Quick Check)

**Functionality:**

- [ ] Price hits SL → position closes
- [ ] Price hits TP → position closes
- [ ] User notified
- [ ] P&L correct
- [ ] Ledger recorded

**Code Quality:**

- [ ] No console.log
- [ ] TypeScript strict
- [ ] ESLint clean
- [ ] > 85% coverage
- [ ] No memory leaks

**Performance:**

- [ ] Monitoring < 100ms
- [ ] Comparison < 200ms
- [ ] < 5 re-renders
- [ ] Stable memory

---

## Edge Function Details

**Endpoint:** `close-position` (existing)

**Request:**

```json
{
  "position_id": "uuid",
  "reason": "stop_loss" or "take_profit",
  "idempotency_key": "sl_uuid_timestamp",
  "quantity": null  // Full close
}
```

**Response:**

```json
{
  "data": {
    "closure_id": "uuid",
    "position_id": "uuid",
    "reason": "stop_loss",
    "status": "completed",
    "entry_price": 1.09,
    "exit_price": 1.085,
    "quantity_closed": 1.0,
    "realized_pnl": -50.0,
    "pnl_percentage": -0.46,
    "commission": 0.5,
    "slippage": 0.0005
  }
}
```

---

## Comparison Logic

**Stop Loss (Buy Position):**

```
TRIGGER if current_price <= stop_loss
Example: Bought at 1.1000, SL at 1.0900, price drops to 1.0850 → TRIGGER
```

**Take Profit (Buy Position):**

```
TRIGGER if current_price >= take_profit
Example: Bought at 1.1000, TP at 1.1200, price rises to 1.1300 → TRIGGER
```

**Stop Loss (Sell Position):**

```
TRIGGER if current_price >= stop_loss
Example: Sold at 1.1000, SL at 1.1100, price rises to 1.1150 → TRIGGER
```

**Take Profit (Sell Position):**

```
TRIGGER if current_price <= take_profit
Example: Sold at 1.1000, TP at 1.0900, price drops to 1.0800 → TRIGGER
```

---

## Error Handling

**Transient Errors (Retry):**

- Network timeout
- 429 (rate limit)
- 503 (service unavailable)

**Strategy:** Retry 3x with exponential backoff (200ms, 400ms, 800ms)

**Permanent Errors (Don't Retry):**

- 401 (auth failed)
- 403 (KYC failed)
- 404 (position not found)
- 400 (bad request)

**Strategy:** Show error toast, continue monitoring

---

## Files to Create/Update

**New Files:**

- `src/hooks/useSlTpExecution.tsx` (120 LOC)
- `src/hooks/useSLTPMonitoring.tsx` (180 LOC)
- `src/hooks/__tests__/useSlTpExecution.test.tsx` (250 LOC)
- `src/hooks/__tests__/useSLTPMonitoring.test.tsx` (300 LOC)
- `src/lib/trading/__tests__/slTpLogic.test.ts` (180 LOC)

**Update Files:**

- `src/components/trading/TradingPanel.tsx` (add monitoring UI)
- `src/contexts/NotificationContext.tsx` (add closure listener)

---

## Blockers & Mitigations

| Blocker                | Probability | Mitigation             | Effort        |
| ---------------------- | ----------- | ---------------------- | ------------- |
| Finnhub API rate limit | Low         | Local price cache      | 30m           |
| Realtime latency       | Low         | WebSocket fallback     | 2h            |
| Edge function timeout  | Low         | Reduce comparison loop | 1h            |
| Race conditions        | Low         | Idempotency key        | 0m (designed) |

---

## Command Reference

**Create feature branch:**

```bash
git checkout -b feature/task-1-1-sltp-execution
```

**Run tests:**

```bash
npm test -- src/hooks/__tests__/useSlTpExecution.test.tsx --run
npm test -- src/hooks/__tests__/useSLTPMonitoring.test.tsx --run
```

**Build check:**

```bash
npm run build
```

**Lint check:**

```bash
npm run lint
```

**Type check:**

```bash
npm run type-check
```

---

## References

**Full Analysis:** `docs/tasks_and_implementations/TASK_1_1_DEEP_ANALYSIS.md`

**Roadmap:** `docs/assessments_and_reports/ROADMAP_AUDIT_ACTIONABLE.md` (Task 1.1)

**PRD Reference:** `PRD.md` Section 6.0.5 (Stop Loss & Take Profit Logic)

**Edge Function:** `supabase/functions/close-position/index.ts`

---

## Go/No-Go Checklist Before Starting

- [ ] Read this quick reference
- [ ] Read full analysis doc
- [ ] Review edge function code
- [ ] Review existing hooks
- [ ] All dependencies ready
- [ ] Feature branch created
- [ ] No blockers identified

**Status:** ✅ Ready to start implementation

---

_Last updated: November 16, 2025_  
_Ready to implement: Yes ✅_
