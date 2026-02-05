## SEO-förbättringar - Implementerat ✅

### Genomförda ändringar

1. **Dynamisk sitemap** (`generate-sitemap` edge function)
   - Genererar XML-sitemap med alla nyheter och rapporter
   - URL: `https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/generate-sitemap`
   - Refererad i `robots.txt`

2. **Länkning istället för dialoger**
   - `NewsSection.tsx` - Klick navigerar till `/nyhet/:id`
   - `NewsArchiveSection.tsx` - Klick navigerar till `/nyhet/:id`
   - `Archive.tsx` - Klick navigerar till `/rapport/:type/:date`

3. **Förbättrad structured data**
   - `SEOHead.tsx` - NewsArticle schema för nyheter, Article för rapporter
   - Inkluderar publisher, author, datePublished, etc.

4. **Intern länkning i footer**
   - Senaste 3 nyheter
   - Senaste 3 rapporter
   - Navigeringslänkar

### Nästa steg (valfritt)
- Skicka in sitemap till Google Search Console
- Lägg till relaterade artiklar på detaljsidor

