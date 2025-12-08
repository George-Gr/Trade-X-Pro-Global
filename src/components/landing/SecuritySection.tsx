import { Award, Eye, FileCheck, Lock, Server, Shield } from 'lucide-react';
import * as React from 'react';

const SecuritySection: React.FC = () => {
  const certifications = [
    {
      icon: Shield,
      name: "SOC 2 Type II",
      description: "Certified for security, availability, and confidentiality",
      status: "Certified"
    },
    {
      icon: Lock,
      name: "ISO 27001",
      description: "Information security management system certified",
      status: "Certified"
    },
    {
      icon: FileCheck,
      name: "PCI DSS",
      description: "Payment Card Industry Data Security Standard compliant",
      status: "Compliant"
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "256-bit SSL Encryption",
      description: "All data transmitted is encrypted using bank-grade TLS 1.3 protocol"
    },
    {
      icon: Server,
      title: "Secure Data Centers",
      description: "Tier IV certified data centers with 99.99% uptime guarantee"
    },
    {
      icon: Eye,
      title: "24/7 Monitoring",
      description: "Real-time threat detection and automated security response"
    },
    {
      icon: Shield,
      title: "Fund Protection",
      description: "Client funds held in segregated accounts at top-tier banks"
    }
  ];

  return (
    <section className="py-24" style={{ background: '#F5F5DC' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(10, 22, 40, 0.1)', border: '1px solid rgba(10, 22, 40, 0.2)' }}>
            <Shield className="w-4 h-4" style={{ color: '#0A1628' }} />
            <span className="text-sm font-medium" style={{ color: '#0A1628' }}>Enterprise-Grade Security</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0A1628' }}>
            Your Security is
            <span className="block mt-2" style={{ color: '#1a2d42' }}>Our Priority</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1a2d42' }}>
            Industry-leading security measures to protect your data and funds
          </p>
        </div>

        {/* Certifications */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105"
              style={{ background: '#0A1628', border: '1px solid rgba(255, 215, 0, 0.2)' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
                <cert.icon className="w-8 h-8" style={{ color: '#FFD700' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{cert.name}</h3>
              <p className="text-sm mb-3" style={{ color: '#F5F5DC' }}>{cert.description}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <Award className="w-3 h-3 mr-1" />
                {cert.status}
              </span>
            </div>
          ))}
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{ background: '#FFFFFF', border: '1px solid rgba(10, 22, 40, 0.1)' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(10, 22, 40, 0.05)' }}>
                <feature.icon className="w-6 h-6" style={{ color: '#0A1628' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0A1628' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#1a2d42' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
