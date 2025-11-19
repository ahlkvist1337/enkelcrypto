import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Ogiltig e-postadress").max(255, "E-post får max vara 255 tecken"),
  password: z.string().min(6, "Lösenord måste vara minst 6 tecken").max(100, "Lösenord får max vara 100 tecken"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Fel",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Fel",
              description: "Fel e-post eller lösenord",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Fel",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Välkommen!",
          description: "Du är nu inloggad",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Fel",
              description: "Den här e-postadressen är redan registrerad",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Fel",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Registrering lyckades!",
          description: "Du kan nu logga in",
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        title: "Fel",
        description: "Något gick fel, försök igen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? "Logga in" : "Skapa konto"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Välkommen tillbaka till EnkelCrypto" : "Registrera dig för EnkelCrypto"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div>
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              maxLength={100}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Loggar in..." : "Registrerar..."}
              </>
            ) : (
              <>{isLogin ? "Logga in" : "Skapa konto"}</>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isLogin ? "Har du inget konto? Registrera dig här" : "Har du redan ett konto? Logga in här"}
          </button>
        </div>
      </Card>
    </div>
  );
}
