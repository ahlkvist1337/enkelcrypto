import { useQuery } from "@tanstack/react-query";

export interface PricePoint {
  timestamp: number;
  date: string;
  price: number;
}

export const usePriceHistory = (coinId: string, days: string = '7') => {
  return useQuery({
    queryKey: ['price-history', coinId, days],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-price-history?coinId=${coinId}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      
      const result = await response.json();
      return result.data as PricePoint[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
