import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Get all news with JSON formatting
    const { data: news, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .like('summary', '%```json%');

    if (fetchError) throw fetchError;

    console.log(`Found ${news?.length || 0} news items to fix`);

    let fixed = 0;
    for (const item of news || []) {
      try {
        // Remove markdown code blocks
        let cleanContent = item.summary
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // Parse JSON and extract summary
        const parsed = JSON.parse(cleanContent);
        const cleanSummary = parsed.summary || item.summary;

        // Update the record
        const { error: updateError } = await supabase
          .from('news')
          .update({ summary: cleanSummary })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Failed to update ${item.id}:`, updateError);
        } else {
          fixed++;
          console.log(`Fixed: ${item.title}`);
        }
      } catch (e) {
        console.error(`Error processing ${item.id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fixed ${fixed} of ${news?.length || 0} news items` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fix-news-json function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
