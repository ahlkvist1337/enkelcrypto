import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to format date as YYYY-MM-DD in Swedish timezone
function getSwedishDate(date: Date = new Date()): string {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' }).split('T')[0];
}

// Helper to get yesterday's date in Swedish timezone
function getYesterdaySwedishDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getSwedishDate(yesterday);
}

// Log generation attempt to database
async function logGenerationAttempt(
  supabase: any, 
  date: string, 
  status: 'started' | 'completed' | 'failed', 
  attemptNumber: number,
  errorMessage?: string,
  durationMs?: number
) {
  try {
    await supabase.from('report_generation_log').insert({
      date,
      status,
      attempt_number: attemptNumber,
      error_message: errorMessage,
      duration_ms: durationMs,
    });
  } catch (error) {
    console.error('Failed to log generation attempt:', error);
  }
}

// Get the current attempt number for a date
async function getAttemptNumber(supabase: any, date: string): Promise<number> {
  const { data } = await supabase
    .from('report_generation_log')
    .select('attempt_number')
    .eq('date', date)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return data ? data.attempt_number + 1 : 1;
}

// Check if we should retry (max 3 attempts)
async function shouldRetry(supabase: any, date: string): Promise<boolean> {
  const attemptNumber = await getAttemptNumber(supabase, date);
  return attemptNumber <= 3;
}

// Generate report for a specific date
async function generateReportForDate(
  supabase: any, 
  supabaseUrl: string, 
  supabaseKey: string, 
  lovableApiKey: string, 
  targetDate: string
): Promise<{ success: boolean; message: string }> {
  const startTime = Date.now();
  const attemptNumber = await getAttemptNumber(supabase, targetDate);
  
  console.log(`Starting report generation for ${targetDate} (attempt ${attemptNumber})...`);
  
  // Check if we've exceeded max attempts
  if (attemptNumber > 3) {
    console.log(`Max attempts (3) exceeded for ${targetDate}, skipping`);
    return { success: false, message: `Max attempts exceeded for ${targetDate}` };
  }
  
  // Log start
  await logGenerationAttempt(supabase, targetDate, 'started', attemptNumber);
  
  try {
    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('type', 'daily')
      .eq('date', targetDate)
      .maybeSingle();
    
    if (existingReport) {
      console.log(`Report already exists for ${targetDate}, marking as completed`);
      await logGenerationAttempt(supabase, targetDate, 'completed', attemptNumber, 'Report already existed', Date.now() - startTime);
      return { success: true, message: `Report already exists for ${targetDate}` };
    }
    
    // Fetch crypto data with timeout
    console.log('Fetching crypto data...');
    const cryptoController = new AbortController();
    const cryptoTimeout = setTimeout(() => cryptoController.abort(), 30000);
    
    const cryptoDataResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-crypto-data`, {
      headers: { Authorization: `Bearer ${supabaseKey}` },
      signal: cryptoController.signal,
    });
    clearTimeout(cryptoTimeout);
    
    if (!cryptoDataResponse.ok) {
      throw new Error(`Failed to fetch crypto data: ${cryptoDataResponse.status}`);
    }
    
    const cryptoData = await cryptoDataResponse.json();
    console.log('Crypto data fetched successfully');
    
    // Prepare data summary for AI
    const displayDate = new Date(targetDate).toLocaleDateString('sv-SE');
    const dataSummary = `
Marknadsöversikt ${displayDate}:

Bitcoin: ${cryptoData.bitcoin.price.toLocaleString('sv-SE')} SEK (${cryptoData.bitcoin.change24h.toFixed(2)}% på 24h)
Ethereum: ${cryptoData.ethereum.price.toLocaleString('sv-SE')} SEK (${cryptoData.ethereum.change24h.toFixed(2)}% på 24h)
Total marknadskapital: ${(cryptoData.marketCap / 1_000_000_000_000).toFixed(2)} biljoner SEK
BTC-dominans: ${cryptoData.btcDominance.toFixed(1)}%

Dagens vinnare (topp 5):
${cryptoData.gainers.map((g: any, i: number) => `${i+1}. ${g.name} (${g.symbol}): +${g.priceChange.toFixed(2)}%`).join('\n')}

Dagens förlorare (topp 5):
${cryptoData.losers.map((l: any, i: number) => `${i+1}. ${l.name} (${l.symbol}): ${l.priceChange.toFixed(2)}%`).join('\n')}
`;

    // Fetch affiliate links to include in report
    const { data: affiliateLinks } = await supabase
      .from('affiliate_links')
      .select('name, url')
      .eq('active', true)
      .limit(3);
    
    const affiliateText = affiliateLinks && affiliateLinks.length > 0
      ? `\n\nTillgängliga handelsplattformar:\n${affiliateLinks.map((link: any) => `- ${link.name}: ${link.url}`).join('\n')}`
      : '';
    
    // Generate report with AI (with timeout)
    console.log('Generating AI report...');
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 60000); // 60 second timeout for AI
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Du är en kunnig, lugn kryptomarknadssummariserare för EnkelCrypto. Din uppgift är att skriva dagliga rapporter på enkel svenska som förklarar vad som händer på kryptomarknaden. 

VIKTIG TON OCH STIL:
Skriv som en kunnig, lugn kompis som förklarar läget. INTE som en trader eller finansiell rådgivare. INTE upphetsad eller hype-drivande. Saklig, neutral och förklarande ton. Enkla ord, inga komplicerade termer. Kort och koncist, max 400-500 ord.

FORMATERING:
KRITISKT: Använd ALDRIG asterisker (*) för att formatera text. Skriv naturlig löpande text med stycken. Om du vill framhäva något viktigt, skriv det i fetstil med **text** eller använd naturlig betoning i meningsstrukturen. Använd INGA punktlistor med asterisker, INGA numrerade listor. Allt ska vara flytande text organiserad i stycken.

STRUKTUR (skriv som naturliga stycken, inte som lista):
Börja med en kort sammanfattning av dagens övergripande marknadsläge. Förklara sedan huvudsakliga rörelser för Bitcoin och Ethereum. Berätta kort om vad som driver marknaden idag.

Inkludera ett stycke om potentiella vinnare att hålla koll på:
- Välj 3 kortsiktiga (närmaste 1-2 veckorna) baserat på momentum och tekniska faktorer
- Välj 2 långsiktiga (3-6 månader) baserat på fundamenta och adoption
- Skriv det som naturlig text, till exempel: "Kortsiktigt kan det vara intressant att hålla koll på Quant (QNT) som visar god styrka idag och kan fortsätta attrahera intresse."

Avsluta alltid med: "Detta är läget just nu. Kom ihåg att kryptomarknaden är volatil och detta är inte finansiell rådgivning."

VIKTIGT: Använd aldrig ord som "investera", "köp", "sälj" - använd istället "intressant", "spännande", "hålla koll på".`
          },
          {
            role: 'user',
            content: `Skriv dagens kryptorapport baserat på denna data:\n\n${dataSummary}${affiliateText}`
          }
        ],
      }),
      signal: aiController.signal,
    });
    clearTimeout(aiTimeout);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const aiData = await aiResponse.json();
    const reportContent = aiData.choices[0].message.content;
    
    console.log('AI report generated, saving to database...');
    
    // Save report to database
    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        date: targetDate,
        type: 'daily',
        title: `Dagens kryptorapport – ${new Date(targetDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        content: reportContent,
      });
    
    if (reportError) {
      console.error('Error saving report:', reportError);
      throw new Error(`Database error: ${reportError.message}`);
    }
    
    console.log('Report saved, generating market mover comments...');
    
    // Generate AI comments for gainers and losers
    for (const gainer of cryptoData.gainers) {
      try {
        const commentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'Du skriver mycket korta (max 10 ord), neutrala kommentarer på svenska om varför ett kryptomynt har stigit. Använd ord som "troligen", "verkar", aldrig garantier.'
              },
              {
                role: 'user',
                content: `${gainer.name} har stigit ${gainer.priceChange.toFixed(2)}%. Skriv en mycket kort kommentar om möjlig orsak.`
              }
            ],
          }),
        });
        
        const commentData = await commentResponse.json();
        const comment = commentData.choices?.[0]?.message?.content || 'Ökat marknadsintresse';
        
        await supabase.from('market_movers').insert({
          date: targetDate,
          coin_name: gainer.name,
          ticker: gainer.symbol,
          price_change: gainer.priceChange,
          type: 'winner',
          ai_comment: comment,
        });
      } catch (error) {
        console.error(`Failed to generate comment for gainer ${gainer.name}:`, error);
        // Still insert without AI comment
        await supabase.from('market_movers').insert({
          date: targetDate,
          coin_name: gainer.name,
          ticker: gainer.symbol,
          price_change: gainer.priceChange,
          type: 'winner',
          ai_comment: 'Ökat marknadsintresse',
        });
      }
    }
    
    for (const loser of cryptoData.losers) {
      try {
        const commentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'Du skriver mycket korta (max 10 ord), neutrala kommentarer på svenska om varför ett kryptomynt har fallit. Använd ord som "troligen", "verkar", aldrig garantier.'
              },
              {
                role: 'user',
                content: `${loser.name} har fallit ${loser.priceChange.toFixed(2)}%. Skriv en mycket kort kommentar om möjlig orsak.`
              }
            ],
          }),
        });
        
        const commentData = await commentResponse.json();
        const comment = commentData.choices?.[0]?.message?.content || 'Vinsttagning troligen';
        
        await supabase.from('market_movers').insert({
          date: targetDate,
          coin_name: loser.name,
          ticker: loser.symbol,
          price_change: loser.priceChange,
          type: 'loser',
          ai_comment: comment,
        });
      } catch (error) {
        console.error(`Failed to generate comment for loser ${loser.name}:`, error);
        // Still insert without AI comment
        await supabase.from('market_movers').insert({
          date: targetDate,
          coin_name: loser.name,
          ticker: loser.symbol,
          price_change: loser.priceChange,
          type: 'loser',
          ai_comment: 'Vinsttagning troligen',
        });
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`Report generation completed for ${targetDate} in ${duration}ms`);
    
    // Log success
    await logGenerationAttempt(supabase, targetDate, 'completed', attemptNumber, undefined, duration);
    
    return { success: true, message: `Report generated successfully for ${targetDate}` };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Report generation failed for ${targetDate}:`, errorMessage);
    
    // Log failure
    await logGenerationAttempt(supabase, targetDate, 'failed', attemptNumber, errorMessage, duration);
    
    return { success: false, message: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate cron secret or admin auth
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization');
  
  // Check cron secret first
  if (cronSecret && cronSecret === expectedSecret) {
    // Valid cron job, proceed
  } else if (authHeader) {
    // Check admin auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tempSupabase = createClient(supabaseUrl, supabaseKey);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await tempSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data: roleData } = await tempSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('=== Daily Report Generation Started ===');
  console.log('Current UTC time:', new Date().toISOString());
  console.log('Swedish time:', new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' }));
  
  const results: { date: string; success: boolean; message: string }[] = [];
  
  try {
    // Get today's date in Swedish timezone
    const today = getSwedishDate();
    const yesterday = getYesterdaySwedishDate();
    
    console.log('Today (Swedish):', today);
    console.log('Yesterday (Swedish):', yesterday);
    
    // Check if yesterday's report is missing (backup mechanism)
    const { data: yesterdayReport } = await supabase
      .from('reports')
      .select('id')
      .eq('type', 'daily')
      .eq('date', yesterday)
      .maybeSingle();
    
    if (!yesterdayReport) {
      console.log(`Yesterday's report (${yesterday}) is missing, attempting to generate...`);
      const shouldTry = await shouldRetry(supabase, yesterday);
      if (shouldTry) {
        const result = await generateReportForDate(supabase, supabaseUrl, supabaseKey, lovableApiKey, yesterday);
        results.push({ date: yesterday, ...result });
      } else {
        console.log(`Max retries exceeded for ${yesterday}, skipping`);
        results.push({ date: yesterday, success: false, message: 'Max retries exceeded' });
      }
    } else {
      console.log(`Yesterday's report (${yesterday}) exists`);
    }
    
    // Generate today's report
    const todayResult = await generateReportForDate(supabase, supabaseUrl, supabaseKey, lovableApiKey, today);
    results.push({ date: today, ...todayResult });
    
    console.log('=== Daily Report Generation Finished ===');
    console.log('Results:', JSON.stringify(results));
    
    const allSuccess = results.every(r => r.success);
    
    return new Response(JSON.stringify({ 
      success: allSuccess,
      results,
    }), {
      status: allSuccess ? 200 : 207, // 207 = Multi-Status
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Fatal error in report generation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
