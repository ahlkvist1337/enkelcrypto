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
    const coinId = url.searchParams.get('coinId') || 'bitcoin';
    const days = url.searchParams.get('days') || '7';

    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
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
        coinId,
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
