import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify user and check admin role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
      
      // Server-side input validation
      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid name: must be 1-100 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!url || typeof url !== 'string' || url.trim().length === 0 || url.length > 500) {
        return new Response(JSON.stringify({ error: 'Invalid URL: must be 1-500 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate URL format
      if (!/^https?:\/\/.+/.test(url)) {
        return new Response(JSON.stringify({ error: 'Invalid URL: must start with http:// or https://' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (description && (typeof description !== 'string' || description.length > 500)) {
        return new Response(JSON.stringify({ error: 'Invalid description: must be max 500 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
      
      // Validate ID
      if (!id || typeof id !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate name
      if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
        return new Response(JSON.stringify({ error: 'Invalid name: must be 1-100 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate URL
      if (url !== undefined) {
        if (typeof url !== 'string' || url.trim().length === 0 || url.length > 500) {
          return new Response(JSON.stringify({ error: 'Invalid URL: must be 1-500 characters' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (!/^https?:\/\/.+/.test(url)) {
          return new Response(JSON.stringify({ error: 'Invalid URL: must start with http:// or https://' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // Validate description
      if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
        return new Response(JSON.stringify({ error: 'Invalid description: must be max 500 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
    
    // Toggle affiliate link active status
    if (action === 'toggle-affiliate-link' && req.method === 'PATCH') {
      const { id, active } = await req.json();
      
      console.log('Toggling affiliate link:', id, 'to active:', active);
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (typeof active !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Active must be a boolean' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .update({ active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Toggle error:', error);
        throw error;
      }
      
      console.log('Successfully toggled affiliate link:', id);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Delete affiliate link
    if (action === 'delete-affiliate-link' && req.method === 'DELETE') {
      const { id } = await req.json();
      
      console.log('Deleting affiliate link:', id);
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Successfully deleted affiliate link:', id);
      
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
        headers: { Authorization: authHeader },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('generate-daily-report failed:', response.status, result);
        return new Response(JSON.stringify({ error: result.error || 'Report generation failed' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
