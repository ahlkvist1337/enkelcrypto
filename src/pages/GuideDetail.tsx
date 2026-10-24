import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { getGuide, guides } from "@/data/guides";
import { formatSwedishDate } from "@/lib/dates";
import NotFound from "./NotFound";

const GuideDetail = () => {
  const { slug } = useParams();
  const guide = slug ? getGuide(slug) : undefined;
  if (!guide) return <NotFound />;
  const url = `https://enkelcrypto.se/guide/${guide.slug}`;

  return (
    <>
      <SEOHead title={guide.title} description={guide.description} canonical={url} type="article" publishedTime={guide.updated} articleType="Article" />
      {guide.faq && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            })}
          </script>
        </Helmet>
      )}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <article className="max-w-3xl mx-auto space-y-8">
            <header className="space-y-3">
              <Link to="/guider" className="text-sm text-primary hover:underline">← Alla guider</Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{guide.title}</h1>
              <p className="text-sm text-muted-foreground">Uppdaterad {formatSwedishDate(guide.updated)}</p>
              <p className="text-lg text-foreground/90 leading-relaxed">{guide.intro}</p>
            </header>

            {guide.sections.map((s) => (
              <section key={s.heading} className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">{s.heading}</h2>
                {s.paragraphs?.map((p) => <p key={p} className="text-foreground/90 leading-relaxed">{p}</p>)}
                {s.list && (
                  <ul className="list-disc pl-6 space-y-1 text-foreground/90">
                    {s.list.map((l) => <li key={l}>{l}</li>)}
                  </ul>
                )}
                {s.terms && (
                  <dl className="grid gap-3">
                    {s.terms.map((t) => (
                      <Card key={t.term} className="p-4">
                        <dt className="font-semibold text-foreground">{t.term}</dt>
                        <dd className="text-muted-foreground mt-1">{t.definition}</dd>
                      </Card>
                    ))}
                  </dl>
                )}
              </section>
            ))}

            {guide.faq && (
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Vanliga frågor</h2>
                {guide.faq.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-semibold text-foreground">{f.q}</h3>
                    <p className="text-muted-foreground">{f.a}</p>
                  </div>
                ))}
              </section>
            )}

            <p className="text-sm text-muted-foreground italic">
              Innehållet är allmän information och inte finansiell rådgivning eller skatterådgivning.
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Fler guider</h2>
              <ul className="space-y-1">
                {guides.filter((g) => g.slug !== guide.slug).map((g) => (
                  <li key={g.slug}><Link to={`/guide/${g.slug}`} className="text-primary hover:underline">{g.title}</Link></li>
                ))}
              </ul>
            </section>

            <NewsletterSignup />
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default GuideDetail;
