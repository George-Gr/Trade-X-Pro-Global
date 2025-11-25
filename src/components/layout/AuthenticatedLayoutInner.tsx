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
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area with SidebarInset */}
      <SidebarInset className="flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-sm bg-card/95 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-10 w-10" />
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">TradeX Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Last Updated Timestamp */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
              aria-label="Refresh data"
            >
              <RotateCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <div className="hidden md:block text-sm">
              <span className="text-muted-foreground">Account:</span>
              <span className="ml-2 font-semibold">{user?.email || "Trading Account"}</span>
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
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
};

export default AuthenticatedLayout;
