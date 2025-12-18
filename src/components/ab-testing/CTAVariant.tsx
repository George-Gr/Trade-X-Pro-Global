import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import {
  experimentManager,
  ExperimentVariant,
} from "../../lib/ab-testing/experimentManager";
import { CTAConfig } from "./ctaExperimentUtils";

// Static CSS class definitions moved to module scope for performance
const BASE_CLASSES = [
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:pointer-events-none",
];

const SIZE_CLASSES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 py-2",
  lg: "h-11 px-8",
  xl: "h-12 px-10 text-lg",
};

const STYLE_CLASSES: Record<string, Record<string, string>> = {
  filled: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    accent: "bg-accent text-accent-foreground hover:bg-accent/80",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700",
    info: "bg-blue-600 text-white hover:bg-blue-700",
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700",
  },
  outline: {
    primary:
      "border border-primary bg-background hover:bg-primary hover:text-primary-foreground",
    secondary:
      "border border-secondary bg-background hover:bg-secondary hover:text-secondary-foreground",
    accent:
      "border border-accent bg-background hover:bg-accent hover:text-accent-foreground",
    destructive:
      "border border-destructive bg-background hover:bg-destructive hover:text-destructive-foreground",
    success:
      "border border-green-600 bg-background hover:bg-green-600 hover:text-white",
    warning:
      "border border-yellow-600 bg-background hover:bg-yellow-600 hover:text-white",
    info: "border border-blue-600 bg-background hover:bg-blue-600 hover:text-white",
    gold: "border border-yellow-400 bg-background hover:bg-yellow-400 hover:text-white",
  },
  ghost: {
    primary: "hover:bg-primary hover:text-primary-foreground",
    secondary: "hover:bg-secondary hover:text-secondary-foreground",
    accent: "hover:bg-accent hover:text-accent-foreground",
    destructive: "hover:bg-destructive hover:text-destructive-foreground",
    success: "hover:bg-green-600 hover:text-white",
    warning: "hover:bg-yellow-600 hover:text-white",
    info: "hover:bg-blue-600 hover:text-white",
    gold: "hover:bg-yellow-400 hover:text-white",
  },
};

const POSITION_CLASSES = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
};

interface CTAVariantProps {
  experimentId: string;
  userId: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  trackConversion?: boolean;
}

export function CTAVariant({
  experimentId,
  userId,
  children,
  className,
  onClick,
  trackConversion = true,
}: CTAVariantProps) {
  const [variant, setVariant] = useState<ExperimentVariant | null>(null);
  const [config, setConfig] = useState<CTAConfig>({
    text: "Get Started",
    color: "primary",
    size: "md",
    style: "filled",
    position: "center",
  });

  useEffect(() => {
    // Get the assigned variant for this user
    const assignedVariant = experimentManager.getVariant(experimentId, userId);
    if (assignedVariant) {
      setVariant(assignedVariant);
      updateCTAConfig(assignedVariant);
    }
  }, [experimentId, userId]);

  const updateCTAConfig = (assignedVariant: ExperimentVariant) => {
    const variantConfig = assignedVariant.config as unknown as CTAConfig;
    if (variantConfig) {
      setConfig(variantConfig);
    }
  };

  const handleClick = () => {
    // Track the click event
    if (trackConversion && variant) {
      experimentManager.trackConversion(experimentId, variant.id);

      // Dispatch custom event for analytics
      const conversionEvent = new CustomEvent("ab-test-conversion", {
        detail: {
          experimentId,
          variantId: variant.id,
          timestamp: Date.now(),
          userId,
        },
      });
      document.dispatchEvent(conversionEvent);
    }

    // Execute custom onClick handler
    if (onClick) {
      onClick();
    }
  };

  const getButtonStyles = () => {
    return cn(
      BASE_CLASSES,
      SIZE_CLASSES[config.size],
      STYLE_CLASSES[config.style]?.[config.color] ||
        STYLE_CLASSES.filled?.[config.color] ||
        STYLE_CLASSES.filled.primary,
      POSITION_CLASSES[config.position || "center"],
      className,
    );
  };

  const renderIcon = () => {
    if (!config.icon) return null;

    const iconClasses = cn(
      config.size === "sm"
        ? "w-4 h-4"
        : config.size === "lg"
          ? "w-5 h-5"
          : "w-4 h-4",
      config.position === "left" ? "mr-2" : "ml-2",
    );

    return <span className={iconClasses}>{config.icon}</span>;
  };

  if (!variant) {
    // Show default CTA while variant is loading
    return (
      <button className={cn(getButtonStyles(), "animate-pulse")} disabled>
        Loading...
      </button>
    );
  }

  return (
    <button
      className={getButtonStyles()}
      onClick={handleClick}
      data-experiment-id={experimentId}
      data-variant-id={variant.id}
      data-variant-name={variant.name}
    >
      {config.position === "left" && renderIcon()}
      <span>{config.text}</span>
      {config.position === "right" && renderIcon()}
      {children}
    </button>
  );
}

// Predefined CTA variants for common use cases
export function TradingSignupCTA({
  children,
  userId,
  className,
  onSignup,
}: {
  children?: React.ReactNode;
  userId: string;
  className?: string;
  onSignup?: () => void;
}) {
  return (
    <CTAVariant
      experimentId="signup_cta_optimization"
      userId={userId}
      className={className}
      onClick={onSignup}
    >
      {children || "Start Trading"}
    </CTAVariant>
  );
}

export function DepositCTA({
  children,
  userId,
  className,
  onDeposit,
}: {
  children?: React.ReactNode;
  userId: string;
  className?: string;
  onDeposit?: () => void;
}) {
  return (
    <CTAVariant
      experimentId="deposit_cta_optimization"
      userId={userId}
      className={className}
      onClick={onDeposit}
    >
      {children || "Make Deposit"}
    </CTAVariant>
  );
}

export function DownloadAppCTA({
  children,
  userId,
  className,
  onDownload,
}: {
  children?: React.ReactNode;
  userId: string;
  className?: string;
  onDownload?: () => void;
}) {
  return (
    <CTAVariant
      experimentId="download_cta_optimization"
      userId={userId}
      className={className}
      onClick={onDownload}
    >
      {children || "Download App"}
    </CTAVariant>
  );
}
