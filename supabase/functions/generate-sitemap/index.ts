 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   "Content-Type": "application/xml; charset=utf-8",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     const baseUrl = "https://enkelcrypto.se";
     const today = new Date().toISOString().split("T")[0];
 
     // Fetch all news
      const { data: news, error: newsError } = await supabase
        .from("news")
        .select("id, slug, date, created_at")
        .order("date", { ascending: false });
 
     if (newsError) {
       console.error("Error fetching news:", newsError);
       throw newsError;
     }
 
     // Fetch all reports
     const { data: reports, error: reportsError } = await supabase
       .from("reports")
       .select("id, date, type, created_at")
       .order("date", { ascending: false });
 
     if (reportsError) {
       console.error("Error fetching reports:", reportsError);
       throw reportsError;
     }
 
     // Build sitemap XML
     let xml = `<?xml version="1.0" encoding="UTF-8"?>
 <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
   <!-- Static pages -->
   <url>
     <loc>${baseUrl}/</loc>
     <lastmod>${today}</lastmod>
     <changefreq>daily</changefreq>
     <priority>1.0</priority>
   </url>
   <url>
     <loc>${baseUrl}/arkiv</loc>
     <lastmod>${today}</lastmod>
     <changefreq>daily</changefreq>
     <priority>0.8</priority>
   </url>
   <url>
     <loc>${baseUrl}/arkiv?tab=nyheter</loc>
     <lastmod>${today}</lastmod>
     <changefreq>daily</changefreq>
     <priority>0.8</priority>
   </url>
   <url>
     <loc>${baseUrl}/veckorapporter</loc>
     <lastmod>${today}</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.8</priority>
   </url>
   <url>
     <loc>${baseUrl}/om</loc>
     <lastmod>${today}</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.6</priority>
   </url>
 `;
 
     // Add news pages
     if (news && news.length > 0) {
       for (const item of news) {
         const lastmod = item.date || item.created_at.split("T")[0];
          xml += `
    <url>
      <loc>${baseUrl}/nyhet/${item.slug || item.id}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
       }
     }
 
     // Add report pages
     if (reports && reports.length > 0) {
       for (const report of reports) {
         const lastmod = report.date || report.created_at.split("T")[0];
         xml += `
   <url>
     <loc>${baseUrl}/rapport/${report.type}/${report.date}</loc>
     <lastmod>${lastmod}</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.7</priority>
   </url>`;
       }
     }
 
     xml += `
 </urlset>`;
 
     console.log(`Generated sitemap with ${(news?.length || 0) + (reports?.length || 0) + 5} URLs`);
 
     return new Response(xml, {
       headers: corsHeaders,
       status: 200,
     });
   } catch (error) {
     console.error("Error generating sitemap:", error);
     return new Response(
       `<?xml version="1.0" encoding="UTF-8"?>
 <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
     <loc>https://enkelcrypto.se/</loc>
     <changefreq>daily</changefreq>
     <priority>1.0</priority>
   </url>
 </urlset>`,
       {
         headers: corsHeaders,
         status: 200,
       }
     );
   }
 });