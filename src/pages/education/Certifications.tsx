import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, CheckCircle2 } from "lucide-react";

export default function Certifications() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Professional Certifications
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Enhance Your Trading Skills
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get certified in trading fundamentals, technical analysis, and risk management
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Trading Fundamentals",
                level: "Beginner",
                duration: "4 weeks",
                description: "Learn the basics of trading"
              },
              {
                title: "Technical Analysis Pro",
                level: "Intermediate",
                duration: "6 weeks",
                description: "Master chart patterns and indicators"
              },
              {
                title: "Risk Management Expert",
                level: "Advanced",
                duration: "8 weeks",
                description: "Advanced portfolio management"
              },
              {
                title: "Forex Trading Master",
                level: "Intermediate",
                duration: "5 weeks",
                description: "Specialize in forex markets"
              },
              {
                title: "Options & Derivatives",
                level: "Advanced",
                duration: "7 weeks",
                description: "Options strategies and pricing"
              },
              {
                title: "Algorithmic Trading",
                level: "Advanced",
                duration: "10 weeks",
                description: "Automated trading systems"
              }
            ].map((cert, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-150 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
                  <div className="space-y-2 text-xs text-muted-foreground mb-6">
                    <p>Level: <span className="font-semibold">{cert.level}</span></p>
                    <p>Duration: <span className="font-semibold">{cert.duration}</span></p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm">
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Certification Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {[
                      "Core trading concepts",
                      "Technical and fundamental analysis",
                      "Risk management strategies",
                      "Portfolio optimization",
                      "Trading psychology",
                      "Market regulations and compliance"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">After Certification</h3>
                  <ul className="space-y-2">
                    {[
                      "Industry-recognized credential",
                      "Lifetime certificate",
                      "Premium member status",
                      "Exclusive trading strategies access",
                      "Networking with professionals",
                      "Job board access"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-2.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Your Certification Journey</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Begin learning today and become a certified trader
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/education">
                    <Button size="lg" variant="outline">
                      Back to Education
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
