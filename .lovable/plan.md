

# Snyggare donationssektion

Nuvarande design är funktionell men visuellt platt. Förbättringar:

## Ändringar i `src/components/DonationSection.tsx`

1. **Större QR-koder** (160px istället för 120px) med vit padding/ram runt dem
2. **Gradient-accenter** — subtil gradient-bakgrund på varje crypto-kort (orange-ton för BTC, blå-ton för ETH)
3. **Bättre typografi** — adressen visas trunkerad med ellipsis istället för break-all, full adress i tooltip
4. **Hover-effekt** på korten — lätt scale + shadow vid hover
5. **Snyggare kopiera-knapp** — fylld variant istället för outline, med tydligare feedback
6. **Ikon-förbättring** — färgade cirkelbakgrunder bakom crypto-ikonerna
7. **Responsiv layout** — bättre spacing och centrering på mobil

Bara en fil ändras: `src/components/DonationSection.tsx`.

