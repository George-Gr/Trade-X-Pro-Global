import React from "react";
import { useAccessibilityPreferences } from "../../hooks/useAccessibilityPreferences";

const cn = (...classes: (string | undefined | false)[]): string =>
  classes.filter(Boolean).join(" ");

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeFonts: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";
  focusIndicatorEnhanced: boolean;
  keyboardNavigationOptimized: boolean;
  voiceControlOptimized: boolean;
}

interface ColorBlindPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export class WCAGAAAEnhancer {
  private static instance: WCAGAAAEnhancer;
  private preferences: AccessibilityPreferences = {
    highContrast: false,
    largeFonts: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    colorBlindMode: "none",
    focusIndicatorEnhanced: false,
    keyboardNavigationOptimized: false,
    voiceControlOptimized: false,
  };

  // Bound event handlers for cleanup
  private boundEventHandlers: {
    reducedMotion?: (e: MediaQueryListEvent) => void;
    highContrast?: (e: MediaQueryListEvent) => void;
    keyboard?: (e: KeyboardEvent) => void;
  } = {};
  private colorBlindPalettes: Record<string, ColorBlindPalette> = {
    normal: {
      name: "Normal Vision",
      primary: "#3b82f6",
      secondary: "#6b7280",
      accent: "#8b5cf6",
      background: "#ffffff",
      text: "#111827",
      border: "#d1d5db",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#06b6d4",
    },
    deuteranopia: {
      name: "Deuteranopia (Green-Blind)",
      primary: "#0ea5e9", // Blue instead of green
      secondary: "#64748b",
      accent: "#7c3aed", // Purple
      background: "#ffffff",
      text: "#111827",
      border: "#cbd5e1",
      success: "#3b82f6", // Blue instead of green
      warning: "#ea580c", // Orange
      error: "#dc2626", // Red
      info: "#0891b2", // Cyan
    },
    protanopia: {
      name: "Protanopia (Red-Blind)",
      primary: "#06b6d4", // Cyan instead of red
      secondary: "#6b7280",
      accent: "#8b5cf6",
      background: "#ffffff",
      text: "#111827",
      border: "#d1d5db",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#0ea5e9", // Cyan instead of red
      info: "#06b6d4",
    },
    tritanopia: {
      name: "Tritanopia (Blue-Blind)",
      primary: "#dc2626", // Red
      secondary: "#6b7280",
      accent: "#7c3aed",
      background: "#ffffff",
      text: "#111827",
      border: "#d1d5db",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#16a34a", // Green instead of blue
    },
  };

  static getInstance(): WCAGAAAEnhancer {
    if (!WCAGAAAEnhancer.instance) {
      // Use the private constructor - this is allowed within the class
      WCAGAAAEnhancer.instance = new WCAGAAAEnhancer();
    }
    return WCAGAAAEnhancer.instance;
  }

  private constructor() {
    this.loadPreferences();
    this.detectAccessibilityNeeds();
    this.setupAccessibilityListeners();
  }

  private loadPreferences() {
    try {
      const stored = localStorage.getItem("accessibility_preferences");
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem(
        "accessibility_preferences",
        JSON.stringify(this.preferences),
      );
    } catch (error) {
      // Silently handle localStorage errors
    }
  }

  private detectAccessibilityNeeds() {
    // Detect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.preferences.reducedMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      this.preferences.highContrast = true;
    }

    // Detect color scheme preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.applyDarkMode();
    }

    // Detect system font size preference
    if (window.matchMedia("(prefers-contrast: more)").matches) {
      this.preferences.largeFonts = true;
    }

    this.applyPreferences();
  }

  private setupAccessibilityListeners() {
    // Create bound handlers for cleanup
    this.boundEventHandlers.reducedMotion = (e: MediaQueryListEvent) => {
      this.preferences.reducedMotion = e.matches;
      this.applyPreferences();
    };

    this.boundEventHandlers.highContrast = (e: MediaQueryListEvent) => {
      this.preferences.highContrast = e.matches;
      this.applyPreferences();
    };

    this.boundEventHandlers.keyboard = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        this.preferences.keyboardNavigationOptimized = true;
        this.applyKeyboardOptimizations();
      }
    };

    // Listen for preference changes
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", this.boundEventHandlers.reducedMotion);

    window
      .matchMedia("(prefers-contrast: high)")
      .addEventListener("change", this.boundEventHandlers.highContrast);

    // Listen for keyboard navigation
    document.addEventListener("keydown", this.boundEventHandlers.keyboard);
  }

  public updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreferences();
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Clean up event listeners and dispose of the instance.
   * Call this method during app teardown to prevent memory leaks.
   * After calling dispose(), getInstance() will create a new instance.
   */
  public dispose() {
    // Remove event listeners
    if (this.boundEventHandlers.reducedMotion) {
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .removeEventListener("change", this.boundEventHandlers.reducedMotion);
    }

    if (this.boundEventHandlers.highContrast) {
      window
        .matchMedia("(prefers-contrast: high)")
        .removeEventListener("change", this.boundEventHandlers.highContrast);
    }

    if (this.boundEventHandlers.keyboard) {
      document.removeEventListener("keydown", this.boundEventHandlers.keyboard);
    }

    // Clear references
    this.boundEventHandlers.reducedMotion = undefined;
    this.boundEventHandlers.highContrast = undefined;
    this.boundEventHandlers.keyboard = undefined;

    // Reset singleton instance
    WCAGAAAEnhancer.instance = null as unknown as WCAGAAAEnhancer;
  }

  public getCurrentColorPalette(): ColorBlindPalette {
    return (
      this.colorBlindPalettes[this.preferences.colorBlindMode] ||
      this.colorBlindPalettes.normal
    );
  }

  private applyPreferences() {
    const root = document.documentElement;
    const palette = this.getCurrentColorPalette();

    // Apply color palette
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-accent", palette.accent);
    root.style.setProperty("--color-background", palette.background);
    root.style.setProperty("--color-text", palette.text);
    root.style.setProperty("--color-border", palette.border);
    root.style.setProperty("--color-success", palette.success);
    root.style.setProperty("--color-warning", palette.warning);
    root.style.setProperty("--color-error", palette.error);
    root.style.setProperty("--color-info", palette.info);

    // Apply accessibility classes
    root.classList.toggle(
      "accessibility-high-contrast",
      this.preferences.highContrast,
    );
    root.classList.toggle(
      "accessibility-large-fonts",
      this.preferences.largeFonts,
    );
    root.classList.toggle(
      "accessibility-reduced-motion",
      this.preferences.reducedMotion,
    );
    root.classList.toggle(
      "accessibility-screen-reader",
      this.preferences.screenReaderOptimized,
    );
    root.classList.toggle(
      "accessibility-enhanced-focus",
      this.preferences.focusIndicatorEnhanced,
    );
    root.classList.toggle(
      "accessibility-keyboard-nav",
      this.preferences.keyboardNavigationOptimized,
    );
    root.classList.toggle(
      "accessibility-voice-control",
      this.preferences.voiceControlOptimized,
    );

    // Apply colorblind mode class
    root.setAttribute("data-colorblind-mode", this.preferences.colorBlindMode);

    // Apply font size adjustments
    if (this.preferences.largeFonts) {
      root.style.fontSize = "18px";
    } else {
      root.style.fontSize = "16px";
    }

    // Apply high contrast
    if (this.preferences.highContrast) {
      root.classList.add("high-contrast");
    }

    // Apply reduced motion
    if (this.preferences.reducedMotion) {
      root.classList.add("reduce-motion");
    }

    this.dispatchAccessibilityChangeEvent();
  }

  private applyDarkMode() {
    document.documentElement.classList.add("dark");
  }

  private applyKeyboardOptimizations() {
    // Add keyboard navigation indicators
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElements.forEach((element, index) => {
      (element as HTMLElement).setAttribute(
        "data-keyboard-index",
        index.toString(),
      );
    });
  }

  private dispatchAccessibilityChangeEvent() {
    const event = new CustomEvent("accessibilityPreferenceChanged", {
      detail: { preferences: this.preferences },
    });
    document.dispatchEvent(event);
  }

  // Enhanced focus management
  public createEnhancedFocus(
    element: HTMLElement,
    options?: {
      outlineWidth?: string;
      outlineColor?: string;
      outlineStyle?: string;
      ringWidth?: string;
      ringColor?: string;
    },
  ) {
    const {
      outlineWidth = "3px",
      outlineColor = "#3b82f6",
      outlineStyle = "solid",
      ringWidth = "6px",
      ringColor = "rgba(59, 130, 246, 0.3)",
    } = options || {};

    element.style.outline = `${outlineWidth} ${outlineStyle} ${outlineColor}`;
    element.style.outlineOffset = "2px";

    // Add focus ring
    element.style.boxShadow = `0 0 0 ${ringWidth} ${ringColor}`;

    // Ensure sufficient contrast
    if (this.preferences.highContrast) {
      element.style.outlineColor = "#000000";
      element.style.boxShadow = `0 0 0 ${ringWidth} rgba(0, 0, 0, 0.8)`;
    }
  }

  // Color contrast validation
  public checkColorContrast(
    foreground: string,
    background: string,
  ): {
    ratio: number;
    aa: boolean;
    aaa: boolean;
    suggestions: string[];
  } {
    // Simplified contrast calculation
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    const ratio =
      (Math.max(fgLuminance, bgLuminance) + 0.05) /
      (Math.min(fgLuminance, bgLuminance) + 0.05);

    const suggestions: string[] = [];

    if (ratio < 4.5) {
      suggestions.push(
        "Increase contrast ratio to at least 4.5:1 for normal text",
      );
      if (this.preferences.colorBlindMode !== "none") {
        suggestions.push(
          "Consider using patterns or icons in addition to color",
        );
      }
    }

    if (ratio < 7) {
      suggestions.push(
        "Increase contrast ratio to at least 7:1 for enhanced accessibility",
      );
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      suggestions,
    };
  }

  private getLuminance(color: string): number {
    // Simplified luminance calculation for hex colors
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Screen reader optimization
  public optimizeForScreenReader(
    element: HTMLElement,
    content: {
      label?: string;
      description?: string;
      state?: string;
      role?: string;
      live?: "polite" | "assertive";
    },
  ) {
    if (content.label) {
      element.setAttribute("aria-label", content.label);
    }

    if (content.description) {
      const descId = `sr-desc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const descElement = document.createElement("span");
      descElement.id = descId;
      descElement.textContent = content.description;
      descElement.classList.add("sr-only");
      element.appendChild(descElement);
      element.setAttribute("aria-describedby", descId);
    }

    if (content.state) {
      element.setAttribute("aria-live", content.live || "polite");
    }

    if (content.role) {
      element.setAttribute("role", content.role);
    }
  }

  // Voice control optimization
  public optimizeForVoiceControl(element: HTMLElement, commands: string[]) {
    element.setAttribute("data-voice-commands", commands.join(", "));

    // Add semantic attributes for better voice recognition
    if (commands.length > 0) {
      const existingRole = element.getAttribute("role");
      const existingAriaLabel = element.getAttribute("aria-label");
      const tagName = element.tagName.toLowerCase();
      const hasHref = tagName === "a" && element.hasAttribute("href");
      const isInteractive =
        tagName === "input" ||
        tagName === "button" ||
        tagName === "select" ||
        tagName === "textarea" ||
        element.contentEditable === "true";

      if (!existingAriaLabel) {
        element.setAttribute("aria-label", commands[0]);
      } else {
        element.setAttribute(
          "aria-label",
          `${existingAriaLabel}; ${commands[0]}`,
        );
      }

      if (!existingRole && !hasHref && !isInteractive) {
        element.setAttribute("role", "button");
      }
    }
  }

  // Generate accessibility report
  public generateAccessibilityReport(): {
    score: number;
    issues: Array<{
      severity: "error" | "warning" | "info";
      message: string;
      element?: string;
    }>;
    recommendations: string[];
    compliance: {
      wcagAA: boolean;
      wcagAAA: boolean;
      section508: boolean;
    };
  } {
    const issues: Array<{
      severity: "error" | "warning" | "info";
      message: string;
      element?: string;
    }> = [];
    let score = 100;

    // Check for missing alt text
    const images = document.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.getAttribute("alt")) {
        issues.push({
          severity: "error",
          message: "Image missing alt text",
          element: `img:nth-child(${index + 1})`,
        });
        score -= 5;
      }
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]), textarea, select',
    );
    inputs.forEach((input, index) => {
      const hasLabel =
        input.getAttribute("aria-label") ||
        input.getAttribute("aria-labelledby") ||
        document.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        issues.push({
          severity: "error",
          message: "Form control missing label",
          element: `input:nth-child(${index + 1})`,
        });
        score -= 3;
      }
    });

    // Check heading structure
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          severity: "warning",
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          element: heading.tagName.toLowerCase(),
        });
        score -= 2;
      }
      previousLevel = level;
    });

    // Check color contrast
    const elementsWithBackground = document.querySelectorAll(
      '[style*="background"], [style*="background-color"]',
    );
    elementsWithBackground.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const contrast = this.checkColorContrast(
        style.color,
        style.backgroundColor,
      );

      if (!contrast.aa) {
        issues.push({
          severity: "error",
          message: `Insufficient color contrast: ${contrast.ratio}:1 (needs 4.5:1)`,
          element: `element:nth-child(${index + 1})`,
        });
        score -= 4;
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (score < 90) {
      recommendations.push("Implement comprehensive accessibility testing");
      recommendations.push("Add automated accessibility checks to CI/CD");
      recommendations.push("Conduct manual testing with screen readers");
      recommendations.push(
        "Review color contrast ratios across all components",
      );
    }

    if (issues.some((i) => i.severity === "error")) {
      recommendations.push("Address critical accessibility errors immediately");
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      compliance: {
        wcagAA: score >= 90,
        wcagAAA: score >= 95,
        section508: score >= 90,
      },
    };
  }
}

/**
 * Accessibility Settings Panel Component
 *
 * Provides a user interface for configuring accessibility preferences including
 * high contrast, large fonts, reduced motion, and color vision modes.
 *
 * @param className - Optional CSS class name for styling the panel
 */
interface AccessibilitySettingsPanelProps {
  className?: string;
}

export const AccessibilitySettingsPanel: React.FC<
  AccessibilitySettingsPanelProps
> = ({ className }) => {
  const { preferences, updatePreference } = useAccessibilityPreferences();

  return (
    <div className={cn("accessibility-settings", className)}>
      <h2 className="text-lg font-semibold mb-4">Accessibility Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast">High Contrast</label>
          <input
            id="high-contrast"
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => updatePreference("highContrast", e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="large-fonts">Large Fonts</label>
          <input
            id="large-fonts"
            type="checkbox"
            checked={preferences.largeFonts}
            onChange={(e) => updatePreference("largeFonts", e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="reduced-motion">Reduced Motion</label>
          <input
            id="reduced-motion"
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) =>
              updatePreference("reducedMotion", e.target.checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="enhanced-focus">Enhanced Focus Indicators</label>
          <input
            id="enhanced-focus"
            type="checkbox"
            checked={preferences.focusIndicatorEnhanced}
            onChange={(e) =>
              updatePreference("focusIndicatorEnhanced", e.target.checked)
            }
          />
        </div>

        <div>
          <label htmlFor="colorblind-mode">Color Vision Mode</label>
          <select
            id="colorblind-mode"
            value={preferences.colorBlindMode}
            onChange={(e) =>
              updatePreference(
                "colorBlindMode",
                e.target.value as AccessibilityPreferences["colorBlindMode"],
              )
            }
            className="mt-1 block w-full"
          >
            <option value="none">Normal Vision</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
            <option value="protanopia">Protanopia (Red-Blind)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
