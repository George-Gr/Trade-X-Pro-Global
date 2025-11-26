import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskLevelColors(riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation') {
  const colors = {
    safe: { text: 'text-status-safe', bg: 'bg-status-safe', border: 'border-status-safe' },
    warning: { text: 'text-status-warning', bg: 'bg-status-warning', border: 'border-status-warning' },
    critical: { text: 'text-status-critical', bg: 'bg-status-critical', border: 'border-status-critical' },
    liquidation: { text: 'text-status-error', bg: 'bg-status-error', border: 'border-status-error' },
  };
  return colors[riskLevel];
}

/**
 * Keyboard navigation utilities for sidebar components
 */

/**
 * Focus the next menu item in the sidebar
 * @param currentItem - The current focused element
 * @param containerSelector - CSS selector for the container with menu items
 */
export function focusNextMenuItem(currentItem: HTMLElement, containerSelector: string = '[role="menu"], [data-sidebar="content"]') {
  const container = currentItem.closest(containerSelector) || document.querySelector(containerSelector);
  if (!container) return;

  const menuItems = Array.from(container.querySelectorAll('[role="menuitem"][tabIndex="0"]')) as HTMLElement[];
  const currentIndex = menuItems.indexOf(currentItem);
  
  if (currentIndex >= 0 && currentIndex < menuItems.length - 1) {
    menuItems[currentIndex + 1].focus();
  } else if (currentIndex === menuItems.length - 1 && menuItems.length > 0) {
    // Wrap to first item
    menuItems[0].focus();
  }
}

/**
 * Focus the previous menu item in the sidebar
 * @param currentItem - The current focused element
 * @param containerSelector - CSS selector for the container with menu items
 */
export function focusPrevMenuItem(currentItem: HTMLElement, containerSelector: string = '[role="menu"], [data-sidebar="content"]') {
  const container = currentItem.closest(containerSelector) || document.querySelector(containerSelector);
  if (!container) return;

  const menuItems = Array.from(container.querySelectorAll('[role="menuitem"][tabIndex="0"]')) as HTMLElement[];
  const currentIndex = menuItems.indexOf(currentItem);
  
  if (currentIndex > 0) {
    menuItems[currentIndex - 1].focus();
  } else if (currentIndex === 0 && menuItems.length > 0) {
    // Wrap to last item
    menuItems[menuItems.length - 1].focus();
  }
}

/**
 * Focus the first menu item in the sidebar
 * @param containerSelector - CSS selector for the container with menu items
 */
export function focusFirstMenuItem(containerSelector: string = '[role="menu"], [data-sidebar="content"]') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const firstItem = container.querySelector('[role="menuitem"][tabIndex="0"]') as HTMLElement;
  firstItem?.focus();
}

/**
 * Focus the last menu item in the sidebar
 * @param containerSelector - CSS selector for the container with menu items
 */
export function focusLastMenuItem(containerSelector: string = '[role="menu"], [data-sidebar="content"]') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const menuItems = Array.from(container.querySelectorAll('[role="menuitem"][tabIndex="0"]')) as HTMLElement[];
  const lastItem = menuItems[menuItems.length - 1];
  lastItem?.focus();
}

/**
 * Handle keyboard navigation for menu items
 * @param event - The keyboard event
 * @param navigate - Navigation function
 * @param path - The path to navigate to
 * @param containerSelector - CSS selector for the container with menu items
 */
export function handleMenuKeyboardNavigation(
  event: React.KeyboardEvent,
  navigate?: (path: string) => void,
  path?: string,
  containerSelector: string = '[role="menu"], [data-sidebar="content"]'
) {
  const { key } = event;
  const currentTarget = event.currentTarget as HTMLElement;

  switch (key) {
    case 'Enter':
    case ' ':
      if (path && navigate) {
        event.preventDefault();
        navigate(path);
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusNextMenuItem(currentTarget, containerSelector);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPrevMenuItem(currentTarget, containerSelector);
      break;
    case 'Home':
      event.preventDefault();
      focusFirstMenuItem(containerSelector);
      break;
    case 'End':
      event.preventDefault();
      focusLastMenuItem(containerSelector);
      break;
    default:
      break;
  }
}

/**
 * Get the appropriate ARIA current state for navigation items
 * @param isActive - Whether the item is currently active
 * @param isPage - Whether this represents the current page (vs section)
 */
export function getAriaCurrentState(isActive: boolean, isPage: boolean = true): string | undefined {
  return isActive ? (isPage ? "page" : "step") : undefined;
}

/**
 * Generate accessible label for navigation items
 * @param baseLabel - The base label of the navigation item
 * @param isActive - Whether the item is currently active
 * @param isDisabled - Whether the item is disabled
 */
export function generateNavigationAriaLabel(baseLabel: string, isActive: boolean = false, isDisabled: boolean = false): string {
  let label = `Navigate to ${baseLabel}`;
  
  if (isActive) {
    label += ' (current page)';
  }
  
  if (isDisabled) {
    label += ' (disabled)';
  }
  
  return label;
}
