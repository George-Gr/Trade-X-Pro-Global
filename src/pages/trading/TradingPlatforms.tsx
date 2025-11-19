import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Zap, TrendingUp, BarChart3, CheckCircle2 } from "lucide-react";

export default function TradingPlatforms() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Trade on Any Platform
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Desktop, Web, or Mobile
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access our advanced trading platforms from any device with seamless synchronization and professional features
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: Monitor,
                title: "Desktop Platform",
                description: "Professional trading terminal for in-depth analysis and execution",
                features: [
                  "Advanced charting with 100+ indicators",
                  "Multi-window trading layout",
                  "Custom watchlists and alerts",
                  "One-click order execution",
                  "Portfolio analytics dashboard"
                ],
                download: "Download MetaTrader 5"
              },
              {
                icon: Smartphone,
                title: "Mobile App",
                description: "Trade on the go with full platform functionality",
                features: [
                  "Native iOS & Android apps",
                  "Real-time push notifications",
                  "Touch-optimized interface",
                  "Biometric authentication",
                  "Offline order placement"
                ],
                download: "Download Mobile App"
              },
              {
                icon: Zap,
                title: "Web Trader",
                description: "Browser-based trading without installation",
                features: [
                  "No installation required",
                  "Cross-platform compatible",
                  "TradingView integration",
                  "Responsive design",
                  "Instant access from anywhere"
                ],
                download: "Launch Web Platform"
              }
            ].map((platform, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent>
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <platform.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{platform.title}</h3>
                  <p className="text-muted-foreground mb-6">{platform.description}</p>
                  
                  <ul className="space-y-4 mb-8">
                    {platform.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                    {platform.download}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Comparison */}
          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Platform Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4">Desktop</th>
                      <th className="text-center p-4">Web</th>
                      <th className="text-center p-4">Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Real-Time Charts", desktop: true, web: true, mobile: true },
                      { feature: "Advanced Indicators", desktop: true, web: true, mobile: true },
                      { feature: "One-Click Trading", desktop: true, web: true, mobile: true },
                      { feature: "Custom Alerts", desktop: true, web: true, mobile: true },
                      { feature: "Portfolio Analytics", desktop: true, web: true, mobile: true },
                      { feature: "Order Templates", desktop: true, web: false, mobile: false },
                      { feature: "Offline Access", desktop: true, web: false, mobile: true },
                      { feature: "Multi-Monitor", desktop: true, web: false, mobile: false }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.desktop ? (
                            <CheckCircle2 className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.web ? (
                            <CheckCircle2 className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.mobile ? (
                            <CheckCircle2 className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
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
                <h2 className="text-3xl font-bold mb-4">Start Trading Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Choose your platform and begin trading with professional tools
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/trading/instruments">
                    <Button size="lg" variant="outline">
                      View Instruments
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
