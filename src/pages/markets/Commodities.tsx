import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LineChart, CheckCircle2 } from "lucide-react";

export default function Commodities() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Trade Commodities
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Precious Metals, Energy & Agriculture
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trade 30+ commodities with competitive spreads and portfolio diversification
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <LineChart className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Trade Commodities?</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    "Competitive spreads on gold and oil",
                    "Leverage up to 1:500",
                    "24/5 trading on major commodities",
                    "Portfolio diversification",
                    "Hedge against inflation",
                    "No physical delivery required",
                    "Spot and futures available",
                    "Access global commodity markets"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">Available Commodities</h2>
                <div className="space-y-4">
                  {[
                    { category: "Precious Metals", items: "Gold, Silver, Platinum, Palladium" },
                    { category: "Energy", items: "WTI Crude Oil, Brent Crude, Natural Gas" },
                    { category: "Agricultural", items: "Coffee, Sugar, Wheat, Corn, Soybeans" },
                    { category: "Industrial", items: "Copper, Aluminium, Zinc, Nickel" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold mb-2">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.items}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Commodity Trading Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">Commodity</th>
                      <th className="text-center p-3">Typical Spread</th>
                      <th className="text-center p-3">Max Leverage</th>
                      <th className="text-center p-3">Trading Hours (GMT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { commodity: "Gold (XAU/USD)", spread: "$0.10", leverage: "1:500", hours: "24/5" },
                      { commodity: "Silver (XAG/USD)", spread: "$0.02", leverage: "1:500", hours: "24/5" },
                      { commodity: "WTI Crude Oil", spread: "$0.03", leverage: "1:500", hours: "24/5" },
                      { commodity: "Brent Crude", spread: "$0.03", leverage: "1:500", hours: "24/5" },
                      { commodity: "Natural Gas", spread: "$0.01", leverage: "1:100", hours: "24/5" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium">{row.commodity}</td>
                        <td className="p-3 text-center">{row.spread}</td>
                        <td className="p-3 text-center">{row.leverage}</td>
                        <td className="p-3 text-center text-muted-foreground">{row.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Start Trading Commodities Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access 30+ commodities with professional conditions
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
