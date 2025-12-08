import { Award, Shield, Star, Trophy } from 'lucide-react';
import * as React from 'react';

const TrustBadgesSection: React.FC = () => {
  const awards = [
    {
      icon: Trophy,
      title: "Best Trading Platform",
      source: "Global Finance Awards 2024",
      useGold: true
    },
    {
      icon: Star,
      title: "Top Rated Broker",
      source: "TradingView Community",
      useGold: false
    },
    {
      icon: Award,
      title: "Innovation Excellence",
      source: "FinTech Awards 2024",
      useGold: true
    },
    {
      icon: Shield,
      title: "Most Secure Platform",
      source: "Cybersecurity Excellence",
      useGold: false
    }
  ];

  const partners = [
    { name: "TradingView", logo: "TV" },
    { name: "Reuters", logo: "R" },
    { name: "Bloomberg", logo: "B" },
    { name: "SWIFT", logo: "S" },
    { name: "Visa", logo: "V" },
    { name: "Mastercard", logo: "M" }
  ];

  return (
    <section className="py-20" style={{ background: '#0A1628' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Awards Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Award-Winning
            <span style={{ color: '#FFD700' }}> Platform</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
            Recognized by industry leaders for excellence in trading technology
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {awards.map((award, index) => (
            <div
              key={index}
              className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105"
              style={{ background: '#1a2d42', border: award.useGold ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(245, 245, 220, 0.1)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={award.useGold
                  ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }
                  : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.2)' }
                }
              >
                <award.icon className="w-7 h-7" style={{ color: award.useGold ? '#FFD700' : '#FFFFFF' }} />
              </div>
              <h3 className="font-bold mb-1" style={{ color: '#FFFFFF' }}>{award.title}</h3>
              <p className="text-xs" style={{ color: '#F5F5DC' }}>{award.source}</p>
            </div>
          ))}
        </div>

        {/* Partners Section */}
        <div className="border-t pt-12" style={{ borderColor: 'rgba(245, 245, 220, 0.1)' }}>
          <div className="text-center mb-8">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(245, 245, 220, 0.6)' }}>
              Trusted Technology Partners
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="w-20 h-20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }}
                title={partner.name}
              >
                <span className="text-2xl font-bold" style={{ color: 'rgba(245, 245, 220, 0.7)' }}>
                  {partner.logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
