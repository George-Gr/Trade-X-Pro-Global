/**
 * Accessibility Styles for TradeX Pro
 * 
 * Global CSS-in-JS styles for accessibility features including
 * high contrast, focus indicators, screen reader support, and more.
 */

export const accessibilityStyles = `
  /* High Contrast Mode Styles */
  :root[data-accessibility-high-contrast="true"] {
    --bg-primary: hsl(var(--background));
    --bg-secondary: hsl(var(--muted));
    --text-primary: hsl(var(--foreground));
    --text-secondary: hsl(var(--muted-foreground));
    --border-primary: hsl(var(--border));
    --border-secondary: hsl(var(--border) / 0.5);
    --focus-ring: hsl(var(--ring));
    --success: hsl(var(--success));
    --error: hsl(var(--destructive));
    --warning: hsl(var(--warning));
    --info: hsl(var(--info));
  }

  /* Focus Indicators */
  :focus-visible {
    outline: 3px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  /* Skip Links */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    padding: 8px;
    z-index: 100;
    text-decoration: none;
    border-radius: 4px;
  }

  .skip-link:focus {
    top: 6px;
  }

  /* Screen Reader Only */
  .sr-only {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
    border: 0;
    padding: 0;
    clip-path: inset(50%);
    margin: -1px;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Larger Text Support */
  :root[data-accessibility-larger-text="true"] {
    font-size: 18px;
  }

  html[data-accessibility-larger-text="true"] {
    font-size: 18px;
  }

  /* Color Blind Friendly Styles */
  :root[data-accessibility-color-blind="true"] {
    --color-success: hsl(var(--success));
    --color-error: hsl(var(--destructive));
    --color-warning: hsl(var(--warning));
    --color-info: hsl(var(--status-info));
  }

  /* Improved Button Contrast */
  :root[data-accessibility-high-contrast="true"] button,
  :root[data-accessibility-high-contrast="true"] .btn {
    border: 2px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  /* Form Input Contrast */
  :root[data-accessibility-high-contrast="true"] input,
  :root[data-accessibility-high-contrast="true"] select,
  :root[data-accessibility-high-contrast="true"] textarea {
    border: 2px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  /* Link Contrast */
  :root[data-accessibility-high-contrast="true"] a {
    color: hsl(var(--info));
    text-decoration: underline;
  }

  /* Error States */
  :root[data-accessibility-high-contrast="true"] .error,
  :root[data-accessibility-high-contrast="true"] .has-error {
    border-color: var(--error);
    color: var(--error);
  }

  /* Success States */
  :root[data-accessibility-high-contrast="true"] .success,
  :root[data-accessibility-high-contrast="true"] .has-success {
    border-color: var(--success);
    color: var(--success);
  }

  /* Warning States */
  :root[data-accessibility-high-contrast="true"] .warning,
  :root[data-accessibility-high-contrast="true"] .has-warning {
    border-color: var(--warning);
    color: var(--warning);
  }

  /* Info States */
  :root[data-accessibility-high-contrast="true"] .info,
  :root[data-accessibility-high-contrast="true"] .has-info {
    border-color: hsl(var(--info));
    color: hsl(var(--info));
  }

  /* Trading Specific Accessibility */
  .trading-chart-container {
    position: relative;
  }

  .trading-chart-container::after {
    content: attr(aria-label);
    position: absolute;
    top: 8px;
    right: 8px;
    background: hsl(var(--foreground) / 0.85);
    color: hsl(var(--background));
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    display: none;
  }

  :root[data-accessibility-high-contrast="true"] .trading-chart-container::after {
    display: block;
  }

  /* Order Book Accessibility */
  .order-book-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid var(--border-secondary);
  }

  .order-book-row.buy {
    background: hsl(var(--success) / 0.1);
  }

  .order-book-row.sell {
    background: hsl(var(--destructive) / 0.1);
  }

  :root[data-accessibility-high-contrast="true"] .order-book-row.buy {
    background: hsl(var(--success) / 0.3);
    border: 1px solid hsl(var(--success));
  }

  :root[data-accessibility-high-contrast="true"] .order-book-row.sell {
    background: hsl(var(--destructive) / 0.3);
    border: 1px solid hsl(var(--destructive));
  }

  /* Trading Form Accessibility */
  .trading-form-group {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
  }

  .trading-form-group.error {
    border-color: var(--error);
    box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.2);
  }

  .trading-form-group.success {
    border-color: var(--success);
    box-shadow: 0 0 0 2px hsl(var(--success) / 0.2);
  }

  /* Price Ticker Accessibility */
  .price-ticker {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }

  .price-change.positive {
    color: hsl(var(--success));
  }

  .price-change.negative {
    color: hsl(var(--destructive));
  }

  :root[data-accessibility-high-contrast="true"] .price-change.positive {
    color: var(--success);
    font-weight: bold;
  }

  :root[data-accessibility-high-contrast="true"] .price-change.negative {
    color: var(--error);
    font-weight: bold;
  }

  /* Modal Accessibility */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: hsl(var(--foreground) / 0.5);
    z-index: 1000;
  }

  .modal-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 24px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: auto;
  }

  /* Toast/Notification Accessibility */
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .toast {
    min-width: 300px;
    padding: 16px;
    border-radius: 8px;
    border: 2px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
    box-shadow: 0 4px 12px hsl(var(--foreground) / 0.3);
  }

  .toast.success {
    border-color: var(--success);
    background: hsl(var(--success) / 0.1);
  }

  .toast.error {
    border-color: var(--error);
    background: hsl(var(--destructive) / 0.1);
  }

  .toast.warning {
    border-color: var(--warning);
    background: hsl(var(--warning) / 0.1);
  }

  .toast.info {
    border-color: hsl(var(--info));
    background: hsl(var(--info) / 0.1);
  }

  /* Loading Spinner Accessibility */
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border-secondary);
    border-top-color: hsl(var(--info));
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Reduce motion for loading */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation: none;
    }
  }

  /* Print Styles for Accessibility */
  @media print {
    .no-print {
      display: none !important;
    }
    
    body {
      font-size: 12pt;
      line-height: 1.6;
      color: hsl(var(--foreground));
      background: hsl(var(--background));
    }
    
    a {
      color: hsl(var(--info));
      text-decoration: underline;
    }
    
    .trading-chart-container {
      break-inside: avoid;
    }
  }
`;

export default accessibilityStyles;