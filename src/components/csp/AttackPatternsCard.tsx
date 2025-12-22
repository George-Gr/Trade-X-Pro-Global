import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import React from 'react';

interface AttackPatternsCardProps {
  attackPatterns: string[];
}

export const AttackPatternsCard: React.FC<AttackPatternsCardProps> = ({
  attackPatterns,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Attack Patterns</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attackPatterns.length > 0 ? (
          <div className="space-y-2">
            {attackPatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm">{pattern}</span>
                <Badge variant="outline">Detected</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No attack patterns detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};
