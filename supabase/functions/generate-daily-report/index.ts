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
    
    console.log('Starting daily report generation...');
    
    // Check if report already exists for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('type', 'daily')
      .eq('date', today)
      .maybeSingle();
    
    if (existingReport) {
      console.log('Report already exists for today, skipping generation');
      return new Response(
        JSON.stringify({ message: 'Report already exists for today' }),
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
    
    // Prepare data summary for AI
    const dataSummary = `
Marknadsöversikt ${new Date().toLocaleDateString('sv-SE')}:

Bitcoin: ${cryptoData.bitcoin.price.toLocaleString('sv-SE')} SEK (${cryptoData.bitcoin.change24h.toFixed(2)}% på 24h)
Ethereum: ${cryptoData.ethereum.price.toLocaleString('sv-SE')} SEK (${cryptoData.ethereum.change24h.toFixed(2)}% på 24h)
Total marknadskapital: ${(cryptoData.marketCap / 1_000_000_000_000).toFixed(2)} biljoner SEK
BTC-dominans: ${cryptoData.btcDominance.toFixed(1)}%

Dagens vinnare (topp 5):
${cryptoData.gainers.map((g: any, i: number) => `${i+1}. ${g.name} (${g.symbol}): +${g.priceChange.toFixed(2)}%`).join('\n')}

Dagens förlorare (topp 5):
${cryptoData.losers.map((l: any, i: number) => `${i+1}. ${l.name} (${l.symbol}): ${l.priceChange.toFixed(2)}%`).join('\n')}
`;

    console.log('Generating AI report...');
    
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
            content: `Du är en kunnig, lugn kryptomarknadssummariserare för EnkelCrypto. Din uppgift är att skriva dagliga rapporter på enkel svenska som förklarar vad som händer på kryptomarknaden. 

VIKTIG TON OCH STIL:
Skriv som en kunnig, lugn kompis som förklarar läget. INTE som en trader eller finansiell rådgivare. INTE upphetsad eller hype-drivande. Saklig, neutral och förklarande ton. Enkla ord, inga komplicerade termer. Kort och koncist, max 400-500 ord.

FORMATERING:
KRITISKT: Använd ALDRIG asterisker (*) för att formatera text. Skriv naturlig löpande text med stycken. Om du vill framhäva något viktigt, skriv det i fetstil med **text** eller använd naturlig betoning i meningsstrukturen. Använd INGA punktlistor med asterisker, INGA numrerade listor. Allt ska vara flytande text organiserad i stycken.

STRUKTUR (skriv som naturliga stycken, inte som lista):
Börja med en kort sammanfattning av dagens övergripande marknadsläge. Förklara sedan huvudsakliga rörelser för Bitcoin och Ethereum. Berätta kort om vad som driver marknaden idag.

Inkludera ett stycke om potentiella vinnare att hålla koll på:
- Välj 3 kortsiktiga (närmaste 1-2 veckorna) baserat på momentum och tekniska faktorer
- Välj 2 långsiktiga (3-6 månader) baserat på fundamenta och adoption
- Skriv det som naturlig text, till exempel: "Kortsiktigt kan det vara intressant att hålla koll på Quant (QNT) som visar god styrka idag och kan fortsätta attrahera intresse."

Avsluta alltid med: "Detta är läget just nu. Kom ihåg att kryptomarknaden är volatil och detta är inte finansiell rådgivning."

VIKTIGT: Använd aldrig ord som "investera", "köp", "sälj" - använd istället "intressant", "spännande", "hålla koll på".`
          },
          {
            role: 'user',
            content: `Skriv dagens kryptorapport baserat på denna data:\n\n${dataSummary}${affiliateText}`
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
    
    console.log('Saving report to database...');
    
    // Save report to database
    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        date: today,
        type: 'daily',
        title: `Dagens kryptorapport – ${new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        content: reportContent,
      });
    
    if (reportError) {
      console.error('Error saving report:', reportError);
      throw reportError;
    }
    
    // Generate AI comments for gainers and losers and save them
    console.log('Saving market movers...');
    
    for (const gainer of cryptoData.gainers) {
      const commentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'Du skriver mycket korta (max 10 ord), neutrala kommentarer på svenska om varför ett kryptomynt har stigit. Använd ord som "troligen", "verkar", aldrig garantier.'
            },
            {
              role: 'user',
              content: `${gainer.name} har stigit ${gainer.priceChange.toFixed(2)}%. Skriv en mycket kort kommentar om möjlig orsak.`
            }
          ],
        }),
      });
      
      const commentData = await commentResponse.json();
      const comment = commentData.choices[0].message.content;
      
      await supabase.from('market_movers').insert({
        date: today,
        coin_name: gainer.name,
        ticker: gainer.symbol,
        price_change: gainer.priceChange,
        type: 'winner',
        ai_comment: comment,
      });
    }
    
    for (const loser of cryptoData.losers) {
      const commentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'Du skriver mycket korta (max 10 ord), neutrala kommentarer på svenska om varför ett kryptomynt har fallit. Använd ord som "troligen", "verkar", aldrig garantier.'
            },
            {
              role: 'user',
              content: `${loser.name} har fallit ${loser.priceChange.toFixed(2)}%. Skriv en mycket kort kommentar om möjlig orsak.`
            }
          ],
        }),
      });
      
      const commentData = await commentResponse.json();
      const comment = commentData.choices[0].message.content;
      
      await supabase.from('market_movers').insert({
        date: today,
        coin_name: loser.name,
        ticker: loser.symbol,
        price_change: loser.priceChange,
        type: 'loser',
        ai_comment: comment,
      });
    }
    
    console.log('Daily report generation complete!');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Daily report generated successfully',
      date: today,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
