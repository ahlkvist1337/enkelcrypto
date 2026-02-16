import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, AlertCircle, ExternalLink, Trash2 } from "lucide-react";
import { useNewsItem } from "@/hooks/useNews";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: news, isLoading, error } = useNewsItem(slug || "");
  const { isAdmin, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDescription = (content: string) => {
    return content.substring(0, 160).replace(/\*\*/g, '') + (content.length > 160 ? '...' : '');
  };

  const handleDeleteNews = async () => {
    if (!news || !session) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api?action=delete-news`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newsId: news.id }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Kunde inte ta bort nyheten');
      }
      toast.success('Nyheten har tagits bort');
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-archive'] });
      navigate('/arkiv?tab=nyheter');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Något gick fel');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {news && (
        <SEOHead 
          title={news.title}
          description={getDescription(news.summary)}
          canonical={`https://enkelcrypto.se/nyhet/${slug}`}
          type="article"
          publishedTime={news.date}
          ogImage={news.image_url || undefined}
          articleType="news"
        />
      )}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <Link to="/arkiv?tab=nyheter">
                <Button variant="ghost" className="mb-6 -ml-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka till nyhetsarkiv
                </Button>
              </Link>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Det gick inte att ladda nyheten. Vänligen försök igen om en stund.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <Card className="p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-3/4" />
                    <div className="space-y-2 pt-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </Card>
              ) : news ? (
                <Card className="p-8">
                  <article className="space-y-6">
                    {news.image_url && (
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-64 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20">
                          Nyhet
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(news.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {news.source_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={news.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Källa
                            </a>
                          </Button>
                        )}
                        <ShareButtons 
                          title={news.title} 
                          url={`https://enkelcrypto.se/nyhet/${slug}`} 
                        />
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ta bort nyhet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill ta bort denna nyhet? Detta kan inte ångras.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteNews} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Ta bort
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {news.title}
                    </h1>
                    
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {(news.full_content || news.summary).split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-foreground leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nyheten kunde inte hittas.
                  </p>
                  <Link to="/arkiv?tab=nyheter">
                    <Button variant="outline" className="mt-4">
                      Gå till nyhetsarkiv
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NewsDetail;
