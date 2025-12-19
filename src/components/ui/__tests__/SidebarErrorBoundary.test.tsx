import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
  SidebarErrorBoundary,
  NavigationItemErrorBoundary,
} from '@/components/ui/SidebarErrorBoundary';

// Mock component that throws an error
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error from throwing component');
  }
  return <div>Normal component</div>;
};

// Mock component for testing
const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  return (
    <div>
      <h1>Test Component</h1>
      {shouldThrow && <ThrowingComponent shouldThrow={shouldThrow} />}
      <p>This should render normally</p>
    </div>
  );
};

describe('SidebarErrorBoundary', () => {
  beforeEach(() => {
    // Mock console.error to capture error logging
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children normally when no error occurs', () => {
    render(
      <SidebarErrorBoundary>
        <TestComponent />
      </SidebarErrorBoundary>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('This should render normally')).toBeInTheDocument();
  });

  it('should catch and handle errors gracefully', () => {
    render(
      <SidebarErrorBoundary>
        <TestComponent shouldThrow={true} />
      </SidebarErrorBoundary>
    );

    // Should show error fallback instead of the component
    expect(screen.getByText('Navigation Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're experiencing issues with the navigation menu. This could be due to a temporary error or network issue."
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    // Should not show the normal component content
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    expect(
      screen.queryByText('This should render normally')
    ).not.toBeInTheDocument();
  });

  it('should display error details when clicked', () => {
    render(
      <SidebarErrorBoundary>
        <TestComponent shouldThrow={true} />
      </SidebarErrorBoundary>
    );

    // Error details summary should be visible initially
    expect(
      screen.getByText('Error Details (for developers)')
    ).toBeInTheDocument();

    // Click to expand error details
    const detailsSummary = screen.getByText('Error Details (for developers)');
    fireEvent.click(detailsSummary);

    expect(
      screen.getByText('Error Details (for developers)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Test error from throwing component')
    ).toBeInTheDocument();
  });

  it('should call custom onError handler when error occurs', () => {
    const mockOnError = vi.fn();

    render(
      <SidebarErrorBoundary onError={mockOnError}>
        <TestComponent shouldThrow={true} />
      </SidebarErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error from throwing component',
      }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should work with custom fallback component', () => {
    const CustomFallback = ({
      error,
      onRetry,
    }: {
      error?: Error;
      onRetry?: () => void;
    }) => (
      <div data-testid="custom-fallback">
        <h3>Custom Error: {error?.message}</h3>
        <button onClick={onRetry} data-testid="custom-retry">
          Custom Retry
        </button>
      </div>
    );

    render(
      <SidebarErrorBoundary fallback={CustomFallback}>
        <TestComponent shouldThrow={true} />
      </SidebarErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(
      screen.getByText('Custom Error: Test error from throwing component')
    ).toBeInTheDocument();
    expect(screen.getByTestId('custom-retry')).toBeInTheDocument();
  });
});

describe('NavigationItemErrorBoundary', () => {
  it('should render navigation item normally when no error occurs', () => {
    render(
      <NavigationItemErrorBoundary itemName="Dashboard">
        <div data-testid="nav-item">Dashboard</div>
      </NavigationItemErrorBoundary>
    );

    expect(screen.getByTestId('nav-item')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should show error state for navigation item errors', () => {
    render(
      <NavigationItemErrorBoundary itemName="Dashboard">
        <ThrowingComponent shouldThrow={true} />
      </NavigationItemErrorBoundary>
    );

    // Should show error placeholder instead of the component
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // The title attribute contains the error message on the container div
    expect(screen.getByText('Dashboard').parentElement).toHaveAttribute(
      'title',
      expect.stringContaining('is temporarily unavailable due to an error')
    );

    // Should not show the normal component content
    expect(screen.queryByText('Normal component')).not.toBeInTheDocument();
  });

  it('should call custom onError handler for navigation item errors', () => {
    const mockOnError = vi.fn();

    render(
      <NavigationItemErrorBoundary itemName="Dashboard" onError={mockOnError}>
        <ThrowingComponent shouldThrow={true} />
      </NavigationItemErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error from throwing component',
      }),
      'Dashboard'
    );
  });
});
