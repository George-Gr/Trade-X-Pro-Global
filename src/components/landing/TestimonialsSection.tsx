import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import * as React from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  tradingResult: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Michael Chen",
    role: "Day Trader",
    location: "Singapore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "TradeX Pro transformed my trading journey. The risk-free environment helped me develop strategies that now work in live markets. The platform feels exactly like trading with real capital.",
    rating: 5,
    tradingResult: "+127% portfolio growth in 6 months"
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Portfolio Manager",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "As a professional, I use TradeX Pro to test new strategies before implementing them with client funds. The analytics and real-time data are institutional quality.",
    rating: 5,
    tradingResult: "Managing $2.5M+ in client assets"
  },
  {
    id: 3,
    name: "David Okonkwo",
    role: "Forex Specialist",
    location: "Lagos, Nigeria",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "The 24/7 market access and diverse currency pairs helped me master forex trading. TradeX Pro's education resources are unmatched in the industry.",
    rating: 5,
    tradingResult: "Consistent 15% monthly returns"
  },
  {
    id: 4,
    name: "Emma Lindberg",
    role: "Crypto Trader",
    location: "Stockholm, Sweden",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "Started with zero trading knowledge. Within 3 months, I was confidently trading crypto and commodities. The platform's intuitive design made learning effortless.",
    rating: 5,
    tradingResult: "From beginner to profitable in 90 days"
  }
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24" style={{ background: '#0A1628' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
            <Star className="w-4 h-4" style={{ color: '#FFD700' }} />
            <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Trusted by 50,000+ Traders</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            What Our Traders
            <span className="block mt-2" style={{ color: '#FFD700' }}>Are Saying</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
            Join thousands of successful traders who started their journey with TradeX Pro
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="overflow-hidden" style={{ background: '#1a2d42', border: '1px solid rgba(245, 245, 220, 0.1)' }}>
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4"
                      style={{ borderColor: '#FFD700' }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFD700' }}>
                      <Quote className="w-5 h-5" style={{ color: '#0A1628' }} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#FFD700' }} />
                    ))}
                  </div>
                  <blockquote className="text-lg md:text-xl mb-6 leading-relaxed" style={{ color: '#F5F5DC' }}>
                    "{testimonials[activeIndex].quote}"
                  </blockquote>
                  <div className="mb-4">
                    <div className="font-bold text-lg" style={{ color: '#FFFFFF' }}>{testimonials[activeIndex].name}</div>
                    <div className="text-sm" style={{ color: '#F5F5DC' }}>
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </div>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                      {testimonials[activeIndex].tradingResult}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8' : ''
                }`}
              style={{
                background: index === activeIndex ? '#FFD700' : 'rgba(245, 245, 220, 0.3)'
              }}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#FFD700' }}>4.9/5</div>
            <div className="text-sm" style={{ color: '#F5F5DC' }}>Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>50K+</div>
            <div className="text-sm" style={{ color: '#F5F5DC' }}>Happy Traders</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#FFD700' }}>98%</div>
            <div className="text-sm" style={{ color: '#F5F5DC' }}>Would Recommend</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>120+</div>
            <div className="text-sm" style={{ color: '#F5F5DC' }}>Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
