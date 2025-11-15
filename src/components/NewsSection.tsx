import { Card } from "@/components/ui/card";

interface NewsItem {
  title: string;
  summary: string;
  time: string;
}

const mockNews: NewsItem[] = [
  {
    title: "Stora företag ökar sina Bitcoin-innehav",
    summary: "Flera börsnoterade företag rapporterar ökade investeringar i Bitcoin som del av sin treasury-strategi.",
    time: "2 timmar sedan",
  },
  {
    title: "Ny reglering föreslås i EU",
    summary: "Europeiska kommissionen presenterar förslag på ytterligare reglering av kryptomarknaden.",
    time: "5 timmar sedan",
  },
  {
    title: "DeFi-plattformar ser ökad tillväxt",
    summary: "Decentraliserade finansplattformar rapporterar rekordaktivitet med över 100 miljarder dollar låsta.",
    time: "8 timmar sedan",
  },
];

export const NewsSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Senaste Nyheterna</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockNews.map((news, index) => (
          <Card key={index} className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{news.time}</p>
              <h3 className="font-semibold text-foreground leading-tight">{news.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{news.summary}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
