import * as React from "react";
import { useViewModeSafe } from "@/contexts/ViewModeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
  /** Display variant */
  variant?: "switch" | "buttons" | "compact";
  /** Additional CSS classes */
  className?: string;
  /** Show labels */
  showLabels?: boolean;
}

/**
 * Toggle component for switching between Basic and Pro view modes
 * Supports multiple display variants for different UI contexts
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  variant = "switch",
  className,
  showLabels = true,
}) => {
  const { viewMode, setViewMode, toggleViewMode, isProMode } =
    useViewModeSafe();

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
              className={cn(
                "h-8 px-2 gap-1",
                isProMode && "text-primary",
                className,
              )}
            >
              {isProMode ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {isProMode ? "Pro" : "Basic"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {isProMode ? "Basic" : "Pro"} view</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "buttons") {
    return (
      <div
        className={cn(
          "flex rounded-lg border border-border p-1 gap-1",
          className,
        )}
      >
        <Button
          variant={viewMode === "basic" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("basic")}
          className="h-7 px-3 text-xs"
        >
          <Zap className="h-3 w-3 mr-1" />
          Basic
        </Button>
        <Button
          variant={viewMode === "pro" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("pro")}
          className="h-7 px-3 text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Pro
        </Button>
      </div>
    );
  }

  // Default: switch variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabels && (
        <Label
          htmlFor="view-mode-toggle"
          className={cn(
            "text-sm cursor-pointer transition-colors",
            !isProMode
              ? "text-foreground font-medium"
              : "text-muted-foreground",
          )}
          onClick={() => setViewMode("basic")}
        >
          <Zap className="h-3 w-3 inline mr-1" />
          Basic
        </Label>
      )}
      <Switch
        id="view-mode-toggle"
        checked={isProMode}
        onCheckedChange={(checked) => setViewMode(checked ? "pro" : "basic")}
        aria-label="Toggle view mode"
      />
      {showLabels && (
        <Label
          htmlFor="view-mode-toggle"
          className={cn(
            "text-sm cursor-pointer transition-colors",
            isProMode ? "text-foreground font-medium" : "text-muted-foreground",
          )}
          onClick={() => setViewMode("pro")}
        >
          <Sparkles className="h-3 w-3 inline mr-1" />
          Pro
        </Label>
      )}
    </div>
  );
};

/**
 * Wrapper component that conditionally renders children based on view mode
 */
export const ProModeOnly: React.FC<{
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null } = {}) => {
  const { isProMode } = useViewModeSafe();
  return <>{isProMode ? children : fallback}</>;
};

/**
 * Wrapper component that only renders in basic mode
 */
export const BasicModeOnly: React.FC<{ children?: React.ReactNode }> = ({
  children,
} = {}) => {
  const { isBasicMode } = useViewModeSafe();
  return <>{isBasicMode ? children : null}</>;
};

export default ViewModeToggle;
