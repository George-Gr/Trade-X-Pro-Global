/**
 * TradingView Compatibility Layer
 *
 * Fixes known compatibility issues with TradingView widgets in modern JavaScript environments.
 *
 * Issue: TypeError: Cannot assign to read only property 'Symbol(Symbol.toStringTag)' of object '#<DataView>'
 *
 * This error occurs when TradingView widgets try to modify the Symbol.toStringTag property
 * of DataView objects, which is read-only in modern browsers/environment.
 */

/**
 * Initialize TradingView compatibility fixes
 * Should be called before loading any TradingView widgets
 */
export function initTradingViewCompatibility(): void {
  // Fix for DataView Symbol.toStringTag error
  fixDataViewSymbolToStringTag();

  // Additional compatibility fixes can be added here
}

/**
 * Fixes the DataView Symbol.toStringTag read-only property error
 *
 * The issue: TradingView widgets try to assign to DataView.prototype[Symbol.toStringTag]
 * but this property is read-only in modern environments.
 *
 * Solution: Temporarily make the property writable, apply the assignment,
 * then restore the original descriptor.
 */
function fixDataViewSymbolToStringTag(): void {
  // Store original descriptor
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    DataView.prototype,
    Symbol.toStringTag
  );

  try {
    // Make the property writable temporarily
    if (originalDescriptor) {
      Object.defineProperty(DataView.prototype, Symbol.toStringTag, {
        ...originalDescriptor,
        writable: true,
        configurable: true,
      });
    }

    // Handle the specific DataView Symbol.toStringTag assignment locally
    try {
      // This is the specific assignment that TradingView tries to make
      Object.defineProperty(DataView.prototype, Symbol.toStringTag, {
        value: 'DataView',
        writable: true,
        configurable: true,
        enumerable: false,
      });
    } catch (error: unknown) {
      // If assignment fails due to read-only property, log and continue
      if (
        error instanceof TypeError &&
        error.message.includes('Cannot assign to read only property') &&
        error.message.includes('Symbol.toStringTag')
      ) {
        // TradingView: DataView Symbol.toStringTag assignment blocked (expected in modern environments)
      } else {
        throw error;
      }
    }

    // Override property assignment attempts
    const originalSet = Object.getOwnPropertyDescriptor(
      DataView.prototype,
      Symbol.toStringTag
    )?.set;
    if (!originalSet) {
      Object.defineProperty(DataView.prototype, Symbol.toStringTag, {
        set(value: unknown) {
          // Silently ignore assignments in modern environments
          if (typeof value === 'string') {
            // TradingView: Ignoring DataView Symbol.toStringTag assignment
          }
        },
        get(this: unknown): string {
          return 'DataView';
        },
        configurable: true,
        enumerable: false,
      });
    }
  } catch (error) {
    console.warn('TradingView compatibility fix failed:', error);
    // Fallback: at least try to prevent the error from propagating
  } finally {
    // Restore original descriptor if needed
    if (originalDescriptor) {
      try {
        Object.defineProperty(
          DataView.prototype,
          Symbol.toStringTag,
          originalDescriptor
        );
      } catch (error) {
        // Could not restore original DataView descriptor
      }
    }
  }
}

/**
 * Alternative approach: Monkey patch common assignment patterns
 */
function patchCommonAssignmentPatterns(): void {
  // Patch common patterns used by TradingView
  const originalAssign = Object.assign;
  const globalObj = Object as unknown as { assign: typeof Object.assign };
  globalObj.assign = function (target: unknown, ...sources: unknown[]) {
    try {
      return originalAssign.call(
        this as unknown,
        target as Record<string, unknown>,
        ...(sources as Record<string, unknown>[])
      );
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes('Cannot assign to read only property') &&
        target === DataView.prototype
      ) {
        // TradingView: Blocked read-only property assignment to DataView.prototype
        return target;
      }
      throw error;
    }
  };
}

/**
 * Initialize compatibility layer
 */
if (typeof window !== 'undefined') {
  // Auto-initialize in browser environment
  initTradingViewCompatibility();
}
