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
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('type', 'daily')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Report | null;
    },
    retry: 1,
  });
};

export const useMarketMovers = () => {
  return useQuery({
    queryKey: ['market-movers'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('market_movers')
        .select('*')
        .eq('date', today)
        .order('price_change', { ascending: false });
      
      if (error) throw error;
      return data as MarketMover[];
    },
    retry: 1,
  });
};

export const useReports = (type?: 'daily' | 'weekly') => {
  return useQuery({
    queryKey: ['reports', type],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('date', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Report[];
    },
    retry: 1,
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
