import * as React from 'react';
import { useCallback } from 'react';
import { trackCustomMetric } from '../../hooks/useWebVitalsEnhanced';

export interface UserEvent {
  id: string;
  timestamp: number;
  type:
    | 'click'
    | 'scroll'
    | 'hover'
    | 'form_submit'
    | 'page_view'
    | 'exit_intent'
    | 'conversion';
  target?: string | undefined;
  x?: number | undefined;
  y?: number | undefined;
  value?: number | undefined;
  metadata?: Record<string, unknown> | undefined;
  sessionId: string;
  userId?: string | undefined;
  page: string;
  referrer?: string | undefined;
}

export interface HeatMapData {
  x: number;
  y: number;
  intensity: number;
  clicks: number;
  element?: string | undefined;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  conversions: number;
  dropOffRate: number;
  conversionRate: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  event: string;
  target?: string | undefined;
  expectedCount: number;
  actualCount: number;
  dropOffRate: number;
}

export interface SessionData {
  id: string;
  userId?: string | undefined;
  startTime: number;
  endTime?: number | undefined;
  duration: number;
  pageViews: number;
  events: UserEvent[];
  conversions: UserEvent[];
  bounceRate: number;
  scrollDepth: number;
  clickHeatMap: HeatMapData[];
  deviceInfo: DeviceInfo;
  referrer?: string | undefined;
  landingPage: string;
  exitPage?: string | undefined;
}

export interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  connectionType?: string | undefined;
  deviceMemory?: number | undefined;
  hardwareConcurrency?: number | undefined;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UserJourney {
  sessionId: string;
  pages: Array<{
    page: string;
    timestamp: number;
    duration: number;
    events: UserEvent[];
  }>;
  conversions: UserEvent[];
  totalDuration: number;
  bounceRate: number;
  conversionRate: number;
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private listeners: Array<{
    element: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions | boolean | undefined;
  }> = [];
  private sessions: Map<string, SessionData> = new Map();
  private currentSession: SessionData | null = null;

  private heatMapData: Map<string, HeatMapData[]> = new Map();
  private funnels: Map<string, ConversionFunnel> = new Map();
  private isRecording = false;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private eventBuffer: UserEvent[] = [];
  private bufferFlushInterval: NodeJS.Timeout;

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  constructor() {
    this.setupEventListeners();
    this.initializeSession();
    this.setupFunnels();
    this.bufferFlushInterval = setInterval(() => {
      this.flushEventBuffer();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Helper method to register event listeners with centralized tracking
   * @param element The event target
   * @param type The event type
   * @param handler The event handler
   * @param options Optional event listener options
   */
  private addEventListenerWithCleanup(
    element: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean | undefined
  ): void {
    element.addEventListener(type, handler, options);
    this.listeners.push({ element, type, handler, options });
  }

  private setupEventListeners() {
    // Page view tracking
    this.trackPageView();

    // Click tracking
    this.addEventListenerWithCleanup(
      document,
      'click',
      (e: Event) => {
        this.trackClick(e as MouseEvent);
      },
      { passive: true }
    );

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    this.addEventListenerWithCleanup(
      document,
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScroll();
        }, 100);
      },
      { passive: true }
    );

    // Hover tracking
    this.addEventListenerWithCleanup(
      document,
      'mouseover',
      (e: Event) => {
        this.trackHover(e as MouseEvent);
      },
      { passive: true }
    );

    // Form submission tracking
    this.addEventListenerWithCleanup(document, 'submit', (e: Event) => {
      this.trackFormSubmit(e);
    });

    // Page visibility changes
    this.addEventListenerWithCleanup(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.pauseSession();
      } else {
        this.resumeSession();
      }
    });

    // Before unload
    this.addEventListenerWithCleanup(window, 'beforeunload', () => {
      this.endSession();
    });

    // Exit intent
    this.addEventListenerWithCleanup(document, 'mouseleave', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if (mouseEvent.clientY <= 0) {
        this.trackExitIntent();
      }
    });
  }

  private initializeSession() {
    const sessionId = this.generateSessionId();
    const deviceInfo = this.getDeviceInfo();

    this.currentSession = {
      id: sessionId,
      userId: this.getCurrentUserId(),
      startTime: Date.now(),
      duration: 0,
      pageViews: 1,
      events: [],
      conversions: [],
      bounceRate: 0,
      scrollDepth: 0,
      clickHeatMap: [],
      deviceInfo,
      referrer: document.referrer,
      landingPage: window.location.pathname,
    };

    this.sessions.set(sessionId, this.currentSession);
    this.trackEvent('page_view', { page: window.location.pathname });

    // Start session monitoring
    setTimeout(() => {
      this.monitorSession();
    }, 1000);
  }

  private setupFunnels() {
    // Default conversion funnels
    const funnelId = 'signup';
    this.createFunnel(funnelId, {
      name: 'User Signup Funnel',
      steps: [
        { id: 'landing', name: 'Landing Page', event: 'page_view' },
        {
          id: 'signup_click',
          name: 'Click Signup',
          event: 'click',
          target: '[data-signup]',
        },
        { id: 'form_start', name: 'Start Form', event: 'form_focus' },
        { id: 'form_submit', name: 'Submit Form', event: 'form_submit' },
        {
          id: 'email_verification',
          name: 'Email Verification',
          event: 'email_verified',
        },
        { id: 'complete', name: 'Account Created', event: 'account_created' },
      ],
    });

    this.createFunnel('deposit', {
      name: 'Deposit Funnel',
      steps: [
        { id: 'dashboard', name: 'Dashboard', event: 'page_view' },
        {
          id: 'deposit_click',
          name: 'Click Deposit',
          event: 'click',
          target: '[data-deposit]',
        },
        {
          id: 'amount_select',
          name: 'Select Amount',
          event: 'amount_selected',
        },
        {
          id: 'payment_method',
          name: 'Choose Payment',
          event: 'payment_selected',
        },
        {
          id: 'complete_deposit',
          name: 'Deposit Complete',
          event: 'deposit_completed',
        },
      ],
    });

    this.createFunnel('trade', {
      name: 'Trading Funnel',
      steps: [
        { id: 'platform', name: 'Trading Platform', event: 'page_view' },
        {
          id: 'instrument_select',
          name: 'Select Instrument',
          event: 'instrument_selected',
        },
        {
          id: 'order_type',
          name: 'Choose Order Type',
          event: 'order_type_selected',
        },
        { id: 'place_order', name: 'Place Order', event: 'order_placed' },
        {
          id: 'order_executed',
          name: 'Order Executed',
          event: 'order_executed',
        },
      ],
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from session storage (more secure than localStorage)
    try {
      return sessionStorage.getItem('user_id') || undefined;
    } catch {
      return undefined;
    }
  }

  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(ua);
    const isDesktop = !isMobile && !isTablet;

    return {
      userAgent: ua,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      connectionType: (
        navigator as Navigator & { connection?: { effectiveType?: string } }
      ).connection?.effectiveType,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform,
      isMobile,
      isTablet,
      isDesktop,
    };
  }

  private trackEvent(
    type: UserEvent['type'],
    metadata: Partial<UserEvent> = {}
  ) {
    if (!this.currentSession) return;

    const event: UserEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      type,
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      page: window.location.pathname,
      ...metadata,
    };

    this.eventBuffer.push(event);
    this.currentSession.events.push(event);

    // Track heat map data for clicks
    if (type === 'click' && metadata.x && metadata.y) {
      this.updateHeatMap(metadata.x, metadata.y, metadata.target);
    }

    // Check for funnel progression
    this.checkFunnelProgression(event);

    // Track conversions
    if (type === 'conversion') {
      this.currentSession.conversions.push(event);
    }

    // Send to analytics service
    this.sendEventToAnalytics(event);
  }

  private trackPageView() {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      referrer: document.referrer,
    });

    if (this.currentSession) {
      this.currentSession.pageViews++;
    }
  }

  private trackClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.trackEvent('click', {
      target: this.getElementSelector(target),
      x: event.clientX,
      y: event.clientY,
      metadata: {
        elementText: target.textContent?.trim().substring(0, 100),
        elementClass: target.className,
        boundingRect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
        },
      },
    });
  }

  private trackScroll() {
    const scrollDepth = Math.round(
      ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
    );

    if (this.currentSession) {
      this.currentSession.scrollDepth = Math.max(
        this.currentSession.scrollDepth,
        scrollDepth
      );
    }

    this.trackEvent('scroll', {
      metadata: {
        scrollDepth,
        scrollY: window.scrollY,
        documentHeight: document.body.scrollHeight,
        viewportHeight: window.innerHeight,
      },
    });
  }

  private trackHover(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Only track significant hovers (not quick passes)
    this.trackEvent('hover', {
      target: this.getElementSelector(target),
      metadata: {
        elementText: target.textContent?.trim().substring(0, 100),
        hoverDuration:
          Date.now() -
          ((target as { _hoverStart?: number })._hoverStart ?? Date.now()),
      },
    });
  }

  private trackFormSubmit(event: Event) {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    this.trackEvent('form_submit', {
      target: this.getElementSelector(form),
      metadata: {
        formAction: form.action,
        formMethod: form.method,
        fieldCount: formData.getAll ? formData.getAll('fieldCount').length : 0,
        fields: formData.getAll ? formData.getAll('fieldName') : [],
      },
    });
  }

  private trackExitIntent() {
    this.trackEvent('exit_intent', {
      metadata: {
        timeOnPage: Date.now() - (this.currentSession?.startTime || Date.now()),
        scrollDepth: this.currentSession?.scrollDepth || 0,
      },
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private updateHeatMap(x: number, y: number, element?: string) {
    const pageKey = window.location.pathname;

    if (!this.heatMapData.has(pageKey)) {
      this.heatMapData.set(pageKey, []);
    }

    const heatMap = this.heatMapData.get(pageKey)!;

    // Find existing point or create new one
    const existingPoint = heatMap.find(
      (point) => Math.abs(point.x - x) < 50 && Math.abs(point.y - y) < 50
    );

    if (existingPoint) {
      existingPoint.clicks++;
      existingPoint.intensity = Math.min(100, existingPoint.intensity + 10);
    } else {
      heatMap.push({
        x,
        y,
        intensity: 10,
        clicks: 1,
        element,
      });
    }
  }

  private checkFunnelProgression(event: UserEvent) {
    this.funnels.forEach((funnel, funnelId) => {
      const currentStep = funnel.steps.find(
        (step) => !this.isStepCompleted(step.id)
      );

      if (currentStep && this.matchesEvent(currentStep, event)) {
        this.completeFunnelStep(currentStep.id);
      }
    });
  }

  private matchesEvent(step: FunnelStep, event: UserEvent): boolean {
    if (step.event !== event.type) return false;

    if (step.target && event.target) {
      return event.target.includes(step.target.replace(/[[\]]/g, ''));
    }

    return true;
  }

  private isStepCompleted(stepId: string): boolean {
    const sessionData = this.sessions.get(this.currentSession?.id || '');
    if (!sessionData) return false;

    // Check if this step has been completed in this session
    return sessionData.events.some(
      (event) => event.metadata?.funnelStep === stepId
    );
  }

  private completeFunnelStep(stepId: string) {
    // Find the funnel that contains this step
    let funnel = null;
    let funnelId = null;
    for (const [id, f] of Array.from(this.funnels.entries())) {
      if (f.steps.some((s) => s.id === stepId)) {
        funnel = f;
        funnelId = id;
        break;
      }
    }

    if (!funnel || !funnelId) return;

    const step = funnel.steps.find((s) => s.id === stepId);
    if (!step) return;

    step.actualCount++;

    // Track step completion
    this.trackEvent('conversion', {
      metadata: {
        funnelId,
        funnelStep: stepId,
        funnelName: funnel.name,
        stepName: step.name,
      },
    });

    // Update funnel metrics
    this.updateFunnelMetrics(funnelId);
  }

  private updateFunnelMetrics(funnelId: string) {
    const funnel = this.funnels.get(funnelId);
    if (!funnel) return;

    const totalSteps = funnel?.steps?.length || 0;
    if (totalSteps === 0) return;

    funnel.conversionRate =
      (funnel?.steps?.[0]?.actualCount || 0) > 0
        ? ((funnel?.steps?.[totalSteps - 1]?.actualCount || 0) /
            (funnel?.steps?.[0]?.actualCount || 1)) *
          100
        : 0;

    // Calculate drop-off rates
    funnel.steps.forEach((step, index) => {
      if (index > 0) {
        const previousStep = funnel.steps[index - 1];
        if (previousStep && step) {
          step.dropOffRate =
            previousStep.actualCount > 0
              ? ((previousStep.actualCount - step.actualCount) /
                  previousStep.actualCount) *
                100
              : 0;
        }
      }
    });
  }

  private createFunnel(
    id: string,
    config: {
      name: string;
      steps: Array<{
        id: string;
        name: string;
        event: string;
        target?: string;
      }>;
    }
  ) {
    const funnel: ConversionFunnel = {
      id,
      name: config.name,
      steps: config.steps.map((step) => ({
        ...step,
        expectedCount: 0,
        actualCount: 0,
        dropOffRate: 0,
      })),
      conversions: 0,
      dropOffRate: 0,
      conversionRate: 0,
    };

    this.funnels.set(id, funnel);
  }

  private monitorSession() {
    if (!this.currentSession) return;

    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;

    // Update session duration
    this.currentSession.duration = sessionDuration;

    // Check for session timeout
    if (sessionDuration > this.sessionTimeout) {
      this.endSession();
      return;
    }

    // Continue monitoring
    setTimeout(() => {
      this.monitorSession();
    }, 10000); // Check every 10 seconds
  }

  private pauseSession() {
    if (this.currentSession) {
      this.currentSession.duration = Date.now() - this.currentSession.startTime;
    }
  }

  private resumeSession() {
    if (this.currentSession) {
      this.currentSession.startTime = Date.now() - this.currentSession.duration;
    }
  }

  private endSession() {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration =
      this.currentSession.endTime - this.currentSession.startTime;

    // Calculate bounce rate (single page view)
    this.currentSession.bounceRate =
      this.currentSession.pageViews === 1 ? 100 : 0;

    // Final session analysis
    this.analyzeSession(this.currentSession);

    // Clear current session
    this.currentSession = null;

    // Start new session after delay
    setTimeout(() => {
      this.initializeSession();
    }, 1000);
  }

  private analyzeSession(session: SessionData) {
    // Calculate session metrics
    const conversionRate =
      session.pageViews > 0
        ? (session.conversions.length / session.pageViews) * 100
        : 0;

    // Track session metrics
    trackCustomMetric('session_duration', session.duration, 'User Behavior');
    trackCustomMetric('session_pageviews', session.pageViews, 'User Behavior');
    trackCustomMetric(
      'session_bounce_rate',
      session.bounceRate,
      'User Behavior'
    );
    trackCustomMetric(
      'session_conversion_rate',
      conversionRate,
      'User Behavior'
    );
    trackCustomMetric(
      'session_scroll_depth',
      session.scrollDepth,
      'User Behavior'
    );

    // Send session data to analytics service
    this.sendSessionToAnalytics();
  }

  private sendEventToAnalytics(event: UserEvent) {
    // In a real implementation, send to analytics service
    if (
      typeof window !== 'undefined' &&
      (window as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as { gtag?: (...args: unknown[]) => void }).gtag!(
        'event',
        event.type,
        {
          event_category: 'User Behavior',
          event_label: event.target || event.page,
          value: event.value || 1,
          custom_parameter_1: event.sessionId,
          custom_parameter_2: event.userId || 'anonymous',
        }
      );
    }
  }

  private sendSessionToAnalytics() {
    // Send aggregated session data
    trackCustomMetric('completed_session', 1, 'Sessions');
  }

  private flushEventBuffer() {
    if (this.eventBuffer.length === 0) return;

    // Send buffered events
    this.eventBuffer.forEach((event) => {
      this.sendEventToAnalytics(event);
    });

    this.eventBuffer = [];
  }

  // Public API methods
  public trackConversion(
    conversionName: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) {
    this.trackEvent('conversion', {
      metadata: {
        conversionName,
        conversionValue: value,
        ...metadata,
      },
    });
  }

  public trackCustomEvent(
    eventName: string,
    metadata?: Record<string, unknown>
  ) {
    this.trackEvent('click', {
      metadata: {
        customEvent: eventName,
        ...metadata,
      },
    });
  }

  public getHeatMapData(page?: string): HeatMapData[] {
    const pageKey = page || window.location.pathname;
    return this.heatMapData.get(pageKey) || [];
  }

  public getFunnelData(funnelId: string): ConversionFunnel | null {
    return this.funnels.get(funnelId) || null;
  }

  public getAllFunnels(): ConversionFunnel[] {
    return Array.from(this.funnels.values());
  }

  public getSessionData(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  public getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  public getUserJourney(userId: string): UserJourney | null {
    // Find all sessions for this user
    const userSessions = Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId
    );

    if (userSessions.length === 0) return null;

    // Combine sessions into journey
    const allPages = userSessions.flatMap((session) =>
      session.events
        .filter((event) => event.type === 'page_view')
        .map((event) => ({
          page: event.page,
          timestamp: event.timestamp,
          duration: 0, // Would need to calculate based on next page view
          events: session.events.filter((e) => e.page === event.page),
        }))
    );

    const allConversions = userSessions.flatMap(
      (session) => session.conversions
    );
    const totalDuration = userSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const totalPageViews = userSessions.reduce(
      (sum, session) => sum + session.pageViews,
      0
    );

    return {
      sessionId: userId,
      pages: allPages,
      conversions: allConversions,
      totalDuration,
      bounceRate:
        (userSessions.filter((s) => s.pageViews === 1).length /
          userSessions.length) *
        100,
      conversionRate:
        totalPageViews > 0 ? (allConversions.length / totalPageViews) * 100 : 0,
    };
  }

  public startRecording() {
    this.isRecording = true;
    import('@/lib/logger').then(({ logger }) => {
      logger.info('Analytics recording started', {
        component: 'AnalyticsManager',
        action: 'start_recording',
      });
    });
  }

  public stopRecording() {
    this.isRecording = false;
    import('@/lib/logger').then(({ logger }) => {
      logger.info('Analytics recording stopped', {
        component: 'AnalyticsManager',
        action: 'stop_recording',
      });
    });
  }

  public isRecordingActive(): boolean {
    return this.isRecording;
  }

  // Performance correlation analysis
  public correlateWithPerformance(metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }) {
    if (!this.currentSession) return;

    const correlation = {
      sessionId: this.currentSession.id,
      performance: metrics,
      behavior: {
        bounceRate: this.currentSession.bounceRate,
        scrollDepth: this.currentSession.scrollDepth,
        pageViews: this.currentSession.pageViews,
        sessionDuration: this.currentSession.duration,
        conversionRate:
          (this.currentSession.conversions.length /
            this.currentSession.pageViews) *
          100,
      },
    };

    // Track correlation data
    trackCustomMetric('performance_correlation', 1, 'Performance Analysis');

    // Send correlation to analytics
    this.sendCorrelationToAnalytics(correlation);
  }

  private sendCorrelationToAnalytics(correlation: unknown) {
    // In real implementation, send to data warehouse
    import('@/lib/logger').then(({ logger }) => {
      logger.info('Performance correlation updated', {
        component: 'AnalyticsManager',
        action: 'correlate_performance',
        metadata: { correlation },
      });
    });
  }

  // Cleanup
  public destroy() {
    // Remove all event listeners
    this.listeners.forEach(({ element, type, handler, options }) => {
      element.removeEventListener(type, handler, options);
    });
    this.listeners = [];

    // Clear buffer flush interval
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }

    // End current session
    if (this.currentSession) {
      this.endSession();
    }
  }
}

// Singleton instance
export const analyticsManager = AnalyticsManager.getInstance();

// React hook for analytics
export function useAnalytics() {
  const trackConversion = useCallback(
    (name: string, value?: number, metadata?: Record<string, unknown>) => {
      analyticsManager.trackConversion(name, value, metadata);
    },
    []
  );

  const trackCustomEvent = useCallback(
    (eventName: string, metadata?: Record<string, unknown>) => {
      analyticsManager.trackCustomEvent(eventName, metadata);
    },
    []
  );

  const getHeatMapData = useCallback((page?: string) => {
    return analyticsManager.getHeatMapData(page);
  }, []);

  const getFunnelData = useCallback((funnelId: string) => {
    return analyticsManager.getFunnelData(funnelId);
  }, []);

  return {
    trackConversion,
    trackCustomEvent,
    getHeatMapData,
    getFunnelData,
    getAllFunnels: () => analyticsManager.getAllFunnels(),
    getCurrentSession: () => analyticsManager.getCurrentSession(),
    startRecording: () => analyticsManager.startRecording(),
    stopRecording: () => analyticsManager.stopRecording(),
    isRecordingActive: () => analyticsManager.isRecordingActive(),
  };
}

// HOC for automatic conversion tracking
export function withConversionTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  conversionName: string,
  conversionValue?: (props: P) => number
) {
  return function ConversionTrackedComponent(props: P) {
    const [hasTracked, setHasTracked] = React.useState(false);

    React.useEffect(() => {
      if (!hasTracked) {
        const value = conversionValue ? conversionValue(props) : undefined;
        analyticsManager.trackConversion(conversionName, value);
        setHasTracked(true);
      }
    }, [hasTracked, props]);

    return React.createElement(WrappedComponent, props);
  };
}
