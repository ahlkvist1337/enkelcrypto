import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ReportDetail = () => {
  const { date, type = "daily" } = useParams<{ date: string; type?: string }>();
  
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', type, date],
    queryFn: async () => {
      if (!date) throw new Error('No date provided');
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('date', date)
        .eq('type', type)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });

  const formatContent = (content: string) => {
    return content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  const formattedDate = date ? new Date(date).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : '';

  const reportUrl = `https://enkelcrypto.se/rapport/${type}/${date}`;
  const isWeekly = type === 'weekly';
  const backLink = isWeekly ? '/veckorapporter' : '/arkiv';
  const backText = isWeekly ? 'Tillbaka till veckorapporter' : 'Tillbaka till arkivet';

  return (
    <>
      <SEOHead 
        title={report?.title || `Kryptorapport ${formattedDate}`}
        description={report?.content?.slice(0, 155) + '...' || `Läs kryptorapport från ${formattedDate} på EnkelCrypto.`}
        canonical={reportUrl}
        type="article"
        publishedTime={report?.created_at}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link to={backLink}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {backText}
                </Link>
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Det gick inte att ladda rapporten. Vänligen försök igen.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <Card className="p-6 md:p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                </Card>
              ) : !report ? (
                <Card className="p-6 md:p-8">
                  <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">
                      Rapport hittades inte
                    </h1>
                    <p className="text-muted-foreground">
                      Det finns ingen {isWeekly ? 'veckorapport' : 'daglig rapport'} för {formattedDate}.
                    </p>
                    <Button asChild>
                      <Link to={backLink}>
                        {backText}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 md:p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={isWeekly 
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-primary/10 text-primary border-primary/20"
                          }
                        >
                          {isWeekly ? 'Veckorapport' : 'Daglig rapport'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formattedDate}
                        </span>
                      </div>
                      <ShareButtons title={report.title} url={reportUrl} />
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {report.title}
                    </h1>

                    <div className="prose prose-slate max-w-none">
                      <div 
                        className="text-foreground/90 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatContent(report.content) }}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ReportDetail;
