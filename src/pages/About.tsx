import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <>
      <SEOHead 
        title="Om EnkelCrypto"
        description="Lär dig mer om EnkelCrypto - din dagliga källa för kryptonyheter och marknadsanalyser på svenska. Enkel, tydlig information utan teknisk jargong."
        canonical="https://enkelcrypto.se/om"
      />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Om EnkelCrypto
            </h1>

            <div className="prose prose-slate max-w-none space-y-4">
              <p className="text-foreground/90 leading-relaxed">
                EnkelCrypto är din dagliga sammanfattning av kryptomarknaden på enkel svenska.
                Vi hjälper dig att hålla koll på vad som händer i kryptovärlden utan att du behöver 
                vara expert eller spendera timmar på research.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Vad gör vi?</h2>
              <p className="text-foreground/90 leading-relaxed">
                Varje dag samlar vi automatiskt marknadsdata, nyheter och trender från kryptovärlden. 
                Med hjälp av AI sammanfattar vi informationen på ett sätt som är lätt att förstå – 
                även om du är nybörjare.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Vad vi inte är</h2>
              <p className="text-foreground/90 leading-relaxed">
                Vi är inte en tradingplattform, vi ger inga köprekommendationer och vi är ingen 
                finansiell rådgivare. EnkelCrypto är en informationstjänst som presenterar läget 
                på marknaden på ett neutralt och objektivt sätt.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Viktigt att veta</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground/90">
                <li>All information på EnkelCrypto är endast för informationsändamål</li>
                <li>Inget innehåll utgör finansiell rådgivning eller investeringsrekommendationer</li>
                <li>Kryptovalutor är mycket volatila och riskfyllda investeringar</li>
                <li>Investera endast vad du har råd att förlora</li>
                <li>Gör alltid din egen research innan investeringsbeslut</li>
              </ul>

              <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Ansvarsfriskrivning</h3>
                <p className="text-sm text-muted-foreground">
                  EnkelCrypto och dess grundare tar inget ansvar för investeringsbeslut som fattas 
                  baserat på information från denna webbplats. Kryptomarknaden är oreglerad och 
                  mycket riskfylld. Du bör alltid rådfråga en kvalificerad finansiell rådgivare 
                  innan du investerar i kryptovalutor.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default About;
