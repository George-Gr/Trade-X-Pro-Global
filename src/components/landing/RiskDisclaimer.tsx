import { AlertTriangle } from 'lucide-react';

export function RiskDisclaimer() {
  return (
    <div className="bg-destructive/10 border-y border-destructive/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-3 max-w-5xl mx-auto">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            <span className="font-semibold text-destructive">
              Risk Warning:
            </span>{' '}
            CFDs are complex instruments and come with a high risk of losing
            money rapidly due to leverage.
            <span className="font-semibold">
              {' '}
              76% of retail investor accounts lose money when trading CFDs.
            </span>{' '}
            You should consider whether you understand how CFDs work and whether
            you can afford to take the high risk of losing your money. TradeX
            Pro is a virtual trading platform for educational purposes only. No
            real money is involved.
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompactRiskDisclaimer() {
  return (
    <div className="text-center text-xs text-muted-foreground max-w-3xl mx-auto px-4">
      <p>
        <span className="font-semibold">Risk Warning:</span> 76% of retail CFD
        accounts lose money. TradeX Pro is a virtual trading platform for
        educational purposes only.{' '}
        <a
          href="/legal/risk-disclosure"
          className="underline hover:text-primary transition-colors"
        >
          Full Risk Disclosure
        </a>
      </p>
    </div>
  );
}
