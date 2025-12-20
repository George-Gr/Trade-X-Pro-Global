import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebarContext';
import { SidebarErrorBoundary } from '@/components/ui/SidebarErrorBoundary';
import { useAuthenticatedLayout } from '@/contexts/AuthenticatedLayoutContext';
import {
  filterNavigationSectionsByRoles,
  isPathActive,
} from '@/lib/navigationConfig';
import {
  cn,
  generateNavigationAriaLabel,
  getAriaCurrentState,
  handleMenuKeyboardNavigation,
} from '@/lib/utils';
import { AlertCircle, LogOut, TrendingUp } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Skeleton loading state component
 */
function AppSidebarLoading() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Branding skeleton */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
          <div className="h-8 w-8 bg-sidebar-accent/50 rounded-lg animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="h-4 w-20 bg-sidebar-accent/50 rounded animate-pulse" />
            <div className="h-3 w-24 bg-sidebar-accent/30 rounded animate-pulse" />
          </div>
        </div>

        {/* Loading Main Navigation Section */}
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="opacity-0 h-6">
            Loading
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {[...Array(8)].map((_, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex gap-3 px-3 py-2.5 animate-pulse">
                    <div className="h-5 w-5 bg-sidebar-accent/50 rounded" />
                    <div className="h-4 w-24 bg-sidebar-accent/50 rounded" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Loading Settings Section */}
        <SidebarGroup className="py-2 border-t border-border/30">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {[...Array(3)].map((_, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex gap-3 px-3 py-2.5 animate-pulse">
                    <div className="h-5 w-5 bg-sidebar-accent/50 rounded" />
                    <div className="h-4 w-16 bg-sidebar-accent/50 rounded" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/**
 * Error state component
 */
function AppSidebarError() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Branding */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              TradeX Pro
            </span>
            <span className="text-xs text-muted-foreground">
              Trading Platform
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
          <div className="text-muted-foreground mb-3">
            <AlertCircle className="h-10 w-10 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Unable to load navigation
          </p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Please check your connection
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 hover:bg-sidebar-accent/50"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

/**
 * Main AppSidebar component with error boundary protection
 */
function AppSidebarContent() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout, authLoading } = useAuthenticatedLayout();
  const collapsed = state === 'collapsed';

  // Build user roles array for permission-based filtering
  const userRoles = user ? ['user', ...(isAdmin ? ['admin'] : [])] : [];

  // Get filtered navigation sections based on user roles
  const navigationSections = filterNavigationSectionsByRoles(userRoles);

  // Memoize current pathname
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  // Separate main navigation from settings/actions
  const mainSection = useMemo(
    () => navigationSections.find((section) => section.id === 'main'),
    [navigationSections]
  );

  const settingsSection = useMemo(
    () => navigationSections.find((section) => section.id === 'settings'),
    [navigationSections]
  );

  // Memoize isActive function
  const isActive = useCallback(
    (path: string) => isPathActive(activePath, path),
    [activePath]
  );

  // Handle keyboard navigation
  const handleNavigationKeyDown = useCallback(
    (event: React.KeyboardEvent, path: string) => {
      handleMenuKeyboardNavigation(event, navigate, path);
    },
    [navigate]
  );

  // Handle logout
  const handleLogoutClick = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to sign out? Any unsaved changes will be lost.'
      )
    ) {
      handleLogout();
    }
  }, [handleLogout]);

  const handleLogoutKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLogoutClick();
      }
    },
    [handleLogoutClick]
  );

  // Show skeleton loading state
  if (authLoading) {
    return <AppSidebarLoading />;
  }

  // Show error state if no user and not loading
  if (!user && !authLoading) {
    return <AppSidebarError />;
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50"
      variant="sidebar"
    >
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Logo/Branding Section */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-4 border-b border-border/30',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate">
                TradeX Pro
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Trading Platform
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation Section */}
        {mainSection && (
          <SidebarGroup className="py-4 flex-1">
            <SidebarGroupLabel
              className={cn(
                'text-muted-foreground font-semibold text-[11px] uppercase tracking-wider px-4 mb-2',
                collapsed && 'sr-only'
              )}
            >
              {mainSection.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 px-2">
                {mainSection.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        onKeyDown={(e) => handleNavigationKeyDown(e, item.path)}
                        isActive={active}
                        {...(collapsed ? { tooltip: item.label } : {})}
                        {...(item.disabled !== undefined
                          ? { disabled: item.disabled }
                          : {})}
                        className={cn(
                          'gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          'hover:bg-sidebar-accent/50',
                          collapsed && 'justify-center px-2',
                          active &&
                            'bg-primary/10 border-l-[3px] border-primary text-primary font-medium',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        aria-label={generateNavigationAriaLabel(
                          item.label,
                          active,
                          item.disabled
                        )}
                        aria-current={getAriaCurrentState(active)}
                        role="menuitem"
                        tabIndex={0}
                        {...(item.disabled !== undefined
                          ? { 'aria-disabled': item.disabled }
                          : {})}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'flex-1 truncate text-sm',
                            collapsed && 'sr-only',
                            active
                              ? 'text-primary font-medium'
                              : 'text-sidebar-foreground'
                          )}
                        >
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Divider */}
        <SidebarSeparator className="mx-4 bg-border/30" />

        {/* Settings Section - Pinned to bottom */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel
            className={cn(
              'text-muted-foreground font-semibold text-[11px] uppercase tracking-wider px-4 mb-2',
              collapsed && 'sr-only'
            )}
          >
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {/* Settings Items */}
              {settingsSection?.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path || '');

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.path) navigate(item.path);
                      }}
                      onKeyDown={(e) => {
                        if (item.path) handleNavigationKeyDown(e, item.path);
                      }}
                      isActive={active}
                      {...(collapsed ? { tooltip: item.label } : {})}
                      {...(item.disabled !== undefined
                        ? { disabled: item.disabled }
                        : {})}
                      className={cn(
                        'gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        'hover:bg-sidebar-accent/50',
                        collapsed && 'justify-center px-2',
                        active &&
                          'bg-primary/10 border-l-[3px] border-primary text-primary font-medium',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      aria-label={generateNavigationAriaLabel(
                        item.label,
                        active,
                        item.disabled
                      )}
                      aria-current={getAriaCurrentState(active)}
                      role="menuitem"
                      tabIndex={0}
                      {...(item.disabled !== undefined
                        ? { 'aria-disabled': item.disabled }
                        : {})}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'flex-1 truncate text-sm',
                          collapsed && 'sr-only',
                          active
                            ? 'text-primary font-medium'
                            : 'text-sidebar-foreground'
                        )}
                      >
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogoutClick}
                  onKeyDown={handleLogoutKeyDown}
                  {...(collapsed ? { tooltip: 'Sign Out' } : {})}
                  className={cn(
                    'gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'text-destructive hover:bg-destructive/10 hover:text-destructive',
                    collapsed && 'justify-center px-2'
                  )}
                  aria-label="Sign out of your account"
                  aria-describedby="logout-description"
                  role="menuitem"
                  tabIndex={0}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(
                      'flex-1 truncate text-sm',
                      collapsed && 'sr-only'
                    )}
                  >
                    Sign Out
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Visually hidden description for logout button accessibility */}
      <div
        id="logout-description"
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        This action will sign you out of your trading account and end your
        current session.
      </div>
    </Sidebar>
  );
}

/**
 * AppSidebar component wrapped with error boundary protection
 */
export function AppSidebar() {
  return (
    <SidebarErrorBoundary
      enableLogging={true}
      onError={() => {
        // Error is already logged by SidebarErrorBoundary with enableLogging=true
      }}
    >
      <AppSidebarContent />
    </SidebarErrorBoundary>
  );
}
