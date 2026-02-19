
# Fix: Cron-jobben autentiserar sig inte — CRON_SECRET saknas i databasen

## Grundorsak

CRON_SECRET finns som edge function-secret men **inte som PostgreSQL-inställning**. Cron-jobben kör SQL i Postgres och kan inte läsa edge function-secrets. De försöker hämta hemligheten via `current_setting('app.settings.cron_secret', true)` men det returnerar NULL — vilket gör att HTTP-headern `X-Cron-Secret` skickas som tom sträng och alla funktioner avvisar anropet med 401.

Hälsochecken ser grön ut eftersom den bara pingar med OPTIONS-anrop och inte kräver autentisering.

## Bevis

- `SELECT current_setting('app.settings.cron_secret', true)` → returnerar NULL
- Inga edge function-anrop från cron syns i loggar sedan 18 februari
- Senaste nyhet: 18 februari (manuellt skapad)
- Senaste dagliga rapport: 18 februari (manuellt skapad)
- CRON_SECRET finns i edge function-secrets men inte i pg_settings

## Lösning — en SQL-rad

Spara CRON_SECRET-värdet som en PostgreSQL ALTER DATABASE-inställning så att `current_setting()` kan läsa det:

```sql
ALTER DATABASE postgres SET "app.settings.cron_secret" = '<CRON_SECRET_VÄRDET>';
```

Detta är den enda ändringen som behövs. Inga kod-filer ändras.

## Tekniska detaljer

- Cron-jobben körs redan med rätt SQL-syntax och rätt URL:er
- Funktionerna har redan korrekt `X-Cron-Secret`-validering
- Det enda som fattas är att `current_setting('app.settings.cron_secret', true)` returnerar ett verkligt värde

## Vad som händer efter fixet

- Nästa körning kl 18:00 UTC skapas dagens dagliga rapport automatiskt
- Nyheter skrapas var 2:e timme igen automatiskt
- Veckorapporten körs nästa söndag automatiskt
- Manuella rapporter för 19 februari kan triggas via admin-panelen direkt

## Ingen kod ändras — bara en SQL-sats körs i databasen
