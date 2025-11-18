import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
          
          <Card>
              <CardContent className=" space-y-6 prose prose-invert">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                  <p className="text-foreground/90 leading-relaxed">
                  By accessing and using TradeX Pro's website and services, you agree to be bound by these Terms and Conditions, all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                  <p className="text-foreground/90 leading-relaxed mb-4">To use our services, you must:</p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                  <li>Be at least 18 years of age (or the age of majority in your jurisdiction)</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be a resident of a restricted jurisdiction</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Trading Services</h2>
                <h3 className="text-xl font-semibold mb-2">4.1 CFD Trading</h3>
                <p className="text-muted-foreground mb-4">
                  We provide a platform for trading Contracts for Difference (CFDs) on various financial instruments. CFDs are complex leveraged instruments that carry a high level of risk and may not be suitable for all investors.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">4.2 Order Execution</h3>
                <p className="text-muted-foreground mb-4">
                  We will use reasonable efforts to execute your orders promptly, but we do not guarantee execution at your requested price due to market conditions, slippage, and other factors beyond our control.
                </p>

                <h3 className="text-xl font-semibold mb-2">4.3 Margin Requirements</h3>
                <p className="text-muted-foreground">
                  You must maintain sufficient margin in your account. We reserve the right to close out your positions if margin levels fall below required thresholds. You are responsible for monitoring your margin levels at all times.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Fees and Charges</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to pay all applicable fees and charges as outlined in our fee schedule, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Spreads and commissions on trades</li>
                  <li>Overnight financing charges (swap fees)</li>
                  <li>Withdrawal fees (if applicable)</li>
                  <li>Inactivity fees for dormant accounts</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Deposits and Withdrawals</h2>
                <p className="text-muted-foreground">
                  All deposits and withdrawals must comply with our Anti-Money Laundering (AML) and Know Your Customer (KYC) policies. We reserve the right to reject or delay transactions that do not meet our compliance requirements. Withdrawals are processed to the same payment method used for deposits where possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Engage in market manipulation, scalping, or abusive trading practices</li>
                  <li>Use automated trading systems without prior approval</li>
                  <li>Exploit system errors or pricing discrepancies</li>
                  <li>Share or transfer your account to another person</li>
                  <li>Use the platform for money laundering or illegal activities</li>
                  <li>Circumvent security features or access controls</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Risk Disclosure</h2>
                <p className="text-muted-foreground">
                  Trading CFDs carries substantial risk and is not suitable for all investors. You may lose more than your initial investment. Before trading, carefully consider your investment objectives, experience level, and risk tolerance. See our full <a href="/legal/risk-disclosure" className="text-primary hover:underline">Risk Disclosure</a> for more information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, TradeX Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Force Majeure</h2>
                <p className="text-muted-foreground">
                  We shall not be liable for any failure to perform our obligations where such failure is a result of circumstances beyond our reasonable control, including acts of God, war, civil unrest, terrorism, market disruptions, or technical failures.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Account Termination</h2>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your account at any time if you violate these terms, engage in prohibited activities, or for any other reason at our sole discretion. Upon termination, you must close all open positions and withdraw your remaining balance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of Seychelles. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Seychelles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by email or prominent notice on our platform. Your continued use of our services after such modifications constitutes your acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions regarding these Terms and Conditions, please contact:
                </p>
                <div className="mt-4 text-muted-foreground">
                  <p>Email: legal@tradexpro.com</p>
                  <p>Address: 123 Finance Street, Trading District, TD 12345</p>
                </div>
              </section>

              <div className="pt-6 border-t border-border">
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
