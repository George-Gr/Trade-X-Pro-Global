import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, CheckCircle2 } from "lucide-react";

export default function Mentorship() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Mentorship Program
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Learn Directly from Experts
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get personalized guidance from professional traders with 10+ years of experience
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
                  <h2 className="text-3xl font-bold">Mentorship Benefits</h2>
                </div>
                <ul className="space-y-4">
                  {[
                    "One-on-one guidance from experienced traders",
                    "Personalized trading strategy development",
                    "Real-time feedback on your trades",
                    "Custom learning plans tailored to your goals",
                    "Regular progress check-ins",
                    "Exclusive trading insights and tips",
                    "Priority email and chat support",
                    "Access to mentor's trading journal"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-2.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">Mentorship Packages</h2>
                <div className="space-y-4">
                  {[
                    { package: "Starter", sessions: "2/month", price: "$99" },
                    { package: "Standard", sessions: "4/month", price: "$199" },
                    { package: "Premium", sessions: "8/month", price: "$349" },
                    { package: "Elite", sessions: "Unlimited", price: "$599" }
                  ].map((pkg, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{pkg.package}</span>
                        <span className="text-primary font-bold">{pkg.price}/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{pkg.sessions}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Meet Our Mentors</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "John Smith",
                    specialty: "Forex Trading",
                    experience: "15 years",
                    students: "200+"
                  },
                  {
                    name: "Sarah Johnson",
                    specialty: "Technical Analysis",
                    experience: "12 years",
                    students: "150+"
                  },
                  {
                    name: "Mike Chen",
                    specialty: "Risk Management",
                    experience: "18 years",
                    students: "180+"
                  }
                ].map((mentor, i) => (
                  <Card key={i} className="bg-muted/50 border-border hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{mentor.name}</h3>
                      <p className="text-primary text-sm font-semibold mb-4">{mentor.specialty}</p>
                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        <p>Experience: {mentor.experience}</p>
                        <p>Students Mentored: {mentor.students}</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm" size="sm">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Choose Mentor", description: "Select a mentor based on your goals" },
                  { step: "2", title: "Schedule Session", description: "Book your first mentoring session" },
                  { step: "3", title: "Learn & Practice", description: "Get personalized guidance and feedback" },
                  { step: "4", title: "Track Progress", description: "Monitor your growth with monthly reports" }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Your Mentorship Journey</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Get paired with an expert mentor today
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
