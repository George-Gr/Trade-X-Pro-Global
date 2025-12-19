/**
 * Test Setup
 *
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';

// Use globalThis for browser/Node compatibility
const globalObj = globalThis as typeof globalThis & {
  ResizeObserver: typeof ResizeObserver;
  IntersectionObserver: typeof IntersectionObserver;
  requestAnimationFrame: typeof requestAnimationFrame;
  cancelAnimationFrame: typeof cancelAnimationFrame;
  requestIdleCallback: typeof requestIdleCallback;
};

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
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
globalObj.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
globalObj.IntersectionObserver = class IntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock requestAnimationFrame
globalObj.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.setTimeout(() => callback(Date.now()), 0);
};

globalObj.cancelAnimationFrame = (id: number): void => {
  window.clearTimeout(id);
};

// Mock requestIdleCallback
globalObj.requestIdleCallback = (callback: IdleRequestCallback): number => {
  return window.setTimeout(
    () =>
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      }),
    0
  );
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
