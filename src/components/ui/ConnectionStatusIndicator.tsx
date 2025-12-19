/**
 * Connection Status Indicator
 *
 * Displays real-time WebSocket connection status
 */

import * as React from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useWebSocketStatus } from '@/hooks/useWebSocketConnection';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectionStatusIndicator: React.FC<
  ConnectionStatusIndicatorProps
> = ({ className, showDetails = false }) => {
  const status = useWebSocketStatus();

  const getOverallState = () => {
    if (status.totalConnections === 0) return 'disconnected';
    const states = status.connections.map((c) => c.state);
    if (states.every((s) => s === 'connected')) return 'connected';
    if (states.some((s) => s === 'error')) return 'error';
    if (states.some((s) => s === 'reconnecting')) return 'reconnecting';
    return 'connecting';
  };

  const overallState = getOverallState();

  const getIcon = () => {
    switch (overallState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-emerald-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLabel = () => {
    switch (overallState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {getIcon()}
      {showDetails && (
        <span className="text-xs text-muted-foreground">
          {getLabel()}
          {status.totalSubscriptions > 0 && (
            <span className="ml-1">
              ({status.totalSubscriptions} sub
              {status.totalSubscriptions !== 1 ? 's' : ''})
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (showDetails) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('cursor-help', className)}>{content}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{getLabel()}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Connections: {status.totalConnections}</p>
              <p>Subscriptions: {status.totalSubscriptions}</p>
              {status.connections.length > 0 && (
                <div className="mt-2 space-y-1">
                  {status.connections.map((conn) => (
                    <div key={conn.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          conn.state === 'connected' && 'bg-emerald-500',
                          conn.state === 'connecting' && 'bg-amber-500',
                          conn.state === 'reconnecting' && 'bg-amber-500',
                          conn.state === 'error' && 'bg-destructive',
                          conn.state === 'disconnected' && 'bg-muted-foreground'
                        )}
                      />
                      <span>{conn.tables.join(', ') || 'No tables'}</span>
                      <span className="text-muted-foreground">
                        ({conn.subscriptionCount})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusIndicator;
