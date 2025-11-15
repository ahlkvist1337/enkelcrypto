import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const { data: cached } = await supabase
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', 'crypto_data_cache')
      .single();

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Returning cached crypto data');
        return new Response(cached.value, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Fetching fresh crypto data from CoinGecko...');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch market data from CoinGecko (free API, no key needed)
    const marketResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=sek&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d'
    );
    
    if (!marketResponse.ok) {
      // If rate limited and we have old cache, return it
      if (marketResponse.status === 429 && cached) {
        console.log('Rate limited, returning old cache');
        return new Response(cached.value, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`CoinGecko API error: ${marketResponse.status}`);
    }
    
    const marketData = await marketResponse.json();
    
    // Add delay between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch global market data
    const globalResponse = await fetch('https://api.coingecko.com/api/v3/global');
    
    let globalData = null;
    if (globalResponse.ok) {
      try {
        globalData = await globalResponse.json();
      } catch (e) {
        console.error('Failed to parse global data:', e);
      }
    } else {
      console.warn('Global API failed with status:', globalResponse.status);
    }
    
    // Extract top gainers and losers
    const sorted = [...marketData].sort((a: any, b: any) => 
      Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0)
    );
    
    const gainers = marketData
      .filter((coin: any) => (coin.price_change_percentage_24h || 0) > 0)
      .sort((a: any, b: any) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 5);
    
    const losers = marketData
      .filter((coin: any) => (coin.price_change_percentage_24h || 0) < 0)
      .sort((a: any, b: any) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
      .slice(0, 5);
    
    // Get Bitcoin and Ethereum data
    const btc = marketData.find((coin: any) => coin.id === 'bitcoin');
    const eth = marketData.find((coin: any) => coin.id === 'ethereum');
    
    // Calculate fallback market cap from available data if global API failed
    const marketCap = globalData?.data?.total_market_cap?.sek || 
      marketData.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0);
    
    const btcDominance = globalData?.data?.market_cap_percentage?.btc || 
      (btc?.market_cap ? (btc.market_cap / marketCap) * 100 : 45);
    
    const result = {
      timestamp: new Date().toISOString(),
      marketCap: marketCap,
      btcDominance: btcDominance,
      bitcoin: {
        price: btc?.current_price || 0,
        change24h: btc?.price_change_percentage_24h || 0,
        change7d: btc?.price_change_percentage_7d_in_currency || 0,
      },
      ethereum: {
        price: eth?.current_price || 0,
        change24h: eth?.price_change_percentage_24h || 0,
        change7d: eth?.price_change_percentage_7d_in_currency || 0,
      },
      gainers: gainers.map((coin: any) => ({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        priceChange: coin.price_change_percentage_24h || 0,
        price: coin.current_price,
      })),
      losers: losers.map((coin: any) => ({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        priceChange: coin.price_change_percentage_24h || 0,
        price: coin.current_price,
      })),
      allCoins: marketData.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
      })),
    };
    
    console.log('Successfully fetched crypto data');
    
    const resultJson = JSON.stringify(result);
    
    // Save to cache
    await supabase
      .from('site_settings')
      .upsert({
        key: 'crypto_data_cache',
        value: resultJson,
        updated_at: new Date().toISOString(),
      });
    
    return new Response(resultJson, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
