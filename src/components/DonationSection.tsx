import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, Bitcoin, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const QRCode = ({ value, size = 128 }: { value: string; size?: number }) => {
  // Simple QR placeholder using a free API (no external lib needed)
  if (!value) return null;
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=1`}
      alt={`QR-kod för ${value}`}
      width={size}
      height={size}
      className="rounded-md"
      loading="lazy"
    />
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Kopierad!", description: "Adressen har kopierats till urklipp" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Fel", description: "Kunde inte kopiera", variant: "destructive" });
    }
  }, [text]);

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Kopierad" : "Kopiera"}
    </Button>
  );
};

export const DonationSection = () => {
  const [btcAddress, setBtcAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["btc_donation_address", "eth_donation_address"]);

      data?.forEach((row) => {
        if (row.key === "btc_donation_address") setBtcAddress(row.value);
        if (row.key === "eth_donation_address") setEthAddress(row.value);
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading || (!btcAddress && !ethAddress)) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Stöd EnkelCrypto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gillar du EnkelCrypto? Stöd oss genom en donation!
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {btcAddress && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Bitcoin className="h-5 w-5 text-[hsl(36,100%,50%)]" />
                Bitcoin (BTC)
              </div>
              <QRCode value={`bitcoin:${btcAddress}`} size={120} />
              <code className="text-xs text-muted-foreground break-all text-center max-w-[200px]">
                {btcAddress}
              </code>
              <CopyButton text={btcAddress} />
            </div>
          )}
          {ethAddress && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Coins className="h-5 w-5 text-[hsl(231,55%,60%)]" />
                Ethereum (ETH)
              </div>
              <QRCode value={`ethereum:${ethAddress}`} size={120} />
              <code className="text-xs text-muted-foreground break-all text-center max-w-[200px]">
                {ethAddress}
              </code>
              <CopyButton text={ethAddress} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
