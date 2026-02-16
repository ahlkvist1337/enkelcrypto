

# Plan: Veckorapport-fix + SEO-vanliga URL:er for nyheter

## Del 1: Veckorapport -- force-stod med forra veckans datum

### Problem
Funktionen avbryter om det inte ar sondag, och satter dagens datum pa rapporten. Nar admin manuellt vill generera ska den anvanda forra sondagen som slutdatum och veckan dessforinnan som startdatum.

### Andringar

**`supabase/functions/generate-weekly-report/index.ts`**
- Lasa `force`-parameter fran request body
- Om `force: true`: hoppa over sondagskontroll
- Berakna "senaste sondag" som rapportens slutdatum (om idag ar onsdag 19/2, anvand sondag 16/2)
- Berakna en vecka tillbaka fran den sondagen som startdatum (9/2)
- Anvanda dessa datum for titel, datahamtning och `date`-faltet i databasen

**`src/pages/Admin.tsx`**
- Skicka `{ force: true }` i body vid manuellt anrop
- Invalidera `["reports"]` och `["weekly-reports"]` efter lyckad generering
- Visa backend-felmeddelanden i toast

---

## Del 2: SEO-vanliga URL:er for nyheter

### Problem
URL:er som `/nyhet/7e7523af-294c-4256-ac8e-60edc5ccc7e0` ar daliga for SEO. Bor vara `/nyhet/xrp-dominerar-sydkoreansk-kryptohandel`.

### Losning
Lagg till en `slug`-kolumn i `news`-tabellen och anvand den i alla lankar.

### Andringar

**Databasmigration**
- Lagg till kolumn `slug` (text, unique) pa `news`-tabellen
- Generera sluggar for alla befintliga nyheter baserat pa titel (ta bort svenska tecken, gemener, bindestreck)
- Skapa ett unique index pa `slug`

**`supabase/functions/scrape-crypto-news/index.ts`**
- Generera slug fran den svenska titeln vid insert (funktion som konverterar "XRP Dominerar Kryptohandel" till "xrp-dominerar-kryptohandel")
- Lagg till slug i upsert-anropet

**`src/hooks/useNews.ts`**
- Uppdatera `useNewsItem` att soka pa `slug` istallet for `id`
- Inkludera `slug` i alla queries select-listor

**`src/App.tsx`**
- Andra route fran `/nyhet/:id` till `/nyhet/:slug`

**`src/pages/NewsDetail.tsx`**
- Anvanda `slug`-param istallet for `id`
- Uppdatera canonical URL och delningslank

**`src/components/NewsSection.tsx`**
- Anka till `/nyhet/${item.slug}` istallet for `/nyhet/${item.id}`

**`src/components/NewsArchiveSection.tsx`**
- Samma andring som NewsSection

**`src/components/Footer.tsx`**
- Samma andring

**`supabase/functions/generate-sitemap/index.ts`**
- Hamta `slug` i select fran news
- Anvand `/nyhet/${item.slug}` i sitemap-URL:erna

---

## Teknisk detalj: Slug-generering

Funktion som kors bade i migrationen (SQL) och i edge function (TypeScript):
- Konvertera till gemener
- Ersatt a/a/o med a/a/o (svenska tecken)
- Ta bort allt utom bokstaver, siffror, mellanslag
- Ersatt mellanslag med bindestreck
- Max 80 tecken
- Exempel: "XRP Dominerar Sydkoreansk Kryptohandel" blir "xrp-dominerar-sydkoreansk-kryptohandel"

---

## Sammanfattning
- 1 databasmigration (ny kolumn + backfill)
- 2 edge functions andras (generate-weekly-report, scrape-crypto-news)
- 1 edge function uppdateras (generate-sitemap)
- 5 frontend-filer andras (App, NewsDetail, NewsSection, NewsArchiveSection, Footer)
- 1 frontend-fil andras (Admin.tsx - weekly report trigger)

