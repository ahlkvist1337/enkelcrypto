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

export const useNewsArchive = (limit: number = 10, offset: number = 0) => {
  return useQuery({
    queryKey: ["news-archive", limit, offset],
    queryFn: async () => {
      // Get total count
      const { count, error: countError } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get paginated news
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

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