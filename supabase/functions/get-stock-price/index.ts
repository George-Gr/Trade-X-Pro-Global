import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface PriceRequest {
  symbol: string;
}

interface SignedPriceResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
  signature?: string;
  verified?: boolean;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 60;
const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function checkRateLimit(clientIP: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);

  if (Math.random() < 0.01) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS * 2;
    for (const [ip, data] of rateLimitStore.entries()) {
      if (data.windowStart < cutoff) {
        rateLimitStore.delete(ip);
      }
    }
  }

  if (!record || now - record.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIP, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetIn: RATE_LIMIT_WINDOW_MS,
    };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count++;
  const resetIn = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    resetIn,
  };
}

/**
 * Generate HMAC-SHA256 signature for price data
 * Prevents price manipulation by signing server-side price data
 */
async function signPriceData(
  symbol: string,
  price: number,
  timestamp: number
): Promise<string> {
  const PRICE_SIGNING_KEY = Deno.env.get('PRICE_SIGNING_KEY');

  if (!PRICE_SIGNING_KEY) {
    // Return empty signature if key not configured (backward compatible)
    return '';
  }

  const message = `${symbol}:${price}:${timestamp}`;

  const keyData = new TextEncoder().encode(PRICE_SIGNING_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(message)
  );

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simulated forex/commodity/crypto data for development
const FOREX_MOCK_DATA: Record<string, { base: number; volatility: number }> = {
  'OANDA:EUR_USD': { base: 1.085, volatility: 0.0015 },
  'OANDA:GBP_USD': { base: 1.265, volatility: 0.002 },
  'OANDA:USD_JPY': { base: 149.5, volatility: 0.3 },
  'OANDA:AUD_USD': { base: 0.655, volatility: 0.0018 },
  'OANDA:USD_CAD': { base: 1.385, volatility: 0.0012 },
  'OANDA:USD_CHF': { base: 0.875, volatility: 0.0012 },
  'OANDA:NZD_USD': { base: 0.61, volatility: 0.0015 },
  'OANDA:EUR_GBP': { base: 0.858, volatility: 0.0012 },
  'OANDA:EUR_JPY': { base: 162.2, volatility: 0.35 },
  'OANDA:GBP_JPY': { base: 189.1, volatility: 0.4 },
  'OANDA:XAU_USD': { base: 2350.0, volatility: 15.0 },
  'OANDA:XAG_USD': { base: 28.5, volatility: 0.3 },
  'OANDA:BCO_USD': { base: 82.5, volatility: 1.2 },
  'OANDA:WTICO_USD': { base: 78.0, volatility: 1.1 },
  'OANDA:NATGAS_USD': { base: 2.85, volatility: 0.08 },
  'OANDA:BTC_USD': { base: 67500.0, volatility: 800.0 },
  'OANDA:ETH_USD': { base: 3450.0, volatility: 60.0 },
};

async function generateForexPrice(
  symbol: string
): Promise<SignedPriceResponse | null> {
  const mock = FOREX_MOCK_DATA[symbol];
  if (!mock) {
    return null;
  }

  const randomChange = (Math.random() - 0.5) * 2 * mock.volatility;
  const currentPrice = mock.base + randomChange;
  const previousClose = mock.base;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  const timestamp = Math.floor(Date.now() / 1000);

  // Generate signature for price verification
  const signature = await signPriceData(symbol, currentPrice, timestamp);

  return {
    c: Number(currentPrice.toFixed(5)),
    d: Number(change.toFixed(5)),
    dp: Number(changePercent.toFixed(4)),
    h: Number((currentPrice + mock.volatility).toFixed(5)),
    l: Number((currentPrice - mock.volatility).toFixed(5)),
    o: Number((previousClose + randomChange * 0.5).toFixed(5)),
    pc: Number(previousClose.toFixed(5)),
    t: timestamp,
    signature: signature || undefined,
    verified: !!signature,
  };
}

async function generateStockFallbackPrice(
  symbol: string
): Promise<SignedPriceResponse | null> {
  const BASELINES: Record<string, { base: number; volatility: number }> = {
    AAPL: { base: 180, volatility: 1.5 },
    TSLA: { base: 230, volatility: 3 },
    MSFT: { base: 400, volatility: 2 },
    NVDA: { base: 900, volatility: 5 },
    AMZN: { base: 150, volatility: 2 },
    META: { base: 480, volatility: 3 },
    GOOGL: { base: 170, volatility: 1.5 },
  };
  const mock = BASELINES[symbol];
  if (!mock) return null;

  const randomChange = (Math.random() - 0.5) * 2 * mock.volatility;
  const current = mock.base + randomChange;
  const previousClose = mock.base;
  const change = current - previousClose;
  const changePercent = (change / previousClose) * 100;
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = await signPriceData(symbol, current, timestamp);

  return {
    c: Number(current.toFixed(2)),
    d: Number(change.toFixed(2)),
    dp: Number(changePercent.toFixed(2)),
    h: Number((current + mock.volatility).toFixed(2)),
    l: Number((current - mock.volatility).toFixed(2)),
    o: Number((previousClose + randomChange * 0.5).toFixed(2)),
    pc: Number(previousClose.toFixed(2)),
    t: timestamp,
    signature: signature || undefined,
    verified: !!signature,
  };
}

// In-memory cache
const STOCK_CACHE_TTL_MS = 10000;
const stockCache = new Map<
  string,
  { data: SignedPriceResponse; timestamp: number }
>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);

  const rateLimitHeaders = {
    ...corsHeaders,
    'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
  };

  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  try {
    const { symbol }: PriceRequest = await req.json();

    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate symbol format to prevent injection
    if (!/^[A-Z0-9:_-]{1,30}$/i.test(symbol)) {
      return new Response(JSON.stringify({ error: 'Invalid symbol format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if it's a forex symbol
    if (symbol.startsWith('OANDA:')) {
      console.log(`Using simulated data for forex symbol: ${symbol}`);
      const forexData = await generateForexPrice(symbol);

      if (!forexData) {
        return new Response(
          JSON.stringify({ error: 'Forex symbol not supported' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(forexData), {
        headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For stocks, use Finnhub API with caching
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');

    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = Date.now();
    const cached = stockCache.get(symbol);
    if (cached && now - cached.timestamp < STOCK_CACHE_TTL_MS) {
      console.log(`Cache hit for ${symbol}`);
      return new Response(JSON.stringify(cached.data), {
        headers: {
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'hit',
        },
      });
    }

    try {
      console.log(`Fetching stock price from Finnhub: ${symbol}`);
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        console.error(`Finnhub API error: ${response.status} for ${symbol}`);
        if (response.status === 429) {
          if (cached) {
            console.warn(`Returning stale cache for ${symbol} due to 429`);
            return new Response(JSON.stringify(cached.data), {
              headers: {
                ...rateLimitHeaders,
                'Content-Type': 'application/json',
                'X-Cache': 'stale',
              },
            });
          }
          const fallback = await generateStockFallbackPrice(symbol);
          if (fallback) {
            console.warn(`Returning fallback price for ${symbol} due to 429`);
            stockCache.set(symbol, { data: fallback, timestamp: now });
            return new Response(JSON.stringify(fallback), {
              headers: {
                ...rateLimitHeaders,
                'Content-Type': 'application/json',
                'X-Cache': 'fallback',
              },
            });
          }
          return new Response(
            JSON.stringify({
              c: 0,
              d: 0,
              dp: 0,
              h: 0,
              l: 0,
              o: 0,
              pc: 0,
              t: Math.floor(Date.now() / 1000),
            }),
            {
              headers: {
                ...rateLimitHeaders,
                'Content-Type': 'application/json',
                'X-Cache': 'empty',
              },
            }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Failed to fetch stock price' }),
          {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const data = await response.json();

      if (typeof data?.c !== 'number' || data.c <= 0) {
        console.warn(`Invalid quote payload for ${symbol}:`, data);
        if (cached) {
          return new Response(JSON.stringify(cached.data), {
            headers: {
              ...rateLimitHeaders,
              'Content-Type': 'application/json',
              'X-Cache': 'stale',
            },
          });
        }
        return new Response(
          JSON.stringify({ error: 'Invalid provider response' }),
          {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Sign the price data for verification
      const timestamp = data.t || Math.floor(Date.now() / 1000);
      const signature = await signPriceData(symbol, data.c, timestamp);

      const signedData: SignedPriceResponse = {
        ...data,
        t: timestamp,
        signature: signature || undefined,
        verified: !!signature,
      };

      stockCache.set(symbol, { data: signedData, timestamp: now });
      return new Response(JSON.stringify(signedData), {
        headers: {
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'miss',
        },
      });
    } catch (e) {
      console.error('Network error calling Finnhub:', e);
      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          headers: {
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'stale',
          },
        });
      }
      const fallback = await generateStockFallbackPrice(symbol);
      if (fallback) {
        stockCache.set(symbol, { data: fallback, timestamp: Date.now() });
        return new Response(JSON.stringify(fallback), {
          headers: {
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'fallback',
          },
        });
      }
      return new Response(
        JSON.stringify({
          c: 0,
          d: 0,
          dp: 0,
          h: 0,
          l: 0,
          o: 0,
          pc: 0,
          t: Math.floor(Date.now() / 1000),
        }),
        {
          headers: {
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'empty',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in get-stock-price:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
