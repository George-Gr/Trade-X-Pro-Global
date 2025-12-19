import { trackCustomMetric } from '@/hooks/useWebVitalsEnhanced';
import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  locale?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: string;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order';
  brand?: string;
  category?: string;
}

export interface RichSnippetData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface OpenGraphData {
  'og:title': string;
  'og:description': string;
  'og:image': string;
  'og:url': string;
  'og:type': string;
  'og:site_name': string;
  'og:locale': string;
  'og:price:amount'?: string;
  'og:price:currency'?: string;
  'og:availability'?: string;
  'og:brand'?: string;
}

export interface TwitterCardData {
  'twitter:card': 'summary' | 'summary_large_image' | 'app' | 'player';
  'twitter:site': string;
  'twitter:creator': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:image:alt': string;
  'twitter:player'?: string;
  'twitter:player:width'?: string;
  'twitter:player:height'?: string;
}

export class SEOManager {
  private static instance: SEOManager;
  private currentConfig: SEOConfig | null = null;
  private structuredDataCache: Map<string, RichSnippetData> = new Map();

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  private constructor() {
    this.setupSEOObserver();
    this.initializeDefaultConfigs();
  }

  private setupSEOObserver() {
    // Monitor page changes for SPA routing
    const observer = new MutationObserver(() => {
      this.updatePageSEO();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for route changes
    window.addEventListener('popstate', () => {
      setTimeout(() => this.updatePageSEO(), 100);
    });
  }

  private initializeDefaultConfigs() {
    // Set default configurations for different pages
    this.defaultConfigs = {
      '/': {
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
      '/signup': {
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
      '/trade': {
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
      '/portfolio': {
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
    };
  }

  private defaultConfigs: Record<string, SEOConfig> = {};

  public updatePageSEO(config?: Partial<SEOConfig>) {
    const pathname = window.location.pathname;
    const baseConfig =
      this.defaultConfigs[pathname] || this.defaultConfigs['/'];
    const finalConfig = { ...baseConfig, ...config };

    // Update current config
    this.currentConfig = finalConfig;

    // Apply meta tags
    this.updateMetaTags(finalConfig);

    // Update Open Graph tags
    this.updateOpenGraphTags(finalConfig);

    // Update Twitter Card tags
    this.updateTwitterCardTags(finalConfig);

    // Generate structured data
    this.generateStructuredData(finalConfig);

    // Update canonical URL
    this.updateCanonicalURL(finalConfig);

    // Track SEO update
    trackCustomMetric('seo_update', 1, 'SEO');
  }

  private updateMetaTags(config: SEOConfig) {
    // Basic meta tags
    this.updateMetaTag('title', config.title);
    this.updateMetaTag('description', config.description);

    if (config.keywords) {
      this.updateMetaTag('keywords', config.keywords.join(', '));
    }

    // Additional meta tags for better SEO
    this.updateMetaTag(
      'robots',
      'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    this.updateMetaTag('author', config.author || 'TradeX Pro');
    this.updateMetaTag('language', config.locale || 'en-US');
    this.updateMetaTag('revisit-after', '7 days');

    // Mobile optimization
    this.updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    this.updateMetaTag('mobile-web-app-capable', 'yes');
    this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
    this.updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

    // Theme color for mobile browsers
    this.updateMetaTag('theme-color', '#3b82f6');
    this.updateMetaTag('msapplication-TileColor', '#3b82f6');
  }

  private updateOpenGraphTags(config: SEOConfig) {
    const ogData: OpenGraphData = {
      'og:title': config.title,
      'og:description': config.description,
      'og:image': config.image || '/assets/og-image.jpg',
      'og:url': config.url || window.location.href,
      'og:type': config.type || 'website',
      'og:site_name': config.siteName || 'TradeX Pro',
      'og:locale': config.locale || 'en_US',
    };

    // Add product-specific tags if applicable
    if (config.type === 'product' || config.type === 'service') {
      if (config.price) {
        ogData['og:price:amount'] = config.price;
      }
      if (config.currency) {
        ogData['og:price:currency'] = config.currency;
      }
      if (config.availability) {
        ogData['og:availability'] = config.availability;
      }
      if (config.brand) {
        ogData['og:brand'] = config.brand;
      }
    }

    // Apply Open Graph tags
    Object.entries(ogData).forEach(([property, content]) => {
      this.updateMetaTag(property, content, 'property');
    });
  }

  private updateTwitterCardTags(config: SEOConfig) {
    const twitterData: TwitterCardData = {
      'twitter:card': 'summary_large_image',
      'twitter:site': '@TradeXPro',
      'twitter:creator': '@TradeXPro',
      'twitter:title': config.title,
      'twitter:description': config.description,
      'twitter:image': config.image || '/assets/twitter-image.jpg',
      'twitter:image:alt': config.title,
    };

    // Apply Twitter Card tags
    Object.entries(twitterData).forEach(([name, content]) => {
      this.updateMetaTag(name, content, 'name');
    });
  }

  private updateCanonicalURL(config: SEOConfig) {
    let canonicalUrl = config.url || window.location.href;

    // Remove query parameters and fragments for canonical URL
    canonicalUrl = canonicalUrl.split('?')[0].split('#')[0];

    // Ensure HTTPS
    canonicalUrl = canonicalUrl.replace('http://', 'https://');

    this.updateLinkTag('canonical', canonicalUrl);
  }

  private updateMetaTag(
    name: string,
    content: string,
    attribute: 'name' | 'property' = 'name'
  ) {
    let element = document.querySelector(
      `meta[${attribute}="${name}"]`
    ) as HTMLMetaElement;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  private updateLinkTag(rel: string, href: string) {
    let element = document.querySelector(
      `link[rel="${rel}"]`
    ) as HTMLLinkElement;

    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }

    element.setAttribute('href', href);
  }

  private generateStructuredData(config: SEOConfig) {
    const structuredData = this.createStructuredData(config);

    // Cache the structured data
    const cacheKey = `${config.type}_${Date.now()}`;
    this.structuredDataCache.set(cacheKey, structuredData);

    // Remove existing structured data
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    // Track structured data generation
    trackCustomMetric('structured_data_generated', 1, 'SEO');
  }

  private createStructuredData(config: SEOConfig): RichSnippetData {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': this.getSchemaType(config.type),
      name: config.title,
      description: config.description,
      url: config.url || window.location.href,
      image: config.image,
      author: {
        '@type': 'Organization',
        name: config.author || 'TradeX Pro',
      },
      publisher: {
        '@type': 'Organization',
        name: config.siteName || 'TradeX Pro',
        logo: {
          '@type': 'ImageObject',
          url: '/assets/logo.png',
        },
      },
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime,
    };

    // Add type-specific data
    switch (config.type) {
      case 'website':
        return {
          ...baseData,
          '@type': 'WebSite',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: '/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'service':
        return {
          ...baseData,
          '@type': 'Service',
          serviceType: 'Trading Platform',
          areaServed: 'Worldwide',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Trading Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Forex Trading',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'CFD Trading',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Stock Trading',
                },
              },
            ],
          },
        };

      case 'product':
        return {
          ...baseData,
          '@type': 'Product',
          brand: {
            '@type': 'Brand',
            name: config.brand || 'TradeX Pro',
          },
          category: config.category,
          offers: {
            '@type': 'Offer',
            price: config.price,
            priceCurrency: config.currency || 'USD',
            availability: config.availability
              ? `https://schema.org/${config.availability}`
              : undefined,
            seller: {
              '@type': 'Organization',
              name: 'TradeX Pro',
            },
          },
        };

      default:
        return baseData;
    }
  }

  private getSchemaType(type?: string): string {
    const typeMap: Record<string, string> = {
      website: 'WebSite',
      article: 'Article',
      product: 'Product',
      service: 'Service',
    };

    return typeMap[type || 'website'] || 'WebSite';
  }

  // Advanced SEO features
  public generateBreadcrumbStructuredData(
    breadcrumbs: Array<{ name: string; url: string }>
  ) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };

    this.addStructuredData('breadcrumb', structuredData);
  }

  public generateFAQStructuredData(
    faqs: Array<{ question: string; answer: string }>
  ) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    this.addStructuredData('faq', structuredData);
  }

  public generateReviewStructuredData(
    reviews: Array<{
      author: string;
      rating: number;
      reviewBody: string;
      datePublished: string;
    }>
  ) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      review: reviews.map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: '5',
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished,
      })),
    };

    this.addStructuredData('reviews', structuredData);
  }

  private addStructuredData(key: string, data: RichSnippetData) {
    const scriptId = `structured-data-${key}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data, null, 2);
  }

  // SEO performance tracking
  public trackSEOPerformance() {
    const startTime = performance.now();

    // Track page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      trackCustomMetric('seo_page_load_time', loadTime, 'SEO Performance');
    });

    // Track Core Web Vitals impact on SEO
    this.trackWebVitalsSEO();
  }

  private trackWebVitalsSEO() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Track metrics that affect SEO
          if (entry.entryType === 'largest-contentful-paint') {
            trackCustomMetric('seo_lcp', entry.startTime, 'SEO Performance');
          } else if (entry.entryType === 'first-input') {
            trackCustomMetric(
              'seo_fid',
              (entry as PerformanceEntry & { processingStart?: number })
                .processingStart! - entry.startTime,
              'SEO Performance'
            );
          } else if (entry.entryType === 'layout-shift') {
            trackCustomMetric(
              'seo_cls',
              (entry as PerformanceEntry & { value?: number }).value!,
              'SEO Performance'
            );
          }
        });
      });

      observer.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
      });
    }
  }

  // Get SEO report
  public getSEOReport(): {
    score: number;
    issues: string[];
    recommendations: string[];
    structuredDataCount: number;
    metaTagsCount: number;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for required meta tags
    const title = document.querySelector('title')?.textContent;
    const description = document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content');
    const viewport = document
      .querySelector('meta[name="viewport"]')
      ?.getAttribute('content');

    if (!title) {
      issues.push('Missing page title');
      score -= 10;
    } else if (title.length < 30 || title.length > 60) {
      issues.push('Page title should be 30-60 characters');
      score -= 5;
    }

    if (!description) {
      issues.push('Missing meta description');
      score -= 10;
    } else if (description.length < 120 || description.length > 160) {
      issues.push('Meta description should be 120-160 characters');
      score -= 5;
    }

    if (!viewport) {
      issues.push('Missing viewport meta tag');
      score -= 5;
    }

    // Check for Open Graph tags
    const ogTitle = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content');
    const ogDescription = document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute('content');
    const ogImage = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content');

    if (!ogTitle || !ogDescription || !ogImage) {
      issues.push('Missing Open Graph tags');
      score -= 5;
      recommendations.push(
        'Add complete Open Graph tags for better social media sharing'
      );
    }

    // Check for structured data
    const structuredData = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    if (structuredData.length === 0) {
      issues.push('No structured data found');
      score -= 5;
      recommendations.push(
        'Add structured data for better search engine understanding'
      );
    }

    // Check for canonical URL
    const canonical = document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute('href');
    if (!canonical) {
      issues.push('Missing canonical URL');
      score -= 3;
    }

    // Additional recommendations
    if (score >= 90) {
      recommendations.push('SEO optimization is excellent');
    } else if (score >= 70) {
      recommendations.push(
        'Consider implementing structured data for better search visibility'
      );
      recommendations.push(
        'Optimize page loading speed for better Core Web Vitals'
      );
    } else {
      recommendations.push('Implement comprehensive SEO optimization');
      recommendations.push(
        'Add structured data, meta tags, and optimize loading performance'
      );
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      structuredDataCount: structuredData.length,
      metaTagsCount: document.head.querySelectorAll('meta').length,
    };
  }

  // Update SEO for specific trading scenarios
  public updateTradingSEO(
    scenario: 'forex' | 'stocks' | 'cfds' | 'crypto',
    additionalConfig?: Partial<SEOConfig>
  ) {
    const tradingConfigs = {
      forex: {
        title: 'Forex Trading - TradeX Pro | 50+ Currency Pairs',
        description:
          'Trade major, minor, and exotic currency pairs with competitive spreads and advanced charting tools on TradeX Pro platform.',
        keywords: [
          'forex trading',
          'currency pairs',
          'forex broker',
          'fx trading',
        ],
        type: 'service' as const,
      },
      stocks: {
        title: 'Stock Trading - TradeX Pro | Real-time Market Data',
        description:
          'Trade global stocks with real-time quotes, advanced analytics, and professional trading tools on TradeX Pro.',
        keywords: [
          'stock trading',
          'equity trading',
          'share trading',
          'stock market',
        ],
        type: 'service' as const,
      },
      cfds: {
        title: 'CFD Trading - TradeX Pro | Contracts for Difference',
        description:
          'Trade CFDs on indices, commodities, and cryptocurrencies with leverage and advanced risk management tools.',
        keywords: [
          'CFD trading',
          'contracts for difference',
          'index trading',
          'commodity trading',
        ],
        type: 'service' as const,
      },
      crypto: {
        title: 'Cryptocurrency Trading - TradeX Pro | Bitcoin & Altcoins',
        description:
          'Trade Bitcoin, Ethereum, and other cryptocurrencies with real-time data and advanced trading tools.',
        keywords: [
          'crypto trading',
          'bitcoin trading',
          'ethereum trading',
          'cryptocurrency',
        ],
        type: 'service' as const,
      },
    };

    const config = { ...tradingConfigs[scenario], ...additionalConfig };
    this.updatePageSEO(config);
  }
}

// Singleton instance
export const seoManager = SEOManager.getInstance();

// React hook for SEO management
export function useSEO(config?: Partial<SEOConfig>) {
  useEffect(() => {
    if (config) {
      seoManager.updatePageSEO(config);
    } else {
      seoManager.updatePageSEO();
    }
  }, [config]);

  return {
    updateSEO: (newConfig: Partial<SEOConfig>) =>
      seoManager.updatePageSEO(newConfig),
    generateBreadcrumbs: (breadcrumbs: Array<{ name: string; url: string }>) =>
      seoManager.generateBreadcrumbStructuredData(breadcrumbs),
    generateFAQ: (faqs: Array<{ question: string; answer: string }>) =>
      seoManager.generateFAQStructuredData(faqs),
    generateReviews: (
      reviews: Array<{
        author: string;
        rating: number;
        reviewBody: string;
        datePublished: string;
      }>
    ) => seoManager.generateReviewStructuredData(reviews),
    getSEOReport: () => seoManager.getSEOReport(),
    updateTradingSEO: (
      scenario: 'forex' | 'stocks' | 'cfds' | 'crypto',
      additionalConfig?: Partial<SEOConfig>
    ) => seoManager.updateTradingSEO(scenario, additionalConfig),
  };
}
