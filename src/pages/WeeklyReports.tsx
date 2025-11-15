import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeeklyReport {
  id: number;
  weekStart: string;
  weekEnd: string;
  title: string;
  excerpt: string;
}

const mockWeeklyReports: WeeklyReport[] = [
  {
    id: 1,
    weekStart: new Date(Date.now() - 6 * 86400000).toLocaleDateString("sv-SE", { day: "numeric", month: "long" }),
    weekEnd: new Date().toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" }),
    title: "Veckans Kryptorapport",
    excerpt: "En vecka präglad av stark tillväxt för Bitcoin och ökad institutionell aktivitet. Altcoins visar blandad utveckling...",
  },
  {
    id: 2,
    weekStart: new Date(Date.now() - 13 * 86400000).toLocaleDateString("sv-SE", { day: "numeric", month: "long" }),
    weekEnd: new Date(Date.now() - 7 * 86400000).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" }),
    title: "Veckans Kryptorapport",
    excerpt: "Konsolideringsvecka där marknaden andas efter tidigare uppgång. Fokus på regulatoriska nyheter från USA och EU...",
  },
];

const WeeklyReports = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Veckorapporter
              </h1>
              <p className="text-muted-foreground">
                Djupare analyser och sammanfattningar av veckans händelser på kryptomarknaden
              </p>
            </div>

            <div className="space-y-4">
              {mockWeeklyReports.map((report) => (
                <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        Veckorapport
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {report.weekStart} - {report.weekEnd}
                      </span>
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

export default WeeklyReports;
