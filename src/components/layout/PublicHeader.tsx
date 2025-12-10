import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart3, 
  Laptop, 
  Users, 
  Settings2, 
  Wrench,
  DollarSign,
  LineChart,
  Building2,
  Gem,
  Bitcoin,
  GraduationCap,
  Video,
  Award,
  BookOpen,
  UserCheck,
  BookMarked,
  Info,
  Shield,
  Lock,
  Handshake,
  Phone,
  FileText,
  ScrollText,
  AlertTriangle,
  Cookie,
  Scale
} from "lucide-react";
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

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const NavLink = ({ to, icon, title, description }: NavLinkProps) => (
  <NavigationMenuLink asChild>
    <Link
      to={to}
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 transition-all duration-200",
        "hover:bg-accent/80 focus:bg-accent focus:outline-none",
        "border border-transparent hover:border-border/50"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium leading-none group-hover:text-foreground">
          {title}
        </div>
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80">
            {description}
          </p>
        )}
      </div>
    </Link>
  </NavigationMenuLink>
);

export const PublicHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1 -ml-2" 
            aria-label="TradeX Pro - Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <TrendingUp className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
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
                    <div className="w-[480px] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <NavLink
                          to="/trading/instruments"
                          icon={<BarChart3 className="h-4 w-4" />}
                          title="Trading Instruments"
                          description="Forex, Stocks, Indices, Commodities, Crypto"
                        />
                        <NavLink
                          to="/trading/platforms"
                          icon={<Laptop className="h-4 w-4" />}
                          title="Trading Platforms"
                          description="MT4, MT5, WebTrader, Mobile Apps"
                        />
                        <NavLink
                          to="/trading/account-types"
                          icon={<Users className="h-4 w-4" />}
                          title="Account Types"
                          description="Standard, Premium, ECN, Islamic"
                        />
                        <NavLink
                          to="/trading/conditions"
                          icon={<Settings2 className="h-4 w-4" />}
                          title="Trading Conditions"
                          description="Spreads, Leverage, Execution"
                        />
                        <NavLink
                          to="/trading/tools"
                          icon={<Wrench className="h-4 w-4" />}
                          title="Trading Tools"
                          description="Analysis, Signals, Calculators"
                        />
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Markets Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Markets</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <NavLink
                          to="/markets/forex"
                          icon={<DollarSign className="h-4 w-4" />}
                          title="Forex"
                          description="Major, Minor & Exotic pairs"
                        />
                        <NavLink
                          to="/markets/stocks"
                          icon={<LineChart className="h-4 w-4" />}
                          title="Stocks"
                          description="Global equity CFDs"
                        />
                        <NavLink
                          to="/markets/indices"
                          icon={<Building2 className="h-4 w-4" />}
                          title="Indices"
                          description="World market indices"
                        />
                        <NavLink
                          to="/markets/commodities"
                          icon={<Gem className="h-4 w-4" />}
                          title="Commodities"
                          description="Gold, Oil, Natural Gas"
                        />
                        <NavLink
                          to="/markets/cryptocurrencies"
                          icon={<Bitcoin className="h-4 w-4" />}
                          title="Cryptocurrencies"
                          description="BTC, ETH & more"
                        />
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Education Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Education</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <NavLink
                          to="/education/webinar"
                          icon={<Video className="h-4 w-4" />}
                          title="Webinars"
                          description="Live trading sessions"
                        />
                        <NavLink
                          to="/education/certifications"
                          icon={<Award className="h-4 w-4" />}
                          title="Certifications"
                          description="Trading certificates"
                        />
                        <NavLink
                          to="/education/tutorials"
                          icon={<BookOpen className="h-4 w-4" />}
                          title="Tutorials & E-Books"
                          description="Guides & resources"
                        />
                        <NavLink
                          to="/education/mentorship"
                          icon={<UserCheck className="h-4 w-4" />}
                          title="Mentorship"
                          description="1-on-1 coaching"
                        />
                        <NavLink
                          to="/education/glossary"
                          icon={<BookMarked className="h-4 w-4" />}
                          title="Glossary"
                          description="Trading terminology"
                        />
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Company Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <NavLink
                          to="/company/about"
                          icon={<Info className="h-4 w-4" />}
                          title="About Us"
                          description="Our story & mission"
                        />
                        <NavLink
                          to="/company/regulation"
                          icon={<Shield className="h-4 w-4" />}
                          title="Regulation"
                          description="Licenses & compliance"
                        />
                        <NavLink
                          to="/company/security"
                          icon={<Lock className="h-4 w-4" />}
                          title="Security"
                          description="Fund protection"
                        />
                        <NavLink
                          to="/company/partners"
                          icon={<Handshake className="h-4 w-4" />}
                          title="Partners"
                          description="Partnership programs"
                        />
                        <NavLink
                          to="/company/contact"
                          icon={<Phone className="h-4 w-4" />}
                          title="Contact Us"
                          description="Get in touch"
                        />
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Legal Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Legal</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <NavLink
                          to="/legal/privacy"
                          icon={<FileText className="h-4 w-4" />}
                          title="Privacy Policy"
                          description="Data protection"
                        />
                        <NavLink
                          to="/legal/terms"
                          icon={<ScrollText className="h-4 w-4" />}
                          title="Terms & Conditions"
                          description="Service agreement"
                        />
                        <NavLink
                          to="/legal/risk-disclosure"
                          icon={<AlertTriangle className="h-4 w-4" />}
                          title="Risk Disclosure"
                          description="Trading risks"
                        />
                        <NavLink
                          to="/legal/cookie-policy"
                          icon={<Cookie className="h-4 w-4" />}
                          title="Cookie Policy"
                          description="Cookie usage"
                        />
                        <NavLink
                          to="/legal/aml-policy"
                          icon={<Scale className="h-4 w-4" />}
                          title="AML Policy"
                          description="Anti-money laundering"
                        />
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
