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
    
    // Take top 10 most recent articles
    const topArticles = allArticles.slice(0, 10);
    
    // Generate AI summaries for each article
    const today = new Date().toISOString().split('T')[0];
    
    for (const article of topArticles) {
      try {
        // Generate a concise summary using AI
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
                content: 'Du är en nyhetsredaktör som skriver korta, sakliga sammanfattningar av krypto-nyheter på svenska. Håll dig till fakta från källan.'
              },
              {
                role: 'user',
                content: `Sammanfatta denna nyhet i 2-3 meningar på svenska:\n\nTitel: ${article.title}\n\nInnehåll: ${article.body}`
              }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error('AI API error:', aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const summary = aiData.choices[0].message.content;
        
        // Save to database (upsert to avoid duplicates)
        const { error: insertError } = await supabase
          .from('news')
          .upsert({
            title: article.title,
            summary: summary,
            full_content: article.body,
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
          console.log(`Saved article: ${article.title}`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }
    
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
        message: 'News scraping completed successfully' 
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

