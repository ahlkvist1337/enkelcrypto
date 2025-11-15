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
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('type', 'daily')
        .eq('date', today)
        .single();
      
      if (error) throw error;
      return data as Report;
    },
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
  });
};

export const useCryptoMarketData = () => {
  return useQuery({
    queryKey: ['crypto-market-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-crypto-data');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
