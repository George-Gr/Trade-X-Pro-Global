# TradePro v10 - Cleanup Implementation Examples

**Purpose:** Concrete code patterns and examples for implementing the cleanup plan  
**Audience:** Developers executing cleanup tasks

---

## 1. Realtime Subscription Pattern (Canonical)

### ✅ Correct Pattern (To Follow)

**File:** `src/hooks/useRealtimePositions.tsx`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Position } from '@/types/position';

/**
 * Hook for realtime position updates
 * 
 * @example
 * const { positions, loading, error } = useRealtimePositions(userId);
 * 
 * @param userId - The user's ID
 * @returns {{ positions: Position[]; loading: boolean; error: Error | null }}
 */
export function useRealtimePositions(userId: string | null) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setPositions((prev) => {
              const index = prev.findIndex(
                (p) => p.id === (payload.new as Position).id
              );
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = payload.new as Position;
                return updated;
              }
              return [...prev, payload.new as Position];
            });
          } else if (payload.eventType === 'DELETE') {
            setPositions((prev) =>
              prev.filter((p) => p.id !== (payload.old as Position).id)
            );
          }
        }
      )
      .subscribe();

    setLoading(false);

    // ✅ CRITICAL: Cleanup unsubscribe
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { positions, loading, error };
}
```

### ❌ Incorrect Patterns (To Avoid)

```typescript
// ❌ WRONG: Missing unsubscribe cleanup
useEffect(() => {
  const subscription = supabase.channel(...).subscribe();
  // No cleanup! Memory leak!
}, [userId]);

// ❌ WRONG: Unsubscribe outside cleanup
useEffect(() => {
  const subscription = supabase.channel(...).subscribe();
  subscription.unsubscribe(); // Runs immediately, defeats purpose!
}, [userId]);

// ❌ WRONG: Unsubscribe in wrong place
useEffect(() => {
  const subscription = supabase.channel(...).subscribe();
}, [userId]);
// Cleanup happens but subscription variable is out of scope
return () => { /* can't access subscription */ };
```

---

## 2. Consolidated Trading Calculations

### Example: Before (Duplicated)

**File 1:** `src/lib/trading/pnlCalculations.ts`
```typescript
export function calculatePnL(entry: number, current: number, qty: number) {
  return (current - entry) * qty;
}

export function calculateRisk(leverage: number, margin: number) {
  return margin / leverage;
}
```

**File 2:** `src/lib/trading/pnlCalculation.ts` (duplicate!)
```typescript
export function calculatePnL(entry: number, current: number, qty: number) {
  // Same logic, different location
  return (current - entry) * qty;
}
```

### ✅ After (Consolidated)

**File:** `src/lib/trading/calculations.ts`
```typescript
/**
 * Trading Calculations Module
 * 
 * Single source of truth for all trading math.
 * All calculations follow proper precision standards and edge cases.
 */

/**
 * Calculate Profit & Loss
 * 
 * @param entryPrice - Position entry price
 * @param currentPrice - Current market price
 * @param quantity - Position quantity
 * @param isLong - Direction: true for long, false for short
 * @returns PnL in account currency
 * 
 * @example
 * const pnl = calculatePnL(1.1050, 1.1100, 1000, true);
 * // Returns: 50 (1.1100 - 1.1050) * 1000
 */
export function calculatePnL(
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  isLong: boolean
): number {
  if (quantity === 0) return 0;
  
  const priceDifference = isLong 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;
    
  const pnl = priceDifference * quantity;
  
  // Round to 2 decimals for currency
  return Math.round(pnl * 100) / 100;
}

/**
 * Calculate margin used
 * 
 * @param positionValue - Total position value
 * @param leverage - Leverage ratio (e.g., 20 for 20:1)
 * @returns Margin required
 * 
 * @example
 * const margin = calculateMarginUsed(100000, 20);
 * // Returns: 5000
 */
export function calculateMarginUsed(
  positionValue: number,
  leverage: number
): number {
  if (leverage === 0) throw new Error('Leverage cannot be zero');
  return positionValue / leverage;
}

/**
 * Calculate liquidation price
 * 
 * @param entryPrice - Position entry price
 * @param leverage - Leverage ratio
 * @param maintenanceMargin - Maintenance margin requirement (e.g., 0.05 for 5%)
 * @param isLong - Position direction
 * @returns Price at which position will be liquidated
 * 
 * @example
 * const liqPrice = calculateLiquidationPrice(100, 10, 0.05, true);
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  maintenanceMargin: number,
  isLong: boolean
): number {
  const factor = maintenanceMargin * leverage;
  
  if (isLong) {
    return entryPrice * (1 - factor);
  } else {
    return entryPrice * (1 + factor);
  }
}

// Add more calculations as needed...
```

### Update imports across codebase

**Before:**
```typescript
import { calculatePnL } from '@/lib/trading/pnlCalculations';
import { calculateRisk } from '@/lib/trading/positionUtils';
```

**After:**
```typescript
import { calculatePnL, calculateMarginUsed, calculateLiquidationPrice } from '@/lib/trading/calculations';
```

**Add to `src/lib/trading/index.ts`:**
```typescript
export * from './calculations';
export * from './orderValidation';
export * from './marginMonitoring';
export * from './liquidationEngine';
```

---

## 3. Unified Performance Monitoring

### Before (Scattered Systems)

```typescript
// src/lib/performance/performanceMonitoring.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(duration);
  }
}

// src/lib/performanceUtils.ts (similar but different!)
export function trackPerformance(fn: Function) {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

// src/hooks/useWebVitalsEnhanced.ts (yet another system!)
export function useWebVitalsEnhanced() {
  // Different implementation of same concept
}
```

### ✅ After (Unified)

**File:** `src/lib/performance/index.ts`
```typescript
/**
 * Unified Performance Monitoring System
 * 
 * Single API for all performance tracking needs.
 * Metrics stored centrally and can be exported for analysis.
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  averages: Record<string, number>;
  slowest: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Prevent unbounded growth

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    duration: number,
    context?: Record<string, unknown>
  ): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      context,
    });

    // Prevent memory overflow
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get performance report with aggregates
   */
  getReport(): PerformanceReport {
    const averages: Record<string, number> = {};
    const byName = new Map<string, PerformanceMetric[]>();

    // Group by name
    for (const metric of this.metrics) {
      if (!byName.has(metric.name)) {
        byName.set(metric.name, []);
      }
      byName.get(metric.name)!.push(metric);
    }

    // Calculate averages
    for (const [name, metrics] of byName) {
      const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
      averages[name] = sum / metrics.length;
    }

    // Get slowest 10
    const slowest = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return { metrics: this.metrics, averages, slowest };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor component render time
 */
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      performanceMonitor.recordMetric(`render:${componentName}`, duration);
    };
  }, [componentName]);
}

/**
 * Decorator to track function execution time
 */
export function trackFunctionPerformance<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name?: string
) {
  const fnName = name || fn.name || 'anonymous';
  
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    performanceMonitor.recordMetric(`function:${fnName}`, duration);
    
    return result;
  }) as T;
}
```

### Usage Examples

```typescript
// In components
function TradingPanel() {
  usePerformanceMonitoring('TradingPanel');
  // Rest of component...
}

// In functions
const executeOrder = trackFunctionPerformance(
  (order: Order) => {
    // Order execution logic
  },
  'executeOrder'
);

// Manual tracking
performanceMonitor.recordMetric('api:order-placement', 234);
performanceMonitor.recordMetric('realtime:position-update', 12);

// Get report
const report = performanceMonitor.getReport();
console.log('Average render time:', report.averages['render:TradingPanel']);
```

---

## 4. Standardized Error Handling

### Example: Trading-Specific Errors

**File:** `src/lib/api/errors.ts`
```typescript
/**
 * Standardized error classes for trading operations
 * 
 * All trading errors extend this base class for consistency
 */

export class TradingError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TradingError';
  }
}

/**
 * Thrown when order validation fails
 */
export class OrderValidationError extends TradingError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>
  ) {
    super('ORDER_VALIDATION_FAILED', message, 400);
    this.name = 'OrderValidationError';
  }
}

/**
 * Thrown when insufficient margin
 */
export class InsufficientMarginError extends TradingError {
  constructor(
    public readonly required: number,
    public readonly available: number
  ) {
    super(
      'INSUFFICIENT_MARGIN',
      `Insufficient margin. Required: ${required}, Available: ${available}`,
      400,
      { required, available }
    );
    this.name = 'InsufficientMarginError';
  }
}

/**
 * Thrown when position will trigger liquidation
 */
export class LiquidationRiskError extends TradingError {
  constructor(
    public readonly currentMargin: number,
    public readonly maintenanceMargin: number
  ) {
    super(
      'LIQUIDATION_RISK',
      'Position would trigger liquidation',
      400,
      { currentMargin, maintenanceMargin }
    );
    this.name = 'LiquidationRiskError';
  }
}

/**
 * Thrown when order execution fails
 */
export class OrderExecutionError extends TradingError {
  constructor(
    message: string,
    public readonly orderId: string,
    public readonly reason: string
  ) {
    super('ORDER_EXECUTION_FAILED', message, 500, { orderId, reason });
    this.name = 'OrderExecutionError';
  }
}
```

### Usage Pattern

```typescript
// In trading lib
export async function executeOrder(order: Order) {
  try {
    // Validate
    if (!order.quantity) {
      throw new OrderValidationError('Quantity required', {
        quantity: ['Must be greater than 0'],
      });
    }

    // Check margin
    if (availableMargin < requiredMargin) {
      throw new InsufficientMarginError(requiredMargin, availableMargin);
    }

    // Execute
    const result = await supabase.rpc('execute_order', { order });
    return result;
  } catch (error) {
    if (error instanceof TradingError) {
      // Known trading error - handle appropriately
      logger.warn('Trading error:', error.code, error.message);
      throw error; // Re-throw for component to handle
    }
    
    // Unknown error
    throw new OrderExecutionError(
      'Order execution failed',
      order.id,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// In component
function OrderForm() {
  const handleSubmit = async (order: Order) => {
    try {
      await executeOrder(order);
      toast.success('Order placed');
    } catch (error) {
      if (error instanceof InsufficientMarginError) {
        setError(`Add ${error.required - error.available} to trade`);
        showDepositDialog();
      } else if (error instanceof OrderValidationError) {
        setValidationErrors(error.validationErrors);
      } else if (error instanceof TradingError) {
        toast.error(error.message);
      } else {
        toast.error('Unexpected error');
      }
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* form */}</form>;
}
```

---

## 5. Directory Reorganization Script

### Reorganization Plan

```bash
#!/bin/bash
# Reorganize src/lib/ directory structure

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting src/lib/ reorganization...${NC}"

# Create new directories
mkdir -p src/lib/auth
mkdir -p src/lib/api
mkdir -p src/lib/data
mkdir -p src/lib/utils
mkdir -p src/lib/accessibility

# Move auth files
echo -e "${GREEN}Moving auth files...${NC}"
git mv src/lib/authAuditLogger.ts src/lib/auth/auditLogger.ts 2>/dev/null || echo "authAuditLogger.ts already moved"
git mv src/lib/authMigration.ts src/lib/auth/migration.ts 2>/dev/null || echo "authMigration.ts already moved"

# Move API files
echo -e "${GREEN}Moving API files...${NC}"
git mv src/lib/apiValidation.ts src/lib/api/validation.ts 2>/dev/null || echo "apiValidation.ts already moved"
git mv src/lib/errorHandling.tsx src/lib/api/errorHandling.tsx 2>/dev/null || echo "errorHandling.tsx already moved"
git mv src/lib/errorMessageService.ts src/lib/api/errorMessageService.ts 2>/dev/null || echo "errorMessageService.ts already moved"

# Move data/supabase files
echo -e "${GREEN}Moving data files...${NC}"
git mv src/lib/supabaseBrowserClient.ts src/lib/data/supabase.ts 2>/dev/null || echo "supabaseBrowserClient.ts already moved"
git mv src/lib/subscriptionManager.ts src/lib/data/subscriptions.ts 2>/dev/null || echo "subscriptionManager.ts already moved"

# Move utils
echo -e "${GREEN}Moving utility files...${NC}"
git mv src/lib/spacingUtils.ts src/lib/utils/spacing.ts 2>/dev/null || echo "spacingUtils.ts already moved"
git mv src/lib/typographyUtils.ts src/lib/utils/typography.ts 2>/dev/null || echo "typographyUtils.ts already moved"
git mv src/lib/colors.ts src/lib/utils/colors.ts 2>/dev/null || echo "colors.ts already moved"

# Move accessibility
echo -e "${GREEN}Moving accessibility files...${NC}"
git mv src/lib/wcag-enhancer.ts src/lib/accessibility/wcag-enhancer.ts 2>/dev/null || echo "wcag-enhancer.ts already moved"

echo -e "${GREEN}Creating barrel exports...${NC}"

# Create src/lib/auth/index.ts
cat > src/lib/auth/index.ts << 'EOF'
export * from './auditLogger';
export * from './migration';
EOF

# Create src/lib/api/index.ts
cat > src/lib/api/index.ts << 'EOF'
export * from './validation';
export * from './errorHandling';
export * from './errorMessageService';
EOF

# Create src/lib/data/index.ts
cat > src/lib/data/index.ts << 'EOF'
export * from './supabase';
export * from './subscriptions';
EOF

# Create src/lib/utils/index.ts
cat > src/lib/utils/index.ts << 'EOF'
export * from './spacing';
export * from './typography';
export * from './colors';
export { cn } from '../utils'; // Re-export existing cn function
EOF

echo -e "${GREEN}✓ Directory reorganization complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update imports in components: npm run lint -- --fix"
echo "2. Run tests: npm run test"
echo "3. Verify build: npm run build"
echo "4. Commit changes: git commit -m 'refactor: reorganize src/lib/ directory'"
```

---

## 6. Hook Documentation Template

### Add to Each Hook File

```typescript
/**
 * [Hook Name]
 * 
 * [One-line description of what the hook does]
 * 
 * @category [Category: Data|Trading|Risk|UI|Accessibility]
 * 
 * ## Overview
 * [Detailed description of functionality]
 * 
 * ## Usage
 * 
 * @example
 * // Basic usage
 * const { data, loading, error } = useMyHook();
 * 
 * @example
 * // With options
 * const { data, loading, error } = useMyHook({ 
 *   refreshInterval: 5000,
 *   enabled: true 
 * });
 * 
 * ## Parameters
 * @param [paramName] - [Description]
 * 
 * ## Returns
 * ```typescript
 * interface ReturnType {
 *   data: DataType[];
 *   loading: boolean;
 *   error: Error | null;
 *   refresh: () => Promise<void>;
 * }
 * ```
 * 
 * ## Dependencies
 * - Supabase (realtime)
 * - React Query (caching)
 * - Context (state)
 * 
 * ## Performance Notes
 * - Memoized to prevent unnecessary re-renders
 * - Uses Realtime subscriptions for live updates
 * - Cleanup removes Realtime listener on unmount
 * 
 * ## Common Issues
 * - If data not updating: Check Realtime subscription filter
 * - If memory leaks: Ensure cleanup unsubscribes from channel
 * 
 * @see [Related hook or documentation]
 * 
 * @internal
 */
```

---

## 7. Testing Patterns

### Memory Leak Test Template

```typescript
// src/hooks/__tests__/realtimeMemoryLeaks.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimePositions } from '../useRealtimePositions';

describe('Realtime Subscriptions - Memory Leaks', () => {
  it('should unsubscribe on unmount', async () => {
    const userId = 'test-user';
    const mockUnsubscribe = vi.fn();

    // Mock Supabase
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: {
        channel: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          subscribe: vi.fn().mockReturnValue({
            unsubscribe: mockUnsubscribe,
          }),
        }),
      },
    }));

    const { unmount } = renderHook(() => useRealtimePositions(userId));

    await waitFor(() => {
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    // Unmount component
    act(() => {
      unmount();
    });

    // Verify unsubscribe called
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should not create duplicate subscriptions on re-render', async () => {
    const userId = 'test-user';
    const mockSubscribe = vi.fn();

    // Mock setup...

    const { rerender } = renderHook(() => useRealtimePositions(userId));

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    // Re-render with same userId
    rerender();

    // Should still only be called once (subscription reused)
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });
});
```

### Trading Calculation Test Template

```typescript
// src/lib/trading/__tests__/calculations.test.ts

import { describe, it, expect } from 'vitest';
import {
  calculatePnL,
  calculateMarginUsed,
  calculateLiquidationPrice,
} from '../calculations';

describe('Trading Calculations', () => {
  describe('calculatePnL', () => {
    it('should calculate profit correctly for long positions', () => {
      const pnl = calculatePnL(1.1050, 1.1100, 1000, true);
      expect(pnl).toBe(50); // (1.1100 - 1.1050) * 1000
    });

    it('should calculate loss correctly for short positions', () => {
      const pnl = calculatePnL(1.1100, 1.1050, 1000, false);
      expect(pnl).toBe(50); // (1.1100 - 1.1050) * 1000
    });

    it('should handle zero quantity', () => {
      const pnl = calculatePnL(1.1050, 1.1100, 0, true);
      expect(pnl).toBe(0);
    });

    it('should round to 2 decimals', () => {
      const pnl = calculatePnL(1.10501, 1.11002, 1000, true);
      // (1.11002 - 1.10501) * 1000 = 501, rounded = 5.01
      expect(pnl).toHaveLength(3); // Verify format
    });
  });

  describe('calculateMarginUsed', () => {
    it('should calculate margin correctly', () => {
      const margin = calculateMarginUsed(100000, 20);
      expect(margin).toBe(5000);
    });

    it('should throw on zero leverage', () => {
      expect(() => calculateMarginUsed(100000, 0)).toThrow(
        'Leverage cannot be zero'
      );
    });
  });

  describe('calculateLiquidationPrice', () => {
    it('should calculate liquidation price for long position', () => {
      const liqPrice = calculateLiquidationPrice(100, 10, 0.05, true);
      // 100 * (1 - 0.05 * 10) = 100 * (1 - 0.5) = 50
      expect(liqPrice).toBe(50);
    });

    it('should calculate liquidation price for short position', () => {
      const liqPrice = calculateLiquidationPrice(100, 10, 0.05, false);
      // 100 * (1 + 0.05 * 10) = 100 * 1.5 = 150
      expect(liqPrice).toBe(150);
    });
  });
});
```

---

## 8. Environment Security Checklist

### .env.example Template

```env
# .env.example - Copy this to .env.local and fill in your values
# NEVER commit .env.local to version control!

# === SUPABASE CONFIGURATION ===
# Get from: https://supabase.com/dashboard/project/[project-id]/settings/api

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === PRODUCTION ===
# Only needed for production deployment

VITE_PRODUCTION_URL=https://yourdomain.com

# === MONITORING ===
# Get from: https://sentry.io/settings/[org]/projects/[project]/keys/

VITE_SENTRY_DSN=https://xxxxx@xxxxx.sentry.io/999999

# === FEATURE FLAGS ===
# Development debugging

VITE_DEBUG_MODE=false
VITE_DEBUG_REALTIME=false
VITE_DEBUG_PERFORMANCE=false
```

### Git Security Audit Script

```bash
#!/bin/bash
# scripts/audit-secrets.sh - Check for exposed secrets

echo "🔍 Auditing for exposed secrets..."

# Check git history for patterns
echo "Checking git history for suspicious patterns..."
git log --all -p | grep -i "SENTRY_DSN\|SUPABASE_KEY\|API_SECRET" && {
  echo "❌ ALERT: Possible secrets in git history!"
  exit 1
} || echo "✓ No obvious secrets in history"

# Check .env files not in gitignore
echo "Checking .env files..."
if grep -q ".env" .gitignore; then
  echo "✓ .env patterns in .gitignore"
else
  echo "❌ .env files not properly ignored!"
  exit 1
fi

# Check for untracked .env files
if git ls-files | grep -E "\.env\.(local|production)"; then
  echo "❌ WARNING: .env files tracked in git!"
  exit 1
fi

echo "✅ Secret audit passed!"
```

---

## Quick Reference: Before & After

### Before Consolidation

```
src/lib/
├── apiValidation.ts       # Validation schemas
├── errorHandling.tsx      # Error handling
├── pnlCalculations.ts     # PnL math (1)
├── pnlCalculation.ts      # PnL math (2) ← DUPLICATE
├── performanceUtils.ts    # Performance (1)
├── performance/
│   └── performanceMonitoring.ts  # Performance (2)
└── hooks/
    └── useWebVitalsEnhanced.ts   # Performance (3)
```

**Problems:** Duplication, unclear organization, difficult to maintain

### After Consolidation

```
src/lib/
├── api/
│   ├── validation.ts
│   └── errorHandling.ts
├── trading/
│   ├── calculations.ts    # Single source of truth
│   ├── orderValidation.ts
│   └── liquidationEngine.ts
├── performance/
│   └── index.ts           # Unified monitoring
└── utils/
    ├── colors.ts
    └── spacing.ts
```

**Benefits:** Single source of truth, clear organization, easier maintenance

---

## Questions?

Refer to:
- **Strategy Overview:** [STRATEGIC_CLEANUP_PLAN.md](STRATEGIC_CLEANUP_PLAN.md)
- **Quick Start Guide:** [CLEANUP_QUICK_START.md](CLEANUP_QUICK_START.md)
- **Original Architecture:** [.github/copilot-instructions.md](.github/copilot-instructions.md)
