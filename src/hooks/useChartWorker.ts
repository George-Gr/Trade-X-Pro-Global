/**
 * Chart Worker Hook
 * Manages communication with the chart calculation Web Worker
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface WorkerMessage {
  id: string;
  type: string;
  data: unknown;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface ChartWorkerResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useChartWorker = <T>() => {
  const workerRef = useRef<Worker | null>(null);
  const [responses, setResponses] = useState<Map<string, WorkerResponse>>(
    new Map(),
  );
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    // Initialize worker
    if (typeof window !== "undefined" && window.Worker) {
      try {
        workerRef.current = new Worker(
          new URL("../workers/chartWorker.ts", import.meta.url),
          {
            type: "module",
          },
        );

        // Listen for messages from worker
        workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const response = e.data;

          setResponses((prev) => {
            const newResponses = new Map(prev);
            newResponses.set(response.id, response);
            return newResponses;
          });

          setPendingRequests((prev) => {
            const newPending = new Set(prev);
            newPending.delete(response.id);
            return newPending;
          });
        };
      } catch (error) {
        console.warn(
          "Web Worker not supported or failed to initialize:",
          error,
        );
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const sendRequest = useCallback(
    <D>(type: string, data: D): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not available"));
          return;
        }

        const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        setPendingRequests((prev) => new Set(prev).add(id));

        const message: WorkerMessage = { id, type, data };
        workerRef.current!.postMessage(message);

        // Set up timeout for the request
        const timeout = setTimeout(() => {
          setPendingRequests((prev) => {
            const newPending = new Set(prev);
            newPending.delete(id);
            return newPending;
          });
          reject(new Error("Worker request timeout"));
        }, 5000); // 5 second timeout

        // Check for response periodically
        const checkInterval = setInterval(() => {
          const response = responses.get(id);
          if (response) {
            clearInterval(checkInterval);
            clearTimeout(timeout);

            if (response.success) {
              resolve(response.result as T);
            } else {
              reject(new Error(response.error || "Worker calculation failed"));
            }

            // Clean up response
            setResponses((prev) => {
              const newResponses = new Map(prev);
              newResponses.delete(id);
              return newResponses;
            });
          }
        }, 10);
      });
    },
    [responses],
  );

  const calculateTrend = useCallback(
    (values: number[]): Promise<unknown> => {
      return sendRequest("calculateTrend", { values });
    },
    [sendRequest],
  );

  const normalizeData = useCallback(
    (data: { value: number }[]): Promise<unknown> => {
      return sendRequest("normalizeData", data);
    },
    [sendRequest],
  );

  const generateSparkline = useCallback(
    (values: number[], labels?: string[]): Promise<unknown> => {
      return sendRequest("generateSparkline", { values, labels });
    },
    [sendRequest],
  );

  const optimizeData = useCallback(
    (data: unknown[], maxPoints?: number): Promise<unknown> => {
      return sendRequest("optimizeData", { data, maxPoints });
    },
    [sendRequest],
  );

  const getLoadingState = useCallback(
    (type: string): boolean => {
      return Array.from(pendingRequests).some((id) => id.startsWith(type));
    },
    [pendingRequests],
  );

  const clearResponses = useCallback(() => {
    setResponses(new Map());
  }, []);

  return {
    calculateTrend,
    normalizeData,
    generateSparkline,
    optimizeData,
    getLoadingState,
    clearResponses,
    hasPendingRequests: pendingRequests.size > 0,
  };
};
