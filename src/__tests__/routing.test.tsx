import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Import the refactored components
import { EnhancedRouteWrapper } from '@/components/routing/EnhancedRouteWrapper';
import { ProgressiveLoadingWrapper } from '@/components/routing/ProgressiveLoadingWrapper';
import { AppRoutes } from '@/routes/routesConfig';

// Mock the lazy-loaded components
vi.mock('@/pages/Index', () => ({
  default: () => <div>Index Page</div>,
}));

vi.mock('@/pages/Register', () => ({
  default: () => <div>Register Page</div>,
}));

vi.mock('@/pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('@/components/auth/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@/contexts/AuthenticatedLayoutProvider', () => ({
  AuthenticatedLayoutProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div>{children}</div>,
}));

vi.mock('@/components/layout/MobileBottomNavigation', () => ({
  MobileBottomNavigation: () => <div>Mobile Navigation</div>,
}));

describe('Routing Refactoring', () => {
  describe('EnhancedRouteWrapper', () => {
    it('should render children when no auth requirements', () => {
      render(
        <EnhancedRouteWrapper path="/test">
          <div>Test Content</div>
        </EnhancedRouteWrapper>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      const props = {
        children: <div>Test</div>,
        path: '/test',
        requireAuth: true,
        requireKYC: true,
        adminOnly: true,
      };

      // This should not throw an error
      expect(() => {
        render(<EnhancedRouteWrapper {...props} />);
      }).not.toThrow();
    });
  });

  describe('ProgressiveLoadingWrapper', () => {
    it('should render children when all stages are loaded', () => {
      render(
        <ProgressiveLoadingWrapper stages={['stage1']} route="/test">
          <div>Test Content</div>
        </ProgressiveLoadingWrapper>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      const props = {
        children: <div>Test</div>,
        stages: ['stage1', 'stage2'],
        route: '/test',
      };

      // This should not throw an error
      expect(() => {
        render(<ProgressiveLoadingWrapper {...props} />);
      }).not.toThrow();
    });
  });

  describe('AppRoutes', () => {
    it('should render without errors', () => {
      expect(() => {
        render(
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });
});
