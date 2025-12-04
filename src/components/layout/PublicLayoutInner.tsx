import { ParallaxAuroraLayout } from "@/components/ParallaxAuroraLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayoutInner = ({ children }: PublicLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <ParallaxAuroraLayout sections={3}>
      {/* Main Navigation */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">TradeX Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoginClick}
            className="text-sm"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={handleRegisterClick}
            className="text-sm"
          >
            Register
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Trading</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/trading/instruments" className="hover:text-foreground">Trading Instruments</a></li>
                <li><a href="/trading/platforms" className="hover:text-foreground">Trading Platforms</a></li>
                <li><a href="/trading/account-types" className="hover:text-foreground">Account Types</a></li>
                <li><a href="/trading/conditions" className="hover:text-foreground">Trading Conditions</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Markets</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/markets/forex" className="hover:text-foreground">Forex</a></li>
                <li><a href="/markets/stocks" className="hover:text-foreground">Stocks</a></li>
                <li><a href="/markets/indices" className="hover:text-foreground">Indices</a></li>
                <li><a href="/markets/commodities" className="hover:text-foreground">Commodities</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Education</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/education/tutorials" className="hover:text-foreground">Tutorials</a></li>
                <li><a href="/education/webinar" className="hover:text-foreground">Webinar</a></li>
                <li><a href="/education/mentorship" className="hover:text-foreground">Mentorship</a></li>
                <li><a href="/education/certifications" className="hover:text-foreground">Certifications</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/company/about" className="hover:text-foreground">About Us</a></li>
                <li><a href="/company/regulation" className="hover:text-foreground">Regulation</a></li>
                <li><a href="/company/security" className="hover:text-foreground">Security</a></li>
                <li><a href="/company/contact" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 TradeX Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </ParallaxAuroraLayout>
  );
};

export default PublicLayoutInner;