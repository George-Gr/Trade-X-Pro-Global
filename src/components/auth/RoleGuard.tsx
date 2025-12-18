/**
 * Role-based route protection component
 * Wraps routes that require specific user roles
 */

import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "user";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: AppRole;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that protects routes based on user role
 */
export function RoleGuard({
  children,
  requiredRole,
  redirectTo = "/dashboard",
  fallback,
}: RoleGuardProps) {
  const location = useLocation();
  const { isLoading, hasRole, error } = useRoleGuard({
    requiredRole,
    redirectTo,
    showToast: false, // Don't show toast from hook, component handles it
  });

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      )
    );
  }

  // Handle error state
  if (error) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, error: "Authentication required" }}
        replace
      />
    );
  }

  // Redirect if user doesn't have required role
  if (!hasRole) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location, error: "Insufficient permissions" }}
        replace
      />
    );
  }

  return <>{children}</>;
}

/**
 * Admin-only route guard
 */
export function AdminGuard({
  children,
  redirectTo = "/dashboard",
  fallback,
}: Omit<RoleGuardProps, "requiredRole">) {
  return (
    <RoleGuard requiredRole="admin" redirectTo={redirectTo} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * User route guard (any authenticated user with 'user' role)
 */
export function UserGuard({
  children,
  redirectTo = "/login",
  fallback,
}: Omit<RoleGuardProps, "requiredRole">) {
  return (
    <RoleGuard requiredRole="user" redirectTo={redirectTo} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export default RoleGuard;
