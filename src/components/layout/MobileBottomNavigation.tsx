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
  Bell
} from 'lucide-react';

interface MobileBottomNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    testId: 'nav-dashboard'
  },
  {
    path: '/trade',
    icon: TrendingUp,
    label: 'Trade',
    testId: 'nav-trade'
  },
  {
    path: '/portfolio',
    icon: Briefcase,
    label: 'Portfolio',
    testId: 'nav-portfolio'
  },
  {
    path: '/history',
    icon: History,
    label: 'History',
    testId: 'nav-history'
  },
  {
    path: '/wallet',
    icon: Wallet,
    label: 'Wallet',
    testId: 'nav-wallet'
  }
];

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  className
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
  if (hideOnRoutes.some(route => location.pathname.startsWith(route))) {
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
        {navigationItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1',
                'min-h-[60px] min-w-[44px]', // Ensure minimum touch target
                'transition-all duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'hover:bg-muted/50',
                'rounded-t-none rounded-b-none',
                isActive 
                  ? 'text-primary bg-muted/30' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              data-testid={testId}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              <span className="text-xs font-medium leading-tight">
                {label}
              </span>
            </button>
          );
        })}
        
        {/* Notifications Button with Badge */}
        <button
          onClick={() => handleNavigation('/notifications')}
          className={cn(
            'flex flex-col items-center justify-center py-2 px-1 relative',
            'min-h-[60px] min-w-[44px]',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'hover:bg-muted/50',
            'rounded-t-none rounded-b-none',
            location.pathname === '/notifications'
              ? 'text-primary bg-muted/30' 
              : 'text-muted-foreground hover:text-foreground'
          )}
          role="tab"
          aria-selected={location.pathname === '/notifications'}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          data-testid="nav-notifications"
        >
          <div className="relative">
            <Bell 
              className={cn(
                'h-6 w-6 mb-1',
                location.pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium leading-tight">
            Alerts
          </span>
        </button>
      </div>
    </nav>
  );
};