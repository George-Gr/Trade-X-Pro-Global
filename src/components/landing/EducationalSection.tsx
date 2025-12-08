import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, FileText, GraduationCap, Video } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

const EducationalSection: React.FC = () => {
  const resources = [
    {
      icon: Video,
      type: "Webinar",
      title: "Advanced Technical Analysis",
      description: "Learn chart patterns, indicators, and price action strategies from expert traders",
      duration: "2 hours",
      level: "Intermediate",
      link: "/education/webinar",
      featured: true
    },
    {
      icon: BookOpen,
      type: "Course",
      title: "CFD Trading Fundamentals",
      description: "Complete beginner's guide to understanding CFDs, leverage, and margin trading",
      duration: "5 modules",
      level: "Beginner",
      link: "/education/tutorials",
      featured: false
    },
    {
      icon: FileText,
      type: "Guide",
      title: "Risk Management Masterclass",
      description: "Protect your capital with proven position sizing and stop-loss strategies",
      duration: "45 min read",
      level: "All Levels",
      link: "/education/tutorials",
      featured: true
    },
    {
      icon: GraduationCap,
      type: "Certification",
      title: "TradeX Pro Certified Trader",
      description: "Earn your certification and demonstrate your trading proficiency",
      duration: "Self-paced",
      level: "Advanced",
      link: "/education/certifications",
      featured: false
    }
  ];

  const glossaryTerms = [
    { term: "CFD", definition: "Contract for Difference - A derivative product that allows trading on price movements" },
    { term: "Leverage", definition: "Using borrowed capital to increase potential returns on investment" },
    { term: "Margin", definition: "The collateral required to open and maintain a leveraged position" },
    { term: "Spread", definition: "The difference between the buy (ask) and sell (bid) prices" },
    { term: "Pip", definition: "The smallest price move in a currency pair, typically 0.0001" },
    { term: "Stop Loss", definition: "An order to close a position at a specified price to limit losses" }
  ];

  return (
    <section className="py-24" style={{ background: '#F5F5DC' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(10, 22, 40, 0.1)', border: '1px solid rgba(10, 22, 40, 0.2)' }}>
            <GraduationCap className="w-4 h-4" style={{ color: '#0A1628' }} />
            <span className="text-sm font-medium" style={{ color: '#0A1628' }}>Learn & Grow</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0A1628' }}>
            Free Trading
            <span className="block mt-2" style={{ color: '#1a2d42' }}>Education</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1a2d42' }}>
            Master the markets with our comprehensive learning resources
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: '#FFFFFF', border: resource.featured ? '2px solid #FFD700' : '1px solid rgba(10, 22, 40, 0.1)' }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: resource.featured ? 'rgba(255, 215, 0, 0.1)' : 'rgba(10, 22, 40, 0.05)' }}>
                    <resource.icon className="w-6 h-6" style={{ color: resource.featured ? '#FFD700' : '#0A1628' }} />
                  </div>
                  {resource.featured && (
                    <Badge className="text-xs" style={{ background: '#FFD700', color: '#0A1628' }}>Featured</Badge>
                  )}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: resource.featured ? '#FFD700' : '#1a2d42' }}>
                  {resource.type}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0A1628' }}>{resource.title}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: '#1a2d42' }}>{resource.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: '#1a2d42' }}>{resource.duration}</span>
                  <Badge variant="outline" className="text-xs">{resource.level}</Badge>
                </div>
                <Link to={resource.link}>
                  <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary/5" style={{ color: '#0A1628' }}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Glossary Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold" style={{ color: '#0A1628' }}>Trading Glossary</h3>
            <Link to="/education/glossary">
              <Button variant="outline" size="sm" style={{ borderColor: '#0A1628', color: '#0A1628' }}>
                View All Terms
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {glossaryTerms.map((item, index) => (
              <div
                key={index}
                className="rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ background: '#FFFFFF', border: '1px solid rgba(10, 22, 40, 0.1)' }}
              >
                <div className="font-bold mb-1" style={{ color: '#0A1628' }}>{item.term}</div>
                <div className="text-sm" style={{ color: '#1a2d42' }}>{item.definition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationalSection;
