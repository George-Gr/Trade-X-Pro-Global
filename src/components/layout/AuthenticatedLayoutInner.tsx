import { ReactNode, useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { User, Clock, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticatedLayout } from "@/contexts/AuthenticatedLayoutContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebarContext";
import { AutoBreadcrumb } from "@/components/ui/breadcrumb";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNavigation } from "./MobileBottomNavigation";

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
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 backdrop-blur-sm bg-card/95 shadow-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-10 w-10" />
            {/* Breadcrumb Navigation */}
            <AutoBreadcrumb className="hidden md:flex" />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Last Updated Timestamp - hidden on small screens */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
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
              <RotateCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''} text-muted-foreground`} />
            </Button>

            {/* Account Info - hidden on small screens */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-medium text-foreground">{user?.email || "Trading Account"}</span>
            </div>
            
            <NotificationCenter />
            
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background transition-all duration-300 ease-in-out pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation />
      </SidebarInset>
    </div>
  );
};

export default AuthenticatedLayout;
