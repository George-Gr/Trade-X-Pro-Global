import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const PublicHeader = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-sm" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-4" aria-label="TradeX Pro - Home">
            <TrendingUp className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              TradeX Pro
            </span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Trading Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Trading</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-4 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/trading/instruments" className={linkClassName}>
                            <div className="text-sm font-medium">Trading Instruments</div>
                            <p className="text-xs text-muted-foreground">
                              Forex, Stocks, Indices, Commodities, Crypto
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/trading/platforms" className={linkClassName}>
                            <div className="text-sm font-medium">Trading Platforms</div>
                            <p className="text-xs text-muted-foreground">
                              MT4, MT5, WebTrader, Mobile Apps
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/trading/account-types" className={linkClassName}>
                            <div className="text-sm font-medium">Account Types</div>
                            <p className="text-xs text-muted-foreground">
                              Standard, Premium, ECN, Islamic, Corporate
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/trading/conditions" className={linkClassName}>
                            <div className="text-sm font-medium">Trading Conditions</div>
                            <p className="text-xs text-muted-foreground">
                              Spreads, Leverage, Execution, Hours
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/trading/tools" className={linkClassName}>
                            <div className="text-sm font-medium">Trading Tools</div>
                            <p className="text-xs text-muted-foreground">
                              Analysis, Signals, Calculators, Alerts
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Markets Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Markets</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/markets/forex" className={linkClassName}>
                            <div className="text-sm font-medium">Forex</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/markets/stocks" className={linkClassName}>
                            <div className="text-sm font-medium">Stocks</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/markets/indices" className={linkClassName}>
                            <div className="text-sm font-medium">Indices</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/markets/commodities" className={linkClassName}>
                            <div className="text-sm font-medium">Commodities</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/markets/cryptocurrencies" className={linkClassName}>
                            <div className="text-sm font-medium">Cryptocurrencies</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Education Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Education</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/education/webinar" className={linkClassName}>
                            <div className="text-sm font-medium">Webinar</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/education/certifications" className={linkClassName}>
                            <div className="text-sm font-medium">Certifications</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/education/tutorials" className={linkClassName}>
                            <div className="text-sm font-medium">Tutorials & E-Book</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/education/mentorship" className={linkClassName}>
                            <div className="text-sm font-medium">Mentorship</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/education/glossary" className={linkClassName}>
                            <div className="text-sm font-medium">Glossary</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Company Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/company/about" className={linkClassName}>
                            <div className="text-sm font-medium">About Us</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/company/regulation" className={linkClassName}>
                            <div className="text-sm font-medium">Regulation</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/company/security" className={linkClassName}>
                            <div className="text-sm font-medium">Security</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/company/partners" className={linkClassName}>
                            <div className="text-sm font-medium">Partners</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/company/contact" className={linkClassName}>
                            <div className="text-sm font-medium">Contact Us</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Legal Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Legal</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/legal/privacy" className={linkClassName}>
                            <div className="text-sm font-medium">Privacy Policy</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/legal/terms" className={linkClassName}>
                            <div className="text-sm font-medium">Terms & Conditions</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/legal/risk-disclosure" className={linkClassName}>
                            <div className="text-sm font-medium">Risk Disclosure</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/legal/cookie-policy" className={linkClassName}>
                            <div className="text-sm font-medium">Cookie Policy</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/legal/aml-policy" className={linkClassName}>
                            <div className="text-sm font-medium">AML Policy</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary" aria-label="Login to your account">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow focus-visible:ring-2 focus-visible:ring-primary" aria-label="Create new account">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const linkClassName = cn(
  "block select-none space-y-2 rounded-md p-4 leading-tight no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
);
