import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, TrendingUp, BarChart3, LineChart, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TradingInstruments() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade 500+ Instruments
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Across 5 Asset Classes
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access global markets with competitive spreads, flexible leverage, and professional trading conditions
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                    Start Trading
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline">
                    Try Demo Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="forex" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-8">
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="indices">Indices</TabsTrigger>
              <TabsTrigger value="commodities">Commodities</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>

            {/* Forex Tab */}
            <TabsContent value="forex">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <Globe className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Forex CFDs</h2>
                      <p className="text-muted-foreground">Trade 50+ currency pairs with tight spreads</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Why Trade Forex with Us?</h3>
                      <ul className="space-y-4">
                        {[
                          "Spreads from 0.0 pips on ECN accounts",
                          "Leverage up to 1:500",
                          "24/5 market access",
                          "No commissions on Standard accounts",
                          "Instant execution with no requotes",
                          "Deep liquidity from tier-1 providers"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Pairs</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Major Pairs</h4>
                          <p className="text-sm text-muted-foreground">EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Minor Pairs</h4>
                          <p className="text-sm text-muted-foreground">EUR/GBP, EUR/AUD, GBP/JPY, EUR/JPY, GBP/CAD, and 20+ more</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Exotic Pairs</h4>
                          <p className="text-sm text-muted-foreground">USD/TRY, EUR/TRY, USD/ZAR, USD/MXN, USD/SGD, and more</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Trading Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4">Pair</th>
                          <th className="text-left p-4">Typical Spread</th>
                          <th className="text-left p-4">Max Leverage</th>
                          <th className="text-left p-4">Trading Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { pair: "EUR/USD", spread: "0.1 pips", leverage: "1:500", hours: "24/5" },
                          { pair: "GBP/USD", spread: "0.2 pips", leverage: "1:500", hours: "24/5" },
                          { pair: "USD/JPY", spread: "0.1 pips", leverage: "1:500", hours: "24/5" },
                          { pair: "AUD/USD", spread: "0.2 pips", leverage: "1:500", hours: "24/5" },
                          { pair: "USD/CAD", spread: "0.3 pips", leverage: "1:500", hours: "24/5" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 font-medium">{row.pair}</td>
                            <td className="p-4 text-muted-foreground">{row.spread}</td>
                            <td className="p-4 text-muted-foreground">{row.leverage}</td>
                            <td className="p-4 text-muted-foreground">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stocks Tab */}
            <TabsContent value="stocks">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Stock CFDs</h2>
                      <p className="text-muted-foreground">Trade 200+ global stocks with leverage</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Why Trade Stocks with Us?</h3>
                      <ul className="space-y-4">
                        {[
                          "Commission from $0.02 per share",
                          "Leverage up to 1:20",
                          "Go long or short on price movements",
                          "No stamp duty or exchange fees",
                          "Dividend adjustments on long positions",
                          "Access to US, UK, EU markets"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Markets</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">US Stocks</h4>
                          <p className="text-sm text-muted-foreground">Apple, Microsoft, Tesla, Amazon, Google, Netflix, Meta, Nvidia, and 100+ more</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">UK Stocks</h4>
                          <p className="text-sm text-muted-foreground">BP, HSBC, Vodafone, Lloyds, Barclays, and 30+ more</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">EU Stocks</h4>
                          <p className="text-sm text-muted-foreground">SAP, Siemens, BMW, Volkswagen, Total, and 50+ more</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Popular Stock CFDs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4">Stock</th>
                          <th className="text-left p-4">Commission</th>
                          <th className="text-left p-4">Max Leverage</th>
                          <th className="text-left p-4">Market Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { stock: "Apple (AAPL)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00 GMT" },
                          { stock: "Tesla (TSLA)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00 GMT" },
                          { stock: "Microsoft (MSFT)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00 GMT" },
                          { stock: "Amazon (AMZN)", commission: "$0.02/share", leverage: "1:20", hours: "14:30-21:00 GMT" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 font-medium">{row.stock}</td>
                            <td className="p-4 text-muted-foreground">{row.commission}</td>
                            <td className="p-4 text-muted-foreground">{row.leverage}</td>
                            <td className="p-4 text-muted-foreground">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Indices Tab */}
            <TabsContent value="indices">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Indices CFDs</h2>
                      <p className="text-muted-foreground">Trade 20+ major global indices</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Why Trade Indices with Us?</h3>
                      <ul className="space-y-4">
                        {[
                          "Tight spreads from 0.4 points",
                          "Leverage up to 1:500",
                          "Trade 24/5 on major indices",
                          "No expiry dates on CFDs",
                          "Diversified market exposure",
                          "Lower volatility than individual stocks"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Indices</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">US Indices</h4>
                          <p className="text-sm text-muted-foreground">S&P 500, Nasdaq 100, Dow Jones 30, Russell 2000</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">European Indices</h4>
                          <p className="text-sm text-muted-foreground">FTSE 100, DAX 40, CAC 40, Euro Stoxx 50</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Asian Indices</h4>
                          <p className="text-sm text-muted-foreground">Nikkei 225, Hang Seng, ASX 200</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Index Trading Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4">Index</th>
                          <th className="text-left p-4">Typical Spread</th>
                          <th className="text-left p-4">Max Leverage</th>
                          <th className="text-left p-4">Trading Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { index: "S&P 500", spread: "0.4 points", leverage: "1:500", hours: "24/5" },
                          { index: "Nasdaq 100", spread: "0.8 points", leverage: "1:500", hours: "24/5" },
                          { index: "DAX 40", spread: "1.0 points", leverage: "1:500", hours: "07:00-21:00 GMT" },
                          { index: "FTSE 100", spread: "1.0 points", leverage: "1:500", hours: "07:00-21:00 GMT" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 font-medium">{row.index}</td>
                            <td className="p-4 text-muted-foreground">{row.spread}</td>
                            <td className="p-4 text-muted-foreground">{row.leverage}</td>
                            <td className="p-4 text-muted-foreground">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commodities Tab */}
            <TabsContent value="commodities">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <LineChart className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Commodity CFDs</h2>
                      <p className="text-muted-foreground">Trade precious metals, energy, and soft commodities</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Why Trade Commodities with Us?</h3>
                      <ul className="space-y-4">
                        {[
                          "Competitive spreads on gold and oil",
                          "Leverage up to 1:500",
                          "24/5 trading on major commodities",
                          "Portfolio diversification",
                          "Hedge against inflation",
                          "No physical delivery required"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Commodities</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Precious Metals</h4>
                          <p className="text-sm text-muted-foreground">Gold (XAU/USD), Silver (XAG/USD), Platinum, Palladium</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Energy</h4>
                          <p className="text-sm text-muted-foreground">Crude Oil (WTI & Brent), Natural Gas</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Agricultural</h4>
                          <p className="text-sm text-muted-foreground">Coffee, Sugar, Wheat, Corn, Soybeans</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Commodity Trading Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4">Commodity</th>
                          <th className="text-left p-4">Typical Spread</th>
                          <th className="text-left p-4">Max Leverage</th>
                          <th className="text-left p-4">Trading Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { commodity: "Gold (XAU/USD)", spread: "$0.10", leverage: "1:500", hours: "24/5" },
                          { commodity: "Silver (XAG/USD)", spread: "$0.02", leverage: "1:500", hours: "24/5" },
                          { commodity: "WTI Crude Oil", spread: "$0.03", leverage: "1:500", hours: "24/5" },
                          { commodity: "Natural Gas", spread: "$0.01", leverage: "1:100", hours: "24/5" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 font-medium">{row.commodity}</td>
                            <td className="p-4 text-muted-foreground">{row.spread}</td>
                            <td className="p-4 text-muted-foreground">{row.leverage}</td>
                            <td className="p-4 text-muted-foreground">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crypto Tab */}
            <TabsContent value="crypto">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Cryptocurrency CFDs</h2>
                      <p className="text-muted-foreground">Trade 50+ crypto pairs 24/7</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Why Trade Crypto with Us?</h3>
                      <ul className="space-y-4">
                        {[
                          "24/7 trading including weekends",
                          "Leverage up to 1:100",
                          "No crypto wallet required",
                          "Go long or short on volatility",
                          "Competitive spreads on majors",
                          "No exchange or custody fees"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Cryptocurrencies</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Major Crypto</h4>
                          <p className="text-sm text-muted-foreground">Bitcoin, Ethereum, Litecoin, Ripple, Bitcoin Cash</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Altcoins</h4>
                          <p className="text-sm text-muted-foreground">Cardano, Polkadot, Chainlink, Solana, Avalanche</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">DeFi Tokens</h4>
                          <p className="text-sm text-muted-foreground">Uniswap, Aave, Compound, and 30+ more</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Crypto Trading Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4">Cryptocurrency</th>
                          <th className="text-left p-4">Typical Spread</th>
                          <th className="text-left p-4">Max Leverage</th>
                          <th className="text-left p-4">Trading Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { crypto: "BTC/USD", spread: "$10", leverage: "1:100", hours: "24/7" },
                          { crypto: "ETH/USD", spread: "$2", leverage: "1:100", hours: "24/7" },
                          { crypto: "XRP/USD", spread: "$0.002", leverage: "1:50", hours: "24/7" },
                          { crypto: "LTC/USD", spread: "$0.50", leverage: "1:50", hours: "24/7" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 font-medium">{row.crypto}</td>
                            <td className="p-4 text-muted-foreground">{row.spread}</td>
                            <td className="p-4 text-muted-foreground">{row.leverage}</td>
                            <td className="p-4 text-muted-foreground">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-6 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-warning">Crypto Risk Warning:</strong> Cryptocurrencies are extremely volatile and carry substantial risk. Prices can fluctuate dramatically in short periods. Only trade with funds you can afford to lose.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Open an account today and access 500+ instruments with professional trading conditions
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Open Live Account
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline">
                      Try Demo Free
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
