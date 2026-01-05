import KYCPanel from '@/components/admin/KYCPanel';
import LeadsPanel from '@/components/admin/LeadsPanel';
import RiskPanel from '@/components/admin/RiskPanel';
import UsersPanel from '@/components/admin/UsersPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import {
  FileCheck,
  LogOut,
  RefreshCw,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState('leads');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Early-return guard to prevent flash of admin content
  if (!user) {
    navigate('/login');
    return null;
  }

  if (isAdmin === undefined) {
    // Still loading admin status
    return null;
  }

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      logger.error('Logout failed', error, {
        action: 'admin_logout',
        component: 'Admin',
      });
      toast({
        title: 'Logout failed',
        description:
          'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getPanelIcon = (panel: string) => {
    switch (panel) {
      case 'leads':
        return <UserPlus className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'kyc':
        return <FileCheck className="h-4 w-4" />;
      case 'risk':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-bold">TradeX Pro</span>
          <div className="ml-2 px-2 py-1 bg-primary/10 rounded-full">
            <span className="text-xs text-primary font-medium">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, KYC submissions, and risk monitoring
          </p>
        </div>

        {/* Navigation Panels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              activePanel === 'leads'
                ? 'ring-2 ring-primary'
                : 'hover:shadow-md'
            }`}
            onClick={() => setActivePanel('leads')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Leads</h3>
                <p className="text-xs text-muted-foreground">
                  New registrations
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              activePanel === 'users'
                ? 'ring-2 ring-primary'
                : 'hover:shadow-md'
            }`}
            onClick={() => setActivePanel('users')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Users</h3>
                <p className="text-xs text-muted-foreground">Manage accounts</p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              activePanel === 'kyc' ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setActivePanel('kyc')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">KYC</h3>
                <p className="text-xs text-muted-foreground">
                  Verify documents
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              activePanel === 'risk' ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setActivePanel('risk')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Risk</h3>
                <p className="text-xs text-muted-foreground">Monitor risks</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Panel Content */}
        <Card className="min-h-96">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                {getPanelIcon(activePanel)}
              </div>
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {activePanel} Management
                </h2>
                <p className="text-muted-foreground">
                  {activePanel === 'leads' &&
                    'Manage new registrations, fund accounts, and review KYC'}
                  {activePanel === 'users' &&
                    'Manage user accounts and virtual funding'}
                  {activePanel === 'kyc' &&
                    'Review and approve KYC document submissions'}
                  {activePanel === 'risk' &&
                    'Monitor and resolve system risk events'}
                </p>
              </div>
            </div>

            {/* Panel Content */}
            {activePanel === 'leads' && (
              <LeadsPanel refreshTrigger={refreshTrigger} />
            )}

            {activePanel === 'users' && (
              <UsersPanel refreshTrigger={refreshTrigger} />
            )}

            {activePanel === 'kyc' && (
              <KYCPanel refreshTrigger={refreshTrigger} />
            )}

            {activePanel === 'risk' && (
              <RiskPanel refreshTrigger={refreshTrigger} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
