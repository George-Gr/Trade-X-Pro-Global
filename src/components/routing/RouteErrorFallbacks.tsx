import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Home,
  PieChart,
  RefreshCw,
  Shield,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Error fallback component props
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * TradingErrorFallback component - Displays error details and provides retry/navigation for trading interface errors
 * @param props - ErrorFallbackProps containing error object and onRetry callback
 */
export const TradingErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">
            Trading Interface Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load the trading interface. This may be due to market
              data service connectivity issues or component loading failures.
            </AlertDescription>
          </Alert>

          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                Show Details
              </summary>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-muted rounded text-xs font-mono border border-border/50">
                  <div className="font-semibold text-red-700 mb-1 text-[10px] uppercase tracking-wide">Message:</div>
                  <div className="text-foreground leading-relaxed">{error.message}</div>
                </div>
                {error.stack && (
                  <div className="p-3 bg-muted rounded text-xs font-mono border border-border/50">
                    <div className="font-semibold text-red-700 mb-1 text-[10px] uppercase tracking-wide">Stack Trace:</div>
                    <pre className="text-foreground whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto leading-relaxed text-[10px]">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * PortfolioErrorFallback component - Displays error details and provides retry/navigation for portfolio data errors
 * @param props - ErrorFallbackProps containing error object and onRetry callback
 */
export const PortfolioErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <PieChart className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800">
            Portfolio Data Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load portfolio data. Please check your connection and
              try again.
            </AlertDescription>
          </Alert>

          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                Show Details
              </summary>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-muted rounded text-xs font-mono border border-border/50">
                  <div className="font-semibold text-red-700 mb-1 text-[10px] uppercase tracking-wide">Message:</div>
                  <div className="text-foreground leading-relaxed">{error.message}</div>
                </div>
                {error.stack && (
                  <div className="p-3 bg-muted rounded text-xs font-mono border border-border/50">
                    <div className="font-semibold text-red-700 mb-1 text-[10px] uppercase tracking-wide">Stack Trace:</div>
                    <pre className="text-foreground whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto leading-relaxed text-[10px]">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/trade')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trading
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * KYCErrorFallback component - Displays error details and provides retry/navigation for KYC verification errors
 * @param props - ErrorFallbackProps containing error object and onRetry callback
 */
export const KYCErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-blue-800">
            KYC Verification Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load KYC verification interface. Please try again or
              contact support if the issue persists.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * AdminErrorFallback component - Displays error details and provides retry/navigation for admin interface errors
 * @param props - ErrorFallbackProps containing error object and onRetry callback
 */
export const AdminErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-purple-800">Admin Panel Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load admin interface. Please check your permissions and
              try again.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * DashboardErrorFallback component - Displays error details and provides retry/navigation for dashboard errors
 * @param props - ErrorFallbackProps containing error object and onRetry callback
 */
export const DashboardErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <Home className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Dashboard Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load dashboard. This may be due to authentication or
              data loading issues.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/trade')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trading
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
