import React from "react";
import type {
  ColorBlindModeType,
  ColorContrastType,
  ContrastResult,
  VisualPreferencesType,
} from "../types";

export interface ColorContrastTabProps {
  colorContrast: ColorContrastType;
  colorBlindMode: ColorBlindModeType;
  visualPreferences: VisualPreferencesType;
}

export function ColorContrastTab({
  colorContrast,
  colorBlindMode,
  visualPreferences,
}: ColorContrastTabProps) {
  return (
    <div className="space-y-6">
      {/* Compliance Report */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Total Elements</h4>
          <p className="text-3xl font-bold">
            {colorContrast.complianceReport.total}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Passing</h4>
          <p className="text-3xl font-bold text-green-600">
            {colorContrast.complianceReport.passing}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Failing</h4>
          <p className="text-3xl font-bold text-red-600">
            {colorContrast.complianceReport.failing}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">AA Compliance</h4>
          <p className="text-3xl font-bold">
            {colorContrast.complianceReport.aaCompliance.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Contrast Results */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Contrast Results</h4>
        <div className="space-y-3">
          {colorContrast.contrastResults
            .slice(0, 10)
            .map((result: ContrastResult, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div className="flex items-center space-x-4">
                  <span
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: result.background }}
                  />
                  <span
                    className="px-2 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: result.text }}
                  >
                    Text
                  </span>
                  <span className="text-sm">
                    Ratio: {result.ratio.toFixed(2)}:1
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      result.wcag === "aaa"
                        ? "bg-green-600"
                        : result.wcag === "aa"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                    }`}
                  >
                    {result.wcag.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    colorContrast.highlightFailingElements(
                      result.wcag === "fail",
                    )
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Highlight
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
