import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Menu, X, ChevronDown } from 'lucide-react';
import { MegaMenu } from './MegaMenu';

interface EnhancedHeaderProps {
  className?: string;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set scrolled state for background blur
      setIsScrolled(currentScrollY > 50);

      // Auto-hide/show based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMegaMenu(null);
  }, [window.location.pathname]);

  const handleMegaMenuToggle = (menu: string) => {
    setActiveMegaMenu(activeMegaMenu === menu ? null : menu);
  };

  const mainNavItems = [
    {
      label: 'Trading',
      hasMegaMenu: true,
      href: '#',
      menuKey: 'trading'
    },
    {
      label: 'Platforms',
      hasMegaMenu: true,
      href: '#',
      menuKey: 'platforms'
    },
    {
      label: 'Markets',
      hasMegaMenu: true,
      href: '#',
      menuKey: 'markets'
    },
    {
      label: 'Learn',
      hasMegaMenu: true,
      href: '#',
      menuKey: 'learn'
    },
    {
      label: 'Company',
      hasMegaMenu: false,
      href: '/about'
    },
    {
      label: 'Support',
      hasMegaMenu: false,
      href: '/contact'
    }
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`
          header-sticky fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'header-scrolled h-16' : 'h-20'}
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${className}
        `}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setActiveMegaMenu(null)}
          >
            <div className="relative">
              <TrendingUp className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              TradeX Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mainNavItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.hasMegaMenu ? (
                  <button
                    onClick={() => handleMegaMenuToggle(item.menuKey)}
                    className={`
                      flex items-center gap-1 text-foreground hover:text-primary
                      transition-colors duration-200 font-medium text-sm
                      ${activeMegaMenu === item.menuKey ? 'text-primary' : ''}
                    `}
                  >
                    {item.label}
                    <ChevronDown
                      className={`
                        h-4 w-4 transition-transform duration-200
                        ${activeMegaMenu === item.menuKey ? 'rotate-180' : ''}
                      `}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-200 font-medium text-sm"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="btn-hover-lift">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mega Menu */}
        {activeMegaMenu && (
          <div className="absolute top-full left-0 right-0 border-b border-border/50">
            <MegaMenu
              activeMenu={activeMegaMenu}
              onClose={() => setActiveMegaMenu(null)}
            />
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-full bg-card border-l border-border shadow-xl">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">TradeX Pro</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Primary CTAs */}
                <div className="space-y-3 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full btn-hover-lift">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                </div>

                {/* Navigation Items */}
                {mainNavItems.map((item) => (
                  <div key={item.label}>
                    {item.hasMegaMenu ? (
                      <div>
                        <button
                          onClick={() => handleMegaMenuToggle(item.menuKey)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-accent rounded-lg transition-colors"
                        >
                          <span className="font-medium">{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              activeMegaMenu === item.menuKey ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {activeMegaMenu === item.menuKey && (
                          <div className="ml-4 mt-2 space-y-2 animate-fade-in-up">
                            <MegaMenu
                              activeMenu={activeMegaMenu}
                              isMobile={true}
                              onClose={() => {
                                setActiveMegaMenu(null);
                                setIsMobileMenuOpen(false);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block p-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-border">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Join 2M+ traders worldwide</p>
                  <p className="mt-1">Regulated • Secure • 24/7 Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedHeader;