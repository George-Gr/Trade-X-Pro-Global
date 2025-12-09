import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthenticatedLayoutContext } from '@/contexts/AuthenticatedLayoutContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = React.useMemo(
    () => new QueryClient({
      defaultOptions: { queries: { retry: false } },
    }),
    []
  );

  // Minimal test implementation for AuthenticatedLayoutContext to avoid requiring full auth stack in unit tests
  const testAuthLayout = React.useMemo(() => ({
    // Provide a minimal non-null user for tests that render authenticated UI
    user: { id: 'test-user', name: 'Test User', email: 'test@example.com' } as any,
    isAdmin: false,
    authLoading: false,
    unreadCount: 0,
    markAsRead: async (_id: string) => {},
    markAllAsRead: async () => {},
    sidebarOpen: false,
    setSidebarOpen: (_open: boolean) => {},
    handleLogout: async () => {},
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthenticatedLayoutContext.Provider value={testAuthLayout}>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthenticatedLayoutContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
