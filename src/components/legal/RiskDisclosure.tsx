import { AlertTriangle } from 'lucide-react';
import React from 'react';

const RiskDisclosure: React.FC = () => {
  return (
    <div className="bg-secondary/30 border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-start gap-4 max-w-5xl mx-auto">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground">RISK WARNING: TRADING CFDs CARRIES A HIGH LEVEL OF RISK</p>
            <p>
              <strong>High Risk Investment Warning:</strong> Trading Foreign Exchange (Forex) and Contracts for Differences (CFDs) on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade Forex and CFDs, you should carefully consider your trading objectives, level of experience, and risk appetite. You could sustain a loss of some or all of your initial investment and should not invest money that you cannot afford to lose.
            </p>
            <p>
              <strong>Market Volatility:</strong> The prices of the underlying assets of our CFDs may be volatile and can fluctuate rapidly and over wide ranges. This can result in significant losses, especially when trading with leverage. Past performance is not indicative of future results.
            </p>
            <p>
              <strong>Advisory Warning:</strong> TradeX Pro Global provides general advice that does not take into account your objectives, financial situation or needs. The content of this website must not be construed as personal advice. We recommend you seek advice from an independent financial advisor to ensure that you understand the risks involved before trading.
            </p>
            <p className="pt-2 border-t border-border/50">
              TradeX Pro Global is not available to residents of certain jurisdictions including the USA, Iran, and North Korea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosure;
