import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import { useReports } from "@/hooks/useCryptoData";

export const Footer = () => {
  const { data: news } = useNews();
  const { data: reportsData } = useReports('daily', 3, 0);
  
  const latestNews = news?.slice(0, 3) || [];
  const latestReports = reportsData?.reports?.slice(0, 3) || [];

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">₿</span>
            </div>
            <span className="font-semibold text-foreground">EnkelCrypto</span>
          </div>
            <p className="text-sm text-muted-foreground">
              Daglig kryptosammanfattning på enkel svenska.
            </p>
            <div className="flex gap-4 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Hem</Link>
              <Link to="/arkiv" className="text-muted-foreground hover:text-primary transition-colors">Arkiv</Link>
              <Link to="/veckorapporter" className="text-muted-foreground hover:text-primary transition-colors">Veckorapporter</Link>
              <Link to="/om" className="text-muted-foreground hover:text-primary transition-colors">Om</Link>
            </div>
          </div>

          {/* Latest News */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Senaste nyheter</h3>
            <ul className="space-y-2">
              {latestNews.map((item) => (
                <li key={item.id}>
                  <Link 
                    to={`/nyhet/${item.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              {latestNews.length === 0 && (
                <li className="text-sm text-muted-foreground">Inga nyheter ännu</li>
              )}
            </ul>
          </div>

          {/* Latest Reports */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Senaste rapporter</h3>
            <ul className="space-y-2">
              {latestReports.map((report) => (
                <li key={report.id}>
                  <Link 
                    to={`/rapport/${report.type}/${report.date}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {report.title}
                  </Link>
                </li>
              ))}
              {latestReports.length === 0 && (
                <li className="text-sm text-muted-foreground">Inga rapporter ännu</li>
              )}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-border pt-6 space-y-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-sm">Ansvarsfriskrivning</p>
            <p>
              EnkelCrypto tillhandahåller enbart informationssammanfattningar om kryptomarknaden. 
              Inget innehåll på denna webbplats utgör finansiell rådgivning eller köp/sälj-rekommendationer.
            </p>
            <p>
              Kryptovalutor är mycket volatila och riskfyllda investeringar. Investera endast vad du har råd att förlora 
              och gör alltid din egen research innan du fattar investeringsbeslut.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} EnkelCrypto. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
