import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Handshake, CheckCircle2 } from "lucide-react";

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Our Partners
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Strategic Partnerships & Integrations
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Working with industry leaders to provide the best trading
                experience
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Trading Platform Partners
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  partner: "MetaTrader 5",
                  description:
                    "Professional trading platform with advanced charting and analysis tools",
                },
                {
                  partner: "TradingView",
                  description:
                    "Advanced charting platform with 100+ technical indicators",
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition-all duration-150 hover:-translate-y-1"
                >
                  <CardContent>
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                      <Handshake className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {item.partner}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Payment Partners
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Visa & Mastercard",
                "Google Pay",
                "Apple Pay",
                "PhonePe",
                "UPI",
                "Bank Transfers",
                "Cryptocurrencies",
                "NowPayments",
                "Crypto Payment Gateways",
              ].map((partner, i) => (
                <Card
                  key={i}
                  className="p-6 text-center hover:shadow-md transition-all duration-150 hover:-translate-y-1"
                >
                  <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-4" />
                  <p className="font-semibold">{partner}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Technology Partners
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "AWS", service: "Cloud Infrastructure" },
                { name: "Cloudflare", service: "CDN & Security" },
                { name: "Auth0", service: "Authentication" },
                { name: "Twilio", service: "Communication" },
                { name: "SendGrid", service: "Email Services" },
                { name: "DataDog", service: "Monitoring" },
              ].map((tech, i) => (
                <Card
                  key={i}
                  className="p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold mb-2">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tech.service}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Partnership Benefits</h2>
              <div className="space-y-4">
                {[
                  "Best-in-class trading tools and technology",
                  "Multiple payment options for convenience",
                  "Reliable infrastructure and uptime",
                  "Advanced security and compliance",
                  "Seamless integrations and APIs",
                  "Global reach and support",
                  "Continuous innovation and updates",
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Interested in Partnership?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Let's work together to enhance the trading experience
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/company/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary-glow transition-all hover:from-primary/90 hover:to-primary-glow/90 active:from-primary/80 active:to-primary-glow/80 active:scale-95"
                    >
                      Contact Us
                    </Button>
                  </Link>
                  <Link to="/company/about">
                    <Button size="lg" variant="outline">
                      Learn More
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
