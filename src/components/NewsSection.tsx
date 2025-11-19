import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews, NewsItem } from "@/hooks/useNews";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

export const NewsSection = () => {
  const { data: news, isLoading } = useNews();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo < 1) {
        return "Mindre än en timme sedan";
      } else if (hoursAgo === 1) {
        return "1 timme sedan";
      } else if (hoursAgo < 24) {
        return `${hoursAgo} timmar sedan`;
      } else {
        const daysAgo = Math.floor(hoursAgo / 24);
        return daysAgo === 1 ? "1 dag sedan" : `${daysAgo} dagar sedan`;
      }
    } catch {
      return "Nyligen";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Senaste Nyheterna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Senaste Nyheterna</h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Inga nyheter tillgängliga just nu.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Senaste Nyheterna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((item) => (
            <Card 
              key={item.id} 
              className="p-5 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedNews(item)}
            >
              {item.image_url && (
                <div className="mb-3 -mx-5 -mt-5 overflow-hidden rounded-t-lg">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {getTimeAgo(item.created_at)}
                </p>
                <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">
              {selectedNews?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNews?.image_url && (
            <div className="w-full overflow-hidden rounded-lg mb-4">
              <img 
                src={selectedNews.image_url} 
                alt={selectedNews.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedNews && getTimeAgo(selectedNews.created_at)}
            </p>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedNews?.full_content || selectedNews?.summary}
              </p>
            </div>
            
            {selectedNews?.source_url && (
              <a 
                href={selectedNews.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                Läs originalkälla
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
