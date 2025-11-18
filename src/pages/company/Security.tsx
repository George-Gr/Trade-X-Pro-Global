import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock, Shield, CheckCircle2, Eye } from "lucide-react";

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Security & Protection
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Your Safety is Our Priority
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Enterprise-grade security protecting your data and trading activity
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
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Data Encryption</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "SSL/TLS encryption for all connections",
                    "Secure password hashing with bcrypt",
                    "Encrypted data transmission",
                    "Secure database storage"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Account Security</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "JWT-based authentication",
                    "Server-side role verification",
                    "Session management via secure tokens",
                    "Email verification for new accounts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Platform Protection</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Rate limiting on critical endpoints",
                    "Row-level security policies on database",
                    "Server-side authorization checks",
                    "Input validation on all requests",
                    "Audit logging for sensitive operations"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Payment Security</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Secure payment processing via third-party providers",
                    "HMAC signature verification for webhooks",
                    "No storage of payment card details",
                    "Encrypted transaction data"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Security Best Practices for Users</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    practice: "Strong Passwords",
                    tips: "Use 12+ characters with uppercase, lowercase, numbers, and symbols"
                  },
                  {
                    practice: "Email Verification",
                    tips: "Keep your email address verified to ensure account recovery"
                  },
                  {
                    practice: "Secure Connection",
                    tips: "Only access from secure, personal devices on trusted networks"
                  },
                  {
                    practice: "Don't Share Credentials",
                    tips: "Never share your password or 2FA codes with anyone"
                  },
                  {
                    practice: "Regular Updates",
                    tips: "Keep your device and browser updated with latest security patches"
                  },
                  {
                    practice: "Report Suspicious Activity",
                    tips: "Contact support immediately if you notice unusual account activity"
                  }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-muted/50 rounded-lg border border-border">
                    <h3 className="font-bold text-lg mb-2">{item.practice}</h3>
                    <p className="text-sm text-muted-foreground">{item.tips}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Your Security Matters</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Trade with confidence knowing your data is protected
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Secure Account
                    </Button>
                  </Link>
                  <Link to="/company/contact">
                    <Button size="lg" variant="outline">
                      Report Security Issue
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
