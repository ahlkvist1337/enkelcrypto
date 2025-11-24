import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = `${title} - EnkelCrypto`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Länk kopierad!",
        description: "Länken har kopierats till urklipp.",
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Kunde inte kopiera",
        description: "Försök igen eller kopiera manuellt.",
        variant: "destructive",
      });
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Dela:</span>
      
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          disabled={isSharing}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Dela
        </Button>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer')}
        title="Dela på Twitter/X"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer')}
        title="Dela på Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer')}
        title="Dela på LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        title="Kopiera länk"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
