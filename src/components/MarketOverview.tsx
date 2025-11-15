import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketData {
  name: string;
  symbol: string;
  price: string;
  change24h: number;
}

const mockMarketData: MarketData[] = [
  { name: "Bitcoin", symbol: "BTC", price: "487 234 kr", change24h: 2.4 },
  { name: "Ethereum", symbol: "ETH", price: "28 765 kr", change24h: -1.2 },
  { name: "Total Market Cap", symbol: "", price: "42.8T kr", change24h: 1.8 },
];

export const MarketOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {mockMarketData.map((data) => (
        <Card key={data.symbol || data.name} className="p-4 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{data.name}</p>
                {data.symbol && (
                  <p className="text-xs text-muted-foreground">{data.symbol}</p>
                )}
              </div>
              {data.change24h > 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{data.price}</p>
              <p
                className={`text-sm font-medium ${
                  data.change24h > 0 ? "text-success" : "text-destructive"
                }`}
              >
                {data.change24h > 0 ? "+" : ""}
                {data.change24h}% (24h)
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
