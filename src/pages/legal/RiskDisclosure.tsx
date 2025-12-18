import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Risk Disclosure Statement</h1>

          <Alert className="mb-8 border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-foreground">
              <strong className="text-warning">WARNING:</strong> CFDs are
              complex instruments and come with a high risk of losing money
              rapidly due to leverage.
              <strong>
                {" "}
                75% of retail investor accounts lose money when trading CFDs
                with this provider.
              </strong>{" "}
              You should consider whether you understand how CFDs work and
              whether you can afford to take the high risk of losing your money.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className=" space-y-6 prose prose-invert">
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  1. General Risk Warning
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  Trading Contracts for Difference (CFDs) involves substantial
                  risk of loss and is not suitable for all investors. The high
                  degree of leverage that is often obtainable in CFD trading can
                  work against you as well as for you. You should carefully
                  consider your investment objectives, level of experience, and
                  risk appetite before deciding to trade CFDs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  2. Leverage Risk
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  CFDs are leveraged products, meaning you can gain exposure to
                  large positions with a relatively small initial investment.
                  While leverage magnifies potential profits, it equally
                  magnifies potential losses:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                  <li>You can lose more than your initial deposit</li>
                  <li>
                    Small market movements can result in proportionately larger
                    losses
                  </li>
                  <li>
                    Leverage ratios vary by instrument (up to 1:500 for forex,
                    1:20 for stocks)
                  </li>
                  <li>
                    Margin calls may require you to deposit additional funds or
                    close positions
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  3. Market Volatility Risk
                </h2>
                <p className="text-muted-foreground">
                  Financial markets can be extremely volatile. Rapid price
                  movements can occur due to economic data releases,
                  geopolitical events, or market sentiment shifts. During
                  volatile periods, you may experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Wider spreads and reduced liquidity</li>
                  <li>Slippage between your order price and execution price</li>
                  <li>Inability to close positions at desired prices</li>
                  <li>Gap openings beyond your stop-loss levels</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  4. Margin Call and Stop-Out Risk
                </h2>
                <p className="text-muted-foreground mb-4">
                  When trading on margin, you must maintain sufficient funds in
                  your account:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Margin Call:</strong> When your margin level falls
                    below 100%, you will receive a margin call warning
                  </li>
                  <li>
                    <strong>Stop-Out:</strong> When your margin level reaches
                    50%, positions will be automatically closed starting with
                    the most unprofitable
                  </li>
                  <li>
                    You are responsible for monitoring margin levels at all
                    times
                  </li>
                  <li>
                    Market gaps can cause stop-out at levels worse than expected
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  5. Overnight Financing (Swap) Risk
                </h2>
                <p className="text-muted-foreground">
                  Positions held overnight incur swap charges or credits based
                  on the interest rate differential between the two currencies
                  in a pair. Swap rates can be positive or negative and may
                  change daily. Over time, these charges can significantly
                  impact your profitability, especially for longer-term
                  positions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  6. Gapping and Slippage Risk
                </h2>
                <p className="text-muted-foreground mb-4">
                  Markets can experience gaps (price jumps) that bypass your
                  stop-loss orders:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Weekend gaps when markets reopen Monday morning</li>
                  <li>News event gaps following major announcements</li>
                  <li>
                    Slippage during high volatility or low liquidity periods
                  </li>
                  <li>
                    Stop-loss orders do not guarantee execution at your
                    specified price
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  7. Technology and Operational Risks
                </h2>
                <p className="text-muted-foreground mb-4">
                  Trading through electronic platforms involves technology
                  risks:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Internet connection failures or delays</li>
                  <li>Platform malfunctions or system outages</li>
                  <li>Incorrect order placement due to user error</li>
                  <li>Data feed interruptions affecting price accuracy</li>
                  <li>
                    Cybersecurity threats and unauthorized access attempts
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  8. Currency Risk
                </h2>
                <p className="text-muted-foreground">
                  If your account base currency differs from the currency of the
                  instruments you trade, you are exposed to currency exchange
                  rate risk. Fluctuations in exchange rates can affect your
                  profit and loss in your base currency terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  9. Counterparty Risk
                </h2>
                <p className="text-muted-foreground">
                  When trading CFDs, you enter into a contract with TradeX Pro
                  as your counterparty. You face the risk that we may be unable
                  to meet our obligations to you. While we maintain segregated
                  client accounts and implement risk management measures, there
                  is no absolute guarantee against insolvency.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  10. Cryptocurrency-Specific Risks
                </h2>
                <p className="text-muted-foreground mb-4">
                  Trading cryptocurrency CFDs carries additional risks:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Extreme price volatility (24/7 markets with no circuit
                    breakers)
                  </li>
                  <li>Limited regulatory oversight in many jurisdictions</li>
                  <li>
                    Susceptibility to market manipulation and "pump and dump"
                    schemes
                  </li>
                  <li>Regulatory changes can dramatically impact prices</li>
                  <li>
                    Exchange hacks and security breaches affecting underlying
                    markets
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  11. Past Performance Disclaimer
                </h2>
                <p className="text-muted-foreground">
                  Past performance is not indicative of future results. Any
                  historical returns, expected returns, or probability
                  projections may not reflect actual future performance. Markets
                  are inherently unpredictable, and previous success does not
                  guarantee future profits.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  12. Suitability and Recommendation
                </h2>
                <p className="text-muted-foreground mb-4">
                  CFD trading is NOT suitable for all investors. You should only
                  trade with money you can afford to lose. Before trading,
                  carefully assess:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your investment objectives and financial situation</li>
                  <li>Your experience and knowledge of financial markets</li>
                  <li>Your risk tolerance and ability to withstand losses</li>
                  <li>
                    Whether you fully understand how CFDs work and their
                    associated risks
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We recommend seeking independent financial advice if you are
                  uncertain about the suitability of CFD trading for your
                  circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  13. No Investment Advice
                </h2>
                <p className="text-muted-foreground">
                  Any information, analysis, or research provided by TradeX Pro
                  is for educational purposes only and does not constitute
                  investment advice. We do not provide personalized
                  recommendations or advice tailored to your individual
                  circumstances. All trading decisions are your sole
                  responsibility.
                </p>
              </section>

              <div className="pt-6 border-t border-border">
                <Alert className="border-warning bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-foreground">
                    By opening an account and trading with TradeX Pro, you
                    acknowledge that you have read, understood, and accepted
                    this Risk Disclosure Statement and are aware of the risks
                    involved in CFD trading.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Last Updated:</strong> January 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
