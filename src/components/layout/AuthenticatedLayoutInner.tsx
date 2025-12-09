import { ReactNode, useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { TrendingUp, LogOut, User, Clock, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticatedLayout } from "@/contexts/AuthenticatedLayoutContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebarContext";
import { AutoBreadcrumb } from "@/components/ui/breadcrumb";
import { AppSidebar } from "./AppSidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuthenticatedLayout();

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <AuthenticatedLayoutContent 
        children={children} 
        user={user} 
        handleLogoutClick={handleLogoutClick}
      />
    </SidebarProvider>
  );
};

// Separate component that has access to sidebar context
interface AuthenticatedLayoutContentProps {
  children: ReactNode;
  user: SupabaseUser | null;
  handleLogoutClick: () => void;
}

const AuthenticatedLayoutContent: React.FC<AuthenticatedLayoutContentProps> = ({ 
  children, 
  user, 
  handleLogoutClick 
}) => {
  const { state, open } = useSidebar();
  const { setSidebarOpen } = useAuthenticatedLayout();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Sync sidebar state with AuthenticatedLayoutContext
  useEffect(() => {
    setSidebarOpen(open);
  }, [open, setSidebarOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refresh the current page/data
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex w-full bg-background transition-all duration-300 ease-in-out">
      {/* Sidebar - z-index managed by sidebar component (z-50) */}
      <AppSidebar />

      {/* Main Content Area with SidebarInset - positioned below sidebar */}
      <SidebarInset className="flex flex-col transition-all duration-300 ease-in-out">
        {/* Top Header - sticky with z-50 to stay above main content */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-lg sticky top-0 z-50 backdrop-blur-sm bg-card/95 shadow-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-lg">
            <SidebarTrigger className="h-10 w-10" />
            <div className="flex items-center gap-md">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg text-primary-contrast">TradeX Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-xl">
            {/* Last Updated Timestamp */}
            <div className="flex items-center gap-sm text-xs text-secondary-contrast">
              <Clock className="h-4 w-4" />
              <span>Last updated: {currentTime || "--:-- --"}</span>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10"
              aria-label={isRefreshing ? "Refreshing data..." : "Refresh data"}
            >
              <RotateCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''} text-secondary-contrast`} />
            </Button>

            <div className="hidden md:block text-sm">
              <span className="text-secondary-contrast">Account:</span>
              <span className="ml-sm font-semibold text-primary-contrast">{user?.email || "Trading Account"}</span>
            </div>
            <NotificationCenter />
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogoutClick} aria-label="Logout">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-lg py-lg">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
};

export default AuthenticatedLayout;
