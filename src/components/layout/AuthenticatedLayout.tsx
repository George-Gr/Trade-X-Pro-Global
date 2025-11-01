import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, LogOut, User, LayoutDashboard, Briefcase, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/trade", icon: TrendingUp, label: "Trade" },
    { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold">TradeX Pro</span>
          </div>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Account:</span>
            <span className="ml-2 font-semibold">Demo #12345</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
