import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DailyReport = () => {
  const today = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="p-6 md:p-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Ny rapport
          </Badge>
          <span className="text-sm text-muted-foreground">{today}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Dagens Kryptorapport
        </h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          Marknaden visar blandade signaler idag med Bitcoin som håller sig stabilt kring 487 000 kr 
          medan Ethereum tappar något under dagen.
        </p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Marknadsläge</h2>
          <p className="text-foreground/90 leading-relaxed">
            Den totala kryptomarknaden ligger på 42,8 biljoner kronor, upp 1,8% senaste dygnet. 
            Bitcoin fortsätter att dominera med en marknadsandel på 54%, vilket tyder på att 
            investerare söker säkerhet i den största kryptovalutan.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Drivande Faktorer</h2>
          <p className="text-foreground/90 leading-relaxed">
            Dagens rörelser verkar främst drivas av positiva signaler från makroekonomisk data. 
            Institutionella investerare fortsätter att visa intresse, särskilt för Bitcoin och 
            större altcoins. Volatiliteten ligger på måttliga nivåer, vilket kan tolkas som att 
            marknaden befinner sig i en konsolideringsfas.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Bitcoin och Ethereum</h2>
          <p className="text-foreground/90 leading-relaxed">
            Bitcoin handlas för närvarande kring 487 000 kr, upp 2,4% på 24 timmar. Priset har 
            stabiliserats efter en tidigare volatil period. Ethereum däremot har backat 1,2% 
            och handlas kring 28 700 kr. Detta kan delvis förklaras av vinsthemtagningar efter 
            den senaste tidens uppgång.
          </p>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground italic">
              Det här är läget just nu. Kom ihåg att kryptomarknaden är mycket volatil och att 
              detta inte är finansiell rådgivning. Gör alltid din egen research innan du investerar.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
