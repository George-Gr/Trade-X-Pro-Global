import { BarChart3, Clock, Globe, TrendingUp, Users, Zap } from 'lucide-react';
import React from 'react';

const StatsBanner: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Traders",
      subtext: "Growing daily",
      useGold: true
    },
    {
      icon: BarChart3,
      value: "$2.5B+",
      label: "Monthly Volume",
      subtext: "Virtual trades",
      useGold: false
    },
    {
      icon: Globe,
      value: "120+",
      label: "Countries",
      subtext: "Worldwide access",
      useGold: false
    },
    {
      icon: TrendingUp,
      value: "500+",
      label: "Instruments",
      subtext: "Across 5 asset classes",
      useGold: true
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Market Access",
      subtext: "Trade anytime",
      useGold: false
    },
    {
      icon: Zap,
      value: "<50ms",
      label: "Execution Speed",
      subtext: "Ultra-fast orders",
      useGold: true
    }
  ];

  return (
    <section className="py-16 overflow-hidden" style={{ background: 'linear-gradient(90deg, #0A1628 0%, #1a2d42 50%, #0A1628 100%)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                style={stat.useGold
                  ? { background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }
                  : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.1)' }
                }
              >
                <stat.icon className="w-7 h-7" style={{ color: stat.useGold ? '#FFD700' : '#FFFFFF' }} />
              </div>
              <div
                className="text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300 group-hover:text-[#FFD700]"
                style={{ color: stat.useGold ? '#FFD700' : '#FFFFFF' }}
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>
                {stat.label}
              </div>
              <div className="text-xs" style={{ color: 'rgba(245, 245, 220, 0.7)' }}>
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
