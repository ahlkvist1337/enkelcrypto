import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: number;
  date: string;
  title: string;
  excerpt: string;
}

const mockReports: Report[] = [
  {
    id: 1,
    date: new Date().toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" }),
    title: "Dagens Kryptorapport",
    excerpt: "Marknaden visar blandade signaler idag med Bitcoin som håller sig stabilt...",
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" }),
    title: "Dagens Kryptorapport",
    excerpt: "Stark uppgång för Bitcoin medan altcoins konsoliderar efter senaste veckans rally...",
  },
  {
    id: 3,
    date: new Date(Date.now() - 172800000).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" }),
    title: "Dagens Kryptorapport",
    excerpt: "Makroekonomiska signaler påverkar marknaden positivt, särskilt större kryptovalutor...",
  },
];

const Archive = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Rapportarkiv
              </h1>
              <p className="text-muted-foreground">
                Tidigare dagliga sammanfattningar av kryptomarknaden
              </p>
            </div>

            <div className="space-y-4">
              {mockReports.map((report) => (
                <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Daglig rapport
                      </Badge>
                      <span className="text-sm text-muted-foreground">{report.date}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {report.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {report.excerpt}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      Läs mer →
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Archive;
