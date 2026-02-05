import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const coinIdParam = url.searchParams.get('coinId') || 'bitcoin';
    const daysParam = url.searchParams.get('days') || '7';

    // Validate coinId (alphanumeric and hyphens only, max 50 chars)
    if (!/^[a-z0-9-]+$/i.test(coinIdParam) || coinIdParam.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid coinId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate days (must be numeric, 1-365)
    const days = parseInt(daysParam, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      return new Response(
        JSON.stringify({ error: 'Invalid days parameter (must be 1-365)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      `${COINGECKO_API}/coins/${encodeURIComponent(coinIdParam)}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Format the data for easier consumption
    const formattedData = data.prices.map((price: [number, number]) => ({
      timestamp: price[0],
      date: new Date(price[0]).toLocaleDateString('sv-SE'),
      price: price[1],
    }));

    return new Response(
      JSON.stringify({
        coinId: coinIdParam,
        days,
        data: formattedData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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
