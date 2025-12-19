import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useNotifications } from '@/contexts/notificationContextHelpers';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  History,
  Wallet,
  Bell,
} from 'lucide-react';

interface MobileBottomNavigationProps {
  className?: string;
}

interface NavigationItem {
  path: string;
  icon: React.ElementType;
  label: string;
  testId: string;
  ariaLabel: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    testId: 'nav-dashboard',
    ariaLabel: 'Navigate to Dashboard',
  },
  {
    path: '/trade',
    icon: TrendingUp,
    label: 'Trade',
    testId: 'nav-trade',
    ariaLabel: 'Navigate to Trading Page',
  },
  {
    path: '/portfolio',
    icon: Briefcase,
    label: 'Portfolio',
    testId: 'nav-portfolio',
    ariaLabel: 'Navigate to Portfolio',
  },
  {
    path: '/history',
    icon: History,
    label: 'History',
    testId: 'nav-history',
    ariaLabel: 'Navigate to Trade History',
  },
  {
    path: '/wallet',
    icon: Wallet,
    label: 'Wallet',
    testId: 'nav-wallet',
    ariaLabel: 'Navigate to Wallet',
  },
];

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  className,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { impact, isEnabled } = useHapticFeedback();

  // Get notification count - wrapped in try/catch in case context not available
  let unreadCount = 0;
  try {
    const notifications = useNotifications();
    unreadCount = notifications.unreadCount;
  } catch {
    // NotificationProvider not available, skip badge
  }

  const handleNavigation = (path: string) => {
    // Use standardized haptic feedback
    if (isEnabled) {
      impact();
    }
    navigate(path);
  };

  // Don't show on non-mobile devices or specific routes
  const hideOnRoutes = ['/admin', '/kyc', '/login', '/register'];
  if (hideOnRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background border-t border-border',
        'md:hidden z-50', // Only show on mobile
        'shadow-[0_-4px_16px_rgba(0,0,0,0.1)]',
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-6 gap-0">
        {navigationItems.map(
          ({ path, icon: Icon, label, testId, ariaLabel }) => {
            const isActive = location.pathname === path;

            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1',
                  'min-h-[60px] min-w-[44px]', // FE-014: Ensure minimum 44px touch target
                  'transition-all duration-200 ease-in-out',
                  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'hover:bg-muted/50',
                  'rounded-t-none rounded-b-none',
                  isActive
                    ? 'text-primary bg-primary/10 border-t-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground border-t-2 border-transparent'
                )}
                role="tab"
                aria-selected={isActive}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                data-testid={testId}
              >
                <Icon
                  className={cn(
                    'mobile-nav-icon mb-1', // FE-011: Use standardized icon sizing
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-xs font-medium leading-tight',
                    isActive && 'font-semibold'
                  )}
                >
                  {label}
                </span>
              </button>
            );
          }
        )}

        {/* Notifications Button with Badge */}
        <button
          onClick={() => handleNavigation('/notifications')}
          className={cn(
            'flex flex-col items-center justify-center py-2 px-1 relative',
            'min-h-[60px] min-w-[44px]', // FE-014: Minimum touch target
            'transition-all duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2',
            'hover:bg-muted/50',
            'rounded-t-none rounded-b-none',
            location.pathname === '/notifications'
              ? 'text-primary bg-primary/10 border-t-2 border-primary'
              : 'text-muted-foreground hover:text-foreground border-t-2 border-transparent'
          )}
          role="tab"
          aria-selected={location.pathname === '/notifications'}
          aria-label={`Navigate to Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-current={
            location.pathname === '/notifications' ? 'page' : undefined
          }
          data-testid="nav-notifications"
        >
          <div className="relative">
            <Bell
              className={cn(
                'mobile-nav-icon mb-1', // FE-011: Standardized icon sizing
                location.pathname === '/notifications'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                aria-hidden="true"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-xs font-medium leading-tight',
              location.pathname === '/notifications' && 'font-semibold'
            )}
          >
            Alerts
          </span>
        </button>
      </div>
    </nav>
  );
};
