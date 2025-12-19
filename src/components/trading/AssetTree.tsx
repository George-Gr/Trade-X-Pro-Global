import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface AssetTreeProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

interface AssetCategory {
  name: string;
  assets: { symbol: string; name: string }[];
}

const AssetTree = ({ onSelectSymbol, selectedSymbol }: AssetTreeProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Forex',
  ]);

  const categories: AssetCategory[] = [
    {
      name: 'Forex',
      assets: [
        { symbol: 'EURUSD', name: 'EUR/USD' },
        { symbol: 'GBPUSD', name: 'GBP/USD' },
        { symbol: 'USDJPY', name: 'USD/JPY' },
        { symbol: 'AUDUSD', name: 'AUD/USD' },
        { symbol: 'USDCAD', name: 'USD/CAD' },
      ],
    },
    {
      name: 'Stocks',
      assets: [
        { symbol: 'AAPL', name: 'Apple Inc' },
        { symbol: 'TSLA', name: 'Tesla Inc' },
        { symbol: 'GOOGL', name: 'Alphabet Inc' },
        { symbol: 'MSFT', name: 'Microsoft Corp' },
        { symbol: 'AMZN', name: 'Amazon.com Inc' },
      ],
    },
    {
      name: 'Indices',
      assets: [
        { symbol: 'US500', name: 'S&P 500' },
        { symbol: 'US30', name: 'Dow Jones' },
        { symbol: 'NAS100', name: 'NASDAQ 100' },
        { symbol: 'UK100', name: 'FTSE 100' },
        { symbol: 'GER40', name: 'DAX 40' },
      ],
    },
    {
      name: 'Commodities',
      assets: [
        { symbol: 'XAUUSD', name: 'Gold' },
        { symbol: 'XAGUSD', name: 'Silver' },
        { symbol: 'USOIL', name: 'US Oil' },
        { symbol: 'UKOIL', name: 'UK Oil' },
        { symbol: 'NATGAS', name: 'Natural Gas' },
      ],
    },
    {
      name: 'Crypto',
      assets: [
        { symbol: 'BTCUSD', name: 'Bitcoin' },
        { symbol: 'ETHUSD', name: 'Ethereum' },
        { symbol: 'BNBUSD', name: 'Binance Coin' },
        { symbol: 'SOLUSD', name: 'Solana' },
        { symbol: 'XRPUSD', name: 'Ripple' },
      ],
    },
  ];

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="h-full bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Asset Navigator</h2>
        <p className="text-xs text-muted-foreground mt-2">5 asset classes</p>
      </div>
      <div className="overflow-auto">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.name);
          return (
            <div key={category.name} className="border-b border-border">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-semibold text-sm">{category.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {category.assets.length}
                </span>
              </button>
              {isExpanded && (
                <div className="bg-secondary/20">
                  {category.assets.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => onSelectSymbol(asset.symbol)}
                      className={`w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors text-left ${
                        selectedSymbol === asset.symbol
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : ''
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {asset.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetTree;
