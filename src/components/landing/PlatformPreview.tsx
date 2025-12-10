import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  LineChart, 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Shield,
  ArrowRight,
  Play
} from "lucide-react";

const platformFeatures = [
  {
    icon: LineChart,
    title: "Advanced Charts",
    description: "TradingView integration with 100+ indicators"
  },
  {
    icon: BarChart3,
    title: "Real-Time Data",
    description: "Live market prices updated every second"
  },
  {
    icon: Wallet,
    title: "Portfolio Tracking",
    description: "Monitor P&L, margin, and positions"
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Stop-loss, take-profit & trailing stops"
  }
];

export function PlatformPreview() {
  return (
    <section className="py-20 md:py-24 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
            Platform Preview
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            See TradeX Pro
            <span className="block mt-2 bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience professional-grade trading tools designed for serious traders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Platform Screenshot Mockup */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-gold/20 to-accent/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <Card className="relative bg-card border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
                  <div className="h-3 w-3 rounded-full bg-warning/60"></div>
                  <div className="h-3 w-3 rounded-full bg-accent/60"></div>
                </div>
                <span className="text-sm text-muted-foreground ml-2">TradeX Pro - Trading Dashboard</span>
              </div>
              <CardContent className="p-0">
                {/* Simplified Platform UI Mockup */}
                <div className="bg-background p-4 min-h-[300px]">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Balance</div>
                      <div className="text-lg font-bold text-gold">$50,000.00</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Equity</div>
                      <div className="text-lg font-bold text-accent">$52,340.50</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Profit</div>
                      <div className="text-lg font-bold text-accent">+$2,340.50</div>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-muted/30 rounded-lg p-4 mb-4 h-32 flex items-center justify-center border border-border/50">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <LineChart className="h-8 w-8" />
                      <span>Live EUR/USD Chart</span>
                    </div>
                  </div>
                  
                  {/* Trading Panel Mockup */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-buy hover:bg-buy-hover text-buy-foreground">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      BUY
                    </Button>
                    <Button className="bg-sell hover:bg-sell-hover text-sell-foreground">
                      <TrendingUp className="mr-2 h-4 w-4 rotate-180" />
                      SELL
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <div className="space-y-8">
            <div className="space-y-6">
              {platformFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold-hover w-full sm:w-auto">
                  Try It Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
