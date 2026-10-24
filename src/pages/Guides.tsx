import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { guides } from "@/data/guides";

const Guides = () => (
  <>
    <SEOHead
      title="Guider om krypto"
      description="Enkla guider på svenska: köpa krypto i Sverige, krypto och skatt, och en ordlista för nybörjare."
      canonical="https://enkelcrypto.se/guider"
    />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Guider</h1>
            <p className="text-muted-foreground">Allt du behöver veta för att komma igång med krypto – på enkel svenska.</p>
          </div>
          <div className="grid gap-4">
            {guides.map((g) => (
              <Link key={g.slug} to={`/guide/${g.slug}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow group">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{g.title}</h2>
                  <p className="text-muted-foreground mt-2">{g.description}</p>
                  <span className="text-sm text-primary font-medium inline-flex items-center gap-1 mt-3">
                    Läs guiden <ArrowRight className="w-3 h-3" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default Guides;
