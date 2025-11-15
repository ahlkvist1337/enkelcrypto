import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Coin {
  name: string;
  symbol: string;
  change: number;
  comment: string;
}

const mockWinners: Coin[] = [
  { name: "Cardano", symbol: "ADA", change: 12.5, comment: "Stiger efter uppdatering av nätverket" },
  { name: "Solana", symbol: "SOL", change: 8.3, comment: "Positiv nyhet om NFT-marknadsplats" },
  { name: "Polkadot", symbol: "DOT", change: 7.1, comment: "Ökat intresse från institutionella investerare" },
  { name: "Avalanche", symbol: "AVAX", change: 6.8, comment: "Nya partnerskap tillkännagavs" },
  { name: "Polygon", symbol: "MATIC", change: 5.9, comment: "Ökad aktivitet på Layer 2-lösningar" },
];

const mockLosers: Coin[] = [
  { name: "Ripple", symbol: "XRP", change: -6.2, comment: "Fortsatt oro kring regulatoriska frågor" },
  { name: "Litecoin", symbol: "LTC", change: -4.8, comment: "Generell risk-off-stämning på marknaden" },
  { name: "Chainlink", symbol: "LINK", change: -3.9, comment: "Vinsthemtagning efter tidigare uppgång" },
  { name: "Uniswap", symbol: "UNI", change: -3.2, comment: "Minskad handelsvolym på DEX-plattformen" },
  { name: "Cosmos", symbol: "ATOM", change: -2.7, comment: "Följer marknadens negativa trend" },
];

export const WinnersLosers = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Winners */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <span className="mr-2">🚀</span> Dagens Vinnare
        </h2>
        <div className="space-y-4">
          {mockWinners.map((coin, index) => (
            <div key={coin.symbol} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-muted-foreground font-medium">{index + 1}</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{coin.name}</p>
                    <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    +{coin.change}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{coin.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Losers */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <span className="mr-2">📉</span> Dagens Förlorare
        </h2>
        <div className="space-y-4">
          {mockLosers.map((coin, index) => (
            <div key={coin.symbol} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-muted-foreground font-medium">{index + 1}</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{coin.name}</p>
                    <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {coin.change}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{coin.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
