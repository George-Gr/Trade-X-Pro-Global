import { useLocation, useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/trade", icon: TrendingUp, label: "Trade" },
  { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/history", icon: History, label: "History" },
  { path: "/pending-orders", icon: Clock, label: "Pending Orders" },
  { path: "/risk-management", icon: Shield, label: "Risk Management" },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const { state, open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuthenticatedLayout();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50 backdrop-blur-none"
      variant="sidebar"
    >
      <SidebarContent className="text-sidebar-foreground bg-sidebar flex flex-col h-full">
        {/* Top spacing to prevent overlap with header */}
        <div className="h-6" />
        
        {/* Main Navigation Section */}
        <SidebarGroup className="pt-1 pb-0">
          <SidebarGroupLabel className={cn(
            "text-sidebar-foreground/80 font-semibold text-xs tracking-wide px-2 h-6",
            collapsed && "opacity-0 h-0 overflow-hidden"
          )}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={active}
                      tooltip={collapsed ? item.label : undefined}
                      className={cn(
                        "gap-3 px-4 py-2",
                        collapsed && "justify-center px-2"
                      )}
                      aria-label={`Navigate to ${item.label}`}
                      aria-current={active ? "page" : undefined}
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

        {/* Spacer to push user actions to bottom */}
        <div className="flex-1" />

        {/* User Profile Actions Section */}
        <SidebarGroup className="pt-0 pb-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/settings/profile")}
                  tooltip={collapsed ? "Profile" : undefined}
                  className={cn(
                    "gap-3 px-4 py-2",
                    collapsed && "justify-center px-2"
                  )}
                  aria-label="View profile"
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                    collapsed && "hidden"
                  )}>
                    Profile
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/settings")}
                  tooltip={collapsed ? "Account Settings" : undefined}
                  className={cn(
                    "gap-3 px-4 py-2",
                    collapsed && "justify-center px-2"
                  )}
                  aria-label="Account settings"
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                    collapsed && "hidden"
                  )}>
                    Account Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={collapsed ? "Logout" : undefined}
                  className={cn(
                    "gap-3 px-4 py-2 text-destructive hover:bg-destructive/10",
                    collapsed && "justify-center px-2"
                  )}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    "flex-1 truncate whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                    collapsed && "hidden"
                  )}>
                    Logout
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
