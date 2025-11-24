import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

export const SEOHead = ({
  title = "EnkelCrypto - Daglig kryptosammanfattning på svenska",
  description = "Få en enkel, daglig sammanfattning av kryptomarknaden på svenska. Ingen teknisk jargong, bara klar information om Bitcoin, Ethereum och marknaden.",
  canonical = "https://enkelcrypto.se",
  ogImage = "https://enkelcrypto.se/og-image.png",
  type = "website",
  publishedTime,
}: SEOHeadProps) => {
  const siteName = "EnkelCrypto";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebSite",
          "name": siteName,
          "url": canonical,
          "description": description,
          "image": ogImage,
          ...(type === "article" && publishedTime ? {
            "datePublished": publishedTime,
            "author": {
              "@type": "Organization",
              "name": siteName,
            },
          } : {}),
        })}
      </script>
    </Helmet>
  );
};
