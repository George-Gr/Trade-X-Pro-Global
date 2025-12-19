import * as React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Trading Basics
  {
    term: 'CFD',
    definition:
      'Contract for Difference - A financial derivative that allows you to speculate on price movements without owning the underlying asset. You profit or lose based on the difference between opening and closing prices.',
    category: 'Trading Basics',
  },
  {
    term: 'Leverage',
    definition:
      'The ability to control a larger position with a smaller amount of capital. For example, 1:100 leverage means you can control $100,000 with just $1,000 of your own funds. Leverage amplifies both profits and losses.',
    category: 'Trading Basics',
  },
  {
    term: 'Margin',
    definition:
      'The amount of money required to open and maintain a leveraged position. It acts as collateral for your trades.',
    category: 'Trading Basics',
  },
  {
    term: 'Spread',
    definition:
      'The difference between the buy (ask) and sell (bid) price of an asset. This is one way brokers earn revenue and represents a cost to traders.',
    category: 'Trading Basics',
  },
  {
    term: 'Pip',
    definition:
      'Percentage in Point - The smallest price movement in a currency pair. For most pairs, 1 pip equals 0.0001 (fourth decimal place).',
    category: 'Trading Basics',
  },
  {
    term: 'Lot',
    definition:
      'A standardized unit of measurement for trade size. A standard lot is 100,000 units, a mini lot is 10,000 units, and a micro lot is 1,000 units.',
    category: 'Trading Basics',
  },
  {
    term: 'Bid Price',
    definition:
      'The price at which you can sell an asset. It is always lower than the ask price.',
    category: 'Trading Basics',
  },
  {
    term: 'Ask Price',
    definition:
      'The price at which you can buy an asset. It is always higher than the bid price.',
    category: 'Trading Basics',
  },

  // Order Types
  {
    term: 'Market Order',
    definition:
      'An order to buy or sell immediately at the best available current price. Guarantees execution but not price.',
    category: 'Order Types',
  },
  {
    term: 'Limit Order',
    definition:
      'An order to buy or sell at a specific price or better. Only executes when the market reaches your specified price.',
    category: 'Order Types',
  },
  {
    term: 'Stop Order',
    definition:
      'An order that becomes a market order once a specified price level is reached. Used to limit losses or enter trades at breakout points.',
    category: 'Order Types',
  },
  {
    term: 'Stop-Loss',
    definition:
      'An order placed to automatically close a position at a predetermined price to limit potential losses.',
    category: 'Order Types',
  },
  {
    term: 'Take-Profit',
    definition:
      'An order placed to automatically close a position when it reaches a specified profit level, locking in gains.',
    category: 'Order Types',
  },
  {
    term: 'Trailing Stop',
    definition:
      'A dynamic stop-loss that moves with the market price, maintaining a set distance. It locks in profits as the trade moves favorably while still protecting against reversals.',
    category: 'Order Types',
  },
  {
    term: 'Pending Order',
    definition:
      'An order to open a position at a future price level. Includes limit and stop orders that wait to be triggered.',
    category: 'Order Types',
  },

  // Position Management
  {
    term: 'Long Position',
    definition:
      'Buying an asset with the expectation that its price will rise. You profit when the price goes up.',
    category: 'Position Management',
  },
  {
    term: 'Short Position',
    definition:
      "Selling an asset you don't own with the expectation that its price will fall. You profit when the price goes down.",
    category: 'Position Management',
  },
  {
    term: 'Open Position',
    definition:
      'A trade that has been entered but not yet closed. It represents your current exposure to market movements.',
    category: 'Position Management',
  },
  {
    term: 'Closed Position',
    definition:
      'A trade that has been exited. The profit or loss is realized and added to your account balance.',
    category: 'Position Management',
  },
  {
    term: 'Position Size',
    definition:
      'The number of units or lots in a trade. Proper position sizing is crucial for risk management.',
    category: 'Position Management',
  },

  // Risk Management
  {
    term: 'Margin Call',
    definition:
      'A warning that occurs when your account equity falls below the required margin level. You must deposit more funds or close positions to avoid automatic liquidation.',
    category: 'Risk Management',
  },
  {
    term: 'Stop-Out',
    definition:
      'Automatic closure of positions when margin level falls below a critical threshold to prevent further losses and negative balance.',
    category: 'Risk Management',
  },
  {
    term: 'Margin Level',
    definition:
      'The ratio of your equity to used margin, expressed as a percentage. A key indicator of account health. Formula: (Equity / Used Margin) × 100%.',
    category: 'Risk Management',
  },
  {
    term: 'Free Margin',
    definition:
      'The amount of equity available to open new positions. Calculated as Equity minus Used Margin.',
    category: 'Risk Management',
  },
  {
    term: 'Equity',
    definition:
      'The total value of your account including unrealized profits and losses. Formula: Balance + Unrealized P&L.',
    category: 'Risk Management',
  },
  {
    term: 'Drawdown',
    definition:
      'The peak-to-trough decline in account equity. Measures the largest loss from a high point before recovery.',
    category: 'Risk Management',
  },
  {
    term: 'Risk/Reward Ratio',
    definition:
      'The ratio of potential loss to potential gain on a trade. A 1:3 ratio means risking $1 to potentially gain $3.',
    category: 'Risk Management',
  },

  // Financial Terms
  {
    term: 'P&L (Profit & Loss)',
    definition:
      'The financial gain or loss from your trading activity. Unrealized P&L is from open positions; Realized P&L is from closed positions.',
    category: 'Financial Terms',
  },
  {
    term: 'Commission',
    definition:
      'A fee charged by the broker for executing trades. May be per-trade or per-lot.',
    category: 'Financial Terms',
  },
  {
    term: 'Swap',
    definition:
      'An overnight interest charge or credit for holding positions past the daily rollover time. Also called rollover or overnight financing.',
    category: 'Financial Terms',
  },
  {
    term: 'Slippage',
    definition:
      'The difference between the expected price of a trade and the actual execution price. Common during high volatility or low liquidity.',
    category: 'Financial Terms',
  },
  {
    term: 'Balance',
    definition:
      'The total amount of money in your trading account, not including unrealized profits or losses from open positions.',
    category: 'Financial Terms',
  },

  // Technical Analysis
  {
    term: 'Technical Analysis',
    definition:
      'Analysis of price charts and statistical indicators to predict future price movements based on historical patterns.',
    category: 'Technical Analysis',
  },
  {
    term: 'Fundamental Analysis',
    definition:
      "Analysis of economic, financial, and other qualitative/quantitative factors to determine an asset's intrinsic value.",
    category: 'Technical Analysis',
  },
  {
    term: 'Support Level',
    definition:
      'A price level where buying pressure is expected to prevent further decline. Prices tend to bounce off support.',
    category: 'Technical Analysis',
  },
  {
    term: 'Resistance Level',
    definition:
      'A price level where selling pressure is expected to prevent further rise. Prices tend to reverse at resistance.',
    category: 'Technical Analysis',
  },
  {
    term: 'Volatility',
    definition:
      'A measure of how much and how quickly prices move. High volatility means larger price swings and potentially higher risk/reward.',
    category: 'Technical Analysis',
  },
  {
    term: 'Trend',
    definition:
      'The general direction of price movement over time. Can be uptrend (higher highs), downtrend (lower lows), or sideways.',
    category: 'Technical Analysis',
  },
  {
    term: 'Moving Average',
    definition:
      'A technical indicator that smooths price data by calculating the average price over a specific period.',
    category: 'Technical Analysis',
  },
  {
    term: 'RSI',
    definition:
      'Relative Strength Index - A momentum oscillator measuring speed and change of price movements on a scale of 0-100.',
    category: 'Technical Analysis',
  },
  {
    term: 'MACD',
    definition:
      'Moving Average Convergence Divergence - A trend-following indicator showing the relationship between two moving averages.',
    category: 'Technical Analysis',
  },

  // Account Types
  {
    term: 'Demo Account',
    definition:
      'A practice account with virtual funds that simulates real trading conditions. Perfect for learning without risking real money.',
    category: 'Account Types',
  },
  {
    term: 'Live Account',
    definition:
      'A real trading account with actual funds where profits and losses are real.',
    category: 'Account Types',
  },
  {
    term: 'ECN Account',
    definition:
      'Electronic Communication Network account that provides direct access to liquidity providers with tighter spreads and commission-based pricing.',
    category: 'Account Types',
  },
];

const categories = [...new Set(glossaryTerms.map((t) => t.category))];

export default function Glossary() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<
    Set<string>
  >(new Set(categories));

  const filteredTerms = glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const groupedTerms = categories.reduce(
    (acc, category) => {
      acc[category] = filteredTerms.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<string, GlossaryTerm[]>
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Trading Education
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Trading Glossary
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {glossaryTerms.length}+ Essential Terms
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Master the language of trading. Understanding these terms is
                essential for successful trading.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search trading terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Glossary Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {categories.map((category) => {
            const terms = groupedTerms[category];
            if (terms.length === 0) return null;

            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="mb-6">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {category}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {terms.length} terms
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    {terms.map((item) => (
                      <div
                        key={item.term}
                        className={cn(
                          'p-4 bg-card/50 border border-border/50 rounded-lg',
                          'hover:bg-card hover:border-border transition-colors'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <h3 className="text-lg font-semibold text-primary">
                            {item.term}
                          </h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground mt-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">{item.definition}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mt-1">
                          {item.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No terms found matching "{searchQuery}". Try a different search.
              </p>
            </div>
          )}

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Put your knowledge into practice with a free demo account
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary-glow"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/education/tutorials">
                  <Button size="lg" variant="outline">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Risk Warning */}
      <section className="py-8 bg-destructive/10 border-t border-destructive/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-destructive">Risk Warning:</strong> CFDs are
            complex instruments and come with a high risk of losing money
            rapidly due to leverage. Between 74-89% of retail investor accounts
            lose money when trading CFDs. You should consider whether you
            understand how CFDs work and whether you can afford to take the high
            risk of losing your money.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
