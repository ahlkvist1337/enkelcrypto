

# Fix: Återställ daglig rapportgenerering

## Problem
Backend-funktionen för dagliga rapporter har blivit otillgänglig (404) sedan 5 februari. Cron-jobben anropar funktionen varannan dag kl 06:00 och 18:00 men får 404 tillbaka. Inga felloggar finns eftersom funktionen inte ens startar.

## Åtgärder

### 1. Deploya generate-daily-report
Funktionen behöver deployas på nytt så att cron-jobben kan nå den igen.

### 2. Deploya ALLA edge functions
Eftersom flera funktioner har försvunnit vid olika tillfällen, deployas samtliga funktioner för att säkerställa att allt är tillgängligt:
- generate-daily-report
- generate-weekly-report
- fetch-crypto-data
- fetch-price-history
- scrape-crypto-news
- admin-api
- fix-news-json
- generate-sitemap
- update-news-translations

### 3. Generera saknade rapporter
Kör funktionen manuellt en gång efter deploy för att skapa dagens rapport. Funktionen har inbyggd logik för att även generera gårdagens rapport om den saknas, men den täcker bara en dag bakåt. De saknade rapporterna för 6-15 feb kan inte återskapas automatiskt (marknadsdata från de dagarna är borta).

## Resultat
- Dagens rapport genereras direkt
- Framtida cron-jobb fungerar igen (kl 06:00 och 18:00 UTC varje dag)
- Alla backend-funktioner är tillgängliga

