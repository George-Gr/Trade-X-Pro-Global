import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { getAriaCurrentState } from '@/lib/utils';
import { SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';

describe('getAriaCurrentState', () => {
  test('returns "page" when active and isPage true', () => {
    expect(getAriaCurrentState(true, true)).toBe('page');
  });

  test('returns "step" when active and isPage false', () => {
    expect(getAriaCurrentState(true, false)).toBe('step');
  });

  test('returns undefined when not active', () => {
    expect(getAriaCurrentState(false)).toBeUndefined();
  });
});

describe('DOM aria-current rendering', () => {
  test('button renders aria-current attribute when provided', () => {
    render(<button aria-current={getAriaCurrentState(true, true)}>Home</button>);

    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  test('button does not render aria-current when undefined', () => {
    render(<button>Home</button>);
    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).not.toHaveAttribute('aria-current');
  });
});

// Provide a minimal matchMedia polyfill for matching in JSDOM during tests
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('SidebarMenuButton attribute propagation', () => {
  test('SidebarMenuButton receives aria-current and renders it on the underlying button', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton {...{ 'aria-current': getAriaCurrentState(true, true) }}>Home</SidebarMenuButton>
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  test('SidebarMenuButton does not render aria-current when undefined', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton>Home</SidebarMenuButton>
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).not.toHaveAttribute('aria-current');
  });
});
