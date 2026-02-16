

# Fix: Dubbletter vid nyhetsskrapning + Ta-bort-knapp for admin

## Problem 1: Dubbletter
Skraparen tar alltid den senaste artikeln fran CryptoCompare. Vid tva snabba klick hamtas samma engelska artikel, men AI:n kan generera lite olika svenska titlar varje gang. Eftersom dublettkontroll (`onConflict`) bara kollar `title`, slinker den andra igenom.

## Problem 2: Ingen mojlighet att ta bort nyheter
Det finns idag inget satt att radera felaktiga nyheter fran frontenden.

---

## Tekniska andringar

### 1. `supabase/functions/scrape-crypto-news/index.ts`
- Fore AI-anropet: kontrollera om `source_url` redan finns i `news`-tabellen
- Om den finns, hoppa over artikeln och logga att den ar en dubblett
- Detta forhindrar dubbletter oavsett vad AI:n genererar for titel

### 2. `supabase/functions/admin-api/index.ts`
- Lagg till en ny action `delete-news` (metod DELETE eller POST)
- Tar emot `newsId` i request body
- Validerar att det ar ett giltigt UUID
- Raderar nyheten fran `news`-tabellen med service role key
- Returnerar bekraftelse eller felmeddelande

### 3. `src/pages/NewsDetail.tsx`
- Importera `useAuth` for att kontrollera admin-status
- Importera `Trash2` ikon fran lucide-react
- Lagg till en papperskorgsknapp bredvid delningsknapparna (rad 105-118), synlig endast om `isAdmin`
- Vid klick: visa en bekraftelsedialog ("Ar du saker?")
- Vid bekraftelse: anropa `admin-api?action=delete-news` med nyhetens ID
- Vid lyckad radering: navigera tillbaka till `/arkiv?tab=nyheter` och invalidera nyhets-cachen
- Importera `useNavigate` och `useQueryClient`

### 4. Ingen databasmigration behovs
- RLS-policyn tillater redan bara SELECT for publika anvandare
- Raderingen sker via service role key i admin-api, sa RLS ar inte ett hinder

---

## Sammanfattning
- 3 filer andras
- Ingen ny databas-migration
- Ingen ny edge function

