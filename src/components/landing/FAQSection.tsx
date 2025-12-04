import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create a TradeX Pro account?",
          a: "Creating an account is simple and free. Click 'Start Trading Free', enter your email and create a password. After email verification, complete a quick KYC process to unlock your $50,000 virtual trading capital. The entire process takes less than 5 minutes."
        },
        {
          q: "Is TradeX Pro really free to use?",
          a: "Yes, TradeX Pro is completely free. There are no subscription fees, no hidden charges, and no credit card required. You get full access to all trading features, real-time market data, and educational resources at zero cost."
        },
        {
          q: "What is the virtual capital I receive?",
          a: "Upon completing KYC verification, you receive $50,000 in virtual capital to practice trading. This is simulated money that allows you to experience real market conditions without any financial risk. You can reset your balance anytime from settings."
        }
      ]
    },
    {
      category: "Trading",
      questions: [
        {
          q: "What markets can I trade on TradeX Pro?",
          a: "TradeX Pro offers 500+ instruments across 5 asset classes: Forex (50+ currency pairs), Stocks (200+ global equities), Indices (20+ major indices), Commodities (30+ including gold, oil, and agriculture), and Cryptocurrencies (50+ digital assets)."
        },
        {
          q: "How does CFD trading work?",
          a: "CFDs (Contracts for Difference) allow you to speculate on price movements without owning the underlying asset. You can profit from both rising (going long) and falling (going short) markets. TradeX Pro provides leverage up to 1:100, meaning you can control larger positions with smaller capital."
        },
        {
          q: "What are the trading hours?",
          a: "Forex and cryptocurrency markets are available 24/7. Stock and index CFDs follow their respective exchange hours. Commodities are available during their market hours. Our platform displays live market status for each instrument."
        }
      ]
    },
    {
      category: "Security & Compliance",
      questions: [
        {
          q: "Is my data secure on TradeX Pro?",
          a: "Absolutely. We employ 256-bit SSL encryption, SOC 2 Type II certified infrastructure, and comply with ISO 27001 standards. Your personal and trading data is protected with bank-level security measures including multi-factor authentication."
        },
        {
          q: "What regulatory bodies oversee TradeX Pro?",
          a: "TradeX Pro operates in compliance with international financial regulations. We maintain transparent operations and follow best practices for financial services. Specific regulatory details are available on our Regulation page."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          q: "Can I access TradeX Pro on mobile?",
          a: "Yes! TradeX Pro is fully responsive and works seamlessly on all devices. Access your account from desktop, tablet, or smartphone browsers. We also offer progressive web app (PWA) support for an app-like experience."
        },
        {
          q: "How can I contact customer support?",
          a: "Our support team is available 24/7 via live chat, email (support@tradexpro.com), and through our Contact page. We also have comprehensive documentation and video tutorials in our Education section."
        }
      ]
    }
  ];

  return (
    <section className="py-24" style={{ background: '#0A1628' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
            <HelpCircle className="w-4 h-4" style={{ color: '#FFD700' }} />
            <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Frequently Asked
            <span className="block mt-2" style={{ color: '#FFD700' }}>Questions</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
            Find answers to common questions about TradeX Pro
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-8">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider" style={{ color: '#FFD700' }}>
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((faq, qIndex) => (
                  <AccordionItem
                    key={qIndex}
                    value={`${catIndex}-${qIndex}`}
                    className="rounded-lg px-6 border-0"
                    style={{ background: '#1a2d42' }}
                  >
                    <AccordionTrigger
                      className="text-left hover:no-underline py-5"
                      style={{ color: '#FFFFFF' }}
                    >
                      <span className="pr-4">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 leading-relaxed" style={{ color: '#F5F5DC' }}>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="mb-4" style={{ color: '#F5F5DC' }}>Still have questions?</p>
          <Link to="/company/contact">
            <Button size="lg" className="gap-2" style={{ background: '#FFD700', color: '#0A1628' }}>
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
