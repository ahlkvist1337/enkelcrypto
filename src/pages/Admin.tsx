import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";

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
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadAffiliateLinks();
  }, []);

  const loadAffiliateLinks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-api', {
        body: {},
        method: 'GET',
      });

      if (error) throw error;
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
    if (!newLink.name || !newLink.url) {
      toast({
        title: "Fel",
        description: "Namn och URL krävs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { 
          action: 'add-affiliate-link',
          ...newLink 
        },
        method: 'POST',
      });

      if (error) throw error;
      
      toast({
        title: "Sparad!",
        description: "Affiliatelänk tillagd",
      });
      
      setNewLink({ name: "", url: "", description: "" });
      loadAffiliateLinks();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte lägga till länk",
        variant: "destructive",
      });
    }
  };

  const deleteAffiliateLink = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { 
          action: 'delete-affiliate-link',
          id 
        },
        method: 'DELETE',
      });

      if (error) throw error;
      
      toast({
        title: "Borttagen!",
        description: "Affiliatelänk borttagen",
      });
      
      loadAffiliateLinks();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort länk",
        variant: "destructive",
      });
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'generate-report' },
        method: 'POST',
      });

      if (error) throw error;
      
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Hantera affiliatelänkar och inställningar</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Generera Rapport</h2>
          <p className="text-muted-foreground mb-4">
            Generera dagens rapport manuellt (körs automatiskt varje dag)
          </p>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Genererar...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generera Rapport Nu
              </>
            )}
          </Button>
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
          <div className="space-y-4">
            {affiliateLinks.length === 0 ? (
              <p className="text-muted-foreground">Inga affiliatelänkar ännu</p>
            ) : (
              affiliateLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{link.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAffiliateLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
