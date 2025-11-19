export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">₿</span>
            </div>
            <span className="font-semibold text-foreground">EnkelCrypto</span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Ansvarsfriskrivning</p>
            <p>
              EnkelCrypto tillhandahåller enbart informationssammanfattningar om kryptomarknaden. 
              Inget innehåll på denna webbplats utgör finansiell rådgivning eller köp/sälj-rekommendationer.
            </p>
            <p>
              Kryptovalutor är mycket volatila och riskfyllda investeringar. Investera endast vad du har råd att förlora 
              och gör alltid din egen research innan du fattar investeringsbeslut.
            </p>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} EnkelCrypto. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
