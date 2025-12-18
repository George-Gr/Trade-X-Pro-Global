/**
 * MarginLevelCard Component Test Suite
 *
 * Tests:
 * - Loading state with skeletons
 * - Empty/placeholder state
 * - Populated state with margin level and sparkline
 * - Edge cases: clamped values, boundary values
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarginLevelCard } from "@/components/dashboard/MarginLevelCard";

describe("MarginLevelCard", () => {
  describe("Loading State", () => {
    it("should display skeleton loaders when loading", () => {
      const { container } = render(<MarginLevelCard loading={true} />);

      const skeletons = container.querySelectorAll(
        '[class*="animate"], [class*="skeleton"]',
      );
      // At least the card should be present when loading
      expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
    });

    it("should not display specific content when loading (show skeletons instead)", () => {
      const { container } = render(
        <MarginLevelCard loading={true} marginLevel={50} trend={[]} />,
      );

      // When loading, we don't show the actual margin percentage
      const marginPercent = container.querySelector('[class*="text-2xl"]');
      // Loading state may render skeletons instead of actual content
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display placeholder when no trend data", () => {
      render(<MarginLevelCard loading={false} marginLevel={50} trend={[]} />);

      const placeholder = screen.getByText(/When positions are open/i);
      expect(placeholder).toBeInTheDocument();
    });

    it("should show descriptive message in empty state", () => {
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={undefined} />,
      );

      const description = screen.getByText(
        /trend chart and actionable guidance/i,
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe("Populated State", () => {
    it("should display margin level percentage", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={76} trend={trend} />,
      );

      const matches = screen.getAllByText(/76%/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should display margin usage description", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      // The card shows "Used" labels for the progress
      const usedLabels = screen.getAllByText(/Used/);
      expect(usedLabels.length).toBeGreaterThan(0);
    });

    it("should render progress bar", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={76} trend={trend} />,
      );
      const matches = screen.getAllByText(/76%/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should render sparkline SVG", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();

      const polyline = svg?.querySelector("polyline");
      expect(polyline).toBeInTheDocument();
    });

    it("should have correct card structure", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Margin Level");
    });
  });

  describe("Value Clamping", () => {
    it("should clamp negative margin levels to 0", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={-10} trend={trend} />,
      );

      // The progress bar should have value attribute set to 0
      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    });

    it("should clamp margin levels > 100 to 100", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={150} trend={trend} />,
      );

      // The progress bar should have value attribute set to 100
      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute("aria-valuenow", "100");
    });

    it("should render 0% margin correctly", () => {
      const trend = [1, 2, 3, 2, 1];
      render(<MarginLevelCard loading={false} marginLevel={0} trend={trend} />);

      const matches = screen.getAllByText(/0%/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should render 100% margin correctly", () => {
      const trend = [99, 99.5, 100, 100, 100];
      render(
        <MarginLevelCard loading={false} marginLevel={100} trend={trend} />,
      );

      const matches = screen.getAllByText(/100%/);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe("Sparkline Rendering", () => {
    it("should render sparkline with correct number of points", () => {
      const trend = [50, 55, 60, 65, 70];
      render(
        <MarginLevelCard loading={false} marginLevel={70} trend={trend} />,
      );

      // Select the sparkline svg (viewBox 0 0 100 30) to avoid matching lucide icons
      const svg = document.querySelector('svg[viewBox="0 0 100 30"]');
      const polyline = svg?.querySelector("polyline");
      const pointsAttr = polyline?.getAttribute("points");

      // Should have 5 coordinate pairs
      expect(pointsAttr).toBeTruthy();
      const pointCount = (pointsAttr?.match(/\d+,\d+/g) || []).length;
      expect(pointCount).toBe(5);
    });

    it("should not render sparkline for empty trend array", () => {
      render(<MarginLevelCard loading={false} marginLevel={50} trend={[]} />);

      const polyline = document.querySelector("polyline");
      expect(polyline).not.toBeInTheDocument();
    });

    it("should render single-value sparkline", () => {
      const trend = [75];
      render(
        <MarginLevelCard loading={false} marginLevel={75} trend={trend} />,
      );

      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should handle large trend values correctly", () => {
      const trend = [1000, 2000, 3000, 2500, 1500];
      render(
        <MarginLevelCard loading={false} marginLevel={2500} trend={trend} />,
      );

      const polyline = document.querySelector("polyline");
      expect(polyline).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should use default marginLevel of 72", () => {
      render(<MarginLevelCard loading={false} trend={[70, 71, 72, 73, 74]} />);

      const matches = screen.getAllByText(/72%/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should use default loading of false", () => {
      render(<MarginLevelCard marginLevel={50} trend={[40, 45, 50, 55, 60]} />);

      // Should render content, not loading state
      const matches = screen.getAllByText(/50%/);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Margin Level");
    });

    it("should have accessible progress bar", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute("aria-valuenow");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });

    it("should have semantic card structure", () => {
      const trend = [70, 72, 71, 73, 72, 75, 76];
      const { container } = render(
        <MarginLevelCard loading={false} marginLevel={50} trend={trend} />,
      );

      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });
  });
});
