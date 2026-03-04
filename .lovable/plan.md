

# Crypto-donationer på EnkelCrypto

Lägga till en donationssektion med BTC- och ETH-adresser, plus möjlighet för traditionella donationer.

## Vad som byggs

1. **Ny komponent `DonationSection.tsx`** — En card-baserad sektion med:
   - BTC-adress med kopiera-knapp och QR-kod (genererad via inline SVG eller en liten lib)
   - ETH-adress med kopiera-knapp och QR-kod
   - Visuellt tilltalande med crypto-ikoner
   - "Kopierad!"-feedback via toast

2. **Admin-hantering av adresser** — Adresserna lagras i `site_settings`-tabellen (redan finns) med nycklarna `btc_donation_address` och `eth_donation_address`, redigeringsbara via admin-panelen.

3. **Placering** — Sektionen visas på startsidan (`Index.tsx`) ovanför footer, samt på Om-sidan (`About.tsx`).

4. **SQL migration** — Sätta in default-värden i `site_settings` för BTC/ETH-adresser (tomma initialt, admin fyller i).

## Tekniska detaljer

- QR-koder genereras med en liten inline-lösning (canvas-baserat eller `qrcode`-paket) för att slippa externa tjänster
- Kopiering via `navigator.clipboard.writeText()`
- Hämtar adresser från `site_settings` via Supabase query (publik read, admin write)
- Admin-panelen får ett nytt fält under inställningar för att redigera adresserna

## Filer som ändras/skapas

- `src/components/DonationSection.tsx` — ny
- `src/pages/Index.tsx` — lägg till DonationSection
- `src/pages/About.tsx` — lägg till DonationSection
- `src/pages/Admin.tsx` — fält för att redigera BTC/ETH-adresser
- SQL migration — insert default site_settings-rader

