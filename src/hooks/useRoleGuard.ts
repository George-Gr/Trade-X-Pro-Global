/**
 * Role verification hook for client-side route protection
 * Works in conjunction with server-side RLS policies
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AppRole = 'admin' | 'user';

interface RoleGuardState {
  isLoading: boolean;
  hasRole: boolean;
  userRoles: AppRole[];
  error: string | null;
}

interface UseRoleGuardOptions {
  requiredRole?: AppRole;
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Hook to check if user has required role
 */
export function useRoleGuard(
  options: UseRoleGuardOptions = {}
): RoleGuardState & {
  checkRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
} {
  const { requiredRole, redirectTo = '/dashboard', showToast = true } = options;
  const navigate = useNavigate();

  const [state, setState] = useState<RoleGuardState>({
    isLoading: true,
    hasRole: false,
    userRoles: [],
    error: null,
  });

  const fetchUserRoles = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({
          isLoading: false,
          hasRole: false,
          userRoles: [],
          error: 'Not authenticated',
        });
        return;
      }

      // Fetch roles from user_roles table (RLS protects this)
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        logger.error('Failed to fetch user roles', error);
        setState({
          isLoading: false,
          hasRole: false,
          userRoles: [],
          error: error.message,
        });
        return;
      }

      const userRoles = (roles || []).map((r) => r.role as AppRole);
      const hasRequiredRole = requiredRole
        ? userRoles.includes(requiredRole)
        : true;

      setState({
        isLoading: false,
        hasRole: hasRequiredRole,
        userRoles,
        error: null,
      });

      // Handle unauthorized access
      if (requiredRole && !hasRequiredRole) {
        logger.warn('Unauthorized access attempt', {
          userId: user.id,
          metadata: {
            requiredRole,
            userRoles,
          },
        });

        if (showToast) {
          toast.error('Access Denied', {
            description: 'You do not have permission to access this page.',
          });
        }

        navigate(redirectTo);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Role guard error', error);
      setState({
        isLoading: false,
        hasRole: false,
        userRoles: [],
        error: errorMessage,
      });
    }
  }, [requiredRole, redirectTo, showToast, navigate]);

  useEffect(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  const checkRole = useCallback(
    (role: AppRole): boolean => {
      return state.userRoles.includes(role);
    },
    [state.userRoles]
  );

  return {
    ...state,
    checkRole,
    refreshRoles: fetchUserRoles,
  };
}

/**
 * Hook specifically for admin access
 */
export function useAdminGuard(redirectTo = '/dashboard') {
  return useRoleGuard({
    requiredRole: 'admin',
    redirectTo,
    showToast: true,
  });
}

/**
 * Simple hook to check if current user is admin
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!roles);
      } catch (error) {
        logger.error('Admin check failed', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, isLoading };
}

export default useRoleGuard;
