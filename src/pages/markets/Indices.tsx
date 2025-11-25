import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, CheckCircle2 } from "lucide-react";

export default function Indices() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade Global Indices
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  20+ Major Stock Market Indices
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trade diversified market exposure with tight spreads and high leverage
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Trade Indices?</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Tight spreads from 0.4 points",
                    "Leverage up to 1:500",
                    "Trade 24/5 on major indices",
                    "No expiry dates on CFDs",
                    "Diversified market exposure",
                    "Lower volatility than individual stocks",
                    "Track economic performance",
                    "Hedge portfolio exposure"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">Available Indices</h2>
                <div className="space-y-4">
                  {[
                    { region: "US Indices", indices: "S&P 500, Nasdaq 100, Dow Jones 30, Russell 2000" },
                    { region: "European", indices: "FTSE 100, DAX 40, CAC 40, Euro Stoxx 50" },
                    { region: "Asian", indices: "Nikkei 225, Hang Seng, ASX 200, Shanghai Composite" },
                    { region: "Other", indices: "TSX (Canada), SGX (Singapore), Kospi (Korea)" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold mb-2">{item.region}</p>
                      <p className="text-xs text-muted-foreground">{item.indices}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Index Trading Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Index</th>
                      <th className="text-center p-4">Typical Spread</th>
                      <th className="text-center p-4">Max Leverage</th>
                      <th className="text-center p-4">Trading Hours (GMT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { index: "S&P 500", spread: "0.4 points", leverage: "1:500", hours: "24/5" },
                      { index: "Nasdaq 100", spread: "0.8 points", leverage: "1:500", hours: "24/5" },
                      { index: "Dow Jones 30", spread: "1.0 point", leverage: "1:500", hours: "24/5" },
                      { index: "DAX 40", spread: "1.0 points", leverage: "1:500", hours: "07:00-21:00" },
                      { index: "FTSE 100", spread: "1.0 points", leverage: "1:500", hours: "07:00-21:00" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.index}</td>
                        <td className="p-4 text-center">{row.spread}</td>
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
                <h2 className="text-3xl font-bold mb-4">Start Trading Indices Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access 20+ major indices with professional conditions
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95">
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
