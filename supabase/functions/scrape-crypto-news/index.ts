import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Swedish date in YYYY-MM-DD format
function getSwedishDate(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
}

// Log scrape attempt to database
async function logScrapeAttempt(
  supabase: any,
  status: 'started' | 'completed' | 'failed',
  articlesFetched: number = 0,
  articlesSaved: number = 0,
  errorMessage: string | null = null,
  attemptNumber: number = 1
) {
  const today = getSwedishDate();
  
  if (status === 'started') {
    const { error } = await supabase
      .from('news_scrape_log')
      .insert({
        date: today,
        status,
        attempt_number: attemptNumber,
        articles_fetched: 0,
        articles_saved: 0
      });
    if (error) console.error('Failed to log scrape start:', error);
  } else {
    // Update the latest started log for today
    const { error } = await supabase
      .from('news_scrape_log')
      .update({
        status,
        completed_at: new Date().toISOString(),
        articles_fetched: articlesFetched,
        articles_saved: articlesSaved,
        error_message: errorMessage
      })
      .eq('date', today)
      .eq('status', 'started')
      .order('started_at', { ascending: false })
      .limit(1);
    if (error) console.error('Failed to log scrape completion:', error);
  }
}

// Get attempt number for today
async function getAttemptNumber(supabase: any): Promise<number> {
  const today = getSwedishDate();
  const { data, error } = await supabase
    .from('news_scrape_log')
    .select('attempt_number')
    .eq('date', today)
    .order('attempt_number', { ascending: false })
    .limit(1);
  
  if (error || !data || data.length === 0) return 1;
  return data[0].attempt_number + 1;
}

// Check if we should retry based on last attempt
async function shouldRetry(supabase: any): Promise<boolean> {
  const today = getSwedishDate();
  const { data, error } = await supabase
    .from('news_scrape_log')
    .select('status, attempt_number')
    .eq('date', today)
    .order('started_at', { ascending: false })
    .limit(1);
  
  if (error || !data || data.length === 0) return true;
  
  // Retry if last attempt failed and we haven't exceeded max attempts
  const lastAttempt = data[0];
  if (lastAttempt.status === 'failed' && lastAttempt.attempt_number < 3) {
    return true;
  }
  
  // Don't retry if last attempt was successful
  if (lastAttempt.status === 'completed') {
    return false;
  }
  
  return true;
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// AI call with retry logic
async function callAIWithRetry(
  lovableApiKey: string,
  article: any,
  maxRetries: number = 2
): Promise<{ title: string; summary: string; fullContent: string } | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI call attempt ${attempt}/${maxRetries} for article: ${article.title.substring(0, 50)}...`);
      
      const aiResponse = await fetchWithTimeout(
        'https://ai.gateway.lovable.dev/v1/chat/completions',
        {
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
                content: `Du är en professionell nyhetsredaktör som skriver om krypto-nyheter på svenska.

VIKTIGT: Svara med REN JSON utan markdown-formatering. Ingen \`\`\`json eller \`\`\` wrapper.

Returnera exakt detta JSON-format:
{"title": "Svensk rubrik här", "summary": "Kort sammanfattning på 2-3 meningar.", "full_content": "Fullständig artikel på svenska med 3-5 stycken (200-400 ord). Separera stycken med dubbla radbrytningar."}`
              },
              {
                role: 'user',
                content: `Skriv om denna krypto-nyhet till en fullständig svensk artikel:\n\nOriginal titel: ${article.title}\n\nOriginal innehåll: ${article.body}`
              }
            ],
          }),
        },
        30000 // 30 second timeout
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`AI API error (attempt ${attempt}): ${aiResponse.status} - ${errorText}`);
        if (attempt === maxRetries) return null;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        continue;
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0].message.content;
      
      // Parse JSON response with robust cleaning
      let cleanContent = aiContent
        .replace(/^```(?:json|JSON)?\s*\n?/gm, '')
        .replace(/\n?```\s*$/gm, '')
        .replace(/^`+|`+$/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      if (!parsed.title || !parsed.summary || !parsed.full_content) {
        console.error(`Invalid AI response structure (attempt ${attempt})`);
        if (attempt === maxRetries) return null;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      return {
        title: parsed.title,
        summary: parsed.summary,
        fullContent: parsed.full_content
      };
    } catch (error) {
      console.error(`AI call failed (attempt ${attempt}):`, error);
      if (attempt === maxRetries) return null;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Validate cron secret or admin auth
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    
    // Check cron secret first
    if (cronSecret && cronSecret === expectedSecret) {
      // Valid cron job, proceed
    } else if (authHeader) {
      // Check admin auth
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data: roleData } = await supabase
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
    
    // Note: shouldRetry check removed - we now allow multiple runs per day
    
    const attemptNumber = await getAttemptNumber(supabase);
    console.log(`Starting crypto news scraping (attempt ${attemptNumber})...`);
    
    // Log start
    await logScrapeAttempt(supabase, 'started', 0, 0, null, attemptNumber);
    
    // Fetch news from CryptoCompare Free API
    const newsResponse = await fetchWithTimeout(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest',
      {
        headers: {
          'Accept': 'application/json'
        }
      },
      15000 // 15 second timeout
    );
    
    if (!newsResponse.ok) {
      throw new Error(`CryptoCompare API error: ${newsResponse.status}`);
    }
    
    const newsData = await newsResponse.json();
    
    // Safely handle API response - Data may be undefined or not an array
    const rawData = newsData?.Data;
    const allArticles = Array.isArray(rawData) ? rawData : [];
    
    console.log(`Found ${allArticles.length} articles from CryptoCompare (raw type: ${typeof rawData})`);
    
    // Filter articles from last 24 hours
    const twentyFourHoursAgo = Date.now() / 1000 - (24 * 60 * 60);
    const recentArticles = allArticles.filter((article: any) => 
      article.published_on >= twentyFourHoursAgo
    );
    
    console.log(`Filtered to ${recentArticles.length} articles from last 24 hours`);
    
    // Take 1 most recent article (runs every 2 hours for ~12 articles/day)
    const topArticles = recentArticles.slice(0, 1);
    const today = getSwedishDate();
    
    let savedCount = 0;
    let processedCount = 0;
    
    for (const article of topArticles) {
      processedCount++;
      
      try {
        // Generate Swedish content using AI with retry
        const aiResult = await callAIWithRetry(lovableApiKey, article);
        
        if (!aiResult) {
          console.error(`Skipping article after AI failures: ${article.title}`);
          continue;
        }
        
        const { title: swedishTitle, summary, fullContent } = aiResult;
        
        // Validation
        if (!swedishTitle || swedishTitle === article.title) {
          console.error(`Skipping article - title is empty or still English: ${article.title}`);
          continue;
        }
        
        if (!summary || summary.includes('```') || summary.length < 20) {
          console.error(`Skipping article - invalid summary for: ${swedishTitle}`);
          continue;
        }
        
        if (!fullContent || fullContent.includes('```') || fullContent.length < 100) {
          console.error(`Skipping article - invalid full_content for: ${swedishTitle}`);
          continue;
        }
        
        // Save to database
        const { error: insertError } = await supabase
          .from('news')
          .upsert({
            title: swedishTitle,
            summary: summary,
            full_content: fullContent,
            source_url: article.url || article.guid,
            image_url: article.imageurl || null,
            date: today
          }, {
            onConflict: 'title',
            ignoreDuplicates: true
          });
        
        if (insertError) {
          console.error('Error inserting news:', insertError);
        } else {
          console.log(`Saved article ${savedCount + 1}: ${swedishTitle.substring(0, 50)}...`);
          savedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }
    
    console.log(`Successfully saved ${savedCount} of ${topArticles.length} articles`);
    
    // Log completion
    await logScrapeAttempt(supabase, 'completed', topArticles.length, savedCount);
    
    // Clean up old news (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { error: deleteError } = await supabase
      .from('news')
      .delete()
      .lt('date', thirtyDaysAgo.toISOString().split('T')[0]);
    
    if (deleteError) {
      console.error('Error cleaning old news:', deleteError);
    }
    
    // Clean up old logs (keep last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    await supabase
      .from('news_scrape_log')
      .delete()
      .lt('date', fourteenDaysAgo.toISOString().split('T')[0]);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        attemptNumber,
        articlesProcessed: topArticles.length,
        articlesSaved: savedCount,
        message: `News scraping completed - saved ${savedCount} of ${topArticles.length} articles` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in scrape-crypto-news function:', error);
    
    // Log failure
    await logScrapeAttempt(
      supabase, 
      'failed', 
      0, 
      0, 
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
