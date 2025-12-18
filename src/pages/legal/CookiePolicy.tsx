import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>

          <Card>
            <CardContent className=" space-y-6 prose prose-invert">
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  1. What Are Cookies?
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and provide
                  information to website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  2. How We Use Cookies
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  TradeX Pro uses cookies for various purposes to enhance your
                  experience:
                </p>

                <h3 className="text-xl font-semibold mb-2">
                  Essential Cookies
                </h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  These cookies are necessary for the website to function and
                  cannot be disabled. They include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4 mb-4">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Session cookies for platform functionality</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">
                  Performance Cookies
                </h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  These cookies help us understand how visitors interact with
                  our website:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>
                    Analytics cookies to measure traffic and usage patterns
                  </li>
                  <li>Error tracking cookies to identify technical issues</li>
                  <li>Load balancing cookies to optimize performance</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">
                  Functional Cookies
                </h3>
                <p className="text-muted-foreground mb-4">
                  These cookies enable enhanced functionality and
                  personalization:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Language preference cookies</li>
                  <li>Theme and display preference cookies</li>
                  <li>Trading platform customization cookies</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-muted-foreground mb-4">
                  These cookies are used to track visitor activity and display
                  relevant advertisements:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Advertising cookies to show relevant ads</li>
                  <li>Retargeting cookies for marketing campaigns</li>
                  <li>Social media cookies for sharing content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  3. Third-Party Cookies
                </h2>
                <p className="text-muted-foreground">
                  We use third-party services that may set cookies on your
                  device, including Google Analytics for website analytics,
                  payment processors for secure transactions, and social media
                  platforms for content sharing. These third parties have their
                  own privacy policies governing the use of cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  4. Managing Cookie Preferences
                </h2>
                <p className="text-muted-foreground mb-4">
                  You can control and manage cookies in various ways:
                </p>

                <h3 className="text-xl font-semibold mb-2">Browser Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>View and delete cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block all cookies (may impact website functionality)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">
                  Browser-Specific Instructions
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Chrome:</strong> Settings &gt; Privacy and Security
                    &gt; Cookies
                  </li>
                  <li>
                    <strong>Firefox:</strong> Options &gt; Privacy & Security
                    &gt; Cookies
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferences &gt; Privacy &gt;
                    Cookies
                  </li>
                  <li>
                    <strong>Edge:</strong> Settings &gt; Privacy &gt; Cookies
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  5. Impact of Disabling Cookies
                </h2>
                <p className="text-muted-foreground mb-4">
                  Blocking or deleting cookies may impact your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>You may need to log in repeatedly</li>
                  <li>Some website features may not function properly</li>
                  <li>Your preferences and settings may not be saved</li>
                  <li>You may see less relevant content and advertisements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  6. Cookie Duration
                </h2>
                <p className="text-muted-foreground mb-4">
                  We use both session cookies and persistent cookies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Session Cookies:</strong> Temporary cookies deleted
                    when you close your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Remain on your device
                    for a set period or until manually deleted
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  7. Updates to This Policy
                </h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect
                  changes in technology, legislation, or our business
                  operations. We encourage you to review this page periodically
                  for any updates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact
                  us at:
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
