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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
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
                    <ul className="grid w-[400px] gap-3 p-4">
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
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Markets Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Markets</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-3 p-4">
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

                {/* Tools & Education */}
                <NavigationMenuItem>
                  <Link to="/tools" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                    Tools
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/education" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                    Education
                  </Link>
                </NavigationMenuItem>

                {/* About Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>About</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/about/company" className={linkClassName}>
                            <div className="text-sm font-medium">Company</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/about/regulation" className={linkClassName}>
                            <div className="text-sm font-medium">Regulation</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/about/security" className={linkClassName}>
                            <div className="text-sm font-medium">Security</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/partners" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                    Partners
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
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
  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
);
