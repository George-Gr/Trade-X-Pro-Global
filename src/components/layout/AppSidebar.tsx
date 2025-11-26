import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthenticatedLayout } from "@/contexts/AuthenticatedLayoutContext";
import { useSidebar } from "@/components/ui/sidebarContext";
import { 
  filterNavigationSectionsByRoles,
  isPathActive,
  NAVIGATION_CONFIG
} from "@/lib/navigationConfig";
import { SidebarErrorBoundary } from "@/components/ui/SidebarErrorBoundary";
import { 
  cn, 
  handleMenuKeyboardNavigation, 
  generateNavigationAriaLabel,
  getAriaCurrentState 
} from "@/lib/utils";
import { AlertCircle, LayoutDashboard, TrendingUp, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Skeleton loading state component
 */
function AppSidebarLoading() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 backdrop-blur-none">
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Top spacing to prevent overlap with header */}
        <div className="h-6" />
        
        {/* Loading Main Navigation Section */}
        <SidebarGroup className="pt-1 pb-0">
          <SidebarGroupLabel className="opacity-0 h-6">Loading</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {[...Array(6)].map((_, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex gap-3 px-4 py-2 animate-pulse">
                    <div className="h-5 w-5 bg-sidebar-accent/50 rounded" />
                    <div className="h-4 w-20 bg-sidebar-accent/50 rounded" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Spacer to push user actions to bottom */}
        <div className="flex-1" />
        
        {/* Loading User Actions Section */}
        <SidebarGroup className="pt-0 pb-1">
          <SidebarGroupContent>
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex gap-3 px-4 py-2 animate-pulse">
                  <div className="h-5 w-5 bg-sidebar-accent/50 rounded" />
                  <div className="h-4 w-16 bg-sidebar-accent/50 rounded" />
                </div>
              ))}
            </div>
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
    <Sidebar collapsible="icon" className="border-r border-border/50 backdrop-blur-none">
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Top spacing to prevent overlap with header */}
        <div className="h-6" />
        
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-muted-foreground mb-3">
            <AlertCircle className="h-10 w-10 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Unable to load navigation</p>
          <p className="text-xs text-muted-foreground/70 mb-4">Please check your connection and try again</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-border/50 hover:bg-sidebar-accent/50"
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
  const { state, open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout, authLoading } = useAuthenticatedLayout();
  const collapsed = state === "collapsed";

  // Show skeleton loading state
  if (authLoading) {
    return <AppSidebarLoading />;
  }

  // Show error state if no user and not loading
  if (!user && !authLoading) {
    return <AppSidebarError />;
  }

  // Build user roles array for permission-based filtering
  const userRoles = user ? ['user', ...(isAdmin ? ['admin'] : [])] : [];

  // Get filtered navigation sections based on user roles
  const navigationSections = filterNavigationSectionsByRoles(userRoles);

  // Memoize current pathname to prevent unnecessary recalculations
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  // Memoize navigation sections without modifying items
  const memoizedNavigationSections = useMemo(() => {
    return navigationSections;
  }, [navigationSections]);

  // Memoize settings section items
  const settingsItems = useMemo(() => {
    const settingsSection = navigationSections.find(section => section.id === 'settings');
    return settingsSection?.items || [];
  }, [navigationSections]);

  // Memoize isActive function to prevent recreation on every render
  const isActive = useCallback((path: string) => 
    isPathActive(activePath, path), [activePath]
  );

  // Handle keyboard navigation for main navigation items
  const handleNavigationKeyDown = useCallback(
    (event: React.KeyboardEvent, path: string) => {
      handleMenuKeyboardNavigation(event, navigate, path);
    },
    [navigate]
  );

  // Handle keyboard navigation for settings items
  const handleSettingsKeyDown = useCallback(
    (event: React.KeyboardEvent, path?: string) => {
      if (path) {
        handleMenuKeyboardNavigation(event, navigate, path);
      }
    },
    [navigate]
  );

  // Handle keyboard navigation for logout action
  const handleLogoutKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    const currentTarget = event.currentTarget as HTMLElement;

    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Trigger the logout confirmation dialog
        if (window.confirm('Are you sure you want to sign out? Any unsaved changes will be lost.')) {
          handleLogout();
        }
        break;
      case 'ArrowDown': {
        event.preventDefault();
        // Focus next element (if any)
        const nextElement = currentTarget.nextElementSibling as HTMLElement;
        nextElement?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        // Focus previous element (if any)
        const prevElement = currentTarget.previousElementSibling as HTMLElement;
        prevElement?.focus();
        break;
      }
      default:
        // Let other keys be handled by the menu navigation handler
        handleMenuKeyboardNavigation(event);
        break;
    }
  }, [handleLogout]);

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50 backdrop-blur-none"
      variant="sidebar"
    >
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Logo/Branding Section */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-4 border-b border-border/50",
          collapsed && "justify-center px-2"
        )}>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">TradeX Pro</span>
              <span className="text-xs text-muted-foreground">Trading Platform</span>
            </div>
          )}
        </div>
        
        {/* Dynamic Navigation Sections */}
        {memoizedNavigationSections.map((section) => {
          // Skip actions section as it will be handled separately
          if (section.id === 'actions') return null;

          return (
            <SidebarGroup key={section.id} className="pt-1 pb-0">
              <SidebarGroupLabel className={cn(
                "text-sidebar-foreground/80 font-semibold text-xs tracking-wide px-2 h-6",
                collapsed && "opacity-0 h-0 overflow-hidden"
              )}>
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => navigate(item.path)}
                          onKeyDown={(e) => handleNavigationKeyDown(e, item.path)}
                          isActive={isActive(item.path)}
                          tooltip={collapsed ? item.label : undefined}
                          disabled={item.disabled}
                          className={cn(
                            "gap-3 px-4 py-2",
                            collapsed && "justify-center px-2",
                            item.disabled && "opacity-50 cursor-not-allowed"
                          )}
                          aria-label={generateNavigationAriaLabel(item.label, isActive(item.path), item.disabled)}
                          aria-current={getAriaCurrentState(isActive(item.path))}
                          role="menuitem"
                          tabIndex={0}
                          aria-disabled={item.disabled}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className={cn(
                            "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                            collapsed && "hidden"
                          )}>
                            {item.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {/* Spacer to push user actions to bottom */}
        <div className="flex-1" />

        {/* User Actions Section */}
        <SidebarGroup className="pt-0 pb-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {/* Settings Navigation Items */}
              {settingsItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => item.path && navigate(item.path)}
                      onKeyDown={(e) => handleSettingsKeyDown(e, item.path)}
                      isActive={isActive(item.path || '')}
                      tooltip={collapsed ? item.label : undefined}
                      disabled={item.disabled}
                      className={cn(
                        "gap-3 px-4 py-2",
                        collapsed && "justify-center px-2",
                        item.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      aria-label={generateNavigationAriaLabel(item.label, isActive(item.path || ''), item.disabled)}
                      aria-current={getAriaCurrentState(isActive(item.path || ''))}
                      role="menuitem"
                      tabIndex={0}
                      aria-disabled={item.disabled}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn(
                        "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                        collapsed && "hidden"
                      )}>
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Logout Action */}
              {navigationSections
                .find(section => section.id === 'actions')
                ?.items.filter(item => item.id === 'logout')
                .map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          if (window.confirm('Are you sure you want to sign out? Any unsaved changes will be lost.')) {
                            handleLogout();
                          }
                        }}
                        onKeyDown={handleLogoutKeyDown}
                        tooltip={collapsed ? item.label : undefined}
                        disabled={item.disabled}
                        className={cn(
                          "gap-3 px-4 py-2 text-destructive hover:bg-destructive/10",
                          collapsed && "justify-center px-2",
                          item.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label={generateNavigationAriaLabel(item.label, false, item.disabled)}
                        aria-describedby="logout-description"
                        role="menuitem"
                        tabIndex={0}
                        aria-disabled={item.disabled}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className={cn(
                          "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                          collapsed && "hidden"
                        )}>
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
        This action will sign you out of your trading account and end your current session.
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
      onError={(error, errorInfo) => {
        // Custom error handling for sidebar errors
        console.log('AppSidebar error handled:', error.message);
      }}
    >
      <AppSidebarContent />
    </SidebarErrorBoundary>
  );
}
