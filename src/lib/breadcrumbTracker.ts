/**
 * Enhanced Breadcrumb System
 * 
 * Automatically tracks user interactions, navigation, and key events
 * for better debugging and user session replay.
 */

import { logger } from "@/lib/logger";

/**
 * User interaction types for breadcrumb tracking
 */
export interface UserInteraction {
  type: 'click' | 'navigation' | 'form_submit' | 'trade_action' | 'api_call' | 'error' | 'session';
  target: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Breadcrumb tracker for automatically capturing user interactions
 */
class BreadcrumbTracker {
  private interactions: UserInteraction[] = [];
  private maxInteractions = 100;
  private lastNavigationTime = Date.now();

  // Event handler references for cleanup
  private clickHandler: ((event: Event) => void) | null = null;
  private submitHandler: ((event: Event) => void) | null = null;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;
  private popstateHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private activityHandler: (() => void) | null = null;

  constructor() {
    this.initializeEventListeners();
    this.initializeNavigationTracking();
    this.initializeSessionTracking();
  }

  /**
   * Initialize event listeners for automatic interaction tracking
   */
  private initializeEventListeners(): void {
    // Track clicks on interactive elements
    this.clickHandler = (event) => {
      const target = event.target as HTMLElement;
      const clickableElement = this.findClickableElement(target);

      if (clickableElement) {
        this.recordInteraction('click', this.getElementDescription(clickableElement), {
          element: clickableElement.tagName,
          className: clickableElement.className,
          id: clickableElement.id,
          text: clickableElement.textContent?.slice(0, 100) || '',
          target: this.getEventTarget(event),
        });
      }
    };
    document.addEventListener('click', this.clickHandler);

    // Track form interactions
    this.submitHandler = (event) => {
      const form = event.target as HTMLFormElement;
      if (form.tagName === 'FORM') {
        this.recordInteraction('form_submit', this.getFormDescription(form), {
          formAction: form.action,
          formMethod: form.method,
          formData: this.getFormData(form),
        });
      }
    };
    document.addEventListener('submit', this.submitHandler);

    // Track keyboard interactions
    this.keydownHandler = (event) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
          this.recordInteraction('click', `Keyboard: ${event.key}`, {
            element: activeElement.tagName,
            id: activeElement.id,
            className: activeElement.className,
          });
        }
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Initialize navigation tracking
   */
  private initializeNavigationTracking(): void {
    // Track React Router navigation (would need router integration)
    // For now, track basic navigation events
    this.popstateHandler = () => {
      this.recordInteraction('navigation', `Navigation: ${window.location.pathname}`, {
        url: window.location.href,
        referrer: document.referrer,
        navigationType: 'popstate',
      });
    };
    window.addEventListener('popstate', this.popstateHandler);

    // Track page visibility changes
    this.visibilityHandler = () => {
      const visibility = document.visibilityState;
      this.recordInteraction('session', `Visibility: ${visibility}`, {
        visibility,
        timeSinceLastNavigation: Date.now() - this.lastNavigationTime,
      });

      if (visibility === 'visible') {
        this.lastNavigationTime = Date.now();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Initialize session tracking
   */
  private initializeSessionTracking(): void {
    // Track session start
    this.recordInteraction('session', 'Session started', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    });

    // Track session activity
    const activityEvents = ['mousemove', 'scroll', 'keydown', 'click'];
    let lastActivity = Date.now();

    this.activityHandler = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event as keyof DocumentEventMap, this.activityHandler!, { passive: true });
    });

    // Check for inactivity periodically
    setInterval(() => {
      const inactivity = Date.now() - lastActivity;
      if (inactivity > 300000) { // 5 minutes
        this.recordInteraction('session', 'User inactive', {
          inactivityDuration: inactivity,
        });
      }
    }, 60000); // Check every minute
  }

  /**
   * Find the clickable element in the event chain
   */
  private findClickableElement(element: HTMLElement): HTMLElement | null {
    const interactiveSelectors = [
      'button', 'a', 'input[type="button"]', 'input[type="submit"]',
      'input[type="checkbox"]', 'input[type="radio"]', '[role="button"]',
      '[data-clickable]', '[onclick]'
    ];

    for (const selector of interactiveSelectors) {
      const found = element.closest(selector);
      if (found) return found as HTMLElement;
    }

    return null;
  }

  /**
   * Get a description of the clicked element
   */
  private getElementDescription(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const id = element.id;
    const className = element.className;
    const text = element.textContent?.trim().slice(0, 50) || '';

    if (tagName === 'button' || tagName === 'a') {
      if (text) return `Click: ${text}`;
      if (id) return `Click: #${id}`;
      if (className) return `Click: .${className.split(' ')[0]}`;
    }

    if (id) return `Click: #${id} (${tagName})`;
    if (className) return `Click: .${className.split(' ')[0]} (${tagName})`;

    return `Click: ${tagName}`;
  }

  /**
   * Get form description
   */
  private getFormDescription(form: HTMLFormElement): string {
    if (form.id) return `Form submit: #${form.id}`;
    if (form.action) return `Form submit: ${form.action}`;
    return 'Form submit';
  }

  /**
   * Get form data (sanitized)
   */
  private getFormData(form: HTMLFormElement): Record<string, unknown> {
    const formData: Record<string, unknown> = {};
    const elements = form.elements;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;
      if (element.name) {
        // Don't log sensitive data
        if (element.type === 'password' || element.name.includes('password')) {
          formData[element.name] = '[REDACTED]';
        } else if (element.type === 'text' || element.type === 'email') {
          formData[element.name] = element.value.slice(0, 100); // Limit length
        } else {
          formData[element.name] = element.value;
        }
      }
    }

    return formData;
  }

  /**
   * Get event target information
   */
  private getEventTarget(event: Event): string {
    const target = event.target as HTMLElement;
    const path = event.composedPath();

    if (path.length > 1) {
      const parent = path[1] as HTMLElement;
      if (parent && parent.tagName) {
        return `${target.tagName} > ${parent.tagName}`;
      }
    }

    return target.tagName || 'unknown';
  }

  /**
   * Record a user interaction
   */
  recordInteraction(
    type: UserInteraction['type'],
    target: string,
    metadata?: Record<string, unknown>
  ): void {
    const interaction: UserInteraction = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    };

    // Add to interactions list
    this.interactions.push(interaction);
    if (this.interactions.length > this.maxInteractions) {
      this.interactions.shift();
    }

    // Add to logger breadcrumbs
    logger.addBreadcrumb(
      type,
      target,
      type === 'error' ? 'error' : 'info'
    );

    // Log trading actions with higher priority
    if (type === 'trade_action') {
      logger.addBreadcrumb('trading', target, 'info');
    }
  }

  /**
   * Record a trading action
   */
  recordTradeAction(action: string, details: Record<string, unknown>): void {
    this.recordInteraction('trade_action', action, details);

    // Add specific trading breadcrumb
    logger.addBreadcrumb('trading', action, 'info');
  }

  /**
   * Record an API call
   */
  recordAPICall(method: string, url: string, status?: number, duration?: number): void {
    const target = `${method} ${url}`;
    const metadata: Record<string, unknown> = { method, url };

    if (status) metadata.status = status;
    if (duration) metadata.duration = duration;

    this.recordInteraction('api_call', target, metadata);
  }

  /**
   * Record a navigation event
   */
  recordNavigation(path: string, fromPath?: string): void {
    const target = fromPath ? `Navigation: ${fromPath} → ${path}` : `Navigation: ${path}`;

    this.recordInteraction('navigation', target, {
      path,
      fromPath,
      timeSinceLastNavigation: Date.now() - this.lastNavigationTime,
    });

    this.lastNavigationTime = Date.now();
  }

  /**
   * Get interaction history
   */
  getInteractions(): UserInteraction[] {
    return [...this.interactions];
  }

  /**
   * Clear interaction history
   */
  clearInteractions(): void {
    this.interactions.length = 0;
  }

  /**
   * Cleanup all event listeners to prevent memory leaks
   */
  cleanup(): void {
    // Clear all interactions
    this.clearInteractions();

    // Remove all event listeners
    document.removeEventListener('click', this.clickHandler as EventListener);
    document.removeEventListener('submit', this.submitHandler as EventListener);
    document.removeEventListener('keydown', this.keydownHandler as EventListener);
    window.removeEventListener('popstate', this.popstateHandler as EventListener);
    document.removeEventListener('visibilitychange', this.visibilityHandler as EventListener);

    // Remove activity event listeners
    const activityEvents = ['mousemove', 'scroll', 'keydown', 'click'];
    activityEvents.forEach(event => {
      document.removeEventListener(event, this.activityHandler as EventListener);
    });
  }

  /**
   * Get summary of recent interactions
   */
  getInteractionSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    this.interactions.forEach(interaction => {
      summary[interaction.type] = (summary[interaction.type] || 0) + 1;
    });

    return summary;
  }
}

// Create global tracker instance
export const breadcrumbTracker = new BreadcrumbTracker();

// Export convenience functions
export const recordTradeAction = (action: string, details: Record<string, unknown>) =>
  breadcrumbTracker.recordTradeAction(action, details);

export const recordAPICall = (method: string, url: string, status?: number, duration?: number) =>
  breadcrumbTracker.recordAPICall(method, url, status, duration);

export const recordNavigation = (path: string, fromPath?: string) =>
  breadcrumbTracker.recordNavigation(path, fromPath);

export default breadcrumbTracker;