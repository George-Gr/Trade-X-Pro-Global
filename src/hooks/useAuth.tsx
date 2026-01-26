import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimiter';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/**
 * Creates a friendly error with the original error attached as a non-enumerable property
 *
 * @param message - The user-friendly error message
 * @param name - The error name/type
 * @param originalError - Optional original error to attach
 * @returns A configured Error instance
 */
const createAuthError = (
  message: string,
  name: string,
  originalError?: unknown
): Error => {
  const error = new Error(message);
  error.name = name;

  if (originalError) {
    Object.defineProperty(error, 'originalError', {
      value: originalError,
      enumerable: false,
      writable: false,
    });
  }

  return error;
};

/**
 * Authentication hook that manages user authentication state and provides auth methods
 *
 * @returns An object containing:
 * - `user` (User | null) - The currently authenticated user or null
 * - `loading` (boolean) - Whether the auth state is being loaded
 * - `isAdmin` (boolean) - Whether the current user has admin privileges
 * - `setUser` - Internal setter for user state (not exposed)
 * - `signIn` (email, password) => Promise - Sign in with email and password
 * - `signUp` (email, password, fullName) => Promise - Create a new user account
 * - `signOut` () => Promise - Sign out the current user
 *
 * @example
 * const { user, loading, isAdmin, signIn, signOut } = useAuth();
 *
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <LoginForm onSubmit={signIn} />;
 * return <Dashboard user={user} isAdmin={isAdmin} onLogout={signOut} />;
 */
export const useAuth = (): {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{error: Error | null}>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{error: Error | null}>;
  signOut: () => Promise<{error: Error | null}>;
  resetPassword: (email: string) => Promise<{error: Error | null}>;
  require2FA: boolean | undefined;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [require2FA, setRequire2FA] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminRole(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        logger.error('Failed to get session', err);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
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
      const { data: rolesData, error: rolesError } = await supabase
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
        (rolesData as { role: string }[] | null)?.some(
          (role) => role.role === 'admin'
        ) || false;
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
  ): Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }> => {
    // Check rate limit before attempting login
    const rateCheck = checkRateLimit('login');
    if (!rateCheck.allowed) {
      const rateLimitError = createAuthError(
        `Too many login attempts. Please wait ${Math.ceil(
          rateCheck.resetIn / 1000
        )} seconds before trying again.`,
        'RateLimitError'
      );
      logger.warn('Login rate limit exceeded', {
        metadata: {
          remaining: rateCheck.remaining,
          resetIn: rateCheck.resetIn,
        },
      });
      return {
        data: null,
        error: rateLimitError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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

        // Create a proper Error instance with original error details
        const friendlyError = createAuthError(
          friendlyMessage,
          'AuthError',
          error
        );

        return {
          data: null,
          error: friendlyError,
        };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected authentication error', error);
      const unexpectedError = createAuthError(
        'An unexpected error occurred. Please try again.',
        'UnexpectedAuthError',
        error instanceof Error ? error : undefined
      );

      return {
        data: null,
        error: unexpectedError,
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }> => {
    // Check rate limit before attempting registration
    const rateCheck = checkRateLimit('register');
    if (!rateCheck.allowed) {
      const rateLimitError = createAuthError(
        `Too many registration attempts. Please wait ${Math.ceil(
          rateCheck.resetIn / 1000
        )} seconds before trying again.`,
        'RateLimitError'
      );
      logger.warn('Registration rate limit exceeded', {
        metadata: {
          remaining: rateCheck.remaining,
          resetIn: rateCheck.resetIn,
        },
      });
      return {
        data: null,
        error: rateLimitError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
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
        const signUpError = createAuthError(
          'Sign-up failed',
          'SignUpError',
          error
        );

        return { data: null, error: signUpError };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected sign-up error', error);
      const unexpectedError = createAuthError(
        'An unexpected error occurred during sign-up. Please try again.',
        'UnexpectedSignUpError',
        error instanceof Error ? error : undefined
      );

      return { data: null, error: unexpectedError };
    }
  };

  const signOut = async (): Promise<{
    error: Error | null;
  }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const signOutError = createAuthError(
          error.message,
          'SignOutError',
          error
        );

        return { error: signOutError };
      }
      return { error: null };
    } catch (error: unknown) {
      logger.error('Sign out error', error);
      const unexpectedError = createAuthError(
        'Sign out failed',
        'UnexpectedSignOutError',
        error instanceof Error ? error : undefined
      );

      return { error: unexpectedError };
    }
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
