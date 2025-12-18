import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface ABTestResult {
  variantId: string;
  variantName: string;
  conversionRate: number;
  participants: number;
  significance: string;
}

interface ABTestResultsPanelProps {
  results: ABTestResult[];
}

export function ABTestResultsPanel({ results }: ABTestResultsPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!results || results.length === 0) return null;

  const bestPerformingVariant = results.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best,
  );

  return (
    <div className="ab-test-results fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          A/B Test Results
        </h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isVisible ? "−" : "+"}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-2 text-xs">
          {results.map((result, index) => (
            <div
              key={result.variantId}
              className={cn(
                "p-2 rounded border-l-2",
                result.variantId === bestPerformingVariant.variantId
                  ? "bg-green-50 border-green-400"
                  : "bg-gray-50 border-gray-300",
              )}
            >
              <div className="font-medium">{result.variantName}</div>
              <div className="text-gray-600">
                {result.conversionRate.toFixed(2)}% conversion rate
              </div>
              <div className="text-gray-500">
                {result.participants} participants
              </div>
              {result.significance === "significant" && (
                <div className="text-green-600 font-medium">✓ Significant</div>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Best:{" "}
              <span className="font-medium">
                {bestPerformingVariant.variantName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
