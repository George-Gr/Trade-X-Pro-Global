import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";
import { initializeSentry } from "./lib/logger";
import { initializeSentryAdvanced } from "./lib/sentryConfig";
import { pwaManager } from "./lib/pwa";

// Initialize Sentry for error tracking and performance monitoring
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  // Use advanced Sentry configuration
  initializeSentryAdvanced();
  // Notify logger that Sentry has been initialized so it can route logs
  initializeSentry();
}

// Initialize PWA features
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Register service worker for PWA functionality
  pwaManager.registerServiceWorker().catch(console.error);
  
  // Store last connected time
  localStorage.setItem('lastConnected', new Date().toISOString());
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Application Error</h1>
        <p>{(error as Error)?.message || "An unexpected error occurred"}</p>
        <button onClick={resetError}>Reset Error</button>
      </div>
    )}
    showDialog
  >
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Sentry.ErrorBoundary>
);
