import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Clock, DollarSign, Zap, CheckCircle2 } from "lucide-react";

export default function TradingConditions() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Professional Trading Conditions
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Competitive Spreads & Leverage
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get access to institutional-grade trading conditions with tight spreads, flexible leverage, and transparent pricing
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Spreads Section */}
          <div className="mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Competitive Spreads</h2>
                    <p className="text-muted-foreground">Among the tightest in the industry</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-8">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4">Asset Class</th>
                        <th className="text-center p-4">Standard</th>
                        <th className="text-center p-4">Premium</th>
                        <th className="text-center p-4">ECN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { asset: "Forex (EUR/USD)", standard: "1.0 pips", premium: "0.5 pips", ecn: "0.0 pips" },
                        { asset: "Stocks (US)", standard: "$0.05", premium: "$0.02", ecn: "$0.01" },
                        { asset: "Indices (S&P 500)", standard: "1.0 points", premium: "0.5 points", ecn: "0.1 points" },
                        { asset: "Commodities (Gold)", standard: "$0.50", premium: "$0.30", ecn: "$0.10" },
                        { asset: "Crypto (BTC/USD)", standard: "$20", premium: "$15", ecn: "$10" }
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4 font-medium">{row.asset}</td>
                          <td className="p-4 text-center text-muted-foreground">{row.standard}</td>
                          <td className="p-4 text-center text-muted-foreground">{row.premium}</td>
                          <td className="p-4 text-center text-primary font-semibold hover:text-primary/80 transition-colors duration-150 cursor-pointer">{row.ecn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-muted-foreground">
                  * Spreads shown are typical and may vary based on market conditions. Forex spreads are floating and may widen during low liquidity periods.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leverage Section */}
          <div className="mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Flexible Leverage</h2>
                    <p className="text-muted-foreground">Trade with up to 1:500 leverage</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Maximum Leverage by Asset</h3>
                    <div className="space-y-4">
                      {[
                        { asset: "Forex", leverage: "1:500" },
                        { asset: "Indices", leverage: "1:500" },
                        { asset: "Commodities", leverage: "1:500" },
                        { asset: "Stocks", leverage: "1:20" },
                        { asset: "Cryptocurrencies", leverage: "1:100" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <span className="font-medium hover:text-foreground transition-colors duration-150 cursor-pointer">{item.asset}</span>
                          <span className="text-primary font-semibold hover:text-primary/80 transition-colors duration-150 cursor-pointer">{item.leverage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 text-warning">Leverage Risk Warning</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Leverage can amplify both gains and losses. A 10% market move with 1:10 leverage results in a 100% account change. Trade responsibly and always use stop-loss orders.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Our platform includes automatic margin call alerts and forced liquidation at 50% equity to protect your account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Hours Section */}
          <div className="mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Trading Hours</h2>
                    <p className="text-muted-foreground">24/5 global market access</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      market: "Forex",
                      hours: "Sunday 22:00 - Friday 21:00 (GMT)",
                      detail: "24 hours, 5 days per week"
                    },
                    {
                      market: "Stocks (US)",
                      hours: "14:30 - 21:00 GMT",
                      detail: "Pre-market (14:00-14:30) and After-hours (21:00-22:00) available"
                    },
                    {
                      market: "Stocks (UK)",
                      hours: "08:00 - 16:30 GMT",
                      detail: "London Stock Exchange trading hours"
                    },
                    {
                      market: "Stocks (EU)",
                      hours: "08:00 - 16:30 CET",
                      detail: "European market hours"
                    },
                    {
                      market: "Indices",
                      hours: "Varies by index",
                      detail: "Most indices trade 24/5 with short breaks"
                    },
                    {
                      market: "Cryptocurrencies",
                      hours: "24/7/365",
                      detail: "Trade 24 hours a day, 7 days a week, 365 days per year"
                    }
                  ].map((item, i) => (
                    <Card key={i} className="bg-muted/50 border-border">
                      <CardContent>
                        <h3 className="font-semibold mb-2">{item.market}</h3>
                        <p className="text-sm text-primary font-semibold mb-2">{item.hours}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fees Section */}
          <div className="mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Transparent Pricing</h2>
                    <p className="text-muted-foreground">No hidden charges or commissions</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">What We Charge</h3>
                    <ul className="space-y-4">
                      {[
                        { item: "Spread on Forex", price: "Included in price" },
                        { item: "Commission on Stocks", price: "From $0.02/share" },
                        { item: "Overnight Swap Fee", price: "Market rate" },
                        { item: "Withdrawal Fee", price: "Free" },
                        { item: "Deposit Fee", price: "Free" },
                        { item: "Account Fee", price: "Free" }
                      ].map((fee, i) => (
                        <li key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{fee.item}</span>
                          <span className="font-semibold text-sm">{fee.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">What We Don't Charge</h3>
                    <ul className="space-y-4">
                      {[
                        "Account maintenance fees",
                        "Inactivity fees",
                        "MT4/MT5 subscription",
                        "Platform fees",
                        "Data feed charges",
                        "Educational materials"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 bg-accent/10 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Trading with Professional Conditions</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access competitive spreads, flexible leverage, and transparent pricing
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95">
                      Open Account
                    </Button>
                  </Link>
                  <Link to="/trading/account-types">
                    <Button size="lg" variant="outline">
                      View Account Types
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
