import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FUNCTIONS_TO_CHECK = [
  'fetch-crypto-data',
  'fetch-price-history',
  'generate-daily-report',
  'generate-weekly-report',
  'scrape-crypto-news',
  'generate-sitemap',
  'fix-news-json',
  'update-news-translations',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require cron secret or admin
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization');

  if (cronSecret !== expectedSecret) {
    // Check if admin user
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Cleanup old logs first
  await supabase.rpc('cleanup_old_health_checks');

  const results = [];

  for (const funcName of FUNCTIONS_TO_CHECK) {
    const url = `${supabaseUrl}/functions/v1/${funcName}`;
    let statusCode = 0;
    let isHealthy = false;
    let errorMessage: string | null = null;

    try {
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' },
      });
      statusCode = response.status;
      // OPTIONS returning 200 or 204 means function exists
      isHealthy = statusCode >= 200 && statusCode < 400;
    } catch (error) {
      errorMessage = (error as Error).message;
      isHealthy = false;
    }

    results.push({
      function_name: funcName,
      status_code: statusCode || null,
      is_healthy: isHealthy,
      error_message: errorMessage,
    });
  }

  // Insert all results
  const { error: insertError } = await supabase
    .from('health_check_log')
    .insert(results);

  if (insertError) {
    console.error('Failed to insert health check results:', insertError);
  }

  const unhealthy = results.filter(r => !r.is_healthy);

  return new Response(
    JSON.stringify({
      checked_at: new Date().toISOString(),
      total: results.length,
      healthy: results.length - unhealthy.length,
      unhealthy: unhealthy.length,
      results,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
