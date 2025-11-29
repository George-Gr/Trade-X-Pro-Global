// Service Worker Registration and PWA Utilities
import type { PwaUpdateAvailableEvent } from './types';

declare global {
  interface Window {
    deferredPrompt?: Event;
    pwaUpdateAvailable?: (event: PwaUpdateAvailableEvent) => void;
  }
}

export interface PwaUpdateAvailableEvent {
  waiting: ServiceWorker;
  updateServiceWorker: () => Promise<void>;
}

class PwaManager {
  private isRegistered = false;
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Register service worker and set up PWA functionality
   */
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Set up update detection
      this.setupUpdateDetection();

      // Set up push notification support
      this.setupPushNotifications();

      // Set up before install prompt
      this.setupBeforeInstallPrompt();

      this.isRegistered = true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Detect service worker updates
   */
  private setupUpdateDetection(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            this.updateAvailable = true;
            
            // Dispatch custom event for components to handle
            const event = new CustomEvent('pwaUpdateAvailable', {
              detail: {
                waiting: newWorker,
                updateServiceWorker: () => this.updateServiceWorker()
              }
            });
            
            window.dispatchEvent(event);
            
            // Call global handler if exists
            if (window.pwaUpdateAvailable) {
              window.pwaUpdateAvailable({
                waiting: newWorker,
                updateServiceWorker: () => this.updateServiceWorker()
              });
            }
            
            // Show notification
            this.showUpdateNotification();
          }
        });
      }
    });
  }

  /**
   * Update to new service worker
   */
  private async updateServiceWorker(): Promise<void> {
    if (!this.registration?.waiting) return;

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to use the new service worker
    window.location.reload();
  }

  /**
   * Set up push notification support
   */
  private async setupPushNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Register push event listener
        this.setupPushEventListener();
      }
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  /**
   * Set up push event listener
   */
  private setupPushEventListener(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION') {
        this.showNotification(event.data.title, event.data.options);
      }
    });
  }

  /**
   * Set up before install prompt
   */
  private setupBeforeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the mini-infobar from appearing
      event.preventDefault();
      
      // Stash the event so it can be triggered later
      window.deferredPrompt = event;
      
      // Show install button or prompt user
      this.showInstallPrompt();
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      console.log('TradeX Pro was installed');
      window.deferredPrompt = null;
      
      // Track installation
      this.trackInstallation();
    });
  }

  /**
   * Show install prompt to user
   */
  private showInstallPrompt(): void {
    // Dispatch custom event for components to handle
    window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
    
    // Show native notification if permission granted
    if (Notification.permission === 'granted') {
      this.showNotification(
        'TradeX Pro',
        {
          body: 'Add TradeX Pro to your home screen for easy access to your trading platform!',
          icon: '/icons/icon-192x192.png',
          tag: 'install-prompt',
          actions: [
            {
              action: 'install',
              title: 'Install App'
            },
            {
              action: 'dismiss',
              title: 'Not Now'
            }
          ]
        }
      );
    }
  }

  /**
   * Show notification
   */
  private showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        ...options,
        requireInteraction: true
      });
    }
  }

  /**
   * Track PWA installation
   */
  private trackInstallation(): void {
    // Track installation for analytics
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
      });
    }

    // Track in localStorage
    localStorage.setItem('pwaInstalled', new Date().toISOString());
    
    // Track in session storage for current session
    sessionStorage.setItem('pwaInstalled', 'true');
  }

  /**
   * Install PWA
   */
  async installPWA(): Promise<boolean> {
    if (!window.deferredPrompt) {
      return false;
    }

    try {
      // Show the prompt
      await window.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await window.deferredPrompt.userChoice;
      
      // Clear the deferred prompt
      window.deferredPrompt = undefined;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }

  /**
   * Check if PWA is installed
   */
  isPWAInstalled(): boolean {
    // Check if app is running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           sessionStorage.getItem('pwaInstalled') === 'true';
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Check if service worker is registered
   */
  isServiceWorkerRegistered(): boolean {
    return this.isRegistered;
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Clear update available flag
   */
  clearUpdateAvailable(): void {
    this.updateAvailable = false;
  }
}

// Export singleton instance
export const pwaManager = new PwaManager();

// Auto-register service worker on import
if (typeof window !== 'undefined') {
  pwaManager.registerServiceWorker().catch(console.error);
}