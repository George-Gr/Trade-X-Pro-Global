import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Mail,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Globe,
  Download,
  Award,
  Shield,
  Headphones,
  Users,
  ExternalLink,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

interface NewsletterFormProps {
  onSubmit: (email: string) => void;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Success
      onSubmit(email);
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center gap-2 text-green-500 mb-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Successfully Subscribed!</span>
        </div>
        <p className="text-sm text-foreground">
          Thank you for subscribing to our newsletter. Check your inbox for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 pr-12"
          disabled={isSubmitting}
        />
        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
      </Button>
      <p className="text-xs text-muted-foreground">
        By subscribing, you agree to our{' '}
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{' '}
        and consent to receive marketing communications.
      </p>
    </form>
  );
};

interface SocialLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ icon, label, href, color = 'text-foreground/60' }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 hover:text-primary transition-colors ${color}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </a>
  );
};

interface EnhancedFooterProps {
  className?: string;
}

const EnhancedFooter: React.FC<EnhancedFooterProps> = ({ className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNewsletterSubmit = (email: string) => {
    console.log('Newsletter subscription for:', email);
    // Here you would integrate with your newsletter service
    // like Mailchimp, SendGrid, etc.
  };

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Why TradeX Pro', href: '/about/why' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press & Media', href: '/press' },
    { label: 'Partners', href: '/partners' },
    { label: 'Blog', href: '/blog' }
  ];

  const productsLinks = [
    { label: 'Trading Platform', href: '/platform' },
    { label: 'Mobile Apps', href: '/mobile' },
    { label: 'Desktop Terminal', href: '/desktop' },
    { label: 'API Access', href: '/api' },
    { label: 'Demo Account', href: '/register' },
    { label: 'Live Account', href: '/register' }
  ];

  const resourcesLinks = [
    { label: 'Trading Academy', href: '/academy' },
    { label: 'Video Tutorials', href: '/tutorials' },
    { label: 'Market Analysis', href: '/analysis' },
    { label: 'Economic Calendar', href: '/calendar' },
    { label: 'Trading Signals', href: '/signals' },
    { label: 'Glossary', href: '/glossary' }
  ];

  const supportLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Live Chat', href: '/chat' },
    { label: 'Account Issues', href: '/account' },
    { label: 'Technical Support', href: '/support' }
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Risk Disclosure', href: '/risk' },
    { label: 'AML Policy', href: '/aml' },
    { label: 'Compliance', href: '/compliance' }
  ];

  const socialLinks = [
    { icon: <TrendingUp className="h-5 w-5" />, label: 'LinkedIn', href: 'https://linkedin.com/company/tradex', color: 'text-blue-400 hover:text-blue-300' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Twitter', href: 'https://twitter.com/tradex', color: 'text-blue-400 hover:text-blue-300' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'YouTube', href: 'https://youtube.com/tradex', color: 'text-red-500 hover:text-red-400' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Facebook', href: 'https://facebook.com/tradex', color: 'text-blue-600 hover:text-blue-500' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Instagram', href: 'https://instagram.com/tradex', color: 'text-pink-500 hover:text-pink-400' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Telegram', href: 'https://t.me/tradex', color: 'text-blue-500 hover:text-blue-400' }
  ];

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'MasterCard', icon: '💳' },
    { name: 'PayPal', icon: '💳' },
    { name: 'Skrill', icon: '💳' },
    { name: 'Neteller', icon: '💳' },
    { name: 'Bank Transfer', icon: '🏦' }
  ];

  const regulatoryBadges = [
    { name: 'FCA', region: 'UK' },
    { name: 'CySEC', region: 'EU' },
    { name: 'ASIC', region: 'AUS' },
    { name: 'FSCA', region: 'SA' }
  ];

  const securityBadges = [
    { name: 'SSL Secured' },
    { name: '256-bit Encryption' },
    { name: 'PCI Compliant' },
    { name: 'GDPR Compliant' }
  ];

  const FooterSection: React.FC<{
    title: string;
    children: React.ReactNode;
    isMobile?: boolean;
    expanded?: boolean;
    onToggle?: () => void;
  }> = ({ title, children, isMobile, expanded, onToggle }) => {
    if (isMobile) {
      return (
        <div className="border-b border-border/30">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
          >
            <span className="font-medium text-sm uppercase tracking-wide">{title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <div className="p-4 space-y-3 border-t border-border/30">
              {children}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">
          {title}
        </h4>
        {children}
      </div>
    );
  };

  return (
    <footer className={`bg-background border-t border-border ${className}`}>
      {/* Main Content Area */}
      <div className="container mx-auto px-4">
        <div className="py-12">
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-12 gap-8">
            {/* Column 1: Company */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold">TradeX Pro</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional paper trading platform for educational purposes.
                Practice trading strategies with virtual funds in a risk-free environment.
              </p>

              {/* Newsletter */}
              <div className="mt-6">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70 mb-3">
                  Stay Updated
                </h4>
                <NewsletterForm onSubmit={handleNewsletterSubmit} />
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70 mb-3">
                  Follow Us
                </h4>
                <div className="flex gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 bg-background rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all ${link.color}`}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Products */}
            <div className="lg:col-span-2">
              <FooterSection title="Products">
                {productsLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </FooterSection>
            </div>

            {/* Column 3: Resources */}
            <div className="lg:col-span-2">
              <FooterSection title="Resources">
                {resourcesLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </FooterSection>
            </div>

            {/* Column 4: Company */}
            <div className="lg:col-span-2">
              <FooterSection title="Company">
                {companyLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </FooterSection>
            </div>

            {/* Column 5: Support */}
            <div className="lg:col-span-2">
              <FooterSection title="Support">
                {supportLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </FooterSection>
            </div>

            {/* Column 6: Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">
                  Contact Info
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>support@tradex.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+1 (800) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>New York, NY</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70">
                  Business Hours
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Monday - Friday: 24/5</p>
                  <p>Saturday - Sunday: Closed</p>
                  <p>Market Hours: 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden space-y-4">
            <FooterSection
              title="Company"
              isMobile={true}
              expanded={expandedSections.company}
              onToggle={() => toggleSection('company')}
            >
              {companyLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </FooterSection>

            <FooterSection
              title="Products"
              isMobile={true}
              expanded={expandedSections.products}
              onToggle={() => toggleSection('products')}
            >
              {productsLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </FooterSection>

            <FooterSection
              title="Resources"
              isMobile={true}
              expanded={expandedSections.resources}
              onToggle={() => toggleSection('resources')}
            >
              {resourcesLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </FooterSection>

            <FooterSection
              title="Support"
              isMobile={true}
              expanded={expandedSections.support}
              onToggle={() => toggleSection('support')}
            >
              {supportLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </FooterSection>

            {/* Newsletter in mobile */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground/70 mb-3">
                Newsletter
              </h4>
              <NewsletterForm onSubmit={handleNewsletterSubmit} />
            </div>
          </div>
        </div>

        {/* Payment & Trust Indicators Bar */}
        <div className="border-y border-border/20 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Payment Methods */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3 text-center lg:text-left">
                We Accept
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-2 bg-background rounded-lg border border-border/50"
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm text-muted-foreground">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory Badges */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3 text-center lg:text-left">
                Regulated By
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {regulatoryBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{badge.name}</span>
                      <span className="text-xs text-muted-foreground">{badge.region}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3 text-center lg:text-left">
                Security
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {securityBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <Award className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className="border-t border-border/20 pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-center gap-4 text-sm text-muted-foreground">
              <span>© 2025 TradeX Pro. All rights reserved.</span>
              <div className="flex items-center gap-2">
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Italian</option>
                <option>Portuguese</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Korean</option>
                <option>Arabic</option>
              </select>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t border-border/20">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <strong>Disclaimer:</strong> TradeX Pro is a simulated trading platform for educational purposes only.
              No real funds are involved. Trading CFDs involves significant risk and you may lose more than your initial investment.
              Past performance is not indicative of future results. This platform is not affiliated with IC Markets or any financial institution.
              Please ensure you understand the risks involved before trading.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              TradeX Pro does not provide investment advice. All content on this platform is for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;