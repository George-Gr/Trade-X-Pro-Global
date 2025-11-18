import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Forex() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade Forex with TradeX Pro
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  The World's Most Traded Market
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access 50+ currency pairs with tight spreads, high leverage, and 24/5 market access
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trading Advantages */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Trade Forex?</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Highest liquidity - $6 trillion daily volume",
                    "Tight spreads from 0.0 pips on ECN accounts",
                    "Leverage up to 1:500",
                    "24 hours, 5 days per week trading",
                    "No commission on Standard accounts",
                    "Access to major, minor, and exotic pairs",
                    "Instant execution with no requotes",
                    "Deep liquidity from tier-1 providers"
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
                <h2 className="text-3xl font-bold mb-6">Forex Trading Hours</h2>
                <div className="space-y-4">
                  {[
                    { session: "Sydney", time: "22:00-07:00 GMT" },
                    { session: "Tokyo", time: "23:00-08:00 GMT" },
                    { session: "London", time: "08:00-17:00 GMT" },
                    { session: "New York", time: "13:00-22:00 GMT" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <span className="font-semibold">{item.session}</span>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Currency Pairs */}
          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Available Currency Pairs</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Major Pairs (7)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Most liquid pairs with tightest spreads</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"].map((pair, i) => (
                      <div key={i} className="p-4 bg-muted/50 rounded text-sm font-semibold">{pair}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Minor Pairs (15+)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Cross-currency pairs with good liquidity</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["EUR/GBP", "EUR/AUD", "GBP/JPY", "EUR/JPY", "GBP/CAD", "AUD/CAD", "NZD/JPY", "CAD/JPY"].map((pair, i) => (
                      <div key={i} className="p-4 bg-muted/50 rounded text-sm font-semibold">{pair}</div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">Exotic Pairs (20+)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Emerging market and alternative currency pairs</p>
                  <div className="grid grid-cols-3 gap-4">
                    {["USD/TRY", "EUR/TRY", "USD/ZAR", "USD/MXN", "USD/SGD", "USD/HKD", "USD/INR", "USD/RUB", "USD/SEK"].map((pair, i) => (
                      <div key={i} className="p-4 bg-muted/50 rounded text-sm font-semibold">{pair}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Specifications */}
          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Trading Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Pair</th>
                      <th className="text-center p-4">Standard Spread</th>
                      <th className="text-center p-4">Max Leverage</th>
                      <th className="text-center p-4">Min Lot</th>
                      <th className="text-center p-4">Trading Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { pair: "EUR/USD", spread: "0.1", leverage: "1:500", lot: "0.01", hours: "24/5" },
                      { pair: "GBP/USD", spread: "0.2", leverage: "1:500", lot: "0.01", hours: "24/5" },
                      { pair: "USD/JPY", spread: "0.1", leverage: "1:500", lot: "0.01", hours: "24/5" },
                      { pair: "USD/CHF", spread: "0.3", leverage: "1:500", lot: "0.01", hours: "24/5" },
                      { pair: "AUD/USD", spread: "0.2", leverage: "1:500", lot: "0.01", hours: "24/5" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.pair}</td>
                        <td className="p-4 text-center">{row.spread}</td>
                        <td className="p-4 text-center">{row.leverage}</td>
                        <td className="p-4 text-center">{row.lot}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Trading Forex Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access 50+ currency pairs with professional conditions
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
