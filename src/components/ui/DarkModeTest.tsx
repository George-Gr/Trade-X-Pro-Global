// DEPRECATED: Dark mode testing has been removed.
// The application now uses light theme exclusively.
// This component is kept for backward compatibility but shows a notice.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const DarkModeTest: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dark Mode Testing Disabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dark mode functionality has been completely removed from this application.
            The application now uses the light theme exclusively.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DarkModeTest;
