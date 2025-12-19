import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/notificationContextHelpers';
import { useToast } from '@/hooks/use-toast';
import {
  AuthenticatedLayoutContext,
  type AuthenticatedLayoutContextType,
} from '@/contexts/AuthenticatedLayoutContext';
import { formatToastError } from '@/lib/errorMessageService';

// Provider component
export function AuthenticatedLayoutProvider({
  children,
}: { children?: React.ReactNode } = {}) {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        const actionableError = formatToastError(error, 'authentication');
        toast({
          ...actionableError,
          variant: actionableError.variant as 'default' | 'destructive',
        });
      } else {
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out',
        });
        setSidebarOpen(false);
      }
    } catch (error) {
      const actionableError = formatToastError(error, 'authentication');
      toast({
        ...actionableError,
        variant: actionableError.variant as 'default' | 'destructive',
      });
    }
  };

  // Reset sidebar when auth state changes
  useEffect(() => {
    if (!user) {
      setSidebarOpen(false);
    }
  }, [user]);

  const value: AuthenticatedLayoutContextType = {
    // Auth state
    user,
    isAdmin,
    authLoading,

    // Notification state
    unreadCount,
    markAsRead,
    markAllAsRead,

    // Layout state
    sidebarOpen,
    setSidebarOpen,

    // Header actions
    handleLogout,
  };

  return (
    <AuthenticatedLayoutContext.Provider value={value}>
      {children}
    </AuthenticatedLayoutContext.Provider>
  );
}
