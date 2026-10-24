import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean) || clean.length > 255) {
      toast({ title: "Ogiltig e-postadress", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: clean });
    setLoading(false);
    if (error && error.code !== "23505") {
      toast({ title: "Något gick fel", description: "Försök igen om en stund.", variant: "destructive" });
      return;
    }
    setDone(true);
  };

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <span className="text-sm font-semibold">Gratis nyhetsbrev</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Få veckorapporten i inkorgen</h2>
          <p className="text-muted-foreground">
            Varje söndag: veckans viktigaste kryptohändelser på enkel svenska. Avsluta när du vill.
          </p>
        </div>
        {done ? (
          <div className="flex items-center gap-2 text-primary font-medium">
            <Check className="h-5 w-5" /> Tack! Du är nu prenumerant.
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 md:w-[420px]">
            <Input
              type="email"
              required
              placeholder="din@epost.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-postadress"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Skickar..." : "Prenumerera"}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
};
