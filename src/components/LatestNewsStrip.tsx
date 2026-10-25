import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/useNews";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Nyss";
  if (h < 24) return `För ${h} ${h === 1 ? "timme" : "timmar"} sedan`;
  const d = Math.floor(h / 24);
  return `För ${d} ${d === 1 ? "dag" : "dagar"} sedan`;
};

export const LatestNewsStrip = () => {
  const { data, isLoading } = useNews();
  const items = (data || []).slice(0, 3);

  if (!isLoading && items.length === 0) return null;

  return (
    <section aria-label="Senaste nytt" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
          <Newspaper className="h-4 w-4" /> Senaste nytt
        </h2>
        <Link to="/arkiv?tab=nyheter" className="text-sm text-muted-foreground hover:text-primary">
          Alla nyheter
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))
          : items.map((item) => (
              <Link key={item.id} to={`/nyhet/${item.slug}`} className="group">
                <Card className="p-4 h-full flex flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all">
                  <span className="text-xs text-muted-foreground">{timeAgo(item.created_at || item.date)}</span>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="mt-auto text-xs font-medium text-primary inline-flex items-center gap-1">
                    Läs <ArrowRight className="h-3 w-3" />
                  </span>
                </Card>
              </Link>
            ))}
      </div>
    </section>
  );
};
