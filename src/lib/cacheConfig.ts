// Caching Strategy Configuration for TradeX Pro PWA
export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  maxAge: number;
  strategy:
    | 'cache-first'
    | 'network-first'
    | 'cache-only'
    | 'network-only'
    | 'stale-while-revalidate';
  cacheName: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface CacheConfig {
  strategies: CacheStrategy[];
  maxCacheSize: {
    [cacheName: string]: number;
  };
  maxEntryAge: {
    [cacheName: string]: number;
  };
  purgeThreshold: number;
}

// Define caching strategies for different types of resources
export const CACHE_CONFIG: CacheConfig = {
  strategies: [
    // Critical PWA assets - cache first, long expiration
    {
      name: 'pwa-critical',
      pattern:
        /^(\/$|\/offline\.html$|\/manifest\.json$|\/browserconfig\.xml$|\/favicon\.ico$)/,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      strategy: 'cache-first',
      cacheName: 'pwa-critical-v1',
      priority: 'critical',
    },

    // Static assets (CSS, JS, images) - cache first with background update
    {
      name: 'static-assets',
      pattern: /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp)$/i,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      strategy: 'stale-while-revalidate',
      cacheName: 'static-v1',
      priority: 'high',
    },

    // Web fonts - cache first, long expiration
    {
      name: 'fonts',
      pattern: /\.(woff|woff2|ttf|eot)$/i,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      strategy: 'cache-first',
      cacheName: 'fonts-v1',
      priority: 'high',
    },

    // User avatars and profile images - cache first
    {
      name: 'user-content',
      pattern: /\/api\/user\/.*\.(png|jpg|jpeg|gif|svg)$/i,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      strategy: 'cache-first',
      cacheName: 'user-content-v1',
      priority: 'normal',
    },

    // Market data - network first with fallback
    {
      name: 'market-data',
      pattern: /\/api\/market\//i,
      maxAge: 5 * 60 * 1000, // 5 minutes
      strategy: 'network-first',
      cacheName: 'market-data-v1',
      priority: 'high',
    },

    // User portfolio data - network first, short cache
    {
      name: 'portfolio-data',
      pattern: /\/api\/portfolio\//i,
      maxAge: 2 * 60 * 1000, // 2 minutes
      strategy: 'network-first',
      cacheName: 'portfolio-data-v1',
      priority: 'critical',
    },

    // Trading positions and orders - network only for real-time
    {
      name: 'trading-data',
      pattern: /\/api\/trading\//i,
      maxAge: 30 * 1000, // 30 seconds
      strategy: 'network-only',
      cacheName: 'trading-data-v1',
      priority: 'critical',
    },

    // News and research - cache first with medium expiration
    {
      name: 'news-content',
      pattern: /\/api\/(news|research)\//i,
      maxAge: 60 * 60 * 1000, // 1 hour
      strategy: 'cache-first',
      cacheName: 'news-content-v1',
      priority: 'normal',
    },

    // Static content (help, terms, etc.) - cache first, long expiration
    {
      name: 'static-content',
      pattern: /\/api\/(help|terms|privacy|about)\//i,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      strategy: 'cache-first',
      cacheName: 'static-content-v1',
      priority: 'low',
    },

    // 3rd party scripts (charts, analytics) - cache first
    {
      name: 'third-party',
      pattern: /tradingview|chart|analytics/i,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      strategy: 'cache-first',
      cacheName: 'third-party-v1',
      priority: 'normal',
    },
  ],

  // Maximum cache sizes
  maxCacheSize: {
    'pwa-critical-v1': 50, // 50 items
    'static-v1': 100, // 100 items
    'fonts-v1': 20, // 20 font files
    'user-content-v1': 100, // 100 user images
    'market-data-v1': 200, // 200 market data entries
    'portfolio-data-v1': 50, // 50 portfolio snapshots
    'trading-data-v1': 100, // 100 trading data entries
    'news-content-v1': 200, // 200 news articles
    'static-content-v1': 100, // 100 static content pages
    'third-party-v1': 50, // 50 third-party resources
  },

  // Maximum entry ages per cache
  maxEntryAge: {
    'pwa-critical-v1': 7 * 24 * 60 * 60 * 1000, // 7 days
    'static-v1': 30 * 24 * 60 * 60 * 1000, // 30 days
    'fonts-v1': 30 * 24 * 60 * 60 * 1000, // 30 days
    'user-content-v1': 7 * 24 * 60 * 60 * 1000, // 7 days
    'market-data-v1': 5 * 60 * 1000, // 5 minutes
    'portfolio-data-v1': 2 * 60 * 1000, // 2 minutes
    'trading-data-v1': 30 * 1000, // 30 seconds
    'news-content-v1': 60 * 60 * 1000, // 1 hour
    'static-content-v1': 7 * 24 * 60 * 60 * 1000, // 7 days
    'third-party-v1': 24 * 60 * 60 * 1000, // 24 hours
  },

  // Purge threshold (percentage of max cache size)
  purgeThreshold: 0.8, // Start purging at 80% capacity
};

/**
 * Get caching strategy for a given URL
 */
export function getCacheStrategy(url: string): CacheStrategy | null {
  for (const strategy of CACHE_CONFIG.strategies) {
    if (strategy.pattern.test(url)) {
      return strategy;
    }
  }
  return null;
}

/**
 * Check if URL should be cached
 */
export function shouldCache(url: string): boolean {
  return getCacheStrategy(url) !== null;
}

/**
 * Get cache name for URL
 */
export function getCacheName(url: string): string {
  const strategy = getCacheStrategy(url);
  return strategy?.cacheName || 'default-v1';
}

/**
 * Get max age for URL
 */
export function getMaxAge(url: string): number {
  const strategy = getCacheStrategy(url);
  return strategy?.maxAge || 60 * 60 * 1000; // 1 hour default
}

/**
 * Get strategy type for URL
 */
export function getStrategyType(url: string): string {
  const strategy = getCacheStrategy(url);
  return strategy?.strategy || 'cache-first';
}

/**
 * Check if request is critical for offline functionality
 */
export function isCriticalRequest(url: string): boolean {
  const strategy = getCacheStrategy(url);
  return strategy?.priority === 'critical';
}

/**
 * Purge old entries from cache
 */
export async function purgeOldEntries(cacheName: string): Promise<void> {
  const cache = await caches.open(cacheName);
  const maxAge = CACHE_CONFIG.maxEntryAge[cacheName];

  if (!maxAge) return;

  const now = Date.now();
  const requests = await cache.keys();

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const cacheTime = response.headers.get('sw-cache-time');
      if (cacheTime) {
        const age = now - new Date(cacheTime).getTime();
        if (age > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }
}

/**
 * Limit cache size by removing oldest entries
 */
export async function limitCacheSize(cacheName: string): Promise<void> {
  const cache = await caches.open(cacheName);
  const maxSize = CACHE_CONFIG.maxCacheSize[cacheName];

  if (!maxSize) return;

  const requests = await cache.keys();

  if (requests.length > maxSize) {
    // Sort by cache time and remove oldest
    const entries = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request);
        const cacheTime = response?.headers.get('sw-cache-time');
        return {
          request,
          time: cacheTime ? new Date(cacheTime).getTime() : 0,
        };
      })
    );

    // Sort by time (oldest first) and remove excess
    entries.sort((a, b) => a.time - b.time);

    for (let i = 0; i < entries.length - maxSize; i++) {
      await cache.delete(entries[i].request);
    }
  }
}
