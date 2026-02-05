import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { NewsArchiveSection } from "@/components/NewsArchiveSection";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useReports } from "@/hooks/useCryptoData";
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REPORTS_PER_PAGE = 10;

const Archive = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "rapporter";
  
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useReports('daily', REPORTS_PER_PAGE, offset);

  const reports = data?.reports || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = offset + REPORTS_PER_PAGE < totalCount;

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const getSeoTitle = () => {
    return activeTab === "nyheter" ? "Nyhetsarkiv" : "Rapportarkiv";
  };

  const getSeoDescription = () => {
    return activeTab === "nyheter" 
      ? "Utforska tidigare kryptonyheter från EnkelCrypto. Håll dig uppdaterad om de senaste händelserna inom Bitcoin, Ethereum och kryptomarknaden."
      : "Utforska tidigare dagliga kryptorapporter från EnkelCrypto. Få insikter om marknadsutveckling och historiska prisrörelser för Bitcoin och Ethereum.";
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + REPORTS_PER_PAGE);
  };

  return (
    <>
      <SEOHead 
        title={getSeoTitle()}
        description={getSeoDescription()}
        canonical={`https://enkelcrypto.se/arkiv${activeTab !== "rapporter" ? `?tab=${activeTab}` : ""}`}
      />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Arkiv
              </h1>
              <p className="text-muted-foreground">
                Tidigare rapporter och nyheter om kryptomarknaden
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="rapporter">Rapporter</TabsTrigger>
                <TabsTrigger value="nyheter">Nyheter</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rapporter">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error instanceof Error && error.message === 'Request timeout'
                        ? 'Anslutningen tog för lång tid. Kontrollera din internetanslutning och försök igen.'
                        : 'Det gick inte att ladda rapporter. Vänligen försök igen om en stund.'}
                    </AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
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
                      <>
                        {reports.map((report) => (
                      <Link key={report.id} to={`/rapport/${report.type}/${report.date}`}>
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
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
                              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                {report.title}
                              </h2>
                              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                {report.content}
                              </p>
                              <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                                Läs rapporten <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </Card>
                      </Link>
                        ))}
                        
                        {hasMore && (
                          <div className="flex flex-col items-center gap-2 py-6">
                            <Button
                              onClick={handleLoadMore}
                              disabled={isLoading}
                              variant="outline"
                              size="lg"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Laddar...
                                </>
                              ) : (
                                `Ladda fler (${totalCount - offset - REPORTS_PER_PAGE} kvar)`
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-12">
                        Inga rapporter tillgängliga ännu.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="nyheter">
                <NewsArchiveSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Archive;
