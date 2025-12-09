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
    
    // Check admin authorization
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
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
      }
    }
    
    // Get parameters from request (ignore offset from request, use DB progress)
    const { batchSize = 10 } = await req.json().catch(() => ({}));
    
    // Get current progress from database
    const { data: progressData } = await supabase
      .from('migration_progress')
      .select('*')
      .eq('migration_name', 'news_translations')
      .single();
    
    // Check if migration is complete
    if (progressData?.is_complete) {
      console.log('Migration already complete!');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Migration already complete',
          isComplete: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const currentOffset = progressData?.current_offset || 0;
    console.log(`Starting news translation update. Batch size: ${batchSize}, Offset: ${currentOffset}`);
    
    // Get total count of news
    const { count: totalCount } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total news articles: ${totalCount}`);
    
    // Fetch batch of news to update
    const { data: newsToUpdate, error: fetchError } = await supabase
      .from('news')
      .select('id, title, summary, full_content, source_url')
      .order('date', { ascending: false })
      .range(currentOffset, currentOffset + batchSize - 1);
    
    if (fetchError) {
      throw new Error(`Failed to fetch news: ${fetchError.message}`);
    }
    
    if (!newsToUpdate || newsToUpdate.length === 0) {
      // Mark migration as complete
      await supabase
        .from('migration_progress')
        .update({ is_complete: true, last_run_at: new Date().toISOString() })
        .eq('migration_name', 'news_translations');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Migration complete! No more news to update.',
          processed: 0,
          totalProcessed: currentOffset,
          totalCount,
          isComplete: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${newsToUpdate.length} articles...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const news of newsToUpdate) {
      try {
        // Check if full_content already looks like Swedish (simple heuristic)
        const hasSwedishContent = news.full_content && 
          news.full_content.length > 200 && 
          (news.full_content.includes('är') || 
           news.full_content.includes('och') || 
           news.full_content.includes('för') ||
           news.full_content.includes('att'));
        
        if (hasSwedishContent) {
          console.log(`Skipping article ${news.id} - already has Swedish content`);
          successCount++;
          continue;
        }
        
        // Use existing summary as base for translation
        const contentToTranslate = news.full_content || news.summary || news.title;
        
        console.log(`Translating article: ${news.title.substring(0, 50)}...`);
        
        // Generate full Swedish content using AI
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

Baserat på den givna informationen, skriv en fullständig nyhetsartikel på svenska.

Svara ENDAST med JSON i exakt detta format (ingen annan text):
{
  "full_content": "En fullständig artikel på svenska med 3-5 stycken (200-400 ord). Förklara bakgrunden, vad som hänt, varför det är viktigt och vad det kan betyda för marknaden. Separera stycken med dubbla radbrytningar (\\n\\n)."
}`
              },
              {
                role: 'user',
                content: `Skriv en fullständig svensk nyhetsartikel baserat på:\n\nRubrik: ${news.title}\n\nSammanfattning: ${news.summary}\n\nOriginal innehåll: ${contentToTranslate}`
              }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for article ${news.id}: ${aiResponse.status}`);
          errorCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;
        
        // Parse JSON response
        let fullContent = '';
        try {
          let cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleanContent);
          fullContent = parsed.full_content || '';
        } catch (e) {
          console.log(`Failed to parse AI JSON for article ${news.id}, using raw content`);
          fullContent = aiContent;
        }
        
        if (!fullContent || fullContent.length < 100) {
          console.error(`Generated content too short for article ${news.id}`);
          errorCount++;
          continue;
        }
        
        // Update the news article
        const { error: updateError } = await supabase
          .from('news')
          .update({ full_content: fullContent })
          .eq('id', news.id);
        
        if (updateError) {
          console.error(`Error updating news ${news.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Updated article ${news.id}`);
          successCount++;
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Error processing article ${news.id}:`, error);
        errorCount++;
      }
    }
    
    const nextOffset = currentOffset + batchSize;
    const hasMore = nextOffset < (totalCount || 0);
    
    // Update progress in database
    await supabase
      .from('migration_progress')
      .update({ 
        current_offset: nextOffset, 
        total_count: totalCount,
        last_run_at: new Date().toISOString(),
        is_complete: !hasMore
      })
      .eq('migration_name', 'news_translations');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed ${newsToUpdate.length} articles`,
        processed: newsToUpdate.length,
        successCount,
        errorCount,
        totalProcessed: nextOffset,
        totalCount,
        hasMore,
        nextOffset: hasMore ? nextOffset : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-news-translations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
