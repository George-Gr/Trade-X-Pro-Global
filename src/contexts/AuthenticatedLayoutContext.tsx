import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/contexts/notificationContextHelpers";
import { useToast } from "@/hooks/use-toast";

// Types for the context
export interface AuthenticatedLayoutContextType {
  // Auth state
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  
  // Notification state
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Layout state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Header actions
  handleLogout: () => Promise<void>;
}

// Create the context
export const AuthenticatedLayoutContext = createContext<AuthenticatedLayoutContextType | undefined>(undefined);

// Hook to use the context
export function useAuthenticatedLayout() {
  const context = useContext(AuthenticatedLayoutContext);
  if (context === undefined) {
    throw new Error('useAuthenticatedLayout must be used within an AuthenticatedLayoutProvider');
  }
  return context;
}

// Simplified hook for just auth data
export function useAuthData() {
  const { user, isAdmin, authLoading } = useAuthenticatedLayout();
  return { user, isAdmin, loading: authLoading };
}