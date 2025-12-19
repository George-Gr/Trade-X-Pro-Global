import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  LineChart,
  Play,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AnimatedSectionHeader,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from './ScrollReveal';

const platformFeatures = [
  {
    icon: LineChart,
    title: 'Advanced Charts',
    description: 'TradingView integration with 100+ indicators',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Data',
    description: 'Live market prices updated every second',
  },
  {
    icon: Wallet,
    title: 'Portfolio Tracking',
    description: 'Monitor P&L, margin, and positions',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Stop-loss, take-profit & trailing stops',
  },
];

export function PlatformPreview() {
  return (
    <section className="py-20 md:py-24 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          badge={
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
              Platform Preview
            </Badge>
          }
          title="See TradeX Pro"
          subtitle="In Action"
          description="Experience professional-grade trading tools designed for serious traders"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Platform Screenshot Mockup */}
          <ScrollReveal direction="left" distance={60} delay={0.2}>
            <div className="relative group">
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-gold/20 to-accent/20 rounded-2xl blur-xl opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="relative bg-card border-border overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="h-3 w-3 rounded-full bg-destructive/60"
                        whileHover={{ scale: 1.3 }}
                      />
                      <motion.div
                        className="h-3 w-3 rounded-full bg-warning/60"
                        whileHover={{ scale: 1.3 }}
                      />
                      <motion.div
                        className="h-3 w-3 rounded-full bg-accent/60"
                        whileHover={{ scale: 1.3 }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      TradeX Pro - Trading Dashboard
                    </span>
                  </div>
                  <CardContent className="p-0">
                    {/* Simplified Platform UI Mockup */}
                    <div className="bg-background p-4 min-h-[300px]">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                          {
                            label: 'Balance',
                            value: '$50,000.00',
                            color: 'text-gold',
                          },
                          {
                            label: 'Equity',
                            value: '$52,340.50',
                            color: 'text-accent',
                          },
                          {
                            label: 'Profit',
                            value: '+$2,340.50',
                            color: 'text-accent',
                          },
                        ].map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            className="bg-muted/50 rounded-lg p-3"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            <div className="text-xs text-muted-foreground mb-1">
                              {stat.label}
                            </div>
                            <motion.div
                              className={`text-lg font-bold ${stat.color}`}
                              initial={{ scale: 0.8 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                delay: 0.6 + index * 0.1,
                                type: 'spring',
                              }}
                            >
                              {stat.value}
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Chart Placeholder with Animation */}
                      <motion.div
                        className="bg-muted/30 rounded-lg p-4 mb-4 h-32 flex items-center justify-center border border-border/50 relative overflow-hidden"
                        whileHover={{ borderColor: 'hsl(var(--primary))' }}
                      >
                        {/* Animated chart line */}
                        <motion.div
                          className="absolute inset-0 flex items-center"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                        >
                          <svg
                            className="w-full h-full opacity-30"
                            viewBox="0 0 400 100"
                            preserveAspectRatio="none"
                          >
                            <motion.path
                              d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,30"
                              fill="none"
                              stroke="hsl(var(--accent))"
                              strokeWidth="2"
                              initial={{ pathLength: 0 }}
                              whileInView={{ pathLength: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 2, delay: 0.5 }}
                            />
                          </svg>
                        </motion.div>
                        <div className="flex items-center gap-3 text-muted-foreground relative z-10">
                          <LineChart className="h-8 w-8" />
                          <span>Live EUR/USD Chart</span>
                        </div>
                      </motion.div>

                      {/* Trading Panel Mockup */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-buy hover:bg-buy-hover text-buy-foreground">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            BUY
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-sell hover:bg-sell-hover text-sell-foreground">
                            <TrendingUp className="mr-2 h-4 w-4 rotate-180" />
                            SELL
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Features List */}
          <div className="space-y-8">
            <StaggerContainer className="space-y-6" staggerDelay={0.15}>
              {platformFeatures.map((feature, index) => (
                <StaggerItem key={index} direction="right">
                  <motion.div
                    className="flex gap-4 group"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-shrink-0">
                      <motion.div
                        className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal delay={0.5} direction="up">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gold text-gold-foreground hover:bg-gold-hover w-full sm:w-auto"
                    >
                      Try It Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      View Demo
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
