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
  Wallet
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
import { useSidebar } from "@/components/ui/sidebar";
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
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50 backdrop-blur-none"
      variant="sidebar"
    >
      <SidebarContent className="text-sidebar-foreground bg-sidebar">
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel className={cn(
            "text-sidebar-foreground/80 font-semibold text-sm tracking-wide px-2",
            collapsed && "opacity-0 h-0 overflow-hidden"
          )}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                        "gap-3 transition-all duration-200 px-4 py-2.5",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active && "bg-primary text-primary-foreground font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                        collapsed && "justify-center px-2",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
      </SidebarContent>
    </Sidebar>
  );
}
