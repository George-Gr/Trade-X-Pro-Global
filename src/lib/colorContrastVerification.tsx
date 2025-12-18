import { useEffect, useState, useCallback } from "react";

interface AccessibilityTest {
  id: string;
  passed: boolean;
  message: string;
}

/**
 * Color Contrast Verification System for TradeX Pro
 *
 * Automated color contrast checking, WCAG compliance verification,
 * color-blind friendly mode, and visual accessibility preferences.
 */

interface ContrastResult {
  ratio: number;
  wcag: "fail" | "aa" | "aaa";
  text: string;
  background: string;
  element: HTMLElement;
}

interface ColorBlindMode {
  type: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
  intensity: number;
}

export function useColorContrastVerification() {
  const [contrastResults, setContrastResults] = useState<ContrastResult[]>([]);
  const [complianceReport, setComplianceReport] = useState<{
    total: number;
    passing: number;
    failing: number;
    aaCompliance: number;
    aaaCompliance: number;
  }>({
    total: 0,
    passing: 0,
    failing: 0,
    aaCompliance: 0,
    aaaCompliance: 0,
  });

  // Color severity constants
  const SEVERITY_COLORS = {
    aaa: "hsl(var(--success))",
    aa: "hsl(var(--warning))",
    fail: "hsl(var(--destructive))",
  } as const;

  // Color conversion utilities
  const hexToRgb = useCallback(
    (hex: string): { r: number; g: number; b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    },
    [],
  );
  const rgbToHex = useCallback((rgb: string): string | null => {
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return null;

    return (
      "#" +
      result
        .slice(0, 3)
        .map((x) => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }, []);

  const getLuminance = useCallback(
    (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },
    [],
  );

  const getContrastRatio = useCallback(
    (color1: string, color2: string): number => {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);

      if (!rgb1 || !rgb2) return 0;

      const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
      const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);

      return (brightest + 0.05) / (darkest + 0.05);
    },
    [hexToRgb, getLuminance],
  );

  const getContrastLevel = useCallback(
    (
      ratio: number,
      fontSize: "normal" | "large" = "normal",
    ): "fail" | "aa" | "aaa" => {
      if (fontSize === "large") {
        // Large text (18pt+ or 14pt+ bold)
        if (ratio >= 7) return "aaa";
        if (ratio >= 3) return "aa";
      } else {
        // Normal text
        if (ratio >= 7) return "aaa";
        if (ratio >= 4.5) return "aa";
      }
      return "fail";
    },
    [],
  );

  // Check element contrast
  const checkElementContrast = useCallback(
    (element: HTMLElement): ContrastResult | null => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Skip if element is hidden
      if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden"
      ) {
        return null;
      }

      // Skip if element has no text content
      const textContent = element.textContent?.trim();
      if (!textContent || textContent.length === 0) {
        return null;
      }

      // Convert RGB to HEX
      const colorHex = rgbToHex(color);
      const bgHex = rgbToHex(backgroundColor);

      if (!colorHex || !bgHex) return null;

      const ratio = getContrastRatio(colorHex, bgHex);
      const wcag = getContrastLevel(
        ratio,
        element.tagName === "H1" || element.tagName === "H2"
          ? "large"
          : "normal",
      );

      return {
        ratio,
        wcag,
        text: colorHex,
        background: bgHex,
        element,
      };
    },
    [rgbToHex, getContrastRatio, getContrastLevel],
  );

  // Comprehensive page contrast check
  const checkPageContrast = useCallback(() => {
    const textElements = document.querySelectorAll(`
      p, h1, h2, h3, h4, h5, h6, span, div, a, button, 
      label, input, textarea, select, .text-content, .card-content
    `);

    const results: ContrastResult[] = [];

    textElements.forEach((element) => {
      const result = checkElementContrast(element as HTMLElement);
      if (result) {
        results.push(result);
      }
    });

    setContrastResults(results);

    // Generate compliance report
    const total = results.length;
    const passing = results.filter((r) => r.wcag !== "fail").length;
    const failing = total - passing;
    const aaCompliance =
      (results.filter((r) => r.wcag === "aa" || r.wcag === "aaa").length /
        Math.max(total, 1)) *
      100;
    const aaaCompliance =
      (results.filter((r) => r.wcag === "aaa").length / Math.max(total, 1)) *
      100;

    setComplianceReport({
      total,
      passing,
      failing,
      aaCompliance,
      aaaCompliance,
    });

    return results;
  }, [checkElementContrast]);

  // Auto-check on page load and changes
  useEffect(() => {
    const runInitialCheck = () => {
      // Wait for page to fully load
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkPageContrast);
      } else {
        checkPageContrast();
      }
    };

    runInitialCheck();

    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      // Check if text content changed
      const textChanged = mutations.some(
        (mutation) =>
          mutation.type === "childList" || mutation.type === "characterData",
      );

      if (textChanged) {
        // Debounced check
        setTimeout(checkPageContrast, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [checkPageContrast]);

  // Get elements by contrast level
  const getElementsByContrastLevel = useCallback(
    (level: "fail" | "aa" | "aaa") => {
      return contrastResults.filter((result) => result.wcag === level);
    },
    [contrastResults],
  );

  // Highlight failing elements
  const highlightFailingElements = useCallback(
    (shouldHighlight: boolean) => {
      const failingElements = getElementsByContrastLevel("fail");

      failingElements.forEach(({ element }) => {
        if (shouldHighlight) {
          element.style.outline = "3px solid hsl(var(--destructive))";
          element.style.outlineOffset = "2px";
        } else {
          element.style.outline = "";
          element.style.outlineOffset = "";
        }
      });
    },
    [getElementsByContrastLevel],
  );

  const getSeverityColor = useCallback((wcag: "fail" | "aa" | "aaa") => {
    return SEVERITY_COLORS[wcag];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    contrastResults,
    complianceReport,
    checkPageContrast,
    getContrastRatio,
    getContrastLevel,
    getElementsByContrastLevel,
    highlightFailingElements,
    getSeverityColor,
  };
}

/**
 * Color-Blind Friendly Mode
 */
export function useColorBlindMode() {
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>({
    type: "none",
    intensity: 1,
  });

  useEffect(() => {
    const root = document.documentElement;

    if (colorBlindMode.type === "none") {
      root.style.filter = "";
      return;
    }

    let filter = "";

    switch (colorBlindMode.type) {
      case "protanopia":
        filter = `url(#protanopia-filter)`;
        break;
      case "deuteranopia":
        filter = `url(#deuteranopia-filter)`;
        break;
      case "tritanopia":
        filter = `url(#tritanopia-filter)`;
        break;
      case "achromatopsia":
        filter = `grayscale(1)`;
        break;
    }

    root.style.filter = filter;
  }, [colorBlindMode]);

  const applyColorBlindSimulation = useCallback((mode: ColorBlindMode) => {
    setColorBlindMode(mode);
  }, []);

  const resetColorBlindMode = useCallback(() => {
    setColorBlindMode({ type: "none", intensity: 1 });
  }, []);

  return {
    colorBlindMode,
    applyColorBlindSimulation,
    resetColorBlindMode,
    availableModes: [
      { type: "none", name: "Normal Vision" },
      { type: "protanopia", name: "Red-Green (Protanopia)" },
      { type: "deuteranopia", name: "Red-Green (Deuteranopia)" },
      { type: "tritanopia", name: "Blue-Yellow (Tritanopia)" },
      { type: "achromatopsia", name: "Complete Color Blindness" },
    ] as const,
  };
}

/**
 * Visual Accessibility Preferences
 */
export function useVisualAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    reduceMotion: false,
    largerText: false,
    focusIndicator: true,
    readingGuide: false,
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add("high-contrast-mode");
    } else {
      root.classList.remove("high-contrast-mode");
    }

    // Apply reduced motion
    if (preferences.reduceMotion) {
      root.style.setProperty("--animation-duration", "0ms");
    } else {
      root.style.removeProperty("--animation-duration");
    }

    // Apply larger text
    root.style.fontSize = preferences.largerText ? "1.125rem" : "1rem";

    // Apply focus indicator
    if (preferences.focusIndicator) {
      root.classList.add("focus-indicators");
    } else {
      root.classList.remove("focus-indicators");
    }

    // Apply reading guide
    if (preferences.readingGuide) {
      root.classList.add("reading-guide-mode");
    } else {
      root.classList.remove("reading-guide-mode");
    }
  }, [preferences]);

  const updatePreference = useCallback(
    <K extends keyof typeof preferences>(
      key: K,
      value: (typeof preferences)[K],
    ) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return {
    preferences,
    updatePreference,
  };
}

/**
 * High Contrast CSS-in-JS
 */
export const highContrastStyles = `
  .high-contrast-mode {
    filter: contrast(1.5) brightness(1.1);
  }
  
  .high-contrast-mode * {
    background: hsl(var(--background)) !important;
    color: hsl(var(--foreground)) !important;
    border-color: hsl(var(--foreground)) !important;
  }
  
  .high-contrast-mode .bg-primary {
    background: hsl(var(--info)) !important;
    color: hsl(var(--foreground)) !important;
  }
  
  .high-contrast-mode .bg-secondary {
    background: hsl(var(--destructive)) !important;
    color: hsl(var(--foreground)) !important;
  }
  
  .high-contrast-mode .text-primary {
    color: hsl(var(--info)) !important;
  }
  
  .high-contrast-mode .text-secondary {
    color: hsl(var(--destructive)) !important;
  }
  
  .focus-indicators *:focus {
    outline: 3px solid hsl(var(--warning)) !important;
    outline-offset: 2px !important;
  }
`;

/**
 * Screen Reader Testing Hook
 */
export function useAccessibilityTesting() {
  const [headings, setHeadings] = useState<HTMLHeadingElement[]>([]);
  const [liveRegions, setLiveRegions] = useState<HTMLElement[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [tests, setTests] = useState<AccessibilityTest[]>([]);

  useEffect(() => {
    // Check heading hierarchy
    const headingElements = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    );
    setHeadings(headingElements as HTMLHeadingElement[]);

    // Check for proper heading hierarchy
    let hierarchyValid = true;
    let lastLevel = 0;

    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        hierarchyValid = false;
      }
      lastLevel = level;
    });

    setIsValid(hierarchyValid);

    // Find live regions
    const liveRegionElements = Array.from(
      document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'),
    );
    setLiveRegions(liveRegionElements as HTMLElement[]);

    // Run tests
    const newTests = [
      {
        id: "heading-hierarchy",
        passed: hierarchyValid,
        message: hierarchyValid
          ? "Heading hierarchy is valid"
          : "Heading hierarchy has issues",
      },
      {
        id: "live-regions",
        passed: liveRegionElements.length > 0,
        message: `Found ${liveRegionElements.length} live regions`,
      },
      {
        id: "semantic-structure",
        passed: headingElements.length > 0,
        message: `Found ${headingElements.length} semantic headings`,
      },
    ];
    setTests(newTests);
  }, []);

  const getHeadingStats = useCallback(() => {
    const stats: { [key: string]: number } = {};
    headings.forEach((heading) => {
      const level = heading.tagName.toLowerCase();
      stats[level] = (stats[level] || 0) + 1;
    });
    return stats;
  }, [headings]);

  const runFullAudit = useCallback(() => {
    // Run all accessibility tests
    const headingStats = getHeadingStats();
    const totalHeadings = Object.values(headingStats).reduce(
      (sum, count) => sum + count,
      0,
    );

    const score = Math.min(
      100,
      Math.round(
        (tests.filter((t) => t.passed).length / tests.length) * 50 +
          (totalHeadings > 0 ? 25 : 0) +
          (liveRegions.length > 0 ? 25 : 0),
      ),
    );

    return {
      overallScore: score,
      headingStats,
      liveRegionsCount: liveRegions.length,
      testsPassed: tests.filter((t) => t.passed).length,
      testsTotal: tests.length,
    };
  }, [getHeadingStats, tests, liveRegions]);

  return {
    headings,
    liveRegions,
    isValid,
    tests,
    getHeadingStats,
    runFullAudit,
  };
}

export default {
  useColorContrastVerification,
  useColorBlindMode,
  useVisualAccessibilityPreferences,
  useAccessibilityTesting,
  highContrastStyles,
};
