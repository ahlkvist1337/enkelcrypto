import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  full_content: string | null;
  source_url: string | null;
  image_url: string | null;
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
        .limit(6);

      if (error) throw error;
      return data as NewsItem[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};