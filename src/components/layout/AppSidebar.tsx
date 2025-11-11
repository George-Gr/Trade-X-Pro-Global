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
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "opacity-0")}>
            Navigation
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
                        "gap-3",
                        active && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
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
