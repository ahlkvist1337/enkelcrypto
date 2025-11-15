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
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    // Get affiliate links
    if (action === 'get-affiliate-links' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Add affiliate link
    if (action === 'add-affiliate-link' && req.method === 'POST') {
      const { name, url, description } = await req.json();
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert({ name, url, description })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Update affiliate link
    if (action === 'update-affiliate-link' && req.method === 'PUT') {
      const { id, name, url, description, active } = await req.json();
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .update({ name, url, description, active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Delete affiliate link
    if (action === 'delete-affiliate-link' && req.method === 'DELETE') {
      const { id } = await req.json();
      
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get site settings
    if (action === 'get-settings' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Update site setting
    if (action === 'update-setting' && req.method === 'PUT') {
      const { key, value } = await req.json();
      
      const { data, error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Trigger report generation manually
    if (action === 'generate-report' && req.method === 'POST') {
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-daily-report`, {
        headers: { Authorization: `Bearer ${supabaseKey}` },
      });
      
      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
