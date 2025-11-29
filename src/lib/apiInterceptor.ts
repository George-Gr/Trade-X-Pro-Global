/**
 * API Interceptor for Performance Monitoring
 * 
 * Automatically tracks API response times, errors, and provides
 * detailed logging for debugging and performance analysis.
 */

import { logger } from "@/lib/logger";
import { recordAPICall } from "@/lib/breadcrumbTracker";

/**
 * API response interface
 */
export interface APIResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  data?: any;
  error?: string;
  duration: number;
}

/**
 * API request configuration
 */
export interface APIRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  critical?: boolean;
}

/**
 * Enhanced fetch wrapper with comprehensive monitoring
 */
class APIInterceptor {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  /**
   * Enhanced fetch with monitoring
   */
  async fetch(url: string | URL, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
    const startTime = performance.now();
    const requestId = `req-${this.requestCount++}`;
    const method = options.method || 'GET';
    const { timeout: customTimeout = 30000, ...fetchOptions } = options;

    // Start performance transaction
    const transactionId = logger.startTransaction(`api_${method}_${url}`, 'api_call', {
      component: 'APIInterceptor',
      action: 'api_request',
      metadata: {
        requestId,
        method,
        url: typeof url === 'string' ? url : url.toString(),
      },
    });

    try {
      // Log request start
      logger.addBreadcrumb('api', `Starting ${method} request to ${url}`, 'info');

      const controller = new AbortController();
      const timeout = customTimeout; // Use extracted timeout value
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        logger.warn(`API request timeout: ${method} ${url}`, {
          component: 'APIInterceptor',
          action: 'api_timeout',
          metadata: {
            requestId,
            method,
            url: typeof url === 'string' ? url : url.toString(),
            timeout,
          },
        });
      }, timeout);

      const response = await fetch(typeof url === 'string' ? url : url.toString(), {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;

      // Track metrics
      this.totalResponseTime += duration;
      const averageResponseTime = this.totalResponseTime / this.requestCount;

      // Record API call in breadcrumb tracker
      recordAPICall(method, url, response.status, duration);

      // Log response
      logger.timeApiCall(method, url, duration, response.status);

      // Add response breadcrumb
      const responseMessage = `${method} ${url} - ${response.status} (${duration.toFixed(2)}ms)`;
      logger.addBreadcrumb(
        'api_response',
        responseMessage,
        response.ok ? 'info' : 'error'
      );

      // Log slow responses
      if (duration > 5000) { // 5 seconds
        logger.warn(`Very slow API response: ${method} ${url} took ${duration.toFixed(2)}ms`, undefined, {
          component: 'APIInterceptor',
          action: 'very_slow_response',
          metadata: {
            requestId,
            method,
            url,
            duration,
            averageResponseTime,
            status: response.status,
          },
        });
      }

      // Check for server errors
      if (!response.ok) {
        this.errorCount++;
        const errorRate = (this.errorCount / this.requestCount) * 100;
        
        logger.error(`API request failed: ${method} ${url}`, new Error(`HTTP ${response.status}: ${response.statusText}`), {
          component: 'APIInterceptor',
          action: 'api_error',
          metadata: {
            requestId,
            method,
            url,
            status: response.status,
            statusText: response.statusText,
            duration,
            errorCount: this.errorCount,
            requestCount: this.requestCount,
            errorRate: `${errorRate.toFixed(2)}%`,
          },
        });
      }

      // Add performance metrics to response
      (response as any)._apiMetrics = {
        requestId,
        duration,
        timestamp: Date.now(),
        averageResponseTime,
      };

      logger.finishTransaction(transactionId, {
        metadata: {
          requestId,
          duration,
          status: response.status,
          success: response.ok,
        },
      });

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.errorCount++;

      // Record failed API call
      recordAPICall(method, url, undefined, duration);

      // Enhanced error logging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('network');
      
      logger.error(`API request failed: ${method} ${url}`, error, {
        component: 'APIInterceptor',
        action: 'api_fetch_error',
        metadata: {
          requestId,
          method,
          url,
          duration,
          errorCount: this.errorCount,
          requestCount: this.requestCount,
          isNetworkError,
          timeout: options.timeout,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown',
        },
      });

      logger.finishTransaction(transactionId, {
        metadata: {
          requestId,
          duration,
          success: false,
          error: errorMessage,
        },
      });

      throw error;
    }
  }

  /**
   * Retry logic for failed requests
   */
  async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.fetch(url, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          
          logger.info(`API request retry ${attempt}/${retries} for ${url}`, {
            component: 'APIInterceptor',
            action: 'api_retry',
            metadata: {
              attempt,
              retries,
              delay,
              url,
              error: lastError.message,
            },
          });

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError || new Error('API request failed after all retries');
  }

  /**
   * Get API performance statistics
   */
  getStats() {
    const averageResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      successRate: Math.round((1 - errorRate / 100) * 100 * 100) / 100,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(url: string = '/api/health'): Promise<boolean> {
    try {
      const response = await this.fetch(url, { 
        method: 'GET',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      logger.warn('Health check failed', error, {
        component: 'APIInterceptor',
        action: 'health_check_failed',
        metadata: { url }
      });
      return false;
    }
  }
}

// Create global API interceptor instance
export const apiInterceptor = new APIInterceptor();

// Wrap native fetch
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Skip interception for certain URLs (like Sentry itself)
  const url = input instanceof Request ? input.url : input.toString();
  if (url.includes('sentry.io') || url.includes('localhost:3000')) {
    return originalFetch(input, init);
  }
  
  return apiInterceptor.fetch(input, init);
};

// Export convenience functions
export const fetchWithRetry = (url: string, options?: RequestInit, retries?: number) =>
  apiInterceptor.fetchWithRetry(url, options, retries);

export const getAPIStats = () => apiInterceptor.getStats();
export const resetAPIStats = () => apiInterceptor.resetStats();
export const healthCheck = (url?: string) => apiInterceptor.healthCheck(url);

export default apiInterceptor;