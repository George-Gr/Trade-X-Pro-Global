import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, CheckCircle2 } from "lucide-react";

export default function Webinar() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Live Trading Webinars
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Learn from Expert Traders
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join weekly webinars covering technical analysis, trading strategies, and market insights
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
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Upcoming Webinars</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Technical Analysis Basics", day: "Monday", time: "18:00 GMT" },
                    { title: "Forex Trading Strategies", day: "Wednesday", time: "19:00 GMT" },
                    { title: "Risk Management Essentials", day: "Thursday", time: "18:00 GMT" },
                    { title: "Market Analysis Q&A", day: "Friday", time: "17:00 GMT" }
                  ].map((webinar, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold mb-2">{webinar.title}</p>
                      <p className="text-xs text-muted-foreground">{webinar.day} at {webinar.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Why Attend?</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "Live interaction with professional traders",
                    "Real-time market analysis",
                    "Trading strategy discussions",
                    "Q&A sessions with experts",
                    "Free access for all members",
                    "Recorded sessions available",
                    "Exclusive trading insights",
                    "Networking opportunities"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Featured Webinars</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Introduction to Technical Analysis", level: "Beginner", duration: "60 min" },
                  { title: "Advanced Charting Patterns", level: "Intermediate", duration: "90 min" },
                  { title: "Algorithmic Trading Strategies", level: "Advanced", duration: "120 min" }
                ].map((webinar, i) => (
                  <Card key={i} className="bg-muted/50 border-border">
                    <CardContent className="p-6">
                      <p className="font-semibold text-lg mb-2">{webinar.title}</p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Level: <span className="font-semibold">{webinar.level}</span></p>
                        <p>Duration: <span className="font-semibold">{webinar.duration}</span></p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Register for Webinars</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of traders learning and growing together
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/education">
                    <Button size="lg" variant="outline">
                      Explore Education
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
