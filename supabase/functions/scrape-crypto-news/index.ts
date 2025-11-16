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
    
    console.log('Starting crypto news scraping...');
    
    // Fetch recent crypto news from RSS feeds and news APIs
    const newsSearchQueries = [
      'cryptocurrency latest news',
      'bitcoin ethereum news today',
      'crypto market updates',
      'blockchain technology news'
    ];
    
    const allArticles: any[] = [];
    
    // Search for news articles using web search
    for (const query of newsSearchQueries) {
      try {
        // Use a news aggregation approach
        const searchResults = await searchCryptoNews(query);
        allArticles.push(...searchResults);
      } catch (error) {
        console.error(`Error searching for ${query}:`, error);
      }
    }
    
    console.log(`Found ${allArticles.length} articles`);
    
    // Remove duplicates based on title similarity
    const uniqueArticles = removeDuplicates(allArticles);
    console.log(`After deduplication: ${uniqueArticles.length} articles`);
    
    // Take top 10 most recent articles
    const topArticles = uniqueArticles.slice(0, 10);
    
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
                content: `Sammanfatta denna nyhet i 2-3 meningar på svenska:\n\nTitel: ${article.title}\n\nInnehåll: ${article.content}`
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
            full_content: article.content,
            source_url: article.url,
            image_url: article.image || null,
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

// Mock function to simulate news search - in production, you'd use actual news APIs
async function searchCryptoNews(query: string): Promise<any[]> {
  // This is a simplified version - in production you would:
  // 1. Use RSS feeds from crypto news sites
  // 2. Use news APIs like NewsAPI, CryptoCompare News API
  // 3. Scrape from reliable sources
  
  // For now, return mock structure that would come from real sources
  const mockSources = [
    'CoinDesk', 'CoinTelegraph', 'Decrypt', 'The Block', 'Bitcoin Magazine'
  ];
  
  const articles = [];
  const numArticles = Math.floor(Math.random() * 3) + 2; // 2-4 articles per query
  
  for (let i = 0; i < numArticles; i++) {
    articles.push({
      title: `${query} - Article ${i + 1}`,
      content: `Detailed content about ${query}. This would contain the full article text scraped from the source.`,
      url: `https://example.com/article-${Date.now()}-${i}`,
      source: mockSources[Math.floor(Math.random() * mockSources.length)],
      image: Math.random() > 0.5 ? 'https://picsum.photos/400/300' : null,
      publishedAt: new Date().toISOString()
    });
  }
  
  return articles;
}

function removeDuplicates(articles: any[]): any[] {
  const seen = new Set();
  return articles.filter(article => {
    const normalizedTitle = article.title.toLowerCase().trim();
    if (seen.has(normalizedTitle)) {
      return false;
    }
    seen.add(normalizedTitle);
    return true;
  });
}
