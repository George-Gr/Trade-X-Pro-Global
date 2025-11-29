// Notification Types for TradeX Pro

export interface TradingAlertData {
  type: 'price' | 'order' | 'position' | 'risk';
  symbol: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  data?: Record<string, unknown>;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'system' | 'trading' | 'market' | 'social' | 'promotion';
  actionUrl?: string;
  actionText?: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  currentValue: number;
  message: string;
  enabled: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
  notificationType: 'push' | 'email' | 'inapp';
}

export interface OrderAlert {
  id: string;
  userId: string;
  orderId: string;
  eventType: 'placed' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected' | 'expired';
  message: string;
  enabled: boolean;
  createdAt: Date;
  notificationType: 'push' | 'email' | 'inapp';
}

export interface MarketAlert {
  id: string;
  userId: string;
  eventType: 'earnings' | 'dividend' | 'split' | 'news' | 'volume_spike' | 'price_spike';
  symbols: string[];
  message: string;
  enabled: boolean;
  createdAt: Date;
  notificationType: 'push' | 'email' | 'inapp';
}

export interface RiskAlert {
  id: string;
  userId: string;
  eventType: 'margin_call' | 'liquidation_risk' | 'drawdown_limit' | 'position_limit';
  message: string;
  severity: 'warning' | 'critical';
  enabled: boolean;
  createdAt: Date;
  notificationType: 'push' | 'email' | 'inapp';
  actionRequired: boolean;
}

export interface NotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inappEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  priceAlerts: {
    enabled: boolean;
    maxPerDay: number;
    sound: boolean;
  };
  orderAlerts: {
    enabled: boolean;
    sound: boolean;
  };
  marketAlerts: {
    enabled: boolean;
    sound: boolean;
  };
  riskAlerts: {
    enabled: boolean;
    sound: boolean;
    criticalOnly: boolean;
  };
  promotionalAlerts: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
}

export interface NotificationTemplate {
  id: string;
  type: string;
  titleTemplate: string;
  bodyTemplate: string;
  defaultPriority: 'low' | 'normal' | 'high' | 'urgent';
  defaultChannels: ('push' | 'email' | 'inapp')[];
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Utility types for notification handling
export type NotificationHandler = (notification: UserNotification) => void;
export type AlertHandler = (alert: TradingAlertData) => void;
export type SubscriptionHandler = (subscription: PushSubscription) => void;

// Event types for notification system
export interface NotificationEvent {
  type: 'notification_received';
  payload: UserNotification;
}

export interface AlertEvent {
  type: 'alert_triggered';
  payload: TradingAlertData;
}

export interface SubscriptionEvent {
  type: 'subscription_changed';
  payload: {
    subscription: PushSubscription | null;
    action: 'subscribed' | 'unsubscribed';
  };
}

// API types
export interface CreateNotificationRequest {
  title: string;
  body: string;
  userId?: string;
  target?: 'all' | 'segment' | 'specific';
  segment?: string;
  users?: string[];
  data?: Record<string, unknown>;
  scheduledFor?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateNotificationSettingsRequest {
  settings: Partial<NotificationSettings>;
}

export interface CreatePriceAlertRequest {
  symbol: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  notificationType?: 'push' | 'email' | 'inapp';
}

export interface TestNotificationRequest {
  type: 'push' | 'email' | 'inapp';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Response types
export interface NotificationResponse {
  success: boolean;
  id?: string;
  message?: string;
}

export interface NotificationSettingsResponse {
  success: boolean;
  settings: NotificationSettings;
}

export interface AlertListResponse {
  success: boolean;
  alerts: (PriceAlert | OrderAlert | MarketAlert | RiskAlert)[];
  total: number;
  page: number;
  limit: number;
}

// WebSocket events for real-time notifications
export interface WebSocketNotificationEvent {
  type: 'notification';
  data: UserNotification;
}

export interface WebSocketAlertEvent {
  type: 'alert';
  data: TradingAlertData;
}

export interface WebSocketSubscriptionEvent {
  type: 'subscription_update';
  data: {
    action: 'created' | 'updated' | 'deleted';
    subscription: Record<string, unknown>;
  };
}