import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  Globe,
  BookOpen,
  Building,
  Headphones,
  ArrowRight,
  Star,
  Users,
  Zap
} from 'lucide-react';

interface MegaMenuProps {
  activeMenu: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ activeMenu, onClose, isMobile = false }) => {
  const menuContent = {
    trading: {
      title: 'Trading',
      subtitle: 'Professional trading across global markets',
      columns: [
        {
          title: 'Markets',
          links: [
            { label: 'Forex Trading', href: '/markets/forex', icon: TrendingUp },
            { label: 'Stock Trading', href: '/markets/stocks', icon: BarChart3 },
            { label: 'Indices Trading', href: '/markets/indices', icon: Globe },
            { label: 'Commodities Trading', href: '/markets/commodities', icon: TrendingUp },
            { label: 'Cryptocurrency Trading', href: '/markets/crypto', icon: Zap }
          ]
        },
        {
          title: 'Trading Tools',
          links: [
            { label: 'Advanced Orders', href: '/tools/orders', icon: ArrowRight },
            { label: 'Risk Management', href: '/tools/risk', icon: TrendingUp },
            { label: 'Chart Patterns', href: '/tools/charts', icon: BarChart3 },
            { label: 'Economic Calendar', href: '/tools/calendar', icon: Globe },
            { label: 'Market Analysis', href: '/tools/analysis', icon: Star }
          ]
        },
        {
          title: 'Account Types',
          links: [
            { label: 'Practice Account', href: '/accounts/practice', icon: Users },
            { label: 'Standard Account', href: '/accounts/standard', icon: Building },
            { label: 'Premium Account', href: '/accounts/premium', icon: Star },
            { label: 'Compare Accounts', href: '/accounts/compare', icon: BarChart3 }
          ]
        }
      ],
      featured: {
        image: '/images/trading-platform-preview.jpg',
        title: 'Start with $50,000 Virtual Funds',
        description: 'Practice trading with zero risk using our professional platform and virtual capital.',
        cta: {
          text: 'Practice Now',
          href: '/register'
        }
      }
    },
    platforms: {
      title: 'Platforms',
      subtitle: 'Trade on any device, anywhere',
      columns: [
        {
          title: 'Trading Platforms',
          links: [
            { label: 'Web Platform', href: '/platforms/web', icon: Globe },
            { label: 'Mobile Apps', href: '/platforms/mobile', icon: Zap },
            { label: 'Desktop Terminal', href: '/platforms/desktop', icon: Building },
            { label: 'API Trading', href: '/platforms/api', icon: BarChart3 }
          ]
        },
        {
          title: 'Platform Features',
          links: [
            { label: 'Real-Time Charts', href: '/features/charts', icon: TrendingUp },
            { label: 'Technical Indicators', href: '/features/indicators', icon: BarChart3 },
            { label: 'Market Watch', href: '/features/watchlist', icon: Globe },
            { label: 'Portfolio Analytics', href: '/features/portfolio', icon: Star },
            { label: 'Risk Calculator', href: '/features/calculator', icon: TrendingUp }
          ]
        },
        {
          title: 'Downloads',
          links: [
            { label: 'iOS App', href: '/download/ios', icon: Zap },
            { label: 'Android App', href: '/download/android', icon: Zap },
            { label: 'Windows Desktop', href: '/download/windows', icon: Building },
            { label: 'macOS Desktop', href: '/download/macos', icon: Building }
          ]
        }
      ],
      featured: {
        image: '/images/multi-platform.jpg',
        title: 'Trade Anytime, Anywhere',
        description: 'Access your account and trade across all your devices with our synchronized platform.',
        cta: {
          text: 'View Platform',
          href: '/trade'
        }
      }
    },
    markets: {
      title: 'Markets',
      subtitle: 'Global markets at your fingertips',
      columns: [
        {
          title: 'Asset Classes',
          links: [
            { label: 'Forex Pairs', href: '/markets/forex', icon: TrendingUp },
            { label: 'Stock Indices', href: '/markets/indices', icon: BarChart3 },
            { label: 'Individual Stocks', href: '/markets/stocks', icon: Building },
            { label: 'Commodities', href: '/markets/commodities', icon: Globe },
            { label: 'Cryptocurrencies', href: '/markets/crypto', icon: Zap }
          ]
        },
        {
          title: 'Market Data',
          links: [
            { label: 'Live Prices', href: '/data/live', icon: TrendingUp },
            { label: 'Market Overview', href: '/data/overview', icon: BarChart3 },
            { label: 'Economic Calendar', href: '/data/calendar', icon: Globe },
            { label: 'Market News', href: '/data/news', icon: BookOpen },
            { label: 'Market Analysis', href: '/data/analysis', icon: Star }
          ]
        },
        {
          title: 'Trading Conditions',
          links: [
            { label: 'Spreads & Commissions', href: '/conditions/spreads', icon: TrendingUp },
            { label: 'Trading Hours', href: '/conditions/hours', icon: Globe },
            { label: 'Leverage Info', href: '/conditions/leverage', icon: BarChart3 },
            { label: 'Swap Rates', href: '/conditions/swaps', icon: TrendingUp }
          ]
        }
      ],
      featured: {
        image: '/images/global-markets.jpg',
        title: '1000+ Trading Instruments',
        description: 'Access thousands of instruments across 5 major asset classes with competitive spreads.',
        cta: {
          text: 'Explore Markets',
          href: '/markets'
        }
      }
    },
    learn: {
      title: 'Learn',
      subtitle: 'Master trading with comprehensive education',
      columns: [
        {
          title: 'Trading Academy',
          links: [
            { label: 'Beginner Course', href: '/academy/beginner', icon: BookOpen },
            { label: 'Advanced Course', href: '/academy/advanced', icon: Star },
            { label: 'Strategy Guides', href: '/academy/strategies', icon: TrendingUp },
            { label: 'Risk Management', href: '/academy/risk', icon: TrendingUp }
          ]
        },
        {
          title: 'Learning Resources',
          links: [
            { label: 'Video Tutorials', href: '/learn/videos', icon: Zap },
            { label: 'Live Webinars', href: '/learn/webinars', icon: Globe },
            { label: 'eBooks & Guides', href: '/learn/ebooks', icon: BookOpen },
            { label: 'Trading Glossary', href: '/learn/glossary', icon: BarChart3 },
            { label: 'Market Analysis', href: '/learn/analysis', icon: Star }
          ]
        },
        {
          title: 'Trading Tools',
          links: [
            { label: 'Economic Calendar', href: '/tools/calendar', icon: Globe },
            { label: 'Profit Calculator', href: '/tools/calculator', icon: TrendingUp },
            { label: 'Pivot Points', href: '/tools/pivots', icon: BarChart3 },
            { label: 'Currency Converter', href: '/tools/converter', icon: TrendingUp }
          ]
        }
      ],
      featured: {
        image: '/images/trading-education.jpg',
        title: 'Learn from Market Experts',
        description: 'Access comprehensive trading education from beginner basics to advanced strategies.',
        cta: {
          text: 'Start Learning',
          href: '/academy'
        }
      }
    }
  };

  const content = menuContent[activeMenu as keyof typeof menuContent];
  if (!content) return null;

  const containerClass = isMobile
    ? 'space-y-4'
    : 'container mx-auto px-4 py-8 bg-card/95 backdrop-blur-md border-b border-border/50';

  return (
    <div className={containerClass}>
      {!isMobile && (
        <div className="grid grid-cols-12 gap-8">
          {/* Column Links */}
          <div className="col-span-8">
            <div className="grid grid-cols-3 gap-8">
              {content.columns.map((column, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <div className="space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        to={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                      >
                        <link.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Content */}
          <div className="col-span-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={content.featured.image}
                    alt={content.featured.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-muted flex items-center justify-center">
                            <div class="text-center text-muted-foreground">
                              <TrendingUp class="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p class="text-sm">Platform Preview</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <h4 className="font-semibold text-foreground">
                  {content.featured.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.featured.description}
                </p>
                <Link to={content.featured.cta.href} onClick={onClose}>
                  <Button className="w-full btn-hover-lift">
                    {content.featured.cta.text}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {!isMobile && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary" />
              Regulated
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              Secure
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="h-3 w-3 text-primary" />
              24/7 Support
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              2M+ Traders
            </span>
          </div>
        </div>
      )}

      {/* Mobile Version */}
      {isMobile && (
        <div className="space-y-6">
          {content.columns.map((column, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                {column.title}
              </h3>
              <div className="space-y-1">
                {column.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.href}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <link.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile Featured */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">
              {content.featured.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {content.featured.description}
            </p>
            <Link to={content.featured.cta.href} onClick={onClose}>
              <Button className="w-full btn-hover-lift">
                {content.featured.cta.text}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export { MegaMenu };