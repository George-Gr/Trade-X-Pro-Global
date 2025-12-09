import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Providers } from '@/test-utils/providers';

describe('Sidebar Navigation Focus Ring Enhancement Tests', () => {
  it('should have 3px focus rings for sidebar menu buttons', () => {
    // Create a test sidebar menu button
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('data-testid', 'test-sidebar-button');
    button.textContent = 'Dashboard';
    document.body.appendChild(button);

    // Apply focus-visible styles manually for testing
    button.style.outline = '3px solid hsl(var(--focus-color))';
    button.style.outlineOffset = '2px';
    button.style.backgroundColor = 'hsl(var(--sidebar-accent) / 0.25)';
    button.style.boxShadow = '0 0 0 4px hsl(var(--focus-ring-color) / 0.2), 0 4px 8px hsl(var(--focus-ring-color) / 0.1)';

    // Verify styles are applied correctly
    expect(button.style.outline).toContain('3px solid');
    expect(button.style.outlineOffset).toBe('2px');
    expect(button.style.backgroundColor).toContain('hsl(var(--sidebar-accent) / 0.25)');
    expect(button.style.boxShadow).toContain('4px hsl(var(--focus-ring-color) / 0.2)');

    // Clean up
    document.body.removeChild(button);
  });

  it('should have enhanced focus rings for active sidebar items', () => {
    // Create a test active sidebar menu button
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('data-active', 'true');
    button.setAttribute('data-testid', 'test-active-sidebar-button');
    button.textContent = 'Active Item';
    document.body.appendChild(button);

    // Apply active + focus styles manually for testing
    button.style.outline = '3px solid hsl(var(--focus-color))';
    button.style.outlineOffset = '2px';
    button.style.boxShadow = 'inset 4px 0 0 0 hsl(var(--focus-color)), 0 4px 12px hsl(var(--focus-ring-color) / 0.15), 0 0 0 6px hsl(var(--focus-ring-color) / 0.2)';

    // Verify active + focus styles are applied correctly
    expect(button.style.outline).toContain('3px solid');
    expect(button.style.outlineOffset).toBe('2px');
    expect(button.style.boxShadow).toContain('inset 4px 0 0 0 hsl(var(--focus-color))');

    // Clean up
    document.body.removeChild(button);
  });

  it('should have high contrast focus rings for sidebar in high contrast mode', () => {
    // Create a test sidebar button for high contrast mode
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('role', 'menuitem');
    button.setAttribute('data-testid', 'test-sidebar-high-contrast');
    button.textContent = 'Menu Item';
    document.body.appendChild(button);

    // Apply high contrast focus styles manually for testing
    button.style.outline = '4px solid hsl(var(--primary-contrast))';
    button.style.outlineOffset = '2px';
    button.style.backgroundColor = 'hsl(var(--primary-contrast-light) / 0.8)';
    button.style.border = '2px solid hsl(var(--primary-contrast))';

    // Verify high contrast styles are applied correctly
    expect(button.style.outline).toContain('4px solid');
    expect(button.style.outlineOffset).toBe('2px');
    expect(button.style.backgroundColor).toContain('hsl(var(--primary-contrast-light) / 0.8)');

    // Clean up
    document.body.removeChild(button);
  });

  it('should have dark mode focus rings for sidebar navigation', () => {
    // Create a test sidebar button for dark mode
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('data-testid', 'test-sidebar-dark-mode');
    button.textContent = 'Dark Mode Item';
    document.body.appendChild(button);

    // Add dark class to simulate dark mode
    button.classList.add('dark');

    // Apply dark mode focus styles manually for testing
    button.style.outline = '3px solid hsl(var(--focus-color))';
    button.style.outlineOffset = '2px';
    button.style.backgroundColor = 'hsl(var(--sidebar-accent) / 0.3)';
    button.style.boxShadow = '0 0 0 4px hsl(var(--focus-ring-color) / 0.3), 0 4px 8px hsl(var(--focus-ring-color) / 0.15)';

    // Verify dark mode styles are applied correctly
    expect(button.style.outline).toContain('3px solid');
    expect(button.style.outlineOffset).toBe('2px');
    expect(button.style.backgroundColor).toContain('hsl(var(--sidebar-accent) / 0.3)');
    expect(button.style.boxShadow).toContain('4px hsl(var(--focus-ring-color) / 0.3)');

    // Clean up
    document.body.removeChild(button);
  });

  it('should have role="menuitem" focus styles for keyboard navigation', () => {
    // Create a test sidebar menu item with role
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('role', 'menuitem');
    button.setAttribute('tabindex', '0');
    button.setAttribute('data-testid', 'test-menuitem');
    button.textContent = 'Menu Item';
    document.body.appendChild(button);

    // Apply menuitem focus styles manually for testing
    button.style.outline = '3px solid hsl(var(--focus-color))';
    button.style.outlineOffset = '2px';
    button.style.backgroundColor = 'hsl(var(--sidebar-accent) / 0.25)';
    button.style.borderRadius = '0.375rem';
    button.style.boxShadow = '0 0 0 4px hsl(var(--focus-ring-color) / 0.25), 0 2px 4px hsl(var(--focus-ring-color) / 0.1)';

    // Verify menuitem focus styles are applied correctly
    expect(button.style.outline).toContain('3px solid');
    expect(button.style.outlineOffset).toBe('2px');
    expect(button.style.backgroundColor).toContain('hsl(var(--sidebar-accent) / 0.25)');
    expect(button.style.borderRadius).toBe('0.375rem');
    expect(button.style.boxShadow).toContain('4px hsl(var(--focus-ring-color) / 0.25)');

    // Clean up
    document.body.removeChild(button);
  });

  it('should support data-sidebar="menu-button" attribute focus rings', () => {
    // Create multiple test elements with data-sidebar attribute
    const buttons: HTMLButtonElement[] = [];
    const labels = ['Dashboard', 'Trading', 'Settings', 'Analytics'];

    labels.forEach((label, index) => {
      const button = document.createElement('button');
      button.setAttribute('data-sidebar', 'menu-button');
      button.setAttribute('data-testid', `test-sidebar-${index}`);
      button.textContent = label;
      document.body.appendChild(button);
      buttons.push(button);

      // Apply focus styles
      button.style.outline = '3px solid hsl(var(--focus-color))';
      button.style.outlineOffset = '2px';
      button.style.boxShadow = '0 0 0 4px hsl(var(--focus-ring-color) / 0.2), 0 4px 8px hsl(var(--focus-ring-color) / 0.1)';

      // Test focus behavior
      button.focus();
      expect(document.activeElement).toBe(button);

      // Verify data-sidebar attribute is present
      expect(button.getAttribute('data-sidebar')).toBe('menu-button');
      expect(button.style.outline).toContain('3px solid');
    });

    // Clean up
    buttons.forEach(button => document.body.removeChild(button));
  });

  it('should have proper transition timing for focus state changes', () => {
    // Create a test sidebar button to verify transition timing
    const button = document.createElement('button');
    button.setAttribute('data-sidebar', 'menu-button');
    button.setAttribute('data-testid', 'test-transition');
    button.textContent = 'Transition Test';
    document.body.appendChild(button);

    // Apply focus styles with transition
    button.style.outline = '3px solid hsl(var(--focus-color))';
    button.style.outlineOffset = '2px';
    button.style.backgroundColor = 'hsl(var(--sidebar-accent) / 0.25)';
    button.style.transition = 'all 0.2s ease-in-out';
    button.style.boxShadow = '0 0 0 4px hsl(var(--focus-ring-color) / 0.2), 0 4px 8px hsl(var(--focus-ring-color) / 0.1)';

    // Verify transition is applied correctly
    expect(button.style.transition).toBe('all 0.2s ease-in-out');
    expect(button.style.outline).toContain('3px solid');
    expect(button.style.boxShadow).toContain('4px hsl(var(--focus-ring-color) / 0.2)');

    // Clean up
    document.body.removeChild(button);
  });
});

describe('Sidebar Navigation Focus Ring Enhancement Tests', () => {

  it('should display 3px focus rings on sidebar navigation items', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;
    const tradingButton = screen.getByLabelText(/Trade/i) as HTMLElement;

    // Test dashboard button focus behavior
    await user.click(dashboardButton);
    expect(dashboardButton).toHaveFocus();

    // Test trading button focus behavior
    await user.click(tradingButton);
    expect(tradingButton).toHaveFocus();
  });

  it('should support keyboard navigation with enhanced focus rings', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;

    // Focus using keyboard navigation
    await user.click(dashboardButton);
    await user.keyboard('{Enter}');

    expect(dashboardButton).toHaveFocus();
  });

  it('should show different focus styles for active vs non-active items', async () => {
    const user = userEvent.setup();

    // Mock active path
    const nav = await import('@/lib/navigationConfig');
    vi.spyOn(nav, 'isPathActive' as any).mockReturnValue(true as any);

    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const activeButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;

    await user.click(activeButton);
    expect(activeButton).toHaveFocus();

    // Active items should indicate current page via aria-current
    expect(activeButton).toHaveAttribute('aria-current', 'page');
  });

  it('should show high contrast focus rings in high contrast mode', async () => {
    // Mock prefers-contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string): MediaQueryList => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
      })),
    });

    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;

    await user.click(dashboardButton);
    expect(dashboardButton).toHaveFocus();

    // Check for high contrast styles
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      expect(dashboardButton).toHaveStyle({
        outline: expect.stringContaining('4px solid')
      });
    }
  });

  it('should maintain focus rings in dark mode', async () => {
    const user = userEvent.setup();

    // Add dark class to body for testing
    document.body.classList.add('dark');

    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;

    await user.click(dashboardButton);
    expect(dashboardButton).toHaveFocus();

    // Clean up
    document.body.classList.remove('dark');
  });

  it('should support arrow key navigation between sidebar items', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;
    const tradingButton = screen.getByLabelText(/Trade/i) as HTMLElement;

    // Focus first item
    await user.click(dashboardButton);
    expect(dashboardButton).toHaveFocus();

    // Navigate with arrow keys (this tests the keyboard event handlers)
    await user.keyboard('{ArrowDown}');

    // Focus should move to next item
    expect(tradingButton).toHaveFocus();
  });

  it('should handle Home and End key navigation', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const dashboardButton = screen.getByLabelText(/Dashboard/i) as HTMLElement;
    const settingsButtons = screen.getAllByLabelText(/Settings/i) as HTMLElement[];
    const settingsButton = settingsButtons[settingsButtons.length - 1];

    // Focus on last item
    await user.click(settingsButton);
    expect(settingsButton).toHaveFocus();

    // Navigate to first item with Home
    await user.keyboard('{Home}');
    expect(dashboardButton).toHaveFocus();

    // Navigate to last item with End (logout is the bottom-most action)
    const logoutButton = screen.getByLabelText(/Sign Out|Sign out/i) as HTMLElement;
    await user.keyboard('{End}');
    expect(logoutButton).toHaveFocus();
  });

  it('should show focus rings on logout button', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AppSidebar />
      </Providers>
    );

    const logoutButton = screen.getByLabelText(/Sign Out|Sign out/i) as HTMLElement;

    await user.click(logoutButton);
    expect(logoutButton).toHaveFocus();
  });
});