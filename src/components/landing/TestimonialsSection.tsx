import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Michael Chen",
    role: "Day Trader",
    location: "Singapore",
    avatar: "MC",
    rating: 5,
    quote: "TradeX Pro's risk-free environment helped me develop my forex strategy. After 3 months of practice, I increased my virtual portfolio by 47%.",
    highlight: "+47% portfolio growth"
  },
  {
    name: "Sarah Williams",
    role: "Investment Analyst",
    location: "London, UK",
    avatar: "SW",
    rating: 5,
    quote: "The advanced charting tools are on par with institutional platforms. I use TradeX Pro to backtest strategies before deploying real capital.",
    highlight: "Professional-grade tools"
  },
  {
    name: "Ahmed Hassan",
    role: "Part-time Trader",
    location: "Dubai, UAE",
    avatar: "AH",
    rating: 5,
    quote: "As a beginner, I was afraid to start trading. TradeX Pro let me learn without fear of losing money. The $50K virtual capital is generous!",
    highlight: "Perfect for beginners"
  },
  {
    name: "Emma Rodriguez",
    role: "Swing Trader",
    location: "Barcelona, Spain",
    avatar: "ER",
    rating: 5,
    quote: "The real-time data and instant execution helped me understand market dynamics. I've been practicing for 6 months and feel ready for live trading.",
    highlight: "6 months of practice"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20">
            Trader Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Trusted by Traders
            <span className="block mt-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our community of 50,000+ traders has to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 border-border bg-card relative overflow-hidden"
            >
              <CardContent className="p-8">
                <Quote className="absolute top-4 right-4 h-12 w-12 text-gold/10" />
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </div>

                <p className="text-foreground leading-relaxed mb-4 italic">
                  "{testimonial.quote}"
                </p>

                <Badge className="bg-accent/10 text-accent border-accent/20">
                  {testimonial.highlight}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
          * Results shown are from virtual trading and may not reflect actual live trading performance. 
          Past performance is not indicative of future results.
        </p>
      </div>
    </section>
  );
}
