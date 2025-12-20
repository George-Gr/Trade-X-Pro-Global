import React, { useCallback, useEffect } from 'react';
import { seoManager, useSEO } from '../../lib/seo/SEOManager';

interface SEOIntegrationProps {
  children: React.ReactNode;
  enableSEO?: boolean;
  pageType?: 'landing' | 'signup' | 'trade' | 'portfolio' | 'about';
  customConfig?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    tradingType?: 'forex' | 'stocks' | 'cfds' | 'crypto';
  };
}

export const SEOIntegration: React.FC<SEOIntegrationProps> = ({
  children,
  enableSEO = true,
  pageType = 'landing',
  customConfig = {},
}) => {
  const {
    updateSEO,
    generateBreadcrumbs,
    generateFAQ,
    generateReviews,
    // getSEOReport,
  } = useSEO();

  const setupPageSEO = useCallback(
    (type: string, config: Record<string, unknown>) => {
      const pageConfigs: Record<string, Record<string, unknown>> = {
        landing: {
          title:
            'TradeX Pro - Professional Trading Platform | Forex, CFDs, Stocks',
          description:
            'TradeX Pro offers advanced trading tools, real-time market data, and professional-grade analytics for forex, CFDs, and stocks. Start trading with confidence.',
          keywords: [
            'trading platform',
            'forex trading',
            'CFD trading',
            'stock trading',
            'professional trading',
          ],
          type: 'website' as const,
          siteName: 'TradeX Pro',
        },
        signup: {
          title: 'Create Account - TradeX Pro | Start Trading Today',
          description:
            'Create your TradeX Pro account and start trading with advanced tools, real-time data, and professional support. Join thousands of successful traders.',
          keywords: [
            'trading account',
            'forex signup',
            'CFD registration',
            'start trading',
          ],
          type: 'website' as const,
          siteName: 'TradeX Pro',
        },
        trade: {
          title: 'Trading Platform - TradeX Pro | Advanced Charts & Tools',
          description:
            'Access professional trading tools, advanced charting, real-time market data, and instant order execution on TradeX Pro platform.',
          keywords: [
            'trading tools',
            'forex charts',
            'technical analysis',
            'trading platform',
          ],
          type: 'service' as const,
          siteName: 'TradeX Pro',
        },
        portfolio: {
          title: 'Portfolio Management - TradeX Pro | Track Your Performance',
          description:
            'Monitor your trading portfolio, track performance, analyze P&L, and manage your investments with TradeX Pro portfolio tools.',
          keywords: [
            'portfolio management',
            'trading performance',
            'P&L tracking',
            'investment tracking',
          ],
          type: 'service' as const,
          siteName: 'TradeX Pro',
        },
        about: {
          title: 'About TradeX Pro - Professional Trading Platform',
          description:
            'Learn about TradeX Pro, our mission to democratize trading, advanced technology, and professional trading tools.',
          keywords: [
            'about tradex pro',
            'trading platform',
            'forex broker',
            'professional trading',
          ],
          type: 'website' as const,
          siteName: 'TradeX Pro',
        },
      };

      const baseConfig = pageConfigs[type] || pageConfigs.landing;
      const finalConfig = { ...baseConfig, ...config };

      updateSEO(finalConfig);
    },
    [updateSEO]
  );

  const generateLandingPageStructuredData = useCallback(() => {
    // Generate FAQ structured data
    const faqs = [
      {
        question: 'What is TradeX Pro?',
        answer:
          'TradeX Pro is a professional trading platform offering advanced tools for forex, CFDs, and stock trading with real-time market data and analytics.',
      },
      {
        question: 'How do I start trading?',
        answer:
          'Simply create an account, complete verification, and start trading with our intuitive platform and professional tools.',
      },
      {
        question: 'What markets can I trade?',
        answer:
          'You can trade forex pairs, CFDs on indices and commodities, stocks, and cryptocurrencies on our platform.',
      },
    ];
    generateFAQ(faqs);

    // Generate breadcrumb structured data
    generateBreadcrumbs([
      { name: 'Home', url: window.location.origin },
      { name: 'Trading Platform', url: window.location.href },
    ]);
  }, [generateFAQ, generateBreadcrumbs]);

  const generateSignupPageStructuredData = useCallback(() => {
    // Generate review structured data for social proof
    const reviews = [
      {
        author: 'John Smith',
        rating: 5,
        reviewBody: 'Excellent trading platform with great tools and support.',
        datePublished: '2024-12-01',
      },
      {
        author: 'Sarah Johnson',
        rating: 5,
        reviewBody: 'Best trading experience I have had. Highly recommended!',
        datePublished: '2024-11-28',
      },
    ];
    generateReviews(reviews);

    // Generate breadcrumb structured data
    generateBreadcrumbs([
      { name: 'Home', url: window.location.origin },
      { name: 'Sign Up', url: window.location.href },
    ]);
  }, [generateReviews, generateBreadcrumbs]);

  const generateTradingPageStructuredData = useCallback(() => {
    // Generate service structured data
    const serviceData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Professional Trading Platform',
      description:
        'Advanced trading tools with real-time market data and analytics',
      provider: {
        '@type': 'Organization',
        name: 'TradeX Pro',
      },
      areaServed: 'Worldwide',
      serviceType: 'Trading Services',
    };

    // Add service structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(serviceData);
    document.head.appendChild(script);

    // Generate breadcrumb structured data
    generateBreadcrumbs([
      { name: 'Home', url: window.location.origin },
      { name: 'Trading Platform', url: window.location.href },
    ]);
  }, [generateBreadcrumbs]);

  const generatePortfolioPageStructuredData = useCallback(() => {
    // Generate breadcrumb structured data
    generateBreadcrumbs([
      { name: 'Home', url: window.location.origin },
      { name: 'Portfolio', url: window.location.href },
    ]);
  }, [generateBreadcrumbs]);

  const generateStructuredData = useCallback(
    (type: string) => {
      switch (type) {
        case 'landing':
          generateLandingPageStructuredData();
          break;
        case 'signup':
          generateSignupPageStructuredData();
          break;
        case 'trade':
          generateTradingPageStructuredData();
          break;
        case 'portfolio':
          generatePortfolioPageStructuredData();
          break;
      }
    },
    [
      generateLandingPageStructuredData,
      generateSignupPageStructuredData,
      generateTradingPageStructuredData,
      generatePortfolioPageStructuredData,
    ]
  );

  useEffect(() => {
    if (enableSEO) {
      setupPageSEO(pageType, customConfig);
      generateStructuredData(pageType);
    }
  }, [enableSEO, pageType, customConfig, setupPageSEO, generateStructuredData]);

  return (
    <div className="seo-container">
      {children}
      {enableSEO && <SEOHealthMonitor />}
    </div>
  );
};

// Trading-specific SEO optimization
export function TradingSEO({
  tradingType,
}: {
  tradingType: 'forex' | 'stocks' | 'cfds' | 'crypto';
}) {
  const { updateTradingSEO } = useSEO();

  useEffect(() => {
    updateTradingSEO(tradingType);
  }, [tradingType, updateTradingSEO]);

  return null;
}

// SEO health monitoring component
function SEOHealthMonitor() {
  const [seoReport, setSeoReport] = React.useState<Record<
    string,
    unknown
  > | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const generateReport = () => {
      const report = seoManager.getSEOReport();
      setSeoReport(report);
    };

    generateReport();
    const interval = setInterval(generateReport, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (
    !seoReport ||
    typeof seoReport !== 'object' ||
    seoReport === null ||
    !('score' in seoReport) ||
    typeof seoReport.score !== 'number'
  ) {
    return null;
  }

  // Narrow the type for safe access
  const typedSeoReport = seoReport as {
    score: number;
    issues: string[];
    recommendations: string[];
    structuredDataCount: number;
    metaTagsCount: number;
  };

  return (
    <div className="seo-health-monitor fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold">SEO Health</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {isVisible && (
        <div className="p-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">SEO Score</span>
              <span
                className={`text-sm font-bold ${
                  typedSeoReport.score >= 90
                    ? 'text-green-600'
                    : typedSeoReport.score >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {typedSeoReport.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  typedSeoReport.score >= 90
                    ? 'bg-green-500'
                    : typedSeoReport.score >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${typedSeoReport.score}%` }}
              />
            </div>
          </div>

          {typedSeoReport.issues.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-red-600 mb-1">
                Issues
              </h4>
              <div className="space-y-1">
                {typedSeoReport.issues
                  .slice(0, 3)
                  .map((issue: string, index: number) => (
                    <div key={index} className="text-xs text-red-600">
                      • {issue}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {typedSeoReport.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-blue-600 mb-1">
                Recommendations
              </h4>
              <div className="space-y-1">
                {typedSeoReport.recommendations
                  .slice(0, 2)
                  .map((rec: string, index: number) => (
                    <div key={index} className="text-xs text-blue-600">
                      • {rec}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div>Structured Data: {typedSeoReport.structuredDataCount}</div>
            <div>Meta Tags: {typedSeoReport.metaTagsCount}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// SEO component for dynamic meta tags
export function DynamicMetaTags({
  title,
  description,
  keywords,
  image,
  type = 'website',
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product' | 'service';
}) {
  const { updateSEO } = useSEO();

  useEffect(() => {
    updateSEO({
      title,
      description,
      ...(keywords ? { keywords } : {}),
      ...(image ? { image } : {}),
      type,
    });
  }, [title, description, keywords, image, type, updateSEO]);

  return null;
}

// Quick SEO setup for common pages
export function QuickSEOSetup({
  pageType,
}: {
  pageType: 'landing' | 'signup' | 'trade' | 'portfolio';
}) {
  const { updateSEO } = useSEO();

  useEffect(() => {
    const quickConfigs = {
      landing: {
        title: 'TradeX Pro - Professional Trading Platform',
        description:
          'Advanced trading tools for forex, CFDs, and stocks. Start trading today with professional-grade analytics.',
        keywords: ['trading', 'forex', 'CFD', 'stocks', 'professional trading'],
        image: '/assets/og-image.jpg',
      },
      signup: {
        title: 'Create Account - TradeX Pro',
        description:
          'Join thousands of successful traders. Create your account and start trading with advanced tools.',
        keywords: ['signup', 'trading account', 'create account'],
        image: '/assets/signup-og.jpg',
      },
      trade: {
        title: 'Trading Platform - TradeX Pro',
        description:
          'Professional trading tools with real-time data, advanced charts, and instant execution.',
        keywords: ['trading platform', 'forex trading', 'trading tools'],
        image: '/assets/trading-og.jpg',
      },
      portfolio: {
        title: 'Portfolio - TradeX Pro',
        description:
          'Monitor your trading performance, track P&L, and manage your investments.',
        keywords: ['portfolio', 'trading performance', 'P&L'],
        image: '/assets/portfolio-og.jpg',
      },
    };

    updateSEO(quickConfigs[pageType]);
  }, [pageType, updateSEO]);

  return null;
}

// Rich snippets component for enhanced search results
export function RichSnippets({
  businessInfo,
  reviews,
  faqs,
}: {
  businessInfo?: {
    name: string;
    description: string;
    url: string;
    logo?: string;
    address?: string;
    phone?: string;
  };
  reviews?: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}) {
  const { generateFAQ, generateReviews } = useSEO();

  useEffect(() => {
    if (faqs && faqs.length > 0) {
      generateFAQ(faqs);
    }

    if (reviews && reviews.length > 0) {
      generateReviews(reviews);
    }

    if (businessInfo) {
      generateBusinessStructuredData(businessInfo);
    }
  }, [businessInfo, reviews, faqs, generateFAQ, generateReviews]);

  const generateBusinessStructuredData = (info: Record<string, unknown>) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: info.name,
      description: info.description,
      url: info.url,
      logo: info.logo,
      address: info.address
        ? {
            '@type': 'PostalAddress',
            ...info.address,
          }
        : undefined,
      telephone: info.phone,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  return null;
}
