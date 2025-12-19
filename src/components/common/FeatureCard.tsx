import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
  /** Optional custom styling */
  className?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = '',
}: FeatureCardProps) => {
  return (
    <Card
      className={`border-border hover:shadow-lg transition-all hover:-translate-y-1 bg-card backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary ${className}`}
    >
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
          <Icon
            className="h-6 w-6 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
