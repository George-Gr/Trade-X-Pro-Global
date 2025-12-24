import React from 'react';
import { useLocation } from 'react-router-dom';

// Enhanced routing infrastructure
import { useKycTrading } from '@/hooks/useKycTrading';
import { useOptimizedRouting } from '@/hooks/useOptimizedRouting';

// Core components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthenticatedLayoutProvider } from '@/contexts/AuthenticatedLayoutProvider';

// Mobile navigation with lazy loading
const MobileBottomNavigation = React.lazy(() =>
  import('@/components/layout/MobileBottomNavigation').then((module) => ({
    default: module.MobileBottomNavigation,
  }))
);

// Props interface for EnhancedRouteWrapper
interface EnhancedRouteWrapperProps {
  children: React.ReactNode;
  path: string;
  requireAuth?: boolean;
  requireKYC?: boolean;
  adminOnly?: boolean;
}

// Enhanced route wrapper with error boundaries and performance tracking
export const EnhancedRouteWrapper: React.FC<EnhancedRouteWrapperProps> = ({
  children,
  path,
  requireAuth = false,
  requireKYC = false,
  adminOnly = false,
}) => {
  const location = useLocation();
  const { getRouteErrorBoundary, getRouteLoadingComponent } =
    useOptimizedRouting();
  const { canTrade, isLoading: kycLoading } = useKycTrading();

  // Get route-specific error boundary and loading component
  const RouteErrorBoundary = getRouteErrorBoundary(path);
  const LoadingComponent = getRouteLoadingComponent(path);

  // Show loading while checking KYC status
  if (requireKYC && kycLoading) {
    return (
      <RouteErrorBoundary routeName={path} fallback={<LoadingComponent />}>
        <LoadingComponent />
      </RouteErrorBoundary>
    );
  }

  // Check KYC requirement
  if (requireKYC && !canTrade) {
    return (
      <RouteErrorBoundary routeName={path} fallback={<LoadingComponent />}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href="/kyc"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
              >
                Complete KYC
              </a>
              <a
                href="/"
                className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </RouteErrorBoundary>
    );
  }

  return (
    <RouteErrorBoundary routeName={path} fallback={<LoadingComponent />}>
      <React.Suspense fallback={<LoadingComponent />}>
        {requireAuth ? (
          <ProtectedRoute adminOnly={adminOnly}>
            <AuthenticatedLayoutProvider>
              {children}
              {/* Mobile navigation for authenticated routes */}
              <React.Suspense fallback={null}>
                <MobileBottomNavigation />
              </React.Suspense>
            </AuthenticatedLayoutProvider>
          </ProtectedRoute>
        ) : (
          children
        )}
      </React.Suspense>
    </RouteErrorBoundary>
  );
};