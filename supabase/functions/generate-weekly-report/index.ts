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
    
    console.log('Starting weekly report generation...');
    
    // Check if today is Sunday (0 = Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek !== 0) {
      console.log('Not Sunday, skipping weekly report generation');
      return new Response(
        JSON.stringify({ message: 'Weekly reports are only generated on Sundays' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Check if report already exists for this week
    const todayStr = today.toISOString().split('T')[0];
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('type', 'weekly')
      .eq('date', todayStr)
      .maybeSingle();
    
    if (existingReport) {
      console.log('Weekly report already exists for this week, skipping generation');
      return new Response(
        JSON.stringify({ message: 'Weekly report already exists for this week' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Fetch crypto data
    const cryptoDataResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-crypto-data`, {
      headers: { Authorization: `Bearer ${supabaseKey}` },
    });
    
    if (!cryptoDataResponse.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    const cryptoData = await cryptoDataResponse.json();
    
    // Get date range for the week
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Fetch last week's market movers for trend analysis
    const { data: weekMovers } = await supabase
      .from('market_movers')
      .select('*')
      .gte('date', oneWeekAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    // Prepare data summary for AI
    const dataSummary = `
Veckoöversikt ${oneWeekAgo.toLocaleDateString('sv-SE')} - ${today.toLocaleDateString('sv-SE')}:

NUVARANDE LÄGE:
Bitcoin: ${cryptoData.bitcoin.price.toLocaleString('sv-SE')} SEK (${cryptoData.bitcoin.change24h.toFixed(2)}% på 24h)
Ethereum: ${cryptoData.ethereum.price.toLocaleString('sv-SE')} SEK (${cryptoData.ethereum.change24h.toFixed(2)}% på 24h)
Total marknadskapital: ${(cryptoData.marketCap / 1_000_000_000_000).toFixed(2)} biljoner SEK
BTC-dominans: ${cryptoData.btcDominance.toFixed(1)}%

VECKANS TOPPVINNARE:
${cryptoData.gainers.slice(0, 5).map((g: any, i: number) => `${i+1}. ${g.name} (${g.symbol}): +${g.priceChange.toFixed(2)}%`).join('\n')}

VECKANS FÖRLORARE:
${cryptoData.losers.slice(0, 5).map((l: any, i: number) => `${i+1}. ${l.name} (${l.symbol}): ${l.priceChange.toFixed(2)}%`).join('\n')}

HISTORISKA RÖRELSER UNDER VECKAN:
${weekMovers ? weekMovers.slice(0, 10).map((m: any) => `${m.date}: ${m.coin_name} (${m.ticker}): ${m.price_change > 0 ? '+' : ''}${m.price_change.toFixed(2)}%`).join('\n') : 'Ingen data tillgänglig'}
`;

    console.log('Generating AI weekly report...');
    
    // Fetch affiliate links to include in report
    const { data: affiliateLinks } = await supabase
      .from('affiliate_links')
      .select('name, url')
      .eq('active', true)
      .limit(3);
    
    const affiliateText = affiliateLinks && affiliateLinks.length > 0
      ? `\n\nTillgängliga handelsplattformar:\n${affiliateLinks.map(link => `- ${link.name}: ${link.url}`).join('\n')}`
      : '';
    
    // Generate report with AI
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
            content: `Du är en kunnig, lugn kryptomarknadssummariserare för EnkelCrypto. Din uppgift är att skriva veckorapporter på enkel svenska som analyserar vad som hänt under veckan och vad som kan hända framöver.

VIKTIG TON OCH STIL:
- Skriv som en kunnig, lugn kompis som förklarar läget
- INTE som en trader eller finansiell rådgivare
- Saklig, neutral och förklarande ton
- Enkla ord, inga komplicerade termer
- Längre än dagliga rapporter - ca 600-800 ord
- Skriv löpande text i stycken, undvik punktlistor och numrerade listor
- Använd ALDRIG asterisker (*), hashtags (#) eller andra markdown-formatteringar
- Skriv naturligt flytande text som en artikel

STRUKTUR (men skriv det som naturlig text, inte som listor):
Börja med en sammanfattning av veckan som gått. Analysera sedan huvudsakliga trender för Bitcoin, Ethereum och altcoins. Förklara vad som drivit marknaden under veckan.

Gå sedan in på potentiella vinnare. För kortsiktigt (1-2 veckor) - nämn 3 coins som är intressanta baserat på momentum och tekniska faktorer. För långsiktigt (3-6 månader) - nämn 2 projekt som är värda att följa baserat på fundamenta och utveckling. Integrera dessa naturligt i texten, beskriv varför de är intressanta utan att använda punktlistor.

Avsluta med vad som är värt att hålla koll på kommande vecka, och slutligen: "Detta är en analys av nuläget. Kom ihåg att kryptomarknaden är extremt volatil och detta är inte finansiell rådgivning. Gör alltid din egen research."

VIKTIGT: 
- Använd ALDRIG ord som "investera", "köp", "sälj", "rekommenderar"
- Använd istället: "intressant att följa", "värd att hålla koll på", "spännande utveckling"
- Skriv som en tidningsartikel med flytande stycken, inte som en lista
- UNDVIK alla former av formattering som *, #, eller numrerade punkter
- Var specifik med varför en coin är intressant (tekniska faktorer, fundamenta, nyheter)`
          },
          {
            role: 'user',
            content: `Skriv veckans kryptorapport baserat på denna data:\n\n${dataSummary}${affiliateText}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reportContent = aiData.choices[0].message.content;
    
    console.log('Saving weekly report to database...');
    
    // Save report
    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        title: `Veckorapport ${oneWeekAgo.toLocaleDateString('sv-SE')} - ${today.toLocaleDateString('sv-SE')}`,
        content: reportContent,
        type: 'weekly',
        date: today.toISOString().split('T')[0],
      });

    if (reportError) {
      console.error('Error saving report:', reportError);
      throw reportError;
    }
    
    console.log('Weekly report generation complete!');
    
    return new Response(JSON.stringify({ success: true, content: reportContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in weekly report generation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
