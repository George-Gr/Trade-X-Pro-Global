import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal, AnimatedSectionHeader } from "./ScrollReveal";

const faqs = [
  {
    question: "Is TradeX Pro really free to use?",
    answer: "Yes, TradeX Pro is completely free. You get $50,000 in virtual capital to practice trading across 500+ instruments. There are no hidden fees, no subscriptions, and no credit card required to start."
  },
  {
    question: "What is virtual trading and how does it work?",
    answer: "Virtual trading (also called paper trading or demo trading) lets you practice buying and selling financial instruments using simulated money. You experience real market conditions with live price data, but without risking actual capital. It's the perfect way to learn trading strategies and test ideas risk-free."
  },
  {
    question: "Can I lose real money on TradeX Pro?",
    answer: "No. TradeX Pro is a virtual trading platform only. All trades are executed with simulated money. You cannot deposit, withdraw, or lose any real funds. This makes it ideal for learning and practicing without financial risk."
  },
  {
    question: "What instruments can I trade?",
    answer: "TradeX Pro offers 500+ instruments across 5 asset classes: Forex (50+ currency pairs), Stocks (200+ global equities), Indices (20+ major indices), Commodities (30+ including gold, oil, and agricultural products), and Cryptocurrencies (50+ digital assets)."
  },
  {
    question: "How realistic is the trading simulation?",
    answer: "Our platform uses real-time market data from professional data providers. Price movements, spreads, and market conditions mirror actual markets. The main difference is that your trades don't impact real markets and you're using virtual capital."
  },
  {
    question: "Why do I need to complete KYC verification?",
    answer: "KYC (Know Your Customer) verification helps us maintain platform security and prevents abuse. Once verified, you instantly receive $50,000 in virtual capital. The process takes just 2 minutes and requires basic identity verification."
  },
  {
    question: "Can I practice CFD trading strategies?",
    answer: "Absolutely! TradeX Pro is specifically designed for CFD trading practice. You can use leverage, set stop-loss and take-profit orders, practice margin trading, and test various strategies including day trading, swing trading, and position trading."
  },
  {
    question: "Is my personal data secure?",
    answer: "Yes. We use bank-level SSL encryption to protect all data transmissions. Your personal information is stored securely and never shared with third parties. We comply with international data protection standards."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          badge={
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              Frequently Asked Questions
            </Badge>
          }
          title="Got Questions?"
          subtitle="We've Got Answers"
          description="Everything you need to know about TradeX Pro virtual trading platform"
        />

        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    delay: index * 0.08, 
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-6 bg-card data-[state=open]:shadow-lg transition-all duration-300 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline hover:text-primary transition-colors duration-200">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
