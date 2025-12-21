import {
  NAVIGATION_MENU_TRIGGER_STYLES,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export const NavLink = ({ to, icon, title, description }: NavLinkProps) => (
  <NavigationMenuLink asChild>
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-4 rounded-lg p-3 transition-all duration-200',
        'hover:bg-accent/80 focus:bg-accent focus:outline-none',
        'border border-transparent hover:border-border/50',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background focus-visible:outline-none',
        'hover:shadow-lg hover:shadow-accent/20',
        'hover:-translate-y-0.5',
        'relative overflow-hidden'
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-primary/10 to-primary/20 text-primary group-hover:bg-linear-to-br group-hover:from-primary group-hover:to-primary-glow group-hover:text-primary-foreground transition-all duration-200 shadow-sm">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-sm font-semibold leading-none group-hover:text-foreground transition-colors">
          {title}
        </div>
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
            {description}
          </p>
        )}
      </div>
    </Link>
  </NavigationMenuLink>
);

interface MenuProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Menu component for dropdown navigation menus.
 * Renders a trigger button and a two-column grid content area.
 *
 * @param title - The menu trigger text
 * @param children - The menu items to display in the content area
 */
export const Menu: React.FC<MenuProps> = ({ title, children }) => (
  <NavigationMenuItem>
    <NavigationMenuTrigger className={NAVIGATION_MENU_TRIGGER_STYLES}>
      {title}
    </NavigationMenuTrigger>
    <NavigationMenuContent className="w-120 p-4">
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </NavigationMenuContent>
  </NavigationMenuItem>
);

interface SmallMenuProps {
  title: string;
  children: React.ReactNode;
}

/**
 * SmallMenu component for dropdown navigation menus.
 * Renders a trigger button and a two-column grid content area.
 *
 * @param title - The menu trigger text
 * @param children - The menu items to display in the content area
 * @returns JSX.Element
 */
export const SmallMenu: React.FC<SmallMenuProps> = ({ title, children }) => (
  <NavigationMenuItem>
    <NavigationMenuTrigger className={NAVIGATION_MENU_TRIGGER_STYLES}>
      {title}
    </NavigationMenuTrigger>
    <NavigationMenuContent className="w-100 p-4">
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </NavigationMenuContent>
  </NavigationMenuItem>
);
