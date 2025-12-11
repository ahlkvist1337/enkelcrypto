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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if request is from an authenticated admin (optional for cron jobs)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Forbidden - Admin access required' }),
            { 
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }
    
    console.log('Starting crypto news scraping...');
    
    // Fetch news from CryptoCompare Free API (no API key needed)
    const newsResponse = await fetch(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!newsResponse.ok) {
      throw new Error(`CryptoCompare API error: ${newsResponse.status}`);
    }
    
    const newsData = await newsResponse.json();
    const allArticles = newsData.Data || [];
    
    console.log(`Found ${allArticles.length} articles from CryptoCompare`);
    
    // Filter articles from last 24 hours
    const twentyFourHoursAgo = Date.now() / 1000 - (24 * 60 * 60);
    const recentArticles = allArticles.filter((article: any) => 
      article.published_on >= twentyFourHoursAgo
    );
    
    console.log(`Filtered to ${recentArticles.length} articles from last 24 hours`);
    
    // Take 5 most recent articles (4 runs/day = ~20 articles/day)
    const topArticles = recentArticles.slice(0, 5);
    
    // Generate AI summaries for each article
    const today = new Date().toISOString().split('T')[0];
    
    let savedCount = 0;
    
    for (const article of topArticles) {
      try {
        // Generate Swedish title, short summary, and full content using AI
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
        });

        if (!aiResponse.ok) {
          console.error('AI API error:', aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;
        
        // Parse JSON response with robust cleaning
        let swedishTitle = '';
        let summary = '';
        let fullContent = '';
        
        try {
          // Remove any markdown code blocks (various formats)
          let cleanContent = aiContent
            .replace(/^```(?:json|JSON)?\s*\n?/gm, '')
            .replace(/\n?```\s*$/gm, '')
            .replace(/^`+|`+$/g, '')
            .trim();
          
          const parsed = JSON.parse(cleanContent);
          swedishTitle = parsed.title || '';
          summary = parsed.summary || '';
          fullContent = parsed.full_content || '';
        } catch (e) {
          console.error(`Failed to parse AI JSON for article: ${article.title}`);
          console.error('Raw AI response:', aiContent.substring(0, 200));
          // Skip this article instead of saving corrupt data
          continue;
        }
        
        // Validation: Ensure we have valid Swedish content
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
        
        // Save to database (upsert to avoid duplicates)
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
          console.log(`Saved article: ${swedishTitle}`);
          savedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }
    
    console.log(`Successfully saved ${savedCount} of ${topArticles.length} articles`);
    
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

