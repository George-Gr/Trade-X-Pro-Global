import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";
import * as React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";
import { initializeSentry } from "./lib/logger";

// Import polyfills to fix navigator global errors and other Node.js compatibility issues
import './polyfills';

// Initialize Sentry for error tracking and performance monitoring
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Performance monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    profilesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0.0,
    replaysOnErrorSampleRate: 1.0,
    
    // Custom performance monitoring
    beforeSendTransaction(event) {
      // Add custom tags for performance analysis
      if (event.contexts?.trace) {
        event.tags = {
          ...event.tags,
          component: 'frontend',
          app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
        };
      }
      return event;
    },
    
    // Before sending events
    beforeSend(event, hint) {
      // Add custom context
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'TradeX Pro',
          version: import.meta.env.VITE_APP_VERSION || 'unknown',
          build_time: import.meta.env.VITE_BUILD_TIME || 'unknown',
        },
      };
      return event;
    },
  });
  
  initializeSentry();
}

const SentryApp = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError, eventId }) => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6 bg-card rounded-lg shadow-lg border border-border">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full mb-4">
          <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.75-2.5L13.75 4c-.753-.833-1.847-.833-2.5 0L4.25 18.5c-.75 1.833.212 2.5 1.75 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground text-center mb-2">Application Error</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          We're sorry, but something went wrong. Our team has been notified.
        </p>
        <div className="space-y-3">
          <button 
            onClick={resetError}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 transition-colors"
          >
            Go Home
          </button>
        </div>
        {eventId && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Error ID: {eventId}
          </p>
        )}
      </div>
    </div>
  ),
  onError(error, errorInfo) {
    console.error('Sentry Error Boundary caught an error:', error, errorInfo);
  },
});

const root = createRoot(document.getElementById("root")!);

root.render(
  <ThemeProvider>
    <SentryApp />
  </ThemeProvider>
);
