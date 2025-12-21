import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  index: number;
}

const STATISTICS_DATA = [
  { icon: DollarSign, value: '$2.4B', label: '24h Trading Volume' },
  { icon: Users, value: '50K+', label: 'Active Traders' },
  { icon: BarChart3, value: '500+', label: 'Instruments' },
  { icon: TrendingUp, value: '$50K', label: 'Virtual Capital' },
] as const;

const StatCard = ({ icon: Icon, value, label, index }: StatCardProps) => (
  <motion.div
    className="glass-card p-6 rounded-xl border border-primary-foreground/20 backdrop-blur-md bg-primary-foreground/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="h-14 w-14 rounded-lg bg-linear-to-br from-gold-contrast to-accent flex items-center justify-center shadow-lg">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-primary-contrast">{value}</div>
        <div className="text-sm text-primary-contrast/70">{label}</div>
      </div>
    </div>
  </motion.div>
);

/**
 * Statistics section component displaying key metrics and trading statistics.
 *
 * @export
 * @returns {JSX.Element} The rendered statistics section
 */
export const StatisticsSection: React.FC = () => {
  return (
    <section className="py-20 bg-linear-to-r from-primary/5 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-contrast mb-4">
            Trusted by Traders Worldwide
          </h2>
          <p className="text-lg text-primary-contrast/80 max-w-2xl mx-auto">
            Join thousands of traders who trust our platform for their virtual
            trading needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {STATISTICS_DATA.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              index={index}
            />
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-4 bg-card rounded-full px-8 py-4 border border-border/50">
            <div className="h-3 w-3 bg-accent rounded-full animate-pulse" />
            <span className="text-primary-contrast/80 text-sm">
              <span className="font-semibold text-accent">2,847 traders</span>{' '}
              started practicing this week
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
