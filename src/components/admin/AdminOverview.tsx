import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Newspaper, FileText, TrendingUp } from "lucide-react";

async function count(table: "news" | "reports") {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

export function AdminOverview() {
  const [search, setSearch] = useState("");

  const subs = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totals = useQuery({
    queryKey: ["admin-totals"],
    queryFn: async () => ({ news: await count("news"), reports: await count("reports") }),
  });

  const list = subs.data ?? [];
  const active = list.filter((s) => s.status === "active").length;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const lastWeek = list.filter((s) => new Date(s.created_at).getTime() > weekAgo).length;
  const filtered = useMemo(
    () => list.filter((s) => s.email.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const stats = [
    { label: "Aktiva prenumeranter", value: active, icon: Mail },
    { label: "Nya senaste 7 dagarna", value: lastWeek, icon: TrendingUp },
    { label: "Nyhetsartiklar", value: totals.data?.news, icon: Newspaper },
    { label: "Rapporter", value: totals.data?.reports, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
            {value === undefined || subs.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-foreground">Prenumeranter ({list.length})</h2>
          <Input
            placeholder="Sök e-post..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
        {subs.isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : subs.error ? (
          <p className="text-sm text-destructive">Kunde inte ladda prenumeranter.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga prenumeranter ännu.</p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg max-h-96 overflow-auto">
            {filtered.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <span className="truncate text-foreground">{s.email}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("sv-SE")}
                  </span>
                  <Badge variant={s.status === "active" ? "default" : "secondary"}>
                    {s.status === "active" ? "Aktiv" : "Avregistrerad"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
