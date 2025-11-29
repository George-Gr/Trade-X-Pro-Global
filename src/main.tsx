import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";
import { initializeSentry } from "./lib/logger";

// Initialize Sentry for error tracking and performance monitoring
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  initializeSentry();
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
