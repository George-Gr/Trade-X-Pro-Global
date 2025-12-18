import React, { createContext, useContext, useCallback, useState } from "react";

/**
 * FE-010: Global Loading States Context
 * Manages application-wide loading states for async operations
 */

interface LoadingOperation {
  id: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

interface LoadingContextType {
  // Operation tracking
  operations: Map<string, LoadingOperation>;
  isLoading: boolean;

  // Methods to manage loading states
  startOperation: (id: string, message?: string) => void;
  updateOperation: (id: string, progress: number) => void;
  endOperation: (id: string) => void;
  cancelOperation: (id: string) => void;

  // Get operation by ID
  getOperation: (id: string) => LoadingOperation | undefined;

  // Bulk operations
  clearAllOperations: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Provider component for loading state management
 */
export function LoadingProvider({
  children,
}: { children?: React.ReactNode } = {}) {
  const [operations, setOperations] = useState<Map<string, LoadingOperation>>(
    new Map(),
  );

  const startOperation = useCallback((id: string, message?: string) => {
    setOperations((prev) => {
      const next = new Map(prev);
      next.set(id, {
        id,
        message,
        progress: 0,
        timestamp: Date.now(),
      });
      return next;
    });
  }, []);

  const updateOperation = useCallback((id: string, progress: number) => {
    setOperations((prev) => {
      const next = new Map(prev);
      const op = next.get(id);
      if (op) {
        next.set(id, { ...op, progress: Math.min(Math.max(progress, 0), 100) });
      }
      return next;
    });
  }, []);

  const endOperation = useCallback((id: string) => {
    setOperations((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const cancelOperation = useCallback((id: string) => {
    setOperations((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getOperation = useCallback(
    (id: string) => operations.get(id),
    [operations],
  );

  const clearAllOperations = useCallback(() => {
    setOperations(new Map());
  }, []);

  const isLoading = operations.size > 0;

  const value: LoadingContextType = {
    operations,
    isLoading,
    startOperation,
    updateOperation,
    endOperation,
    cancelOperation,
    getOperation,
    clearAllOperations,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

/**
 * Hook to use the loading context
 */
export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoadingContext must be used within LoadingProvider");
  }
  return context;
}

/**
 * Custom hook for managing a specific async operation
 */
export function useAsyncOperation(operationId: string) {
  const { startOperation, updateOperation, endOperation, getOperation } =
    useLoadingContext();

  const operation = getOperation(operationId);

  return {
    start: (message?: string) => startOperation(operationId, message),
    updateProgress: (progress: number) =>
      updateOperation(operationId, progress),
    end: () => endOperation(operationId),
    isLoading: !!operation,
    progress: operation?.progress ?? 0,
    message: operation?.message,
  };
}
