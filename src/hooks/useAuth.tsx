import { logFailedAuth, logSuccessfulAuth } from '@/lib/securityLogger';
import { supabase } from '@/lib/supabaseBrowserClient';
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { z } from 'zod';
import { SecureStorage, initializeEncryption } from '@/lib/encryption';

// Input validation schemas
const authSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

const signUpSchema = authSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name too long').trim(),
});

// Rate limiting class for authentication attempts
class AuthRateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    // Clean up expired records
    if (record && now > record.resetTime) {
      this.attempts.delete(identifier);
      return true;
    }

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false; // Blocked
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;

    const now = Date.now();
    if (now > record.resetTime) {
      this.attempts.delete(identifier);
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  getResetTime(identifier: string): number | null {
    const record = this.attempts.get(identifier);
    if (!record) return null;

    const now = Date.now();
    if (now > record.resetTime) {
      this.attempts.delete(identifier);
      return null;
    }

    return record.resetTime;
  }
}

// Global rate limiter instance
const rateLimiter = new AuthRateLimiter();

// Helper function to get client IP (approximate)
const getClientIP = (): string => {
  // In a real application, this would come from the server
  // For client-side, we can use a hash of user agent and other browser properties
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a simple hash for identification
  const hashInput = `${userAgent}:${screenResolution}:${timezone}`;
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `client:${Math.abs(hash)}`;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize encryption service on mount
  useEffect(() => {
    const initEncryption = async () => {
      const initialized = await initializeEncryption();
      if (!initialized) {
        console.warn('Encryption service could not be initialized');
      }
    };
    initEncryption();
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      // First try to get user's roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setIsAdmin(false);
        return;
      }

      // Check if user has admin role
      const isAdminRole = rolesData?.some(role => role.role === 'admin') || false;
      setIsAdmin(isAdminRole);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Rate limiting check
      const clientIP = getClientIP();
      const rateLimitKey = `${clientIP}:${email}`;

      if (!rateLimiter.checkLimit(rateLimitKey)) {
        const remainingAttempts = rateLimiter.getRemainingAttempts(rateLimitKey);
        const resetTime = rateLimiter.getResetTime(rateLimitKey);

        return {
          data: null,
          error: {
            message: `Too many login attempts. Please try again in ${Math.ceil((resetTime! - Date.now()) / 60000)} minutes.`,
            code: 'RATE_LIMIT_EXCEEDED' as const,
            remainingAttempts,
            resetTime
          }
        };
      }

      // Sanitize and validate inputs
      const validatedInputs = authSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedInputs.email,
        password: validatedInputs.password,
      });

      // Log failed attempts for security monitoring
      if (error) {
        logFailedAuth(email, error.message, clientIP, navigator.userAgent);
      } else {
        // Log successful authentication
        logSuccessfulAuth(data?.user?.id || '', email, clientIP, navigator.userAgent);
      }

      return { data, error };
    } catch (error) {
      // Return validation error in a format that can be handled by the UI
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Invalid input format',
          code: 'VALIDATION_ERROR' as const
        }
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Sanitize and validate inputs
      const validatedInputs = signUpSchema.parse({ email, password, fullName });

      const { data, error } = await supabase.auth.signUp({
        email: validatedInputs.email,
        password: validatedInputs.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedInputs.fullName,
          },
        },
      });
      return { data, error };
    } catch (error) {
      // Return validation error in a format that can be handled by the UI
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Invalid input format',
          code: 'VALIDATION_ERROR' as const
        }
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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
