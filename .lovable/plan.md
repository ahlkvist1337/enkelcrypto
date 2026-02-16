
# Fix: Rapport visas inte + nyheter uppdateras inte i UI

## Problem 1: Rapport genereras men syns inte
Admin-panelens "Generera Daglig Rapport"-knapp anropar `admin-api` som i sin tur anropar `generate-daily-report` med **service role key** som Bearer-token. Men `generate-daily-report` forsöker använda den token som en **user token** via `getUser()` -- det misslyckas tyst och returnerar 401. Admin-API:n kontrollerar inte svarskoden utan skickar tillbaka svaret som 200, och toasten visar "Genererad!" trots att ingenting skapades.

Senaste rapporten i databasen är från **5 februari** -- inga nya har skapats.

### Lösning
Ändra `admin-api` så att den anropar `generate-daily-report` med användarens faktiska auth-token (som redan verifierats som admin), istället för service role key. Alternativt kan den skicka med `X-Cron-Secret`. Dessutom: kontrollera svarskoden och visa fel om genereringen misslyckas.

## Problem 2: Nyheter -- bara 1 kommer, sedan inga fler
Nyhetsskrapningen är designad att hämta **1 artikel per körning** (för att sprida nyheter jämnt över dygnet). Den filtrerar bort artiklar som redan finns i databasen. Om samma artiklar returneras av API:t vid ett nytt klick, sparas ingenting nytt. Detta fungerar som tänkt -- men UI:t uppdateras inte efter att admin klickat, så det ser ut som att inget händer.

### Lösning
Efter att nyhetsskrapningen kört klart, invalidera React Query-cachen för nyheter (`queryKey: ["news"]`) så att frontenden hämtar den nya listan automatiskt.

## Tekniska ändringar

### 1. `supabase/functions/admin-api/index.ts`
- Rad 286-296: Ändra `generate-report`-anropet att skicka med användarens auth-token istället for service role key
- Lägg till kontroll av `response.ok` och returnera korrekt felkod om det misslyckas

### 2. `src/pages/Admin.tsx`
- I `generateReport()` (rad 308-348): Efter lyckad generering, invalidera React Query-cachen for `todays-report` och `reports`
- I `scrapeNews()` (rad 390-428): Efter lyckad skrapning, invalidera React Query-cachen for `news`
- Importera `useQueryClient` fran `@tanstack/react-query`

### Sammanfattning av ändringar
- 2 filer ändras
- Ingen ny databas-migration
- Ingen ny edge function
