import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-24 pb-20">
        <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Tutorials & E-Books
                <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Self-Paced Learning Materials
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access comprehensive guides, video tutorials, and downloadable e-books
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
                    <BookOpen className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Available Resources</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { resource: "Video Tutorials", count: "100+" },
                    { resource: "E-Books", count: "25+" },
                    { resource: "Strategy Guides", count: "50+" },
                    { resource: "Market Analysis Reports", count: "Weekly" },
                    { resource: "Case Studies", count: "40+" },
                    { resource: "Template Collections", count: "15+" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <span className="font-medium">{item.resource}</span>
                      <span className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors cursor-pointer">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-6">Featured E-Books</h2>
                <div className="space-y-4">
                  {[
                    "The Complete Forex Trading Guide",
                    "Technical Analysis Masterclass",
                    "Risk Management Strategies",
                    "Trading Psychology Guide",
                    "Market Structure & Trends",
                    "Day Trading Handbook"
                  ].map((book, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                      <span className="text-sm font-medium">{book}</span>
                      <span className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer">Download</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Video Tutorial Series</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Beginner to Pro", lessons: "15 lessons", duration: "8 hours" },
                  { title: "Advanced Strategies", lessons: "12 lessons", duration: "10 hours" },
                  { title: "Platform Mastery", lessons: "20 lessons", duration: "12 hours" },
                  { title: "Technical Analysis Deep Dive", lessons: "18 lessons", duration: "14 hours" },
                  { title: "Risk Management Pro", lessons: "10 lessons", duration: "9 hours" },
                  { title: "Psychology & Discipline", lessons: "8 lessons", duration: "6 hours" }
                ].map((series, i) => (
                  <Card key={i} className="bg-muted/50 border-border hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">{series.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>📚 {series.lessons}</p>
                        <p>⏱️ {series.duration}</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm" size="sm">
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">Learning Paths</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    path: "Complete Beginner",
                    description: "Start from zero to trading confidently",
                    modules: ["Basics", "Charts", "Orders", "Risk"]
                  },
                  {
                    path: "Intermediate Trader",
                    description: "Enhance your existing trading skills",
                    modules: ["Strategy", "Analysis", "Psychology", "Advanced"]
                  },
                  {
                    path: "Professional Trader",
                    description: "Master institutional-level trading",
                    modules: ["Algorithms", "Systems", "Management", "Specialization"]
                  }
                ].map((path, i) => (
                  <Card key={i} className="border-border hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{path.path}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
                      <div className="space-y-2 mb-4">
                        {path.modules.map((module, j) => (
                          <div key={j} className="flex items-center gap-4 text-xs">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            <span>{module}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm" size="sm">
                        Start Path
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Start Learning Today</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Access all tutorials and e-books for free with your account
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
