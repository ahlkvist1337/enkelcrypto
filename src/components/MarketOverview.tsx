import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketOverviewProps {
  marketData?: {
    bitcoin: { price: number; change24h: number };
    ethereum: { price: number; change24h: number };
    marketCap: number;
  };
  isLoading?: boolean;
}

export const MarketOverview = ({ marketData, isLoading }: MarketOverviewProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!marketData) return null;

  const data = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: `${marketData.bitcoin.price.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr`,
      change24h: marketData.bitcoin.change24h,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: `${marketData.ethereum.price.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr`,
      change24h: marketData.ethereum.change24h,
    },
    {
      name: "Total Market Cap",
      symbol: "",
      price: `${(marketData.marketCap / 1_000_000_000_000).toFixed(2)}T kr`,
      change24h: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((item) => (
        <Card key={item.symbol || item.name} className="p-4 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.name}</p>
                {item.symbol && (
                  <p className="text-xs text-muted-foreground">{item.symbol}</p>
                )}
              </div>
              {item.change24h !== 0 && (
                <>
                  {item.change24h > 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{item.price}</p>
              {item.change24h !== 0 && (
                <p
                  className={`text-sm font-medium ${
                    item.change24h > 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {item.change24h > 0 ? "+" : ""}
                  {item.change24h.toFixed(2)}% (24h)
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
