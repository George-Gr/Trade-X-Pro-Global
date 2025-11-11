import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Search, CheckCircle2 } from "lucide-react";

export default function Glossary() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Trading Glossary
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Essential Trading Terms & Definitions
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive reference guide for trading terminology and concepts
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-4 mb-8">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search trading terms..."
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              { category: "Basic Concepts", terms: ["Bid/Ask", "Spread", "Pip", "Lot", "Leverage", "Margin"] },
              { category: "Order Types", terms: ["Market Order", "Limit Order", "Stop Loss", "Take Profit", "Pending Order", "Trailing Stop"] },
              { category: "Technical Analysis", terms: ["Support", "Resistance", "Trend", "Moving Average", "RSI", "MACD"] },
              { category: "Risk Management", terms: ["Risk/Reward", "Position Size", "Drawdown", "Equity", "Margin Call", "Stop Loss"] }
            ].map((group, i) => (
              <Card key={i} className="hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">{group.category}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {group.terms.map((term, j) => (
                      <div key={j} className="p-3 bg-muted/50 rounded-lg text-sm font-semibold hover:bg-muted cursor-pointer transition-colors">
                        {term}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Common Trading Terms</h2>
              <div className="space-y-6">
                {[
                  {
                    term: "Bid/Ask Spread",
                    definition: "The difference between the bid (sell) and ask (buy) price of an asset. Measured in pips or points."
                  },
                  {
                    term: "Leverage",
                    definition: "The ability to trade with borrowed capital to control larger positions. For example, 1:100 leverage allows you to control $100 with $1."
                  },
                  {
                    term: "Pip",
                    definition: "Percentage in Point - the smallest price movement in the forex market. One pip = 0.0001 for most currency pairs."
                  },
                  {
                    term: "Margin",
                    definition: "The initial capital required to open a leveraged position. Acts as a security deposit for your broker."
                  },
                  {
                    term: "Stop Loss",
                    definition: "An order placed to automatically close a position at a specified price to limit losses."
                  },
                  {
                    term: "Take Profit",
                    definition: "An order placed to automatically close a winning position at a target price to secure profits."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-muted/50 rounded-lg border border-border hover:border-primary transition-colors">
                    <h3 className="text-lg font-bold mb-2">{item.term}</h3>
                    <p className="text-muted-foreground">{item.definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Glossary Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  "500+ Trading Terms",
                  "Detailed Definitions",
                  "Real-World Examples"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">{feature}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Expand Your Trading Knowledge</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Understand every trading term with comprehensive definitions
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/education">
                    <Button size="lg" variant="outline">
                      Back to Education
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
