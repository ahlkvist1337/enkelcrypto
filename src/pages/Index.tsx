import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DailyReport } from "@/components/DailyReport";
import { MarketOverview } from "@/components/MarketOverview";
import { WinnersLosers } from "@/components/WinnersLosers";
import { NewsSection } from "@/components/NewsSection";
import { AffiliateLinks } from "@/components/AffiliateLinks";
import { PriceChart } from "@/components/PriceChart";
import { SEOHead } from "@/components/SEOHead";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useTodaysReport, useMarketMovers, useCryptoMarketData } from "@/hooks/useCryptoData";

const Index = () => {
  const { data: report, isLoading: reportLoading, isError: reportError } = useTodaysReport();
  const { data: movers, isLoading: moversLoading, isError: moversError } = useMarketMovers();
  const { data: marketData, isLoading: marketLoading, isError: marketError } = useCryptoMarketData();

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <DailyReport report={report} isLoading={reportLoading && !reportError} />
            <MarketOverview marketData={marketData} isLoading={marketLoading && !marketError} />
            <PriceChart />
            <WinnersLosers movers={movers} isLoading={moversLoading && !moversError} />
            <AffiliateLinks />
            <NewsSection />
          </div>
        </main>
        <Footer />
        <OfflineIndicator />
      </div>
    </>
  );
};

export default Index;
