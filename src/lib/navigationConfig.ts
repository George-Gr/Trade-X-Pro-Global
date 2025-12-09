import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  History, 
  Clock, 
  Shield, 
  Settings,
  Bell,
  Wallet,
  User,
  LogOut
} from "lucide-react";

/**
 * Navigation item interface defining the structure for menu items
 */
export interface NavigationItem {
  id: string;
  path: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  label: string;
  requiredRoles?: string[];
  order?: number;
  disabled?: boolean;
  tooltip?: string;
  isVisible?: boolean;
}

/**
 * Navigation configuration for the TradeX Pro sidebar
 * Organized by sections with proper ordering and role-based access
 */
export const NAVIGATION_CONFIG = {
  main: [
    {
      id: 'dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'navigation.dashboard',
      requiredRoles: ['user', 'admin'],
      order: 1,
      isVisible: true
    },
    {
      id: 'trade',
      path: '/trade',
      icon: TrendingUp,
      label: 'navigation.trade',
      requiredRoles: ['user', 'admin'],
      order: 2,
      isVisible: true
    },
    {
      id: 'portfolio',
      path: '/portfolio',
      icon: Briefcase,
      label: 'navigation.portfolio',
      requiredRoles: ['user', 'admin'],
      order: 3,
      isVisible: true
    },
    {
      id: 'wallet',
      path: '/wallet',
      icon: Wallet,
      label: 'navigation.wallet',
      requiredRoles: ['user', 'admin'],
      order: 4,
      isVisible: true
    },
    {
      id: 'history',
      path: '/history',
      icon: History,
      label: 'navigation.history',
      requiredRoles: ['user', 'admin'],
      order: 5,
      isVisible: true
    },
    {
      id: 'pending-orders',
      path: '/pending-orders',
      icon: Clock,
      label: 'navigation.pendingOrders',
      requiredRoles: ['user', 'admin'],
      order: 6,
      isVisible: true
    },
    {
      id: 'risk-management',
      path: '/risk-management',
      icon: Shield,
      label: 'navigation.riskManagement',
      requiredRoles: ['user', 'admin'],
      order: 7,
      isVisible: true
    },
    {
      id: 'notifications',
      path: '/notifications',
      icon: Bell,
      label: 'navigation.notifications',
      requiredRoles: ['user', 'admin'],
      order: 8,
      isVisible: true
    }
  ],
  settings: [
    {
      id: 'settings',
      path: '/settings',
      icon: Settings,
      label: 'navigation.settings',
      requiredRoles: ['user', 'admin'],
      order: 1,
      isVisible: true
    },
    {
      id: 'profile',
      path: '/settings/profile',
      icon: User,
      label: 'navigation.profile',
      requiredRoles: ['user', 'admin'],
      order: 2,
      isVisible: true
    }
  ],
  actions: [
    {
      id: 'logout',
      path: '',
      icon: LogOut,
      label: 'navigation.logout',
      requiredRoles: ['user', 'admin'],
      order: 1,
      isVisible: true,
      disabled: false
    }
  ]
};

/**
 * Navigation sections configuration
 */
export const NAVIGATION_SECTIONS = {
  main: {
    id: 'main',
    label: 'navigation.mainNavigation',
    order: 1,
    items: NAVIGATION_CONFIG.main
  },
  settings: {
    id: 'settings', 
    label: 'navigation.settings',
    order: 2,
    items: NAVIGATION_CONFIG.settings
  },
  actions: {
    id: 'actions',
    label: 'navigation.actions',
    order: 3,
    items: NAVIGATION_CONFIG.actions
  }
};

/**
 * Get all navigation items from all sections
 */
export const getAllNavigationItems = (): NavigationItem[] => {
  return [
    ...NAVIGATION_CONFIG.main,
    ...NAVIGATION_CONFIG.settings,
    ...NAVIGATION_CONFIG.actions
  ].sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Get navigation items for a specific section
 */
export const getNavigationItemsBySection = (section: keyof typeof NAVIGATION_CONFIG): NavigationItem[] => {
  return NAVIGATION_CONFIG[section].sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Get navigation sections in order
 */
export const getNavigationSections = () => {
  return Object.values(NAVIGATION_SECTIONS).sort((a, b) => a.order - b.order);
};

/**
 * Check if a navigation item should be visible based on user roles
 */
export const isNavItemVisible = (item: NavigationItem, userRoles: string[] = []): boolean => {
  // If item is explicitly hidden, don't show it
  if (item.isVisible === false) {
    return false;
  }
  
  // If no required roles specified, item is visible to all
  if (!item.requiredRoles || item.requiredRoles.length === 0) {
    return true;
  }
  
  // If user has no roles, don't show role-restricted items
  if (userRoles.length === 0) {
    return false;
  }
  
  // Check if user has any of the required roles
  const hasRequiredRole = userRoles.some(role => item.requiredRoles?.includes(role));
  
  return hasRequiredRole;
};

/**
 * Filter navigation items based on user roles
 */
export const filterNavigationItemsByRoles = (items: NavigationItem[], userRoles: string[] = []): NavigationItem[] => {
  return items.filter(item => isNavItemVisible(item, userRoles));
};

/**
 * Filter navigation sections based on user roles
 */
export const filterNavigationSectionsByRoles = (userRoles: string[] = []) => {
  const sections = getNavigationSections();
  
  return sections.map(section => ({
    ...section,
    items: filterNavigationItemsByRoles(section.items, userRoles)
  })).filter(section => section.items.length > 0);
};

/**
 * Find navigation item by path
 */
export const findNavItemByPath = (path: string): NavigationItem | undefined => {
  return getAllNavigationItems().find(item => item.path === path);
};

/**
 * Find navigation item by ID
 */
export const findNavItemById = (id: string): NavigationItem | undefined => {
  return getAllNavigationItems().find(item => item.id === id);
};

/**
 * Check if path is active (for highlighting)
 */
export const isPathActive = (currentPath: string, navPath: string): boolean => {
  if (!navPath || navPath === '/') return currentPath === '/';
  
  // Handle exact matches
  if (currentPath === navPath) return true;
  
  // Handle nested routes (e.g., /settings/profile matches /settings)
  return currentPath.startsWith(navPath + '/') && navPath !== '/';
};

/**
 * Get default navigation configuration for backward compatibility
 */
export const getBackwardCompatibleNavItems = () => {
  return [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/trade", icon: TrendingUp, label: "Trade" },
    { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/wallet", icon: Wallet, label: "Wallet" },
    { path: "/history", icon: History, label: "History" },
    { path: "/pending-orders", icon: Clock, label: "Pending Orders" },
    { path: "/risk-management", icon: Shield, label: "Risk Management" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings", icon: Settings, label: "Settings" }
  ];
};