// Service Worker for TradeX Pro PWA
const CACHE_NAME = 'trandex-pro-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Critical assets to cache immediately for offline functionality
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/browserconfig.xml',
  '/assets/index.css',
  // Core trading functionality
  '/trade',
  '/dashboard',
  '/portfolio',
  // Essential JS chunks will be added dynamically
];

// Asset types that should be cached
const CACHEABLE_TYPES = [
  'script',
  'style', 
  'image',
  'font',
  'document'
];

// Important API endpoints for offline trading
const CRITICAL_APIS = [
  /\/api\/user\/profile/,
  /\/api\/portfolio\/summary/,
  /\/api\/market\/symbols/,
  /\/api\/trading\/positions/,
  /\/api\/orders\/pending/
];

// API endpoints to cache for offline access
const API_CACHE_RULES = [
  {
    pattern: /^https:\/\/api\.example\.com\/market-data/,
    maxAge: 60000, // 1 minute
    strategy: 'network-first'
  },
  {
    pattern: /^https:\/\/api\.example\.com\/user/,
    maxAge: 300000, // 5 minutes
    strategy: 'network-first'
  },
  {
    pattern: /^https:\/\/api\.example\.com\/trading/,
    maxAge: 30000, // 30 seconds
    strategy: 'network-only' // Trading data should always be fresh
  }
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching critical assets');
        // Cache critical pages and assets
        return cache.addAll(CRITICAL_ASSETS)
          .catch(err => {
            console.log('Critical caching failed:', err);
            // Fallback - cache minimal assets
            return cache.addAll(['/', '/offline.html']);
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches and handle updates
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
        
        return Promise.all(
          cacheNames.map((cache) => {
            if (!currentCaches.includes(cache)) {
              console.log('Service Worker: Clearing old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        // Notify all clients that the service worker has been activated
        return self.clients.matchAll()
          .then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SW_ACTIVATED',
                version: CACHE_NAME
              });
            });
          });
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
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
  return request.url.includes('/api/') || 
         request.url.includes('supabase') ||
         request.url.includes('tradingview');
}

// Check if request is for static assets
function isStaticAsset(request) {
  return CACHEABLE_TYPES.includes(request.destination) ||
         request.url.endsWith('.js') ||
         request.url.endsWith('.css') ||
         request.url.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i);
}

// Check if request is for critical API
function isCriticalApi(request) {
  return CRITICAL_APIS.some(pattern => pattern.test(request.url));
}

// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Check if we have a cached response and if it's still fresh
  if (cachedResponse) {
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time'));
    const now = new Date();
    const age = now - cacheTime;
    
    const rule = getCacheRule(request.url);
    if (rule && age < rule.maxAge) {
      // Return cached response if still fresh
      return cachedResponse;
    }
  }
  
  // Try network first
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  } catch (error) {
    // Return cached response if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return appropriate offline response
    return getCachedOfflineResponse(request);
  }
}

// Handle static asset requests with intelligent caching
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  // For critical assets, prefer cache but update in background
  if (isCriticalAsset(request)) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, responseClone);
        return networkResponse;
      }
    } catch (error) {
      // Fall back to cache
    }
    
    if (cachedResponse) {
      return cachedResponse;
    }
  } else {
    // For non-critical assets, try network first
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          const cache = caches.open(STATIC_CACHE);
          cache.then(c => c.put(request, response.clone()));
        }
      }).catch(() => {
        // Ignore background update errors
      });
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      // Return fallback for critical assets
      if (request.destination === 'script') {
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      }
      return await caches.match('/offline.html');
    }
  }
  
  // If we reach here, we're offline and have no cache
  return await caches.match('/offline.html');
}

// Check if asset is critical for offline functionality
function isCriticalAsset(request) {
  return CRITICAL_ASSETS.includes(new URL(request.url).pathname) ||
         request.url.includes('tradingview') ||
         request.url.includes('chart') ||
         request.url.match(/\.(woff|woff2|ttf|eot)$/i); // Critical fonts
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
  const cachedResponse = await caches.match('/');
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    return await fetch(request);
  } catch (error) {
    return await caches.match('/offline.html');
  }
}

// Get cache rule for URL
function getCacheRule(url) {
  return API_CACHE_RULES.find(rule => rule.pattern.test(url));
}

// Get cached offline response
async function getCachedOfflineResponse(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // For trading data, return cached data with warning
  if (request.url.includes('/trading/')) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-offline', 'true');
      headers.set('x-cache-warning', 'Data may be outdated');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
  }
  
  return new Response(JSON.stringify({ 
    error: 'Offline', 
    message: 'This feature requires internet connection',
    offline: true 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background sync for pending orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    const cache = await caches.open('pending-orders');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from pending cache
          cache.delete(request);
          
          // Notify user of successful sync
          self.registration.showNotification('TradeX Pro', {
            body: 'Your pending orders have been processed',
            icon: '/icons/icon-192x192.png',
            tag: 'order-sync'
          });
        }
      } catch (error) {
        console.log('Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'TradeX Pro',
    body: 'You have a trading alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'trading-alert'
  };
  
  if (event.data) {
    try {
      notificationData = JSON.parse(event.data.text());
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle action button clicks
    clients.openWindow(event.action);
  } else if (event.notification.data && event.notification.data.url) {
    // Open specific URL
    clients.openWindow(event.notification.data.url);
  } else {
    // Default action - open main app
    clients.openWindow('/');
  }
});