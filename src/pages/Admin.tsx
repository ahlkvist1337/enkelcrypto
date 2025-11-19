import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const affiliateLinkSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  url: z.string()
    .trim()
    .url('Invalid URL format')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://')
    .max(500, 'URL must be less than 500 characters'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val || '')
});

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  active: boolean;
}

export default function Admin() {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [scrapingNews, setScrapingNews] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadAffiliateLinks();
  }, []);

  const loadAffiliateLinks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
      url.searchParams.append('action', 'get-affiliate-links');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAffiliateLinks(data || []);
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ladda affiliatelänkar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAffiliateLink = async () => {
    // Validate input using zod schema
    const validation = affiliateLinkSchema.safeParse(newLink);
    if (!validation.success) {
      toast({
        title: "Ogiltig inmatning",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        return;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
      url.searchParams.append('action', 'add-affiliate-link');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add');
      }
      
      toast({
        title: "Sparad!",
        description: "Affiliatelänk tillagd",
      });
      
      setNewLink({ name: "", url: "", description: "" });
      loadAffiliateLinks();
    } catch (error) {
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte lägga till länk",
        variant: "destructive",
      });
    }
  };

  const toggleAffiliateLink = async (id: string, currentActive: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        return;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
      url.searchParams.append('action', 'toggle-affiliate-link');

      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle');
      }
      
      toast({
        title: "Uppdaterad!",
        description: `Affiliatelänk ${!currentActive ? 'aktiverad' : 'inaktiverad'}`,
      });
      
      loadAffiliateLinks();
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte uppdatera länk",
        variant: "destructive",
      });
    }
  };

  const deleteAffiliateLink = async (id: string) => {
    if (!confirm('Är du säker på att du vill radera denna länk permanent? Överväg att inaktivera den istället.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        return;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
      url.searchParams.append('action', 'delete-affiliate-link');

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }
      
      toast({
        title: "Borttagen!",
        description: "Affiliatelänk permanent borttagen",
      });
      
      loadAffiliateLinks();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte ta bort länk",
        variant: "destructive",
      });
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        setGenerating(false);
        return;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`);
      url.searchParams.append('action', 'generate-report');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to generate');
      
      toast({
        title: "Genererad!",
        description: "Dagens rapport har genererats",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte generera rapport",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateWeeklyReport = async () => {
    setGeneratingWeekly(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        setGeneratingWeekly(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-weekly-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to generate weekly report');
      
      toast({
        title: "Genererad!",
        description: "Veckans rapport har genererats",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte generera veckorapport",
        variant: "destructive",
      });
    } finally {
      setGeneratingWeekly(false);
    }
  };

  const scrapeNews = async () => {
    setScrapingNews(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        setScrapingNews(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-crypto-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to scrape news');
      
      toast({
        title: "Lyckades!",
        description: "Nyheter har uppdaterats",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte hämta nyheter",
        variant: "destructive",
      });
    } finally {
      setScrapingNews(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Hantera affiliatelänkar och inställningar</p>
          </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Generera Rapporter</h2>
          <p className="text-muted-foreground mb-6">
            Rapporter genereras automatiskt: Dagligen kl 18:00 och veckovis på söndagar kl 18:00. Du kan också generera dem manuellt här.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Genererar...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generera Daglig Rapport
                </>
              )}
            </Button>
            <Button onClick={generateWeeklyReport} disabled={generatingWeekly} variant="secondary">
              {generatingWeekly ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Genererar...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generera Veckorapport
                </>
              )}
            </Button>
            <Button onClick={scrapeNews} disabled={scrapingNews} variant="outline">
              {scrapingNews ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hämtar...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Uppdatera Nyheter
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Lägg till Affiliatelänk</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="t.ex. Binance"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="description">Beskrivning (valfritt)</Label>
              <Textarea
                id="description"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Kort beskrivning"
              />
            </div>
            <Button onClick={addAffiliateLink}>
              <Plus className="mr-2 h-4 w-4" />
              Lägg till
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Affiliatelänkar</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Använd switchen för att aktivera/inaktivera länkar. Endast aktiva länkar visas på hemsidan.
          </p>
          <div className="space-y-4">
            {affiliateLinks.length === 0 ? (
              <p className="text-muted-foreground">Inga affiliatelänkar ännu</p>
            ) : (
              affiliateLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{link.name}</h3>
                      <Badge variant={link.active ? "default" : "secondary"}>
                        {link.active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={link.active}
                        onCheckedChange={() => toggleAffiliateLink(link.id, link.active)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {link.active ? "På" : "Av"}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAffiliateLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </main>
    <Footer />
  </div>
  );
}
