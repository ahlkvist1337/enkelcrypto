import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketMover {
  id: string;
  date: string;
  coin_name: string;
  ticker: string;
  price_change: number;
  type: 'winner' | 'loser';
  ai_comment: string | null;
}

export interface Report {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  title: string;
  content: string;
  created_at: string;
}

export const useTodaysReport = () => {
  return useQuery({
    queryKey: ['todays-report'],
    queryFn: async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = (async () => {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('type', 'daily')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        return data as Report | null;
      })();

      return Promise.race([queryPromise, timeoutPromise]) as Promise<Report | null>;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useMarketMovers = () => {
  return useQuery({
    queryKey: ['market-movers'],
    queryFn: async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = (async () => {
        // Get the latest available date from market_movers
        const { data: latestData, error: latestError } = await supabase
          .from('market_movers')
          .select('date')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (latestError) throw latestError;
        if (!latestData) return [];
        
        // Fetch all movers for the latest date
        const { data, error } = await supabase
          .from('market_movers')
          .select('*')
          .eq('date', latestData.date)
          .order('price_change', { ascending: false });
        
        if (error) throw error;
        return data as MarketMover[];
      })();

      return Promise.race([queryPromise, timeoutPromise]) as Promise<MarketMover[]>;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useReports = (type?: 'daily' | 'weekly', limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ['reports', type, limit, offset],
    queryFn: async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const queryPromise = (async () => {
        let query = supabase
          .from('reports')
          .select('*', { count: 'exact' })
          .order('date', { ascending: false });
        
        if (type) {
          query = query.eq('type', type);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        if (offset) {
          query = query.range(offset, offset + (limit || 10) - 1);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        return { reports: data as Report[], totalCount: count || 0 };
      })();

      return Promise.race([queryPromise, timeoutPromise]) as Promise<{ reports: Report[], totalCount: number }>;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCryptoMarketData = () => {
  return useQuery({
    queryKey: ['crypto-market-data'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-crypto-data`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }
      
      return await response.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};
