import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, Bitcoin, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const QRCode = ({ value, size = 160 }: { value: string; size?: number }) => {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=1`}
        alt={`QR-kod för ${value}`}
        width={size}
        height={size}
        className="rounded-md"
        loading="lazy"
      />
    </div>
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
    <Button
      variant={copied ? "secondary" : "default"}
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 transition-all duration-200"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Kopierad!" : "Kopiera adress"}
    </Button>
  );
};

const truncateAddress = (addr: string) => {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
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
    <TooltipProvider>
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
              <Coins className="h-4.5 w-4.5 text-primary" />
            </div>
            Stöd EnkelCrypto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gillar du EnkelCrypto? Stöd oss genom en kryptodonation!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {btcAddress && (
              <div className="group flex flex-col items-center gap-4 p-5 rounded-xl border border-border bg-gradient-to-br from-[hsl(36,100%,97%)] to-[hsl(36,80%,92%)] dark:from-[hsl(36,40%,14%)] dark:to-[hsl(36,30%,10%)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[hsl(36,100%,50%)]/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[hsl(36,100%,50%)]/15">
                    <Bitcoin className="h-5 w-5 text-[hsl(36,100%,50%)]" />
                  </div>
                  <span className="font-semibold text-foreground">Bitcoin (BTC)</span>
                </div>
                <QRCode value={`bitcoin:${btcAddress}`} size={160} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="text-xs text-muted-foreground font-mono cursor-default">
                      {truncateAddress(btcAddress)}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px] break-all font-mono text-xs">
                    {btcAddress}
                  </TooltipContent>
                </Tooltip>
                <CopyButton text={btcAddress} />
              </div>
            )}
            {ethAddress && (
              <div className="group flex flex-col items-center gap-4 p-5 rounded-xl border border-border bg-gradient-to-br from-[hsl(231,55%,97%)] to-[hsl(231,45%,92%)] dark:from-[hsl(231,30%,14%)] dark:to-[hsl(231,25%,10%)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[hsl(231,55%,60%)]/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[hsl(231,55%,60%)]/15">
                    <Coins className="h-5 w-5 text-[hsl(231,55%,60%)]" />
                  </div>
                  <span className="font-semibold text-foreground">Ethereum (ETH)</span>
                </div>
                <QRCode value={`ethereum:${ethAddress}`} size={160} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="text-xs text-muted-foreground font-mono cursor-default">
                      {truncateAddress(ethAddress)}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px] break-all font-mono text-xs">
                    {ethAddress}
                  </TooltipContent>
                </Tooltip>
                <CopyButton text={ethAddress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
