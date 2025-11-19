import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, CheckCircle2 } from "lucide-react";

export default function Cryptocurrencies() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade Cryptocurrencies
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  50+ Crypto Pairs - 24/7 Trading
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trade digital assets with leverage and competitive spreads, no wallet required
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
                    <Zap className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Trade Crypto?</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "24/7 trading including weekends",
                    "Leverage up to 1:100",
                    "No crypto wallet required",
                    "Go long or short on volatility",
                    "Competitive spreads on majors",
                    "No exchange or custody fees",
                    "Real-time execution",
                    "Advanced order types"
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
                <h2 className="text-3xl font-bold mb-6">Available Cryptocurrencies</h2>
                <div className="space-y-4">
                  {[
                    { category: "Major Crypto", items: "Bitcoin, Ethereum, Litecoin, Ripple, Bitcoin Cash" },
                    { category: "Altcoins", items: "Cardano, Polkadot, Chainlink, Solana, Avalanche" },
                    { category: "DeFi Tokens", items: "Uniswap, Aave, Compound, Curve, Balancer" },
                    { category: "Others", items: "Dogecoin, Shiba Inu, Polygon, Arbitrum, Optimism" }
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

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Crypto Trading Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Cryptocurrency</th>
                      <th className="text-center p-4">Typical Spread</th>
                      <th className="text-center p-4">Max Leverage</th>
                      <th className="text-center p-4">Trading Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { crypto: "BTC/USD", spread: "$10", leverage: "1:100", hours: "24/7" },
                      { crypto: "ETH/USD", spread: "$2", leverage: "1:100", hours: "24/7" },
                      { crypto: "XRP/USD", spread: "$0.002", leverage: "1:50", hours: "24/7" },
                      { crypto: "LTC/USD", spread: "$0.50", leverage: "1:50", hours: "24/7" },
                      { crypto: "ADA/USD", spread: "$0.0005", leverage: "1:50", hours: "24/7" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.crypto}</td>
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

          <div className="mb-8 p-6 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-warning">Crypto Risk Warning:</strong> Cryptocurrencies are extremely volatile and carry substantial risk. Prices can fluctuate dramatically in short periods. Only trade with funds you can afford to lose. Past performance is not indicative of future results.
            </p>
          </div>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Trading Crypto Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access 50+ cryptocurrencies with professional trading conditions
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
