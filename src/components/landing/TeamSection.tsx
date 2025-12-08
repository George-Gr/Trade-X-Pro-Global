import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, Twitter } from 'lucide-react';
import * as React from 'react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Alexander Chen",
    role: "CEO & Founder",
    bio: "Former Goldman Sachs VP with 15+ years in quantitative trading. Founded TradeX Pro to democratize professional trading tools.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Sarah Mitchell",
    role: "Chief Technology Officer",
    bio: "Ex-Google engineer specializing in real-time systems. Built trading platforms processing $10B+ daily volume.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
    linkedin: "#"
  },
  {
    name: "Marcus Johnson",
    role: "Head of Product",
    bio: "Product leader from Bloomberg Terminal team. Passionate about creating intuitive financial interfaces.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Elena Rodriguez",
    role: "Chief Compliance Officer",
    bio: "20+ years regulatory experience at SEC and major brokerages. Ensures TradeX Pro meets global standards.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
    linkedin: "#"
  }
];

const TeamSection: React.FC = () => {
  return (
    <section className="py-24" style={{ background: '#F5F5DC' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0A1628' }}>
              Meet Our
              <span className="block mt-2" style={{ color: '#1a2d42' }}>Leadership Team</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1a2d42' }}>
              Industry veterans committed to transforming how traders learn and succeed
            </p>
          </div>
        </FadeInUp>

        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <StaggerItem key={index}>
              <Card
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                style={{ background: '#FFFFFF', border: '1px solid rgba(10, 22, 40, 0.1)' }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4" style={{ color: '#0A1628' }} />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-4 h-4" style={{ color: '#0A1628' }} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#0A1628' }}>{member.name}</h3>
                    <div className="text-sm font-medium mb-3" style={{ color: '#FFD700' }}>{member.role}</div>
                    <p className="text-sm leading-relaxed" style={{ color: '#1a2d42' }}>{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default TeamSection;
