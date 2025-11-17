import { ReactNode } from "react";

interface SectionHeaderProps {
  /** Main title of the section */
  title: string;
  /** Subtitle with gradient styling (optional) */
  subtitle?: string;
  /** Description below the title (optional) */
  description?: string;
  /** Custom content to render below the headers (optional) */
  children?: ReactNode;
  /** Alignment of text (default: center) */
  align?: "left" | "center" | "right";
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const SectionHeader = ({
  title,
  subtitle,
  description,
  children,
  align = "center",
  size = "lg",
}: SectionHeaderProps) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  const titleSize = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl",
  }[size];

  const descriptionMaxWidth = align === "center" ? "max-w-2xl mx-auto" : "";

  return (
    <div className={`${alignClass} mb-8`}>
      <h2 className={`${titleSize} font-bold mb-4`}>
        {title}
        {subtitle && (
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {subtitle}
          </span>
        )}
      </h2>
      {description && (
        <p className={`text-lg md:text-xl text-muted-foreground ${descriptionMaxWidth}`}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};
