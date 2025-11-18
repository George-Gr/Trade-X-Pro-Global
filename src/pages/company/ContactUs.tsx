import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Contact Us
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  We're Here to Help
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get in touch with our team for support, partnerships, or inquiries
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">support@tradexpro.com</p>
                <p className="text-sm text-muted-foreground">Response time: 24 hours</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Phone</h3>
                <p className="text-muted-foreground mb-4">+1 (800) 123-4567</p>
                <p className="text-sm text-muted-foreground">24/5 Support Available</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Address</h3>
                <p className="text-muted-foreground mb-2">123 Finance Street</p>
                <p className="text-sm text-muted-foreground">Trading District, TD 12345</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subject</label>
                    <select className="w-full px-4 py-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none transition-colors">
                      <option>General Inquiry</option>
                      <option>Support</option>
                      <option>Partnership</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none transition-colors resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center gap-4">
                    <Send className="h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-8">Departments</h2>
                <div className="space-y-6">
                  {[
                    { dept: "Support", email: "support@tradexpro.com", hours: "24/5" },
                    { dept: "Sales", email: "sales@tradexpro.com", hours: "Mon-Fri 09:00-18:00" },
                    { dept: "Partnerships", email: "partners@tradexpro.com", hours: "Mon-Fri 09:00-18:00" },
                    { dept: "Compliance", email: "compliance@tradexpro.com", hours: "Mon-Fri 09:00-18:00" },
                    { dept: "Security", email: "security@tradexpro.com", hours: "24/7" },
                    { dept: "General", email: "hello@tradexpro.com", hours: "Mon-Fri 09:00-18:00" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="font-semibold mb-2">{item.dept}</p>
                      <p className="text-sm text-primary mb-2">{item.email}</p>
                      <p className="text-xs text-muted-foreground">{item.hours}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">FAQ</h2>
              <div className="space-y-6">
                {[
                  { q: "What are your support hours?", a: "We provide support 24 hours a day, 5 days a week (Monday-Friday). Critical issues are handled outside these hours." },
                  { q: "How quickly will I get a response?", a: "We aim to respond to all inquiries within 24 hours during business hours and 48 hours during weekends." },
                  { q: "Do you offer phone support?", a: "Yes, phone support is available during business hours. Contact +1 (800) 123-4567." },
                  { q: "How can I report a security issue?", a: "Please email security@tradexpro.com immediately with details. All security reports are handled with priority." }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-muted/50 rounded-lg border border-border">
                    <h3 className="font-bold mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Create your account today and join our trading community
                </p>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
