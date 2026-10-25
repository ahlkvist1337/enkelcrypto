import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  full_content: string | null;
  source_url: string | null;
  image_url: string | null;
  slug: string;
  date: string;
  created_at: string;
}

export const useNews = () => {
  return useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as NewsItem[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useNewsArchive = (limit: number = 10, offset: number = 0, search: string = "") => {
  return useQuery({
    queryKey: ["news-archive", limit, offset, search],
    queryFn: async () => {
      const term = search.trim().replace(/[%,()*]/g, " ");
      let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .order("date", { ascending: false });
      if (term) {
        query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
      }
      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;
      
      return {
        news: data as NewsItem[],
        totalCount: count || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useNewsItem = (slug: string) => {
  return useQuery({
    queryKey: ["news-item", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as NewsItem;
    },
    enabled: !!slug,
  });
};