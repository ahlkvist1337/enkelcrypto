import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DailyReport } from "@/components/DailyReport";
import { MarketOverview } from "@/components/MarketOverview";
import { WinnersLosers } from "@/components/WinnersLosers";
import { NewsSection } from "@/components/NewsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DailyReport />
          <MarketOverview />
          <WinnersLosers />
          <NewsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
