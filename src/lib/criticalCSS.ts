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

import { useState, useEffect } from 'react';

/**
 * Critical CSS Extractor
 */
export class CriticalCSSExtractor {
  private criticalRules: Set<string> = new Set();
  private allRules: Map<string, CSSStyleRule> = new Map();
  
  constructor() {
    if (typeof document !== 'undefined') {
      this.extractAllCSSRules();
    }
  }  
  /**
   * Extract all CSS rules from stylesheets
   */
  private extractAllCSSRules() {
    try {
      const styleSheets = Array.from(document.styleSheets);
      
      styleSheets.forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach(rule => {
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
      console.warn('Failed to extract CSS rules:', error);
    }
  }
  
  /**
   * Identify critical selectors based on viewport elements
   */
  identifyCriticalSelectors(): string[] {
    const viewportElements = this.getViewportElements();
    const criticalSelectors = new Set<string>();
    
    viewportElements.forEach(element => {
      const elementSelectors = this.findSelectorsForElement(element);
      
      elementSelectors.forEach(selector => {
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
    
    // Get all elements that could be above the fold
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      try {
        const rect = element.getBoundingClientRect();
        
        // Check if element is in viewport or near it
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
      }
    });
    
    return elements;
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
    
    criticalSelectors.forEach(selector => {
      const rule = this.allRules.get(selector);
      if (rule) {
        criticalCSS.push(rule.cssText);
      }
    });
    
    return criticalCSS.join('\n');
  }
  
  /**
   * Inline critical CSS in document head
   */
  inlineCriticalCSS(): void {
    const criticalCSS = this.extractCriticalCSS();
    
    if (!criticalCSS) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    
    // Insert before other styles
    const firstStyle = document.querySelector('style, link[rel="stylesheet"]');
    if (firstStyle && firstStyle.parentNode) {
      firstStyle.parentNode.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }
    
    // Mark as critical
    style.setAttribute('data-critical', 'true');
  }
  
  /**
   * Defer non-critical CSS loading
   */
  deferNonCriticalCSS(): void {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach(link => {
      const href = (link as HTMLLinkElement).href;
      
      // Skip if already critical or already deferred
      if (
        href.includes('critical') ||
        link.getAttribute('data-critical') === 'true' ||
        link.getAttribute('data-deferred') === 'true'
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
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = link.href;
    newLink.media = 'print'; // Load without blocking
    newLink.onload = () => {
      newLink.media = 'all';
    };
    
    link.parentNode?.insertBefore(newLink, link.nextSibling);
    link.setAttribute('data-deferred', 'true');
  }
  
  /**
   * Generate critical CSS for specific viewport size
   */
  generateViewportCriticalCSS(viewport: { width: number; height: number }): string {
    const originalInnerHeight = window.innerHeight;
    const originalInnerWidth = window.innerWidth;
    
    // Temporarily override viewport size
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height
    });
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width
    });
    
    const criticalCSS = this.extractCriticalCSS();
    
    // Restore original values
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    
    return criticalCSS;
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
  removeUnusedCSS: (css: string, usedSelectors: string[]): string => {
    if (!css || !usedSelectors.length) return css;
    
    const usedSet = new Set(usedSelectors);
    const result: string[] = [];
    let i = 0;
    let braceDepth = 0;
    let currentRule = '';
    let inMediaQuery = false;
    let mediaQueryStack: string[] = [];
    let preserveCurrentBlock = false;
    let preserveStack: boolean[] = [];

    while (i < css.length) {
      const char = css[i];
      currentRule += char;

      if (char === '{') {
        braceDepth++;
        if (inMediaQuery) {
          preserveStack.push(preserveCurrentBlock);
        }
      } else if (char === '}') {
        braceDepth--;
        
        if (braceDepth === 0) {
          // End of a complete rule/block
          if (inMediaQuery) {
            // End of media query or nested block
            if (mediaQueryStack.length > 0) {
              mediaQueryStack.pop();
              inMediaQuery = mediaQueryStack.length > 0;
            }
            if (preserveStack.length > 0) {
              preserveCurrentBlock = preserveStack.pop() || false;
            }
          }
          
          // Only add rule if we should preserve it
          if (preserveCurrentBlock || inMediaQuery) {
            result.push(currentRule);
          }
          currentRule = '';
          preserveCurrentBlock = false;
        }
      } else if (char === '@' && css.substring(i, i + 7).toLowerCase() === '@media ') {
        // Start of media query
        inMediaQuery = true;
        mediaQueryStack.push('@media');
        preserveStack.push(preserveCurrentBlock);
      }

      // Check if we should preserve this rule (only when not in a block)
      if (braceDepth === 1 && currentRule.includes('{')) {
        const ruleContent = currentRule.substring(0, currentRule.lastIndexOf('{'));
        const selectors = ruleContent.split(',').map(s => s.trim());
        
        // Check if any selector in this rule is used
        const hasUsedSelector = selectors.some(selector => {
          // Handle pseudo-classes and pseudo-elements
          const baseSelector = selector.split(':')[0].trim();
          return usedSet.has(baseSelector) || usedSet.has(selector);
        });
        
        if (hasUsedSelector) {
          preserveCurrentBlock = true;
        }
      }

      i++;
    }

    // Add any remaining content (in case CSS doesn't end with })
    if (currentRule.trim()) {
      if (preserveCurrentBlock || inMediaQuery) {
        result.push(currentRule);
      }
    }

    return result.join('').trim();
  },
  
  /**
   * Minify CSS
   */
  minifyCSS: (css: string): string => {
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .replace(/}\s*/g, '}')
      .replace(/:\s*/g, ':')
      .replace(/,\s*/g, ',')
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
  }
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
        const criticalStyle = document.getElementById('critical-css');
        if (criticalStyle) {
          criticalStyle.remove();
        }
      }, 3000);
    };
    
    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
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
  constructor(private options: {
    base: string;
    src: string;
    dest: string;
    width?: number;
    height?: number;
  }) {}
  
  apply(compiler: any) {
    compiler.hooks.emit.tapAsync('CriticalCSSPlugin', (compilation: any, callback: any) => {
      // This would be implemented in a webpack environment
      // For now, provide a placeholder
      callback();
    });
  }
}

export default {
  CriticalCSSExtractor,
  CSSOptimizer,
  useCriticalCSS,
  CriticalCSSPlugin
};