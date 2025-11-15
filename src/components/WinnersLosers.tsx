import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketMover } from "@/hooks/useCryptoData";

interface WinnersLosersProps {
  movers?: MarketMover[];
}

export const WinnersLosers = ({ movers }: WinnersLosersProps) => {
  if (!movers || movers.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <span className="mr-2">🚀</span> Dagens Vinnare
          </h2>
          <p className="text-muted-foreground">Data laddas...</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <span className="mr-2">📉</span> Dagens Förlorare
          </h2>
          <p className="text-muted-foreground">Data laddas...</p>
        </Card>
      </div>
    );
  }

  const winners = movers.filter(m => m.type === 'winner').slice(0, 5);
  const losers = movers.filter(m => m.type === 'loser').slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Winners */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <span className="mr-2">🚀</span> Dagens Vinnare
        </h2>
        <div className="space-y-4">
          {winners.map((coin, index) => (
            <div key={coin.id} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-muted-foreground font-medium">{index + 1}</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{coin.coin_name}</p>
                    <p className="text-xs text-muted-foreground">{coin.ticker}</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    +{Number(coin.price_change).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{coin.ai_comment || 'Ingen kommentar tillgänglig'}</p>
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
          {losers.map((coin, index) => (
            <div key={coin.id} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-muted-foreground font-medium">{index + 1}</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{coin.coin_name}</p>
                    <p className="text-xs text-muted-foreground">{coin.ticker}</p>
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {Number(coin.price_change).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{coin.ai_comment || 'Ingen kommentar tillgänglig'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
