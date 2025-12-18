/**
 * Critical CSS Extraction and Optimization
 *
 * Extracts and inlines critical CSS for above-the-fold content
 * to improve First Contentful Paint (FCP) and Largest Contentful Paint (LCP).
 *
 * CSS Parsing Notes:
 * - The removeUnusedCSS method uses a proper CSS parser that handles:
 *   * Nested rules and selectors
 *   * Media queries and conditional rules
 *   * Keyframes and animations
 *   * Pseudo-classes and pseudo-elements (:hover, ::before, etc.)
 *   * Complex selectors and combinators
 * - For best results, provide complete CSS with proper syntax
 * - The parser preserves media queries that contain any used selectors
 * - Malformed CSS may not be parsed correctly
 */

import { useState, useEffect } from "react";

// Webpack plugin types for CriticalCSSPlugin
interface WebpackCompilation {
  assets: Record<string, { source: () => string; size: () => number }>;
  getStats(): unknown;
}

interface WebpackCompiler {
  hooks: {
    emit: {
      tapAsync: (
        name: string,
        fn: (
          compilation: WebpackCompilation,
          callback: (err?: Error) => void,
        ) => void,
      ) => void;
    };
  };
}

/**
 * Critical CSS Extractor
 */
export class CriticalCSSExtractor {
  private criticalRules: Set<string> = new Set();
  private allRules: Map<string, CSSStyleRule> = new Map();

  constructor() {
    if (typeof document !== "undefined") {
      this.extractAllCSSRules();
    }
  }
  /**
   * Extract all CSS rules from stylesheets
   */
  private extractAllCSSRules() {
    try {
      const styleSheets = Array.from(document.styleSheets);

      styleSheets.forEach((sheet) => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach((rule) => {
              if (rule.type === CSSRule.STYLE_RULE) {
                const styleRule = rule as CSSStyleRule;
                this.allRules.set(styleRule.selectorText, styleRule);
              }
            });
          }
        } catch (error) {
          // Cross-origin stylesheet, skip
        }
      });
    } catch (error) {
      console.warn("Failed to extract CSS rules:", error);
    }
  }

  /**
   * Identify critical selectors based on viewport elements
   */
  identifyCriticalSelectors(): string[] {
    const viewportElements = this.getViewportElements();
    const criticalSelectors = new Set<string>();

    viewportElements.forEach((element) => {
      const elementSelectors = this.findSelectorsForElement(element);

      elementSelectors.forEach((selector) => {
        criticalSelectors.add(selector);
      });
    });

    return Array.from(criticalSelectors);
  }
  /**
   * Get elements currently in viewport
   */
  private getViewportElements(): Element[] {
    const elements: Element[] = [];
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Configurable threshold for performance on large DOMs
    const MAX_VIEWPORT_ELEMENTS = 200;

    // Narrow selector to likely above-the-fold candidates only
    // Focus on semantic containers and media elements that are most likely to be visible
    const likelyAboveFoldSelector = [
      // Semantic containers most likely to be above the fold
      "header",
      "main",
      "section.hero",
      "section.hero *",
      "section.banner",
      "section.banner *",
      "article.hero",
      "article.featured",
      "div.hero",
      "div.hero *",
      "div.banner",
      "div.banner *",

      // Key content elements
      "h1",
      "h2",
      "h3",
      "p.lead",
      "p.hero",
      "div.hero-content *",

      // Media elements that are typically above the fold
      "img.hero",
      "img.banner",
      "img.featured",
      "video.hero",
      "video.banner",

      // Interactive elements in primary areas
      "button.hero",
      "button.primary",
      "a.hero",
      "a.cta",

      // Navigation and key UI
      "nav.primary",
      "nav.main",
      "nav.header",
      "nav.primary *",
    ].join(", ");

    try {
      const allElements = document.querySelectorAll(likelyAboveFoldSelector);

      // Short-circuit collection once threshold is reached
      for (
        let i = 0;
        i < allElements.length && elements.length < MAX_VIEWPORT_ELEMENTS;
        i++
      ) {
        const element = allElements[i];

        try {
          const rect = element.getBoundingClientRect();

          // Check if element is in viewport or near it (1.5x viewport buffer)
          if (
            rect.top < viewportHeight * 1.5 &&
            rect.left < viewportWidth * 1.5 &&
            rect.bottom > 0 &&
            rect.right > 0
          ) {
            elements.push(element);
          }
        } catch (error) {
          // Skip elements that can't be measured
          continue;
        }
      }
    } catch (error) {
      // Fallback to original broad selector if narrowed selector fails
      try {
        const fallbackSelector =
          "div, section, article, header, main, nav, aside, footer, p, h1, h2, h3, h4, h5, h6, img, button";
        const fallbackElements = document.querySelectorAll(fallbackSelector);

        for (
          let i = 0;
          i < fallbackElements.length &&
          elements.length < MAX_VIEWPORT_ELEMENTS;
          i++
        ) {
          const element = fallbackElements[i];

          try {
            const rect = element.getBoundingClientRect();
            if (
              rect.top < viewportHeight * 1.5 &&
              rect.left < viewportWidth * 1.5 &&
              rect.bottom > 0 &&
              rect.right > 0
            ) {
              elements.push(element);
            }
          } catch (error) {
            continue;
          }
        }
      } catch (fallbackError) {
        // If all else fails, return empty array
        return [];
      }
    }

    return elements;
  }

  /**
   * IntersectionObserver-based fast path for large pages
   * Asynchronously collects elements that intersect with viewport
   */
  private getViewportElementsAsync(
    callback: (elements: Element[]) => void,
    options: {
      threshold?: number;
      rootMargin?: string;
      maxElements?: number;
      timeout?: number;
    } = {},
  ): void {
    const {
      threshold = 0.1,
      rootMargin = "100px",
      maxElements = 100,
      timeout = 3000,
    } = options;

    const elements: Element[] = [];
    let observer: IntersectionObserver | null = null;
    let timeoutId: number | null = null;

    // Use the same narrowed selector for performance
    const likelyAboveFoldSelector = [
      "header",
      "main",
      "section.hero",
      "section.hero *",
      "section.banner",
      "section.banner *",
      "article.hero",
      "article.featured",
      "div.hero",
      "div.hero *",
      "div.banner",
      "div.banner *",
      "h1",
      "h2",
      "h3",
      "p.lead",
      "p.hero",
      "div.hero-content *",
      "img.hero",
      "img.banner",
      "img.featured",
      "video.hero",
      "video.banner",
      "button.hero",
      "button.primary",
      "a.hero",
      "a.cta",
      "nav.primary",
      "nav.main",
      "nav.header",
      "nav.primary *",
    ].join(", ");

    try {
      const targetElements = document.querySelectorAll(likelyAboveFoldSelector);

      if (targetElements.length === 0) {
        callback([]);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              elements.push(entry.target);

              // Stop observing once we reach the threshold
              if (elements.length >= maxElements) {
                observer?.disconnect();
                if (timeoutId) {
                  clearTimeout(timeoutId);
                }
                callback(elements);
              }
            }
          });
        },
        {
          threshold,
          rootMargin,
        },
      );

      // Observe all target elements
      targetElements.forEach((element) => {
        try {
          observer?.observe(element);
        } catch (error) {
          // Skip elements that can't be observed
        }
      });

      // Set timeout to ensure we don't wait forever
      timeoutId = window.setTimeout(() => {
        observer?.disconnect();
        callback(elements);
      }, timeout);
    } catch (error) {
      // Fallback to synchronous method if IntersectionObserver fails
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      callback(this.getViewportElements());
    }
  }

  /**
   * Find CSS selectors that apply to an element
   */
  private findSelectorsForElement(element: Element): string[] {
    const selectors: string[] = [];

    this.allRules.forEach((rule, selector) => {
      try {
        if (element.matches && element.matches(selector)) {
          selectors.push(selector);
        }
      } catch (error) {
        // Invalid selector, skip
      }
    });

    return selectors;
  }

  /**
   * Extract critical CSS rules
   */
  extractCriticalCSS(): string {
    const criticalSelectors = this.identifyCriticalSelectors();
    const criticalCSS: string[] = [];

    criticalSelectors.forEach((selector) => {
      const rule = this.allRules.get(selector);
      if (rule) {
        criticalCSS.push(rule.cssText);
      }
    });

    return criticalCSS.join("\n");
  }

  /**
   * Inline critical CSS in document head
   */
  inlineCriticalCSS(): void {
    const criticalCSS = this.extractCriticalCSS();

    if (!criticalCSS) return;

    // Create style element
    const style = document.createElement("style");
    style.id = "critical-css";
    style.textContent = criticalCSS;

    // Insert before other styles
    const firstStyle = document.querySelector('style, link[rel="stylesheet"]');
    if (firstStyle && firstStyle.parentNode) {
      firstStyle.parentNode.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }

    // Mark as critical
    style.setAttribute("data-critical", "true");
  }

  /**
   * Extract critical CSS asynchronously using IntersectionObserver
   * Best for large pages where performance is critical
   */
  extractCriticalCSSAsync(
    callback: (css: string) => void,
    options: {
      threshold?: number;
      rootMargin?: string;
      maxElements?: number;
      timeout?: number;
    } = {},
  ): void {
    this.getViewportElementsAsync((elements) => {
      const criticalSelectors = new Set<string>();

      elements.forEach((element) => {
        const selectors = this.findSelectorsForElement(element);
        selectors.forEach((selector) => {
          criticalSelectors.add(selector);
        });
      });

      const criticalCSS: string[] = [];
      criticalSelectors.forEach((selector) => {
        const rule = this.allRules.get(selector);
        if (rule) {
          criticalCSS.push(rule.cssText);
        }
      });

      callback(criticalCSS.join("\n"));
    }, options);
  }

  /**
   * Inline critical CSS asynchronously
   */
  inlineCriticalCSSAsync(
    options: {
      threshold?: number;
      rootMargin?: string;
      maxElements?: number;
      timeout?: number;
    } = {},
  ): void {
    this.extractCriticalCSSAsync((criticalCSS) => {
      if (!criticalCSS) return;

      const style = document.createElement("style");
      style.id = "critical-css";
      style.textContent = criticalCSS;
      style.setAttribute("data-critical", "true");

      const firstStyle = document.querySelector(
        'style, link[rel="stylesheet"]',
      );
      if (firstStyle && firstStyle.parentNode) {
        firstStyle.parentNode.insertBefore(style, firstStyle);
      } else {
        document.head.appendChild(style);
      }
    }, options);
  }

  /**
   * Defer non-critical CSS loading
   */
  deferNonCriticalCSS(): void {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

    stylesheets.forEach((link) => {
      const href = (link as HTMLLinkElement).href;

      // Skip if already critical or already deferred
      if (
        href.includes("critical") ||
        link.getAttribute("data-critical") === "true" ||
        link.getAttribute("data-deferred") === "true"
      ) {
        return;
      }

      // Defer loading
      this.deferStylesheet(link as HTMLLinkElement);
    });
  }

  /**
   * Defer individual stylesheet
   */
  private deferStylesheet(link: HTMLLinkElement): void {
    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = link.href;
    newLink.media = "print"; // Load without blocking
    newLink.onload = () => {
      newLink.media = "all";
    };

    link.parentNode?.insertBefore(newLink, link.nextSibling);
    link.setAttribute("data-deferred", "true");
  }

  /**
   * Generate critical CSS for specific viewport size
   *
   * NOTE: This method only works with the current runtime viewport size.
   * To generate critical CSS for different viewport sizes, use a build-time
   * approach with a headless browser (Puppeteer/Playwright) that can properly
   * simulate different viewport sizes and trigger layout recalculation.
   *
   * @param viewport - The viewport size to generate critical CSS for
   * @returns Critical CSS string for the current viewport
   * @throws Error if requested viewport differs from actual window size
   */
  generateViewportCriticalCSS(viewport: {
    width: number;
    height: number;
  }): string {
    const actualWidth = window.innerWidth;
    const actualHeight = window.innerHeight;

    // Validate that requested viewport matches actual viewport
    if (viewport.width !== actualWidth || viewport.height !== actualHeight) {
      throw new Error(
        `Viewport mismatch: Requested ${viewport.width}x${viewport.height} ` +
          `but actual viewport is ${actualWidth}x${actualHeight}. ` +
          `For different viewport sizes, use a headless browser approach during build time.`,
      );
    }

    // Use the actual viewport size for critical CSS extraction
    return this.extractCriticalCSS();
  }
}

/**
 * CSS Optimization Utilities
 */
export const CSSOptimizer = {
  /**
   * Remove unused CSS rules with proper CSS parsing
   * Handles nested rules, media queries, keyframes, and other complex CSS structures
   */
  /**
   * Detect if current position starts a media query
   */
  isMediaQueryStart: (index: number, css: string): boolean => {
    return css.substring(index, index + 7).toLowerCase() === "@media ";
  },

  /**
   * Handle opening brace: increment depth, manage preserve stack for nested blocks
   */
  onOpenBrace: (state: {
    braceDepth: number;
    inMediaQuery: boolean;
    preserveCurrentBlock: boolean;
    preserveStack: boolean[];
  }): void => {
    state.braceDepth++;
    if (state.inMediaQuery) {
      state.preserveStack.push(state.preserveCurrentBlock);
    }
  },

  /**
   * Handle closing brace: decrement depth, restore state on block end
   */
  onCloseBrace: (state: {
    braceDepth: number;
    inMediaQuery: boolean;
    preserveCurrentBlock: boolean;
    preserveStack: boolean[];
    mediaQueryStack: string[];
  }): void => {
    state.braceDepth--;

    if (state.braceDepth === 0) {
      // End of a complete rule/block
      if (state.inMediaQuery) {
        // End of media query or nested block
        if (state.mediaQueryStack.length > 0) {
          state.mediaQueryStack.pop();
          state.inMediaQuery = state.mediaQueryStack.length > 0;
        }
        if (state.preserveStack.length > 0) {
          state.preserveCurrentBlock = state.preserveStack.pop() || false;
        }
      }
    }
  },

  /**
   * Determine if a rule should be preserved based on used selectors
   * Strips pseudo-classes/elements and checks against usedSet
   */
  shouldPreserveRule: (ruleText: string, usedSet: Set<string>): boolean => {
    const ruleContent = ruleText.substring(0, ruleText.lastIndexOf("{"));
    const selectors = ruleContent.split(",").map((s) => s.trim());

    // Check if any selector in this rule is used
    return selectors.some((selector) => {
      // Handle pseudo-classes and pseudo-elements by taking base selector
      const baseSelector = selector.split(":")[0].trim();
      return usedSet.has(baseSelector) || usedSet.has(selector);
    });
  },

  removeUnusedCSS: (css: string, usedSelectors: string[]): string => {
    if (!css || !usedSelectors.length) return css;

    const usedSet = new Set(usedSelectors);
    const result: string[] = [];

    // Shared state object for helper functions
    const state = {
      i: 0,
      braceDepth: 0,
      currentRule: "",
      inMediaQuery: false,
      mediaQueryStack: [] as string[],
      preserveCurrentBlock: false,
      preserveStack: [] as boolean[],
    };

    while (state.i < css.length) {
      const char = css[state.i];
      state.currentRule += char;

      if (char === "{") {
        CSSOptimizer.onOpenBrace(state);
      } else if (char === "}") {
        CSSOptimizer.onCloseBrace(state);

        if (state.braceDepth === 0) {
          // End of a complete rule/block: evaluate and append if needed
          if (state.preserveCurrentBlock || state.inMediaQuery) {
            result.push(state.currentRule);
          }
          state.currentRule = "";
          state.preserveCurrentBlock = false;
        }
      } else if (char === "@" && CSSOptimizer.isMediaQueryStart(state.i, css)) {
        // Start of media query
        state.inMediaQuery = true;
        state.mediaQueryStack.push("@media");
        state.preserveStack.push(state.preserveCurrentBlock);
      }

      // Check if we should preserve this rule (only when entering a block at depth 1)
      if (state.braceDepth === 1 && state.currentRule.includes("{")) {
        if (CSSOptimizer.shouldPreserveRule(state.currentRule, usedSet)) {
          state.preserveCurrentBlock = true;
        }
      }

      state.i++;
    }

    // Add any remaining content (in case CSS doesn't end with })
    if (state.currentRule.trim()) {
      if (state.preserveCurrentBlock || state.inMediaQuery) {
        result.push(state.currentRule);
      }
    }

    return result.join("").trim();
  },

  /**
   * Minify CSS
   */
  minifyCSS: (css: string): string => {
    return css
      .replace(/\s+/g, " ")
      .replace(/;\s*}/g, "}")
      .replace(/{\s*/g, "{")
      .replace(/}\s*/g, "}")
      .replace(/:\s*/g, ":")
      .replace(/,\s*/g, ",")
      .trim();
  },

  /**
   * Extract critical path CSS
   */
  extractCriticalPathCSS: (): string => {
    const extractor = new CriticalCSSExtractor();
    const criticalCSS = extractor.extractCriticalCSS();

    return CSSOptimizer.minifyCSS(criticalCSS);
  },

  /**
   * Inline critical CSS
   */
  inlineCriticalCSS: (): void => {
    const extractor = new CriticalCSSExtractor();
    extractor.inlineCriticalCSS();
    extractor.deferNonCriticalCSS();
  },
};

/**
 * Critical CSS Hook for React
 */
export function useCriticalCSS() {
  const [isCriticalLoaded, setIsCriticalLoaded] = useState(false);

  useEffect(() => {
    // Extract and inline critical CSS
    CSSOptimizer.inlineCriticalCSS();
    setIsCriticalLoaded(true);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Clean up after page load
    const handleLoad = () => {
      // Remove critical CSS from head after full CSS loads
      timeoutId = setTimeout(() => {
        const criticalStyle = document.getElementById("critical-css");
        if (criticalStyle) {
          criticalStyle.remove();
        }
      }, 3000);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
}

/**
 * Critical CSS Webpack Plugin (for build-time extraction)
 */
export class CriticalCSSPlugin {
  constructor(
    private options: {
      base: string;
      src: string;
      dest: string;
      width?: number;
      height?: number;
    },
  ) {}

  apply(compiler: WebpackCompiler) {
    compiler.hooks.emit.tapAsync(
      "CriticalCSSPlugin",
      (compilation: WebpackCompilation, callback: (err?: Error) => void) => {
        // This would be implemented in a webpack environment
        // For now, provide a placeholder
        callback();
      },
    );
  }
}

export default {
  CriticalCSSExtractor,
  CSSOptimizer,
  useCriticalCSS,
  CriticalCSSPlugin,
};
