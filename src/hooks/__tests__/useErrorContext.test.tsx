import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ErrorContextProvider } from '@/components/ErrorContextProvider';
import { useErrorContext } from '@/hooks/useErrorContext';
import { logger } from '@/lib/logger';

/**
 * Test suite for useErrorContext hook
 * Tests: context provider, hook usage, context setting, error logging
 */

// Test component that uses the hook
function TestComponent() {
  const { setContext, getContext, logError, addBreadcrumb, getBreadcrumbs } =
    useErrorContext();

  return (
    <div>
      <button
        onClick={() =>
          setContext({
            userId: 'user-123',
            page: 'test',
            component: 'TestComponent',
          })
        }
      >
        Set Context
      </button>
      <button
        onClick={() => {
          const context = getContext();
          return <div data-testid="context">{JSON.stringify(context)}</div>;
        }}
      >
        Get Context
      </button>
      <button
        onClick={() => logError('Test error', new Error('Test error message'))}
      >
        Log Error
      </button>
      <button
        onClick={() => addBreadcrumb('test_action', 'Test action performed')}
      >
        Add Breadcrumb
      </button>
      <button
        onClick={() => {
          const breadcrumbs = getBreadcrumbs();
          return <div data-testid="breadcrumbs">{breadcrumbs.length}</div>;
        }}
      >
        Get Breadcrumbs
      </button>
    </div>
  );
}

describe('useErrorContext', () => {
  beforeEach(() => {
    logger.clearGlobalContext();
    logger.clearBreadcrumbs();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useErrorContext must be used within ErrorContextProvider');

    console.error = originalError;
  });

  it('should provide context when wrapped in provider', () => {
    expect(() => {
      render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );
    }).not.toThrow();
  });

  it('should set and retrieve context', async () => {
    const { container } = render(
      <ErrorContextProvider>
        <div>
          <TestComponent />
        </div>
      </ErrorContextProvider>
    );

    const setContextBtn = container.querySelector(
      'button:nth-child(1)'
    ) as HTMLButtonElement;
    if (setContextBtn) {
      await act(async () => {
        setContextBtn.click();
      });

      // Wait a bit for state update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const context = logger.getGlobalContext();
      expect(context.userId).toBe('user-123');
      expect(context.page).toBe('test');
    }
  });

  it('should log errors with context', async () => {
    const { container } = render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    );

    // First set context
    const setContextBtn = container.querySelector(
      'button:nth-child(1)'
    ) as HTMLButtonElement;
    if (setContextBtn) {
      await act(async () => {
        setContextBtn.click();
      });
    }

    // Then log error
    const logErrorBtn = container.querySelector(
      'button:nth-child(3)'
    ) as HTMLButtonElement;
    if (logErrorBtn) {
      await act(async () => {
        logErrorBtn.click();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Error should be recorded
      const context = logger.getGlobalContext();
      expect(context.userId).toBe('user-123');
    }
  });

  it('should add breadcrumbs', async () => {
    // Clear breadcrumbs before this test
    logger.clearBreadcrumbs();

    const { container } = render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    );

    const addBreadcrumbBtn = container.querySelector(
      'button:nth-child(4)'
    ) as HTMLButtonElement;
    if (addBreadcrumbBtn) {
      await act(async () => {
        addBreadcrumbBtn.click();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const breadcrumbs = logger.getBreadcrumbs();
      expect(breadcrumbs.length).toBeGreaterThan(0);
      expect(breadcrumbs[0].category).toBe('test_action');
      expect(breadcrumbs[0].message).toBe('Test action performed');
    }
  });

  it('should retrieve breadcrumbs', async () => {
    // Clear breadcrumbs before this test
    logger.clearBreadcrumbs();

    const { container } = render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    );

    // Add multiple breadcrumbs
    const addBreadcrumbBtn = container.querySelector(
      'button:nth-child(4)'
    ) as HTMLButtonElement;
    if (addBreadcrumbBtn) {
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          addBreadcrumbBtn.click();
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const breadcrumbs = logger.getBreadcrumbs();
      expect(breadcrumbs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should handle multiple context updates', async () => {
    const { container } = render(
      <ErrorContextProvider>
        <TestComponent />
      </ErrorContextProvider>
    );

    const setContextBtn = container.querySelector(
      'button:nth-child(1)'
    ) as HTMLButtonElement;
    if (setContextBtn) {
      // First update
      await act(async () => {
        setContextBtn.click();
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      let context = logger.getGlobalContext();
      expect(context.userId).toBe('user-123');

      // Second update (additional context)
      logger.setGlobalContext({ action: 'execute_order' });

      await new Promise((resolve) => setTimeout(resolve, 50));

      context = logger.getGlobalContext();
      expect(context.userId).toBe('user-123');
      expect(context.action).toBe('execute_order');
    }
  });
});
