import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./App.tsx";
import "./index.css";
import { initializeSentry } from "./lib/logger";

// Initialize Sentry for error tracking and performance monitoring
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing({
        // Sample 100% of transactions for dev, 20% for prod (adjust as needed)
        tracingOrigins: ["localhost", /^\//],
        // routingInstrumentation for react-router v6 is optional. The project previously
        // referenced `Sentry.reactRouterV6Instrumentation` which can be unavailable
        // in some @sentry/react package builds and caused a bundler warning. Omitting
        // routingInstrumentation avoids the warning while preserving BrowserTracing.
      }),
    ],
    // Capture 100% of errors in development, 10% of transactions in production
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    // Capture all errors
    attachStacktrace: true,
    // Enable breadcrumbs (tracks user interactions)
    maxBreadcrumbs: 50,
    // Release tracking (useful for correlating errors with deploys)
    release: import.meta.env.VITE_APP_VERSION || "unknown",
  });
  // Notify logger that Sentry has been initialized so it can route logs
  initializeSentry();
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Application Error</h1>
        <p>{error?.message || "An unexpected error occurred"}</p>
        <button onClick={resetError}>Reset Error</button>
      </div>
    )}
    showDialog
  >
    <App />
  </Sentry.ErrorBoundary>
);
