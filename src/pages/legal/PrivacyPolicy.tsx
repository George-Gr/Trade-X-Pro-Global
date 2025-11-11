import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  TradeX Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
                <p className="text-muted-foreground mb-4">
                  We collect personal information that you voluntarily provide when registering for an account, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Full name and contact details (email, phone number, address)</li>
                  <li>Date of birth and identification documents</li>
                  <li>Financial information (bank account details, transaction history)</li>
                  <li>Employment and income information</li>
                  <li>Trading experience and investment objectives</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use collected information for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Account creation and verification (KYC/AML compliance)</li>
                  <li>Processing transactions and managing your trading account</li>
                  <li>Providing customer support and responding to inquiries</li>
                  <li>Sending important notifications about your account</li>
                  <li>Improving our services and developing new features</li>
                  <li>Complying with legal and regulatory obligations</li>
                  <li>Detecting and preventing fraud and security threats</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. Your data is stored on secure servers and is accessible only to authorized personnel who require it for legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Information Sharing</h2>
                <p className="text-muted-foreground mb-4">We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Payment processors for transaction processing</li>
                  <li>Regulatory authorities when required by law</li>
                  <li>Law enforcement agencies for fraud prevention</li>
                  <li>Professional advisors (lawyers, auditors) bound by confidentiality</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We do not sell or rent your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to enhance your experience, analyze site usage, and deliver personalized content. You can control cookie preferences through your browser settings. For more information, see our <a href="/legal/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Access your personal data we hold</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal obligations)</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Account information is typically retained for 7 years after account closure as required by financial regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. The updated version will be indicated by an "Last Updated" date. We will notify you of material changes by email or prominent notice on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy or to exercise your rights, please contact our Data Protection Officer at:
                </p>
                <div className="mt-4 text-muted-foreground">
                  <p>Email: privacy@tradexpro.com</p>
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
