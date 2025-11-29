import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, X, Smartphone, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pwaManager } from '@/lib/pwa';

interface PwaInstallPromptProps {
  className?: string;
  showInstallButton?: boolean;
  showBenefits?: boolean;
}

/**
 * PWA Install Prompt Component
 * Shows an install prompt for users to add the app to their home screen
 */
export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  className,
  showInstallButton = true,
  showBenefits = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PWA install availability
    const handleInstallAvailable = () => {
      // Only show if user hasn't already dismissed it recently
      const lastDismissed = localStorage.getItem('pwaInstallDismissed');
      const now = Date.now();
      
      if (!lastDismissed || now - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) { // 24 hours
        setIsVisible(true);
      }
    };

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);

    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const success = await pwaManager.installPWA();
      
      if (success) {
        setIsVisible(false);
        toast({
          title: "🎉 Awesome!",
          description: "TradeX Pro has been added to your home screen. You can now launch it like any other app!",
        });
        
        // Track installation
        localStorage.setItem('pwaInstalled', new Date().toISOString());
      } else {
        toast({
          title: "Installation cancelled",
          description: "You can always install TradeX Pro later from your browser menu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Installation failed",
        description: "Please try again or install manually from your browser menu.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  // Don't show if PWA is already installed or user dismissed recently
  if (!isVisible || pwaManager.isPWAInstalled()) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-sm">
        <CardHeader className="relative p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white text-lg font-semibold">
                  TradeX Pro App
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Add to your home screen
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {showBenefits && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-blue-200">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Works offline - trade even without internet</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-200">
                <Download className="h-4 w-4 text-green-400" />
                <span>Lightning fast - no app store required</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-200">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <span>Get real-time notifications and alerts</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        {showInstallButton && (
          <CardContent className="p-4 pt-0">
            <div className="flex space-x-3">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-white"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

/**
 * PWA Update Notification Component
 * Shows when a new version is available
 */
export const PwaUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent) => {
      setUpdateAvailable(true);
      const detail = event.detail as unknown;
      
      toast({
        title: "🚀 New Version Available",
        description: "A new version of TradeX Pro is ready. Update now for the latest features and improvements!",
        action: {
          label: "Update Now",
          onClick: () => {
            detail.updateServiceWorker();
            setUpdateAvailable(false);
          },
        },
        duration: 10000,
      });
    };

    window.addEventListener('pwaUpdateAvailable', handleUpdateAvailable as EventListener);

    return () => {
      window.removeEventListener('pwaUpdateAvailable', handleUpdateAvailable as EventListener);
    };
  }, [toast]);

  return null; // This component only shows toast notifications
};

/**
 * PWA Status Indicator Component
 * Shows PWA installation status and provides management options
 */
export const PwaStatusIndicator: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(pwaManager.isPWAInstalled());
  const [canInstall, setCanInstall] = useState(!!window.deferredPrompt);

  useEffect(() => {
    const checkStatus = () => {
      setIsInstalled(pwaManager.isPWAInstalled());
      setCanInstall(!!window.deferredPrompt);
    };

    checkStatus();

    // Listen for installation events
    window.addEventListener('appinstalled', checkStatus);
    
    return () => {
      window.removeEventListener('appinstalled', checkStatus);
    };
  }, []);

  if (!canInstall && !isInstalled) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isInstalled ? (
        <Badge variant="success" className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          <span>Installed</span>
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-orange-400 rounded-full animate-pulse" />
          <span>Available to Install</span>
        </Badge>
      )}
    </div>
  );
};