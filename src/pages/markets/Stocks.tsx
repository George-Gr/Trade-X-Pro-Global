import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, CheckCircle2 } from "lucide-react";

export default function Stocks() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade Global Stocks
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  200+ Top-Performing Companies
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access stocks from US, UK, and EU exchanges with leverage and no stamp duty
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Trade Stocks?</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Go long or short on price movements",
                    "Commission from $0.02 per share",
                    "Leverage up to 1:20",
                    "No stamp duty or exchange fees",
                    "Dividend adjustments on long positions",
                    "Access to US, UK, EU markets",
                    "Real-time execution",
                    "Margin monitoring and alerts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">Popular Stocks</h2>
                <div className="space-y-4">
                  {[
                    { market: "US Tech", stocks: "Apple, Microsoft, Tesla, Amazon, Google, Meta, Nvidia" },
                    { market: "US Finance", stocks: "JPMorgan, Goldman Sachs, Bank of America, Morgan Stanley" },
                    { market: "UK Stocks", stocks: "BP, HSBC, Vodafone, Lloyds, Barclays" },
                    { market: "EU Stocks", stocks: "SAP, Siemens, BMW, Volkswagen, Total" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold mb-2">{item.market}</p>
                      <p className="text-xs text-muted-foreground">{item.stocks}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Stock Trading Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Stock</th>
                      <th className="text-center p-4">Commission</th>
                      <th className="text-center p-4">Max Leverage</th>
                      <th className="text-center p-4">Trading Hours (GMT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { stock: "Apple (AAPL)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00" },
                      { stock: "Tesla (TSLA)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00" },
                      { stock: "Microsoft (MSFT)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00" },
                      { stock: "Amazon (AMZN)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00" },
                      { stock: "HSBC (HSBA)", commission: "$0.02/share", leverage: "1:20", hours: "08:00-16:30" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.stock}</td>
                        <td className="p-4 text-center">{row.commission}</td>
                        <td className="p-4 text-center">{row.leverage}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Trading Stocks Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access 200+ global stocks with professional conditions
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Open Account
                    </Button>
                  </Link>
                  <Link to="/markets">
                    <Button size="lg" variant="outline">
                      Explore Other Markets
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
