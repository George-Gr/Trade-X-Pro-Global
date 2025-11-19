import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, TrendingUp, Users, Award, CheckCircle2, DollarSign } from "lucide-react";

export default function AccountTypes() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Choose Your Account Type
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Designed for Every Trader
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Select from our diverse range of account types, each tailored to meet different trading needs and styles
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              {
                icon: Zap,
                name: "Standard",
                description: "Perfect for beginners",
                minDeposit: "$1",
                leverage: "1:500",
                spread: "From 1.0 pips",
                features: [
                  "No commission fees",
                  "Flexible leverage",
                  "All trading hours",
                  "24/5 support",
                  "Copy trading enabled"
                ]
              },
              {
                icon: TrendingUp,
                name: "Premium",
                description: "For active traders",
                minDeposit: "$100",
                leverage: "1:500",
                spread: "From 0.5 pips",
                features: [
                  "Reduced spreads",
                  "Priority support",
                  "Expert advisors",
                  "Risk management tools",
                  "Trading signals included"
                ],
                highlighted: true
              },
              {
                icon: Zap,
                name: "ECN",
                description: "Professional traders",
                minDeposit: "$500",
                leverage: "1:500",
                spread: "From 0.0 pips",
                features: [
                  "Tight ECN spreads",
                  "Commission-based",
                  "Direct market access",
                  "Raw data feeds",
                  "Advanced algorithms"
                ]
              },
              {
                icon: Users,
                name: "Islamic",
                description: "Sharia-compliant",
                minDeposit: "$1",
                leverage: "1:500",
                spread: "From 1.0 pips",
                features: [
                  "No overnight fees",
                  "Halal trading",
                  "Swap-free",
                  "Religious compliance",
                  "Special hours support"
                ]
              },
              {
                icon: Award,
                name: "Corporate",
                description: "Business accounts",
                minDeposit: "$5,000",
                leverage: "1:500",
                spread: "From 0.1 pips",
                features: [
                  "Dedicated manager",
                  "Custom solutions",
                  "Volume discounts",
                  "API access",
                  "White-label options"
                ]
              }
            ].map((account, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-all duration-150 hover:-translate-y-1 ${
                  account.highlighted ? "ring-2 ring-primary md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <account.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{account.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{account.description}</p>
                  
                  <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Min Deposit</span>
                      <span className="font-semibold">{account.minDeposit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Leverage</span>
                      <span className="font-semibold">{account.leverage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Spread</span>
                      <span className="font-semibold">{account.spread}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {account.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95">
                    {account.highlighted ? "Get Premium" : "Open Account"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Detailed Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4">Standard</th>
                      <th className="text-center p-4">Premium</th>
                      <th className="text-center p-4">ECN</th>
                      <th className="text-center p-4">Islamic</th>
                      <th className="text-center p-4">Corporate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Maximum Leverage", standard: "1:500", premium: "1:500", ecn: "1:500", islamic: "1:500", corporate: "1:500" },
                      { feature: "Minimum Spread", standard: "1.0", premium: "0.5", ecn: "0.0", islamic: "1.0", corporate: "0.1" },
                      { feature: "Commission per lot", standard: "0%", premium: "0%", ecn: "0.1%", islamic: "0%", corporate: "0.05%" },
                      { feature: "24/5 Support", standard: true, premium: true, ecn: true, islamic: true, corporate: true },
                      { feature: "Trading Signals", standard: false, premium: true, ecn: true, islamic: false, corporate: true },
                      { feature: "Copy Trading", standard: true, premium: true, ecn: false, islamic: true, corporate: false },
                      { feature: "API Access", standard: false, premium: false, ecn: true, islamic: false, corporate: true }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center">
                          {typeof row.standard === "boolean" ? (
                            row.standard ? <CheckCircle2 className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            row.standard
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.premium === "boolean" ? (
                            row.premium ? <CheckCircle2 className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            row.premium
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.ecn === "boolean" ? (
                            row.ecn ? <CheckCircle2 className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            row.ecn
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.islamic === "boolean" ? (
                            row.islamic ? <CheckCircle2 className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            row.islamic
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.corporate === "boolean" ? (
                            row.corporate ? <CheckCircle2 className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            row.corporate
                          )}
                        </td>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Choose your preferred account type and start trading with TradeX Pro
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95">
                      Open Account
                    </Button>
                  </Link>
                  <Link to="/trading/conditions">
                    <Button size="lg" variant="outline">
                      View Conditions
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
