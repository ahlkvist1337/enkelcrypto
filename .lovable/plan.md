

## Plan: Förbättra SEO och sökbarhet för nyheter och rapporter

### Problem
Google kan inte hitta dina 154 nyheter och 98 rapporter eftersom:
1. **Statisk sitemap** - bara 4 sidor är listade, inte de 252+ individuella sidorna
2. **Dialog-baserad navigation** - innehåll öppnas i popup istället för egna sidor
3. **Inga interna länkar** - Google följer länkar för att hitta nytt innehåll

### Lösning

#### 1. Skapa dynamisk sitemap via Edge Function
En edge function som genererar sitemap.xml med alla nyheter och rapporter:
- Hämtar alla nyheter från databasen
- Hämtar alla rapporter från databasen  
- Genererar komplett XML-sitemap med alla URLs
- Sätter korrekta prioriteter och uppdateringsfrekvenser

#### 2. Uppdatera NewsSection - Länka till egna sidor
Ändra från dialog-popup till riktiga länkar:
- Klick på nyhetskort navigerar till `/nyhet/:id`
- Behåll visuell design men använd `<Link>` istället för `onClick`
- Lägg till "Läs mer"-knapp för tydlighet

#### 3. Uppdatera Archive - Länka till egna rapportsidor
Samma för rapporter i arkivet:
- Klick navigerar till `/rapport/daily/:date`
- Ta bort dialog-komponenten
- Använd `<Link>` för bättre SEO

#### 4. Lägg till intern länkning
- Lägg till "relaterade nyheter" eller "andra rapporter" på detaljsidorna
- Skapa en footer med senaste nyheter/rapporter
- Förbättra crawlability

#### 5. Tekniska SEO-förbättringar
- Uppdatera robots.txt att referera till dynamisk sitemap
- Lägg till structured data (NewsArticle schema) för nyheter
- Se till att alla sidor har unika, beskrivande titlar

### Tekniska ändringar

**Ny edge function:** `generate-sitemap`
```text
+-----------------------------------+
|       generate-sitemap            |
+-----------------------------------+
| 1. Hämta alla nyheter            |
| 2. Hämta alla rapporter          |
| 3. Generera XML                  |
| 4. Returnera sitemap             |
+-----------------------------------+
```

**Uppdaterade komponenter:**
- `src/components/NewsSection.tsx` - Använd `<Link>` istället för dialog
- `src/pages/Archive.tsx` - Använd `<Link>` istället för dialog
- `src/components/SEOHead.tsx` - Lägg till NewsArticle schema för nyheter

### Förväntade resultat
- Alla 252+ sidor indexerbara av Google
- Bättre ranking i sökresultat för kryptorelaterade söktermer på svenska
- Ökad organisk trafik från Google, Bing och andra sökmotorer
- Delningsbara länkar till specifika nyheter och rapporter

