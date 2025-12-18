import React, { useEffect, useState } from "react";
import {
  analyticsManager,
  useAnalytics,
} from "../../lib/analytics/AnalyticsManager";
import { performanceMonitoring } from "../../lib/performance/performanceMonitoring";
import { cn } from "../../lib/utils";

interface AnalyticsIntegrationProps {
  children: React.ReactNode;
  enableAnalytics?: boolean;
  enableHeatMapping?: boolean;
  enableFunnelTracking?: boolean;
  userId?: string;
}

export function AnalyticsIntegration({
  children,
  enableAnalytics = true,
  enableHeatMapping = true,
  enableFunnelTracking = true,
  userId,
}: AnalyticsIntegrationProps) {
  const [analyticsData, setAnalyticsData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (enableAnalytics) {
      // Initialize analytics recording
      analyticsManager.startRecording();
      setIsRecording(true);

      // Setup performance correlation
      const setupPerformanceCorrelation = () => {
        if ("PerformanceObserver" in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === "largest-contentful-paint") {
                // Correlate performance with user behavior
                analyticsManager.correlateWithPerformance({
                  lcp: entry.startTime,
                });
              }
            });
          });

          observer.observe({ entryTypes: ["largest-contentful-paint"] });
        }
      };

      setupPerformanceCorrelation();

      // Get current analytics data
      const updateAnalyticsData = () => {
        const session = analyticsManager.getCurrentSession();
        const funnels = analyticsManager.getAllFunnels();

        setAnalyticsData({
          session,
          funnels,
          isRecording: analyticsManager.isRecordingActive(),
        });
      };

      updateAnalyticsData();
      const interval = setInterval(updateAnalyticsData, 10000); // Update every 10 seconds

      return () => {
        clearInterval(interval);
        analyticsManager.stopRecording();
        setIsRecording(false);
      };
    }
  }, [enableAnalytics]);

  return (
    <div
      className={cn("analytics-container", { "analytics-active": isRecording })}
    >
      {children}
      {enableAnalytics && <AnalyticsDashboard data={analyticsData} />}
    </div>
  );
}

// Heat mapping overlay component
export function HeatMapOverlay({
  page,
  showOverlay = false,
}: {
  page?: string;
  showOverlay?: boolean;
}) {
  const [heatMapData, setHeatMapData] = useState<
    Array<{ x: number; y: number; intensity: number }>
  >([]);
  const { getHeatMapData } = useAnalytics();

  useEffect(() => {
    if (showOverlay) {
      const data = getHeatMapData(page);
      setHeatMapData(data);
    }
  }, [showOverlay, page, getHeatMapData]);

  if (!showOverlay || heatMapData.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <svg className="w-full h-full">
        {heatMapData.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={Math.sqrt(point.intensity) * 2}
            fill="rgba(255, 0, 0, 0.3)"
            stroke="rgba(255, 0, 0, 0.8)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

// Conversion funnel visualization component

// Define the ConversionFunnel type locally since @/types/analytics doesn't exist
interface ConversionFunnelStep {
  id: string;
  name: string;
  actualCount: number;
  dropOffRate?: number;
}

interface ConversionFunnel {
  id: string;
  name: string;
  conversionRate: number;
  steps: ConversionFunnelStep[];
}

export function FunnelVisualization({
  funnelId,
  showVisualization = false,
}: {
  funnelId: string;
  showVisualization?: boolean;
}) {
  const [funnelData, setFunnelData] = useState<ConversionFunnel | null>(null);
  const { getFunnelData } = useAnalytics();

  useEffect(() => {
    if (showVisualization) {
      const data = getFunnelData(funnelId);
      setFunnelData(data);
    }
  }, [funnelId, showVisualization, getFunnelData]);

  if (!showVisualization || !funnelData) return null;

  const maxCount = Math.max(
    ...funnelData.steps.map(
      (step: { actualCount: number }) => step.actualCount,
    ),
  );

  return (
    <div className="funnel-visualization bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="text-lg font-semibold mb-4">{funnelData.name}</h3>
      <div className="space-y-3">
        {funnelData.steps.map(
          (
            step: {
              id: string;
              name: string;
              actualCount: number;
              dropOffRate?: number;
            },
            index: number,
          ) => {
            const width =
              maxCount > 0 ? (step.actualCount / maxCount) * 100 : 0;
            const dropOffRate = step.dropOffRate || 0;

            return (
              <div key={step.id} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{step.name}</span>
                  <span className="text-xs text-gray-500">
                    {step.actualCount} (
                    {step.actualCount > 0
                      ? (
                          (step.actualCount / funnelData.steps[0].actualCount) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `var(--progress-width, ${width}%)` }}
                  />
                </div>
                {dropOffRate > 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    -{dropOffRate.toFixed(1)}% drop-off
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-sm">
          <strong>Overall Conversion Rate:</strong>{" "}
          {funnelData.conversionRate.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

// Analytics dashboard component

type AnalyticsSession = {
  duration: number;
  pageViews: number;
  scrollDepth: number;
  conversions: Array<unknown>;
};

type AnalyticsFunnel = {
  id: string;
  name: string;
  conversionRate: number;
};

type AnalyticsDashboardData = {
  session?: AnalyticsSession;
  funnels?: AnalyticsFunnel[];
  isRecording?: boolean;
};

function AnalyticsDashboard({ data }: { data: AnalyticsDashboardData | null }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "session" | "funnels" | "performance"
  >("session");

  if (!data) return null;

  return (
    <div className="analytics-dashboard fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold">Analytics</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isVisible ? "−" : "+"}
        </button>
      </div>

      {isVisible && (
        <div className="p-3">
          <div className="flex space-x-1 mb-3">
            {(["session", "funnels", "performance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "session" && data.session && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-600">Duration</div>
                  <div className="font-semibold">
                    {Math.round(data.session.duration / 1000)}s
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-600">Page Views</div>
                  <div className="font-semibold">{data.session.pageViews}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="text-yellow-600">Scroll Depth</div>
                  <div className="font-semibold">
                    {data.session.scrollDepth}%
                  </div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-600">Conversions</div>
                  <div className="font-semibold">
                    {data.session.conversions.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "funnels" && data.funnels && (
            <div className="space-y-2 text-xs">
              {data.funnels.slice(0, 3).map((funnel: AnalyticsFunnel) => (
                <div key={funnel.id} className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">{funnel.name}</div>
                  <div className="text-gray-600">
                    {funnel.conversionRate.toFixed(1)}% conversion
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Recording Status</div>
                <div
                  className={cn(
                    "inline-block w-2 h-2 rounded-full mr-1",
                    data.isRecording ? "bg-green-500" : "bg-red-500",
                  )}
                />
                {data.isRecording ? "Active" : "Inactive"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom hook for tracking user interactions - moved to separate file

// Quick analytics setup component
export function QuickAnalyticsSetup() {
  useAnalytics();

  useEffect(() => {
    // Track page view
    analyticsManager.trackCustomEvent("page_view", {
      page: window.location.pathname,
      timestamp: Date.now(),
    });

    // Track user engagement
    const trackEngagement = () => {
      analyticsManager.trackCustomEvent("user_engagement", {
        timeOnPage: Date.now() - performance.now(),
        scrollDepth: Math.round(
          ((window.scrollY + window.innerHeight) / document.body.scrollHeight) *
            100,
        ),
      });
    };

    // Track engagement after 30 seconds
    const engagementTimer = setTimeout(trackEngagement, 30000);

    // Track scroll depth milestones
    const trackScrollMilestones = () => {
      const scrollDepth = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) *
          100,
      );

      [25, 50, 75, 90].forEach((milestone) => {
        if (
          scrollDepth >= milestone &&
          !document.body.dataset[`scrolled_${milestone}`]
        ) {
          document.body.dataset[`scrolled_${milestone}`] = "true";
          analyticsManager.trackCustomEvent("scroll_milestone", {
            milestone,
            scrollDepth,
          });
        }
      });
    };

    const scrollListener = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollMilestones, 100);
    };

    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener("scroll", scrollListener, { passive: true });

    return () => {
      clearTimeout(engagementTimer);
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", scrollListener);
    };
  }, []);

  return null;
}

// Performance correlation component
export function PerformanceCorrelation() {
  const [correlationData, setCorrelationData] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    // Setup performance monitoring correlation
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics: { lcp?: number; fid?: number; cls?: number } = {};

        entries.forEach((entry) => {
          if (entry.entryType === "largest-contentful-paint") {
            metrics.lcp = entry.startTime;
          } else if (entry.entryType === "first-input") {
            metrics.fid =
              (entry as PerformanceEventTiming).processingStart -
              entry.startTime;
          } else if (entry.entryType === "layout-shift") {
            metrics.cls = (entry as LayoutShift).value;
          }
        });

        if (Object.keys(metrics).length > 0) {
          analyticsManager.correlateWithPerformance(metrics);
          setCorrelationData(metrics);
        }
      });

      observer.observe({
        entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
      });

      return () => observer.disconnect();
    }
  }, []);

  if (!correlationData) return null;

  return (
    <div className="performance-correlation fixed top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div className="font-semibold mb-1">Performance Correlation</div>
      {typeof correlationData.lcp === "number" && (
        <div>LCP: {Math.round(correlationData.lcp)}ms</div>
      )}
      {typeof correlationData.fid === "number" && (
        <div>FID: {Math.round(correlationData.fid)}ms</div>
      )}
      {typeof correlationData.cls === "number" && (
        <div>CLS: {correlationData.cls.toFixed(3)}</div>
      )}
    </div>
  );
}
