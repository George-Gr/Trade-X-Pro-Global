import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
const typedSupabase = supabase as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    typedSupabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminRole(session.user.id);
        } else {
          setLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = typedSupabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      // First try to get user's roles
      const { data: rolesData, error: rolesError } = await typedSupabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        logger.error('Error fetching user roles', rolesError);
        setIsAdmin(false);
        return;
      }

      // Check if user has admin role
      const isAdminRole =
        rolesData?.some((role: { role: string }) => role.role === 'admin') ||
        false;
      setIsAdmin(isAdminRole);
    } catch (error) {
      logger.error('Error checking admin role', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ data: Session | null; error: Error | null }> => {
    try {
      const { data, error } = await typedSupabase.auth.signInWithPassword({
        email,
        password,
      });

      // Enhanced error handling for common issues
      if (error) {
        logger.error('Authentication error', {
          error,
          message: error.message,
        });

        // Provide more user-friendly error messages
        let friendlyMessage = error.message;

        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage =
            'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage =
            'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage =
            'Too many login attempts. Please wait a moment before trying again.';
        } else if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_NAME_NOT_RESOLVED')
        ) {
          friendlyMessage =
            'Connection error. Please check your internet connection and try again.';
        }

        return { data, error: { ...error, message: friendlyMessage } };
      }

      return { data, error };
    } catch (error) {
      logger.error('Unexpected authentication error', error);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
        },
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ data: Session | null; error: Error | null }> => {
    const { data, error } = await typedSupabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      return { data: null, error: new Error('Sign-up failed') };
    }
    return { data, error: null };
  };

  const signOut = async (): Promise<{
    error: { message: string; name?: string } | null;
  }> => {
    const { error } = await typedSupabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
};
