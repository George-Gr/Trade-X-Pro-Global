// Browser-facing Supabase client wrapper
// Avoids hard failure if environment variables are not injected at runtime
import type { Database } from '@/integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';

// Environment variables are required for security
const SUPABASE_URL = ((import.meta as unknown as Record<string, unknown>).env as Record<string, unknown>)?.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = ((import.meta as unknown as Record<string, unknown>).env as Record<string, unknown>)?.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase environment variables are required: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: window.sessionStorage, // More secure than localStorage
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Prevent session fixation
    flowType: 'pkce', // Proof Key for Code Exchange
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Request-ID': crypto.randomUUID(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
});

// Session timeout management
class SessionTimeoutManager {
  private timeoutId: number | null = null;
  private readonly timeoutMs = 55 * 60 * 1000; // 55 minutes (5 minutes before Supabase timeout)
  private readonly warningMs = 5 * 60 * 1000; // 5 minutes warning

  start() {
    this.clear();
    this.timeoutId = window.setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutMs);
  }

  clear() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  handleTimeout() {
    // Show warning before timeout
    this.showWarning();

    // Auto-logout after warning period
    setTimeout(() => {
      this.performLogout();
    }, this.warningMs);
  }

  showWarning() {
    // Dispatch custom event for components to handle
    window.dispatchEvent(new CustomEvent('session:warning', {
      detail: { message: 'Your session will expire in 5 minutes. Please save your work.' }
    }));
  }

  performLogout() {
    // Clear session storage
    window.sessionStorage.clear();

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('session:expired', {
      detail: { message: 'Your session has expired. Please log in again.' }
    }));
  }
}

// Initialize session timeout manager
const sessionManager = new SessionTimeoutManager();

// Listen for user activity to reset timeout
const resetTimeout = () => {
  sessionManager.start();
};

// Add event listeners for user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
  window.addEventListener(event, resetTimeout, { passive: true });
});

// Start session timeout on initialization
sessionManager.start();