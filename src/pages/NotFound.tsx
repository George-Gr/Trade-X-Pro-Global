import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * NotFound component displays a 404 error page when users navigate to non-existent routes.
 * Logs the attempted route access for monitoring purposes.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = '404 - Page Not Found | TradeX Pro';
    import('@/lib/logger').then(({ logger }) => {
      logger.warn('404 Error: User attempted to access non-existent route', {
        component: 'NotFound',
        action: 'report_404',
        metadata: { path: location.pathname },
      });
    });
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-primary typography-h1">404</h1>
        <h2 className="typography-h2">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="gap-4">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
