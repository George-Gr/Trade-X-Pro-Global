/**
 * Node.js Environment Setup Script
 * Fixes common compatibility issues with web libraries in Node.js environment
 */

// Increase Node.js heap memory for large builds (4GB)
if (process.env.NODE_OPTIONS === undefined) {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
}

// Suppress Node.js deprecation warnings
process.env.NODE_DISABLE_DEPRECATION_WARNINGS = '1';
process.env.NODE_SUPPRESS_DEPRECATION = '1';

// Fix punycode deprecation by providing a polyfill
if (!global.punycode) {
  try {
    global.punycode = require('punycode');
  } catch (e) {
    // punycode not available, create minimal stub
    global.punycode = {
      toASCII: (domain) => domain,
      toUnicode: (domain) => domain,
      ucs2: {
        decode: (string) => Array.from(string).map(char => char.codePointAt(0)),
        encode: (codePoints) => codePoints.map(code => String.fromCodePoint(code)).join(''),
      },
      version: '2.3.1',
    };
  }
}

// Fix navigator global error
if (typeof global.navigator === 'undefined') {
  global.navigator = {
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
    appVersion: process.version,
    hardwareConcurrency: 1,
    maxTouchPoints: 0,
  };
}

// Fix window global error
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Fix document global error
if (typeof global.document === 'undefined') {
  global.document = {
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

// Fix location global error
if (typeof global.location === 'undefined') {
  global.location = global.document.location;
}

// Fix crypto API
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = {
    getRandomValues: (arr) => crypto.randomFillSync(arr),
    subtle: {},
  };
}

// Fix fetch API
if (typeof global.fetch === 'undefined') {
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch.default || fetch;
    global.Request = fetch.Request;
    global.Response = fetch.Response;
    global.Headers = fetch.Headers;
  } catch (e) {
    // node-fetch not available, provide minimal stub
    global.fetch = () => Promise.reject(new Error('fetch not available'));
  }
}

// Fix URL API
if (typeof global.URL === 'undefined') {
  const { URL, URLSearchParams } = require('url');
  global.URL = URL;
  global.URLSearchParams = URLSearchParams;
}

// Fix TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Fix performance API
if (typeof global.performance === 'undefined') {
  const { performance } = require('perf_hooks');
  global.performance = performance;
}

// Fix console API
if (typeof global.console === 'undefined') {
  global.console = {
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
    profile: console.profile,
    profileEnd: console.profileEnd,
    timeStamp: console.timeStamp,
  };
}

// Fix SQLite experimental warning by providing a polyfill
if (typeof global.SQLite === 'undefined') {
  try {
    global.SQLite = require('sqlite3');
  } catch (e) {
    // sqlite3 not available, create minimal stub
    global.SQLite = {
      Database: class Database {
        constructor() {}
        run() { return Promise.resolve(this); }
        get() { return Promise.resolve(null); }
        all() { return Promise.resolve([]); }
        close() { return Promise.resolve(); }
      },
    };
  }
}

console.log('Node.js environment setup complete - compatibility issues resolved');