import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// Update the import path below to match the actual file location and name (case-sensitive)
import { AuthenticatedLayoutContext } from '@/contexts/AuthenticatedLayoutContext';

/**
 * Test providers wrapper component that sets up the necessary context providers
 * for testing components that require routing, query management, sidebar, and auth context.
 *
 * @param props - Component props
 * @param props.children - React children to be wrapped by the providers
 * @returns JSX.Element containing all necessary providers for testing
 */
export const Providers: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    []
  );

  // Minimal test implementation for AuthenticatedLayoutContext to avoid requiring full auth stack in unit tests
  const testAuthLayout = React.useMemo(
    () => ({
      // Provide a minimal non-null user for tests that render authenticated UI
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      isAdmin: false,
      authLoading: false,
      unreadCount: 0,
      markAsRead: async (_id: string) => {
        /* noop */
      },
      markAllAsRead: async () => {
        /* noop */
      },
      sidebarOpen: false,
      setSidebarOpen: (_open: boolean) => {
        /* noop */
      },
      handleLogout: async () => {
        /* noop */
      },
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthenticatedLayoutContext.Provider value={testAuthLayout}>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthenticatedLayoutContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default Providers;
