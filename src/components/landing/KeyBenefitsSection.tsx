import { motion } from 'framer-motion';
import React from 'react';

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
  index,
}) => (
  <motion.div
    className="glass-card p-6 rounded-xl border border-border/50 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:scale-105"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <div className="flex items-start gap-6">
      <div className="h-14 w-14 rounded-lg bg-linear-to-br from-gold to-accent flex items-center justify-center text-2xl shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-primary-contrast mb-3">
          {title}
        </h3>
        <p className="text-primary-contrast/70 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

interface Props {}

const benefits = [
  {
    icon: '📊',
    title: 'Advanced Charting',
    description:
      'TradingView integration with 100+ technical indicators, 50+ drawing tools, and multi-timeframe analysis',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast Execution',
    description:
      'Execute market orders in under 50ms with preset volumes. Perfect for scalping strategies and fast-moving markets',
  },
  {
    icon: '🛡️',
    title: 'Advanced Risk Management',
    description:
      'Automated stop-loss, take-profit, trailing stops with customizable triggers. Never lose more than you plan',
  },
  {
    icon: '📱',
    title: 'Trade Anywhere',
    description:
      'Fully responsive platform optimized for desktop, tablet, and mobile. Your portfolio syncs across all devices',
  },
  {
    icon: '💼',
    title: 'Order Templates',
    description:
      'Save your favorite trading setups with preset SL/TP levels. Execute complex strategies with a single click',
  },
  {
    icon: '📈',
    title: 'Real-Time Analytics',
    description:
      'Live P&L tracking, margin utilization monitoring, position heat maps, and performance metrics updated every second',
  },
];

export const KeyBenefitsSection: React.FC<Props> = () => {
  return (
    <section className="py-20 bg-linear-to-r from-background to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-contrast mb-4">
            Everything You Need to Trade Like a Pro
          </h2>
          <p className="text-lg text-primary-contrast/80 max-w-3xl mx-auto">
            The same institutional-grade tools used by professional traders, now
            available for free
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} {...benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
