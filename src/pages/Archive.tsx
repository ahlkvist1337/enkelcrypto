import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { Loader2, AlertCircle } from "lucide-react";
import { useReports, Report } from "@/hooks/useCryptoData";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REPORTS_PER_PAGE = 10;

const Archive = () => {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useReports('daily', REPORTS_PER_PAGE, offset);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const reports = data?.reports || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = offset + REPORTS_PER_PAGE < totalCount;

  const handleLoadMore = () => {
    setOffset(prev => prev + REPORTS_PER_PAGE);
  };

  const formatContent = (content: string) => {
    // Convert **text** to <strong>text</strong> for bold formatting
    return content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <>
      <SEOHead 
        title="Rapportarkiv"
        description="Utforska tidigare dagliga kryptorapporter från EnkelCrypto. Få insikter om marknadsutveckling och historiska prisrörelser för Bitcoin och Ethereum."
        canonical="https://enkelcrypto.se/arkiv"
      />
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
                      <Card 
                        key={report.id} 
                        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
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
            
            <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <div className="space-y-4">
                    <DialogTitle className="text-2xl">{selectedReport?.title}</DialogTitle>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <DialogDescription>
                        {selectedReport && new Date(selectedReport.date).toLocaleDateString("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </DialogDescription>
                      {selectedReport && <ShareButtons title={selectedReport.title} url={`https://enkelcrypto.se/rapport/daily/${selectedReport.date}`} />}
                    </div>
                  </div>
                </DialogHeader>
                <div className="mt-4 prose prose-gray dark:prose-invert max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedReport ? formatContent(selectedReport.content) : '' }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Archive;
