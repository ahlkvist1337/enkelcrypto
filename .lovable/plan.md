
# Rot-orsak och lösning — definitiv

## Vad som faktiskt hänt

Cron-jobben för daglig rapport och nyhetsskrapning slutade fungera 5 februari. Orsaken är att `current_setting('app.settings.cron_secret', true)` returnerar NULL i databasen, vilket gör att alla cron-jobb skickar en tom `X-Cron-Secret`-header och får 401 tillbaka.

Alla tidigare "fixar" har ändrat cron-jobbens SQL-syntax men inte löst grundproblemet: hemligheten existerar i edge function-miljön men inte i PostgreSQL-databasen.

## Bevis

- `SELECT current_setting('app.settings.cron_secret', true)` → NULL (bekräftat nu)
- `report_generation_log`: senaste cron-körning 4 februari. Allt sedan dess manuellt.
- `news_scrape_log`: senaste cron-körning 5 februari.
- Edge logs: en 401 registrerad för `generate-daily-report` — cron kör men autentiserar aldrig.

## Den enda ändringen som behövs

`ALTER DATABASE` är blockerat i Lovable Cloud. Men `ALTER ROLE` fungerar. Den sätter samma inställning fast på roll-nivå istället för databas-nivå — `current_setting()` läser dem på samma sätt.

### Vad som ändras

En enda SQL-sats körs mot databasen via en ny engångsmigration:

```sql
ALTER ROLE authenticator SET "app.settings.cron_secret" = '<CRON_SECRET_VÄRDET>';
```

Det är allt. Inga kod-filer ändras. Inga nya edge functions. Inga nya admin-knappar. Inga omvägar.

### Varför ALTER ROLE fungerar

PostgreSQL läser `current_setting('app.settings.cron_secret')` från session-inställningar. Dessa kan sättas på databas-, roll- eller session-nivå. `ALTER DATABASE` är blockerat, men `ALTER ROLE authenticator` (rollen som pg_cron och pg_net använder för att köra SQL) är tillåtet.

### Tekniska detaljer

- Filen `supabase/migrations/` — en ny migrationsfil med `ALTER ROLE` SQL
- Ingen kod i edge functions ändras
- Cron-jobben är redan korrekt konfigurerade med rätt URL:er och `current_setting()`-syntax
- När migrationen körs börjar `current_setting()` returnera rätt värde vid nästa cron-körning

### Vad som händer efter

- Kl 18:00 UTC idag (eller nästa körning) genereras daglig rapport automatiskt
- Var 2:e timme skrapas nyheter automatiskt igen  
- Nästa söndag kl 18:00 UTC körs veckorapporten
- Rapporterna för 19–20 februari kan triggas manuellt via admin-panelen direkt efteråt

### Inga kod-ändringar — bara en SQL-rad i en migrationsfil
