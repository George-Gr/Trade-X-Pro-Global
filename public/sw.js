// Enhanced Service Worker for TradeX Pro PWA
// Provides comprehensive offline functionality for trading platform

const CACHE_NAME = "trandex-pro-v2";
const STATIC_CACHE = "static-cache-v2";
const DYNAMIC_CACHE = "dynamic-cache-v2";
const API_CACHE = "api-cache-v2";
const OFFLINE_CACHE = "offline-cache-v2";

// Critical assets to cache immediately for offline functionality
const CRITICAL_ASSETS = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/manifest.json",
  "/browserconfig.xml",
  "/assets/index.css",
  // Core trading functionality
  "/trade",
  "/dashboard",
  "/portfolio",
  "/login",
  "/register",
  // Essential JS chunks will be added dynamically
  // Trading components
  "/trading/chart",
  "/trading/orders",
  "/trading/positions",
  // Static resources
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
];

// Asset types that should be cached
const CACHEABLE_TYPES = [
  "script",
  "style",
  "image",
  "font",
  "document",
  "manifest",
];

// Important API endpoints for offline trading with enhanced patterns
const CRITICAL_APIS = [
  // User and account APIs
  { pattern: /\/api\/user\/profile/, priority: "high" },
  { pattern: /\/api\/user\/balance/, priority: "high" },
  { pattern: /\/api\/portfolio\/summary/, priority: "high" },
  { pattern: /\/api\/portfolio\/history/, priority: "medium" },

  // Market data APIs
  { pattern: /\/api\/market\/symbols/, priority: "high" },
  { pattern: /\/api\/market\/prices/, priority: "high" },
  { pattern: /\/api\/market\/candles/, priority: "medium" },

  // Trading APIs
  { pattern: /\/api\/trading\/positions/, priority: "high" },
  { pattern: /\/api\/trading\/orders/, priority: "high" },
  { pattern: /\/api\/trading\/history/, priority: "medium" },

  // KYC and compliance
  { pattern: /\/api\/kyc\/status/, priority: "medium" },
  { pattern: /\/api\/kyc\/documents/, priority: "medium" },

  // Risk and alerts
  { pattern: /\/api\/risk\/alerts/, priority: "medium" },
  { pattern: /\/api\/alerts\/price/, priority: "medium" },
];

// Enhanced API caching rules with better strategies
const API_CACHE_RULES = [
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/market/,
    maxAge: 30000, // 30 seconds for market data
    strategy: "network-first",
    priority: "high",
  },
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/user\/profile/,
    maxAge: 300000, // 5 minutes for user data
    strategy: "network-first",
    priority: "high",
  },
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/portfolio/,
    maxAge: 60000, // 1 minute for portfolio data
    strategy: "network-first",
    priority: "high",
  },
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/trading\/positions/,
    maxAge: 15000, // 15 seconds for positions
    strategy: "network-first",
    priority: "critical",
  },
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/trading\/orders/,
    maxAge: 10000, // 10 seconds for orders
    strategy: "network-only", // Always fresh for trading
    priority: "critical",
  },
  {
    pattern: /^https:\/\/api\.trandexpro\.com\/static/,
    maxAge: 86400000, // 24 hours for static data
    strategy: "cache-first",
    priority: "low",
  },
];

// Offline queue for pending operations
const OFFLINE_QUEUE = "offline-queue";
const MAX_QUEUE_SIZE = 100;

// Enhanced error responses for different scenarios
const OFFLINE_RESPONSES = {
  trading: {
    status: 503,
    headers: {
      "Content-Type": "application/json",
      "X-Offline": "true",
      "X-Cache-Warning": "Trading operations require internet connection",
    },
    body: JSON.stringify({
      error: "Offline Trading Disabled",
      message:
        "Real-time trading requires an active internet connection for market data and order execution.",
      offline: true,
      retry_after: 30,
      features_available: ["portfolio_view", "market_overview", "settings"],
    }),
  },

  market_data: {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Offline": "true",
      "X-Cache-Warning": "Using cached market data - may be outdated",
    },
    body: JSON.stringify({
      warning: "Cached Data",
      message: "Displaying cached market data. Prices may be outdated.",
      offline: true,
      last_updated: new Date().toISOString(),
      data_freshness: "potentially_stale",
    }),
  },

  user_data: {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Offline": "true",
      "X-Cache-Warning": "Using cached user data",
    },
    body: JSON.stringify({
      warning: "Cached User Data",
      message: "Displaying cached user information.",
      offline: true,
      last_updated: new Date().toISOString(),
      data_type: "user_profile",
    }),
  },
};

// Install event - enhanced caching with fallback strategies
self.addEventListener("install", (event) => {
  console.log("[TradeX Pro SW] Install event - version:", CACHE_NAME);

  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[TradeX Pro SW] Caching critical static assets");
        return cache.addAll(CRITICAL_ASSETS).catch((err) => {
          console.warn("[TradeX Pro SW] Critical caching failed:", err);
          // Fallback - cache minimal assets
          return cache.addAll(["/", "/offline.html"]);
        });
      }),

      // Pre-cache essential API endpoints if online
      self.registration
        .update()
        .then(() => {
          if (navigator.onLine) {
            return preCacheEssentialAPIs();
          }
          return Promise.resolve();
        })
        .catch((err) => {
          console.warn("[TradeX Pro SW] API pre-caching failed:", err);
        }),
    ])
      .then(() => {
        console.log("[TradeX Pro SW] Install completed successfully");
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error("[TradeX Pro SW] Install failed:", err);
        // Still skip waiting to activate the service worker
        return self.skipWaiting();
      }),
  );
});

// Pre-cache essential API endpoints
async function preCacheEssentialAPIs() {
  try {
    const essentialEndpoints = [
      "https://api.trandexpro.com/market/symbols",
      "https://api.trandexpro.com/static/assets",
    ];

    const cache = await caches.open(API_CACHE);

    for (const url of essentialEndpoints) {
      try {
        const response = await fetch(url, {
          cache: "reload",
          timeout: 5000,
        });

        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("sw-cache-time", new Date().toISOString());
          headers.set("sw-cache-strategy", "precache");

          await cache.put(
            url,
            new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            }),
          );

          console.log(`[TradeX Pro SW] Pre-cached: ${url}`);
        }
      } catch (error) {
        console.warn(`[TradeX Pro SW] Failed to pre-cache ${url}:`, error);
      }
    }
  } catch (error) {
    console.error("[TradeX Pro SW] Pre-caching failed:", error);
  }
}

// Activate event - enhanced cleanup and client management
self.addEventListener("activate", (event) => {
  console.log("[TradeX Pro SW] Activate event - version:", CACHE_NAME);

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const currentCaches = [
          STATIC_CACHE,
          DYNAMIC_CACHE,
          API_CACHE,
          OFFLINE_CACHE,
        ];

        return Promise.all(
          cacheNames.map((cache) => {
            if (!currentCaches.includes(cache)) {
              console.log("[TradeX Pro SW] Clearing old cache:", cache);
              return caches.delete(cache);
            }
          }),
        );
      }),

      // Initialize offline queue storage
      (async () => {
        try {
          const queue = await getOfflineQueue();
          if (!queue) {
            await setOfflineQueue([]);
            console.log("[TradeX Pro SW] Initialized offline queue");
          }
        } catch (error) {
          console.warn(
            "[TradeX Pro SW] Failed to initialize offline queue:",
            error,
          );
        }
      })(),

      // Clean up expired cache entries
      cleanupExpiredCacheEntries(),
    ])
      .then(() => {
        // Notify all clients that the service worker has been activated
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_ACTIVATED",
              version: CACHE_NAME,
              timestamp: Date.now(),
            });
          });
        });
      })
      .then(() => {
        console.log("[TradeX Pro SW] Activation completed");
        return self.clients.claim();
      }),
  );
});

// Clean up expired cache entries
async function cleanupExpiredCacheEntries() {
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();

    const now = Date.now();
    const promises = requests.map(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = response.headers.get("sw-cache-time");
        if (cacheTime) {
          const age = now - new Date(cacheTime).getTime();
          const maxAge = getMaxAgeForUrl(request.url);

          if (age > maxAge) {
            console.log(
              `[TradeX Pro SW] Removing expired cache: ${request.url}`,
            );
            return cache.delete(request);
          }
        }
      }
    });

    await Promise.all(promises);
    console.log("[TradeX Pro SW] Cache cleanup completed");
  } catch (error) {
    console.error("[TradeX Pro SW] Cache cleanup failed:", error);
  }
}

// Get maximum age for a URL based on cache rules
function getMaxAgeForUrl(url) {
  for (const rule of API_CACHE_RULES) {
    if (rule.pattern.test(url)) {
      return rule.maxAge || 300000; // Default 5 minutes
    }
  }
  return 300000; // Default 5 minutes
}

// Offline queue management
async function getOfflineQueue() {
  try {
    const data = await self.clients.get("offline-queue");
    return data || [];
  } catch (error) {
    return [];
  }
}

async function setOfflineQueue(queue) {
  try {
    await self.clients.set("offline-queue", queue);
  } catch (error) {
    console.warn("[TradeX Pro SW] Failed to save offline queue:", error);
  }
}

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Check if request is an API call
function isApiRequest(request) {
  return (
    request.url.includes("/api/") ||
    request.url.includes("supabase") ||
    request.url.includes("tradingview") ||
    request.url.match(/api\.trandexpro\.com/)
  );
}

// Check if request is for static assets
function isStaticAsset(request) {
  return (
    CACHEABLE_TYPES.includes(request.destination) ||
    request.url.endsWith(".js") ||
    request.url.endsWith(".css") ||
    request.url.match(
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i,
    )
  );
}

// Check if request is for critical API with priority
function getApiPriority(request) {
  for (const api of CRITICAL_APIS) {
    if (api.pattern.test(request.url)) {
      return api.priority;
    }
  }
  return "low";
}

// Check if request supports offline mode
function supportsOffline(request) {
  const tradingPatterns = [
    /\/api\/trading\/execute/,
    /\/api\/trading\/modify/,
    /\/api\/trading\/cancel/,
    /\/api\/user\/fund/,
    /\/api\/user\/withdraw/,
  ];

  return !tradingPatterns.some((pattern) => pattern.test(request.url));
}

// Handle API requests with intelligent caching and offline support
async function handleApiRequest(request) {
  const priority = getApiPriority(request);
  const supportsOfflineMode = supportsOffline(request);
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Check if we have a cached response and if it's still fresh
  if (cachedResponse) {
    const cacheTime = new Date(
      cachedResponse.headers.get("sw-cache-time") || 0,
    );
    const now = new Date();
    const age = now - cacheTime;

    const rule = getCacheRule(request.url);
    if (rule) {
      if (age < rule.maxAge) {
        // Return cached response if still fresh
        console.log(
          `[TradeX Pro SW] Serving cached API response: ${request.url}`,
        );
        return cachedResponse;
      } else if (priority === "critical") {
        // For critical data, try network but fall back to stale cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            await cacheApiResponse(request, networkResponse.clone(), cache);
            return networkResponse;
          }
        } catch (error) {
          console.log(
            `[TradeX Pro SW] Network failed, using stale cache for critical data: ${request.url}`,
          );
        }
        // Return stale cache for critical data
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-Cache-Warning", "Using stale critical data");
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers,
        });
      }
    }
  }

  // Try network first for non-cached or expired responses
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      await cacheApiResponse(request, networkResponse.clone(), cache);
      return networkResponse;
    } else if (supportsOfflineMode && cachedResponse) {
      // For failed requests that support offline, return cached data with warning
      const headers = new Headers(cachedResponse.headers);
      headers.set("X-Cache-Warning", "Network failed, using cached data");
      return new Response(cachedResponse.body, {
        status: networkResponse.status,
        statusText: "Using cached data",
        headers,
      });
    }
    return networkResponse;
  } catch (error) {
    // Network failed completely
    if (cachedResponse) {
      // Return cached response with offline warning
      const headers = new Headers(cachedResponse.headers);
      headers.set("X-Offline", "true");
      headers.set("X-Cache-Warning", "Network unavailable, using cached data");
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    // Return appropriate offline response based on request type
    return getOfflineResponse(request, priority, supportsOfflineMode);
  }
}

// Cache API response with enhanced metadata
async function cacheApiResponse(request, response, cache) {
  const headers = new Headers(response.headers);
  headers.set("sw-cache-time", new Date().toISOString());
  headers.set("sw-cache-strategy", getCacheStrategy(request.url));
  headers.set("sw-request-method", request.method);

  const rule = getCacheRule(request.url);
  if (rule) {
    headers.set("sw-max-age", rule.maxAge.toString());
  }

  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(request, modifiedResponse);
}

// Get cache strategy for URL
function getCacheStrategy(url) {
  const rule = getCacheRule(url);
  return rule ? rule.strategy : "network-first";
}

// Get appropriate offline response based on request type and priority
function getOfflineResponse(request, priority, supportsOfflineMode) {
  // For trading operations, deny access
  if (request.url.includes("/trading/") && request.method !== "GET") {
    return new Response(
      OFFLINE_RESPONSES.trading.body,
      OFFLINE_RESPONSES.trading,
    );
  }

  // For market data, return cached data warning
  if (request.url.includes("/market/")) {
    return new Response(
      OFFLINE_RESPONSES.market_data.body,
      OFFLINE_RESPONSES.market_data,
    );
  }

  // For user data, return cached data warning
  if (request.url.includes("/user/") || request.url.includes("/portfolio/")) {
    return new Response(
      OFFLINE_RESPONSES.user_data.body,
      OFFLINE_RESPONSES.user_data,
    );
  }

  // Default offline response
  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "This feature requires an internet connection",
      offline: true,
      retry_after: 30,
      priority: priority,
      supports_offline: supportsOfflineMode,
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "X-Offline": "true",
        "X-Priority": priority,
      },
    },
  );
}

// Handle static asset requests with enhanced caching strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  const isCritical = isCriticalAsset(request);

  if (isCritical) {
    // For critical assets, always try to serve from cache first
    if (cachedResponse) {
      // Update in background if online
      if (navigator.onLine) {
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const cache = caches.open(STATIC_CACHE);
              cache.then((c) => c.put(request, response.clone()));
            }
          })
          .catch(() => {
            // Ignore background update errors
          });
      }
      return cachedResponse;
    }

    // Critical asset not cached, try network
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      console.warn(`[TradeX Pro SW] Critical asset failed: ${request.url}`);
    }

    // Return offline page for uncached critical assets
    return await caches.match("/offline.html");
  } else {
    // For non-critical assets, try network first with cache fallback
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      // Fall back to cache
      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-Cache-Warning", "Using cached asset");
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers,
        });
      }
    }

    // No network, no cache - return offline page
    return await caches.match("/offline.html");
  }
}

// Check if asset is critical for offline functionality
function isCriticalAsset(request) {
  return (
    CRITICAL_ASSETS.includes(new URL(request.url).pathname) ||
    request.url.includes("tradingview") ||
    request.url.includes("chart") ||
    request.url.match(/\.(woff|woff2|ttf|eot)$/i)
  ); // Critical fonts
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
  const cachedResponse = await caches.match("/");

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    return await fetch(request);
  } catch (error) {
    return await caches.match("/offline.html");
  }
}

// Get cache rule for URL
function getCacheRule(url) {
  return API_CACHE_RULES.find((rule) => rule.pattern.test(url));
}

// Enhanced background sync for pending operations
self.addEventListener("sync", (event) => {
  console.log(`[TradeX Pro SW] Background sync event: ${event.tag}`);

  if (event.tag === "background-sync-offline-operations") {
    event.waitUntil(syncOfflineOperations());
  } else if (event.tag === "background-sync-orders") {
    event.waitUntil(syncPendingOrders());
  } else if (event.tag === "background-sync-cache-refresh") {
    event.waitUntil(refreshCachedData());
  }
});

// Sync offline operations when connection is restored
async function syncOfflineOperations() {
  try {
    const queue = await getOfflineQueue();
    if (!queue || queue.length === 0) {
      return;
    }

    console.log(
      `[TradeX Pro SW] Processing ${queue.length} offline operations`,
    );

    for (const operation of queue) {
      try {
        const response = await fetch(operation.url, {
          method: operation.method,
          headers: operation.headers,
          body: operation.body,
        });

        if (response.ok) {
          // Remove from queue on success
          const updatedQueue = queue.filter((op) => op.id !== operation.id);
          await setOfflineQueue(updatedQueue);

          // Notify client of successful sync
          await notifyClient("offline_operation_synced", {
            operationId: operation.id,
            success: true,
            result: await response.json(),
          });

          console.log(
            `[TradeX Pro SW] Successfully synced operation: ${operation.id}`,
          );
        } else {
          console.warn(
            `[TradeX Pro SW] Failed to sync operation: ${operation.id}`,
            response.status,
          );
        }
      } catch (error) {
        console.error(
          `[TradeX Pro SW] Error syncing operation: ${operation.id}`,
          error,
        );
      }
    }
  } catch (error) {
    console.error("[TradeX Pro SW] Background sync failed:", error);
  }
}

// Enhanced pending orders sync with retry logic
async function syncPendingOrders() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const requests = await cache.keys();

    console.log(`[TradeX Pro SW] Syncing ${requests.length} pending orders`);

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from pending cache
          cache.delete(request);

          // Notify user of successful sync
          await self.registration.showNotification("TradeX Pro", {
            body: "Your pending orders have been processed successfully",
            icon: "/icons/icon-192x192.png",
            tag: "order-sync",
            data: { type: "order_sync_success" },
          });

          console.log(
            `[TradeX Pro SW] Successfully synced order: ${request.url}`,
          );
        } else if (response.status >= 400 && response.status < 500) {
          // Client error - remove from queue
          cache.delete(request);
          console.log(`[TradeX Pro SW] Removed failed order: ${request.url}`);
        }
        // Server errors (5xx) will be retried on next sync
      } catch (error) {
        console.log(
          `[TradeX Pro SW] Network error syncing order: ${error.message}`,
        );
        // Keep in queue for retry
      }
    }
  } catch (error) {
    console.error("[TradeX Pro SW] Order sync failed:", error);
  }
}

// Refresh cached data in background
async function refreshCachedData() {
  try {
    console.log("[TradeX Pro SW] Starting background cache refresh");

    const essentialEndpoints = [
      "https://api.trandexpro.com/market/symbols",
      "https://api.trandexpro.com/user/profile",
    ];

    const cache = await caches.open(API_CACHE);

    for (const url of essentialEndpoints) {
      try {
        const response = await fetch(url, {
          cache: "reload",
          timeout: 10000,
        });

        if (response.ok) {
          await cacheApiResponse(new Request(url), response, cache);
          console.log(`[TradeX Pro SW] Refreshed cache for: ${url}`);
        }
      } catch (error) {
        console.warn(`[TradeX Pro SW] Failed to refresh ${url}:`, error);
      }
    }

    // Notify completion
    await notifyClient("cache_refresh_complete", {
      timestamp: Date.now(),
      endpoints: essentialEndpoints.length,
    });
  } catch (error) {
    console.error("[TradeX Pro SW] Cache refresh failed:", error);
  }
}

// Notify clients of service worker events
async function notifyClient(type, data) {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SW_NOTIFICATION",
        payload: {
          type,
          timestamp: Date.now(),
          ...data,
        },
      });
    });
  } catch (error) {
    console.warn("[TradeX Pro SW] Failed to notify client:", error);
  }
}

// Handle client messages
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "ADD_TO_OFFLINE_QUEUE":
      addToOfflineQueue(payload);
      break;
    case "GET_OFFLINE_QUEUE":
      getOfflineQueue().then((queue) => {
        event.ports[0].postMessage({ queue });
      });
      break;
    case "CLEAR_OFFLINE_QUEUE":
      setOfflineQueue([]);
      event.ports[0].postMessage({ success: true });
      break;
    case "REQUEST_CACHE_REFRESH":
      refreshCachedData();
      break;
    default:
      console.log("[TradeX Pro SW] Unknown message type:", type);
  }
});

// Add operation to offline queue
async function addToOfflineQueue(operation) {
  try {
    const queue = await getOfflineQueue();
    const newOperation = {
      ...operation,
      id: operation.id || Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedQueue = [newOperation, ...queue].slice(0, MAX_QUEUE_SIZE);
    await setOfflineQueue(updatedQueue);

    console.log(`[TradeX Pro SW] Added to offline queue: ${newOperation.id}`);
  } catch (error) {
    console.error("[TradeX Pro SW] Failed to add to offline queue:", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "TradeX Pro",
    body: "You have a trading alert",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "trading-alert",
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.log("Could not parse push data:", e);
    }
  }

  if (event.waitUntil) {
    event.waitUntil(
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data || {},
        requireInteraction: notificationData.requireInteraction || false,
        actions: notificationData.actions || [],
      }),
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action button clicks
    clients.openWindow("/");
  } else {
    // Handle notification click
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
    );
  }
});
