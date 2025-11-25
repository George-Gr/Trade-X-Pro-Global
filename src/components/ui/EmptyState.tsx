import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "minimal";
}

/**
 * EmptyState Component
 * 
 * Displays a consistent empty state with icon, message, and optional call-to-action.
 * Used across tables, lists, and data views when no content is available.
 * 
 * Usage:
 * <EmptyState 
 *   icon={Inbox}
 *   title="No messages yet"
 *   description="Start a conversation to see messages here"
 *   action={{ label: "New Message", onClick: handleNewMessage }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
  variant = "default",
}) => {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-8 text-center", className)}>
        <div className="space-y-2">
          {Icon && <Icon className="h-8 w-8 mx-auto text-muted-foreground" />}
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12 px-4", className)}>
      <div className="text-center space-y-4 max-w-md">
        {Icon && (
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Convenience components for common scenarios
export const TableEmptyState: React.FC<{
  onAction?: () => void;
  actionLabel?: string;
  message?: string;
}> = ({ onAction, actionLabel = "Add Item", message = "No items found" }) => (
  <EmptyState
    title={message}
    description="Get started by adding your first item"
    action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    variant="minimal"
  />
);

export const SearchEmptyState: React.FC<{
  searchTerm: string;
  onClear: () => void;
}> = ({ searchTerm, onClear }) => (
  <EmptyState
    title={`No results for "${searchTerm}"`}
    description="Try adjusting your search or filter criteria"
    action={{ label: "Clear Search", onClick: onClear }}
    variant="minimal"
  />
);
