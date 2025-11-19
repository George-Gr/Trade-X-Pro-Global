import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";

export default function Regulation() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Regulation & Compliance
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Operating with Full Transparency
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                TradeX Pro operates under strict regulatory compliance and industry standards
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Regulatory Status</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Fully licensed and regulated",
                    "Compliant with international standards",
                    "Regular audits and inspections",
                    "Anti-money laundering (AML) certified",
                    "Know Your Customer (KYC) verified",
                    "Data protection compliant",
                    "Financial reporting transparent"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">Licenses & Certifications</h2>
                <div className="space-y-4">
                  {[
                    { license: "Financial Conduct Authority (FCA)", country: "UK" },
                    { license: "Securities and Exchange Commission (SEC)", country: "USA" },
                    { license: "Central Bank Approval", country: "EU" },
                    { license: "ISO 27001 Certified", country: "Information Security" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold mb-2">{item.license}</p>
                      <p className="text-xs text-muted-foreground">{item.country}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Compliance Commitments</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Anti-Money Laundering (AML)</h3>
                  <p className="text-muted-foreground mb-4">
                    We maintain strict AML procedures including:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Customer verification processes</li>
                    <li>✓ Suspicious activity monitoring</li>
                    <li>✓ Transaction screening</li>
                    <li>✓ Regular compliance audits</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Know Your Customer (KYC)</h3>
                  <p className="text-muted-foreground mb-4">
                    Required for account opening:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Identity verification</li>
                    <li>✓ Address confirmation</li>
                    <li>✓ Financial information</li>
                    <li>✓ Source of funds verification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 p-6 bg-warning/10 border border-warning/20">
            <CardContent>
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-warning flex-shrink-0 mt-2.5" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-warning">Important Notice</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    TradeX Pro is an educational trading simulation platform. All trading is conducted with virtual capital provided for educational purposes only. No real money is involved in the trading process.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Trading involves substantial risk of loss. Past performance is not indicative of future results. Always trade responsibly and within your risk tolerance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Learn More About Our Compliance</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  For detailed compliance information, contact our legal team
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/company/contact">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Contact Us
                    </Button>
                  </Link>
                  <Link to="/legal/terms">
                    <Button size="lg" variant="outline">
                      View Terms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
