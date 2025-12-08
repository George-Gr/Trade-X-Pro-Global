import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

const ComparisonSection: React.FC = () => {
  const features = [
    { name: "Virtual Capital", tradex: "$50,000", competitor1: "$10,000", competitor2: "$25,000" },
    { name: "Trading Instruments", tradex: "500+", competitor1: "150+", competitor2: "300+" },
    { name: "Asset Classes", tradex: "5", competitor1: "3", competitor2: "4" },
    { name: "Real-time Data", tradex: true, competitor1: true, competitor2: true },
    { name: "Advanced Charting", tradex: true, competitor1: false, competitor2: true },
    { name: "Mobile Responsive", tradex: true, competitor1: true, competitor2: false },
    { name: "Risk Management Tools", tradex: true, competitor1: false, competitor2: true },
    { name: "Educational Resources", tradex: true, competitor1: false, competitor2: false },
    { name: "24/7 Support", tradex: true, competitor1: false, competitor2: true },
    { name: "Monthly Cost", tradex: "Free", competitor1: "$29/mo", competitor2: "$49/mo" },
  ];

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 mx-auto" style={{ color: '#22c55e' }} />
      ) : (
        <X className="w-5 h-5 mx-auto" style={{ color: '#ef4444' }} />
      );
    }
    return <span className="font-semibold">{value}</span>;
  };

  return (
    <section className="py-24" style={{ background: 'linear-gradient(180deg, #1a2d42 0%, #0A1628 100%)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Why Choose
            <span style={{ color: '#FFD700' }}> TradeX Pro?</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
            See how we compare to other paper trading platforms
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th className="text-left py-4 px-4" style={{ color: '#F5F5DC' }}>Feature</th>
                <th className="text-center py-4 px-4">
                  <div className="rounded-lg py-3 px-4" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '2px solid #FFD700' }}>
                    <span className="font-bold text-lg" style={{ color: '#FFD700' }}>TradeX Pro</span>
                  </div>
                </th>
                <th className="text-center py-4 px-4">
                  <div className="rounded-lg py-3 px-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.2)' }}>
                    <span className="font-medium" style={{ color: '#F5F5DC' }}>Competitor A</span>
                  </div>
                </th>
                <th className="text-center py-4 px-4">
                  <div className="rounded-lg py-3 px-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(245, 245, 220, 0.2)' }}>
                    <span className="font-medium" style={{ color: '#F5F5DC' }}>Competitor B</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-t"
                  style={{ borderColor: 'rgba(245, 245, 220, 0.1)' }}
                >
                  <td className="py-4 px-4" style={{ color: '#F5F5DC' }}>{feature.name}</td>
                  <td className="text-center py-4 px-4" style={{ color: '#FFD700' }}>
                    {renderValue(feature.tradex)}
                  </td>
                  <td className="text-center py-4 px-4" style={{ color: '#F5F5DC' }}>
                    {renderValue(feature.competitor1)}
                  </td>
                  <td className="text-center py-4 px-4" style={{ color: '#F5F5DC' }}>
                    {renderValue(feature.competitor2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-12">
          <Link to="/register">
            <Button size="lg" className="px-12 py-6 text-lg font-semibold" style={{ background: '#FFD700', color: '#0A1628' }}>
              Start Trading Free Today
            </Button>
          </Link>
          <p className="mt-4 text-sm" style={{ color: 'rgba(245, 245, 220, 0.6)' }}>
            No credit card required • Setup in 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
