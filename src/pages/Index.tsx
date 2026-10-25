import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DailyReport } from "@/components/DailyReport";
import { MarketOverview } from "@/components/MarketOverview";
import { WinnersLosers } from "@/components/WinnersLosers";
import { LatestNewsStrip } from "@/components/LatestNewsStrip";
import { NewsSection } from "@/components/NewsSection";
import { AffiliateLinks } from "@/components/AffiliateLinks";
import { PriceChart } from "@/components/PriceChart";
import { DonationSection } from "@/components/DonationSection";
import { SEOHead } from "@/components/SEOHead";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useTodaysReport, useMarketMovers, useCryptoMarketData } from "@/hooks/useCryptoData";

const Index = () => {
  const { data: report, isLoading: reportLoading, isError: reportError } = useTodaysReport();
  const { data: movers, isLoading: moversLoading, isError: moversError } = useMarketMovers();
  const {
    data: marketData,
    isLoading: marketLoading,
    isError: marketError,
    error: marketErrorObj,
    refetch: refetchMarket,
  } = useCryptoMarketData();

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Kryptonyheter och marknadskurser på enkel svenska</h1>
              <p className="text-muted-foreground">Daglig sammanfattning av bitcoin, ethereum och kryptomarknaden – utan krånglig jargong.</p>
            </div>
            <LatestNewsStrip />
            <DailyReport report={report} isLoading={reportLoading && !reportError} />
            <MarketOverview
              marketData={marketData}
              isLoading={marketLoading && !marketError}
              errorMessage={marketError ? (marketErrorObj instanceof Error ? marketErrorObj.message : 'Okänt fel') : undefined}
              onRetry={marketError ? () => refetchMarket() : undefined}
            />
            <PriceChart />
            <WinnersLosers movers={movers} isLoading={moversLoading && !moversError} />
            <NewsletterSignup />
            <AffiliateLinks />
            <NewsSection />
            <DonationSection />
          </div>
        </main>
        <Footer />
        <OfflineIndicator />
      </div>
    </>
  );
};

export default Index;
