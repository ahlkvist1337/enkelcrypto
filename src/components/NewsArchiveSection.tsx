import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useNewsArchive, NewsItem } from "@/hooks/useNews";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const NEWS_PER_PAGE = 10;

export const NewsArchiveSection = () => {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useNewsArchive(NEWS_PER_PAGE, offset);

  const news = data?.news || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = offset + NEWS_PER_PAGE < totalCount;

  const handleLoadMore = () => {
    setOffset(prev => prev + NEWS_PER_PAGE);
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error && error.message === 'Request timeout'
              ? 'Anslutningen tog för lång tid. Kontrollera din internetanslutning och försök igen.'
              : 'Det gick inte att ladda nyheter. Vänligen försök igen om en stund.'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {news && news.length > 0 ? (
            <>
              {news.map((item) => (
                <Link key={item.id} to={`/nyhet/${item.slug}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex gap-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-24 w-24 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
                          Nyhet
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("sv-SE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                      <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                        Läs mer <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
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
                      `Ladda fler (${totalCount - offset - NEWS_PER_PAGE} kvar)`
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              Inga nyheter tillgängliga ännu.
            </p>
          )}
        </div>
      )}
    </>
  );
};
