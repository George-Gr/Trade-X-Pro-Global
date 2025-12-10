import { Link } from "react-router-dom";
import { TrendingUp, Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">TradeX Pro</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Professional CFD trading platform with advanced tools and risk management features.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-2" aria-label="Follow us on Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-2" aria-label="Follow us on Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-2" aria-label="Follow us on LinkedIn" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-2" aria-label="Subscribe on YouTube" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-2" aria-label="Follow us on Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Trading Column */}
          <div>
            <h3 className="font-semibold mb-4">Trading</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trading/instruments" className="text-muted-foreground hover:text-foreground transition-colors">Trading Instruments</Link></li>
              <li><Link to="/trading/platforms" className="text-muted-foreground hover:text-foreground transition-colors">Platforms</Link></li>
              <li><Link to="/trading/account-types" className="text-muted-foreground hover:text-foreground transition-colors">Account Types</Link></li>
              <li><Link to="/trading/conditions" className="text-muted-foreground hover:text-foreground transition-colors">Trading Conditions</Link></li>
              <li><Link to="/trading/tools" className="text-muted-foreground hover:text-foreground transition-colors">Trading Tools</Link></li>
            </ul>
          </div>

          {/* Markets Column */}
          <div>
            <h3 className="font-semibold mb-4">Markets</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/markets/forex" className="text-muted-foreground hover:text-foreground transition-colors">Forex</Link></li>
              <li><Link to="/markets/stocks" className="text-muted-foreground hover:text-foreground transition-colors">Stocks</Link></li>
              <li><Link to="/markets/indices" className="text-muted-foreground hover:text-foreground transition-colors">Indices</Link></li>
              <li><Link to="/markets/commodities" className="text-muted-foreground hover:text-foreground transition-colors">Commodities</Link></li>
              <li><Link to="/markets/cryptocurrencies" className="text-muted-foreground hover:text-foreground transition-colors">Cryptocurrencies</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/company/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/company/regulation" className="text-muted-foreground hover:text-foreground transition-colors">Regulation</Link></li>
              <li><Link to="/company/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
              <li><Link to="/company/partners" className="text-muted-foreground hover:text-foreground transition-colors">Partners</Link></li>
              <li><Link to="/company/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/legal/risk-disclosure" className="text-muted-foreground hover:text-foreground transition-colors">Risk Disclosure</Link></li>
              <li><Link to="/legal/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link to="/legal/aml-policy" className="text-muted-foreground hover:text-foreground transition-colors">AML Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-warning">Risk Warning:</strong> CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 
              <strong> 75% of retail investor accounts lose money when trading CFDs.</strong> You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} TradeX Pro. All rights reserved.</p>
          <p>Regulated by FSA | License No: SD123456</p>
        </div>
      </div>
    </footer>
  );
};
