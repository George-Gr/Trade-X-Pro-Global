// Push Notification Service for TradeX Pro
import type { 
  PwaNotification, 
  NotificationSubscription, 
  TradingAlertData 
} from '@/types/notifications';

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  auth: string;
  p256dh: string;
}

export interface TradingAlertData {
  type: 'price_alert' | 'order_update' | 'market_news' | 'risk_warning';
  symbol?: string;
  price?: number;
  threshold?: number;
  message: string;
  timestamp: string;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

class PushNotificationService {
  private vapidPublicKey: string;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean;

  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if push notifications are supported
   */
  private checkSupport(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Get VAPID public key as Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      const successful = await this.subscription.unsubscribe();
      
      if (successful) {
        // Notify server to remove subscription
        await this.removeSubscriptionFromServer(this.subscription);
        this.subscription = null;
      }

      return successful;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.serializeSubscription(subscription),
          userId: this.getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  /**
   * Serialize subscription for server
   */
  private serializeSubscription(subscription: PushSubscription): any {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : null,
        auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : null
      }
    };
  }

  /**
   * Show notification
   */
  showNotification(notification: PwaNotification): void {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Use service worker to show notification for better reliability
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: notification
      });
    } else {
      // Fallback to direct notification
      const notificationInstance = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        tag: notification.tag,
        data: notification.data,
        requireInteraction: notification.requireInteraction,
        silent: notification.silent,
        vibrate: notification.vibrate
      });

      if (notification.data?.url) {
        notificationInstance.onclick = () => {
          window.open(notification.data.url, '_blank');
          notificationInstance.close();
        };
      }
    }
  }

  /**
   * Show trading alert notification
   */
  showTradingAlert(alert: TradingAlertData): void {
    const notification: PwaNotification = {
      title: this.getAlertTitle(alert),
      body: alert.message,
      icon: '/icons/alert-icon.png',
      tag: `trading-alert-${alert.type}`,
      data: {
        type: 'trading_alert',
        alert,
        url: alert.url || this.getAlertUrl(alert)
      },
      requireInteraction: alert.priority === 'urgent',
      silent: alert.priority === 'low'
    };

    this.showNotification(notification);
  }

  /**
   * Get alert title based on type
   */
  private getAlertTitle(alert: TradingAlertData): string {
    switch (alert.type) {
      case 'price_alert':
        return `${alert.symbol} Price Alert`;
      case 'order_update':
        return 'Order Update';
      case 'market_news':
        return 'Market News';
      case 'risk_warning':
        return 'Risk Warning';
      default:
        return 'TradeX Pro Alert';
    }
  }

  /**
   * Get alert URL based on type
   */
  private getAlertUrl(alert: TradingAlertData): string {
    switch (alert.type) {
      case 'price_alert':
        return `/trade?symbol=${alert.symbol}`;
      case 'order_update':
        return '/portfolio';
      case 'market_news':
        return '/news';
      case 'risk_warning':
        return '/risk-management';
      default:
        return '/';
    }
  }

  /**
   * Schedule notification
   */
  scheduleNotification(notification: PwaNotification, delay: number): void {
    setTimeout(() => {
      this.showNotification(notification);
    }, delay);
  }

  /**
   * Cancel notification by tag
   */
  cancelNotification(tag: string): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_NOTIFICATION',
        payload: { tag }
      });
    }
  }

  /**
   * Get current user ID from context or localStorage
   */
  private getCurrentUserId(): string | null {
    // Try to get from context, then localStorage
    return localStorage.getItem('userId') || 
           sessionStorage.getItem('userId') ||
           document.cookie.match(/userId=([^;]+)/)?.[1] ||
           null;
  }

  /**
   * Check if user is subscribed to push notifications
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Get notification permission status
   */
  getPermission(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      // Check existing subscription
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        this.subscription = await registration.pushManager.getSubscription();
      }

      // Request permission if not granted
      if (Notification.permission === 'default') {
        await this.requestPermission();
      }

      // Auto-subscribe if permission granted and no subscription
      if (Notification.permission === 'granted' && !this.subscription) {
        await this.subscribeToPush();
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();