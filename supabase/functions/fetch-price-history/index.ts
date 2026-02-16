import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache: key -> { data, timestamp }
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    const url = new URL(req.url);
    const coinIdParam = url.searchParams.get('coinId') || 'bitcoin';
    const daysParam = url.searchParams.get('days') || '7';

    if (!/^[a-z0-9-]+$/i.test(coinIdParam) || coinIdParam.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid coinId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const days = parseInt(daysParam, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      return new Response(
        JSON.stringify({ error: 'Invalid days parameter (must be 1-365)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check in-memory cache first
    const cacheKey = `${coinIdParam}_${days}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`Returning cached price history for ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Also check DB cache as fallback
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const dbCacheKey = `price_history_${cacheKey}`;
    const { data: dbCached } = await supabase
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', dbCacheKey)
      .single();

    if (dbCached) {
      const cacheAge = Date.now() - new Date(dbCached.updated_at).getTime();
      if (cacheAge < CACHE_TTL) {
        console.log(`Returning DB-cached price history for ${cacheKey}`);
        const parsed = JSON.parse(dbCached.value);
        cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
        return new Response(dbCached.value, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    const response = await fetch(
      `${COINGECKO_API}/coins/${encodeURIComponent(coinIdParam)}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    if (!response.ok) {
      // If rate limited by CoinGecko and we have stale cache, return it
      if (response.status === 429 && dbCached) {
        console.log('CoinGecko rate limited, returning stale DB cache');
        return new Response(dbCached.value, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    const formattedData = data.prices.map((price: [number, number]) => ({
      timestamp: price[0],
      date: new Date(price[0]).toLocaleDateString('sv-SE'),
      price: price[1],
    }));

    const result = {
      coinId: coinIdParam,
      days,
      data: formattedData,
    };

    // Save to both caches
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    await supabase
      .from('site_settings')
      .upsert({
        key: dbCacheKey,
        value: JSON.stringify(result),
        updated_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
