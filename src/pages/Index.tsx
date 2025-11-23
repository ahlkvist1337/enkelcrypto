import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DailyReport } from "@/components/DailyReport";
import { MarketOverview } from "@/components/MarketOverview";
import { WinnersLosers } from "@/components/WinnersLosers";
import { NewsSection } from "@/components/NewsSection";
import { AffiliateLinks } from "@/components/AffiliateLinks";
import { useTodaysReport, useMarketMovers, useCryptoMarketData } from "@/hooks/useCryptoData";

const Index = () => {
  const { data: report, isLoading: reportLoading } = useTodaysReport();
  const { data: movers, isLoading: moversLoading } = useMarketMovers();
  const { data: marketData, isLoading: marketLoading } = useCryptoMarketData();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DailyReport report={report} isLoading={reportLoading} />
          <MarketOverview marketData={marketData} isLoading={marketLoading} />
          <WinnersLosers movers={movers} isLoading={moversLoading} />
          <AffiliateLinks />
          <NewsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
