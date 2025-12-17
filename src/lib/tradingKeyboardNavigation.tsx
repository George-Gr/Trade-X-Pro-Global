import { useEffect, useRef, useCallback, useState } from 'react';
import { useKeyboardNavigation, useLiveRegion } from './advancedAccessibility';

/**
 * Enhanced Keyboard Navigation System for TradeX Pro
 * 
 * Comprehensive keyboard navigation with trading-specific shortcuts,
 * focus management, and accessibility enhancements.
 */

interface TradingShortcut {
  key: string;
  modifiers: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
  description: string;
  action: () => void;
  category: 'trading' | 'navigation' | 'charts' | 'general';
}

interface FocusManager {
  focusNextTradingField: () => void;
  focusPreviousTradingField: () => void;
  focusTradeButton: () => void;
  focusQuickActions: () => void;
  manageModalFocus: (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => void;
}

export function useTradingKeyboardShortcuts() {
  const [shortcuts, setShortcuts] = useState<TradingShortcut[]>([]);
  const liveRegion = useLiveRegion();

  const addShortcut = useCallback((shortcut: TradingShortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
  }, []);

  const removeShortcut = useCallback((key: string, modifiers: TradingShortcut['modifiers']) => {
    setShortcuts(prev => prev.filter(s => 
      s.key !== key || 
      s.modifiers.ctrl !== modifiers.ctrl ||
      s.modifiers.alt !== modifiers.alt ||
      s.modifiers.shift !== modifiers.shift ||
      s.modifiers.meta !== modifiers.meta
    ));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      
      // Skip if typing in input/textarea
      if (activeElement?.tagName === 'INPUT' || 
          activeElement?.tagName === 'TEXTAREA' || 
          activeElement?.hasAttribute('contenteditable')) {
        return;
      }

      // Check for registered shortcuts
      const matchingShortcut = shortcuts.find(shortcut => {
        return shortcut.key.toLowerCase() === event.key.toLowerCase() &&
               shortcut.modifiers.ctrl === event.ctrlKey &&
               shortcut.modifiers.alt === event.altKey &&
               shortcut.modifiers.shift === event.shiftKey &&
               shortcut.modifiers.meta === event.metaKey;
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          matchingShortcut.action();
          
          // Announce action to screen readers
          liveRegion.announce(`Executed: ${matchingShortcut.description}`);
        } catch (error) {
          liveRegion.announceError(`Failed to execute: ${matchingShortcut.description}`);
        }      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [shortcuts, liveRegion]);

  // Default trading shortcuts
  useEffect(() => {
    const defaultShortcuts: TradingShortcut[] = [
      // Trading Actions
      {
        key: 'b',
        modifiers: {},
        description: 'Buy order',
        action: () => {
          const buyButton = document.querySelector('[data-action="buy"]') as HTMLElement;
          buyButton?.click();
        },
        category: 'trading'
      },
      {
        key: 's',
        modifiers: {},
        description: 'Sell order',
        action: () => {
          const sellButton = document.querySelector('[data-action="sell"]') as HTMLElement;
          sellButton?.click();
        },
        category: 'trading'
      },
      {
        key: 'c',
        modifiers: {},
        description: 'Close position',
        action: () => {
          const closeButton = document.querySelector('[data-action="close-position"]') as HTMLElement;
          closeButton?.click();
        },
        category: 'trading'
      },
      {
        key: 'Enter',
        modifiers: {},
        description: 'Execute trade',
        action: () => {
          const executeButton = document.querySelector('[data-action="execute"]') as HTMLElement;
          executeButton?.click();
        },
        category: 'trading'
      },

      // Navigation
      {
        key: '1',
        modifiers: {},
        description: 'Go to Dashboard',
        action: () => {
          const dashboardLink = document.querySelector('[data-nav="dashboard"]') as HTMLElement;
          dashboardLink?.click();
        },
        category: 'navigation'
      },
      {
        key: '2',
        modifiers: {},
        description: 'Go to Trading',
        action: () => {
          const tradingLink = document.querySelector('[data-nav="trading"]') as HTMLElement;
          tradingLink?.click();
        },
        category: 'navigation'
      },
      {
        key: '3',
        modifiers: {},
        description: 'Go to Portfolio',
        action: () => {
          const portfolioLink = document.querySelector('[data-nav="portfolio"]') as HTMLElement;
          portfolioLink?.click();
        },
        category: 'navigation'
      },
      {
        key: '4',
        modifiers: {},
        description: 'Go to Charts',
        action: () => {
          const chartsLink = document.querySelector('[data-nav="charts"]') as HTMLElement;
          chartsLink?.click();
        },
        category: 'navigation'
      },

      // Charts
      {
        key: '+',
        modifiers: {},
        description: 'Zoom in chart',
        action: () => {
          const zoomInButton = document.querySelector('[data-chart="zoom-in"]') as HTMLElement;
          zoomInButton?.click();
        },
        category: 'charts'
      },
      {
        key: '-',
        modifiers: {},
        description: 'Zoom out chart',
        action: () => {
          const zoomOutButton = document.querySelector('[data-chart="zoom-out"]') as HTMLElement;
          zoomOutButton?.click();
        },
        category: 'charts'
      },
      {
        key: 'r',
        modifiers: {},
        description: 'Reset chart',
        action: () => {
          const resetButton = document.querySelector('[data-chart="reset"]') as HTMLElement;
          resetButton?.click();
        },
        category: 'charts'
      },

      // General
      {
        key: '/',
        modifiers: {},
        description: 'Focus search',
        action: () => {
          const searchInput = document.querySelector('[data-action="search"]') as HTMLElement;
          searchInput?.focus();
        },
        category: 'general'
      },
      {
        key: '?',
        modifiers: {},
        description: 'Show help',
        action: () => {
          liveRegion.announce('Keyboard shortcuts: B=Buy, S=Sell, C=Close, Enter=Execute, 1-4=Navigation, +=Zoom In, -=Zoom Out, R=Reset, /=Search, ?=Help');
        },
        category: 'general'
      }
    ];

    setShortcuts(defaultShortcuts);
  }, [liveRegion]);

  return {
    shortcuts,
    addShortcut,
    removeShortcut,
    getShortcutsByCategory: (category: TradingShortcut['category']) => 
      shortcuts.filter(s => s.category === category)
  };
}

/**
 * Trading-Specific Focus Manager
 */
export function useTradingFocusManager(): FocusManager {
  const keyboardNav = useKeyboardNavigation();
  const liveRegion = useLiveRegion();

  const focusNextTradingField = useCallback(() => {
    const tradingFields = document.querySelectorAll(
      '[data-trading-field], input[name="amount"], input[name="price"], input[name="stop-loss"], input[name="take-profit"]'
    );
    
    const currentIndex = Array.from(tradingFields).indexOf(document.activeElement as Element);
    
    if (currentIndex >= 0 && currentIndex < tradingFields.length - 1) {
      (tradingFields[currentIndex + 1] as HTMLElement).focus();
    } else if (currentIndex === -1 && tradingFields.length > 0) {
      (tradingFields[0] as HTMLElement).focus();
    }
    
    liveRegion.announce('Moved to next trading field');
  }, [liveRegion]);

  const focusPreviousTradingField = useCallback(() => {
    const tradingFields = document.querySelectorAll(
      '[data-trading-field], input[name="amount"], input[name="price"], input[name="stop-loss"], input[name="take-profit"]'
    );
    
    const currentIndex = Array.from(tradingFields).indexOf(document.activeElement as Element);
    
    if (currentIndex > 0) {
      (tradingFields[currentIndex - 1] as HTMLElement).focus();
    }
    
    liveRegion.announce('Moved to previous trading field');
  }, [liveRegion]);

  const focusTradeButton = useCallback(() => {
    const tradeButton = document.querySelector('[data-action="trade"], .trade-button, button[type="submit"]') as HTMLElement;
    if (tradeButton) {
      tradeButton.focus();
      liveRegion.announce('Focused trade button');
    }
  }, [liveRegion]);

  const focusQuickActions = useCallback(() => {
    const quickActions = document.querySelectorAll('[data-quick-action]');
    if (quickActions.length > 0) {
      (quickActions[0] as HTMLElement).focus();
      liveRegion.announce('Focused quick actions');
    }
  }, [liveRegion]);

  const manageModalFocus = useCallback((isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = keyboardNav.getFocusableElements(modalRef.current);
    
    if (focusableElements.length > 0) {
      // Focus first element
      focusableElements[0].focus();
    }

    // Trap focus within modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardNav]);

  return {
    focusNextTradingField,
    focusPreviousTradingField,
    focusTradeButton,
    focusQuickActions,
    manageModalFocus
  };
}

/**
 * Skip Navigation Links
 */
export function SkipNavigation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleTabPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      setIsVisible(false);
    };

    window.addEventListener('keydown', handleTabPress);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleTabPress);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 z-50">
      <div className="bg-primary text-primary-foreground p-4 shadow-lg rounded-br-lg">
        <h2 className="font-semibold mb-2">Skip to:</h2>
        <div className="space-x-2">
          <a 
            href="#main-content"
            className="px-3 py-2 bg-white text-primary rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => {
              const mainContent = document.getElementById('main-content');
              mainContent?.focus();
            }}
          >
            Main Content
          </a>
          <a 
            href="#trading-panel"
            className="px-3 py-2 bg-white text-primary rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Trading Panel
          </a>
          <a 
            href="#charts"
            className="px-3 py-2 bg-white text-primary rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Charts
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Accessible Trading Form Hook
 */
export function useAccessibleTradingForm() {
  const focusManager = useTradingFocusManager();
  const liveRegion = useLiveRegion();

  const handleFormSubmit = useCallback((formData: Record<string, any>) => {
    // Announce form submission
    liveRegion.announceLoading('Processing trade...');
    
    // Simulate API call
    setTimeout(() => {
      liveRegion.announceSuccess('Trade executed successfully');
    }, 1000);
  }, [liveRegion]);

  const handleFieldError = useCallback((fieldName: string, error: string) => {
    liveRegion.announceError(`${fieldName}: ${error}`);
  }, [liveRegion]);

  return {
    ...focusManager,
    handleFormSubmit,
    handleFieldError
  };
}

export default {
  useTradingKeyboardShortcuts,
  useTradingFocusManager,
  SkipNavigation,
  useAccessibleTradingForm
};