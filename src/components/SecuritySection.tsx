import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Lock,
  Fingerprint,
  Server,
  Database,
  Eye,
  CheckCircle,
  Award,
  FileText,
  Globe,
  AlertTriangle
} from 'lucide-react';

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, title, description, index }) => {
  return (
    <Card
      className={`
        card-hover bg-card/50 border-border/50
        fade-in-up visible feature-card-${index + 1}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-primary">{icon}</div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface RegulatoryBodyProps {
  name: string;
  description: string;
  licenseNumber: string;
  region: string;
  index: number;
}

const RegulatoryBody: React.FC<RegulatoryBodyProps> = ({
  name,
  description,
  licenseNumber,
  region,
  index
}) => {
  return (
    <Card
      className={`
        bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20
        fade-in-up visible
      `}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <p className="text-sm text-muted-foreground">{region}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {description}
        </p>
        <div className="text-xs text-primary font-medium">
          License: {licenseNumber}
        </div>
      </CardContent>
    </Card>
  );
};

interface SecuritySectionProps {
  className?: string;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ className = '' }) => {
  const securityFeatures = [
    {
      icon: <Lock className="h-5 w-5" />,
      title: '256-bit SSL Encryption',
      description: 'All data transmitted between your device and our servers is encrypted using industry-standard 256-bit SSL technology.'
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Encrypted Database Storage',
      description: 'Your personal and financial data is stored in encrypted databases with multiple layers of security protection.'
    },
    {
      icon: <Fingerprint className="h-5 w-5" />,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with 2FA via SMS, authenticator apps, or biometric authentication.'
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'Session Protection',
      description: 'Automatic session timeout and activity monitoring to prevent unauthorized access to your account.'
    },
    {
      icon: <Server className="h-5 w-5" />,
      title: 'DDoS Protection',
      description: 'Enterprise-grade DDoS protection ensures our platform remains available 24/7, even during peak traffic periods.'
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Regular Security Audits',
      description: 'Third-party security audits and penetration testing to identify and address potential vulnerabilities.'
    }
  ];

  const regulatoryBodies = [
    {
      name: 'FCA',
      description: 'UK Financial Conduct Authority regulation ensuring consumer protection and market integrity.',
      licenseNumber: 'FRN 123456',
      region: 'United Kingdom'
    },
    {
      name: 'CySEC',
      description: 'Cyprus Securities and Exchange Commission compliance for EU investor protection.',
      licenseNumber: 'License number 789/12',
      region: 'European Union'
    },
    {
      name: 'ASIC',
      description: 'Australian Securities and Investments Commission regulation for Australian market operations.',
      licenseNumber: 'AFSL 123456',
      region: 'Australia'
    }
  ];

  const complianceFeatures = [
    {
      icon: <FileText className="h-5 w-5 text-green-500" />,
      title: 'MiFID II Compliance',
      description: 'Full compliance with EU Markets in Financial Instruments Directive.'
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      title: 'AML Policies',
      description: 'Anti-Money Laundering policies to prevent financial crimes.'
    },
    {
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      title: 'KYC Procedures',
      description: 'Know Your Customer verification to protect against fraud.'
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      title: 'GDPR Compliant',
      description: 'General Data Protection Regulation compliance for data privacy.'
    }
  ];

  return (
    <section className={`py-20 bg-card/20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up visible">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Bank-Grade Security &
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {' '}Regulatory Compliance
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Your funds and data are protected with industry-leading security measures
            and strict regulatory oversight across multiple jurisdictions.
          </p>
        </div>

        {/* Trust Badges Overview */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>FCA Regulated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span>CySEC Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            <span>ASIC Licensed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-orange-500" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-red-500" />
            <span>Segregated Funds</span>
          </div>
        </div>

        {/* Split Layout: Regulatory Compliance & Security Features */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column: Regulatory Compliance */}
          <div className="space-y-8">
            <div className="fade-in-up visible">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                Regulatory Compliance
              </h3>
              <p className="text-muted-foreground mb-6">
                We operate under strict regulatory oversight in multiple jurisdictions,
                ensuring the highest standards of investor protection and market integrity.
              </p>
            </div>

            <div className="space-y-4">
              {regulatoryBodies.map((body, index) => (
                <RegulatoryBody
                  key={index}
                  {...body}
                  index={index}
                />
              ))}
            </div>

            {/* Compliance Features */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Compliance Standards
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complianceFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                  >
                    {feature.icon}
                    <div>
                      <h5 className="font-medium text-foreground text-sm">
                        {feature.title}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Security Features */}
          <div className="space-y-8">
            <div className="fade-in-up visible" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                Technical Security
              </h3>
              <p className="text-muted-foreground mb-6">
                Enterprise-grade security infrastructure protects your data and funds
                with multiple layers of advanced security measures.
              </p>
            </div>

            <div className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <SecurityFeature
                  key={index}
                  {...feature}
                  index={index + 4}
                />
              ))}
            </div>

            {/* Additional Security Info */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Fund Protection
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Client funds are held in segregated accounts at top-tier banks,
                    completely separate from company operating funds.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Segregated client accounts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Negative balance protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Insurance coverage available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Encryption Level', value: '256-bit', icon: <Lock className="h-5 w-5" /> },
            { label: 'Uptime Guarantee', value: '99.9%', icon: <Server className="h-5 w-5" /> },
            { label: 'Security Audits', value: 'Quarterly', icon: <Eye className="h-5 w-5" /> },
            { label: 'Data Centers', value: 'Global', icon: <Globe className="h-5 w-5" /> }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
              style={{ animationDelay: `${(index + 7) * 0.1}s` }}
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

        {/* CTA Section */}
        <div className="text-center fade-in-up visible">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Your Security is Our Priority
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Trade with confidence knowing your funds and personal information are
              protected by bank-grade security and regulatory oversight.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/security">
                <Button size="lg" className="btn-hover-lift">
                  <span className="flex items-center gap-2">
                    Learn More About Security
                    <Shield className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link to="/documents">
                <Button size="lg" variant="outline">
                  View Compliance Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Certifications Badges */}
        <div className="mt-16 text-center">
          <h4 className="text-lg font-semibold text-foreground mb-6">
            Security Certifications
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: 'ISO 27001', icon: <Award className="h-8 w-8 text-primary" /> },
              { name: 'PCI DSS', icon: <Lock className="h-8 w-8 text-primary" /> },
              { name: 'SOC 2 Type II', icon: <Shield className="h-8 w-8 text-primary" /> },
              { name: 'GDPR', icon: <FileText className="h-8 w-8 text-primary" /> }
            ].map((cert, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg border border-border/50"
                style={{ animationDelay: `${(index + 11) * 0.1}s` }}
              >
                {cert.icon}
                <span className="text-sm font-medium text-foreground">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;