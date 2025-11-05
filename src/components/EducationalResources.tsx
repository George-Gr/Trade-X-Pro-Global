import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Video,
  Broadcast,
  FileText,
  Users,
  Clock,
  Star,
  ArrowRight,
  Play,
 Download,
 Award
} from 'lucide-react';

interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  featured: string;
  count?: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  link: string;
  index: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  featured,
  count,
  duration,
  difficulty,
  link,
  index
}) => {
  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Intermediate':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Advanced':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <Card
      className={`
        card-hover group bg-card border-border/50
        fade-in-up visible feature-card-${index + 1}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <div className="text-primary group-hover:scale-110 transition-transform">
              {icon}
            </div>
          </div>
          {difficulty && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-primary/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Featured Item */}
          <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Featured</span>
            </div>
            <p className="text-sm text-muted-foreground">{featured}</p>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {count && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {count}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
            )}
          </div>

          {/* CTA */}
          <Link to={link}>
            <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 group">
              <span className="flex items-center gap-2">
                Explore {title}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

interface EducationalResourcesProps {
  className?: string;
}

const EducationalResources: React.FC<EducationalResourcesProps> = ({ className = '' }) => {
  const resources = [
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: 'Trading Academy',
      subtitle: '50+ Video Lessons',
      description: 'Comprehensive courses covering market fundamentals, technical analysis, risk management, and advanced trading strategies.',
      featured: 'CFD Trading Complete Course - From Basics to Advanced',
      count: '50+ Lessons',
      difficulty: 'Beginner' as const,
      link: '/academy'
    },
    {
      icon: <Video className="h-7 w-7" />,
      title: 'Video Tutorials',
      subtitle: '100+ Tutorial Videos',
      description: 'Step-by-step video guides covering platform walkthroughs, strategy implementation, and advanced chart analysis techniques.',
      featured: 'Platform Mastery Series - Complete Platform Guide',
      count: '100+ Videos',
      duration: '5-30 min each',
      difficulty: 'Beginner' as const,
      link: '/tutorials'
    },
    {
      icon: <Broadcast className="h-7 w-7" />,
      title: 'Live Webinars',
      subtitle: 'Weekly Live Sessions',
      description: 'Interactive live sessions with market experts covering current market analysis, trading strategies, and Q&A sessions.',
      featured: 'Weekly Market Analysis with Expert Traders',
      count: 'Weekly Sessions',
      duration: '60 min live',
      difficulty: 'Intermediate' as const,
      link: '/webinars'
    },
    {
      icon: <FileText className="h-7 w-7" />,
      title: 'Trading Resources',
      subtitle: '25+ eBooks & Guides',
      description: 'Comprehensive downloadable guides covering trading psychology, market patterns, economic calendars, and risk management.',
      featured: 'The Complete Guide to Risk Management',
      count: '25+ Resources',
      difficulty: 'All Levels' as const,
      link: '/resources'
    }
  ];

  const learningPaths = [
    {
      title: 'Beginner Path',
      description: 'Perfect for those new to trading',
      courses: ['Trading Basics', 'Market Fundamentals', 'Risk Management 101'],
      duration: '2-3 weeks',
      icon: <Award className="h-5 w-5" />
    },
    {
      title: 'Advanced Path',
      description: 'For experienced traders looking to level up',
      courses: ['Advanced Technical Analysis', 'Algorithmic Trading', 'Portfolio Management'],
      duration: '4-6 weeks',
      icon: <Star className="h-5 w-5" />
    }
  ];

  const stats = [
    { label: 'Total Students', value: '50,000+', icon: <Users className="h-5 w-5" /> },
    { label: 'Course Completion', value: '87%', icon: <Award className="h-5 w-5" /> },
    { label: 'Expert Instructors', value: '12+', icon: <Star className="h-5 w-5" /> },
    { label: 'Video Hours', value: '200+', icon: <Video className="h-5 w-5" /> }
  ];

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Master Trading with
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Professional Education
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            From beginner basics to advanced strategies, learn at your own pace with
            comprehensive educational resources designed by trading experts.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {resources.map((resource, index) => (
            <ResourceCard
              key={index}
              {...resource}
              index={index}
            />
          ))}
        </div>

        {/* Learning Paths */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Structured Learning Paths</h3>
            <p className="text-muted-foreground">
              Choose your learning journey based on your experience level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => (
              <Card key={index} className="card-hover bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      {path.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {path.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {path.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {path.courses.map((course, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{course}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {path.duration}
                        </span>
                        <Button size="sm" variant="outline">
                          Start Path
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-card/50 border border-border/50 rounded-xl"
              style={{ animationDelay: `${(index + 4) * 0.1}s` }}
            >
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Student Success Stories */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 mb-16">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Student Success Stories</h3>
            <p className="text-muted-foreground">
              Join thousands of successful traders who started their journey here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Chen',
                achievement: 'Completed Advanced Course',
                quote: 'The comprehensive education helped me develop consistent trading strategies.',
                level: 'Advanced Graduate'
              },
              {
                name: 'Marcus Rodriguez',
                achievement: 'Strategy Development',
                quote: 'From complete beginner to profitable trader in just 3 months.',
                level: 'Success Story'
              },
              {
                name: 'Emily Watson',
                achievement: 'Risk Management Mastery',
                quote: 'The risk management course completely changed my trading approach.',
                level: 'Risk Expert'
              }
            ].map((story, index) => (
              <Card key={index} className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{story.name}</h4>
                    <p className="text-sm text-primary mb-2">{story.level}</p>
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{story.quote}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {story.achievement}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center fade-in-up visible">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Access our complete library of educational resources and learn from
            industry experts. Start with our free introductory courses today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/academy">
              <Button size="lg" className="btn-hover-lift">
                <span className="flex items-center gap-2">
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
            <Link to="/resources">
              <Button size="lg" variant="outline">
                Browse All Resources
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/60">
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              Self-paced learning
            </span>
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              Downloadable resources
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Certificate of completion
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Community support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationalResources;