import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
}

export const AffiliateLinks = () => {
  const { data: links } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AffiliateLink[];
    },
  });

  if (!links || links.length === 0) return null;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Rekommenderade Börser
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Handla kryptovalutor säkert hos våra partners
      </p>
      <div className="space-y-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {link.name}
                  <ExternalLink className="h-4 w-4" />
                </h3>
                {link.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {link.description}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 italic">
        * Detta är affiliate-länkar. EnkelCrypto kan få ersättning om du registrerar dig.
      </p>
    </Card>
  );
};
