

# Plan: Uppdatera nyhetsskrapningen till 1 artikel varannan timme

## Sammanfattning
Nyhetsskrapningen körs tekniskt sett var 6:e timme, men koden blockerar körningar efter första lyckade körningen varje dag. Jag kommer att ändra detta så att funktionen hämtar 1 nyhet per körning och tillåter flera körningar per dag. Cron-schemat ändras till varannan timme.

---

## Ändringar

### 1. Uppdatera Edge Function-logiken
**Fil:** `supabase/functions/scrape-crypto-news/index.ts`

- Ta bort `shouldRetry()`-kontrollen som blockerar körningar efter första lyckade
- Ändra från att hämta 5 artiklar till 1 artikel per körning
- Behåll loggningen men anpassa till det nya flödet

### 2. Uppdatera Cron-schemat
**Databas:** Ändra cron-jobbet från `0 */6 * * *` (var 6:e timme) till `0 */2 * * *` (varannan timme)

- Detta ger ~12 nyheter per dag istället för 5

---

## Tekniska detaljer

### Edge Function-ändringar
```text
Före:                            Efter:
─────                            ─────
5 artiklar per körning     →     1 artikel per körning
Blockeras efter succé      →     Tillåt flera körningar/dag
Kör var 6:e timme          →     Kör varannan timme
~5 nyheter/dag             →     ~12 nyheter/dag
```

### Cron-uppdatering
- Befintligt jobb: `scrape-crypto-news-every-6-hours`
- Nytt schema: `0 */2 * * *` (varannan timme, på heltimme)
- Jobbnamnet kan uppdateras för tydlighet

---

## Resultat
Efter dessa ändringar kommer systemet att:
- Hämta 1 nyhet varannan timme
- Ge jämnare flöde av nyheter under dagen
- Producera ca 12 nyheter per dag

