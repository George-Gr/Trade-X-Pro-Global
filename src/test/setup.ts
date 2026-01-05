/**
 * Test Setup
 *
 * Global test configuration and mocks
 */

/// <reference types="vitest/globals" />
/// <reference types="jsdom" />

import '@testing-library/jest-dom/vitest';

// Use globalThis for browser/Node compatibility
const globalObj = globalThis as unknown as Record<string, unknown>;
const win = globalThis as unknown as { matchMedia?: unknown };

// Mock matchMedia for responsive tests
Object.defineProperty(win, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
globalObj.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
}));

// Mock IntersectionObserver
globalObj.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}));

// Mock requestAnimationFrame
globalObj.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return globalThis.setTimeout(
    () => callback(Date.now()),
    0
  ) as unknown as number;
};

globalObj.cancelAnimationFrame = (id: number): void => {
  (
    globalThis as unknown as typeof globalThis & {
      clearTimeout: typeof clearTimeout;
    }
  ).clearTimeout(id as unknown as NodeJS.Timeout);
};

// Mock requestIdleCallback
globalObj.requestIdleCallback = (callback: IdleRequestCallback): number => {
  return globalThis.setTimeout(
    () =>
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      }),
    0
  ) as unknown as number;
};

// Suppress console errors in tests unless debugging
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('act('))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
