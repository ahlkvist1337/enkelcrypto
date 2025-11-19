import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Report } from "@/hooks/useCryptoData";

interface DailyReportProps {
  report?: Report;
}

export const DailyReport = ({ report }: DailyReportProps) => {
  const today = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatContent = (content: string) => {
    // Convert **text** to <strong>text</strong> for bold formatting
    return content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  if (!report) {
    return (
      <Card className="p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
              Ingen rapport
            </Badge>
            <span className="text-sm text-muted-foreground">{today}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Dagens Kryptorapport
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Ingen rapport tillgänglig för idag. Rapporten genereras automatiskt varje dag.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Ny rapport
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(report.date).toLocaleDateString("sv-SE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {report.title}
        </h1>

        <div className="prose prose-slate max-w-none">
          <div 
            className="text-foreground/90 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(report.content) }}
          />
        </div>
      </div>
    </Card>
  );
};
