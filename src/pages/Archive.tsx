import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useReports } from "@/hooks/useCryptoData";

const Archive = () => {
  const { data: reports, isLoading } = useReports('daily');

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
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Daglig rapport
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {report.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {report.content}
                        </p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Inga rapporter tillgängliga ännu.
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

export default Archive;
