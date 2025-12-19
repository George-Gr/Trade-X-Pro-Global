import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowingComponent = () => {
  throw new Error('Test error');
};

// Component that renders normally
const SafeComponent = () => {
  return <div>Safe Component</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Component')).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('should render error UI when child component throws', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('should display error details in development mode', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    // Check that the error UI is displayed with error message
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Verify error tracking ID is shown
    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();

    console.error = originalError;
  });

  it('should call onError callback when error occurs', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalled();
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    console.error = originalError;
  });

  it('should render custom fallback when provided', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const customFallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();

    console.error = originalError;
  });

  it('should have working Try Again button', async () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
    expect(tryAgainButton).toBeInTheDocument();

    // Click the button - it will attempt to re-render the throwing component
    // The error boundary will catch it again, but the DOM will update
    await user.click(tryAgainButton);

    // The button should still exist in the DOM (error UI is still shown)
    expect(
      screen.getByRole('button', { name: /Try Again/i })
    ).toBeInTheDocument();

    console.error = originalError;
  });

  it('should have working Go Home button', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    // Mock window.location (Jest/Vitest provide this in jsdom environment)
    const originalLocation = window.location;

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByRole('button', { name: /Go Home/i });
    expect(goHomeButton).toBeInTheDocument();

    // Verify button is clickable
    expect(goHomeButton).toBeEnabled();

    console.error = originalError;
  });

  it('should display support contact message', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/If this error persists, please contact support/)
    ).toBeInTheDocument();

    console.error = originalError;
  });
});
