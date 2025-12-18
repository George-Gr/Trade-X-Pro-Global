import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  TradingMenu,
  MarketsMenu,
  EducationMenu,
  CompanyMenu,
  LegalMenu,
} from "./menus";

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
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
              "flex items-center gap-2.5 rounded-lg px-2 py-1 -ml-2",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-primary focus-visible:ring-offset-background",
              "hover:opacity-80",
            )}
            aria-label="TradeX Pro - Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <TrendingUp
                className="h-5 w-5 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              TradeX Pro
            </span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu
              value={menuOpen ? "trigger" : ""}
              onValueChange={(val: string) => setMenuOpen(!!val)}
            >
              <NavigationMenuList>
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
                className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
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
