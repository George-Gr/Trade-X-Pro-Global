import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceRequest {
  symbol: string;
}

// Simulated forex data for development (Finnhub free tier doesn't support forex)
const FOREX_MOCK_DATA: Record<string, { base: number, volatility: number }> = {
  'OANDA:EUR_USD': { base: 1.0850, volatility: 0.0015 },
  'OANDA:GBP_USD': { base: 1.2650, volatility: 0.0020 },
  'OANDA:USD_JPY': { base: 149.50, volatility: 0.3000 },
  'OANDA:AUD_USD': { base: 0.6550, volatility: 0.0018 },
  'OANDA:USD_CAD': { base: 1.3850, volatility: 0.0012 },
};

function generateForexPrice(symbol: string): any {
  const mock = FOREX_MOCK_DATA[symbol];
  if (!mock) {
    return null;
  }

  // Generate realistic price movement
  const randomChange = (Math.random() - 0.5) * 2 * mock.volatility;
  const currentPrice = mock.base + randomChange;
  const previousClose = mock.base;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  return {
    c: Number(currentPrice.toFixed(5)), // current price
    d: Number(change.toFixed(5)), // change
    dp: Number(changePercent.toFixed(4)), // change percent
    h: Number((currentPrice + mock.volatility).toFixed(5)), // high
    l: Number((currentPrice - mock.volatility).toFixed(5)), // low
    o: Number((previousClose + randomChange * 0.5).toFixed(5)), // open
    pc: Number(previousClose.toFixed(5)), // previous close
    t: Math.floor(Date.now() / 1000), // timestamp
  };
}

// In-memory cache to reduce rate limiting for stock symbols
const STOCK_CACHE_TTL_MS = 5000; // 5 seconds
const stockCache = new Map<string, { data: any; timestamp: number }>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol }: PriceRequest = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if it's a forex symbol (starts with OANDA:)
    if (symbol.startsWith('OANDA:')) {
      console.log(`Using simulated data for forex symbol: ${symbol}`);
      const forexData = generateForexPrice(symbol);
      
      if (!forexData) {
        return new Response(
          JSON.stringify({ error: 'Forex symbol not supported' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(forexData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For stocks, use Finnhub API with server-side caching to avoid rate limits
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = Date.now();
    const cached = stockCache.get(symbol);
    if (cached && (now - cached.timestamp) < STOCK_CACHE_TTL_MS) {
      console.log(`Cache hit for ${symbol}`);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'hit' } }
      );
    }

    try {
      console.log(`Fetching stock price from Finnhub: ${symbol}`);
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        console.error(`Finnhub API error: ${response.status} for ${symbol}`);
        if (response.status === 429 && cached) {
          console.warn(`Returning stale cache for ${symbol} due to 429`);
          return new Response(
            JSON.stringify(cached.data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'stale' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Failed to fetch stock price' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      // Basic validation
      if (typeof data?.c !== 'number' || data.c <= 0) {
        console.warn(`Invalid quote payload for ${symbol}:`, data);
        if (cached) {
          return new Response(
            JSON.stringify(cached.data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'stale' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Invalid provider response' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      stockCache.set(symbol, { data, timestamp: now });
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'miss' } }
      );
    } catch (e) {
      console.error('Network error calling Finnhub:', e);
      if (cached) {
        return new Response(
          JSON.stringify(cached.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'stale' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stock price' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in get-stock-price:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
