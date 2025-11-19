import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticatedLayout } from "@/contexts/AuthenticatedLayoutContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const { user, handleLogout, sidebarOpen, setSidebarOpen } = useAuthenticatedLayout();

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-bold">TradeX Pro</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm">
                <span className="text-muted-foreground">Account:</span>
                <span className="ml-2 font-semibold">{user?.email || "Trading Account"}</span>
              </div>
              <NotificationCenter />
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogoutClick} aria-label="Logout">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
