import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap, Shield, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pwaManager } from '@/lib/pwa';

interface UpdateNotificationProps {
  className?: string;
  autoUpdate?: boolean;
  showDetails?: boolean;
}

/**
 * PWA Update Notification Component
 * Shows when a new version of the app is available
 */
export const PwaUpdateNotification: React.FC<UpdateNotificationProps> = ({
  className,
  autoUpdate = false,
  showDetails = true
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for service worker updates
    const handleServiceWorkerUpdate = (event: Event) => {
      const message = (event as MessageEvent).data;
      
      if (message.type === 'SW_ACTIVATED') {
        // New service worker activated - update complete
        setUpdateAvailable(false);
        setUpdateProgress(0);
        
        toast({
          title: "🚀 Update Complete!",
          description: "TradeX Pro has been updated with the latest features and improvements.",
          duration: 5000,
        });
      }
    };

    // Listen for PWA update available events
    const handleUpdateAvailable = (event: CustomEvent) => {
      const detail = event.detail as unknown;
      
      setUpdateAvailable(true);
      
      // Show toast notification
      toast({
        title: "🚀 New Version Available",
        description: "A new version of TradeX Pro is ready with exciting new features and improvements!",
        action: (
          <Button
            size="sm"
            onClick={() => {
              if (detail && detail.updateServiceWorker) {
                handleUpdate(detail.updateServiceWorker);
              }
            }}
          >
            Update Now
          </Button>
        ),
        duration: 10000,
      });
    };

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerUpdate);
    }

    window.addEventListener('pwaUpdateAvailable', handleUpdateAvailable as EventListener);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerUpdate);
      }
      window.removeEventListener('pwaUpdateAvailable', handleUpdateAvailable as EventListener);
    };
  }, [toast]);

  const handleUpdate = useCallback(async (updateServiceWorker?: () => Promise<void>) => {
    if (!updateServiceWorker) return;

    setIsUpdating(true);
    setUpdateProgress(10);

    try {
      // Simulate update progress
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Wait a bit then trigger update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Trigger service worker update
      await updateServiceWorker();
      
      clearInterval(progressInterval);
      setUpdateProgress(100);
      
      // Reset after completion
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateAvailable(false);
        setUpdateProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      setUpdateProgress(0);
      
      toast({
        title: "Update Failed",
        description: "Please try refreshing the page or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    // Store dismissal for 1 hour
    localStorage.setItem('pwaUpdateDismissed', Date.now().toString());
  };

  // Don't show if no update available or recently dismissed
  if (!updateAvailable) {
    const lastDismissed = localStorage.getItem('pwaUpdateDismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 60 * 60 * 1000) { // 1 hour
      return null;
    }
  }

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm">
        <CardHeader className="relative p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-full">
                <RefreshCw className={`h-6 w-6 text-orange-400 ${isUpdating ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-white text-lg font-semibold">
                    Update Available
                  </CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    New Version
                  </Badge>
                </div>
                <CardDescription className="text-orange-200">
                  TradeX Pro has been updated with new features
                </CardDescription>
              </div>
            </div>
            {!isUpdating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-orange-200 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showDetails && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-orange-200">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Enhanced trading performance</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-orange-200">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Improved security features</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-orange-200">
                <Download className="h-4 w-4 text-blue-400" />
                <span>Optimized loading times</span>
              </div>
            </div>
          )}

          {isUpdating && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-orange-200 mb-1">
                <span>Updating...</span>
                <span>{updateProgress}%</span>
              </div>
              <div className="w-full bg-orange-500/20 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        {!isUpdating && (
          <CardContent className="p-4 pt-0">
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  const detail = (window as any).pwaUpdateAvailableEvent?.detail;
                  if (detail?.updateServiceWorker) {
                    handleUpdate(detail.updateServiceWorker);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-orange-300 text-orange-300 hover:bg-orange-300 hover:text-white"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

/**
 * Version Info Component
 * Shows current app version and update status
 */
export const VersionInfo: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Get version from environment or package.json
    const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
    setCurrentVersion(version);
    
    // Get last update time
    const lastUpdateStored = localStorage.getItem('lastAppUpdate');
    if (lastUpdateStored) {
      setLastUpdate(new Date(lastUpdateStored).toLocaleDateString());
    }
  }, []);

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div>Version: {currentVersion}</div>
      {lastUpdate && <div>Last updated: {lastUpdate}</div>}
      <div className="flex items-center space-x-1">
        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
        <span>Online</span>
      </div>
    </div>
  );
};

/**
 * Auto Update Handler
 * Automatically handles updates in the background
 */
export const AutoUpdateHandler: React.FC = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // Skip waiting and activate new service worker
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload page to use new service worker
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Auto update failed:', error);
      }
    };

    // Check for updates every 30 minutes
    const updateInterval = setInterval(handleUpdate, 30 * 60 * 1000);
    
    // Check immediately on mount
    handleUpdate();

    return () => clearInterval(updateInterval);
  }, []);

  return null;
};