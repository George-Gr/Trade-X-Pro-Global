/**
 * Polyfills for Node.js environment to fix navigator global errors
 * This file provides browser-like globals for web libraries running in Node.js
 * 
 * NOTE: These polyfills are intended for browser environment only.
 * Node.js-specific imports are avoided to prevent build issues.
 */

// Only apply polyfills in browser environment (not during build)
if (typeof window !== 'undefined' && typeof globalThis !== 'undefined') {
  // Ensure navigator is properly defined for web libraries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).navigator === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).navigator = {
      userAgent: 'Node.js',
      platform: 'Node.js',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true,
      cookieEnabled: false,
      product: 'Node.js',
      productSub: 'unknown',
      vendor: 'Node.js',
      vendorSub: '',
      appName: 'Node.js',
      appCodeName: 'Node.js',
      appVersion: '0.0.0',
      hardwareConcurrency: (navigator as Navigator | undefined)?.hardwareConcurrency || 1,
      maxTouchPoints: 0,
      clipboard: {
        readText: async () => '',
        writeText: async () => {},
      },
      permissions: {
        query: async () => ({ state: 'denied' as const }),
      },
      geolocation: {
        getCurrentPosition: () => {},
        watchPosition: () => {},
        clearWatch: () => {},
      },
      mediaDevices: {
        getUserMedia: async () => Promise.reject(new Error('Not supported in Node.js')),
        enumerateDevices: async () => [],
        getDisplayMedia: async () => Promise.reject(new Error('Not supported in Node.js')),
      },
      serviceWorker: {
        register: async () => Promise.reject(new Error('Not supported in Node.js')),
        getRegistrations: async () => [],
        getRegistration: async () => null,
      },
      storage: {
        estimate: async () => ({ quota: 0, usage: 0 }),
        persist: async () => false,
        persisted: async () => false,
      },
    };
  }

  // Ensure window is properly defined for web libraries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = globalThis;
  }

  // Ensure document is properly defined for web libraries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).document === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).document = {
      createElement: () => ({
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        style: {},
      }),
      createTextNode: () => ({}),
      createDocumentFragment: () => ({}),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByTagName: () => [],
      getElementsByClassName: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      body: {
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {},
      },
      head: {
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {},
      },
      location: {
        href: '',
        protocol: 'http:',
        host: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        origin: '',
      },
      cookie: '',
      referrer: '',
      title: '',
      readyState: 'complete',
      visibilityState: 'hidden',
      hidden: true,
    };
  }

  // Ensure location is properly defined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).location === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).location = (globalThis as any).document.location;
  }

  // Note: crypto, fetch, URL, TextEncoder, and performance are built-in to modern browsers
  // and don't need polyfilling in browser environment

  // Fix console for Node.js (ensure all methods exist)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).console === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).console = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      trace: console.trace,
      time: console.time,
      timeEnd: console.timeEnd,
      timeLog: console.timeLog,
      count: console.count,
      countReset: console.countReset,
      group: console.group,
      groupEnd: console.groupEnd,
      groupCollapsed: console.groupCollapsed,
      clear: console.clear,
      assert: console.assert,
      dir: console.dir,
      dirxml: console.dirxml,
      table: console.table,
      timeStamp: console.timeStamp,
    };
  }
}

// Export to ensure this file is treated as a module
export {};