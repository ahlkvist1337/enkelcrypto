import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { Loader2, AlertCircle } from "lucide-react";
import { useReports } from "@/hooks/useCryptoData";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WeeklyReports = () => {
  const { data, isLoading, error } = useReports('weekly');
  
  const reports = data?.reports || [];

  return (
    <>
      <SEOHead 
        title="Veckorapporter"
        description="Djupare analyser och sammanfattningar av veckans kryptohändelser. Få en helhetsbild av marknadstrender och viktiga händelser på kryptomarknaden."
        canonical="https://enkelcrypto.se/veckorapporter"
      />
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

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error && error.message === 'Request timeout'
                    ? 'Anslutningen tog för lång tid. Kontrollera din internetanslutning och försök igen.'
                    : 'Det gick inte att ladda veckorapporter. Vänligen försök igen om en stund.'}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-8 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
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
                          <ShareButtons title={report.title} />
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
                  <Card className="p-12">
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground">
                        Inga veckorapporter tillgängliga ännu.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Veckorapporter genereras automatiskt varje söndag kl 18:00.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default WeeklyReports;
