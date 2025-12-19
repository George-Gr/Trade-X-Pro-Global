import { Link } from 'react-router-dom';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

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
        'group flex items-start gap-3 rounded-lg p-3 transition-all duration-200',
        'hover:bg-accent/80 focus:bg-accent focus:outline-none',
        'border border-transparent hover:border-border/50',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background focus-visible:outline-none'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium leading-none group-hover:text-foreground">
          {title}
        </div>
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80">
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

export const Menu = ({ title, children }: MenuProps) => (
  <NavigationMenuItem>
    <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
    <NavigationMenuContent>
      <div className="w-[480px] p-4">
        <div className="grid grid-cols-2 gap-2">{children}</div>
      </div>
    </NavigationMenuContent>
  </NavigationMenuItem>
);

interface SmallMenuProps {
  title: string;
  children: React.ReactNode;
}

export const SmallMenu = ({ title, children }: SmallMenuProps) => (
  <NavigationMenuItem>
    <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
    <NavigationMenuContent>
      <div className="w-[400px] p-4">
        <div className="grid grid-cols-2 gap-2">{children}</div>
      </div>
    </NavigationMenuContent>
  </NavigationMenuItem>
);
