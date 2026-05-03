# Fixa "Kunde inte ladda marknadsdata"

## Orsak

Klienten (`useCryptoMarketData` i `src/hooks/useCryptoData.ts`) skickar headern `Cache-Control: no-cache`. Det gör att webbläsaren skickar en CORS-preflight (OPTIONS) före själva GET. Edge-funktionen `fetch-crypto-data` listar bara `authorization, x-client-info, apikey, content-type` i `Access-Control-Allow-Headers` — `cache-control` saknas, så preflight avslås och fetch failar med "Failed to fetch".

Direktanrop via curl fungerar (200 OK med data), vilket bekräftar att backend och CoinGecko är friska — det är bara CORS i webbläsaren som blockerar.

## Åtgärd

Uppdatera `corsHeaders` i `supabase/functions/fetch-crypto-data/index.ts` så att `cache-control` tillåts:

```ts
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
```

Deploya funktionen. Inga klientändringar behövs — `cache: 'no-store'` + `Cache-Control: no-cache` på klienten är fortsatt önskvärt för att undvika att en transient 404/fel cachas.

## Filer

- `supabase/functions/fetch-crypto-data/index.ts` — utöka `Access-Control-Allow-Headers`
- Deploya `fetch-crypto-data`
