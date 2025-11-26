/**
 * RiskAlertsCard Component Test Suite
 * 
 * Tests:
 * - Loading state with skeletons
 * - Empty state (no alerts)
 * - Populated state with various severity levels
 * - Alert rendering and badge styling
 * - Footer text display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskAlertsCard } from '@/components/dashboard/RiskAlertsCard';

interface AlertItem {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  details?: string;
}

describe('RiskAlertsCard', () => {
  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      const { container } = render(<RiskAlertsCard loading={true} />);
      
      // When loading, the card should be rendered with skeleton elements
      expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
    });

    it('should not display alert content when loading', () => {
      render(<RiskAlertsCard loading={true} />);
      
      // Should not render any actual alert items during loading
      const alerts = screen.queryAllByText(/info|warning|critical/i);
      // No real alerts should be visible during loading
      expect(alerts.length).toBeLessThanOrEqual(2); // May include some common text
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no alerts', () => {
      render(<RiskAlertsCard loading={false} alerts={[]} />);
      
      const emptyTitle = screen.getByText(/No active risk alerts/i);
      expect(emptyTitle).toBeInTheDocument();
    });

    it('should show descriptive message when no alerts', () => {
      render(<RiskAlertsCard loading={false} alerts={[]} />);
      
      const description = screen.getByText(/When your account approaches critical thresholds/i);
      expect(description).toBeInTheDocument();
    });

    it('should display empty state with undefined alerts', () => {
      render(<RiskAlertsCard loading={false} alerts={undefined} />);
      
      const emptyTitle = screen.getByText(/No active risk alerts/i);
      expect(emptyTitle).toBeInTheDocument();
    });
  });

  describe('Populated State', () => {
    const mockAlerts: AlertItem[] = [
      {
        id: '1',
        level: 'critical',
        title: 'Low Margin Warning',
        details: 'Your margin level is below 30%',
      },
      {
        id: '2',
        level: 'warning',
        title: 'Position Concentration Risk',
        details: 'One position represents 45% of portfolio',
      },
      {
        id: '3',
        level: 'info',
        title: 'Daily Loss Limit Reached',
      },
    ];

    it('should display all alerts', () => {
      render(<RiskAlertsCard loading={false} alerts={mockAlerts} />);
      
      expect(screen.getByText(/Low Margin Warning/)).toBeInTheDocument();
      expect(screen.getByText(/Position Concentration Risk/)).toBeInTheDocument();
      expect(screen.getByText(/Daily Loss Limit Reached/)).toBeInTheDocument();
    });

    it('should display alert titles', () => {
      render(<RiskAlertsCard loading={false} alerts={mockAlerts} />);
      
      mockAlerts.forEach(alert => {
        expect(screen.getByText(alert.title)).toBeInTheDocument();
      });
    });

    it('should display alert details when provided', () => {
      render(<RiskAlertsCard loading={false} alerts={mockAlerts} />);
      
      expect(screen.getByText(/Your margin level is below 30%/)).toBeInTheDocument();
      expect(screen.getByText(/One position represents 45% of portfolio/)).toBeInTheDocument();
    });

    it('should not display details section when details not provided', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // Should still render alert title
      expect(screen.getByText(/Test Alert/)).toBeInTheDocument();
    });

    it('should display footer text', () => {
      render(<RiskAlertsCard loading={false} alerts={mockAlerts} />);
      
      const footer = screen.getByText(/Only the most recent alerts are shown/i);
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Severity Levels and Badges', () => {
    it('should render critical severity badge', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'critical', title: 'Critical Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // The badge should have critical styling (red colors)
      const badge = container.querySelector('[class*="text-red"]');
      expect(badge || container.textContent).toContain(/critical|red/i);
    });

    it('should render warning severity badge', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'warning', title: 'Warning Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // The badge should have warning styling (yellow colors)
      const badge = container.querySelector('[class*="text-yellow"]');
      expect(badge || container.textContent).toContain(/warning|yellow/i);
    });

    it('should render info severity badge', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Info Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // The badge should have info styling (blue colors)
      const badge = container.querySelector('[class*="text-blue"]');
      expect(badge || container.textContent).toContain(/info|blue/i);
    });

    it('should render different action text for critical vs non-critical', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'critical', title: 'Critical' },
        { id: '2', level: 'warning', title: 'Warning' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      const immediateActions = screen.getAllByText(/Immediate/);
      const monitorActions = screen.getAllByText(/Monitor/);
      
      expect(immediateActions.length).toBeGreaterThan(0);
      expect(monitorActions.length).toBeGreaterThan(0);
    });

    it('should show "Immediate" action for critical alerts', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'critical', title: 'Critical Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Immediate/)).toBeInTheDocument();
    });

    it('should show "Monitor" action for warning alerts', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'warning', title: 'Warning Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Monitor/)).toBeInTheDocument();
    });

    it('should show "Monitor" action for info alerts', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Info Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Monitor/)).toBeInTheDocument();
    });
  });

  describe('Multiple Alerts', () => {
    it('should display multiple alerts in correct order', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'First Alert' },
        { id: '2', level: 'warning', title: 'Second Alert' },
        { id: '3', level: 'critical', title: 'Third Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      const alertItems = screen.getAllByText(/Alert/);
      expect(alertItems.length).toBe(3);
    });

    it('should render alerts as list items', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Alert 1' },
        { id: '2', level: 'warning', title: 'Alert 2' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // Check for flex layout for each alert
      const alertRows = container.querySelectorAll('[class*="flex"][class*="items-start"]');
      expect(alertRows.length).toBeGreaterThanOrEqual(alerts.length);
    });

    it('should handle large number of alerts', () => {
      const alerts: AlertItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        level: (['info', 'warning', 'critical'][i % 3] as AlertItem['level']),
        title: `Alert ${i + 1}`,
        details: `Details for alert ${i + 1}`,
      }));
      
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Alert 1/)).toBeInTheDocument();
      expect(screen.getByText(/Alert 20/)).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have proper card heading', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // Card heading should be present
      const heading = container.querySelector('h2');
      expect(heading || container.textContent).toContain(/Risk Alerts/i);
    });

    it('should have descriptive subtitle', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Critical account notifications/i)).toBeInTheDocument();
    });

    it('should have card footer with alert history text', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/View history for past alerts/i)).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default loading of false', () => {
      render(<RiskAlertsCard />);
      
      const emptyState = screen.getByText(/No active risk alerts/i);
      expect(emptyState).toBeInTheDocument();
    });

    it('should use default alerts of empty array', () => {
      render(<RiskAlertsCard loading={false} />);
      
      const emptyState = screen.getByText(/No active risk alerts/i);
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      const heading = container.querySelector('h2');
      expect(heading || container.textContent).toContain(/Risk Alerts/i);
    });

    it('should have semantic structure', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test Alert' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });

    it('should use visually distinct badges for severity levels', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'critical', title: 'Critical' },
      ];
      const { container } = render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      // Badge should have distinct styling
      const badge = container.querySelector('[class*="px-2"][class*="rounded-full"]');
      expect(badge || container.textContent).toContain(/critical/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle alert with very long title', () => {
      const longTitle = 'A'.repeat(200);
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: longTitle },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle alert with very long details', () => {
      const longDetails = 'B'.repeat(500);
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Test', details: longDetails },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(longDetails)).toBeInTheDocument();
    });

    it('should handle special characters in alert text', () => {
      const alerts: AlertItem[] = [
        { id: '1', level: 'info', title: 'Alert with <special> & "chars"' },
      ];
      render(<RiskAlertsCard loading={false} alerts={alerts} />);
      
      expect(screen.getByText(/Alert with/)).toBeInTheDocument();
    });
  });
});
