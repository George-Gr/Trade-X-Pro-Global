import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  BookOpen,
  Globe,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  source: string;
  author?: string;
  publishedAt: string;
  category: 'market-news' | 'technical-analysis' | 'educational' | 'economic-calendar';
  imageUrl?: string;
  readTime?: number;
  featured?: boolean;
}

interface NewsCardProps {
  article: NewsArticle;
  isFeatured?: boolean;
  compact?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, isFeatured = false, compact = false }) => {
  const getCategoryInfo = (category: string) => {
    const categories = {
      'market-news': { label: 'Market News', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      'technical-analysis': { label: 'Technical Analysis', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      'educational': { label: 'Education', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
      'economic-calendar': { label: 'Economic Calendar', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    };
    return categories[category as keyof typeof categories] || categories['market-news'];
  };

  const categoryInfo = getCategoryInfo(article.category);
  const timeAgo = getTimeAgo(article.publishedAt);

  if (compact) {
    return (
      <Card className="card-hover bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary/50" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
                  {categoryInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                {article.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFeatured) {
    return (
      <Card className="overflow-hidden card-hover bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-800">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover opacity-70"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="outline" className={`mb-2 ${categoryInfo.color} backdrop-blur-sm`}>
              {categoryInfo.label}
            </Badge>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {article.source} • {timeAgo}
                {article.readTime && ` • ${article.readTime} min read`}
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full">
            <span className="flex items-center gap-2">
              Read Full Analysis
              <ExternalLink className="h-4 w-4" />
            </span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
              {categoryInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-foreground leading-tight">
            {article.title}
          </h4>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{article.source}</span>
            {article.readTime && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {article.readTime} min
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to calculate time ago
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

interface NewsFeedProps {
  className?: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ className = '' }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Sample news data (in production, this would come from an API)
  const sampleNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Fed Signals Potential Rate Cuts in 2024 Amid Economic Uncertainty',
      excerpt: 'Federal Reserve officials indicate they may begin cutting interest rates in 2024 as inflation shows signs of cooling and economic growth moderates.',
      content: 'Federal Reserve officials have signaled that interest rate cuts could be on the horizon for 2024...',
      source: 'Reuters',
      author: 'Michael Johnson',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      category: 'market-news',
      imageUrl: '/images/fed-news.jpg',
      readTime: 5,
      featured: true
    },
    {
      id: '2',
      title: 'Technical Analysis: EUR/USD Approaches Key Resistance Level',
      excerpt: 'The EUR/USD pair is approaching a critical technical resistance level at 1.0900, with indicators suggesting potential breakout.',
      content: 'Technical indicators show mixed signals for EUR/USD as it approaches the 1.0900 resistance level...',
      source: 'TradingView',
      author: 'Sarah Chen',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      category: 'technical-analysis',
      readTime: 3
    },
    {
      id: '3',
      title: 'Beginner\'s Guide to Risk Management in Trading',
      excerpt: 'Learn essential risk management techniques that every trader should know to protect their capital and maximize returns.',
      content: 'Risk management is the cornerstone of successful trading. In this comprehensive guide...',
      source: 'TradeX Academy',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      category: 'educational',
      readTime: 8
    },
    {
      id: '4',
      title: 'Upcoming: CPI Data Release Could Impact Market Sentiment',
      excerpt: 'Markets await crucial CPI data release tomorrow, with economists expecting modest inflation increase.',
      content: 'Tomorrow\'s Consumer Price Index data release is eagerly anticipated by market participants...',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      category: 'economic-calendar',
      readTime: 2
    },
    {
      id: '5',
      title: 'Gold Prices Rise as Safe-Haven Demand Increases',
      excerpt: 'Gold prices climbed to two-week highs as investors sought safety amid geopolitical tensions and economic uncertainty.',
      content: 'Gold futures rose 1.2% to $2,045 per ounce as safe-haven demand increased...',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
      category: 'market-news',
      readTime: 4
    },
    {
      id: '6',
      title: 'Advanced Chart Patterns: Head and Shoulders Formation',
      excerpt: 'Understanding the head and shoulders pattern and its implications for trading strategies and market analysis.',
      content: 'The head and shoulders pattern is one of the most reliable chart patterns in technical analysis...',
      source: 'Technical Analysis Today',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      category: 'technical-analysis',
      readTime: 6
    },
    {
      id: '7',
      title: 'European Central Bank Maintains Interest Rates',
      excerpt: 'ECB keeps interest rates unchanged as it monitors economic data and inflation trends in the eurozone.',
      content: 'The European Central Bank decided to keep interest rates steady at its latest meeting...',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
      category: 'market-news',
      readTime: 3
    }
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setArticles(sampleNews);
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Trigger refetch
    window.location.reload();
  };

  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <section className={`py-20 bg-card/30 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Market Insights &
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Analysis
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Stay informed with the latest market news, technical analysis, and
            educational content from trusted financial sources.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-6 w-full rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Unable to Load News
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* News Content */}
        {!loading && !error && articles.length > 0 && (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-12 fade-in-up visible">
                <NewsCard article={featuredArticle} isFeatured />
              </div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {regularArticles.slice(0, 6).map((article) => (
                <div
                  key={article.id}
                  className="fade-in-up visible"
                  style={{ animationDelay: '0.1s' }}
                >
                  <NewsCard article={article} />
                </div>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {['All', 'Market News', 'Technical Analysis', 'Education', 'Economic Calendar'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/10 hover:border-primary/30"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center fade-in-up visible">
              <Button size="lg" className="btn-hover-lift">
                <span className="flex items-center gap-2">
                  View All Market News
                  <ExternalLink className="h-4 w-4" />
                </span>
              </Button>
            </div>

            {/* Last Updated */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              <span className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </>
        )}

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Market Coverage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">50+</div>
              <div className="text-sm text-muted-foreground">News Sources</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">Real-time</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;