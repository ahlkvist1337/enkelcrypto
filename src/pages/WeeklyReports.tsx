import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useReports } from "@/hooks/useCryptoData";

const WeeklyReports = () => {
  const { data: reports, isLoading } = useReports('weekly');

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

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Veckorapport
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                          {report.title}
                        </h2>
                        <div className="prose prose-slate max-w-none">
                          <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {report.content}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Inga veckorapporter tillgängliga ännu.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeeklyReports;
