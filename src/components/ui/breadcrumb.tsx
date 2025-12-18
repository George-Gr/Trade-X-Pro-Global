import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface BreadcrumbItemConfig {
  title: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hideInBreadcrumb?: boolean;
}

// Breadcrumb configuration for all routes
const BREADCRUMB_CONFIG = {
  "/education": {
    title: "Education",
  },
  "/education/webinar": {
    title: "Webinar",
    path: "/education",
  },
  "/education/certifications": {
    title: "Certifications",
    path: "/education",
  },
  "/education/tutorials": {
    title: "Tutorials",
    path: "/education",
  },
  "/education/mentorship": {
    title: "Mentorship",
    path: "/education",
  },
  "/education/glossary": {
    title: "Glossary",
    path: "/education",
  },

  // Company pages
  "/company": {
    title: "Company",
  },
  "/company/about": {
    title: "About Us",
    path: "/company",
  },
  "/company/regulation": {
    title: "Regulation",
    path: "/company",
  },
  "/company/security": {
    title: "Security",
    path: "/company",
  },
  "/company/partners": {
    title: "Partners",
    path: "/company",
  },
  "/company/contact": {
    title: "Contact Us",
    path: "/company",
  },

  // Authenticated pages
  "/dashboard": {
    title: "Dashboard",
  },
  "/trade": {
    title: "Trade",
  },
  "/portfolio": {
    title: "Portfolio",
  },
  "/history": {
    title: "History",
  },
  "/pending-orders": {
    title: "Pending Orders",
  },
  "/wallet": {
    title: "Wallet",
  },
  "/settings": {
    title: "Settings",
  },
  "/kyc": {
    title: "KYC",
  },
  "/notifications": {
    title: "Notifications",
  },
  "/risk-management": {
    title: "Risk Management",
  },

  // Admin pages
  "/admin": {
    title: "Admin",
  },
  "/admin/risk": {
    title: "Admin Risk Dashboard",
    path: "/admin",
  },
};

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center wrap-break-word gap-4.5 sm:gap-4.5 text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-4.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("icon-sm", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

// AutoBreadcrumb component for automatic breadcrumb generation
export const AutoBreadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    maxItems?: number;
    truncateLength?: number;
  }
>(({ maxItems = 5, truncateLength = 20, className, ...props }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = (): (BreadcrumbItemConfig & {
    path?: string;
  })[] => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment: string) => segment.length > 0);
    const items: (BreadcrumbItemConfig & { path?: string })[] = [];

    // Always start with Home
    const homeConfig = (
      BREADCRUMB_CONFIG as Record<string, BreadcrumbItemConfig | undefined>
    )["/"];
    items.push(homeConfig || { title: "Home" });

    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      const config = (
        BREADCRUMB_CONFIG as Record<string, BreadcrumbItemConfig | undefined>
      )[currentPath];
      if (config && !config.hideInBreadcrumb) {
        items.push({
          ...config,
          path:
            i < pathSegments.length - 1
              ? config.path || currentPath
              : undefined,
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Handle navigation
  const handleNavigation = (path?: string) => {
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  // Truncate long breadcrumb titles
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb if only on home page
  }

  return (
    <Breadcrumb
      ref={ref}
      className={cn(
        "bg-muted/70 rounded-md px-3 py-2 text-foreground",
        className,
      )}
      {...props}
    >
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <BreadcrumbItem key={isFirst ? "home" : item.path || item.title}>
              {isFirst ? (
                // Home icon for first item
                <BreadcrumbLink
                  onClick={() => handleNavigation("/")}
                  className="flex items-center gap-1 text-foreground/90 hover:text-primary transition-colors font-medium"
                  aria-label="Go to Home"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {!item.icon && truncateTitle(item.title, truncateLength)}
                </BreadcrumbLink>
              ) : // Regular breadcrumb item
              item.path ? (
                <BreadcrumbLink
                  onClick={() => handleNavigation(item.path)}
                  className="text-foreground/90 hover:text-primary transition-colors font-medium cursor-pointer"
                >
                  {truncateTitle(item.title, truncateLength)}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-foreground font-semibold">
                  {truncateTitle(item.title, truncateLength)}
                </BreadcrumbPage>
              )}

              {!isLast && <BreadcrumbSeparator className="opacity-70" />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

AutoBreadcrumb.displayName = "AutoBreadcrumb";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
