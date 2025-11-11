import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Award, Globe, CheckCircle2 } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                About TradeX Pro
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Your Trusted Trading Partner
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Empowering traders worldwide with professional tools, education, and support
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  To democratize financial trading by providing accessible, educational, and risk-free platform for traders of all levels to learn, practice, and master CFD trading without financial risk.
                </p>
                <p className="text-muted-foreground">
                  We believe trading should be learned in a safe environment before risking real capital.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  To become the world's leading trading education and simulation platform, recognized for excellence in trader development and market expertise.
                </p>
                <p className="text-muted-foreground">
                  Building a community of informed, disciplined traders who understand market dynamics and risk management.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose TradeX Pro?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Award,
                  title: "Professional Platform",
                  description: "Advanced trading terminal with institutional-grade tools and features"
                },
                {
                  icon: Users,
                  title: "Expert Support",
                  description: "24/5 customer support and dedicated account managers available"
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Serve traders from 150+ countries with multilingual support"
                }
              ].map((item, i) => (
                <Card key={i} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Company Facts</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { stat: "500K+", label: "Active Traders" },
                  { stat: "150+", label: "Countries" },
                  { stat: "10+", label: "Years Experience" },
                  { stat: "24/5", label: "Support Available" }
                ].map((fact, i) => (
                  <div key={i} className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary mb-2">{fact.stat}</p>
                    <p className="text-muted-foreground">{fact.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Our Core Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { value: "Transparency", description: "Clear pricing, no hidden fees, honest communication" },
                  { value: "Education", description: "Empowering traders with knowledge and skills" },
                  { value: "Security", description: "Bank-level encryption and data protection" },
                  { value: "Excellence", description: "Continuous improvement and innovation" },
                  { value: "Integrity", description: "Ethical business practices and compliance" },
                  { value: "Community", description: "Supporting traders and building relationships" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.value}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Start your trading journey with TradeX Pro today
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/company/regulation">
                    <Button size="lg" variant="outline">
                      Learn About Us
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
