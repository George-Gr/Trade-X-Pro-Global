import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal, AnimatedSectionHeader } from "./ScrollReveal";

const comparisonData = [
  {
    feature: "Virtual Capital",
    tradexPro: "$50,000",
    competitorA: "$10,000",
    competitorB: "$100,000",
  },
  {
    feature: "Trading Instruments",
    tradexPro: "500+",
    competitorA: "100+",
    competitorB: "200+",
  },
  {
    feature: "Real-Time Data",
    tradexPro: true,
    competitorA: true,
    competitorB: "Delayed",
  },
  {
    feature: "TradingView Charts",
    tradexPro: true,
    competitorA: false,
    competitorB: true,
  },
  {
    feature: "Risk Management Tools",
    tradexPro: true,
    competitorA: "Basic",
    competitorB: true,
  },
  {
    feature: "Mobile Responsive",
    tradexPro: true,
    competitorA: true,
    competitorB: false,
  },
  {
    feature: "Order Templates",
    tradexPro: true,
    competitorA: false,
    competitorB: false,
  },
  {
    feature: "Trailing Stop-Loss",
    tradexPro: true,
    competitorA: false,
    competitorB: true,
  },
  {
    feature: "Monthly Cost",
    tradexPro: "Free",
    competitorA: "$29/mo",
    competitorB: "Free (ads)",
  },
];

const renderValue = (value: string | boolean, isTradeX: boolean = false) => {
  if (value === true) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Check
          className={`h-5 w-5 mx-auto ${isTradeX ? "text-gold" : "text-accent"}`}
        />
      </motion.div>
    );
  }
  if (value === false) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <X className="h-5 w-5 text-destructive mx-auto" />
      </motion.div>
    );
  }
  return (
    <span className={`text-sm ${isTradeX ? "font-semibold text-gold" : ""}`}>
      {value}
    </span>
  );
};

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          badge={
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              Platform Comparison
            </Badge>
          }
          title="Why Choose"
          subtitle="TradeX Pro?"
          description="See how we compare to other virtual trading platforms"
        />

        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4">
                          <motion.div
                            className="flex flex-col items-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            <Badge className="bg-gold text-gold-foreground mb-1">
                              Recommended
                            </Badge>
                            <span className="font-bold text-lg">
                              TradeX Pro
                            </span>
                          </motion.div>
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">
                          Competitor A
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">
                          Competitor B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <motion.tr
                          key={index}
                          className={`border-b border-border/50 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          whileHover={{
                            backgroundColor: "hsl(var(--muted) / 0.4)",
                          }}
                        >
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="p-4 text-center bg-gold/5">
                            {renderValue(row.tradexPro, true)}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {renderValue(row.competitorA)}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {renderValue(row.competitorB)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
