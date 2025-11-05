import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, Globe, Zap } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  category: 'forex' | 'stocks' | 'indices' | 'crypto' | 'commodities';
}

interface MiniChartProps {
  data: MarketData;
  trend: 'up' | 'down';
}

const MiniChart: React.FC<MiniChartProps> = ({ data, trend }) => {
  const isPositive = trend === 'up';
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  const bgColorClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const borderColorClass = isPositive ? 'border-green-500/20' : 'border-red-500/20';

  // Generate simple chart path
  const generateChartPath = () => {
    const points = 20;
    const path = [];
    const baseValue = 50;
    const volatility = isPositive ? 15 : 20;

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 100;
      const trend = isPositive ? (i / points) * 20 : -(i / points) * 25;
      const noise = (Math.random() - 0.5) * volatility;
      const y = baseValue + trend + noise;
      path.push(`${x},${y}`);
    }

    return `M${path.join(' L')}`;
  };

  return (
    <Card className={`card-hover ${bgColorClass} border ${borderColorClass}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-foreground">{data.symbol}</div>
            <div className="text-xs text-muted-foreground">{data.name}</div>
          </div>
          <div className={`text-xs ${colorClass} font-medium`}>
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-12 mb-3">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${data.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={generateChartPath()}
              fill={`url(#gradient-${data.symbol})`}
              stroke="none"
            />
            <path
              d={generateChartPath()}
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="1.5"
              className="opacity-80"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-foreground">
            ${data.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>24h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TradingViewWidgetProps {
  containerId: string;
  symbol: string;
  theme?: 'light' | 'dark';
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  containerId,
  symbol,
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      // Load TradingView script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com'
      });

      containerRef.current.appendChild(script);

      // Set timeout for loading
      const timeout = setTimeout(() => {
        setIsLoaded(true);
      }, 2000);

      return () => {
        clearTimeout(timeout);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [symbol, theme]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[500px] bg-card rounded-lg border border-border"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading market data...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LiveMarketOverviewProps {
  className?: string;
}

const LiveMarketOverview: React.FC<LiveMarketOverviewProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('forex');
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  // Simulated market data
  const initialMarketData: MarketData[] = [
    // Forex
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0892, change: 0.0124, changePercent: 1.24, volume: '2.3B', category: 'forex' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2745, change: -0.0089, changePercent: -0.69, volume: '1.8B', category: 'forex' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 149.82, change: 0.0024, changePercent: 0.16, volume: '3.1B', category: 'forex' },

    // Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33, volume: '54.2M', marketCap: '2.8T', category: 'stocks' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.67, change: -1.23, changePercent: -0.86, volume: '28.5M', marketCap: '1.8T', category: 'stocks' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.12, change: 5.67, changePercent: 2.37, volume: '112.3M', marketCap: '780B', category: 'stocks' },

    // Indices
    { symbol: 'SPX500', name: 'S&P 500', price: 4521.78, change: 39.45, changePercent: 0.88, volume: '1.2B', category: 'indices' },
    { symbol: 'NASDAQ', name: 'NASDAQ Composite', price: 14123.45, change: 123.67, changePercent: 0.88, volume: '890M', category: 'indices' },

    // Crypto
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', price: 43256.78, change: -934.22, changePercent: -2.15, volume: '24.5B', marketCap: '845B', category: 'crypto' },
    { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', price: 2234.56, change: 45.67, changePercent: 2.08, volume: '12.3B', marketCap: '268B', category: 'crypto' },

    // Commodities
    { symbol: 'GOLD', name: 'Gold Spot', price: 2034.56, change: 12.34, changePercent: 0.61, volume: '2.1B', category: 'commodities' },
    { symbol: 'OIL', name: 'Crude Oil WTI', price: 78.45, change: -1.23, changePercent: -1.55, volume: '3.4B', category: 'commodities' }
  ];

  useEffect(() => {
    setMarketData(initialMarketData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMarketData(prevData =>
        prevData.map(item => {
          const changeAmount = (Math.random() - 0.5) * 0.01;
          const newPrice = item.price * (1 + changeAmount);
          const newChange = item.price - newPrice;
          const newChangePercent = (newChange / item.price) * 100;

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getFilteredData = (category: string) => {
    return marketData.filter(item => item.category === category).slice(0, 6);
  };

  const getFeaturedSymbol = (category: string) => {
    const symbols: { [key: string]: string } = {
      forex: 'FX:EURUSD',
      stocks: 'NASDAQ:AAPL',
      indices: 'CME_MINI:ES1!',
      crypto: 'BINANCE:BTCUSDT',
      commodities: 'CME:GC1!'
    };
    return symbols[category] || 'FX:EURUSD';
  };

  return (
    <section className={`py-20 bg-card/30 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Live Market
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Overview
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Real-time market data and interactive charts. Monitor global financial markets
            and track price movements across multiple asset classes.
          </p>
        </div>

        {/* Market Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="fade-in-up visible">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="forex" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Forex</span>
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stocks</span>
            </TabsTrigger>
            <TabsTrigger value="indices" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Indices</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="commodities" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Commodities</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="space-y-8">
            {['forex', 'stocks', 'indices', 'crypto', 'commodities'].map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                {/* Main Chart */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold capitalize">
                      {category} Market Overview
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Live Data</span>
                    </div>
                  </div>

                  <TradingViewWidget
                    containerId={`tradingview-${category}`}
                    symbol={getFeaturedSymbol(category)}
                    theme="dark"
                  />
                </div>

                {/* Mini Charts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {getFilteredData(category).map((item, index) => (
                    <MiniChart
                      key={item.symbol}
                      data={item}
                      trend={item.changePercent >= 0 ? 'up' : 'down'}
                    />
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Button size="lg" className="btn-hover-lift">
                    <span className="flex items-center gap-2">
                      Trade {category.charAt(0).toUpperCase() + category.slice(1)}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        {/* Market Stats */}
        <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground">Currency Pairs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground">Trading Instruments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Market Access</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">&lt;100ms</div>
              <div className="text-sm text-muted-foreground">Execution Speed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMarketOverview;