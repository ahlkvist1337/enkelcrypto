export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  terms?: { term: string; definition: string }[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
}

export const guides: Guide[] = [
  {
    slug: "kopa-krypto-i-sverige-2026",
    title: "Var köper man krypto i Sverige 2026?",
    description:
      "Nybörjarguide: så köper du bitcoin och andra kryptovalutor säkert i Sverige 2026. MiCA-licens, Swish, BankID och varför Binance försvann.",
    updated: "2026-10-24",
    intro:
      "Att köpa krypto i Sverige är enklare än någonsin, men det är viktigt att välja rätt plats. Sedan EU:s nya regler (MiCA) började gälla fullt ut ska alla kryptobörser som riktar sig till svenskar ha tillstånd. Här går vi igenom vad det betyder och hur du kommer igång.",
    sections: [
      {
        heading: "Vad är MiCA och varför spelar det roll?",
        paragraphs: [
          "MiCA (Markets in Crypto-Assets) är EU:s regelverk för kryptotillgångar. En börs med MiCA-tillstånd granskas av en finansmyndighet, måste hålla kundernas pengar åtskilda från sina egna och följa regler mot penningtvätt.",
          "I Sverige är det Finansinspektionen som ansvarar. En börs med tillstånd i ett annat EU-land får också erbjuda sina tjänster här. Kontrollera alltid att börsen du väljer har tillstånd innan du sätter in pengar.",
        ],
      },
      {
        heading: "Binance har lämnat Sverige",
        paragraphs: [
          "Binance, världens största kryptobörs, stängde för svenska kunder den 1 juli 2026 eftersom de saknar MiCA-tillstånd. Har du fortfarande krypto där bör du flytta det till en börs med tillstånd eller till en egen plånbok.",
        ],
      },
      {
        heading: "Exempel på börsar med MiCA-tillstånd",
        list: [
          "Safello – svensk börs, köp med Swish och logga in med BankID. Bra för nybörjare.",
          "Coinbase – stor internationell börs med MiCA-tillstånd i EU och många olika kryptovalutor.",
        ],
        paragraphs: [
          "Avgifter och utbud ändras ofta, så jämför på börsernas egna webbplatser innan du bestämmer dig.",
        ],
      },
      {
        heading: "Så köper du din första bitcoin – steg för steg",
        list: [
          "Välj en börs med MiCA-tillstånd.",
          "Skapa konto och identifiera dig med BankID.",
          "Sätt in pengar, till exempel med Swish eller banköverföring.",
          "Välj kryptovaluta och belopp – du kan köpa en liten del av en bitcoin, t.ex. för 100 kr.",
          "Bestäm var du vill förvara dina kryptotillgångar (se nedan).",
          "Spara underlag för alla köp och försäljningar – du behöver dem till deklarationen.",
        ],
      },
      {
        heading: "Var ska du förvara dina krypto?",
        paragraphs: [
          "På börsen: enklast, men börsen har kontrollen. Passar mindre belopp.",
          "Egen plånbok (wallet): du har själv kontrollen via en återställningsfras på 12–24 ord. Tappar du frasen förlorar du pengarna – och dela den aldrig med någon.",
          "Hårdvaruplånbok (t.ex. Ledger eller Trezor): en liten fysisk enhet som håller dina nycklar offline. Säkrast för större belopp.",
        ],
      },
      {
        heading: "Se upp för bedrägerier",
        list: [
          "Ingen seriös aktör lovar garanterad avkastning.",
          "Investera aldrig via någon du träffat på sociala medier eller dejtingappar.",
          "Ge aldrig ut din återställningsfras eller BankID till någon.",
          "Investera bara pengar du har råd att förlora – kryptopriser svänger kraftigt.",
        ],
      },
    ],
    faq: [
      { q: "Är det lagligt att köpa krypto i Sverige?", a: "Ja. Det är lagligt att köpa, äga och sälja kryptovalutor i Sverige." },
      { q: "Kan jag köpa krypto med Swish?", a: "Ja, flera svenska börser, till exempel Safello, tar emot Swish." },
      { q: "Kan jag fortfarande använda Binance?", a: "Nej, Binance stängde för svenska kunder den 1 juli 2026." },
    ],
  },
  {
    slug: "krypto-och-skatt",
    title: "Krypto och skatt i Sverige – enkel guide",
    description:
      "Så fungerar skatt på kryptovalutor i Sverige: 30 % skatt på vinst, genomsnittsmetoden, K4-blanketten och vad som räknas som försäljning.",
    updated: "2026-10-24",
    intro:
      "Skatteverket ser kryptovalutor som tillgångar, inte som pengar. Det betyder att du ska betala skatt när du gör vinst och att du kan dra av en del av dina förluster. Här är grunderna på enkel svenska. Guiden ersätter inte rådgivning – kontrollera alltid aktuella regler hos Skatteverket.",
    sections: [
      {
        heading: "När ska jag betala skatt?",
        paragraphs: ["Du betalar skatt först när du gör dig av med (avyttrar) dina krypto. Det räknas som avyttring när du:"],
        list: [
          "säljer krypto mot kronor eller annan vanlig valuta,",
          "byter en kryptovaluta mot en annan (t.ex. bitcoin mot ether),",
          "betalar för varor eller tjänster med krypto.",
        ],
      },
      {
        heading: "Hur mycket skatt?",
        paragraphs: [
          "Vinst beskattas med 30 % som inkomst av kapital.",
          "Förluster får dras av till 70 %. Det innebär att en förlust på 10 000 kr minskar din skatt med 2 100 kr (10 000 × 70 % × 30 %).",
          "Att bara köpa och behålla krypto är inte skattepliktigt.",
        ],
      },
      {
        heading: "Genomsnittsmetoden",
        paragraphs: [
          "Har du köpt samma kryptovaluta vid flera tillfällen räknar du ut ett genomsnittligt inköpspris (omkostnadsbelopp).",
          "Exempel: Du köper 1 ETH för 20 000 kr och senare 1 ETH för 30 000 kr. Ditt genomsnittliga inköpspris blir 25 000 kr per ETH. Säljer du 1 ETH för 35 000 kr blir vinsten 10 000 kr och skatten 3 000 kr.",
        ],
      },
      {
        heading: "Så deklarerar du",
        list: [
          "Vinster och förluster redovisas på blankett K4, avsnitt D ('Övriga värdepapper, andra tillgångar').",
          "Spara underlag för alla transaktioner: datum, belopp, pris i kronor och avgifter.",
          "Många börser kan ladda ner en transaktionshistorik. Det finns också skatteverktyg som räknar åt dig.",
        ],
      },
      {
        heading: "Staking, mining och belöningar",
        paragraphs: [
          "Krypto som du får genom staking, mining eller som belöning räknas normalt som inkomst när du får det. Värdet i kronor vid mottagandet blir sedan ditt inköpspris om du senare säljer.",
        ],
      },
    ],
    faq: [
      { q: "Måste jag betala skatt om jag inte sålt?", a: "Nej. Skatt uppstår först när du säljer, byter eller betalar med krypto." },
      { q: "Är byte mellan två kryptovalutor skattepliktigt?", a: "Ja, Skatteverket räknar det som en försäljning." },
      { q: "Vilken blankett används?", a: "Blankett K4, avsnitt D." },
    ],
  },
  {
    slug: "krypto-ordlista",
    title: "Krypto-ordlista: 30 begrepp förklarade enkelt",
    description:
      "Ordlista för nybörjare: blockkedja, bitcoin, wallet, HODL, staking, MiCA, halvering och fler kryptobegrepp förklarade på enkel svenska.",
    updated: "2026-10-24",
    intro: "Kryptovärlden är full av konstiga ord. Här förklarar vi de vanligaste begreppen kort och enkelt, i bokstavsordning.",
    sections: [
      {
        heading: "Ordlista A–Ö",
        terms: [
          { term: "Altcoin", definition: "Alla kryptovalutor som inte är bitcoin." },
          { term: "Bitcoin (BTC)", definition: "Den första och största kryptovalutan, skapad 2009. Det kommer bara att finnas 21 miljoner bitcoin." },
          { term: "Blockkedja (blockchain)", definition: "En digital liggare där alla transaktioner sparas i block som länkas ihop. Den delas av tusentals datorer och är mycket svår att ändra i efterhand." },
          { term: "Börs (exchange)", definition: "En tjänst där du köper och säljer krypto, t.ex. Safello eller Coinbase." },
          { term: "Cold wallet", definition: "En plånbok som inte är ansluten till internet, ofta en hårdvaruplånbok. Säkrare mot hackare." },
          { term: "DeFi", definition: "Decentraliserade finanstjänster – lån, sparande och handel som sker direkt på blockkedjan utan bank." },
          { term: "Dominans", definition: "Hur stor andel av hela kryptomarknadens värde som en enskild valuta (oftast bitcoin) står för." },
          { term: "Ethereum (ETH)", definition: "Näst största kryptovalutan. En plattform där man kan bygga program (smarta kontrakt) på blockkedjan." },
          { term: "ETF", definition: "En börshandlad fond. Bitcoin-ETF:er låter dig investera i bitcoin via vanlig aktiehandel." },
          { term: "FOMO", definition: "Fear Of Missing Out – rädslan att missa en uppgång, som ofta får folk att köpa när priset redan är högt." },
          { term: "Gas fee", definition: "Avgiften du betalar för att genomföra en transaktion på t.ex. Ethereum." },
          { term: "Halvering (halving)", definition: "Ungefär vart fjärde år halveras belöningen till bitcoin-miners, vilket minskar takten som nya bitcoin skapas." },
          { term: "HODL", definition: "Slang för att behålla sina krypto långsiktigt i stället för att sälja vid svängningar." },
          { term: "Hårdvaruplånbok", definition: "En liten fysisk enhet (t.ex. Ledger eller Trezor) som förvarar dina privata nycklar offline." },
          { term: "KYC", definition: "Know Your Customer – när en börs kontrollerar vem du är, t.ex. med BankID." },
          { term: "Marknadsvärde (market cap)", definition: "Priset per mynt gånger antalet mynt i omlopp. Visar hur stor en kryptovaluta är." },
          { term: "MiCA", definition: "EU:s regelverk för kryptotillgångar. Börser som riktar sig till svenskar måste ha tillstånd enligt MiCA." },
          { term: "Mining", definition: "Processen där datorer löser beräkningar för att verifiera transaktioner och får nya mynt som belöning." },
          { term: "NFT", definition: "Non-Fungible Token – ett unikt digitalt bevis på ägande, t.ex. av en bild eller biljett." },
          { term: "Privat nyckel", definition: "Den hemliga koden som ger tillgång till dina krypto. Den som har nyckeln äger pengarna." },
          { term: "Proof of Stake", definition: "Ett sätt att säkra en blockkedja där deltagare låser in mynt i stället för att använda datorkraft. Används av Ethereum." },
          { term: "Proof of Work", definition: "Ett sätt att säkra en blockkedja med datorkraft (mining). Används av bitcoin." },
          { term: "Rug pull", definition: "Bedrägeri där skaparna av ett projekt plötsligt försvinner med investerarnas pengar." },
          { term: "Satoshi (sats)", definition: "Den minsta enheten av bitcoin: 0,00000001 BTC." },
          { term: "Seed phrase (återställningsfras)", definition: "12–24 ord som kan återställa din plånbok. Skriv ner den på papper och visa den aldrig för någon." },
          { term: "Smart kontrakt", definition: "Ett program på blockkedjan som utför något automatiskt när vissa villkor uppfylls." },
          { term: "Stablecoin", definition: "En kryptovaluta vars värde är knutet till t.ex. US-dollar eller euro, som USDC." },
          { term: "Staking", definition: "Att låsa in krypto för att hjälpa till att säkra en blockkedja och få belöning i gengäld." },
          { term: "Volatilitet", definition: "Hur mycket priset svänger. Krypto är mycket volatilt jämfört med t.ex. aktiefonder." },
          { term: "Wallet (plånbok)", definition: "En app eller enhet där du förvarar och skickar krypto." },
        ],
      },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
