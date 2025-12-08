import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, AlertCircle, ExternalLink } from "lucide-react";
import { useNewsItem } from "@/hooks/useNews";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading, error } = useNewsItem(id || "");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDescription = (content: string) => {
    return content.substring(0, 160).replace(/\*\*/g, '') + (content.length > 160 ? '...' : '');
  };

  return (
    <>
      {news && (
        <SEOHead 
          title={news.title}
          description={getDescription(news.summary)}
          canonical={`https://enkelcrypto.se/nyhet/${id}`}
          type="article"
          publishedTime={news.date}
          ogImage={news.image_url || undefined}
        />
      )}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <Link to="/arkiv?tab=nyheter">
                <Button variant="ghost" className="mb-6 -ml-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka till nyhetsarkiv
                </Button>
              </Link>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Det gick inte att ladda nyheten. Vänligen försök igen om en stund.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <Card className="p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-3/4" />
                    <div className="space-y-2 pt-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </Card>
              ) : news ? (
                <Card className="p-8">
                  <article className="space-y-6">
                    {news.image_url && (
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-64 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
                          Nyhet
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(news.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {news.source_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={news.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Källa
                            </a>
                          </Button>
                        )}
                        <ShareButtons 
                          title={news.title} 
                          url={`https://enkelcrypto.se/nyhet/${id}`} 
                        />
                      </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {news.title}
                    </h1>
                    
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {news.full_content || news.summary}
                      </p>
                    </div>
                  </article>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nyheten kunde inte hittas.
                  </p>
                  <Link to="/arkiv?tab=nyheter">
                    <Button variant="outline" className="mt-4">
                      Gå till nyhetsarkiv
                    </Button>
                  </Link>
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

export default NewsDetail;
