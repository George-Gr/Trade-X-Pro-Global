import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CompanyMenu,
  EducationMenu,
  LegalMenu,
  MarketsMenu,
  TradingMenu,
} from './menus';

export const PublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'focus-visible:ring-primary focus-visible:ring-offset-background',
              'hover:bg-accent/50 hover:shadow-sm'
            )}
            aria-label="TradeX Pro - Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-glow shadow-lg">
              <TrendingUp
                className="h-6 w-6 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              TradeX Pro
            </span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu
              value={menuOpen ? 'trigger' : ''}
              onValueChange={(val: string) => setMenuOpen(!!val)}
            >
              <NavigationMenuList className="gap-1">
                <TradingMenu />
                <MarketsMenu />
                <EducationMenu />
                <CompanyMenu />
                <LegalMenu />
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary hover:bg-accent/80 transition-colors font-medium"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="bg-linear-to-r from-gold to-gold-hover text-white hover:shadow-[0_4px_15px_rgba(255,193,7,0.4)] transition-all duration-300 hover:scale-105 font-semibold"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
