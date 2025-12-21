import { useAuth } from '@/hooks/useAuth';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { useCallback, useEffect, useState } from 'react';

/**
 * Onboarding tour step configuration
 */
interface TourStep {
  element?: string;
  intro: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

/**
 * Trading platform onboarding tour steps
 */
const TRADING_TOUR_STEPS: TourStep[] = [
  {
    intro: `
      <div class="text-center">
        <h3 class="text-lg font-bold mb-2">Welcome to TradeX Pro! 🎉</h3>
        <p>Let's take a quick tour to help you get started with our trading platform.</p>
        <p class="text-sm text-muted-foreground mt-2">This tour will show you the essential features.</p>
      </div>
    `,
  },
  {
    element: '[data-tour="sidebar"]',
    intro: `
      <h4 class="font-semibold mb-2">Navigation Menu</h4>
      <p>Access all platform features from here:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li><strong>Dashboard</strong> - Overview of your account</li>
        <li><strong>Trade</strong> - Execute trades</li>
        <li><strong>Portfolio</strong> - View open positions</li>
        <li><strong>History</strong> - Past trades & reports</li>
      </ul>
    `,
    position: 'right',
  },
  {
    element: '[data-tour="trading-panel"]',
    intro: `
      <h4 class="font-semibold mb-2">Trading Panel</h4>
      <p>This is where you execute trades:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Select <strong>Market</strong> for instant execution</li>
        <li>Use <strong>Limit</strong> to set your price</li>
        <li>Set <strong>Stop Loss</strong> to manage risk</li>
        <li>Set <strong>Take Profit</strong> to lock in gains</li>
      </ul>
    `,
    position: 'left',
  },
  {
    element: '[data-tour="order-volume"]',
    intro: `
      <h4 class="font-semibold mb-2">Position Size</h4>
      <p>Adjust your trade volume in lots:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li><strong>0.01 lot</strong> = Micro lot (1,000 units)</li>
        <li><strong>0.1 lot</strong> = Mini lot (10,000 units)</li>
        <li><strong>1.0 lot</strong> = Standard lot (100,000 units)</li>
      </ul>
      <p class="text-sm text-warning mt-2">⚠️ Larger lots = Higher risk & reward</p>
    `,
    position: 'bottom',
  },
  {
    element: '[data-tour="buy-sell-buttons"]',
    intro: `
      <h4 class="font-semibold mb-2">Execute Trades</h4>
      <p>Click to open a position:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li><strong class="text-profit">BUY</strong> - You profit when price goes UP</li>
        <li><strong class="text-loss">SELL</strong> - You profit when price goes DOWN</li>
      </ul>
      <p class="text-sm text-muted-foreground mt-2">You'll see a confirmation before execution.</p>
    `,
    position: 'top',
  },
  {
    element: '[data-tour="chart"]',
    intro: `
      <h4 class="font-semibold mb-2">Price Chart</h4>
      <p>Analyze price movements with our interactive chart:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Multiple timeframes (1m to 1M)</li>
        <li>Technical indicators</li>
        <li>Drawing tools for analysis</li>
        <li>Real-time price updates</li>
      </ul>
    `,
    position: 'left',
  },
  {
    element: '[data-tour="account-info"]',
    intro: `
      <h4 class="font-semibold mb-2">Account Overview</h4>
      <p>Monitor your account metrics:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li><strong>Balance</strong> - Your available funds</li>
        <li><strong>Equity</strong> - Balance + unrealized P&L</li>
        <li><strong>Margin</strong> - Funds used for positions</li>
        <li><strong>Free Margin</strong> - Available for new trades</li>
      </ul>
    `,
    position: 'bottom',
  },
  {
    element: '[data-tour="notifications"]',
    intro: `
      <h4 class="font-semibold mb-2">Notifications</h4>
      <p>Stay informed about:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Order executions</li>
        <li>Margin warnings</li>
        <li>Price alerts</li>
        <li>Account updates</li>
      </ul>
    `,
    position: 'bottom',
  },
  {
    intro: `
      <div class="text-center">
        <h3 class="text-lg font-bold mb-2">You're Ready to Trade! 🚀</h3>
        <p>Remember these key points:</p>
        <ul class="text-left list-disc list-inside text-sm mt-2 space-y-1">
          <li>Always use <strong>Stop Loss</strong> to protect your capital</li>
          <li>Start with <strong>small positions</strong> while learning</li>
          <li>Check the <strong>Glossary</strong> for term definitions</li>
        </ul>
        <p class="text-sm text-warning mt-3">⚠️ CFD trading involves significant risk. Practice on demo first!</p>
      </div>
    `,
  },
];

/**
 * Portfolio page tour steps
 */
const PORTFOLIO_TOUR_STEPS: TourStep[] = [
  {
    intro: `
      <div class="text-center">
        <h3 class="text-lg font-bold mb-2">Portfolio Overview 📊</h3>
        <p>Learn how to manage your open positions.</p>
      </div>
    `,
  },
  {
    element: '[data-tour="positions-table"]',
    intro: `
      <h4 class="font-semibold mb-2">Open Positions</h4>
      <p>View and manage all your active trades:</p>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Real-time P&L updates</li>
        <li>Entry price vs current price</li>
        <li>Close positions with one click</li>
      </ul>
    `,
    position: 'top',
  },
  {
    element: '[data-tour="close-position"]',
    intro: `
      <h4 class="font-semibold mb-2">Close Positions</h4>
      <p>Click the X button to close a position and realize your P&L.</p>
      <p class="text-sm text-muted-foreground mt-2">You can also partially close positions.</p>
    `,
    position: 'left',
  },
];

interface OnboardingTourProps {
  /** Page context for tour selection */
  page?: 'trading' | 'portfolio' | 'history';
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Force show tour even if previously completed */
  forceShow?: boolean;
}

/**
 * Interactive onboarding tour component using intro.js
 *
 * @description
 * Provides step-by-step guidance for new users with:
 * - Context-specific tours for different pages
 * - Persistent completion state in user preferences
 * - Accessible keyboard navigation
 * - Skip and restart functionality
 *
 * @example
 * ```tsx
 * // Auto-show for first-time users
 * <OnboardingTour page="trading" />
 *
 * // Force show for help button
 * <OnboardingTour page="trading" forceShow={true} onComplete={() => setShowHelp(false)} />
 * ```
 */
export const OnboardingTour = ({
  page = 'trading',
  onComplete,
  forceShow = false,
}: OnboardingTourProps) => {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  // Check if user has completed the tour
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user) {
        setHasSeenTour(true);
        return;
      }

      // Check localStorage first for quick access
      const localKey = `onboarding_${page}_completed`;
      const localCompleted = localStorage.getItem(localKey);

      if (localCompleted === 'true' && !forceShow) {
        setHasSeenTour(true);
        return;
      }

      setHasSeenTour(false);
    };

    checkTourStatus();
  }, [user, page, forceShow]);

  // Mark tour as completed
  const markTourCompleted = useCallback(async () => {
    const localKey = `onboarding_${page}_completed`;
    localStorage.setItem(localKey, 'true');

    setHasSeenTour(true);
    onComplete?.();
  }, [page, onComplete]);

  // Start the tour
  useEffect(() => {
    if (hasSeenTour !== false) return;

    const steps =
      page === 'portfolio' ? PORTFOLIO_TOUR_STEPS : TRADING_TOUR_STEPS;

    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      const intro = introJs();

      intro.setOptions({
        steps: steps.map((step) => ({
          element: step.element
            ? document.querySelector(step.element) || undefined
            : undefined,
          intro: step.intro,
          title: step.title,
          position: (step.position === 'auto' ? 'bottom' : step.position) as
            | 'top'
            | 'bottom'
            | 'left'
            | 'right',
        })),
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        doneLabel: 'Finish',
        nextLabel: 'Next →',
        prevLabel: '← Back',
        skipLabel: 'Skip Tour',
        hidePrev: true,
        tooltipClass: 'onboarding-tooltip',
        highlightClass: 'onboarding-highlight',
        scrollToElement: true,
        scrollPadding: 50,
      });

      intro.oncomplete(() => {
        markTourCompleted();
      });

      intro.onexit(() => {
        markTourCompleted();
      });

      intro.start();
    }, 500);

    return () => clearTimeout(timer);
  }, [hasSeenTour, page, markTourCompleted]);

  return null; // This component doesn't render anything visible
};

/**
 * Hook to manually trigger onboarding tour
 * @returns Function to start the tour
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useOnboardingTour = () => {
  const startTour = useCallback(
    (page: 'trading' | 'portfolio' | 'history' = 'trading') => {
      // Remove the completed flag to show tour again
      localStorage.removeItem(`onboarding_${page}_completed`);

      // Trigger a re-render by dispatching a custom event
      window.dispatchEvent(
        new CustomEvent('restart-onboarding', { detail: { page } })
      );
    },
    []
  );

  return { startTour };
};

export default OnboardingTour;
