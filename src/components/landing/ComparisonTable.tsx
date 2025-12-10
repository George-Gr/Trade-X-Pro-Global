import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus } from "lucide-react";

const comparisonData = [
  {
    feature: "Virtual Capital",
    tradexPro: "$50,000",
    competitorA: "$10,000",
    competitorB: "$100,000"
  },
  {
    feature: "Trading Instruments",
    tradexPro: "500+",
    competitorA: "100+",
    competitorB: "200+"
  },
  {
    feature: "Real-Time Data",
    tradexPro: true,
    competitorA: true,
    competitorB: "Delayed"
  },
  {
    feature: "TradingView Charts",
    tradexPro: true,
    competitorA: false,
    competitorB: true
  },
  {
    feature: "Risk Management Tools",
    tradexPro: true,
    competitorA: "Basic",
    competitorB: true
  },
  {
    feature: "Mobile Responsive",
    tradexPro: true,
    competitorA: true,
    competitorB: false
  },
  {
    feature: "Order Templates",
    tradexPro: true,
    competitorA: false,
    competitorB: false
  },
  {
    feature: "Trailing Stop-Loss",
    tradexPro: true,
    competitorA: false,
    competitorB: true
  },
  {
    feature: "Monthly Cost",
    tradexPro: "Free",
    competitorA: "$29/mo",
    competitorB: "Free (ads)"
  }
];

const renderValue = (value: string | boolean) => {
  if (value === true) {
    return <Check className="h-5 w-5 text-accent mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-destructive mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
};

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
            Platform Comparison
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Why Choose
            <span className="block mt-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              TradeX Pro?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See how we compare to other virtual trading platforms
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <Card className="border-border">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4">
                      <div className="flex flex-col items-center">
                        <Badge className="bg-gold text-gold-foreground mb-1">Recommended</Badge>
                        <span className="font-bold text-lg">TradeX Pro</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Competitor A</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Competitor B</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                    >
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center bg-gold/5">
                        <span className="font-semibold text-gold">
                          {renderValue(row.tradexPro)}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        {renderValue(row.competitorA)}
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        {renderValue(row.competitorB)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
