import { TrendingUp } from "lucide-react";

const PortfolioDashboard = () => {
  return (
    <div className="h-full bg-card px-4 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="text-lg font-bold">$50,000.00</div>
        </div>
      </div>

      <div className="h-12 w-px bg-border" />

      <div>
        <div className="text-xs text-muted-foreground">Equity</div>
        <div className="text-sm font-semibold">$50,234.50</div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Margin Used</div>
        <div className="text-sm font-semibold">$325.68</div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Free Margin</div>
        <div className="text-sm font-semibold">$49,908.82</div>
      </div>

      <div className="h-12 w-px bg-border" />

      <div>
        <div className="text-xs text-muted-foreground">Floating P&L</div>
        <div className="text-sm font-semibold text-profit">+$234.50</div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Margin Level</div>
        <div className="text-sm font-semibold">15,421%</div>
      </div>

      <div className="ml-auto">
        <div className="text-xs text-muted-foreground">Open Positions</div>
        <div className="text-sm font-semibold">3</div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
