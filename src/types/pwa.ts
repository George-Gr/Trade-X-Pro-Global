// PWA Types and Interfaces

export interface PwaUpdateAvailableEvent {
  waiting: ServiceWorker;
  updateServiceWorker: () => Promise<void>;
}

export interface PwaInstallEvent {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaNotification {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface PwaManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url?: string;
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color?: string;
  theme_color?: string;
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  scope?: string;
  icons?: Array<{
    src: string;
    sizes: string;
    type?: string;
    purpose?: string;
  }>;
  shortcuts?: Array<{
    name: string;
    short_name?: string;
    description?: string;
    url: string;
    icons?: Array<{
      src: string;
      sizes: string;
      type?: string;
    }>;
  }>;
  categories?: string[];
  lang?: string;
  dir?: 'ltr' | 'rtl';
}

export interface PwaManagerState {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isServiceWorkerRegistered: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission;
}

// Extend Window interface for PWA
declare global {
  interface Window {
    deferredPrompt?: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
    pwaUpdateAvailable?: (event: PwaUpdateAvailableEvent) => void;
    pwaInstallAvailable?: () => void;
  }
}