import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export interface SemanticHTMLProps {
  children: React.ReactNode;
  className?: string;
  as?:
    | "article"
    | "section"
    | "aside"
    | "nav"
    | "header"
    | "footer"
    | "main"
    | "div";
  role?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingText?: string;
  landmark?: boolean;
  contentGrouping?: boolean;
  progressiveEnhancement?: boolean;
  mobileOptimized?: boolean;
}

export interface ContentSection {
  id: string;
  title: string;
  content: React.ReactNode;
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
  ariaLabel?: string;
  landmark?: boolean;
}

export interface SemanticHTMLConfig {
  enableLandmarks: boolean;
  enableHeadings: boolean;
  enableProgressiveEnhancement: boolean;
  enableMobileOptimization: boolean;
  autoGenerateIds: boolean;
}

export interface CreateContentSectionOptions {
  id?: string;
  ariaLabel?: string;
  landmark?: boolean;
  className?: string;
}

// Semantic HTML element mapper
const ELEMENT_MAP = {
  article: "article",
  section: "section",
  aside: "aside",
  nav: "nav",
  header: "header",
  footer: "footer",
  main: "main",
  div: "div",
} as const;

export class SemanticHTMLManager {
  private static instance: SemanticHTMLManager;
  private config: SemanticHTMLConfig;
  private sectionIds: Set<string> = new Set();

  static getInstance(): SemanticHTMLManager {
    if (!SemanticHTMLManager.instance) {
      SemanticHTMLManager.instance = new SemanticHTMLManager();
    }
    return SemanticHTMLManager.instance;
  }

  private constructor() {
    this.config = {
      enableLandmarks: true,
      enableHeadings: true,
      enableProgressiveEnhancement: true,
      enableMobileOptimization: true,
      autoGenerateIds: true,
    };
  }

  generateSectionId(title: string): string {
    let id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    // Ensure uniqueness
    let counter = 1;
    const originalId = id;
    while (this.sectionIds.has(id)) {
      id = `${originalId}-${counter}`;
      counter++;
    }

    this.sectionIds.add(id);
    return id;
  }

  createContentSection(
    title: string,
    content: React.ReactNode,
    headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = 2,
    options: CreateContentSectionOptions = {},
  ): ContentSection {
    const id = options.id || this.generateSectionId(title);

    return {
      id,
      title,
      content: (
        <SemanticHTMLEnhancer
          as="article"
          id={id}
          ariaLabel={options.ariaLabel || title}
          headingLevel={headingLevel}
          headingText={title}
          landmark={options.landmark || false}
          className={options.className}
        >
          {content}
        </SemanticHTMLEnhancer>
      ),
      headingLevel,
      ariaLabel: options.ariaLabel || title,
      landmark: options.landmark || false,
    };
  }

  getPageStructure(): ContentSection[] {
    // Detect existing content structure on the page
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const sections: ContentSection[] = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1)) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
      const title = heading.textContent || `Section ${index + 1}`;
      const id = heading.id || this.generateSectionId(title);

      // Find content until next heading of same or higher level
      let content: React.ReactNode[] = [];
      let current = heading.nextElementSibling;

      while (current && !this.isHeading(current)) {
        // Convert DOM Node to React element
        const nodeString = current.outerHTML;
        content.push(
          React.createElement("div", {
            key: content.length,
            dangerouslySetInnerHTML: { __html: nodeString },
          }),
        );
        current = current.nextElementSibling;
      }

      sections.push({
        id,
        title,
        content: <div>{content}</div>,
        headingLevel: level,
        ariaLabel: title,
        landmark: level <= 2, // Make h1 and h2 landmarks
      });
    });

    return sections;
  }

  private isHeading(element: Element): boolean {
    return /^H[1-6]$/.test(element.tagName);
  }

  applyProgressiveEnhancement(container: HTMLElement) {
    // Add progressive enhancement classes
    container.classList.add("progressive-enhanced");

    // Enhance images with proper alt text validation
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.alt) {
        img.setAttribute("alt", "");
        img.setAttribute("role", "presentation");
      }
    });

    // Enhance forms with proper labels
    const inputs = container.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      if (
        !input.getAttribute("aria-label") &&
        !input.getAttribute("aria-labelledby")
      ) {
        const label = container.querySelector(`label[for="${input.id}"]`);
        if (!label) {
          input.setAttribute(
            "aria-label",
            input.getAttribute("placeholder") || "Input field",
          );
        }
      }
    });

    // Enhance links without descriptive text
    const links = container.querySelectorAll("a[href]");
    links.forEach((link) => {
      const text = link.textContent?.trim();
      if (!text || text === link.getAttribute("href")) {
        link.setAttribute(
          "aria-label",
          "Link: " + (link.getAttribute("href") || "unknown destination"),
        );
      }
    });
  }

  optimizeForMobile(container: HTMLElement) {
    // Add mobile-specific optimizations
    container.classList.add("mobile-optimized");

    // Ensure touch targets are at least 44px
    const interactiveElements = container.querySelectorAll(
      "button, a, input, textarea, select, [tabindex]",
    );
    interactiveElements.forEach((element) => {
      const style = getComputedStyle(element);
      const minHeight = parseInt(style.minHeight) || 0;
      const minWidth = parseInt(style.minWidth) || 0;

      if (minHeight < 44) {
        element.classList.add("min-h-[44px]");
      }
      if (minWidth < 44) {
        element.classList.add("min-w-[44px]");
      }
    });

    // Optimize text for mobile reading
    const textElements = container.querySelectorAll("p, li, td, th");
    textElements.forEach((element) => {
      const fontSize = parseFloat(getComputedStyle(element).fontSize);
      if (fontSize < 16) {
        element.classList.add("text-base");
      }
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      if (lineHeight < 1.5) {
        element.classList.add("leading-relaxed");
      }
    });
  }
}

// Main Semantic HTML Enhancer Component
export function SemanticHTMLEnhancer({
  children,
  className,
  as = "div",
  role,
  ariaLabel,
  ariaDescription,
  headingLevel,
  headingText,
  landmark = false,
  contentGrouping = true,
  progressiveEnhancement = true,
  mobileOptimized = true,
  ...props
}: SemanticHTMLProps & Record<string, unknown>) {
  const [isMobile, setIsMobile] = useState(false);
  const manager = SemanticHTMLManager.getInstance();

  // Detect mobile device using viewport-based approach
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Apply progressive enhancement on mount
  useEffect(() => {
    if (progressiveEnhancement && typeof document !== "undefined") {
      // This will be applied to the rendered element after it's in the DOM
      const timeoutId = setTimeout(() => {
        const elementId = typeof props.id === "string" ? props.id : "";
        const element = document.getElementById(elementId);
        if (element) {
          manager.applyProgressiveEnhancement(element);
          if (mobileOptimized && isMobile) {
            manager.optimizeForMobile(element);
          }
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [progressiveEnhancement, mobileOptimized, isMobile, manager, props.id]);

  const ElementType = ELEMENT_MAP[as] || "div";

  const semanticProps = {
    className: cn(
      "semantic-html",
      {
        landmark: landmark,
        "content-group": contentGrouping,
        "progressive-enhanced": progressiveEnhancement,
        "mobile-optimized": mobileOptimized && isMobile,
        "is-mobile": isMobile,
      },
      className,
    ),
    role: role || (landmark ? "region" : undefined),
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescription,
    ...props,
  };

  const content = (
    <>
      {headingText &&
        headingLevel &&
        React.createElement(
          `h${headingLevel}`,
          {
            id: `${props.id || "heading"}-title`,
            className: "semantic-heading",
          },
          headingText,
        )}
      {children}
    </>
  );

  return React.createElement(ElementType, semanticProps, content);
}

// Predefined semantic components for common use cases
// Props interfaces for semantic components
interface MainContentProps extends Omit<
  SemanticHTMLProps,
  "as" | "landmark" | "headingLevel"
> {
  children: React.ReactNode;
  className?: string;
}

interface ArticleSectionProps extends Omit<
  SemanticHTMLProps,
  "as" | "headingLevel" | "headingText"
> {
  children: React.ReactNode;
  title: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  id?: string;
}

interface NavigationSectionProps extends Omit<
  SemanticHTMLProps,
  "as" | "landmark"
> {
  children: React.ReactNode;
  className?: string;
}

interface SidebarContentProps extends Omit<
  SemanticHTMLProps,
  "as" | "landmark"
> {
  children: React.ReactNode;
  className?: string;
}

interface ContentHeaderProps extends Omit<
  SemanticHTMLProps,
  "as" | "landmark"
> {
  children: React.ReactNode;
  className?: string;
}

interface ContentFooterProps extends Omit<
  SemanticHTMLProps,
  "as" | "landmark"
> {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({
  children,
  className,
  ...props
}: MainContentProps) {
  return (
    <SemanticHTMLEnhancer
      as="main"
      landmark={true}
      role="main"
      ariaLabel="Main content"
      className={cn("main-content", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

export function ArticleSection({
  children,
  title,
  headingLevel = 2,
  className,
  id,
  ...props
}: ArticleSectionProps) {
  return (
    <SemanticHTMLEnhancer
      as="article"
      id={id}
      landmark={headingLevel <= 2}
      headingLevel={headingLevel}
      headingText={title}
      ariaLabel={title}
      className={cn("article-section", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

export function NavigationSection({
  children,
  className,
  ...props
}: NavigationSectionProps) {
  return (
    <SemanticHTMLEnhancer
      as="nav"
      landmark={true}
      role="navigation"
      ariaLabel="Navigation"
      className={cn("navigation-section", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

export function SidebarContent({
  children,
  className,
  ...props
}: SidebarContentProps) {
  return (
    <SemanticHTMLEnhancer
      as="aside"
      landmark={true}
      role="complementary"
      ariaLabel="Sidebar"
      className={cn("sidebar-content", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

export function ContentHeader({
  children,
  className,
  ...props
}: ContentHeaderProps) {
  return (
    <SemanticHTMLEnhancer
      as="header"
      landmark={true}
      role="banner"
      ariaLabel="Page header"
      className={cn("content-header", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

export function ContentFooter({
  children,
  className,
  ...props
}: ContentFooterProps) {
  return (
    <SemanticHTMLEnhancer
      as="footer"
      landmark={true}
      role="contentinfo"
      ariaLabel="Page footer"
      className={cn("content-footer", className)}
      {...props}
    >
      {children}
    </SemanticHTMLEnhancer>
  );
}

// Hook for semantic HTML management - moved to separate file

// Mobile-first hero component with progressive enhancement
export function MobileOptimizedHero({
  children,
  title,
  subtitle,
  backgroundImage,
  className,
  ...props
}: {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const heroContent = (
    <div className="hero-content">
      <h1 className="hero-title">{title}</h1>
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      {children}
    </div>
  );

  if (isMobile) {
    // Mobile-optimized version
    return (
      <section
        className={cn(
          "hero-section mobile-optimized",
          { "image-loaded": imageLoaded },
          className,
        )}
        role="banner"
        aria-label="Hero section"
      >
        {/* Simplified background for mobile performance */}
        <div className="hero-background-mobile">
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt=""
              className="hero-background-image"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>

        {/* Progressive enhancement: Hide visual elements on very small screens */}
        <div className={cn("hero-content-container", "progressive-hidden-xs")}>
          {heroContent}
        </div>

        {/* Always visible content for accessibility */}
        <div className="hero-accessible-content sr-only">{heroContent}</div>
      </section>
    );
  }

  // Desktop version
  return (
    <section
      className={cn(
        "hero-section desktop-version",
        { "image-loaded": imageLoaded },
        className,
      )}
      role="banner"
      aria-label="Hero section"
    >
      {backgroundImage && (
        <div className="hero-background">
          <img
            src={backgroundImage}
            alt=""
            className="hero-background-image"
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      <div className="hero-content-container">{heroContent}</div>
    </section>
  );
}
